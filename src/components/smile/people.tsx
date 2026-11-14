import { useMemo, useRef, useState } from "react";
import { Search, X, UserPlus, Users, Download, Upload, CheckCircle2 } from "lucide-react";
import { fold, prettyPhone, type Debt, type Patient, type Visit } from "@/lib/smile/model";
import { exportExcelWorkbook, parseExcelWorkbook } from "@/lib/smile/excel";
import { useSmileStore } from "@/lib/smile/store";
import { Btn } from "./ui";

export function People({
  patients,
  visits,
  debts,
  onOpen,
  onCreate,
}: {
  patients: Patient[];
  visits: Visit[];
  debts: Debt[];
  onOpen: (id: string) => void;
  onCreate: () => void;
}) {
  const [query, setQuery] = useState("");
  const [onlyDebt, setOnlyDebt] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const importExcelData = useSmileStore((state) => state.importExcelData);

  const debtIds = useMemo(
    () => new Set(debts.filter((debt) => debt.status === "pendiente").map((debt) => debt.patientId)),
    [debts],
  );
  const last = useMemo(() => {
    const map = new Map<string, string>();
    for (const visit of visits) {
      const prev = map.get(visit.patientId);
      if (!prev || visit.date > prev) map.set(visit.patientId, visit.date);
    }
    return map;
  }, [visits]);
  const needle = fold(query);
  const rows = patients
    .filter((patient) => {
      if (onlyDebt && !debtIds.has(patient.id)) return false;
      if (!needle) return true;
      return (
        fold(patient.fullName).includes(needle) ||
        patient.dni.includes(query.trim()) ||
        patient.phone.includes(query.replace(/\D/g, ""))
      );
    })
    .sort((a, b) => a.fullName.localeCompare(b.fullName, "es"));

  const handleExport = () => {
    try {
      exportExcelWorkbook(patients, visits, debts);
      setSyncStatus("✓ Excel exportado y descargado exitosamente.");
      setTimeout(() => setSyncStatus(null), 5000);
    } catch {
      setSyncStatus("Hubo un error al generar el archivo Excel.");
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const data = await parseExcelWorkbook(file);
      const res = importExcelData(data.patients, data.visits, data.debts);
      setSyncStatus(
        `✓ Excel importado con éxito: ${res.patientsAdded} pacientes nuevos, ${res.visitsAdded} atenciones y ${res.debtsAdded} deudas registradas.`,
      );
      setTimeout(() => setSyncStatus(null), 8000);
    } catch (err) {
      console.error(err);
      setSyncStatus("Error al leer el archivo Excel. Asegúrate de que sea un archivo .xlsx válido.");
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      {syncStatus ? (
        <div className="rise flex items-center justify-between rounded-2xl border border-moss/40 bg-moss-soft p-3.5 text-xs text-moss sm:text-sm shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>{syncStatus}</span>
          </div>
          <button type="button" onClick={() => setSyncStatus(null)} className="text-moss/80 hover:text-moss">
            <X className="size-4" />
          </button>
        </div>
      ) : null}

      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nombre, DNI o número de celular…"
            className="h-11 w-full rounded-full border border-line bg-paper pl-10 pr-9 text-sm text-ink shadow-sm placeholder:text-muted focus:border-gold"
            aria-label="Buscar paciente"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 grid size-5 -translate-y-1/2 place-items-center text-muted hover:text-ink"
              aria-label="Limpiar búsqueda"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Btn tone="paper" onClick={onCreate}>
            <UserPlus className="size-4" />
            Nuevo
          </Btn>

          <input
            type="file"
            ref={fileInputRef}
            accept=".xlsx, .xls"
            onChange={handleFileSelect}
            className="hidden"
          />

          <Btn
            tone="paper"
            disabled={isProcessing}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="size-4" />
            {isProcessing ? "Leyendo..." : "Importar Excel"}
          </Btn>

          <Btn tone="paper" onClick={handleExport}>
            <Download className="size-4" />
            Exportar Excel
          </Btn>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-2">
          <Filter on={false === onlyDebt} onClick={() => setOnlyDebt(false)}>
            Todos ({patients.length})
          </Filter>
          <Filter on={onlyDebt} onClick={() => setOnlyDebt(true)}>
            Con deuda ({debtIds.size})
          </Filter>
        </div>
        <p className="text-xs text-muted sm:text-sm">{rows.length} resultados</p>
      </div>

      <ul className="overflow-hidden rounded-2xl border border-line bg-paper shadow-card">
        {rows.length === 0 ? (
          <li className="p-8 text-center text-sm text-muted">
            <Users className="mx-auto size-8 text-muted/50 mb-2" />
            Nadie coincide con esa búsqueda.
          </li>
        ) : (
          rows.map((patient) => {
            const initials = patient.fullName
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((p) => p[0])
              .join("")
              .toUpperCase();

            return (
              <li key={patient.id} className="border-b border-line last:border-b-0">
                <button
                  type="button"
                  onClick={() => onOpen(patient.id)}
                  className="row-hit flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors sm:px-4"
                >
                  <div className="grid size-10 shrink-0 place-items-center rounded-full bg-cream text-xs font-semibold text-gold-deep">
                    {initials || "P"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-medium text-ink">{patient.fullName}</span>
                      {debtIds.has(patient.id) ? (
                        <span className="shrink-0 rounded-full bg-alert-soft px-2 py-0.5 text-xs font-semibold text-alert">
                          Deuda
                        </span>
                      ) : null}
                    </div>
                    <span className="mt-0.5 block truncate text-xs text-muted sm:text-sm">
                      {patient.phone ? prettyPhone(patient.phone) : "Sin celular"}
                      {patient.dni ? ` · DNI ${patient.dni}` : ""}
                      {last.get(patient.id) ? ` · última visita ${last.get(patient.id)}` : ""}
                    </span>
                  </div>
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}

function Filter({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        on
          ? "press h-10 rounded-full bg-ink px-4 text-xs font-medium text-paper shadow-card sm:text-sm"
          : "press h-10 rounded-full border border-line bg-paper px-4 text-xs font-medium text-muted hover:text-ink sm:text-sm"
      }
    >
      {children}
    </button>
  );
}

