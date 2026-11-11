import { format } from "date-fns";
import { es } from "date-fns/locale";

export type DoctorId = "judith" | "miguel";
export type PayMethod = "efectivo" | "yape" | "plin" | "pos";
export type VisitStatus =
  | "solicitud"
  | "agendada"
  | "recordatorio"
  | "confirmada"
  | "en_sala"
  | "en_atencion"
  | "atendida"
  | "no_show"
  | "reprogramada"
  | "cancelada";
export type VisitSource = "libro" | "whatsapp" | "mostrador" | "agenda";
export type Role = "recepcion" | "judith" | "miguel" | "dueno";

export type Payment = {
  id: string;
  method: PayMethod;
  amount: number;
  operation: string;
  note: string;
  hasEvidence: boolean;
  evidence?: string;
};

export type Visit = {
  id: string;
  patientId: string;
  doctorId: DoctorId;
  date: string;
  time: string | null;
  treatment: string;
  status: VisitStatus;
  payments: Payment[];
  monthTag: string;
  note: string;
  source: VisitSource;
  noCharge: boolean;
};

export type Patient = {
  id: string;
  fullName: string;
  age: string;
  dni: string;
  phone: string;
  address: string;
};

export type Debt = {
  id: string;
  patientId: string;
  amount: number;
  concept: string;
  status: "pendiente" | "pagado";
};

export type DayClose = {
  cashCounted: number | null;
  note: string;
  closedAt: string | null;
};

export const DOCTORS: {
  id: DoctorId;
  short: string;
  name: string;
  focus: string;
}[] = [
  {
    id: "judith",
    short: "Dra. Judith",
    name: "Judith Escobedo Arteaga",
    focus: "Ortodoncia y clínica general",
  },
  {
    id: "miguel",
    short: "Dr. Miguel",
    name: "Miguel Oyola Bayona",
    focus: "Endodoncia",
  },
];

export const SLOTS = [
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
] as const;

export const METHODS: PayMethod[] = ["efectivo", "yape", "plin", "pos"];

export const METHOD_LABEL: Record<PayMethod, string> = {
  efectivo: "Efectivo",
  yape: "Yape",
  plin: "Plin",
  pos: "POS",
};

export const TREATMENTS = [
  "Consulta",
  "Control de ortodoncia",
  "Limpieza completa",
  "Restauración",
  "Extracción",
  "Apertura de endodoncia",
  "Sesión de endodoncia",
  "Cirugía de tercer molar",
  "Ajuste",
];

export const QUICK_AMOUNTS = [20, 50, 80, 100, 120, 150, 200, 350];

export const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export const STATUS_LABEL: Record<VisitStatus, string> = {
  solicitud: "Solicitud",
  agendada: "Sin confirmar",
  recordatorio: "Aviso enviado",
  confirmada: "Confirmada",
  en_sala: "En sala",
  en_atencion: "En atención",
  atendida: "Atendida",
  no_show: "No asistió",
  reprogramada: "Por reprogramar",
  cancelada: "Cancelada",
};

const NO_CHARGE =
  /solo control|solo evaluaci[oó]n|^evaluaci[oó]n$|retiro de puntos|ajuste de pr[oó]tesis/i;

export function doctorById(id: DoctorId) {
  return DOCTORS.find((d) => d.id === id) ?? DOCTORS[0];
}

export function fold(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

export function slug(value: string) {
  return fold(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
}

export function dayDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function toIso(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function shiftDay(iso: string, days: number) {
  const date = dayDate(iso);
  date.setDate(date.getDate() + days);
  return toIso(date);
}

export function isSunday(iso: string) {
  return dayDate(iso).getDay() === 0;
}

export function limaToday() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function nextOpenDay(today = limaToday()) {
  return isSunday(today) ? shiftDay(today, 1) : today;
}

export function latestOnOrBefore(dates: string[], today: string) {
  let best = "";
  for (const date of dates) {
    if (date <= today && date > best) best = date;
  }
  return best || today;
}

export function formatDay(iso: string) {
  const raw = format(dayDate(iso), "EEEE d 'de' MMMM", { locale: es });
  return raw.charAt(0).toLocaleUpperCase("es-PE") + raw.slice(1);
}

export function formatDayShort(iso: string) {
  const raw = format(dayDate(iso), "EEE d MMM", { locale: es });
  return raw.charAt(0).toLocaleUpperCase("es-PE") + raw.slice(1);
}

export function formatTime(hhmm: string) {
  const [hs, ms] = hhmm.split(":");
  const h = Number(hs);
  const suffix = h >= 12 ? "p. m." : "a. m.";
  const h12 = h % 12 || 12;
  return `${h12}:${ms} ${suffix}`;
}

export function formatStamp(iso: string) {
  return new Intl.DateTimeFormat("es-PE", {
    timeZone: "America/Lima",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function soles(amount: number) {
  const sign = amount < 0 ? "-" : "";
  const abs = Math.abs(amount);
  const body = abs.toLocaleString("es-PE", {
    minimumFractionDigits: Number.isInteger(abs) ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return `${sign}S/ ${body}`;
}

export function parseAmount(raw: string) {
  const n = Number(raw.replace(/[^\d.,]/g, "").replace(",", "."));
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100) / 100;
}

export function prettyPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length !== 9) return phone;
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
}

export function sumVisit(visit: Visit) {
  return visit.payments.reduce((sum, payment) => sum + payment.amount, 0);
}

export function inferNoCharge(treatment: string, payments: Payment[]) {
  return payments.length === 0 && NO_CHARGE.test(treatment.trim());
}

export function occupiesSlot(visit: Visit) {
  return Boolean(visit.time) && visit.status !== "cancelada" && visit.status !== "reprogramada";
}

export function needsMorningPing(visit: Visit) {
  return Boolean(visit.time) && (visit.status === "agendada" || visit.status === "recordatorio");
}

export function statusTone(
  status: VisitStatus,
): "muted" | "gold" | "moss" | "alert" | "ink" {
  switch (status) {
    case "confirmada":
    case "atendida":
      return "moss";
    case "agendada":
    case "no_show":
      return "alert";
    case "recordatorio":
    case "solicitud":
    case "reprogramada":
      return "gold";
    case "en_sala":
    case "en_atencion":
      return "ink";
    default:
      return "muted";
  }
}

export function slotAccent(status: VisitStatus) {
  switch (status) {
    case "confirmada":
    case "atendida":
      return "border-l-moss";
    case "agendada":
    case "no_show":
      return "border-l-alert";
    case "recordatorio":
    case "solicitud":
      return "border-l-gold";
    default:
      return "border-l-ink";
  }
}

export function nextStep(status: VisitStatus) {
  switch (status) {
    case "agendada":
    case "recordatorio":
    case "reprogramada":
      return { status: "confirmada" as const, label: "Confirmar cita" };
    case "confirmada":
      return { status: "en_sala" as const, label: "Ya llegó" };
    case "en_sala":
      return { status: "en_atencion" as const, label: "Pasar a atención" };
    case "en_atencion":
      return { status: "atendida" as const, label: "Marcar atendida" };
    default:
      return null;
  }
}

export function waHref(phone: string, text: string) {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  const withCountry = digits.length === 9 ? `51${digits}` : digits;
  return `https://wa.me/${withCountry}?text=${encodeURIComponent(text)}`;
}

export function reminderText(
  patient: Patient,
  visit: Visit,
  link = "",
) {
  const doctor = doctorById(visit.doctorId);
  const when = visit.time
    ? `${formatDay(visit.date)} a las ${formatTime(visit.time)}`
    : formatDay(visit.date);
  const lines = [
    "Hola, te escribimos de Smile Studio.",
    `Cita de ${patient.fullName} el ${when} con ${doctor.short}.`,
    `Motivo: ${visit.treatment}.`,
    "Responde 1 para confirmar o 2 para reprogramar.",
  ];
  if (link) lines.push(`También puedes confirmar aquí: ${link}`);
  return lines.join("\n");
}

export function emptyMethods(): Record<PayMethod, number> {
  return { efectivo: 0, yape: 0, plin: 0, pos: 0 };
}

export type DayReport = {
  visits: Visit[];
  byMethod: Record<PayMethod, number>;
  total: number;
  byDoctor: Record<DoctorId, Record<PayMethod, number>>;
  missingEvidence: { visit: Visit; payment: Payment }[];
  sinMonto: Visit[];
  faltaCobro: Visit[];
};

function countsForCash(visit: Visit) {
  return visit.status === "atendida" || visit.payments.length > 0;
}

export function dayReport(visits: Visit[], date: string): DayReport {
  const list = visits.filter(
    (visit) =>
      visit.date === date &&
      visit.status !== "cancelada" &&
      visit.status !== "reprogramada" &&
      countsForCash(visit),
  );
  const byMethod = emptyMethods();
  const byDoctor: Record<DoctorId, Record<PayMethod, number>> = {
    judith: emptyMethods(),
    miguel: emptyMethods(),
  };
  const missingEvidence: DayReport["missingEvidence"] = [];
  for (const visit of list) {
    for (const payment of visit.payments) {
      byMethod[payment.method] += payment.amount;
      byDoctor[visit.doctorId][payment.method] += payment.amount;
      if (payment.method !== "efectivo" && (!payment.hasEvidence || !payment.operation.trim())) {
        missingEvidence.push({ visit, payment });
      }
    }
  }
  const total = METHODS.reduce((sum, method) => sum + byMethod[method], 0);
  const sinMonto = list.filter(
    (visit) => sumVisit(visit) === 0 && !visit.noCharge && visit.source === "libro",
  );
  const faltaCobro = list.filter(
    (visit) => sumVisit(visit) === 0 && !visit.noCharge && visit.source !== "libro",
  );
  return { visits: list, byMethod, total, byDoctor, missingEvidence, sinMonto, faltaCobro };
}

export function moneyGap(counted: number | null, expected: number) {
  if (counted == null) return null;
  return Math.round((counted - expected) * 100) / 100;
}
