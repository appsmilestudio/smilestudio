import { useState } from "react";
import { Banknote, Smartphone, CreditCard, Receipt, CheckCircle2, AlertCircle } from "lucide-react";
import {
  DOCTORS,
  METHOD_LABEL,
  METHODS,
  dayReport,
  doctorById,
  formatStamp,
  moneyGap,
  parseAmount,
  soles,
  type DayClose,
  type Patient,
  type Payment,
  type Visit,
} from "@/lib/smile/model";
import { cpeNumber } from "@/lib/smile/cpe";
import { useSmileStore } from "@/lib/smile/store";
import { Btn, Field, inputClass } from "./ui";
import { cn } from "@/lib/cn";

export function Caja({
  date,
  patients,
  visits,
  close,
  onOpenVisit,
}: {
  date: string;
  patients: Patient[];
  visits: Visit[];
  close?: DayClose;
  onOpenVisit: (id: string) => void;
}) {
  const setCashDraft = useSmileStore((state) => state.setCashDraft);
  const closeDay = useSmileStore((state) => state.closeDay);
  const reopenDay = useSmileStore((state) => state.reopenDay);
  const comprobantes = useSmileStore((state) => state.comprobantes);
  const emisor = useSmileStore((state) => state.emisor);
  const saveEmisor = useSmileStore((state) => state.saveEmisor);
  const report = dayReport(visits, date);
  const gap = moneyGap(close?.cashCounted ?? null, report.byMethod.efectivo);
  const locked = Boolean(close?.closedAt);
  const [error, setError] = useState("");
  const quality = qualityLabel(report, close);

  const methodIcons = {
    efectivo: Banknote,
    yape: Smartphone,
    plin: Smartphone,
    pos: CreditCard,
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          Efectivo, Yape, Plin y POS quedan separados. Un pago digital sin número de operación o sin comprobante no deja el día limpio.
        </p>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1 text-xs font-semibold text-ink shadow-sm">
          <Receipt className="size-3.5 text-gold-deep" />
          Total del día: {soles(report.total)}
        </span>
      </div>

      {locked ? (
        <div className={cn("rounded-2xl p-4 shadow-sm", quality === "Día cuadrado" ? "bg-moss-soft text-moss border border-moss/30" : "bg-alert-soft text-alert border border-alert/30")}>
          <div className="flex items-center gap-2 font-medium">
            {quality === "Día cuadrado" ? <CheckCircle2 className="size-5" /> : <AlertCircle className="size-5" />}
            <span>{quality}</span>
          </div>
          <p className="mt-1 text-sm">Cerrado {close?.closedAt ? formatStamp(close.closedAt) : ""}</p>
          {close?.note ? <p className="mt-1 text-sm bg-paper/50 rounded-xl p-2.5 text-ink">{close.note}</p> : null}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {METHODS.map((method) => {
          const Icon = methodIcons[method];
          return (
            <div key={method} className="card-hover rounded-2xl border border-line bg-paper p-3.5 shadow-card">
              <div className="flex items-center justify-between text-muted">
                <span className="text-xs font-medium uppercase tracking-wider">{METHOD_LABEL[method]}</span>
                <Icon className="size-4 text-gold-deep" />
              </div>
              <p className="mt-2 font-display text-2xl font-semibold tabular-nums text-ink">{soles(report.byMethod[method])}</p>
            </div>
          );
        })}
      </div>

      <section className="grid gap-3 sm:grid-cols-2">
        {DOCTORS.map((doctor) => {
          const bag = report.byDoctor[doctor.id];
          const total = METHODS.reduce((sum, method) => sum + bag[method], 0);
          return (
            <article key={doctor.id} className="card-hover rounded-2xl border border-line bg-paper p-4 shadow-card">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl">{doctor.short}</h2>
                <span className="text-xs text-muted">{doctor.name}</span>
              </div>
              <ul className="mt-3 space-y-1.5 text-sm">
                {METHODS.map((method) => (
                  <li key={method} className="flex justify-between gap-3 rounded-lg px-2 py-1 transition-colors hover:bg-cream/50">
                    <span className="text-muted">{METHOD_LABEL[method]}</span>
                    <span className="font-medium tabular-nums">{soles(bag[method])}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 flex justify-between border-t border-line px-2 pt-2 text-sm font-semibold text-ink">
                <span>Total recaudado</span>
                <span className="tabular-nums text-gold-deep">{soles(total)}</span>
              </p>
            </article>
          );
        })}
      </section>

      <section className="rounded-2xl border border-line bg-paper px-4 py-4">
        <h2 className="font-display text-2xl">Boletas y facturas del día</h2>
        <p className="mt-1 text-sm text-muted">
          Son comprobantes internos. El ingreso sigue siendo el cobro, no se suma otra vez. Todavía no salen a SUNAT.
        </p>
        <ul className="mt-3 space-y-2">
          {comprobantes.filter((item) => visits.some((visit) => visit.id === item.visitId && visit.date === date)).length === 0 ? (
            <li className="text-sm text-muted">Hoy no hay boletas ni facturas.</li>
          ) : (
            comprobantes
              .filter((item) => visits.some((visit) => visit.id === item.visitId && visit.date === date))
              .map((item) => {
                const visit = visits.find((row) => row.id === item.visitId);
                return (
                  <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-cream px-3 py-2 text-sm">
                    <button type="button" className="text-left" onClick={() => visit && onOpenVisit(visit.id)}>
                      <span className="font-medium">
                        {item.tipo === "01" ? "Factura" : "Boleta"} {item.serie}-{cpeNumber(item.numero)}
                      </span>
                      <span className="block text-muted">
                        {visit ? patientName(patients, visit.patientId) : item.receptorNombre} · {soles(item.total)}
                        {item.status === "anulado" ? " · anulada" : ""}
                      </span>
                    </button>
                  </li>
                );
              })
          )}
        </ul>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Field label="RUC del consultorio">
            <input className={inputClass} inputMode="numeric" value={emisor?.ruc ?? ""} onChange={(event) => saveEmisor({ ruc: event.target.value.replace(/\D/g, "").slice(0, 11) })} placeholder="11 dígitos" />
          </Field>
          <Field label="Razón social">
            <input className={inputClass} value={emisor?.razonSocial ?? ""} onChange={(event) => saveEmisor({ razonSocial: event.target.value })} />
          </Field>
          <Field label="Dirección">
            <input className={inputClass} value={emisor?.direccion ?? ""} onChange={(event) => saveEmisor({ direccion: event.target.value })} />
          </Field>
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-paper px-4 py-4">
        <h2 className="font-display text-2xl">Conteo de efectivo</h2>
        <p className="mt-1 text-sm text-muted">
          En sistema hay {soles(report.byMethod.efectivo)}. Cuenta lo que hay en caja.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="Efectivo contado">
            <input
              className={inputClass}
              inputMode="decimal"
              disabled={locked}
              value={close?.cashCounted ?? ""}
              placeholder="0"
              onChange={(event) => {
                const raw = event.target.value;
                setCashDraft(date, { cashCounted: raw.trim() === "" ? null : parseAmount(raw) });
              }}
            />
          </Field>
          <div className="rounded-xl bg-cream px-3 py-3">
            <p className="text-sm text-muted">Diferencia</p>
            <p className={cn("font-display text-3xl tabular-nums", gap == null ? "text-muted" : Math.abs(gap) < 0.01 ? "text-moss" : "text-alert")}>
              {gap == null ? "—" : soles(gap)}
            </p>
          </div>
        </div>
        <div className="mt-3">
          <Field label="Nota del cierre">
            <textarea
              className="min-h-24 w-full rounded-xl border border-line bg-cream px-3 py-2 text-sm"
              disabled={locked}
              value={close?.note ?? ""}
              placeholder="Obligatoria si hay diferencia o faltan comprobantes"
              onChange={(event) => setCashDraft(date, { note: event.target.value })}
            />
          </Field>
        </div>
        {error ? <p className="mt-2 text-sm text-alert">{error}</p> : null}
        <div className="mt-3 flex flex-wrap gap-2">
          {locked ? (
            <Btn tone="paper" onClick={() => reopenDay(date)}>
              Reabrir día
            </Btn>
          ) : (
            <Btn
              onClick={() => {
                const message = closeDay(date);
                setError(message ?? "");
              }}
            >
              Cerrar día
            </Btn>
          )}
        </div>
      </section>

      <IssueList
        title="Sin evidencia del pago"
        empty="Todos los pagos digitales del día tienen número y evidencia."
        rows={report.missingEvidence.map((item) => ({
          id: item.payment.id,
          visitId: item.visit.id,
          title: patientName(patients, item.visit.patientId),
          detail: `${METHOD_LABEL[item.payment.method]} ${soles(item.payment.amount)} · ${doctorById(item.visit.doctorId).short}`,
        }))}
        onOpen={onOpenVisit}
      />
      <IssueList
        title="Atenciones sin monto en el libro"
        empty="No hay atenciones del Excel sin monto."
        rows={report.sinMonto.map((visit) => ({
          id: visit.id,
          visitId: visit.id,
          title: patientName(patients, visit.patientId),
          detail: visit.treatment,
        }))}
        onOpen={onOpenVisit}
      />
      <IssueList
        title="Falta cobrar"
        empty="No hay atenciones nuevas sin cobro."
        rows={report.faltaCobro.map((visit) => ({
          id: visit.id,
          visitId: visit.id,
          title: patientName(patients, visit.patientId),
          detail: visit.treatment,
        }))}
        onOpen={onOpenVisit}
      />

      <section>
        <h2 className="mb-2 font-display text-2xl">Movimientos</h2>
        <ul className="overflow-hidden rounded-2xl border border-line bg-paper">
          {report.visits.length === 0 ? (
            <li className="px-4 py-6 text-sm text-muted">Este día todavía no tiene cobros.</li>
          ) : (
            report.visits.map((visit) => (
              <li key={visit.id} className="border-b border-line last:border-b-0">
                <button type="button" onClick={() => onOpenVisit(visit.id)} className="row-hit w-full px-3 py-3 text-left">
                  <span className="flex items-start justify-between gap-3">
                    <span>
                      <span className="block font-medium">{patientName(patients, visit.patientId)}</span>
                      <span className="mt-1 block text-sm text-muted">
                        {doctorById(visit.doctorId).short} · {visit.treatment}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-medium tabular-nums">
                      {visit.payments.length ? soles(visit.payments.reduce((sum, payment) => sum + payment.amount, 0)) : "S/ 0"}
                    </span>
                  </span>
                  <PayLine payments={visit.payments} />
                </button>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}

function PayLine({ payments }: { payments: Payment[] }) {
  if (!payments.length) return null;
  return (
    <span className="mt-1 block text-xs text-muted">
      {payments.map((payment) => {
        const missing = payment.method !== "efectivo" && (!payment.hasEvidence || !payment.operation);
        return `${METHOD_LABEL[payment.method]} ${soles(payment.amount)}${missing ? " · falta evidencia" : ""}`;
      }).join(" · ")}
    </span>
  );
}

function IssueList({
  title,
  empty,
  rows,
  onOpen,
}: {
  title: string;
  empty: string;
  rows: { id: string; visitId: string; title: string; detail: string }[];
  onOpen: (id: string) => void;
}) {
  return (
    <section>
      <h2 className="font-medium">
        {title}
        {rows.length ? ` · ${rows.length}` : ""}
      </h2>
      {rows.length === 0 ? (
        <p className="mt-1 text-sm text-muted">{empty}</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {rows.map((row) => (
            <li key={row.id}>
              <button
                type="button"
                onClick={() => onOpen(row.visitId)}
                className="w-full rounded-2xl border border-line bg-alert-soft px-3 py-3 text-left"
              >
                <span className="block font-medium text-alert">{row.title}</span>
                <span className="mt-1 block text-sm text-alert">{row.detail}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function patientName(patients: Patient[], id: string) {
  return patients.find((patient) => patient.id === id)?.fullName ?? "Paciente";
}

function qualityLabel(report: ReturnType<typeof dayReport>, close?: DayClose) {
  if (!close?.closedAt) return "";
  const gap = moneyGap(close.cashCounted, report.byMethod.efectivo) ?? 0;
  if (report.missingEvidence.length || report.faltaCobro.length) return "Cerrado con observaciones";
  if (Math.abs(gap) > 0.009) return "Cerrado con diferencia";
  return "Día cuadrado";
}
