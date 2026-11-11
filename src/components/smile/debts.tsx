import { useState } from "react";
import { Wallet, CheckCircle2, AlertCircle, X, RotateCw } from "lucide-react";
import { METHOD_LABEL, METHODS, prettyPhone, soles, type Debt, type Patient, type PayMethod } from "@/lib/smile/model";
import { useSmileStore } from "@/lib/smile/store";
import { Btn } from "./ui";

export function Debts({
  debts,
  patients,
  date,
  onOpenVisit,
}: {
  debts: Debt[];
  patients: Patient[];
  date: string;
  onOpenVisit: (id: string) => void;
}) {
  const collectDebt = useSmileStore((state) => state.collectDebt);
  const cleanAndSyncDebts = useSmileStore((state) => state.cleanAndSyncDebts);
  const [syncedMsg, setSyncedMsg] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const pending = debts.filter((debt) => debt.status === "pendiente");
  const total = pending.reduce((sum, debt) => sum + debt.amount, 0);
  const ordered = [...debts].sort((a, b) => {
    if (a.status !== b.status) return a.status === "pendiente" ? -1 : 1;
    return patientName(patients, a.patientId).localeCompare(patientName(patients, b.patientId), "es");
  });

  const handleCleanSync = () => {
    cleanAndSyncDebts();
    setSyncedMsg(true);
    setTimeout(() => setSyncedMsg(false), 2500);
  };

  return (
    <div className="space-y-4">
      <div className="card-hover rounded-2xl border border-line bg-paper p-5 shadow-card">
        <div className="flex items-center justify-between text-muted">
          <span className="text-xs font-semibold uppercase tracking-wider">Saldo Total por Cobrar</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCleanSync}
              className="press inline-flex items-center gap-1.5 rounded-full border border-line bg-cream/70 px-2.5 py-1 text-xs font-medium text-ink/80 transition-colors hover:border-gold hover:text-ink"
              title="Excluir filas con PAGO y desduplicar"
            >
              <RotateCw className="size-3 text-gold" />
              {syncedMsg ? "¡Depurado con éxito!" : "Depurar con Excel"}
            </button>
            <Wallet className="size-5 text-alert" />
          </div>
        </div>
        <p className="mt-2 font-display text-4xl font-bold tabular-nums text-alert">{soles(total)}</p>
        <p className="mt-1 text-xs text-muted sm:text-sm">
          {pending.length} cuentas abiertas pendientes (excluye automáticamente filas con PAGO en Excel).
        </p>
      </div>

      <ul className="space-y-2.5">
        {ordered.map((debt) => {
          const patient = patients.find((item) => item.id === debt.patientId);
          const open = openId === debt.id;
          const isPending = debt.status === "pendiente";

          return (
            <li key={debt.id} className="card-hover rounded-2xl border border-line bg-paper p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-ink">{patient?.fullName ?? "Paciente"}</p>
                  <p className="mt-0.5 text-xs text-muted sm:text-sm">
                    {debt.concept}
                    {patient?.phone ? ` · ${prettyPhone(patient.phone)}` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold tabular-nums text-ink">{soles(debt.amount)}</p>
                  <span
                    className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                      isPending ? "bg-alert-soft text-alert" : "bg-moss-soft text-moss"
                    }`}
                  >
                    {isPending ? (
                      <>
                        <AlertCircle className="size-3" /> Pendiente
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="size-3" /> Pagado
                      </>
                    )}
                  </span>
                </div>
              </div>

              {isPending ? (
                <div className="mt-3.5 border-t border-line/60 pt-3">
                  {open ? (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted">Selecciona método de cobro:</p>
                      <div className="flex flex-wrap items-center gap-2">
                        {METHODS.map((method) => (
                          <Btn
                            key={method}
                            tone="paper"
                            onClick={() => {
                              const id = collectDebt(debt.id, method as PayMethod, date);
                              setOpenId(null);
                              if (id) onOpenVisit(id);
                            }}
                          >
                            {METHOD_LABEL[method]}
                          </Btn>
                        ))}
                        <button
                          type="button"
                          onClick={() => setOpenId(null)}
                          className="press inline-flex h-11 items-center justify-center rounded-full border border-line px-3 text-xs text-muted hover:text-ink"
                        >
                          <X className="size-4" />
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <Btn tone="paper" onClick={() => setOpenId(debt.id)}>
                      Cobrar hoy
                    </Btn>
                  )}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function patientName(patients: Patient[], id: string) {
  return patients.find((patient) => patient.id === id)?.fullName ?? "";
}
