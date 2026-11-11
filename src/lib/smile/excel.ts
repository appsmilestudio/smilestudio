import * as XLSX from "xlsx";
import {
  fold,
  slug,
  uid,
  formatDay,
  formatTime,
  soles,
  type Debt,
  type DoctorId,
  type Patient,
  type Payment,
  type Visit,
} from "./model";

/**
 * Convierte un número de serie de fecha de Excel (ej: 46024) a formato "YYYY-MM-DD"
 */
function excelSerialToIso(val: unknown, lastDate = "2026-10-01"): string {
  if (typeof val === "number" && val > 30000 && val < 60000) {
    const ms = Math.round((val - 25569) * 86400 * 1000);
    const d = new Date(ms);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
    // Formatos como "01/10/2026" o "1/10/2026"
    const match = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (match) {
      const d = match[1].padStart(2, "0");
      const m = match[2].padStart(2, "0");
      const y = match[3];
      return `${y}-${m}-${d}`;
    }
  }
  return lastDate;
}

/**
 * Limpia números de teléfono
 */
function cleanPhone(raw: unknown): string {
  if (!raw) return "";
  const str = String(raw).replace(/\D/g, "");
  return str.length >= 7 ? str : "";
}

/**
 * Limpia DNI
 */
function cleanDni(raw: unknown): string {
  if (!raw) return "";
  const str = String(raw).replace(/\D/g, "");
  return str.length >= 6 ? str : "";
}

/**
 * Limpia montos monetarios de celdas de Excel
 */
function cleanAmount(raw: unknown): number {
  if (typeof raw === "number") return Math.round(raw * 100) / 100;
  if (typeof raw === "string") {
    const num = Number(raw.replace(/[^\d.,]/g, "").replace(",", "."));
    if (Number.isFinite(num)) return Math.round(num * 100) / 100;
  }
  return 0;
}

/**
 * Exporta el libro completo a un archivo .xlsx descargable en el navegador
 */
export function exportExcelWorkbook(
  patients: Patient[],
  visits: Visit[],
  debts: Debt[],
  fileName = `CONTROL PACIENTES SMILE STUDIO ${new Date().toISOString().slice(0, 10)}.xlsx`,
) {
  const wb = XLSX.utils.book_new();
  const patientMap = new Map(patients.map((p) => [p.id, p]));

  // 1. Hoja Dra. Judith
  const judithVisits = visits.filter((v) => v.doctorId === "judith");
  const judithRows: (string | number)[][] = [
    [
      "FECHA",
      "HORA",
      "APELLIDO Y NOMBRE",
      "EDAD",
      "N° DE DNI",
      "N° DE CELULAR",
      "DIRECCION",
      "TRATAMIENTO",
      "ESTADO",
      "EFECTIVO",
      "YAPE",
      "PLIN",
      "POS",
      "TOTAL",
      "NOTA",
    ],
  ];

  for (const v of judithVisits) {
    const pat = patientMap.get(v.patientId);
    let efectivo = 0;
    let yape = 0;
    let plin = 0;
    let pos = 0;

    for (const p of v.payments) {
      if (p.method === "efectivo") efectivo += p.amount;
      if (p.method === "yape") yape += p.amount;
      if (p.method === "plin") plin += p.amount;
      if (p.method === "pos") pos += p.amount;
    }
    const total = efectivo + yape + plin + pos;

    judithRows.push([
      v.date,
      v.time ?? "Sin hora",
      pat?.fullName ?? "Paciente",
      pat?.age ?? "",
      pat?.dni ?? "",
      pat?.phone ?? "",
      pat?.address ?? "",
      v.treatment,
      v.status,
      efectivo || "",
      yape || "",
      plin || "",
      pos || "",
      total,
      v.note ?? "",
    ]);
  }
  const wsJudith = XLSX.utils.aoa_to_sheet(judithRows);
  XLSX.utils.book_append_sheet(wb, wsJudith, "DOCTORA JUDITH");

  // 2. Hoja Dr. Miguel
  const miguelVisits = visits.filter((v) => v.doctorId === "miguel");
  const miguelRows: (string | number)[][] = [
    [
      "FECHA",
      "HORA",
      "APELLIDO Y NOMBRE",
      "EDAD",
      "DNI",
      "CELULAR",
      "DIRECCION",
      "TRATAMIENTO",
      "ESTADO",
      "EFECTIVO",
      "YAPE",
      "PLIN",
      "POS",
      "TOTAL",
      "NOTA",
    ],
  ];

  for (const v of miguelVisits) {
    const pat = patientMap.get(v.patientId);
    let efectivo = 0;
    let yape = 0;
    let plin = 0;
    let pos = 0;

    for (const p of v.payments) {
      if (p.method === "efectivo") efectivo += p.amount;
      if (p.method === "yape") yape += p.amount;
      if (p.method === "plin") plin += p.amount;
      if (p.method === "pos") pos += p.amount;
    }
    const total = efectivo + yape + plin + pos;

    miguelRows.push([
      v.date,
      v.time ?? "Sin hora",
      pat?.fullName ?? "Paciente",
      pat?.age ?? "",
      pat?.dni ?? "",
      pat?.phone ?? "",
      pat?.address ?? "",
      v.treatment,
      v.status,
      efectivo || "",
      yape || "",
      plin || "",
      pos || "",
      total,
      v.note ?? "",
    ]);
  }
  const wsMiguel = XLSX.utils.aoa_to_sheet(miguelRows);
  XLSX.utils.book_append_sheet(wb, wsMiguel, "DOCTOR MIGUEL");

  // 3. Hoja Deudores
  const deudoresRows: (string | number)[][] = [
    ["NOMBRE Y APELLIDO", "CELULAR", "CONCEPTO", "DEBE (S/)", "ESTADO"],
  ];
  for (const d of debts) {
    const pat = patientMap.get(d.patientId);
    deudoresRows.push([
      pat?.fullName ?? "Paciente",
      pat?.phone ?? "",
      d.concept,
      d.amount,
      d.status === "pagado" ? "PAGADO" : "PENDIENTE",
    ]);
  }
  const wsDeudores = XLSX.utils.aoa_to_sheet(deudoresRows);
  XLSX.utils.book_append_sheet(wb, wsDeudores, "DEUDORES");

  // 4. Hoja Directorio de Pacientes
  const pacientesRows: (string | number)[][] = [
    ["APELLIDOS Y NOMBRES", "DNI", "CELULAR", "EDAD", "DIRECCION", "TOTAL CITAS"],
  ];
  for (const p of patients) {
    const count = visits.filter((v) => v.patientId === p.id).length;
    pacientesRows.push([p.fullName, p.dni, p.phone, p.age, p.address, count]);
  }
  const wsPacientes = XLSX.utils.aoa_to_sheet(pacientesRows);
  XLSX.utils.book_append_sheet(wb, wsPacientes, "DIRECTORIO PACIENTES");

  // Descargar archivo
  XLSX.writeFile(wb, fileName);
}

/**
 * Lee un archivo .xlsx y extrae pacientes, atenciones y deudores
 */
export async function parseExcelWorkbook(file: File): Promise<{
  patients: Patient[];
  visits: Visit[];
  debts: Debt[];
}> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array" });

  const extractedPatients: Patient[] = [];
  const extractedVisits: Visit[] = [];
  const extractedDebts: Debt[] = [];

  const patientMap = new Map<string, Patient>();

  function getOrCreatePatient(
    name: string,
    age?: string,
    dni?: string,
    phone?: string,
    address?: string,
  ): Patient {
    const cleanName = name.trim();
    const key = fold(cleanName);
    let pat = patientMap.get(key);

    if (!pat) {
      pat = {
        id: slug(cleanName) || uid("p"),
        fullName: cleanName,
        age: age ? String(age).trim() : "",
        dni: dni ? cleanDni(dni) : "",
        phone: phone ? cleanPhone(phone) : "",
        address: address ? String(address).trim() : "",
      };
      patientMap.set(key, pat);
      extractedPatients.push(pat);
    } else {
      if (!pat.dni && dni) pat.dni = cleanDni(dni);
      if (!pat.phone && phone) pat.phone = cleanPhone(phone);
      if (!pat.age && age) pat.age = String(age).trim();
      if (!pat.address && address) pat.address = String(address).trim();
    }
    return pat;
  }

  // Parsear hojas de doctores
  for (const sheetName of wb.SheetNames) {
    const upper = sheetName.toUpperCase();
    const isJudith = upper.includes("JUDITH");
    const isMiguel = upper.includes("MIGUEL");

    if (isJudith || isMiguel) {
      const doctorId: DoctorId = isJudith ? "judith" : "miguel";
      const ws = wb.Sheets[sheetName];
      const rows: unknown[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

      let lastDate = "2026-10-01";

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (!row || !Array.isArray(row) || row.length < 2) continue;

        const col0 = row[0];
        const col1 = row[1];

        // Omitir encabezados
        if (typeof col1 === "string" && (col1.includes("APELLIDO") || col1.includes("NOMBRE"))) {
          continue;
        }

        // Nombre del paciente
        const rawName = typeof col1 === "string" ? col1.trim() : "";
        if (!rawName || rawName.length < 3) continue;

        // Fecha de atención
        if (col0 !== null && col0 !== undefined && col0 !== "") {
          lastDate = excelSerialToIso(col0, lastDate);
        }

        const age = row[2] ? String(row[2]) : "";
        const dni = row[3] ? String(row[3]) : "";
        const phone = row[4] ? String(row[4]) : "";
        const address = row[5] ? String(row[5]) : "";
        const treatment = row[6] ? String(row[6]).trim() : "Consulta";

        // Pagos
        const efectivo = cleanAmount(row[7]);
        const yape = cleanAmount(row[8]);
        const pos = cleanAmount(row[9]);

        const pat = getOrCreatePatient(rawName, age, dni, phone, address);

        const payments: Payment[] = [];
        if (efectivo > 0) {
          payments.push({
            id: uid("pay"),
            method: "efectivo",
            amount: efectivo,
            operation: "",
            note: "",
            hasEvidence: true,
          });
        }
        if (yape > 0) {
          payments.push({
            id: uid("pay"),
            method: "yape",
            amount: yape,
            operation: "",
            note: "",
            hasEvidence: false,
          });
        }
        if (pos > 0) {
          payments.push({
            id: uid("pay"),
            method: "pos",
            amount: pos,
            operation: "",
            note: "",
            hasEvidence: false,
          });
        }

        extractedVisits.push({
          id: uid("v"),
          patientId: pat.id,
          doctorId,
          date: lastDate,
          time: null,
          treatment,
          status: "atendida",
          payments,
          monthTag: "",
          note: "",
          source: "libro",
          noCharge: payments.length === 0,
        });
      }
    }

    // Parsear hoja de deudores (omitir MOROSOS si está vacía o solo DEUDORES)
    if (upper === "DEUDORES" || (upper.includes("DEUDOR") && !upper.includes("MOROSO"))) {
      const ws = wb.Sheets[sheetName];
      const rows: unknown[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (!row || !Array.isArray(row) || row.length < 2) continue;

        const col0 = row[0];
        if (typeof col0 === "string" && (col0.includes("NOMBRE") || col0.includes("APELLIDO"))) {
          continue;
        }

        let debtorName = typeof col0 === "string" ? col0.trim() : "";
        // Limpiar prefijos como "1.- ", "7.- ", "10.- ", "2. ", etc. y puntos finales
        debtorName = debtorName.replace(/^[\d\s.\-)]+/, "").replace(/\.+$/, "").trim();
        if (debtorName.length < 3) continue;

        // Comprobar si cualquier celda de la fila dice PAGO o CANCELADO
        const isPaid = row.some((cell) => {
          if (typeof cell === "string") {
            const val = cell.toUpperCase().trim();
            return val.includes("PAGO") || val.includes("CANCELADO");
          }
          return false;
        });
        if (isPaid) {
          continue;
        }

        const amount = cleanAmount(row[1]);
        const concept = row[3] ? String(row[3]).replace(/\.+$/, "").trim() : "Saldo pendiente";

        const pat = getOrCreatePatient(debtorName);

        extractedDebts.push({
          id: uid("debt"),
          patientId: pat.id,
          amount: amount || 50,
          concept,
          status: "pendiente",
        });
      }
    }
  }

  return {
    patients: extractedPatients,
    visits: extractedVisits,
    debts: extractedDebts,
  };
}
