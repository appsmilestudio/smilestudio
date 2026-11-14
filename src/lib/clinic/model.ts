export type TabId = "ficha" | "odontograma" | "ortodoncia";

export type Tool =
  | "sano"
  | "caries"
  | "obturacion"
  | "corona"
  | "extraccion"
  | "ausente"
  | "endodoncia"
  | "protesis-fija"
  | "protesis-removible"
  | "sellante"
  | "fractura";

export type MarkId = Exclude<Tool, "sano">;

export type SurfaceId = "v" | "m" | "d" | "l" | "o";

export type SurfaceMark = "caries" | "obturacion" | "sellante";

export type WholeMark = Exclude<MarkId, SurfaceMark> | "";

export type YesNo = "" | "si" | "no";

export type ToothChart = {
  surfaces: Partial<Record<SurfaceId, SurfaceMark>>;
  whole: WholeMark;
};

export type Cita = { fecha: string; hora: string };
export type PresupuestoRow = { concepto: string; unit: string; total: string };
export type EvolucionRow = { fecha: string; tratamiento: string; saldo: string; pago: string };
export type PlanRow = { fecha: string; tratamiento: string; pago: string; saldo: string };
export type ControlRow = { fecha: string; nro: string; tratamiento: string; pago: string };

export type Antecedentes = {
  alergias: YesNo;
  diabetes: YesNo;
  cardiovascular: YesNo;
  hemorragias: YesNo;
  gestante: YesNo;
  hipertension: YesNo;
  renal: YesNo;
  otra: YesNo;
};

export type Patient = {
  id: string;
  apellidos: string;
  nombres: string;
  nombreCompleto: string;
  edad: string;
  dni: string;
  odontologo: string;
  fecha: string;
  telefono: string;
  direccion: string;
  fechaNac: string;
  teeth: Record<string, ToothChart>;
  observacionesOdonto: string;
  planOdonto: [string, string, string, string, string];
  antecedentes: Antecedentes;
  otraDetalle: string;
  motivo: string;
  medicamento: string;
  examen: string;
  observacionesHistoria: string;
  citas: Cita[];
  arch: Record<string, MarkId | "">;
  presupuesto: PresupuestoRow[];
  evolucion: EvolucionRow[];
  planRows: PlanRow[];
  cuotaMensual: string;
  fechaSup: string;
  fechaInf: string;
  controles: ControlRow[];
};

export const TABS: { id: TabId; label: string; blurb: string }[] = [
  {
    id: "ficha",
    label: "Ficha Clínica (Horizontal)",
    blurb: "Díptico oficial completo: Ficha, Próximas Citas, Plan de Tratamiento y Presupuesto/Evolución.",
  },
  {
    id: "odontograma",
    label: "Odontograma Oficial",
    blurb: "Odontograma oficial dorado vertical con simbología y anatomía.",
  },
  {
    id: "ortodoncia",
    label: "Control de Ortodoncia",
    blurb: "Hoja de control de ortodoncia, instalación y cuota mensual.",
  },
];

export const UPPER = [
  "18",
  "17",
  "16",
  "15",
  "14",
  "13",
  "12",
  "11",
  "21",
  "22",
  "23",
  "24",
  "25",
  "26",
  "27",
  "28",
];

export const LOWER = [
  "48",
  "47",
  "46",
  "45",
  "44",
  "43",
  "42",
  "41",
  "31",
  "32",
  "33",
  "34",
  "35",
  "36",
  "37",
  "38",
];

export const LEGEND: { id: Tool; label: string; swatch: "fill" | "x" | "empty" | "crack" }[] = [
  { id: "sano", label: "Sano", swatch: "fill" },
  { id: "caries", label: "Caries", swatch: "fill" },
  { id: "obturacion", label: "Obturación", swatch: "fill" },
  { id: "corona", label: "Corona", swatch: "fill" },
  { id: "extraccion", label: "Extracción indicada", swatch: "x" },
  { id: "ausente", label: "Ausente", swatch: "empty" },
  { id: "endodoncia", label: "Endodoncia", swatch: "fill" },
  { id: "protesis-fija", label: "Prótesis fija", swatch: "fill" },
  { id: "protesis-removible", label: "Prótesis removible", swatch: "fill" },
  { id: "sellante", label: "Sellante", swatch: "fill" },
  { id: "fractura", label: "Fractura", swatch: "crack" },
];

export const SURFACE_TOOLS: Tool[] = ["sano", "caries", "obturacion", "sellante"];

export const EMPTY_TOOTH: ToothChart = { surfaces: {}, whole: "" };

const ANTE_BLANK: Antecedentes = {
  alergias: "",
  diabetes: "",
  cardiovascular: "",
  hemorragias: "",
  gestante: "",
  hipertension: "",
  renal: "",
  otra: "",
};

export function todaySlash(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export function ageFrom(fecha: string): string | null {
  const m = fecha.trim().match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (!m) return null;
  const day = Number(m[1]);
  const month = Number(m[2]);
  const year = Number(m[3]);
  const born = new Date(year, month - 1, day);
  if (born.getFullYear() !== year || born.getMonth() !== month - 1 || born.getDate() !== day) {
    return null;
  }
  const now = new Date();
  let age = now.getFullYear() - year;
  const md = now.getMonth() - (month - 1);
  if (md < 0 || (md === 0 && now.getDate() < day)) age -= 1;
  if (age < 0 || age > 120) return null;
  return String(age);
}

function list<T>(n: number, make: () => T): T[] {
  return Array.from({ length: n }, make);
}

export function blankCita(): Cita {
  return { fecha: "", hora: "" };
}
export function blankPresupuesto(): PresupuestoRow {
  return { concepto: "", unit: "", total: "" };
}
export function blankEvolucion(): EvolucionRow {
  return { fecha: "", tratamiento: "", saldo: "", pago: "" };
}
export function blankPlan(): PlanRow {
  return { fecha: "", tratamiento: "", pago: "", saldo: "" };
}
export function blankControl(): ControlRow {
  return { fecha: "", nro: "", tratamiento: "", pago: "" };
}

export function blankPatient(id: string, odontologo = ""): Patient {
  return {
    id,
    apellidos: "",
    nombres: "",
    nombreCompleto: "",
    edad: "",
    dni: "",
    odontologo,
    fecha: todaySlash(),
    telefono: "",
    direccion: "",
    fechaNac: "",
    teeth: {},
    observacionesOdonto: "",
    planOdonto: ["", "", "", "", ""],
    antecedentes: { ...ANTE_BLANK },
    otraDetalle: "",
    motivo: "",
    medicamento: "",
    examen: "",
    observacionesHistoria: "",
    citas: list(15, blankCita),
    arch: {},
    presupuesto: list(9, blankPresupuesto),
    evolucion: list(16, blankEvolucion),
    planRows: list(22, blankPlan),
    cuotaMensual: "",
    fechaSup: "",
    fechaInf: "",
    controles: list(20, blankControl),
  };
}

export function patientLabel(p: Patient): string {
  const full = p.nombreCompleto.trim();
  if (full) return full;
  const joined = `${p.apellidos} ${p.nombres}`.trim();
  return joined || "Paciente sin nombre";
}

export function toothKind(fdi: string): "molar" | "premolar" | "canine" | "lateral" | "central" {
  const n = Number(fdi) % 10;
  if (n >= 6) return "molar";
  if (n >= 4) return "premolar";
  if (n === 3) return "canine";
  if (n === 2) return "lateral";
  return "central";
}

export function isUpper(fdi: string): boolean {
  return fdi.startsWith("1") || fdi.startsWith("2");
}

/** Mesial side sits on the right of the cell for the patient's right quadrants. */
export function mesialOnRight(fdi: string): boolean {
  const q = fdi[0];
  return q === "1" || q === "4";
}

export function isWholeTool(tool: Tool): tool is Exclude<WholeMark, ""> {
  return !SURFACE_TOOLS.includes(tool);
}

export function markColor(mark: string): string {
  switch (mark) {
    case "caries":
      return "var(--color-caries)";
    case "obturacion":
      return "var(--color-obt)";
    case "corona":
      return "var(--color-corona)";
    case "endodoncia":
      return "var(--color-endo)";
    case "protesis-fija":
      return "var(--color-fija)";
    case "protesis-removible":
      return "var(--color-remov)";
    case "sellante":
      return "var(--color-sellante)";
    case "fractura":
      return "var(--color-fractura)";
    default:
      return "transparent";
  }
}

export function dominantMark(tooth: ToothChart): MarkId | "" {
  if (tooth.whole) return tooth.whole;
  const order: SurfaceMark[] = ["caries", "obturacion", "sellante"];
  const values = Object.values(tooth.surfaces);
  for (const mark of order) {
    if (values.includes(mark)) return mark;
  }
  return "";
}

const FDI_TO_UNI: Record<string, string> = {};
["18", "17", "16", "15", "14", "13", "12", "11"].forEach((fdi, i) => {
  FDI_TO_UNI[fdi] = String(i + 1);
});
["21", "22", "23", "24", "25", "26", "27", "28"].forEach((fdi, i) => {
  FDI_TO_UNI[fdi] = String(i + 9);
});
["31", "32", "33", "34", "35", "36", "37", "38"].forEach((fdi, i) => {
  FDI_TO_UNI[fdi] = String(24 - i);
});
["41", "42", "43", "44", "45", "46", "47", "48"].forEach((fdi, i) => {
  FDI_TO_UNI[fdi] = String(25 + i);
});

export function archFromTeeth(teeth: Record<string, ToothChart>): Record<string, MarkId | ""> {
  const arch: Record<string, MarkId | ""> = {};
  for (const [fdi, uni] of Object.entries(FDI_TO_UNI)) {
    arch[`u${uni}`] = dominantMark(teeth[fdi] ?? EMPTY_TOOTH);
  }
  return arch;
}

export type ArchNode = {
  id: string;
  label: string;
  x: number;
  y: number;
  r: number;
};

export function archNodes(): ArchNode[] {
  const nodes: ArchNode[] = [];
  const cx = 320;
  const cy = 248;
  const perm = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
    "16",
    "17",
    "18",
    "19",
    "20",
    "21",
    "22",
    "23",
    "24",
    "25",
    "26",
    "27",
    "28",
    "29",
    "30",
    "31",
    "32",
  ];
  perm.forEach((label, i) => {
    const a = Math.PI - (i / 32) * Math.PI * 2;
    nodes.push({
      id: `u${label}`,
      label,
      x: cx + Math.cos(a) * 214,
      y: cy - Math.sin(a) * 168,
      r: 14,
    });
  });
  const upperP = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
  upperP.forEach((label, i) => {
    const a = Math.PI * 0.86 - (i / 9) * Math.PI * 0.72;
    nodes.push({
      id: `p${label}`,
      label,
      x: cx + Math.cos(a) * 132,
      y: cy - Math.sin(a) * 104,
      r: 10,
    });
  });
  const lowerP = ["T", "S", "R", "Q", "P", "O", "N", "M", "L", "K"];
  lowerP.forEach((label, i) => {
    const a = Math.PI * 1.14 + (i / 9) * Math.PI * 0.72;
    nodes.push({
      id: `p${label}`,
      label,
      x: cx + Math.cos(a) * 132,
      y: cy - Math.sin(a) * 104,
      r: 10,
    });
  });
  return nodes;
}

export function parseMoney(value: string): number {
  const raw = value.replace(/s\/?\s*/i, "").replace(/\s/g, "");
  if (!raw) return 0;
  const cleaned = raw.replace(/[^\d,.-]/g, "");
  let normalized = cleaned;
  if (cleaned.includes(",") && cleaned.includes(".")) {
    normalized =
      cleaned.lastIndexOf(",") > cleaned.lastIndexOf(".")
        ? cleaned.replace(/\./g, "").replace(",", ".")
        : cleaned.replace(/,/g, "");
  } else {
    normalized = cleaned.replace(",", ".");
  }
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
}

export function formatSoles(n: number): string {
  return `S/ ${n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function sumMoney(values: string[]): number {
  return values.reduce((acc, value) => acc + parseMoney(value), 0);
}

export function commitRow<T>(rows: T[], index: number, next: T, isEmpty: (row: T) => boolean, blank: T): T[] {
  const copy = rows.map((row, i) => (i === index ? next : row));
  const last = copy[copy.length - 1];
  if (last && !isEmpty(last) && copy.length < 40) copy.push(blank);
  return copy;
}

export function crownPath(kind: ReturnType<typeof toothKind>): { body: string; grooves: string } {
  switch (kind) {
    case "molar":
      return {
        body: "M7 11c0-5 34-5 34 0l2 14c2 12-5 22-11 25-4 2-6-4-8-4s-4 6-8 4C10 47 3 37 5 25Z",
        grooves: "M15 22h18M24 18v24M13 32h22",
      };
    case "premolar":
      return {
        body: "M11 11h26c4 0 6 8 4 18-4 16-10 20-17 20S11 45 7 29C5 19 7 11 11 11Z",
        grooves: "M24 18v26M14 30h20",
      };
    case "canine":
      return {
        body: "M15 11h18l2 16L24 52 13 27Z",
        grooves: "M24 16v24",
      };
    case "lateral":
      return {
        body: "M17 10h14l2 18-9 22-9-22Z",
        grooves: "M24 16v22",
      };
    default:
      return {
        body: "M13 10h22l2 20-13 20L11 30Z",
        grooves: "M24 16v22",
      };
  }
}

export function isPresupuestoEmpty(row: PresupuestoRow): boolean {
  return !row.concepto && !row.unit && !row.total;
}
export function isEvolucionEmpty(row: EvolucionRow): boolean {
  return !row.fecha && !row.tratamiento && !row.saldo && !row.pago;
}
export function isPlanEmpty(row: PlanRow): boolean {
  return !row.fecha && !row.tratamiento && !row.pago && !row.saldo;
}
export function isControlEmpty(row: ControlRow): boolean {
  return !row.fecha && !row.nro && !row.tratamiento && !row.pago;
}
export function isCitaEmpty(row: Cita): boolean {
  return !row.fecha && !row.hora;
}

function asYesNo(value: unknown): YesNo {
  return value === "si" || value === "no" ? value : "";
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function normalizePatient(input: unknown, fallbackOdontologo = ""): Patient | null {
  if (!input || typeof input !== "object") return null;
  const raw = input as Partial<Patient>;
  if (typeof raw.id !== "string" || !raw.id) return null;
  const base = blankPatient(raw.id, fallbackOdontologo);
  const plan = Array.isArray(raw.planOdonto) ? raw.planOdonto.map(asString).slice(0, 5) : [];
  while (plan.length < 5) plan.push("");
  const ante = raw.antecedentes ?? ANTE_BLANK;
  return {
    ...base,
    id: raw.id,
    apellidos: asString(raw.apellidos),
    nombres: asString(raw.nombres),
    nombreCompleto: asString(raw.nombreCompleto),
    edad: asString(raw.edad),
    dni: asString(raw.dni),
    odontologo: asString(raw.odontologo),
    fecha: asString(raw.fecha) || base.fecha,
    telefono: asString(raw.telefono),
    direccion: asString(raw.direccion),
    fechaNac: asString(raw.fechaNac),
    teeth: raw.teeth && typeof raw.teeth === "object" ? raw.teeth : {},
    observacionesOdonto: asString(raw.observacionesOdonto),
    planOdonto: plan as Patient["planOdonto"],
    antecedentes: {
      alergias: asYesNo(ante.alergias),
      diabetes: asYesNo(ante.diabetes),
      cardiovascular: asYesNo(ante.cardiovascular),
      hemorragias: asYesNo(ante.hemorragias),
      gestante: asYesNo(ante.gestante),
      hipertension: asYesNo(ante.hipertension),
      renal: asYesNo(ante.renal),
      otra: asYesNo(ante.otra),
    },
    otraDetalle: asString(raw.otraDetalle),
    motivo: asString(raw.motivo),
    medicamento: asString(raw.medicamento),
    examen: asString(raw.examen),
    observacionesHistoria: asString(raw.observacionesHistoria),
    citas: padRows(raw.citas, 18, blankCita, (row) => ({
      fecha: asString(row?.fecha),
      hora: asString(row?.hora),
    })),
    arch: raw.arch && typeof raw.arch === "object" ? raw.arch : {},
    presupuesto: padRows(raw.presupuesto, 8, blankPresupuesto, (row) => ({
      concepto: asString(row?.concepto),
      unit: asString(row?.unit),
      total: asString(row?.total),
    })),
    evolucion: padRows(raw.evolucion, 10, blankEvolucion, (row) => ({
      fecha: asString(row?.fecha),
      tratamiento: asString(row?.tratamiento),
      saldo: asString(row?.saldo),
      pago: asString(row?.pago),
    })),
    planRows: padRows(raw.planRows, 12, blankPlan, (row) => ({
      fecha: asString(row?.fecha),
      tratamiento: asString(row?.tratamiento),
      pago: asString(row?.pago),
      saldo: asString(row?.saldo),
    })),
    cuotaMensual: asString(raw.cuotaMensual),
    fechaSup: asString(raw.fechaSup),
    fechaInf: asString(raw.fechaInf),
    controles: padRows(raw.controles, 14, blankControl, (row) => ({
      fecha: asString(row?.fecha),
      nro: asString(row?.nro),
      tratamiento: asString(row?.tratamiento),
      pago: asString(row?.pago),
    })),
  };
}

function padRows<T>(value: unknown, min: number, blank: () => T, map: (row: T | undefined) => T): T[] {
  const source = Array.isArray(value) ? (value as T[]) : [];
  const rows = source.slice(0, 40).map((row) => map(row));
  while (rows.length < min) rows.push(blank());
  return rows;
}
