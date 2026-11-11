import { useState } from "react";
import {
  DOCTORS,
  SLOTS,
  STATUS_LABEL,
  doctorById,
  formatTime,
  isSunday,
  needsMorningPing,
  occupiesSlot,
  slotAccent,
  soles,
  statusTone,
  type DoctorId,
  type Patient,
  type Role,
  type Visit,
} from "@/lib/smile/model";
import { cn } from "@/lib/cn";
import { Btn, Pill } from "./ui";

const MORNING = SLOTS.filter((slot) => slot < "13:00");
const AFTERNOON = SLOTS.filter((slot) => slot >= "13:00");

function nameOf(patients: Patient[], id: string) {
  return patients.find((patient) => patient.id === id)?.fullName ?? "Paciente";
}

export function Board({
  date,
  today,
  role,
  patients,
  visits,
  onOpenVisit,
  onCreate,
  onIntake,
  onMorning,
}: {
  date: string;
  today: string;
  role: Role;
  patients: Patient[];
  visits: Visit[];
  onOpenVisit: (id: string) => void;
  onCreate: (doctorId: DoctorId, time: string) => void;
  onIntake: () => void;
  onMorning: () => void;
}) {
  const [forcedDate, setForcedDate] = useState<string | null>(null);
  const forceSunday = forcedDate === date;
  const [doctorTab, setDoctorTab] = useState<DoctorId>(role === "miguel" ? "miguel" : "judith");
  const dayVisits = visits.filter((visit) => visit.date === date);
  const doctors =
    role === "judith"
      ? DOCTORS.filter((doctor) => doctor.id === "judith")
      : role === "miguel"
        ? DOCTORS.filter((doctor) => doctor.id === "miguel")
        : DOCTORS;
  const pending = dayVisits.filter(needsMorningPing);
  const confirmed = dayVisits.filter((visit) =>
    ["confirmada", "en_sala", "en_atencion", "atendida"].includes(visit.status) && visit.time,
  ).length;
  const requests = dayVisits.filter(
    (visit) => !visit.time && (visit.status === "solicitud" || visit.status === "reprogramada" || visit.status === "no_show"),
  );
  const closedSunday = isSunday(date) && dayVisits.length === 0 && !forceSunday;
  const showGrid =
    !closedSunday &&
    (!isSunday(date) || forceSunday) &&
    (date >= today || dayVisits.some(occupiesSlot) || forceSunday);
  const libro = dayVisits.filter((visit) => visit.source === "libro" && !occupiesSlot(visit));

  return (
    <div className="space-y-5">
      <div className="stat-grid grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Confirmadas" value={confirmed} tone="bg-moss-soft text-moss" />
        <Stat label="Sin confirmar" value={pending.length} tone="bg-alert-soft text-alert" />
        <Stat label="Por ubicar" value={requests.length} tone="bg-gold-soft text-gold-deep" />
        <Stat
          label="En agenda"
          value={dayVisits.filter(occupiesSlot).length}
          tone="bg-paper text-ink"
        />
      </div>

      {pending.length > 0 ? (
        <div className="rounded-2xl border border-line bg-paper px-4 py-4">
          <p className="font-medium">Faltan {pending.length} confirmaciones</p>
          <p className="mt-1 text-sm text-muted">
            Sin el aviso de la mañana no se puede rearmar el horario del doctor.
          </p>
          <div className="mt-3">
            <Btn onClick={onMorning}>Avisar por WhatsApp</Btn>
          </div>
        </div>
      ) : null}

      {requests.length > 0 ? (
        <section>
          <div className="mb-2 flex items-center justify-between gap-3">
            <h2 className="font-medium">Llegaron por WhatsApp</h2>
            <button type="button" className="text-sm text-gold-deep" onClick={onIntake}>
              Nueva solicitud
            </button>
          </div>
          <ul className="space-y-2">
            {requests.map((visit) => (
              <li key={visit.id}>
                <button
                  type="button"
                  onClick={() => onOpenVisit(visit.id)}
                  className="row-hit w-full rounded-2xl border border-line bg-paper px-3 py-3 text-left shadow-card"
                >
                  <span className="flex items-start justify-between gap-2">
                    <span className="font-medium">{nameOf(patients, visit.patientId)}</span>
                    <Pill tone={statusTone(visit.status)}>{STATUS_LABEL[visit.status]}</Pill>
                  </span>
                  <span className="mt-1 block text-sm text-muted">
                    {doctorById(visit.doctorId).short} · {visit.treatment}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <div className="flex justify-end">
          <button type="button" className="text-sm text-gold-deep" onClick={onIntake}>
            Anotar solicitud de WhatsApp
          </button>
        </div>
      )}

      {closedSunday ? (
        <div className="rounded-2xl border border-line bg-paper px-4 py-8 text-center">
          <p className="font-display text-2xl">Domingo sin atención</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
            El consultorio atiende de lunes a sábado, de 10:00 a. m. a 12:00 p. m. y de 5:00 p. m. a 7:30 p. m.
          </p>
          <div className="mt-4">
            <Btn tone="paper" onClick={() => setForcedDate(date)}>
              Abrir un hueco de emergencia
            </Btn>
          </div>
        </div>
      ) : null}

      {showGrid ? (
        <div>
          {doctors.length > 1 ? (
            <div className="mb-3 grid grid-cols-2 gap-2 md:hidden">
              {doctors.map((doctor) => (
                <button
                  key={doctor.id}
                  type="button"
                  onClick={() => setDoctorTab(doctor.id)}
                  className={cn(
                    "h-11 rounded-full text-sm font-medium",
                    doctorTab === doctor.id ? "bg-ink text-paper" : "border border-line bg-paper text-muted",
                  )}
                >
                  {doctor.short}
                </button>
              ))}
            </div>
          ) : null}
          <div className={cn("grid gap-4", doctors.length > 1 && "md:grid-cols-2")}>
            {doctors.map((doctor) => (
              <section
                key={doctor.id}
                className={cn(doctors.length > 1 && doctor.id !== doctorTab && "hidden md:block", "min-w-0")}
              >
                <header className="mb-3">
                  <h2 className="font-display text-2xl leading-none">{doctor.short}</h2>
                  <p className="mt-1 text-sm text-muted">
                    {doctor.name} · {doctor.focus}
                  </p>
                </header>
                <SlotGroup
                  label="Mañana"
                  slots={MORNING}
                  doctorId={doctor.id}
                  date={date}
                  visits={dayVisits}
                  patients={patients}
                  onOpenVisit={onOpenVisit}
                  onCreate={onCreate}
                />
                <SlotGroup
                  label="Tarde"
                  slots={AFTERNOON}
                  doctorId={doctor.id}
                  date={date}
                  visits={dayVisits}
                  patients={patients}
                  onOpenVisit={onOpenVisit}
                  onCreate={onCreate}
                />
              </section>
            ))}
          </div>
          <p className="mt-3 text-sm text-muted">Horario fijo cada 30 minutos. Toca un hueco libre para agendar.</p>
        </div>
      ) : null}

      {libro.length > 0 ? (
        <section>
          <h2 className="font-display text-2xl">Libro del día</h2>
          <p className="mb-3 mt-1 text-sm text-muted">Así quedó registrado, como en el Excel.</p>
          {DOCTORS.map((doctor) => {
            const rows = libro.filter((visit) => visit.doctorId === doctor.id);
            if (!rows.length) return null;
            return (
              <div key={doctor.id} className="mb-4">
                <h3 className="mb-1 text-sm font-medium text-gold-deep">{doctor.short}</h3>
                <ul className="overflow-hidden rounded-2xl border border-line bg-paper">
                  {rows.map((visit) => {
                    const charge = chargeText(visit);
                    return (
                      <li key={visit.id} className="border-b border-line last:border-b-0">
                        <button
                          type="button"
                          onClick={() => onOpenVisit(visit.id)}
                          className="row-hit w-full px-3 py-3 text-left"
                        >
                          <span className="flex items-start justify-between gap-3">
                            <span className="font-medium">{nameOf(patients, visit.patientId)}</span>
                            <span
                              className={cn(
                                "shrink-0 text-sm font-medium tabular-nums",
                                charge.tone === "moss" && "text-moss",
                                charge.tone === "alert" && "text-alert",
                                charge.tone === "gold" && "text-gold-deep",
                                charge.tone === "muted" && "text-muted",
                              )}
                            >
                              {charge.text}
                            </span>
                          </span>
                          <span className="mt-1 block text-sm text-muted">{visit.treatment}</span>
                          <span className="mt-1 block text-xs text-muted">
                            {visit.payments.length
                              ? visit.payments
                                  .map((payment) => payment.method)
                                  .filter((method, index, all) => all.indexOf(method) === index)
                                  .join(" · ")
                              : visit.noCharge
                                ? "Sin cargo"
                                : "Revisar monto"}
                            {visit.monthTag ? ` · Mes ${visit.monthTag.toLowerCase()}` : ""}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </section>
      ) : null}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className={cn("card-hover rounded-2xl border border-line px-3.5 py-3 shadow-card transition-all", tone)}>
      <p className="font-display text-3xl leading-none">{value}</p>
      <p className="mt-1 text-xs font-medium">{label}</p>
    </div>
  );
}

function SlotGroup({
  label,
  slots,
  doctorId,
  date,
  visits,
  patients,
  onOpenVisit,
  onCreate,
}: {
  label: string;
  slots: readonly string[];
  doctorId: DoctorId;
  date: string;
  visits: Visit[];
  patients: Patient[];
  onOpenVisit: (id: string) => void;
  onCreate: (doctorId: DoctorId, time: string) => void;
}) {
  return (
    <div className="mb-4">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <ul className="space-y-2">
        {slots.map((time) => {
          const visit = visits.find(
            (item) => item.doctorId === doctorId && item.date === date && item.time === time && occupiesSlot(item),
          );
          return (
            <li key={time} className="flex items-stretch gap-2">
              <div className="w-16 shrink-0 pt-2 text-sm tabular-nums text-muted">
                <span className="block font-medium text-ink">{formatTime(time).replace(" a. m.", "").replace(" p. m.", "")}</span>
                <span className="text-xs">{time < "13:00" ? "a. m." : "p. m."}</span>
              </div>
              {visit ? (
                <button
                  type="button"
                  onClick={() => onOpenVisit(visit.id)}
                  className={cn(
                    "slot-card card-hover min-h-[50px] min-w-0 flex-1 rounded-2xl border border-line border-l-4 bg-paper px-3 py-2.5 text-left shadow-card",
                    slotAccent(visit.status),
                  )}
                >
                  <span className="flex items-start justify-between gap-2">
                    <span className="font-medium leading-tight">{nameOf(patients, visit.patientId)}</span>
                    <Pill tone={statusTone(visit.status)}>{STATUS_LABEL[visit.status]}</Pill>
                  </span>
                  <span className="mt-1 block text-sm text-muted">{visit.treatment}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onCreate(doctorId, time)}
                  className="slot-card card-hover min-h-14 min-w-0 flex-1 rounded-2xl border border-dashed border-line bg-paper/50 px-3 text-left text-sm text-muted hover:border-gold hover:bg-paper"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-gold-deep">+</span>
                    Libre
                  </span>
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function chargeText(visit: Visit) {
  const total = visit.payments.reduce((sum, payment) => sum + payment.amount, 0);
  if (total > 0) return { text: soles(total), tone: "moss" as const };
  if (visit.noCharge) return { text: "Sin cargo", tone: "muted" as const };
  if (visit.source === "libro") return { text: "Sin monto", tone: "gold" as const };
  if (visit.status === "atendida") return { text: "Falta cobro", tone: "alert" as const };
  return { text: "Sin cobro", tone: "muted" as const };
}
