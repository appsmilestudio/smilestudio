import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { formatDay, isSunday, latestOnOrBefore, limaToday, nextOpenDay, type DoctorId } from "@/lib/smile/model";
import { useSmileStore } from "@/lib/smile/store";
import { Board } from "./board";
import { Caja } from "./caja";
import { Debts } from "./debts";
import { People } from "./people";
import { Panels, type Panel } from "./panels";
import { HomeDashboard } from "./home";
import { RoleSelector } from "./role-selector";
import { ClinicApp } from "@/components/clinic/shell";
import { applyWhatsAppLead } from "@/lib/smile/apply-lead";
import { startLibroSync, useCloudStatus } from "@/lib/smile/cloud";
import { exportExcelWorkbook } from "@/lib/smile/excel";
import { ackWhatsAppInbox, listWhatsAppInbox } from "@/lib/smile/whatsapp";
import { Btn, DayNav } from "./ui";

type Tab = "inicio" | "hoy" | "pacientes" | "caja" | "deudas" | "fichas";

const TABS: { id: Tab; label: string; short: string }[] = [
  { id: "inicio", label: "Inicio", short: "Inicio" },
  { id: "hoy", label: "Agenda", short: "Agenda" },
  { id: "pacientes", label: "Pacientes", short: "Pacientes" },
  { id: "caja", label: "Caja", short: "Caja" },
  { id: "deudas", label: "Deudas", short: "Deudas" },
  { id: "fichas", label: "Fichas", short: "Fichas" },
];

export function SmileApp() {
  const today = limaToday();
  const patients = useSmileStore((state) => state.patients);
  const visits = useSmileStore((state) => state.visits);
  const debts = useSmileStore((state) => state.debts);
  const closes = useSmileStore((state) => state.closes);
  const role = useSmileStore((state) => state.role);
  const setRole = useSmileStore((state) => state.setRole);
  const resetLibro = useSmileStore((state) => state.resetLibro);
  const [tab, setTab] = useState<Tab>("inicio");
  const [boardDate, setBoardDate] = useState(() => nextOpenDay(today));
  const [cajaDate, setCajaDate] = useState(() =>
    latestOnOrBefore(
      useSmileStore.getState().visits.map((visit) => visit.date),
      today,
    ),
  );
  const [panel, setPanel] = useState<Panel | null>(null);
  const [askReset, setAskReset] = useState(false);
  const [waNotice, setWaNotice] = useState("");
  const [ready, setReady] = useState(false);
  const cloud = useCloudStatus();

  useEffect(() => {
    void startLibroSync().finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready) return;
    let stop = false;
    async function pull() {
      try {
        const { items } = await listWhatsAppInbox();
        if (stop || items.length === 0) return;
        const notes = items.map((item) => applyWhatsAppLead(item));
        await ackWhatsAppInbox({ data: { ids: items.map((item) => item.id) } });
        if (!stop) setWaNotice(notes[notes.length - 1] ?? "");
      } catch {
        // La bandeja vive en el servidor. Si todavía no responde, se reintenta.
      }
    }
    void pull();
    const timer = window.setInterval(() => void pull(), 8000);
    return () => {
      stop = true;
      window.clearInterval(timer);
    };
  }, [ready]);

  const activeDate = tab === "caja" ? cajaDate : boardDate;

  if (!ready) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-cream text-ink">
        <img src="/clinic-mark.png" alt="Smile Studio" className="mark-in size-16 object-contain" />
        <p className="mt-4 text-sm text-muted">{cloud.detail}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="smile-chrome h-1 bg-gold" aria-hidden />
      <header className="smile-chrome sticky top-0 z-20 border-b border-line bg-cream/95 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="flex items-center gap-3 py-3 md:gap-4 md:py-4">
            <button
              type="button"
              onClick={() => setTab("inicio")}
              className="group flex min-w-0 shrink items-center gap-3 text-left transition-opacity hover:opacity-90"
            >
              <img
                src="/clinic-mark.png"
                alt="Smile Studio"
                className="mark-in size-11 shrink-0 object-contain transition-transform duration-200 group-hover:scale-105 sm:size-13"
              />
              <div className="min-w-0">
                <p className="truncate font-display text-2xl leading-none text-ink sm:text-3xl">Smile Studio</p>
                <p className="mt-1 hidden truncate text-xs text-muted sm:block">Consultorio dental · Piura</p>
                <p className={`truncate text-[11px] ${cloud.status === "conectado" ? "text-muted" : "text-gold-deep"}`}>{cloud.detail}</p>
              </div>
            </button>
            <nav
              className="hidden min-w-0 flex-1 items-center gap-1 overflow-x-auto rounded-full border border-line bg-paper p-1 lg:flex"
              aria-label="Secciones"
            >
              {TABS.map((item) => (
                <TabButton key={item.id} active={tab === item.id} onClick={() => setTab(item.id)}>
                  {item.label}
                </TabButton>
              ))}
            </nav>
            <div className="shrink-0">
              <RoleSelector role={role} onChange={setRole} />
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto pb-3 lg:hidden" aria-label="Secciones">
            {TABS.map((item) => (
              <TabButton key={item.id} active={tab === item.id} onClick={() => setTab(item.id)} compact>
                {item.short}
              </TabButton>
            ))}
          </nav>
        </div>
      </header>
      {waNotice ? (
        <div className="smile-chrome border-b border-line bg-paper">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-6">
            <p className="text-sm">{waNotice}</p>
            <button type="button" className="shrink-0 text-sm font-medium text-gold-deep" onClick={() => { setTab("hoy"); setWaNotice(""); }}>
              Ver agenda
            </button>
          </div>
        </div>
      ) : null}
      <main className={tab === "fichas" ? "w-full flex-1" : "mx-auto w-full max-w-6xl flex-1 px-4 py-5 md:px-6 md:py-8"}>
        {tab === "hoy" || tab === "caja" ? (
          <div className="mb-5">
            <DayNav
              date={activeDate}
              today={today}
              onChange={tab === "caja" ? setCajaDate : setBoardDate}
            />
          </div>
        ) : null}
        {tab === "fichas" ? (
          <ClinicApp />
        ) : (
        <div key={`${tab}-${tab === "pacientes" ? "people" : tab === "inicio" ? "home" : activeDate}`} className="rise">
          {tab === "inicio" ? (
            <HomeDashboard
              today={today}
              role={role}
              patients={patients}
              visits={visits}
              debts={debts}
              closes={closes}
              onNavigateTab={(targetTab) => {
                if (targetTab === "hoy") setBoardDate(today);
                if (targetTab === "caja") setCajaDate(today);
                setTab(targetTab);
              }}
              onOpenVisit={(id) => setPanel({ kind: "visit", id })}
              onOpenCreate={() =>
                setPanel({
                  kind: "create",
                  date: today,
                  time: "10:00",
                  doctorId: role === "miguel" ? "miguel" : "judith",
                })
              }
              onOpenIntake={() => setPanel({ kind: "intake", date: today })}
              onOpenMorning={() => setPanel({ kind: "morning", date: today })}
            />
          ) : null}
          {tab === "hoy" && isSunday(today) && boardDate === nextOpenDay(today) ? (
            <p className="mb-4 rounded-2xl border border-line bg-paper px-4 py-3 text-sm text-muted shadow-card">
              Hoy es domingo. Esta es la agenda del {formatDay(boardDate).toLowerCase()} para avisar en la mañana.
            </p>
          ) : null}
          {tab === "hoy" ? (
            <Board
              date={boardDate}
              today={today}
              role={role}
              patients={patients}
              visits={visits}
              onOpenVisit={(id) => setPanel({ kind: "visit", id })}
              onCreate={(doctorId: DoctorId, time) => setPanel({ kind: "create", date: boardDate, time, doctorId })}
              onIntake={() => setPanel({ kind: "intake", date: boardDate })}
              onMorning={() => setPanel({ kind: "morning", date: boardDate })}
            />
          ) : null}
          {tab === "pacientes" ? (
            <People
              patients={patients}
              visits={visits}
              debts={debts}
              onOpen={(id) => setPanel({ kind: "patient", id })}
              onCreate={() => setPanel({ kind: "new-patient" })}
            />
          ) : null}
          {tab === "caja" ? (
            <Caja
              date={cajaDate}
              patients={patients}
              visits={visits}
              close={closes[cajaDate]}
              onOpenVisit={(id) => setPanel({ kind: "visit", id })}
            />
          ) : null}
          {tab === "deudas" ? (
            <Debts debts={debts} patients={patients} date={today} onOpenVisit={(id) => setPanel({ kind: "visit", id })} />
          ) : null}
        </div>
        )}
      </main>
      <footer className="smile-chrome mt-4 border-t border-line bg-paper/70">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:grid-cols-3 md:px-6">
          <div className="flex items-start gap-3">
            <img src="/clinic-mark.png" alt="" className="h-10 w-10 object-contain" />
            <div>
              <p className="font-display text-xl leading-none">Smile Studio</p>
              <p className="mt-2 text-sm text-muted">Dra. Judith Escobedo Arteaga</p>
              <p className="text-sm text-muted">Dr. Miguel Oyola Bayona</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium tracking-wide text-gold-deep uppercase">Horario</p>
            <p className="mt-2 text-sm">Lunes a sábado</p>
            <p className="text-sm text-muted">10:00 a. m. – 12:00 p. m.</p>
            <p className="text-sm text-muted">5:00 p. m. – 7:30 p. m.</p>
            <p className="mt-2 text-sm text-muted">Domingo cerrado</p>
          </div>
          <div>
            <p className="text-xs font-medium tracking-wide text-gold-deep uppercase">Este dispositivo & Excel</p>
            <p className="mt-2 text-sm text-muted">
              El libro de octubre 2026 ya está cargado. Lo que cambies se guarda aquí.
            </p>
            <div className="mt-3 space-y-2">
              <button
                type="button"
                onClick={() => exportExcelWorkbook(patients, visits, debts)}
                className="block text-sm font-medium text-gold-deep hover:underline"
              >
                Descargar libro en Excel (.xlsx)
              </button>
              {askReset ? (
                <div className="flex flex-wrap gap-2">
                  <Btn
                    tone="alert"
                    onClick={() => {
                      resetLibro();
                      setAskReset(false);
                    }}
                  >
                    Sí, restaurar
                  </Btn>
                  <Btn tone="paper" onClick={() => setAskReset(false)}>
                    Cancelar
                  </Btn>
                </div>
              ) : (
                <button type="button" className="block text-xs text-muted hover:text-ink" onClick={() => setAskReset(true)}>
                  Restaurar semilla inicial
                </button>
              )}
              <button type="button" className="block text-sm font-medium text-gold-deep hover:underline" onClick={() => setPanel({ kind: "meta" })}>
                Conectar WhatsApp de Meta
              </button>
            </div>
          </div>
        </div>
      </footer>
      <Panels
        panel={panel}
        onClose={() => setPanel(null)}
        onOpenPatient={(id) => setPanel({ kind: "patient", id })}
        onOpenVisit={(id) => setPanel({ kind: "visit", id })}
      />
    </div>
  );
}

function TabButton({
  active,
  onClick,
  compact,
  children,
}: {
  active: boolean;
  onClick: () => void;
  compact?: boolean;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "press inline-flex h-11 min-h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-full text-sm font-medium",
        compact ? "px-3" : "px-4",
        active ? "bg-ink text-paper shadow-card" : "text-muted hover:bg-cream hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
