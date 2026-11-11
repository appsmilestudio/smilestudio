import { parseBooking, phoneKey, type WhatsAppLead } from "./intake";
import { occupiesSlot } from "./model";
import { useSmileStore } from "./store";

function findByPhone(phone: string) {
  const key = phoneKey(phone);
  if (!key) return null;
  return (
    useSmileStore.getState().patients.find((patient) => phoneKey(patient.phone) === key) ?? null
  );
}

function pendingVisit(phone: string) {
  const patient = findByPhone(phone);
  if (!patient) return null;
  const visits = useSmileStore
    .getState()
    .visits.filter(
      (visit) =>
        visit.patientId === patient.id &&
        (visit.status === "agendada" || visit.status === "recordatorio" || visit.status === "solicitud"),
    )
    .sort((a, b) => `${a.date}${a.time ?? ""}`.localeCompare(`${b.date}${b.time ?? ""}`));
  return visits[0] ?? null;
}

export function applyWhatsAppLead(lead: WhatsAppLead) {
  const store = useSmileStore.getState();
  if (lead.kind === "confirma" || lead.kind === "reprograma") {
    const visit = pendingVisit(lead.phone);
    if (visit) {
      const result = store.moveVisit(visit.id, {
        status: lead.kind === "confirma" ? "confirmada" : "reprogramada",
        time: lead.kind === "reprograma" ? null : visit.time,
      });
      const patient = store.patients.find((item) => item.id === visit.patientId);
      if (!result.ok) return result.reason;
      return lead.kind === "confirma"
        ? `${patient?.fullName ?? "El paciente"} confirmó por WhatsApp.`
        : `${patient?.fullName ?? "El paciente"} pidió otra hora.`;
    }
  }

  const known = findByPhone(lead.phone);
  const patientId = known
    ? known.id
    : store.createPatient({
        fullName: lead.name,
        phone: lead.phone,
        dni: "",
        age: "",
        address: "",
      });
  if (known && lead.phone && !known.phone) {
    store.savePatient({ ...known, phone: lead.phone });
  }

  let time = lead.time;
  let note = lead.note;
  if (time && store.visits.some((visit) => visit.date === lead.date && visit.time === time && visit.doctorId === lead.doctorId && occupiesSlot(visit))) {
    note = `Pidió las ${time}, pero ese horario ya está ocupado. ${note}`.trim();
    time = null;
  }

  store.addVisit({
    patientId,
    doctorId: lead.doctorId,
    date: lead.date,
    time,
    treatment: lead.treatment,
    status: time ? "agendada" : "solicitud",
    payments: [],
    monthTag: "",
    note,
    source: "whatsapp",
    noCharge: false,
  });

  const when = time ? `${lead.date} ${time}` : lead.date;
  return `${lead.name} quedó en la agenda (${when}).`;
}

export function applyPastedWhatsApp(text: string, phone = "", profileName = "") {
  return applyWhatsAppLead(parseBooking(text, { phone, profileName }));
}
