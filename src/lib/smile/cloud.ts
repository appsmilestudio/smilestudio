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
let syncLock = false;

function setStatus(next: CloudStatus, text: string) {
  status = next;
  detail = text;
  listeners.forEach((listener) => listener());
}

export function cloudDetail() {
  return detail;
}

export function isCloudHealthy() {
  return status === "conectado" && pushOk;
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

/**
 * Trae todos los registros de una tabla paginando en lotes de 1000
 * para evitar el límite estándar de Supabase
 */
async function fetchAll(table: string): Promise<Record<string, unknown>[]> {
  const all: Record<string, unknown>[] = [];
  let from = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await supabase.from(table).select("*").range(from, from + pageSize - 1);
    if (error) {
      if (missingTable(error)) throw error;
      throw error;
    }
    if (!data || data.length === 0) break;
    all.push(...(data as Record<string, unknown>[]));
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return all;
}

async function fetchAllColumn(table: string, column = "id"): Promise<string[]> {
  const all: string[] = [];
  let from = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await supabase.from(table).select(column).range(from, from + pageSize - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    for (const row of data as unknown as Record<string, unknown>[]) {
      all.push(String(row[column]));
    }
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return all;
}

async function upsert(table: string, rows: Record<string, unknown>[]) {
  if (rows.length === 0) return;
  for (let index = 0; index < rows.length; index += 200) {
    const slice = rows.slice(index, index + 200);
    const { error } = await supabase.from(table).upsert(slice);
    if (error) throw error;
  }
}

async function retain(table: string, ids: string[], column = "id") {
  if (ids.length === 0) return;
  const allIds = await fetchAllColumn(table, column);
  const keep = new Set(ids);
  const gone = allIds.filter((id) => !keep.has(id));
  for (let index = 0; index < gone.length; index += 100) {
    const slice = gone.slice(index, index + 100);
    const { error: deleteError } = await supabase.from(table).delete().in(column, slice);
    if (deleteError) throw deleteError;
  }
}

async function pullLibro(): Promise<Libro | "empty" | "missing"> {
  const testRes = await supabase.from("pacientes").select("id").limit(1);
  if (missingTable(testRes.error)) return "missing";
  if (testRes.error) throw testRes.error;

  const [patientRows, visitRows, paymentRows, debtRows, closeRows, emisorRow, comprobanteRows] =
    await Promise.all([
      fetchAll("pacientes"),
      fetchAll("citas"),
      fetchAll("pagos"),
      fetchAll("deudas"),
      fetchAll("cierres"),
      supabase.from("emisor").select("*").eq("id", 1).maybeSingle(),
      fetchAll("comprobantes"),
    ]);

  if (emisorRow.error) throw emisorRow.error;

  if (
    patientRows.length === 0 &&
    visitRows.length === 0 &&
    debtRows.length === 0 &&
    comprobanteRows.length === 0
  ) {
    return "empty";
  }

  const byVisit = new Map<string, Payment[]>();
  for (const row of paymentRows) {
    const payment: Payment = {
      id: String(row.id),
      method: row.metodo as Payment["method"],
      amount: num(row.monto),
      operation: String(row.operacion ?? ""),
      note: String(row.nota ?? ""),
      hasEvidence: Boolean(row.tiene_evidencia),
      evidence: row.evidencia ? String(row.evidencia) : undefined,
    };
    const list = byVisit.get(String(row.cita_id)) ?? [];
    list.push(payment);
    byVisit.set(String(row.cita_id), list);
  }

  const closeMap: Record<string, DayClose> = {};
  for (const row of closeRows) {
    closeMap[String(row.fecha)] = {
      cashCounted: row.efectivo_contado == null ? null : num(row.efectivo_contado),
      note: String(row.nota ?? ""),
      closedAt: row.cerrado_en ? String(row.cerrado_en) : null,
    };
  }

  const emisorData = emisorRow.data;

  return {
    patients: patientRows.map((row) => ({
      id: String(row.id),
      fullName: String(row.nombre ?? ""),
      age: String(row.edad ?? ""),
      dni: String(row.dni ?? ""),
      phone: String(row.telefono ?? ""),
      address: String(row.direccion ?? ""),
    })),
    visits: visitRows.map((row) => ({
      id: String(row.id),
      patientId: String(row.paciente_id),
      doctorId: row.doctor as Visit["doctorId"],
      date: String(row.fecha),
      time: row.hora ? String(row.hora) : null,
      treatment: String(row.tratamiento ?? ""),
      status: row.estado as Visit["status"],
      payments: byVisit.get(String(row.id)) ?? [],
      monthTag: String(row.mes ?? ""),
      note: String(row.nota ?? ""),
      source: (row.origen as Visit["source"]) ?? "agenda",
      noCharge: Boolean(row.sin_cobro),
    })),
    debts: debtRows.map((row) => ({
      id: String(row.id),
      patientId: String(row.paciente_id),
      amount: num(row.monto),
      concept: String(row.concepto ?? ""),
      status: row.estado as Debt["status"],
    })),
    closes: closeMap,
    emisor: emisorData
      ? {
          ruc: String(emisorData.ruc ?? ""),
          razonSocial: String(emisorData.razon_social ?? "Smile Studio"),
          direccion: String(emisorData.direccion ?? "Piura"),
          nextBoleta: num(emisorData.siguiente_boleta) || 1,
          nextFactura: num(emisorData.siguiente_factura) || 1,
        }
      : defaultEmisor(),
    comprobantes: comprobanteRows.map((row) => ({
      id: String(row.id),
      visitId: String(row.cita_id),
      paymentIds: (row.pago_ids as string[]) ?? [],
      tipo: row.tipo as Comprobante["tipo"],
      serie: row.serie as Comprobante["serie"],
      numero: num(row.numero),
      fechaEmision: String(row.fecha),
      receptorNombre: String(row.receptor ?? ""),
      tipoDoc: row.tipo_doc as Comprobante["tipoDoc"],
      numDoc: String(row.num_doc ?? ""),
      descripcion: String(row.descripcion ?? ""),
      opGravada: num(row.op_gravada),
      igv: num(row.igv),
      total: num(row.total),
      status: row.estado as Comprobante["status"],
      leyenda: LEYENDA,
    })),
  };
}

export async function pushLibro(snapshot = libro()) {
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

  // Retener únicamente eliminaciones consistentes
  await retain("pagos", payments.map((payment) => payment.id));
  await retain("comprobantes", snapshot.comprobantes.map((item) => item.id));
  await retain("citas", snapshot.visits.map((visit) => visit.id));
  await retain("deudas", snapshot.debts.map((debt) => debt.id));
  await retain("pacientes", snapshot.patients.map((patient) => patient.id));
  await retain("cierres", Object.keys(snapshot.closes), "fecha");
}

/**
 * Estrategia de fusión inteligente para sincronización entre dispositivos:
 * Preserva pacientes, citas y deudas creados localmente que aún no están en la nube.
 */
function mergeLibro(remote: Libro) {
  const local = useSmileStore.getState();

  const patientMap = new Map<string, Patient>();
  for (const rp of remote.patients) patientMap.set(rp.id, rp);
  for (const lp of local.patients) {
    if (!patientMap.has(lp.id)) patientMap.set(lp.id, lp);
  }

  const visitMap = new Map<string, Visit>();
  for (const rv of remote.visits) visitMap.set(rv.id, rv);
  for (const lv of local.visits) {
    if (!visitMap.has(lv.id)) visitMap.set(lv.id, lv);
  }

  const debtMap = new Map<string, Debt>();
  for (const rd of remote.debts) debtMap.set(rd.id, rd);
  for (const ld of local.debts) {
    if (!debtMap.has(ld.id)) debtMap.set(ld.id, ld);
  }

  const mergedPatients = Array.from(patientMap.values());
  const mergedVisits = Array.from(visitMap.values());
  const mergedDebts = Array.from(debtMap.values());

  applying = true;
  useSmileStore.setState({
    patients: mergedPatients,
    visits: mergedVisits,
    debts: mergedDebts,
    closes: { ...remote.closes, ...local.closes },
    emisor: remote.emisor || local.emisor,
    comprobantes: remote.comprobantes.length > 0 ? remote.comprobantes : local.comprobantes,
  });
  applying = false;
}

async function refreshLibro() {
  if (dirty || applying || syncLock) return;
  try {
    const remote = await pullLibro();
    if (remote === "missing" || remote === "empty") return;
    mergeLibro(remote);
    const count = useSmileStore.getState().patients.length;
    setStatus("conectado", `Base en línea (${count} pacientes)`);
  } catch (err) {
    console.warn("Error en auto-refresco:", err);
  }
}

async function syncDirty(retries = 3) {
  if (!dirty || applying || syncLock) return;
  syncLock = true;
  try {
    const snapshot = libro();
    await pushLibro(snapshot);
    dirty = false;
    pushOk = true;
    const count = snapshot.patients.length;
    setStatus("conectado", `Base en línea (${count} pacientes)`);
  } catch (err) {
    console.error("Error al guardar en Supabase:", err);
    if (retries > 0) {
      setStatus("conectando", "Reintentando sincronizar…");
      window.setTimeout(() => {
        syncLock = false;
        void syncDirty(retries - 1);
      }, 2500);
      return;
    }
    pushOk = false;
    setStatus("error", "No se pudo guardar en la base");
  } finally {
    syncLock = false;
  }
}

/**
 * Función pública para forzar sincronización instantánea desde cualquier vista
 */
export async function forceSync(): Promise<{ ok: boolean; message: string }> {
  try {
    setStatus("conectando", "Sincronizando con la nube…");
    const snapshot = libro();
    await pushLibro(snapshot);
    const remote = await pullLibro();
    if (remote !== "missing" && remote !== "empty") {
      mergeLibro(remote);
    }
    dirty = false;
    pushOk = true;
    const count = useSmileStore.getState().patients.length;
    setStatus("conectado", `Base en línea (${count} pacientes)`);
    return { ok: true, message: `Sincronizado con éxito (${count} pacientes en línea).` };
  } catch (err) {
    console.error("Error al forzar sincronización:", err);
    pushOk = false;
    setStatus("error", "Error de conexión con la nube");
    return { ok: false, message: "No se pudo sincronizar. Comprueba tu conexión a internet." };
  }
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
    if (remote === "empty") {
      await pushLibro();
    } else {
      mergeLibro(remote);
      // Si local tenía elementos que remote no tenía, subirlos
      if (useSmileStore.getState().patients.length > remote.patients.length) {
        void pushLibro();
      }
    }
    pushOk = true;
    const count = useSmileStore.getState().patients.length;
    setStatus("conectado", `Base en línea (${count} pacientes)`);
  } catch (err) {
    console.error("Error boot libro:", err);
    pushOk = false;
    setStatus("error", "La base no respondió");
    return;
  }

  // Suscriptor al estado local con autoguardado y reintento
  useSmileStore.subscribe(() => {
    if (applying) return;
    dirty = true;
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      void syncDirty();
    }, 800);
  });

  // Polling de seguridad cada 15 segundos
  window.setInterval(() => {
    void refreshLibro().catch(() => undefined);
  }, 15000);

  // Supabase Realtime para actualización instantánea multi-dispositivo (Laptop <-> Celular)
  try {
    supabase
      .channel("smile-realtime-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "pacientes" }, () => {
        void refreshLibro();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "citas" }, () => {
        void refreshLibro();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "pagos" }, () => {
        void refreshLibro();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "deudas" }, () => {
        void refreshLibro();
      })
      .subscribe();
  } catch (err) {
    console.warn("Realtime no disponible en este cliente:", err);
  }
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
  if (patients.length === 0) return;
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
    if (remote !== "missing") {
      if (remote === "empty") {
        await pushFichas(useClinic.getState().patients);
      } else {
        // Fusión de fichas
        const local = useClinic.getState().patients;
        const fichaMap = new Map<string, Ficha>();
        for (const rf of remote) fichaMap.set(rf.id, rf);
        for (const lf of local) {
          if (!fichaMap.has(lf.id)) fichaMap.set(lf.id, lf);
        }
        const merged = Array.from(fichaMap.values());
        applying = true;
        useClinic.setState({
          patients: merged,
          activeId: useClinic.getState().activeId ?? merged[0]?.id ?? null,
        });
        applying = false;
      }
    }
  } catch (err) {
    console.warn("Fichas sync init:", err);
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
