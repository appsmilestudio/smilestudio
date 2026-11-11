import {
  SLOTS,
  fold,
  isSunday,
  limaToday,
  nextOpenDay,
  shiftDay,
  dayDate,
  toIso,
  type DoctorId,
} from "./model";

export type WhatsAppLead = {
  id: string;
  kind: "reserva" | "confirma" | "reprograma";
  name: string;
  phone: string;
  doctorId: DoctorId;
  date: string;
  time: string | null;
  treatment: string;
  note: string;
  text: string;
};

const WEEKDAYS: Record<string, number> = {
  domingo: 0,
  lunes: 1,
  martes: 2,
  miercoles: 3,
  jueves: 4,
  viernes: 5,
  sabado: 6,
};

const MONTHS: Record<string, number> = {
  enero: 1,
  febrero: 2,
  marzo: 3,
  abril: 4,
  mayo: 5,
  junio: 6,
  julio: 7,
  agosto: 8,
  septiembre: 9,
  setiembre: 9,
  octubre: 10,
  noviembre: 11,
  diciembre: 12,
};

export function phoneKey(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("51") && digits.length >= 11) return digits.slice(-9);
  return digits;
}

function clipName(value: string) {
  return value
    .replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ' ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

function readName(text: string) {
  const match = text.match(
    /(?:me llamo|mi nombre es|soy|paciente)\s+([A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:\s+[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+){0,4})/i,
  );
  if (!match) return "";
  return clipName(match[1].replace(/\b(y|para|quiero|necesito|celular|cel)\b.*$/i, ""));
}

function readDoctor(text: string): DoctorId {
  const folded = fold(text);
  if (/miguel|endodoncia|conducto/.test(folded)) return "miguel";
  return "judith";
}

function readTreatment(text: string, doctorId: DoctorId) {
  const folded = fold(text);
  if (/tercer molar|cordal|juicio/.test(folded)) return "Cirugía de tercer molar";
  if (/limpieza|profilaxis/.test(folded)) return "Limpieza completa";
  if (/ortodoncia|bracket|frenillo/.test(folded)) return "Control de ortodoncia";
  if (/extracci|sacar.*muela|muela/.test(folded)) return "Extracción";
  if (/endodoncia|conducto/.test(folded)) return "Sesión de endodoncia";
  if (/restauraci|calza|curaci|resina/.test(folded)) return "Restauración";
  if (/consulta|evaluaci|revisi/.test(folded)) return "Consulta";
  return doctorId === "miguel" ? "Sesión de endodoncia" : "Consulta";
}

function readDate(text: string, today: string) {
  const folded = fold(text);
  if (/\bhoy\b/.test(folded)) return nextOpenDay(today);
  if (/pasado manana/.test(folded)) {
    const day = shiftDay(today, 2);
    return isSunday(day) ? shiftDay(day, 1) : day;
  }
  if (/\bmanana\b/.test(folded)) {
    const day = shiftDay(today, 1);
    return isSunday(day) ? shiftDay(day, 1) : day;
  }
  for (const [name, weekday] of Object.entries(WEEKDAYS)) {
    if (new RegExp(`\\b${name}\\b`).test(folded)) {
      const current = dayDate(today).getDay();
      const delta = (weekday - current + 7) % 7;
      const day = shiftDay(today, delta);
      return isSunday(day) ? shiftDay(day, 1) : day;
    }
  }
  const numeric = text.match(/\b(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?\b/);
  if (numeric) {
    const day = Number(numeric[1]);
    const month = Number(numeric[2]);
    const year = numeric[3] ? Number(numeric[3].length === 2 ? `20${numeric[3]}` : numeric[3]) : Number(today.slice(0, 4));
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      const iso = toIso(new Date(year, month - 1, day));
      return isSunday(iso) ? shiftDay(iso, 1) : iso;
    }
  }
  for (const [name, month] of Object.entries(MONTHS)) {
    const named = folded.match(new RegExp(`\\b(\\d{1,2})\\s+de\\s+${name}\\b`));
    if (named) {
      const iso = toIso(new Date(Number(today.slice(0, 4)), month - 1, Number(named[1])));
      return isSunday(iso) ? shiftDay(iso, 1) : iso;
    }
  }
  return nextOpenDay(today);
}

function toSlot(hour: number, minute: number) {
  if (hour >= 1 && hour <= 7) hour += 12;
  const value = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  return (SLOTS as readonly string[]).includes(value) ? value : null;
}

function readTime(text: string) {
  const folded = fold(text);
  const clock = folded.match(/\b(\d{1,2})[:.](\d{2})\b/);
  if (clock) {
    let hour = Number(clock[1]);
    const minute = Number(clock[2]);
    const tail = folded.slice(folded.indexOf(clock[0]));
    if (/p\.?\s*m|tarde|noche/.test(tail.slice(0, 16)) && hour < 12) hour += 12;
    return { time: toSlot(hour, minute), raw: clock[0] };
  }
  const loose = folded.match(/\ba las\s+(\d{1,2})\b|\b(\d{1,2})\s*(a\.?\s*m\.?|p\.?\s*m\.?|am|pm)\b/);
  if (!loose) return { time: null, raw: "" };
  let hour = Number(loose[1] || loose[2]);
  const mark = loose[3] ?? "";
  if (hour < 1 || hour > 19) return { time: null, raw: "" };
  if (/p/.test(mark) && hour < 12) hour += 12;
  if (!mark && hour >= 1 && hour <= 7) hour += 12;
  return { time: toSlot(hour, 0), raw: loose[0] };
}

function readKind(text: string): WhatsAppLead["kind"] {
  const folded = fold(text);
  if (/^(confirmo|confirmar|si voy|ahi estare)\.?$/.test(folded)) return "confirma";
  if (folded.length < 48 && /otra hora|reprogram|reagend|cambiar (la )?hora/.test(folded) && !readTime(text).time) {
    return "reprograma";
  }
  return "reserva";
}

export function parseBooking(
  text: string,
  options: { id?: string; phone?: string; profileName?: string; today?: string } = {},
): WhatsAppLead {
  const today = options.today ?? limaToday();
  const body = text.replace(/\s+/g, " ").trim();
  const doctorId = readDoctor(body);
  const kind = readKind(body);
  const named = readName(body) || clipName(options.profileName ?? "");
  const when = readTime(body);
  const notes: string[] = [];
  if (body) notes.push(body);
  let time = when.time;
  if (when.raw && !time) notes.unshift(`Pidió ${when.raw}, fuera del horario del consultorio.`);
  const date = readDate(body, today);
  return {
    id: options.id || `wa-${Date.now().toString(36)}`,
    kind,
    name: named || "Paciente de WhatsApp",
    phone: phoneKey(options.phone ?? ""),
    doctorId,
    date,
    time: kind === "reserva" ? time : null,
    treatment: readTreatment(body, doctorId),
    note: notes.join(" "),
    text: body,
  };
}
