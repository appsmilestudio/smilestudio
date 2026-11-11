import { useMemo } from "react";
import {
  Calendar,
  Clock,
  UserCheck,
  Wallet,
  PhoneCall,
  PlusCircle,
  MessageSquare,
  ArrowRight,
  Sparkles,
  Stethoscope,
  AlertTriangle,
  Receipt,
  Users,
} from "lucide-react";
import { cn } from "@/lib/cn";
import {
  DOCTORS,
  STATUS_LABEL,
  dayReport,
  doctorById,
  formatDay,
  formatTime,
  isSunday,
  needsMorningPing,
  occupiesSlot,
  soles,
  statusTone,
  sumVisit,
  type DayClose,
  type Debt,
  type Patient,
  type Role,
  type Visit,
} from "@/lib/smile/model";
import { Btn, Pill } from "./ui";

export function HomeDashboard({
  today,
  role,
  patients,
  visits,
  debts,
  closes,
  onNavigateTab,
  onOpenVisit,
  onOpenCreate,
  onOpenIntake,
  onOpenMorning,
}: {
  today: string;
  role: Role;
  patients: Patient[];
  visits: Visit[];
  debts: Debt[];
  closes: Record<string, DayClose>;
  onNavigateTab: (tab: "hoy" | "pacientes" | "caja" | "deudas" | "fichas") => void;
  onOpenVisit: (id: string) => void;
  onOpenCreate: () => void;
  onOpenIntake: () => void;
  onOpenMorning: () => void;
}) {
  // Saludo contextual según hora local
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? "¡Buenos días!"
      : currentHour < 19
        ? "¡Buenas tardes!"
        : "¡Buenas noches!";

  const roleLabel = {
    recepcion: "Recepción",
    judith: "Dra. Judith",
    miguel: "Dr. Miguel",
    dueno: "Administración",
  }[role];

  // Datos del día
  const todayVisits = useMemo(
    () => visits.filter((v) => v.date === today),
    [visits, today],
  );

  const report = useMemo(() => dayReport(visits, today), [visits, today]);
  const close = closes[today];
  const isClosed = Boolean(close?.closedAt);

  const pendingMorning = useMemo(
    () => todayVisits.filter(needsMorningPing),
    [todayVisits],
  );

  const confirmedCount = todayVisits.filter((v) =>
    ["confirmada", "en_sala", "en_atencion", "atendida"].includes(v.status) && v.time,
  ).length;

  const scheduledToday = todayVisits.filter(occupiesSlot);

  // Citas ordenadas por hora para el listado de hoy
  const sortedVisits = useMemo(() => {
    return [...scheduledToday].sort((a, b) =>
      (a.time ?? "").localeCompare(b.time ?? ""),
    );
  }, [scheduledToday]);

  // Citas sin horario asignado (solicitudes WhatsApp / pendientes)
  const unassignedRequests = todayVisits.filter(
    (v) => !v.time && (v.status === "solicitud" || v.status === "reprogramada"),
  );

  // Deudas pendientes
  const pendingDebts = debts.filter((d) => d.status === "pendiente");
  const totalDebt = pendingDebts.reduce((sum, d) => sum + d.amount, 0);

  // Citas por doctor hoy
  const judithVisitsCount = scheduledToday.filter((v) => v.doctorId === "judith").length;
  const miguelVisitsCount = scheduledToday.filter((v) => v.doctorId === "miguel").length;

  return (
    <div className="space-y-6">
      {/* Hero de Bienvenida */}
      <section className="rise relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-paper via-paper to-cream/60 p-6 shadow-card sm:p-8">
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-soft px-3 py-1 text-xs font-semibold text-gold-deep">
                <Sparkles className="size-3.5" />
                {roleLabel} · Smile Studio
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-cream/80 px-3 py-1 text-xs text-muted">
                <Calendar className="size-3.5" />
                {formatDay(today)}
              </span>
            </div>

            <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              {greeting}
            </h1>
            <p className="text-sm leading-relaxed text-muted sm:text-base">
              Bienvenido al sistema de atención y caja de Smile Studio en Piura.
              {isSunday(today)
                ? " Hoy domingo el consultorio está en descanso, pero puedes consultar las próximas citas y movimientos."
                : ` Tienes ${scheduledToday.length} citas en agenda y ${pendingMorning.length} avisos pendientes por confirmar.`}
            </p>
          </div>

          <div className="flex shrink-0 items-center justify-start sm:justify-end">
            <div className="relative">
              <img
                src="/clinic-mark.png"
                alt="Smile Studio"
                className="mark-in size-20 object-contain drop-shadow-sm transition-transform duration-300 hover:scale-105 sm:size-24"
              />
            </div>
          </div>
        </div>

        {/* Acciones Rápidas Integradas en el Hero */}
        <div className="relative z-10 mt-6 flex flex-wrap gap-2.5 border-t border-line/60 pt-5">
          <Btn onClick={() => onNavigateTab("hoy")}>
            <Calendar className="size-4" />
            Ver Agenda de Hoy
          </Btn>
          <Btn tone="paper" onClick={onOpenCreate}>
            <PlusCircle className="size-4" />
            Nueva Cita
          </Btn>
          <Btn tone="paper" onClick={onOpenIntake}>
            <MessageSquare className="size-4" />
            Anotar Solicitud WhatsApp
          </Btn>
          <Btn tone="paper" onClick={() => onNavigateTab("caja")}>
            <Wallet className="size-4" />
            Revisar Caja
          </Btn>
          <Btn tone="paper" onClick={() => onNavigateTab("fichas")}>
            Fichas clínicas
          </Btn>
        </div>
      </section>

      {/* Alerta de WhatsApp de la mañana (si aplica) */}
      {pendingMorning.length > 0 && (
        <section className="rise card-hover flex flex-col justify-between gap-4 rounded-2xl border border-gold/40 bg-gold-soft/40 p-4 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-gold-soft text-gold-deep">
              <PhoneCall className="size-5" />
            </div>
            <div>
              <p className="font-medium text-ink">
                Ronda de la mañana: Faltan {pendingMorning.length} confirmaciones
              </p>
              <p className="mt-0.5 text-xs text-muted sm:text-sm">
                Envía el recordatorio a los pacientes por WhatsApp para ordenar el horario de los doctores.
              </p>
            </div>
          </div>
          <Btn tone="moss" onClick={onOpenMorning}>
            Avisar por WhatsApp
          </Btn>
        </section>
      )}

      {/* Tarjetas de Resumen Ejecutivo (KPIs del día) */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* KPI 1: Citas Hoy */}
        <button
          type="button"
          onClick={() => onNavigateTab("hoy")}
          className="rise stagger-1 card-hover rounded-2xl border border-line bg-paper p-4 text-left shadow-card"
        >
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-medium uppercase tracking-wider">Citas Hoy</span>
            <Calendar className="size-4 text-gold-deep" />
          </div>
          <p className="mt-2 font-display text-3xl font-bold tabular-nums text-ink">
            {scheduledToday.length}
          </p>
          <p className="mt-1 text-xs text-muted">
            <span className="font-semibold text-moss">{confirmedCount} confirmadas</span>
            {pendingMorning.length > 0 && ` · ${pendingMorning.length} sin confirmar`}
          </p>
        </button>

        {/* KPI 2: Recaudación Caja Hoy */}
        <button
          type="button"
          onClick={() => onNavigateTab("caja")}
          className="rise stagger-2 card-hover rounded-2xl border border-line bg-paper p-4 text-left shadow-card"
        >
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-medium uppercase tracking-wider">Caja de Hoy</span>
            <Receipt className="size-4 text-moss" />
          </div>
          <p className="mt-2 font-display text-3xl font-bold tabular-nums text-ink">
            {soles(report.total)}
          </p>
          <p className="mt-1 text-xs text-muted">
            {isClosed ? (
              <span className="font-medium text-moss">Día cerrado</span>
            ) : (
              <span>Efectivo: {soles(report.byMethod.efectivo)}</span>
            )}
          </p>
        </button>

        {/* KPI 3: Doctores de Turno */}
        <button
          type="button"
          onClick={() => onNavigateTab("hoy")}
          className="rise stagger-3 card-hover rounded-2xl border border-line bg-paper p-4 text-left shadow-card"
        >
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-medium uppercase tracking-wider">Doctores</span>
            <Stethoscope className="size-4 text-ink" />
          </div>
          <p className="mt-2 font-display text-3xl font-bold tabular-nums text-ink">2</p>
          <p className="mt-1 truncate text-xs text-muted">
            Dra. Judith ({judithVisitsCount}) · Dr. Miguel ({miguelVisitsCount})
          </p>
        </button>

        {/* KPI 4: Deudas por Cobrar */}
        <button
          type="button"
          onClick={() => onNavigateTab("deudas")}
          className="rise stagger-4 card-hover rounded-2xl border border-line bg-paper p-4 text-left shadow-card"
        >
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-medium uppercase tracking-wider">Por Cobrar</span>
            <Wallet className="size-4 text-alert" />
          </div>
          <p className="mt-2 font-display text-3xl font-bold tabular-nums text-alert">
            {soles(totalDebt)}
          </p>
          <p className="mt-1 text-xs text-muted">{pendingDebts.length} cuentas pendientes</p>
        </button>
      </section>

      {/* Contenido en dos columnas: Próximas Citas y Estado de Doctores */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Columna Izquierda: Cronograma de Hoy (2 columnas en desktop) */}
        <section className="rise stagger-2 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-2xl text-ink">Agenda del Día</h2>
              <span className="rounded-full bg-cream px-2.5 py-0.5 text-xs font-medium text-muted">
                {sortedVisits.length} citas
              </span>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab("hoy")}
              className="inline-flex items-center gap-1 text-sm font-medium text-gold-deep hover:underline"
            >
              Ver cuadrícula completa
              <ArrowRight className="size-4" />
            </button>
          </div>

          {sortedVisits.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line bg-paper/60 p-8 text-center">
              <Calendar className="mx-auto size-10 text-muted/50" />
              <p className="mt-2 font-medium text-ink">No hay citas con hora para hoy</p>
              <p className="mt-1 text-sm text-muted">
                Puedes agendar una cita libre o registrar solicitudes que llegaron por WhatsApp.
              </p>
              <div className="mt-4 flex justify-center gap-2">
                <Btn tone="paper" onClick={onOpenCreate}>
                  <PlusCircle className="size-4" />
                  Agendar Cita
                </Btn>
              </div>
            </div>
          ) : (
            <ul className="space-y-2.5">
              {sortedVisits.map((visit) => {
                const patient = patients.find((p) => p.id === visit.patientId);
                const doctor = doctorById(visit.doctorId);
                const totalPaid = sumVisit(visit);

                return (
                  <li key={visit.id}>
                    <button
                      type="button"
                      onClick={() => onOpenVisit(visit.id)}
                      className="card-hover w-full rounded-2xl border border-line bg-paper p-3.5 text-left shadow-card sm:p-4"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                          <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-cream font-medium text-ink tabular-nums text-xs sm:text-sm">
                            {visit.time ? formatTime(visit.time).replace(" a. m.", "").replace(" p. m.", "") : "—"}
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-medium text-ink sm:text-base">
                                {patient?.fullName ?? "Paciente"}
                              </span>
                              <Pill tone={statusTone(visit.status)}>
                                {STATUS_LABEL[visit.status]}
                              </Pill>
                            </div>
                            <p className="mt-0.5 text-xs text-muted sm:text-sm">
                              {doctor.short} · {visit.treatment}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-line/50 pt-2 sm:border-0 sm:pt-0 sm:text-right">
                          <span className="text-xs text-muted sm:hidden">Cobro:</span>
                          <div>
                            <span className="text-sm font-medium tabular-nums text-ink">
                              {totalPaid > 0 ? soles(totalPaid) : visit.noCharge ? "Sin cargo" : "Pendiente"}
                            </span>
                            {visit.payments.length > 0 && (
                              <p className="text-[11px] text-muted">
                                {visit.payments.map((p) => p.method).join(", ")}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Solicitudes de WhatsApp pendientes de asignar hora */}
          {unassignedRequests.length > 0 && (
            <div className="mt-4 rounded-2xl border border-line bg-gold-soft/30 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-ink">
                  {unassignedRequests.length} solicitudes de WhatsApp sin hora
                </span>
                <button
                  type="button"
                  onClick={() => onNavigateTab("hoy")}
                  className="text-xs font-semibold text-gold-deep hover:underline"
                >
                  Asignar en agenda
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Columna Derecha: Equipo de Doctores & Información del Consultorio */}
        <div className="rise stagger-3 space-y-4">
          <section className="rounded-2xl border border-line bg-paper p-4 shadow-card sm:p-5">
            <h2 className="font-display text-xl text-ink">Doctores de Atención</h2>
            <p className="mt-1 text-xs text-muted">
              Horario fijo cada 30 minutos · Mañana y Tarde
            </p>

            <div className="mt-4 space-y-3">
              {DOCTORS.map((doc) => {
                const docVisits = scheduledToday.filter((v) => v.doctorId === doc.id);
                return (
                  <div
                    key={doc.id}
                    className="rounded-xl border border-line/70 bg-cream/40 p-3.5 transition-colors hover:bg-cream/70"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-ink">{doc.name}</p>
                        <p className="text-xs text-muted">{doc.focus}</p>
                      </div>
                      <span className="rounded-full bg-paper px-2 py-0.5 text-xs font-medium text-gold-deep shadow-sm">
                        {docVisits.length} citas hoy
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 border-t border-line/60 pt-3 text-xs text-muted space-y-1">
              <p className="font-medium text-ink">Turnos de consulta:</p>
              <p>• Mañana: 10:00 a. m. a 12:00 p. m.</p>
              <p>• Tarde: 5:00 p. m. a 7:30 p. m.</p>
              <p>• Domingo cerrado (emergencias previa coordinación)</p>
            </div>
          </section>

          {/* Tarjeta de Métodos de Pago del Día */}
          <section className="rounded-2xl border border-line bg-paper p-4 shadow-card sm:p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl text-ink">Caja del Día</h2>
              <button
                type="button"
                onClick={() => onNavigateTab("caja")}
                className="text-xs font-medium text-gold-deep hover:underline"
              >
                Ver detalle
              </button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl bg-cream/70 p-2.5">
                <span className="text-muted">Efectivo</span>
                <p className="mt-1 font-semibold tabular-nums text-ink">
                  {soles(report.byMethod.efectivo)}
                </p>
              </div>
              <div className="rounded-xl bg-cream/70 p-2.5">
                <span className="text-muted">Yape</span>
                <p className="mt-1 font-semibold tabular-nums text-ink">
                  {soles(report.byMethod.yape)}
                </p>
              </div>
              <div className="rounded-xl bg-cream/70 p-2.5">
                <span className="text-muted">Plin</span>
                <p className="mt-1 font-semibold tabular-nums text-ink">
                  {soles(report.byMethod.plin)}
                </p>
              </div>
              <div className="rounded-xl bg-cream/70 p-2.5">
                <span className="text-muted">POS</span>
                <p className="mt-1 font-semibold tabular-nums text-ink">
                  {soles(report.byMethod.pos)}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
