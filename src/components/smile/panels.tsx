import { useEffect, useState } from "react";
import { previewPathPrefix } from "@/lib/preview-path-prefix";
import { cpeNumber, openReceipt } from "@/lib/smile/cpe";
import {
  DOCTORS,
  METHODS,
  METHOD_LABEL,
  MONTHS,
  QUICK_AMOUNTS,
  SLOTS,
  STATUS_LABEL,
  TREATMENTS,
  doctorById,
  formatDay,
  formatTime,
  needsMorningPing,
  nextStep,
  occupiesSlot,
  parseAmount,
  prettyPhone,
  reminderText,
  soles,
  statusTone,
  sumVisit,
  waHref,
  type DoctorId,
  type Patient,
  type PayMethod,
  type Visit,
  type VisitStatus,
} from "@/lib/smile/model";
import { useSmileStore } from "@/lib/smile/store";
import { sendCitaWhatsApp, clearWhatsAppConnection, saveWhatsAppConnection, testWhatsAppConnection, whatsappStatus, whatsappWebhookInfo } from "@/lib/smile/whatsapp";
import { applyPastedWhatsApp } from "@/lib/smile/apply-lead";
import { Btn, Field, Pill, Sheet, inputClass } from "./ui";

export type Panel =
  | { kind: "visit"; id: string }
  | { kind: "patient"; id: string }
  | { kind: "create"; date: string; time: string; doctorId: DoctorId }
  | { kind: "intake"; date: string }
  | { kind: "morning"; date: string }
  | { kind: "new-patient" }
  | { kind: "meta" };

function doctorLabel(id: DoctorId) {
  return id === "miguel" ? "el Dr. Miguel" : "la Dra. Judith";
}

async function avisarCita(patient: Patient, visit: Visit) {
  return sendCitaWhatsApp({
    data: {
      patientName: patient.fullName,
      phone: patient.phone,
      dateLabel: formatDay(visit.date),
      timeLabel: visit.time ? formatTime(visit.time) : "por confirmar",
      doctorLabel: doctorLabel(visit.doctorId),
    },
  });
}

function confirmUrl(id: string) {
  if (typeof window === "undefined") return "";
  const prefix = previewPathPrefix(window.location.hostname, window.location.pathname) ?? "";
  return `${window.location.origin}${prefix}/c/${id}`;
}

export function Panels({
  panel,
  onClose,
  onOpenPatient,
  onOpenVisit,
}: {
  panel: Panel | null;
  onClose: () => void;
  onOpenPatient: (id: string) => void;
  onOpenVisit: (id: string) => void;
}) {
  if (!panel) return null;
  if (panel.kind === "visit") return <VisitSheet key={panel.id} id={panel.id} onClose={onClose} onOpenPatient={onOpenPatient} />;
  if (panel.kind === "patient") return <PatientSheet key={panel.id} id={panel.id} onClose={onClose} onOpenVisit={onOpenVisit} />;
  if (panel.kind === "new-patient") return <PatientSheet id={null} onClose={onClose} onOpenVisit={onOpenVisit} />;
  if (panel.kind === "create") {
    return <CreateSheet date={panel.date} time={panel.time} doctorId={panel.doctorId} onClose={onClose} onOpen={onOpenVisit} />;
  }
  if (panel.kind === "intake") return <IntakeSheet date={panel.date} onClose={onClose} onOpen={onOpenVisit} />;
  if (panel.kind === "meta") return <MetaSheet onClose={onClose} />;
  return <MorningSheet date={panel.date} onClose={onClose} onOpen={onOpenVisit} />;
}

function VisitSheet({
  id,
  onClose,
  onOpenPatient,
}: {
  id: string;
  onClose: () => void;
  onOpenPatient: (id: string) => void;
}) {
  const visit = useSmileStore((state) => state.visits.find((item) => item.id === id));
  const patient = useSmileStore((state) => state.patients.find((item) => item.id === visit?.patientId));
  const locked = useSmileStore((state) => Boolean(state.closes[visit?.date ?? ""]?.closedAt));
  const moveVisit = useSmileStore((state) => state.moveVisit);
  const patchVisit = useSmileStore((state) => state.patchVisit);
  const addPayment = useSmileStore((state) => state.addPayment);
  const removePayment = useSmileStore((state) => state.removePayment);
  const removeVisit = useSmileStore((state) => state.removeVisit);
  const [treatment, setTreatment] = useState(visit?.treatment ?? "");
  const [monthTag, setMonthTag] = useState(visit?.monthTag ?? "");
  const [note, setNote] = useState(visit?.note ?? "");
  const [noCharge, setNoCharge] = useState(visit?.noCharge ?? false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [waBusy, setWaBusy] = useState(false);
  const [waNote, setWaNote] = useState("");
  const [askDelete, setAskDelete] = useState(false);
  const [method, setMethod] = useState<PayMethod>("efectivo");
  const [amount, setAmount] = useState("");
  const [operation, setOperation] = useState("");
  const [payNote, setPayNote] = useState("");
  const [seen, setSeen] = useState(false);
  const [evidence, setEvidence] = useState<string | undefined>();
  const [docDni, setDocDni] = useState(patient?.dni ?? "");
  const [docRuc, setDocRuc] = useState("");
  const comprobantes = useSmileStore((state) => state.comprobantes);
  const emisor = useSmileStore((state) => state.emisor);
  const issueComprobante = useSmileStore((state) => state.issueComprobante);
  const voidComprobante = useSmileStore((state) => state.voidComprobante);

  if (!visit || !patient) {
    return (
      <Sheet title="Cita" onClose={onClose}>
        <p className="text-sm text-muted">Esta cita ya no está en el libro.</p>
      </Sheet>
    );
  }

  const doctor = doctorById(visit.doctorId);
  const step = nextStep(visit.status);
  const message = reminderText(patient, visit, confirmUrl(visit.id));
  const href = waHref(patient.phone, message);

  const apply = (patch: Partial<Pick<Visit, "time" | "date" | "doctorId" | "status">>) => {
    const result = moveVisit(visit.id, patch);
    setError(result.ok ? "" : result.reason);
  };

  return (
    <Sheet
      title={patient.fullName}
      subtitle={`${doctor.short} · ${formatDay(visit.date)}${visit.time ? ` · ${formatTime(visit.time)}` : ""}`}
      onClose={onClose}
      footer={
        step && !locked ? (
          <Btn full onClick={() => apply({ status: step.status })}>
            {step.label}
          </Btn>
        ) : null
      }
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <Pill tone={statusTone(visit.status)}>{STATUS_LABEL[visit.status]}</Pill>
          {visit.monthTag ? <Pill tone="gold">Mes {visit.monthTag}</Pill> : null}
          {locked ? <Pill tone="ink">Día cerrado</Pill> : null}
        </div>

        <div className="flex flex-wrap gap-2">
          {DOCTORS.map((item) => (
            <button
              key={item.id}
              type="button"
              disabled={locked}
              onClick={() => apply({ doctorId: item.id })}
              className={
                item.id === visit.doctorId
                  ? "h-11 rounded-full bg-ink px-4 text-sm text-paper"
                  : "h-11 rounded-full border border-line px-4 text-sm"
              }
            >
              {item.short}
            </button>
          ))}
        </div>

        <Field label="Estado">
          <select
            className={inputClass}
            disabled={locked}
            value={visit.status}
            onChange={(event) => apply({ status: event.target.value as VisitStatus })}
          >
            {(Object.keys(STATUS_LABEL) as VisitStatus[]).map((status) => (
              <option key={status} value={status}>
                {STATUS_LABEL[status]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Fecha">
          <input
            type="date"
            className={inputClass}
            disabled={locked}
            value={visit.date}
            onChange={(event) => apply({ date: event.target.value })}
          />
        </Field>
        <Field label="Horario">
          <select
            className={inputClass}
            disabled={locked}
            value={visit.time ?? ""}
            onChange={(event) => {
              const time = event.target.value;
              if (!time) {
                apply({ time: null, status: visit.status === "agendada" ? "solicitud" : visit.status });
                return;
              }
              apply({
                time,
                status: visit.status === "solicitud" || visit.status === "reprogramada" ? "agendada" : visit.status,
              });
            }}
          >
            <option value="">Sin hora</option>
            {SLOTS.map((slot) => (
              <option key={slot} value={slot}>
                {formatTime(slot)}
              </option>
            ))}
          </select>
        </Field>
        {error ? <p className="text-sm text-alert">{error}</p> : null}

        <div className="flex flex-wrap gap-2">
          <Btn
            tone="moss"
            disabled={waBusy}
            onClick={() => {
              setWaBusy(true);
              setWaNote("");
              void avisarCita(patient, visit).then((result) => {
                setWaBusy(false);
                setWaNote(result.message);
                if (result.ok && (visit.status === "agendada" || visit.status === "solicitud")) {
                  apply({ status: "recordatorio" });
                }
              });
            }}
          >
            {waBusy ? "Enviando…" : "Avisar por WhatsApp"}
          </Btn>
          {href ? (
            <Btn tone="paper" onClick={() => window.open(href, "_blank", "noopener,noreferrer")}>
              Abrir chat
            </Btn>
          ) : null}
          <Btn
            tone="paper"
            onClick={() => {
              void navigator.clipboard.writeText(message).then(() => setCopied(true)).catch(() => setCopied(false));
            }}
          >
            {copied ? "Mensaje copiado" : "Copiar mensaje"}
          </Btn>
          <Btn tone="paper" onClick={() => onOpenPatient(patient.id)}>
            Ficha
          </Btn>
        </div>
        {waNote ? <p className="text-sm text-muted">{waNote}</p> : null}

        <div className="space-y-3 rounded-2xl bg-cream p-3">
          <Field label="Tratamiento">
            <textarea className="min-h-20 w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm" value={treatment} onChange={(event) => setTreatment(event.target.value)} />
          </Field>
          <div className="flex flex-wrap gap-2">
            {TREATMENTS.map((item) => (
              <button key={item} type="button" className="rounded-full border border-line bg-paper px-3 py-2 text-xs" onClick={() => setTreatment(item)}>
                {item}
              </button>
            ))}
          </div>
          <Field label="Mes de ortodoncia">
            <select className={inputClass} value={monthTag} onChange={(event) => setMonthTag(event.target.value)}>
              <option value="">No aplica</option>
              {MONTHS.map((month) => (
                <option key={month}>{month}</option>
              ))}
            </select>
          </Field>
          <Field label="Nota">
            <textarea className="min-h-16 w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm" value={note} onChange={(event) => setNote(event.target.value)} />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={noCharge} onChange={(event) => setNoCharge(event.target.checked)} />
            Esta atención no se cobra
          </label>
          <Btn
            tone="paper"
            onClick={() => patchVisit(visit.id, { treatment: treatment.trim() || visit.treatment, monthTag, note, noCharge })}
          >
            Guardar datos
          </Btn>
        </div>

        <section>
          <div className="mb-2 flex items-baseline justify-between">
            <h3 className="font-display text-2xl">Cobro</h3>
            <p className="text-sm font-medium tabular-nums">{soles(sumVisit(visit))}</p>
          </div>
          <ul className="space-y-2">
            {visit.payments.map((payment) => {
              const missing = payment.method !== "efectivo" && (!payment.hasEvidence || !payment.operation);
              return (
                <li key={payment.id} className="rounded-2xl border border-line px-3 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">
                        {METHOD_LABEL[payment.method]} · {soles(payment.amount)}
                      </p>
                      <p className="text-sm text-muted">
                        {payment.operation ? `Op. ${payment.operation}` : "Sin número de operación"}
                        {payment.note ? ` · ${payment.note}` : ""}
                      </p>
                      {missing ? <p className="text-sm text-alert">Falta evidencia para cuadrar.</p> : <p className="text-sm text-moss">Evidencia lista</p>}
                    </div>
                    {!locked ? (
                      <button
                        type="button"
                        className="text-sm text-alert"
                        onClick={() => {
                          const message = removePayment(visit.id, payment.id);
                          if (message) setError(message);
                        }}
                      >
                        Quitar
                      </button>
                    ) : null}
                  </div>
                  {payment.evidence ? <img src={payment.evidence} alt="Comprobante" className="mt-2 max-h-40 w-full rounded-xl object-cover" /> : null}
                </li>
              );
            })}
          </ul>

          {!locked ? (
            <form
              className="mt-3 space-y-3"
              onSubmit={(event) => {
                event.preventDefault();
                const value = parseAmount(amount);
                if (value <= 0) {
                  setError("Escribe el monto cobrado.");
                  return;
                }
                if (method !== "efectivo" && (!seen || !operation.trim())) {
                  setError("Yape, Plin y POS necesitan el número de operación y marcar el comprobante.");
                  return;
                }
                addPayment(visit.id, {
                  method,
                  amount: value,
                  operation: operation.trim(),
                  note: payNote.trim(),
                  hasEvidence: method === "efectivo" || seen,
                  evidence,
                });
                setAmount("");
                setOperation("");
                setPayNote("");
                setSeen(false);
                setEvidence(undefined);
                setError("");
              }}
            >
              <div className="grid grid-cols-2 gap-2">
                {METHODS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setMethod(item)}
                    className={item === method ? "h-11 rounded-full bg-ink text-sm text-paper" : "h-11 rounded-full border border-line text-sm"}
                  >
                    {METHOD_LABEL[item]}
                  </button>
                ))}
              </div>
              <Field label="Monto">
                <input className={inputClass} inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0" />
              </Field>
              <div className="flex flex-wrap gap-2">
                {QUICK_AMOUNTS.map((value) => (
                  <button key={value} type="button" className="rounded-full bg-gold-soft px-3 py-2 text-sm text-gold-deep" onClick={() => setAmount(String(value))}>
                    {value}
                  </button>
                ))}
              </div>
              {method !== "efectivo" ? (
                <>
                  <Field label="Número de operación">
                    <input className={inputClass} value={operation} onChange={(event) => setOperation(event.target.value)} />
                  </Field>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={seen} onChange={(event) => setSeen(event.target.checked)} />
                    Vi el comprobante
                  </label>
                  <label className="block text-sm text-muted">
                    Foto del voucher
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="mt-1 block w-full text-sm"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        void shrinkImage(file).then((url) => {
                          setSeen(true);
                          if (url && url.length < 180000) {
                            setEvidence(url);
                          } else {
                            setError("La imagen es muy pesada. Intenta con otra foto.");
                          }
                        });
                      }}
                    />
                  </label>
                  {evidence ? (
                    <div className="flex items-center justify-between rounded-xl bg-moss-soft p-2 text-xs text-moss">
                      <span className="font-medium">✓ Comprobante adjunto correctamente</span>
                      <img src={evidence} alt="Preview" className="size-8 rounded object-cover" />
                    </div>
                  ) : null}
                </>
              ) : null}
              <Field label="Nota del pago">
                <input className={inputClass} value={payNote} onChange={(event) => setPayNote(event.target.value)} placeholder="A cuenta, mes, vuelto…" />
              </Field>
              <Btn type="submit">Registrar cobro</Btn>
            </form>
          ) : (
            <p className="mt-3 text-sm text-muted">El día está cerrado. Reábrelo desde Caja si hay que corregir.</p>
          )}
        </section>

        <section className="rounded-2xl border border-line bg-cream px-3 py-3">
          <h3 className="font-display text-2xl">Boleta o factura</h3>
          <p className="mt-1 text-sm text-muted">
            Documenta lo ya cobrado. El total no cambia y esto no se envía a SUNAT.
          </p>
          {visit.payments.length === 0 || visit.noCharge ? (
            <p className="mt-2 text-sm text-muted">Primero registra el cobro.</p>
          ) : (
            <div className="mt-3 space-y-2">
              <Field label="Nombre">
                <input className={inputClass} value={patient?.fullName ?? ""} readOnly />
              </Field>
              <Field label="DNI, para boleta">
                <input className={inputClass} inputMode="numeric" value={docDni} onChange={(event) => setDocDni(event.target.value)} placeholder="8 dígitos" />
              </Field>
              <Field label="RUC, solo si es factura">
                <input className={inputClass} inputMode="numeric" value={docRuc} onChange={(event) => setDocRuc(event.target.value)} placeholder="11 dígitos" />
              </Field>
              <Btn
                type="button"
                onClick={() => {
                  const result = issueComprobante(visit.id, {
                    nombre: patient?.fullName ?? "",
                    dni: docDni,
                    ruc: docRuc,
                  });
                  if (!result.ok) {
                    setError(result.reason);
                    return;
                  }
                  setError("");
                  const issued = useSmileStore.getState().comprobantes.find((item) => item.id === result.id);
                  if (issued) openReceipt(issued, useSmileStore.getState().emisor);
                }}
              >
                Emitir comprobante
              </Btn>
            </div>
          )}
          <ul className="mt-3 space-y-2">
            {comprobantes
              .filter((item) => item.visitId === visit.id)
              .map((item) => (
                <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span>
                    {item.tipo === "01" ? "Factura" : "Boleta"} {item.serie}-{cpeNumber(item.numero)} · {soles(item.total)}
                    {item.status === "anulado" ? " · anulada" : " · interna"}
                  </span>
                  <span className="flex gap-2">
                    <button type="button" className="text-gold-deep" onClick={() => openReceipt(item, emisor)}>
                      Ver
                    </button>
                    {item.status === "local" ? (
                      <button
                        type="button"
                        className="text-alert"
                        onClick={() => {
                          const message = voidComprobante(item.id);
                          if (message) setError(message);
                        }}
                      >
                        Anular
                      </button>
                    ) : null}
                  </span>
                </li>
              ))}
          </ul>
        </section>

        <div>
          {askDelete ? (
            <div className="flex gap-2">
              <Btn
                tone="alert"
                onClick={() => {
                  removeVisit(visit.id);
                  onClose();
                }}
              >
                Sí, quitar
              </Btn>
              <Btn tone="paper" onClick={() => setAskDelete(false)}>
                Cancelar
              </Btn>
            </div>
          ) : (
            <button type="button" className="text-sm text-muted" onClick={() => setAskDelete(true)}>
              Quitar de la agenda
            </button>
          )}
        </div>
      </div>
    </Sheet>
  );
}

function CreateSheet({
  date,
  time,
  doctorId,
  onClose,
  onOpen,
}: {
  date: string;
  time: string;
  doctorId: DoctorId;
  onClose: () => void;
  onOpen: (id: string) => void;
}) {
  return (
    <BookingSheet
      title="Nueva cita"
      subtitle={`${doctorById(doctorId).short} · ${formatDay(date)} · ${formatTime(time)}`}
      date={date}
      time={time}
      doctorId={doctorId}
      source="mostrador"
      status="agendada"
      onClose={onClose}
      onOpen={onOpen}
    />
  );
}

function IntakeSheet({ date, onClose, onOpen }: { date: string; onClose: () => void; onOpen: (id: string) => void }) {
  return (
    <BookingSheet
      title="Solicitud de WhatsApp"
      subtitle={formatDay(date)}
      date={date}
      time={null}
      doctorId="judith"
      source="whatsapp"
      status="solicitud"
      onClose={onClose}
      onOpen={onOpen}
    />
  );
}

function BookingSheet({
  title,
  subtitle,
  date,
  time,
  doctorId,
  source,
  status,
  onClose,
  onOpen,
}: {
  title: string;
  subtitle: string;
  date: string;
  time: string | null;
  doctorId: DoctorId;
  source: Visit["source"];
  status: VisitStatus;
  onClose: () => void;
  onOpen: (id: string) => void;
}) {
  const patients = useSmileStore((state) => state.patients);
  const visits = useSmileStore((state) => state.visits);
  const createPatient = useSmileStore((state) => state.createPatient);
  const savePatient = useSmileStore((state) => state.savePatient);
  const addVisit = useSmileStore((state) => state.addVisit);
  const [doctor, setDoctor] = useState<DoctorId>(doctorId);
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<Patient | null>(null);
  const [phone, setPhone] = useState("");
  const [dni, setDni] = useState("");
  const [age, setAge] = useState("");
  const [address, setAddress] = useState("");
  const [treatment, setTreatment] = useState(doctorId === "miguel" ? "Sesión de endodoncia" : "Consulta");
  const [error, setError] = useState("");
  const matches =
    query.trim().length < 2
      ? []
      : patients
          .filter((patient) => patient.fullName.toLowerCase().includes(query.trim().toLowerCase()) || patient.phone.includes(query.replace(/\D/g, "")))
          .slice(0, 5);

  return (
    <Sheet title={title} subtitle={subtitle} onClose={onClose}>
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          const name = (picked?.fullName || query).trim();
          if (name.length < 3) {
            setError("Escribe el nombre del paciente.");
            return;
          }
          if (time) {
            const clash = visits.some(
              (visit) => visit.date === date && visit.time === time && visit.doctorId === doctor && occupiesSlot(visit),
            );
            if (clash) {
              setError("Ese horario ya está ocupado.");
              return;
            }
          }
          const patientId = picked
            ? picked.id
            : createPatient({
                fullName: name,
                phone: phone.trim(),
                dni: dni.trim(),
                age: age.trim(),
                address: address.trim(),
              });
          if (picked) {
            savePatient({
              ...picked,
              phone: phone.trim() || picked.phone,
              dni: dni.trim() || picked.dni,
              age: age.trim() || picked.age,
              address: address.trim() || picked.address,
            });
          }
          const id = addVisit({
            patientId,
            doctorId: doctor,
            date,
            time,
            treatment: treatment.trim() || "Consulta",
            status,
            payments: [],
            monthTag: "",
            note: "",
            source,
            noCharge: false,
          });
          onOpen(id);
        }}
      >
        <div className="flex gap-2">
          {DOCTORS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setDoctor(item.id)}
              className={item.id === doctor ? "h-11 flex-1 rounded-full bg-ink text-sm text-paper" : "h-11 flex-1 rounded-full border border-line text-sm"}
            >
              {item.short}
            </button>
          ))}
        </div>
        <Field label="Paciente">
          <input
            className={inputClass}
            value={picked ? picked.fullName : query}
            onChange={(event) => {
              setPicked(null);
              setQuery(event.target.value);
            }}
            placeholder="Apellidos y nombres"
          />
        </Field>
        {picked ? (
          <div className="flex items-center justify-between rounded-xl bg-moss-soft px-3 py-1.5 text-xs text-moss">
            <span className="font-medium">✓ Paciente existente seleccionado</span>
            <button
              type="button"
              onClick={() => {
                setPicked(null);
                setQuery("");
              }}
              className="text-ink underline hover:text-alert"
            >
              Cambiar
            </button>
          </div>
        ) : null}
        {!picked && matches.length > 0 ? (
          <ul className="overflow-hidden rounded-xl border border-line">
            {matches.map((patient) => (
              <li key={patient.id}>
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm"
                  onClick={() => {
                    setPicked(patient);
                    setPhone(patient.phone);
                    setDni(patient.dni);
                    setAge(patient.age);
                    setAddress(patient.address);
                  }}
                >
                  {patient.fullName}
                  <span className="block text-muted">{patient.phone ? prettyPhone(patient.phone) : "Sin celular"}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        <div className="grid grid-cols-2 gap-2">
          <Field label="Celular">
            <input className={inputClass} value={phone} onChange={(event) => setPhone(event.target.value)} />
          </Field>
          <Field label="DNI">
            <input className={inputClass} value={dni} onChange={(event) => setDni(event.target.value)} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Edad">
            <input className={inputClass} value={age} onChange={(event) => setAge(event.target.value)} />
          </Field>
          <Field label="Dirección">
            <input className={inputClass} value={address} onChange={(event) => setAddress(event.target.value)} />
          </Field>
        </div>
        <Field label="Tratamiento">
          <input className={inputClass} value={treatment} onChange={(event) => setTreatment(event.target.value)} />
        </Field>
        <div className="flex flex-wrap gap-2">
          {TREATMENTS.map((item) => (
            <button key={item} type="button" className="rounded-full border border-line px-3 py-2 text-xs" onClick={() => setTreatment(item)}>
              {item}
            </button>
          ))}
        </div>
        {error ? <p className="text-sm text-alert">{error}</p> : null}
        <Btn type="submit" full>
          Guardar
        </Btn>
      </form>
    </Sheet>
  );
}

function PatientSheet({
  id,
  onClose,
  onOpenVisit,
}: {
  id: string | null;
  onClose: () => void;
  onOpenVisit: (id: string) => void;
}) {
  const existing = useSmileStore((state) => state.patients.find((patient) => patient.id === id));
  const allVisits = useSmileStore((state) => state.visits);
  const allDebts = useSmileStore((state) => state.debts);
  const visits = allVisits.filter((visit) => visit.patientId === id);
  const debts = allDebts.filter((debt) => debt.patientId === id);
  const savePatient = useSmileStore((state) => state.savePatient);
  const createPatient = useSmileStore((state) => state.createPatient);
  const [fullName, setFullName] = useState(existing?.fullName ?? "");
  const [age, setAge] = useState(existing?.age ?? "");
  const [dni, setDni] = useState(existing?.dni ?? "");
  const [phone, setPhone] = useState(existing?.phone ?? "");
  const [address, setAddress] = useState(existing?.address ?? "");
  const [localId, setLocalId] = useState<string | null>(id);
  const [saved, setSaved] = useState(false);

  const history = [...visits].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : (b.time ?? "").localeCompare(a.time ?? "")));

  return (
    <Sheet title={id ? fullName || "Paciente" : "Nuevo paciente"} subtitle={id ? "Ficha del libro" : "Se guarda en este dispositivo"} onClose={onClose}>
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (fullName.trim().length < 3) return;
          if (existing) {
            savePatient({ ...existing, fullName: fullName.trim(), age, dni, phone, address });
          } else if (localId) {
            savePatient({ id: localId, fullName: fullName.trim(), age, dni, phone, address });
          } else {
            setLocalId(createPatient({ fullName: fullName.trim(), age, dni, phone, address }));
          }
          setSaved(true);
        }}
      >
        <Field label="Apellidos y nombres">
          <input className={inputClass} value={fullName} onChange={(event) => setFullName(event.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Edad">
            <input className={inputClass} value={age} onChange={(event) => setAge(event.target.value)} />
          </Field>
          <Field label="DNI">
            <input className={inputClass} value={dni} onChange={(event) => setDni(event.target.value)} />
          </Field>
        </div>
        <Field label="Celular">
          <input className={inputClass} value={phone} onChange={(event) => setPhone(event.target.value)} />
        </Field>
        <Field label="Dirección">
          <input className={inputClass} value={address} onChange={(event) => setAddress(event.target.value)} />
        </Field>
        <Btn type="submit">{saved ? "Guardado" : "Guardar ficha"}</Btn>
      </form>
      {debts.length > 0 ? (
        <ul className="mt-4 space-y-1 text-sm">
          {debts.map((debt) => (
            <li key={debt.id} className={debt.status === "pendiente" ? "text-alert" : "text-moss"}>
              {debt.concept}: {soles(debt.amount)} · {debt.status}
            </li>
          ))}
        </ul>
      ) : null}
      {history.length > 0 ? (
        <ul className="mt-4 divide-y divide-line">
          {history.map((visit) => (
            <li key={visit.id}>
              <button type="button" className="w-full py-3 text-left" onClick={() => onOpenVisit(visit.id)}>
                <span className="flex justify-between gap-2 text-sm">
                  <span>{formatDay(visit.date)}</span>
                  <span className="tabular-nums">{soles(sumVisit(visit))}</span>
                </span>
                <span className="block text-sm text-muted">
                  {doctorById(visit.doctorId).short} · {visit.treatment}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </Sheet>
  );
}

function MetaSheet({ onClose }: { onClose: () => void }) {
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [token, setToken] = useState("");
  const [note, setNote] = useState("");
  const [configured, setConfigured] = useState(false);
  const [busy, setBusy] = useState(false);
  const [verifyToken, setVerifyToken] = useState("");
  const [pasted, setPasted] = useState("");

  useEffect(() => {
    void whatsappStatus().then((status) => setConfigured(status.configured));
    void whatsappWebhookInfo().then((info) => setVerifyToken(info.verifyToken));
  }, []);

  return (
    <Sheet title="WhatsApp de Meta" subtitle="Avisos automáticos de citas" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-muted">
          {configured
            ? "Conectado en modo prueba. Cada aviso llega al 928 544 342, no al paciente."
            : "Pega el Phone number ID y el token del usuario del sistema. No se vuelven a mostrar y no salen de este servidor."}
        </p>
        <Field label="Phone number ID">
          <input
            className={inputClass}
            inputMode="numeric"
            autoComplete="off"
            value={phoneNumberId}
            onChange={(event) => setPhoneNumberId(event.target.value)}
            placeholder="El número largo de API Setup"
          />
        </Field>
        <Field label="Token">
          <input
            className={inputClass}
            type="password"
            autoComplete="off"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            placeholder="Token permanente, no el de 24 horas"
          />
        </Field>
        <div className="flex flex-wrap gap-2">
          <Btn
            disabled={busy}
            onClick={() => {
              setBusy(true);
              setNote("");
              void saveWhatsAppConnection({ data: { phoneNumberId, token } }).then(async (saved) => {
                setNote(saved.message);
                if (!saved.ok) {
                  setBusy(false);
                  return;
                }
                setConfigured(true);
                setToken("");
                const tested = await testWhatsAppConnection();
                setNote(`${saved.message} ${tested.message}`);
                setBusy(false);
              });
            }}
          >
            {busy ? "Conectando…" : "Guardar y probar"}
          </Btn>
          {configured ? (
            <Btn
              tone="paper"
              disabled={busy}
              onClick={() => {
                setBusy(true);
                void clearWhatsAppConnection().then(() => {
                  setConfigured(false);
                  setNote("WhatsApp desconectado.");
                  setBusy(false);
                });
              }}
            >
              Desconectar
            </Btn>
          ) : null}
        </div>
        {note ? <p className="text-sm text-muted">{note}</p> : null}
        <div className="space-y-2 rounded-2xl bg-cream p-3">
          <p className="text-sm font-medium">Cuando alguien escriba para reservar</p>
          <p className="text-xs text-muted">
            En Meta, Webhooks, la dirección es la de esta app más /api/whatsapp/webhook. Token de verificación:
          </p>
          <p className="break-all font-mono text-xs">{verifyToken || "…"}</p>
          <p className="text-xs text-muted">Campo: messages. El mensaje entra solo a la agenda. Si todavía no hay dirección pública, pega el texto aquí.</p>
          <textarea
            className="min-h-20 w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm"
            value={pasted}
            onChange={(event) => setPasted(event.target.value)}
            placeholder="Hola, soy Ana Pérez. Quiero cita mañana a las 10:30 con la Dra. Judith para una limpieza."
          />
          <Btn
            tone="paper"
            disabled={pasted.trim().length < 4}
            onClick={() => {
              const message = applyPastedWhatsApp(pasted);
              setNote(message);
              setPasted("");
            }}
          >
            Pasar este mensaje a la agenda
          </Btn>
        </div>
        <p className="text-xs text-muted">
          El 928 544 342 tiene que estar como celular de prueba en Meta, y la plantilla cita_smile_studio en español tiene que decir Approved. No des de baja el WhatsApp del consultorio.
        </p>
      </div>
    </Sheet>
  );
}

function MorningSheet({ date, onClose, onOpen }: { date: string; onClose: () => void; onOpen: (id: string) => void }) {
  const allVisits = useSmileStore((state) => state.visits);
  const patients = useSmileStore((state) => state.patients);
  const moveVisit = useSmileStore((state) => state.moveVisit);
  const pending = allVisits.filter((visit) => visit.date === date && needsMorningPing(visit)).sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""));
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState("Modo prueba: los avisos llegan al 928 544 342, no al paciente.");

  useEffect(() => {
    void whatsappStatus().then((status) => {
      if (!status.configured) {
        setBanner("Modo prueba al 928 544 342. Falta el token y el Phone number ID de Meta en el servidor.");
        return;
      }
      setBanner(
        status.live
          ? "Los avisos salen al celular del paciente."
          : `Modo prueba: los avisos llegan al ${status.display}, no al paciente.`,
      );
    });
  }, []);

  return (
    <Sheet title="Ronda de la mañana" subtitle={formatDay(date)} onClose={onClose}>
      <p className="mb-4 text-sm text-muted">{banner}</p>
      {pending.length === 0 ? (
        <p className="text-sm text-muted">Todas las citas con hora ya están confirmadas.</p>
      ) : (
        <ul className="space-y-3">
          {pending.map((visit) => {
            const patient = patients.find((item) => item.id === visit.patientId);
            if (!patient) return null;
            return (
              <li key={visit.id} className="rounded-2xl border border-line px-3 py-3">
                <button type="button" className="w-full text-left" onClick={() => onOpen(visit.id)}>
                  <span className="font-medium">{patient.fullName}</span>
                  <span className="mt-1 block text-sm text-muted">
                    {visit.time ? formatTime(visit.time) : ""} · {doctorById(visit.doctorId).short} · {STATUS_LABEL[visit.status]}
                  </span>
                </button>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Btn
                    tone="paper"
                    disabled={busyId === visit.id}
                    onClick={() => {
                      setBusyId(visit.id);
                      void avisarCita(patient, visit).then((result) => {
                        setBusyId(null);
                        setNotes((current) => ({ ...current, [visit.id]: result.message }));
                        if (result.ok) moveVisit(visit.id, { status: "recordatorio" });
                      });
                    }}
                  >
                    {busyId === visit.id ? "Enviando…" : "Avisar"}
                  </Btn>
                  <Btn onClick={() => moveVisit(visit.id, { status: "confirmada" })}>Ya confirmó</Btn>
                </div>
                {notes[visit.id] ? <p className="mt-2 text-sm text-muted">{notes[visit.id]}</p> : null}
              </li>
            );
          })}
        </ul>
      )}
    </Sheet>
  );
}

async function shrinkImage(file: File) {
  try {
    const bitmap = await createImageBitmap(file);
    const max = 720;
    const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    return canvas.toDataURL("image/jpeg", 0.68);
  } catch {
    return null;
  }
}

