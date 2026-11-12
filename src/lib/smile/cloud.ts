import { useEffect, useState } from "react";
import { normalizePatient, type Patient as Ficha } from "@/lib/clinic/model";
import { useClinic } from "@/lib/clinic/store";
import { LEYENDA, defaultEmisor, type Comprobante, type Emisor } from "./cpe";
import type { DayClose, Debt, Patient, Payment, Visit } from "./model";
import { useSmileStore } from "./store";
import { supabase } from "./supabase";

export type CloudStatus = "conectando" | "conectado" | "sin_tablas" | "error";

type Libro = {
  patients: Patient[];
  visits: Visit[];
  debts: Debt[];
  closes: Record<string, DayClose>;
  emisor: Emisor;
  comprobantes: Comprobante[];
};

let status: CloudStatus = "conectando";
let detail = "Conectando la base…";
const listeners = new Set<() => void>();
let libroBoot: Promise<void> | null = null;
let fichasBoot: Promise<void> | null = null;
let applying = false;
let dirty = false;
let pushOk = true;
let timer = 0;

function setStatus(next: CloudStatus, text: string) {
  status = next;
  detail = text;
  listeners.forEach((listener) => listener());
}

export function cloudDetail() {
  return detail;
}

export function useCloudStatus() {
  const [value, setValue] = useState({ status, detail });
  useEffect(() => {
    const listener = () => setValue({ status, detail });
    listeners.add(listener);
    listener();
    return () => {
      listeners.delete(listener);
    };
  }, []);
  return value;
}

function missingTable(error: { code?: string; message?: string } | null) {
  return error?.code === "PGRST205" || (error?.message ?? "").includes("Could not find the table");
}

function num(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function libro(): Libro {
  const state = useSmileStore.getState();
  return {
    patients: state.patients,
    visits: state.visits,
    debts: state.debts,
    closes: state.closes,
    emisor: state.emisor,
    comprobantes: state.comprobantes,
  };
}

async function upsert(table: string, rows: Record<string, unknown>[]) {
  for (let index = 0; index < rows.length; index += 200) {
    const slice = rows.slice(index, index + 200);
    const { error } = await supabase.from(table).upsert(slice);
    if (error) throw error;
  }
}

async function retain(table: string, ids: string[], column = "id") {
  const { data, error } = await supabase.from(table).select(column);
  if (error) throw error;
  const keep = new Set(ids);
  const gone = (data ?? [])
    .map((row) => String((row as unknown as Record<string, unknown>)[column]))
    .filter((id) => !keep.has(id));
  for (let index = 0; index < gone.length; index += 100) {
    const slice = gone.slice(index, index + 100);
    const { error: deleteError } = await supabase.from(table).delete().in(column, slice);
    if (deleteError) throw deleteError;
  }
}

async function pullLibro(): Promise<Libro | "empty" | "missing"> {
  const patients = await supabase.from("pacientes").select("*");
  if (missingTable(patients.error)) return "missing";
  if (patients.error) throw patients.error;
  const [visits, payments, debts, closes, emisor, comprobantes] = await Promise.all([
    supabase.from("citas").select("*"),
    supabase.from("pagos").select("*"),
    supabase.from("deudas").select("*"),
    supabase.from("cierres").select("*"),
    supabase.from("emisor").select("*").eq("id", 1).maybeSingle(),
    supabase.from("comprobantes").select("*"),
  ]);
  for (const result of [visits, payments, debts, closes, comprobantes]) {
    if (result.error) throw result.error;
  }
  if (emisor.error) throw emisor.error;
  const patientRows = patients.data ?? [];
  const visitRows = visits.data ?? [];
  if (patientRows.length === 0 && visitRows.length === 0 && (debts.data ?? []).length === 0 && (comprobantes.data ?? []).length === 0) {
    return "empty";
  }
  const byVisit = new Map<string, Payment[]>();
  for (const row of payments.data ?? []) {
    const payment: Payment = {
      id: String(row.id),
      method: row.metodo,
      amount: num(row.monto),
      operation: row.operacion ?? "",
      note: row.nota ?? "",
      hasEvidence: Boolean(row.tiene_evidencia),
      evidence: row.evidencia ?? undefined,
    };
    const list = byVisit.get(String(row.cita_id)) ?? [];
    list.push(payment);
    byVisit.set(String(row.cita_id), list);
  }
  const closeMap: Record<string, DayClose> = {};
  for (const row of closes.data ?? []) {
    closeMap[String(row.fecha)] = {
      cashCounted: row.efectivo_contado == null ? null : num(row.efectivo_contado),
      note: row.nota ?? "",
      closedAt: row.cerrado_en,
    };
  }
  const emisorRow = emisor.data;
  return {
    patients: patientRows.map((row) => ({
      id: String(row.id),
      fullName: row.nombre ?? "",
      age: row.edad ?? "",
      dni: row.dni ?? "",
      phone: row.telefono ?? "",
      address: row.direccion ?? "",
    })),
    visits: visitRows.map((row) => ({
      id: String(row.id),
      patientId: String(row.paciente_id),
      doctorId: row.doctor,
      date: String(row.fecha),
      time: row.hora,
      treatment: row.tratamiento ?? "",
      status: row.estado,
      payments: byVisit.get(String(row.id)) ?? [],
      monthTag: row.mes ?? "",
      note: row.nota ?? "",
      source: row.origen ?? "agenda",
      noCharge: Boolean(row.sin_cobro),
    })),
    debts: (debts.data ?? []).map((row) => ({
      id: String(row.id),
      patientId: String(row.paciente_id),
      amount: num(row.monto),
      concept: row.concepto ?? "",
      status: row.estado,
    })),
    closes: closeMap,
    emisor: emisorRow
      ? {
          ruc: emisorRow.ruc ?? "",
          razonSocial: emisorRow.razon_social ?? "Smile Studio",
          direccion: emisorRow.direccion ?? "Piura",
          nextBoleta: num(emisorRow.siguiente_boleta) || 1,
          nextFactura: num(emisorRow.siguiente_factura) || 1,
        }
      : defaultEmisor(),
    comprobantes: (comprobantes.data ?? []).map((row) => ({
      id: String(row.id),
      visitId: String(row.cita_id),
      paymentIds: row.pago_ids ?? [],
      tipo: row.tipo,
      serie: row.serie,
      numero: num(row.numero),
      fechaEmision: String(row.fecha),
      receptorNombre: row.receptor ?? "",
      tipoDoc: row.tipo_doc,
      numDoc: row.num_doc ?? "",
      descripcion: row.descripcion ?? "",
      opGravada: num(row.op_gravada),
      igv: num(row.igv),
      total: num(row.total),
      status: row.estado,
      leyenda: LEYENDA,
    })),
  };
}

async function pushLibro(snapshot = libro()) {
  const payments = snapshot.visits.flatMap((visit) =>
    visit.payments.map((payment) => ({
      id: payment.id,
      cita_id: visit.id,
      metodo: payment.method,
      monto: payment.amount,
      operacion: payment.operation,
      nota: payment.note,
      tiene_evidencia: payment.hasEvidence,
      evidencia: payment.evidence ?? null,
    })),
  );
  await upsert(
    "pacientes",
    snapshot.patients.map((patient) => ({
      id: patient.id,
      nombre: patient.fullName,
      edad: patient.age,
      dni: patient.dni,
      telefono: patient.phone,
      direccion: patient.address,
    })),
  );
  await upsert(
    "citas",
    snapshot.visits.map((visit) => ({
      id: visit.id,
      paciente_id: visit.patientId,
      doctor: visit.doctorId,
      fecha: visit.date,
      hora: visit.time,
      tratamiento: visit.treatment,
      estado: visit.status,
      mes: visit.monthTag,
      nota: visit.note,
      origen: visit.source,
      sin_cobro: visit.noCharge,
    })),
  );
  await upsert("pagos", payments);
  await upsert(
    "deudas",
    snapshot.debts.map((debt) => ({
      id: debt.id,
      paciente_id: debt.patientId,
      monto: debt.amount,
      concepto: debt.concept,
      estado: debt.status,
    })),
  );
  await upsert(
    "cierres",
    Object.entries(snapshot.closes).map(([fecha, close]) => ({
      fecha,
      efectivo_contado: close.cashCounted,
      nota: close.note,
      cerrado_en: close.closedAt,
    })),
  );
  await upsert("emisor", [
    {
      id: 1,
      ruc: snapshot.emisor.ruc,
      razon_social: snapshot.emisor.razonSocial,
      direccion: snapshot.emisor.direccion,
      siguiente_boleta: snapshot.emisor.nextBoleta,
      siguiente_factura: snapshot.emisor.nextFactura,
    },
  ]);
  await upsert(
    "comprobantes",
    snapshot.comprobantes.map((item) => ({
      id: item.id,
      cita_id: item.visitId,
      pago_ids: item.paymentIds,
      tipo: item.tipo,
      serie: item.serie,
      numero: item.numero,
      fecha: item.fechaEmision,
      receptor: item.receptorNombre,
      tipo_doc: item.tipoDoc,
      num_doc: item.numDoc,
      descripcion: item.descripcion,
      op_gravada: item.opGravada,
      igv: item.igv,
      total: item.total,
      estado: item.status,
      leyenda: item.leyenda,
    })),
  );
  await retain("pagos", payments.map((payment) => payment.id));
  await retain("comprobantes", snapshot.comprobantes.map((item) => item.id));
  await retain("citas", snapshot.visits.map((visit) => visit.id));
  await retain("deudas", snapshot.debts.map((debt) => debt.id));
  await retain("pacientes", snapshot.patients.map((patient) => patient.id));
  await retain("cierres", Object.keys(snapshot.closes), "fecha");
}

function applyLibro(snapshot: Libro) {
  applying = true;
  useSmileStore.setState(snapshot);
  applying = false;
}

async function refreshLibro() {
  if (dirty || applying || status !== "conectado" || !pushOk) return;
  const remote = await pullLibro();
  if (remote === "missing" || remote === "empty") return;
  applying = true;
  useSmileStore.setState(remote);
  applying = false;
}

async function bootLibro() {
  if (typeof window === "undefined") return;
  await useSmileStore.persist.rehydrate();
  try {
    const remote = await pullLibro();
    if (remote === "missing") {
      setStatus("sin_tablas", "Falta crear las tablas en Supabase");
      return;
    }
    if (remote === "empty") await pushLibro();
    else applyLibro(remote);
    pushOk = true;
    setStatus("conectado", "Base en línea");
  } catch {
    pushOk = false;
    setStatus("error", "La base no respondió");
    return;
  }
  useSmileStore.subscribe(() => {
    if (applying || status !== "conectado") return;
    dirty = true;
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      const snapshot = libro();
      void pushLibro(snapshot)
        .then(() => {
          dirty = false;
          pushOk = true;
          setStatus("conectado", "Base en línea");
        })
        .catch(() => {
          pushOk = false;
          setStatus("error", "No se pudo guardar en la base");
        });
    }, 800);
  });
  window.setInterval(() => {
    void refreshLibro().catch(() => undefined);
  }, 20000);
}

export function startLibroSync() {
  libroBoot ??= bootLibro();
  return libroBoot;
}

async function pullFichas(): Promise<Ficha[] | "empty" | "missing"> {
  const { data, error } = await supabase.from("fichas").select("id,datos");
  if (missingTable(error)) return "missing";
  if (error) throw error;
  if (!data || data.length === 0) return "empty";
  return data.flatMap((row) => {
    const patient = normalizePatient(row.datos);
    return patient ? [patient] : [];
  });
}

async function pushFichas(patients: Ficha[]) {
  await upsert(
    "fichas",
    patients.map((patient) => ({ id: patient.id, datos: patient })),
  );
  await retain("fichas", patients.map((patient) => patient.id));
}

async function bootFichas() {
  if (typeof window === "undefined") return;
  await useClinic.persist.rehydrate();
  try {
    const remote = await pullFichas();
    if (remote === "missing") return;
    if (remote === "empty") await pushFichas(useClinic.getState().patients);
    else {
      applying = true;
      useClinic.setState({ patients: remote, activeId: useClinic.getState().activeId ?? remote[0]?.id ?? null });
      applying = false;
    }
  } catch {
    return;
  }
  let fichaTimer = 0;
  useClinic.subscribe((state) => {
    if (applying) return;
    window.clearTimeout(fichaTimer);
    fichaTimer = window.setTimeout(() => {
      void pushFichas(state.patients).catch(() => undefined);
    }, 800);
  });
}

export function startFichasSync() {
  fichasBoot ??= bootFichas();
  return fichasBoot;
}
