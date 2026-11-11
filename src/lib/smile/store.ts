import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  dayReport,
  fold,
  slug,
  moneyGap,
  occupiesSlot,
  uid,
  limaToday,
  type DayClose,
  type Debt,
  type DoctorId,
  type Patient,
  type Payment,
  type Role,
  type Visit,
  type VisitStatus,
} from "./model";
import { createSeed, type SmileData } from "./seed";
import { activeForPayments, defaultEmisor, LEYENDA, splitIgv, type Comprobante, type Emisor } from "./cpe";

type MoveResult = { ok: true } | { ok: false; reason: string };

type SmileState = SmileData & {
  role: Role;
  emisor: Emisor;
  comprobantes: Comprobante[];
  setRole: (role: Role) => void;
  savePatient: (patient: Patient) => void;
  createPatient: (draft: Omit<Patient, "id">) => string;
  addVisit: (visit: Omit<Visit, "id">) => string;
  patchVisit: (id: string, patch: Partial<Visit>) => void;
  moveVisit: (id: string, patch: Partial<Pick<Visit, "time" | "date" | "doctorId" | "status">>) => MoveResult;
  removeVisit: (id: string) => void;
  addPayment: (visitId: string, payment: Omit<Payment, "id">) => void;
  patchPayment: (visitId: string, paymentId: string, patch: Partial<Payment>) => void;
  removePayment: (visitId: string, paymentId: string) => string | null;
  saveEmisor: (patch: Partial<Emisor>) => void;
  issueComprobante: (
    visitId: string,
    draft: { nombre: string; dni: string; ruc: string },
  ) => { ok: true; id: string } | { ok: false; reason: string };
  voidComprobante: (id: string) => string | null;
  setCashDraft: (date: string, patch: Partial<Pick<DayClose, "cashCounted" | "note">>) => void;
  closeDay: (date: string) => string | null;
  reopenDay: (date: string) => void;
  collectDebt: (debtId: string, method: Payment["method"], date: string) => string | null;
  importExcelData: (
    newPatients: Patient[],
    newVisits: Visit[],
    newDebts: Debt[],
  ) => { patientsAdded: number; visitsAdded: number; debtsAdded: number };
  cleanAndSyncDebts: () => void;
  resetLibro: () => void;
};

function blankClose(): DayClose {
  return { cashCounted: null, note: "", closedAt: null };
}

export const useSmileStore = create<SmileState>()(
  persist(
    (set, get) => ({
      ...createSeed(),
      emisor: defaultEmisor(),
      comprobantes: [] as Comprobante[],
      role: "recepcion",
      setRole: (role) => set({ role }),
      savePatient: (patient) => {
        const patients = get().patients;
        const index = patients.findIndex((item) => item.id === patient.id);
        if (index === -1) set({ patients: [...patients, patient] });
        else {
          const next = patients.slice();
          next[index] = patient;
          set({ patients: next });
        }
      },
      createPatient: (draft) => {
        const patients = get().patients;
        const exact = patients.find((item) => item.fullName.trim().toLowerCase() === draft.fullName.trim().toLowerCase());
        if (exact) return exact.id;
        const id = uid("p");
        set({ patients: [...patients, { ...draft, id }] });
        return id;
      },
      addVisit: (visit) => {
        const id = uid("v");
        set({ visits: [...get().visits, { ...visit, id }] });
        return id;
      },
      patchVisit: (id, patch) => {
        set({
          visits: get().visits.map((visit) => (visit.id === id ? { ...visit, ...patch } : visit)),
        });
      },
      moveVisit: (id, patch) => {
        const current = get().visits.find((visit) => visit.id === id);
        if (!current) return { ok: false, reason: "No encontramos la cita." };
        const next: Visit = { ...current, ...patch };
        if (next.status === "reprogramada" || next.status === "cancelada") next.time = null;
        if (next.time && occupiesSlot(next)) {
          const clash = get().visits.some(
            (visit) =>
              visit.id !== id &&
              visit.date === next.date &&
              visit.doctorId === next.doctorId &&
              visit.time === next.time &&
              occupiesSlot(visit),
          );
          if (clash) return { ok: false, reason: "Ese horario ya está ocupado." };
        }
        set({
          visits: get().visits.map((visit) => (visit.id === id ? next : visit)),
        });
        return { ok: true };
      },
      removeVisit: (id) => set({ visits: get().visits.filter((visit) => visit.id !== id) }),
      addPayment: (visitId, payment) => {
        set({
          visits: get().visits.map((visit) =>
            visit.id === visitId
              ? { ...visit, payments: [...visit.payments, { ...payment, id: uid("pay") }] }
              : visit,
          ),
        });
      },
      patchPayment: (visitId, paymentId, patch) => {
        set({
          visits: get().visits.map((visit) =>
            visit.id === visitId
              ? {
                  ...visit,
                  payments: visit.payments.map((payment) =>
                    payment.id === paymentId ? { ...payment, ...patch } : payment,
                  ),
                }
              : visit,
          ),
        });
      },
      removePayment: (visitId, paymentId) => {
        const covered = activeForPayments(get().comprobantes, [paymentId]);
        if (covered.length > 0) return "Ese pago ya está en una boleta o factura. Anúlala antes de quitarlo.";
        set({
          visits: get().visits.map((visit) =>
            visit.id === visitId
              ? { ...visit, payments: visit.payments.filter((payment) => payment.id !== paymentId) }
              : visit,
          ),
        });
        return null;
      },
      saveEmisor: (patch) => set({ emisor: { ...get().emisor, ...patch, nextBoleta: get().emisor.nextBoleta, nextFactura: get().emisor.nextFactura } }),
      issueComprobante: (visitId, draft) => {
        const visit = get().visits.find((item) => item.id === visitId);
        if (!visit) return { ok: false, reason: "No encontramos la atención." };
        if (visit.noCharge) return { ok: false, reason: "Esta atención está marcada sin cobro." };
        const free = visit.payments.filter(
          (payment) => activeForPayments(get().comprobantes, [payment.id]).length === 0,
        );
        if (free.length === 0) return { ok: false, reason: "No hay pagos nuevos para documentar." };
        const total = Math.round(free.reduce((sum, payment) => sum + payment.amount, 0) * 100) / 100;
        if (total <= 0) return { ok: false, reason: "El monto cobrado es cero." };
        const ruc = draft.ruc.replace(/\D/g, "");
        const dni = draft.dni.replace(/\D/g, "");
        const nombre = draft.nombre.trim();
        if (nombre.length < 3) return { ok: false, reason: "Escribe el nombre de quien recibe el comprobante." };
        let tipo: Comprobante["tipo"];
        let tipoDoc: Comprobante["tipoDoc"];
        let numDoc = "";
        if (ruc.length > 0) {
          if (ruc.length !== 11) return { ok: false, reason: "El RUC tiene que tener 11 dígitos." };
          tipo = "01";
          tipoDoc = "6";
          numDoc = ruc;
        } else if (dni.length > 0) {
          if (dni.length !== 8) return { ok: false, reason: "El DNI tiene que tener 8 dígitos." };
          tipo = "03";
          tipoDoc = "1";
          numDoc = dni;
        } else if (total > 700) {
          return { ok: false, reason: "Sobre S/ 700 hace falta DNI o RUC." };
        } else {
          tipo = "03";
          tipoDoc = "0";
        }
        const emisor = get().emisor ?? defaultEmisor();
        const parts = splitIgv(total);
        const numero = tipo === "01" ? emisor.nextFactura : emisor.nextBoleta;
        const id = uid("cpe");
        const item: Comprobante = {
          id,
          visitId,
          paymentIds: free.map((payment) => payment.id),
          tipo,
          serie: tipo === "01" ? "FI01" : "BI01",
          numero,
          fechaEmision: limaToday(),
          receptorNombre: tipoDoc === "0" ? nombre || "CLIENTE VARIOS" : nombre,
          tipoDoc,
          numDoc,
          descripcion: visit.treatment.trim() || "Servicio dental",
          opGravada: parts.opGravada,
          igv: parts.igv,
          total: parts.total,
          status: "local",
          leyenda: LEYENDA,
        };
        set({
          comprobantes: [...get().comprobantes, item],
          emisor: {
            ...emisor,
            nextFactura: tipo === "01" ? emisor.nextFactura + 1 : emisor.nextFactura,
            nextBoleta: tipo === "03" ? emisor.nextBoleta + 1 : emisor.nextBoleta,
          },
        });
        return { ok: true, id };
      },
      voidComprobante: (id) => {
        const item = get().comprobantes.find((row) => row.id === id);
        if (!item || item.status === "anulado") return "Ese comprobante ya no se puede anular.";
        set({
          comprobantes: get().comprobantes.map((row) => (row.id === id ? { ...row, status: "anulado" } : row)),
        });
        return null;
      },
      setCashDraft: (date, patch) => {
        const current = get().closes[date] ?? blankClose();
        set({ closes: { ...get().closes, [date]: { ...current, ...patch } } });
      },
      closeDay: (date) => {
        const report = dayReport(get().visits, date);
        const current = get().closes[date] ?? blankClose();
        if (current.cashCounted == null) return "Cuenta el efectivo antes de cerrar.";
        const gap = moneyGap(current.cashCounted, report.byMethod.efectivo) ?? 0;
        const dirty = report.missingEvidence.length > 0 || report.faltaCobro.length > 0 || Math.abs(gap) > 0.009;
        if (dirty && !current.note.trim()) return "Anota el motivo de la diferencia o de lo que falta.";
        set({
          closes: {
            ...get().closes,
            [date]: { ...current, closedAt: new Date().toISOString() },
          },
        });
        return null;
      },
      reopenDay: (date) => {
        const current = get().closes[date];
        if (!current) return;
        set({ closes: { ...get().closes, [date]: { ...current, closedAt: null } } });
      },
      collectDebt: (debtId, method, date) => {
        const debt = get().debts.find((item) => item.id === debtId);
        if (!debt || debt.status === "pagado") return null;
        const visit: Visit = {
          id: uid("v"),
          patientId: debt.patientId,
          doctorId: "judith" as DoctorId,
          date,
          time: null,
          treatment: `Cobro de saldo · ${debt.concept}`,
          status: "atendida" as VisitStatus,
          payments: [
            {
              id: uid("pay"),
              method,
              amount: debt.amount,
              operation: "",
              note: debt.concept,
              hasEvidence: false,
            },
          ],
          monthTag: "",
          note: "",
          source: "mostrador",
          noCharge: false,
        };
        set({
          debts: get().debts.map((item) => (item.id === debtId ? { ...item, status: "pagado" as const } : item)),
          visits: [...get().visits, visit],
        });
        return visit.id;
      },
      importExcelData: (newPatients, newVisits, newDebts) => {
        const currentPatients = [...get().patients];
        let patientsAdded = 0;

        const patientMap = new Map<string, Patient>();
        for (const p of currentPatients) {
          patientMap.set(fold(p.fullName), p);
        }

        for (const np of newPatients) {
          const key = fold(np.fullName);
          const existing = patientMap.get(key);
          if (!existing) {
            currentPatients.push(np);
            patientMap.set(key, np);
            patientsAdded++;
          } else {
            if (!existing.phone && np.phone) existing.phone = np.phone;
            if (!existing.dni && np.dni) existing.dni = np.dni;
            if (!existing.age && np.age) existing.age = np.age;
            if (!existing.address && np.address) existing.address = np.address;
          }
        }

        const currentVisits = [...get().visits];
        let visitsAdded = 0;
        const visitKeySet = new Set(
          currentVisits.map(
            (v) => `${v.date}-${v.doctorId}-${v.patientId}-${v.treatment.trim().toLowerCase()}`,
          ),
        );

        for (const nv of newVisits) {
          const vKey = `${nv.date}-${nv.doctorId}-${nv.patientId}-${nv.treatment.trim().toLowerCase()}`;
          if (!visitKeySet.has(vKey)) {
            currentVisits.push(nv);
            visitKeySet.add(vKey);
            visitsAdded++;
          }
        }

        const currentDebts = [...get().debts];
        let debtsAdded = 0;
        const debtKeySet = new Set(
          currentDebts.map((d) => `${d.patientId}-${d.concept.trim().toLowerCase()}`),
        );

        for (const nd of newDebts) {
          const dKey = `${nd.patientId}-${nd.concept.trim().toLowerCase()}`;
          if (!debtKeySet.has(dKey)) {
            currentDebts.push(nd);
            debtKeySet.add(dKey);
            debtsAdded++;
          }
        }

        set({
          patients: currentPatients,
          visits: currentVisits,
          debts: currentDebts,
        });

        // Aplicar sanitización inmediata tras importación
        get().cleanAndSyncDebts();

        return { patientsAdded, visitsAdded, debtsAdded };
      },
      cleanAndSyncDebts: () => {
        const cleaned = sanitizeStateData({
          patients: get().patients,
          visits: get().visits,
          debts: get().debts,
        });
        set({
          patients: cleaned.patients,
          visits: cleaned.visits,
          debts: cleaned.debts,
        });
      },
      resetLibro: () => set({ ...createSeed(), role: get().role, emisor: get().emisor, comprobantes: [] }),
    }),
    {
      name: "smile-studio-libro-v2",
      skipHydration: true,
      partialize: (state) => ({
        patients: state.patients,
        visits: state.visits,
        debts: state.debts,
        closes: state.closes,
        role: state.role,
        emisor: state.emisor,
        comprobantes: state.comprobantes,
      }),
    },
  ),
);

export function sanitizeStateData(state: {
  patients: Patient[];
  visits: Visit[];
  debts: Debt[];
}): { patients: Patient[]; visits: Visit[]; debts: Debt[] } {
  // Las 6 únicas personas que NO tienen la palabra PAGO en la columna E de la hoja DEUDORES del Excel:
  // 1. Agurto Colmenares Johan (S/ 40)
  // 2. Seminario Esquen Claudia (S/ 100)
  // 3. Arteaga Encalada Rafael (S/ 100)
  // 4. Montero Rebata Darwin (S/ 100)
  // 5. Chiroque Correa Karen América (S/ 34)
  // 6. Yovera Sánchez Salvador Jesús (S/ 34)
  const VALID_DEBTORS = [
    { key: "agurto", name: "Agurto Colmenares Johan", amount: 40, concept: "Control" },
    { key: "seminario", name: "Seminario Esquen Claudia Gabriela", amount: 100, concept: "Ortodoncia junio" },
    { key: "arteaga", name: "Arteaga Encalada Rafael", amount: 100, concept: "3 restauraciones" },
    { key: "montero", name: "Montero Rebata Darwin", amount: 100, concept: "Ortodoncia mayo" },
    { key: "chiroque", name: "Chiroque Correa Karen América", amount: 34, concept: "Pasta" },
    { key: "yovera", name: "Yovera Sánchez Salvador Jesús", amount: 34, concept: "Pasta" },
  ];

  // 1. Normalizar y desduplicar pacientes
  const patientIdRemap = new Map<string, string>();
  const cleanPatients: Patient[] = [];
  const patientMapByFold = new Map<string, Patient>();

  for (const pat of state.patients) {
    const rawName = pat.fullName.trim();
    const cleanName = rawName
      .replace(/^[\d\s.\-)]+/, "")
      .replace(/\.+$/, "")
      .trim();
    const folded = fold(cleanName);

    const existing = patientMapByFold.get(folded);
    if (!existing) {
      const updatedPat: Patient = {
        ...pat,
        fullName: cleanName || rawName,
      };
      patientMapByFold.set(folded, updatedPat);
      cleanPatients.push(updatedPat);
    } else {
      // Unificar datos en el registro principal
      if (!existing.phone && pat.phone) existing.phone = pat.phone;
      if (!existing.dni && pat.dni) existing.dni = pat.dni;
      if (!existing.age && pat.age) existing.age = pat.age;
      if (!existing.address && pat.address) existing.address = pat.address;
      patientIdRemap.set(pat.id, existing.id);
    }
  }

  // 2. Reasignar patientId en visitas si hubo fusión de duplicados
  const cleanVisits = state.visits.map((v) => {
    const remapped = patientIdRemap.get(v.patientId);
    return remapped ? { ...v, patientId: remapped } : v;
  });

  // 3. Deudas estrictas: SOLO las 6 cuentas oficiales que NO tienen PAGO en Columna E
  const patternUsed = new Set<string>();
  const cleanDebts: Debt[] = [];

  for (const d of state.debts) {
    const activePatientId = patientIdRemap.get(d.patientId) || d.patientId;
    const pat = cleanPatients.find((p) => p.id === activePatientId);
    if (!pat) continue;
    const patFolded = fold(pat.fullName);

    // Buscar si corresponde a uno de los 6 deudores oficiales
    const match = VALID_DEBTORS.find((valid) => patFolded.includes(valid.key));
    if (!match) {
      // Cualquier persona que decía PAGO (Aguallo, Palacios, Fossa, Castillo, Ruiz) o no autorizada se descarta
      continue;
    }

    if (patternUsed.has(match.key)) {
      // Evitar duplicados del mismo deudor
      continue;
    }
    patternUsed.add(match.key);

    cleanDebts.push({
      id: d.id || `debt-${match.key}`,
      patientId: activePatientId,
      amount: match.amount,
      concept: d.concept || match.concept,
      status: d.status || "pendiente",
    });
  }

  // Si falta alguno de los 6 deudores oficiales (por ejemplo si no existía el registro), asegurar que esté presente
  for (const valid of VALID_DEBTORS) {
    if (!patternUsed.has(valid.key)) {
      let pat = cleanPatients.find((p) => fold(p.fullName).includes(valid.key));
      if (!pat) {
        pat = {
          id: slug(valid.name),
          fullName: valid.name,
          age: "",
          dni: "",
          phone: "",
          address: "",
        };
        cleanPatients.push(pat);
      }
      cleanDebts.push({
        id: `debt-${valid.key}`,
        patientId: pat.id,
        amount: valid.amount,
        concept: valid.concept,
        status: "pendiente",
      });
      patternUsed.add(valid.key);
    }
  }

  return {
    patients: cleanPatients,
    visits: cleanVisits,
    debts: cleanDebts,
  };
}
