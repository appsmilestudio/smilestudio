import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Clock, Calendar, Stethoscope, ArrowLeft } from "lucide-react";
import { doctorById, formatDay, formatTime, type VisitStatus } from "@/lib/smile/model";
import { useSmileStore } from "@/lib/smile/store";
import { Btn } from "@/components/smile/ui";

export const Route = createFileRoute("/c/$id")({
  component: ConfirmPage,
});

function ConfirmPage() {
  const { id } = Route.useParams();
  const [ready, setReady] = useState(false);
  const visit = useSmileStore((state) => state.visits.find((item) => item.id === id));
  const patient = useSmileStore((state) => state.patients.find((item) => item.id === visit?.patientId));
  const moveVisit = useSmileStore((state) => state.moveVisit);
  const [done, setDone] = useState<VisitStatus | null>(null);

  useEffect(() => {
    void Promise.resolve(useSmileStore.persist.rehydrate()).finally(() => setReady(true));
  }, []);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-10">
      <div className="text-center">
        <img
          src="/clinic-logo.png"
          alt="Smile Studio"
          className="mark-in mx-auto h-32 w-auto object-contain sm:h-40"
        />
        <p className="mt-1 text-xs font-semibold tracking-wider uppercase text-gold-deep">Piura, Perú</p>
      </div>

      {!ready ? (
        <div className="mt-8 text-center text-sm text-muted animate-pulse">Cargando tu cita…</div>
      ) : null}

      {ready && (!visit || !patient) ? (
        <div className="rise mt-8 rounded-2xl border border-line bg-paper p-6 text-center shadow-card">
          <p className="text-base font-medium text-ink">Cita no encontrada</p>
          <p className="mt-2 text-sm text-muted">
            Este enlace no corresponde a una cita vigente en este dispositivo.
          </p>
        </div>
      ) : null}

      {ready && visit && patient ? (
        <section className="rise mt-6 overflow-hidden rounded-3xl border border-line bg-paper p-6 shadow-card">
          <div className="border-b border-line pb-4">
            <span className="text-xs font-medium uppercase tracking-wider text-muted">Paciente</span>
            <h1 className="mt-1 font-display text-3xl font-semibold leading-tight text-ink">
              {patient.fullName}
            </h1>
          </div>

          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center gap-3 text-ink">
              <Calendar className="size-4 shrink-0 text-gold-deep" />
              <span className="font-medium">
                {formatDay(visit.date)}
                {visit.time ? ` · ${formatTime(visit.time)}` : ""}
              </span>
            </div>

            <div className="flex items-center gap-3 text-muted">
              <Stethoscope className="size-4 shrink-0 text-gold-deep" />
              <span>
                {doctorById(visit.doctorId).short} ({doctorById(visit.doctorId).name})
              </span>
            </div>

            <div className="rounded-xl bg-cream/70 p-3 text-ink">
              <span className="text-xs text-muted block mb-0.5">Tratamiento o motivo:</span>
              <span className="font-medium">{visit.treatment}</span>
            </div>
          </div>

          {done === "confirmada" || visit.status === "confirmada" ? (
            <div className="rise mt-5 flex items-center gap-2.5 rounded-2xl bg-moss-soft p-4 text-sm font-medium text-moss">
              <CheckCircle2 className="size-5 shrink-0" />
              <span>¡Cita confirmada! Te esperamos con gusto en Smile Studio.</span>
            </div>
          ) : null}

          {done === "reprogramada" || visit.status === "reprogramada" ? (
            <div className="rise mt-5 rounded-2xl bg-gold-soft p-4 text-sm font-medium text-gold-deep">
              Solicitud recibida. Recepción se comunicará contigo por WhatsApp para coordinar otro horario.
            </div>
          ) : null}

          {visit.status !== "confirmada" &&
          visit.status !== "reprogramada" &&
          visit.status !== "cancelada" &&
          !done ? (
            <div className="mt-6 space-y-2.5">
              <Btn
                full
                tone="moss"
                onClick={() => {
                  moveVisit(visit.id, { status: "confirmada" });
                  setDone("confirmada");
                }}
              >
                Confirmo que voy
              </Btn>
              <Btn
                full
                tone="paper"
                onClick={() => {
                  moveVisit(visit.id, { status: "reprogramada" });
                  setDone("reprogramada");
                }}
              >
                Quiero otra hora
              </Btn>
            </div>
          ) : null}
        </section>
      ) : null}

      <div className="mt-6 text-center">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gold-deep hover:underline"
        >
          <ArrowLeft className="size-4" />
          Volver a Smile Studio
        </Link>
      </div>
    </main>
  );
}
