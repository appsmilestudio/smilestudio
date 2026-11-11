import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Download, Plus, Printer, Search, Trash2 } from "lucide-react";
import { patientLabel, TABS, type Patient, type SurfaceId, type TabId, type Tool } from "@/lib/clinic/model";
import { useClinic } from "@/lib/clinic/store";
import { FichaSheet } from "./ficha";
import { MarkImg, StudioLogo } from "./mark";
import { OdontogramaSheet } from "./odontograma";
import { OrtodonciaSheet } from "./ortodoncia";
import { PlanSheet } from "./plan";
import "./clinic.css";

export function ClinicApp() {
  const hydrated = useClinic((s) => s.hydrated);
  useEffect(() => {
    void Promise.resolve(useClinic.persist.rehydrate()).finally(() => {
      useClinic.getState().setHydrated();
    });
  }, []);

  if (!hydrated) {
    return (
      <div className="clinic-desk">
        <main className="boot">
          <StudioLogo className="studio-logo boot-logo" />
        </main>
      </div>
    );
  }

  return (
    <div className="clinic-desk">
      <Desk />
    </div>
  );
}

function Desk() {
  const patients = useClinic((s) => s.patients);
  const activeId = useClinic((s) => s.activeId);
  const tab = useClinic((s) => s.tab);
  const tool = useClinic((s) => s.tool);
  const setTab = useClinic((s) => s.setTab);
  const setTool = useClinic((s) => s.setTool);
  const setActive = useClinic((s) => s.setActive);
  const addPatient = useClinic((s) => s.addPatient);
  const removePatient = useClinic((s) => s.removePatient);
  const edit = useClinic((s) => s.edit);
  const applyTooth = useClinic((s) => s.applyTooth);
  const applyArch = useClinic((s) => s.applyArch);
  const copyArch = useClinic((s) => s.copyArch);

  const [query, setQuery] = useState("");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  const active = patients.find((p) => p.id === activeId) ?? null;
  const filtered = patients.filter((p) => {
    const hay = `${patientLabel(p)} ${p.dni} ${p.telefono}`.toLowerCase();
    return hay.includes(query.trim().toLowerCase());
  });

  const start = (nextTab?: TabId) => {
    addPatient(nextTab);
    window.setTimeout(() => document.getElementById("field-paciente")?.focus(), 40);
  };

  const onEdit = (recipe: Parameters<typeof edit>[1]) => {
    if (!active) return;
    edit(active.id, recipe);
  };

  const download = async () => {
    if (!active || exporting) {
      if (!active) setNotice("Abre una ficha para descargar el PDF.");
      return;
    }
    const safe = patientLabel(active)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    flushSync(() => setExporting(true));
    setNotice("Preparando el PDF…");
    try {
      const root = stageRef.current;
      if (!root) throw new Error("sin hoja");
      const { saveSheetsPdf } = await import("@/lib/clinic/pdf");
      await saveSheetsPdf(root, `Smile-Studio-${safe || "paciente"}.pdf`);
      setNotice("PDF descargado.");
    } catch {
      setNotice("No se pudo crear el PDF.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="desk">
      <aside className="rail no-print">
        <div className="rail-brand">
          <StudioLogo className="studio-logo side" />
        </div>
        <button type="button" className="btn-gold" onClick={() => start()}>
          <Plus className="h-4 w-4" />
          Nuevo paciente
        </button>
        <label className="search">
          <Search className="h-4 w-4" />
          <input
            value={query}
            placeholder="Buscar nombre o DNI"
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <ul className="patient-list">
          {filtered.length === 0 ? (
            <li className="empty-list">Todavía no hay fichas.</li>
          ) : (
            filtered.map((patient) => {
              const selected = patient.id === active?.id;
              return (
                <li key={patient.id}>
                  <button
                    type="button"
                    className={selected ? "patient on" : "patient"}
                    onClick={() => {
                      setActive(patient.id);
                      setPendingDelete(null);
                    }}
                  >
                    <span className="patient-name">{patientLabel(patient)}</span>
                    <span className="patient-meta">
                      {patient.dni ? `DNI ${patient.dni}` : "Sin DNI"}
                      {patient.fecha ? ` · ${patient.fecha}` : ""}
                    </span>
                  </button>
                  {selected ? (
                    pendingDelete === patient.id ? (
                      <div className="confirm">
                        <span>¿Eliminar esta ficha?</span>
                        <button type="button" className="text-btn danger" onClick={() => removePatient(patient.id)}>
                          Eliminar
                        </button>
                        <button type="button" className="text-btn" onClick={() => setPendingDelete(null)}>
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button type="button" className="text-btn danger" onClick={() => setPendingDelete(patient.id)}>
                        <Trash2 className="h-4 w-4" />
                        Eliminar ficha
                      </button>
                    )
                  ) : null}
                </li>
              );
            })
          )}
        </ul>
        <div className="rail-foot">
          <button type="button" className="btn-line" onClick={() => void download()} disabled={!active || exporting}>
            <Download className="h-4 w-4" />
            {exporting ? "Descargando…" : "Descargar copia"}
          </button>
          <p>Se guarda solo en este dispositivo. Av. Grau 877 · 949 390 316</p>
        </div>
      </aside>

      <div className="workspace">
        <div className="mobile-bar no-print">
          <MarkImg className="mark-img sm" />
          <select
            aria-label="Paciente"
            value={active?.id ?? ""}
            onChange={(event) => setActive(event.target.value || null)}
          >
            <option value="">Sin paciente</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patientLabel(patient)}
              </option>
            ))}
          </select>
          <button type="button" className="btn-gold icon-btn" onClick={() => start()} aria-label="Nuevo paciente">
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="tabbar no-print" role="tablist" aria-label="Fichas">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              className={tab === item.id ? "tab on" : "tab"}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
          <button type="button" className="btn-line print-btn" onClick={() => window.print()} disabled={!active}>
            <Printer className="h-4 w-4" />
            Imprimir
          </button>
          <button
            type="button"
            className="btn-line tab-download"
            onClick={() => void download()}
            disabled={!active || exporting}
          >
            <Download className="h-4 w-4" />
            {exporting ? "Descargando…" : "PDF"}
          </button>
        </div>

        {notice ? (
          <p className="notice no-print" role="status">
            {notice}
          </p>
        ) : null}

        <div className="desk-scroll">
          {active ? (
            <Sheet
              tab={tab}
              tool={tool}
              patient={active}
              onTool={setTool}
              onEdit={onEdit}
              onTooth={(fdi, target) => applyTooth(active.id, fdi, tool, target)}
              onArch={(key) => applyArch(active.id, key, tool)}
              onCopy={() => copyArch(active.id)}
            />
          ) : (
            <Welcome onStart={start} />
          )}
        </div>
      </div>
      {exporting && active ? (
        <div className="pdf-stage" ref={stageRef} aria-hidden>
          {TABS.map((item) => (
            <div key={item.id} className="pdf-page" data-pdf-page>
              <Sheet
                tab={item.id}
                tool={tool}
                patient={active}
                onTool={setTool}
                onEdit={onEdit}
                onTooth={(fdi, target) => applyTooth(active.id, fdi, tool, target)}
                onArch={(key) => applyArch(active.id, key, tool)}
                onCopy={() => copyArch(active.id)}
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Sheet({
  tab,
  tool,
  patient,
  onTool,
  onEdit,
  onTooth,
  onArch,
  onCopy,
}: {
  tab: TabId;
  tool: Tool;
  patient: Patient;
  onTool: (tool: Tool) => void;
  onEdit: (recipe: (patient: Patient) => Patient) => void;
  onTooth: (fdi: string, target: SurfaceId | "crown") => void;
  onArch: (key: string) => void;
  onCopy: () => void;
}) {
  if (tab === "ficha") {
    return (
      <FichaSheet patient={patient} tool={tool} onTool={onTool} onEdit={onEdit} onArch={onArch} onCopy={onCopy} />
    );
  }
  if (tab === "plan") return <PlanSheet patient={patient} onEdit={onEdit} />;
  if (tab === "ortodoncia") return <OrtodonciaSheet patient={patient} onEdit={onEdit} />;
  return <OdontogramaSheet patient={patient} tool={tool} onTool={onTool} onEdit={onEdit} onTooth={onTooth} />;
}

function Welcome({ onStart }: { onStart: (tab: TabId) => void }) {
  return (
    <section className="sheet welcome">
      <StudioLogo />
      <h1>Fichas para atender</h1>
      <p className="welcome-copy">
        Cuatro hojas iguales a las del consultorio. Elige una y empieza la ficha del paciente.
      </p>
      <div className="welcome-grid">
        {TABS.map((item) => (
          <button key={item.id} type="button" className="welcome-card" onClick={() => onStart(item.id)}>
            <span>{item.label}</span>
            <small>{item.blurb}</small>
          </button>
        ))}
      </div>
      <p className="hint">Av. Grau 877, Piura · 949 390 316</p>
    </section>
  );
}
