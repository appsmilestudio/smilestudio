import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Download, FileText, Plus, Printer, Search, Trash2 } from "lucide-react";
import { patientLabel, TABS, type Patient, type SurfaceId, type TabId, type Tool } from "@/lib/clinic/model";
import { useClinic } from "@/lib/clinic/store";
import { startFichasSync } from "@/lib/smile/cloud";
import { FichaSheet } from "./ficha";
import { MarkImg, StudioLogo } from "./mark";
import { OdontogramaSheet } from "./odontograma";
import { OrtodonciaSheet } from "./ortodoncia";
import "./clinic.css";

export function ClinicApp() {
  const hydrated = useClinic((s) => s.hydrated);
  useEffect(() => {
    void startFichasSync().finally(() => {
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

  const [query, setQuery] = useState("");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [exporting, setExporting] = useState<"current" | "all" | null>(null);
  const currentSheetRef = useRef<HTMLDivElement>(null);
  const allSheetsRef = useRef<HTMLDivElement>(null);

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

  const downloadCurrent = async () => {
    if (!active || exporting) {
      if (!active) setNotice("Selecciona o crea un paciente para exportar el PDF.");
      return;
    }
    const safe = patientLabel(active)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    setNotice("Generando PDF de alta calidad (300 DPI)…");
    flushSync(() => setExporting("current"));

    try {
      const root = currentSheetRef.current;
      if (!root) throw new Error("No se encontró la hoja activa.");
      const pages = [...root.querySelectorAll<HTMLElement>("[data-pdf-page]")];
      if (!pages.length) pages.push(root);

      const { saveSheetsPdf } = await import("@/lib/clinic/pdf");
      const isHorizontal = tab === "ficha";
      await saveSheetsPdf(pages, `Smile-Studio-${isHorizontal ? "Ficha-Horizontal" : tab}-${safe || "paciente"}.pdf`);
      setNotice("¡PDF descargado con éxito!");
    } catch {
      setNotice("No se pudo generar el PDF.");
    } finally {
      setExporting(null);
    }
  };

  const downloadAll = async () => {
    if (!active || exporting) {
      if (!active) setNotice("Selecciona un paciente para exportar el expediente completo.");
      return;
    }
    const safe = patientLabel(active)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    setNotice("Generando expediente clínico completo…");
    flushSync(() => setExporting("all"));

    try {
      const root = allSheetsRef.current;
      if (!root) throw new Error("No se encontró el contenedor de hojas.");
      const pages = [...root.querySelectorAll<HTMLElement>("[data-pdf-page]")];
      if (!pages.length) throw new Error("No se encontraron hojas.");

      const { saveSheetsPdf } = await import("@/lib/clinic/pdf");
      await saveSheetsPdf(pages, `Smile-Studio-Expediente-${safe || "paciente"}.pdf`);
      setNotice("¡Expediente PDF completo descargado!");
    } catch {
      setNotice("No se pudo generar el PDF completo.");
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="clinic-grid">
      {/* Barra lateral de pacientes */}
      <aside className="clinic-rail no-print">
        <div className="rail-head">
          <button type="button" className="btn-gold new-btn" onClick={() => start()}>
            <Plus className="h-4 w-4" />
            Nueva ficha
          </button>
          <div className="search-wrap">
            <Search className="search-ico" />
            <input
              type="search"
              placeholder="Buscar ficha por nombre, DNI…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="search-input"
              aria-label="Buscar pacientes"
            />
          </div>
        </div>

        <ul className="rail-list" role="listbox" aria-label="Fichas clínicas">
          {filtered.length === 0 ? (
            <li className="rail-empty">
              {patients.length === 0 ? "Aún no hay fichas creadas." : "No hay pacientes con esa búsqueda."}
            </li>
          ) : (
            filtered.map((patient) => {
              const on = patient.id === activeId;
              const title = patientLabel(patient);
              const extra = [patient.dni ? `DNI ${patient.dni}` : "", patient.telefono].filter(Boolean).join(" · ");
              const deleting = pendingDelete === patient.id;
              return (
                <li key={patient.id} className={on ? "rail-item active" : "rail-item"}>
                  <button
                    type="button"
                    className="rail-item-body"
                    onClick={() => setActive(patient.id)}
                    aria-selected={on}
                  >
                    <span className="rail-item-title">{title}</span>
                    <span className="rail-item-meta">{extra || "Sin datos de contacto"}</span>
                  </button>
                  {on ? (
                    deleting ? (
                      <div className="rail-delete-confirm">
                        <span>¿Eliminar?</span>
                        <button type="button" className="btn-alert-sm" onClick={() => removePatient(patient.id)}>
                          Sí
                        </button>
                        <button type="button" className="btn-line-sm" onClick={() => setPendingDelete(null)}>
                          No
                        </button>
                      </div>
                    ) : (
                      <button type="button" className="text-btn danger" onClick={() => setPendingDelete(patient.id)}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )
                  ) : null}
                </li>
              );
            })
          )}
        </ul>

        <div className="rail-foot">
          <p className="text-[11px] text-muted text-center">
            Av. Grau 877 · Tel: 949 390 316
          </p>
        </div>
      </aside>

      {/* Área de trabajo */}
      <div className="workspace">
        {/* Barra móvil */}
        <div className="mobile-bar no-print">
          <MarkImg className="mark-img sm" />
          <select
            aria-label="Paciente"
            value={active?.id ?? ""}
            onChange={(event) => setActive(event.target.value || null)}
          >
            <option value="">Seleccionar paciente...</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patientLabel(patient)}
              </option>
            ))}
          </select>
          <button type="button" className="btn-gold icon-btn" onClick={() => start()} aria-label="Nueva ficha">
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Barra superior de pestañas y botones de exportación */}
        <div className="tabbar no-print" role="tablist" aria-label="Hojas">
          <div className="tabbar-items">
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
          </div>

          <div className="tabbar-actions">
            <button
              type="button"
              className="btn-line"
              onClick={() => window.print()}
              disabled={!active}
              title="Imprimir documento actual"
            >
              <Printer className="h-4 w-4" />
              Imprimir
            </button>
            <button
              type="button"
              className="btn-line"
              onClick={() => void downloadCurrent()}
              disabled={!active || exporting !== null}
              title="Descargar este documento en PDF (formato horizontal o vertical según corresponda)"
            >
              <Download className="h-4 w-4" />
              {exporting === "current" ? "Generando…" : tab === "ficha" ? "PDF (Horizontal)" : "PDF (Hoja)"}
            </button>
            <button
              type="button"
              className="btn-gold"
              onClick={() => void downloadAll()}
              disabled={!active || exporting !== null}
              title="Descargar expediente completo en PDF"
            >
              <FileText className="h-4 w-4" />
              {exporting === "all" ? "Generando expediente…" : "PDF (Expediente)"}
            </button>
          </div>
        </div>

        {notice ? (
          <div className="notice no-print" role="status">
            <span>{notice}</span>
            <button type="button" className="text-xs underline ml-2" onClick={() => setNotice(null)}>
              Cerrar
            </button>
          </div>
        ) : null}

        {/* Contenedor interactivo de la hoja activa */}
        <div className="desk-scroll" ref={currentSheetRef}>
          {active ? (
            <div className="printable-sheet-wrapper">
              <Sheet
                tab={tab}
                tool={tool}
                patient={active}
                onTool={setTool}
                onEdit={onEdit}
                onTooth={(fdi, target) => applyTooth(active.id, fdi, tool, target)}
                onArch={(key) => applyArch(active.id, key, tool)}
              />
            </div>
          ) : (
            <Welcome onStart={start} />
          )}
        </div>
      </div>

      {/* Contenedor de renderizado oculto para exportar todas las hojas a PDF */}
      {exporting === "all" && active ? (
        <div
          ref={allSheetsRef}
          className="pdf-staging-container"
          style={{
            position: "absolute",
            top: 0,
            left: "-9999px",
            width: "1123px",
            background: "#ffffff",
            zIndex: -1,
          }}
        >
          {TABS.map((item) => (
            <div key={item.id} className="pdf-page-container">
              <Sheet
                tab={item.id}
                tool={tool}
                patient={active}
                onTool={setTool}
                onEdit={onEdit}
                onTooth={(fdi, target) => applyTooth(active.id, fdi, tool, target)}
                onArch={(key) => applyArch(active.id, key, tool)}
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
}: {
  tab: TabId;
  tool: Tool;
  patient: Patient;
  onTool: (tool: Tool) => void;
  onEdit: (recipe: (patient: Patient) => Patient) => void;
  onTooth: (fdi: string, target: SurfaceId | "crown") => void;
  onArch: (key: string) => void;
}) {
  if (tab === "ortodoncia") {
    return <OrtodonciaSheet patient={patient} onEdit={onEdit} />;
  }
  if (tab === "odontograma") {
    return (
      <OdontogramaSheet
        patient={patient}
        tool={tool}
        onTool={onTool}
        onEdit={onEdit}
        onTooth={onTooth}
      />
    );
  }
  // Por defecto, la Ficha Clínica Horizontal completa (Díptico Tiro/Retiro)
  return (
    <FichaSheet
      patient={patient}
      tool={tool}
      onTool={onTool}
      onEdit={onEdit}
      onArch={onArch}
    />
  );
}

function Welcome({ onStart }: { onStart: (tab: TabId) => void }) {
  return (
    <section className="sheet-page welcome-page text-center py-16 px-6">
      <StudioLogo className="w-32 h-auto mx-auto mb-4" />
      <h1 className="font-display text-3xl font-bold text-ink">Fichas Clínicas Odontológicas</h1>
      <p className="mt-2 text-sm text-muted max-w-md mx-auto">
        Formatos idénticos a las hojas impresas de Smile Studio: Ficha Clínica Díptico Horizontal, Odontograma Oficial y Control de Ortodoncia.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            className="rounded-full border border-line bg-paper px-4 py-2 text-xs font-semibold text-ink shadow-sm hover:border-gold hover:text-gold-deep transition-colors"
            onClick={() => onStart(item.id)}
          >
            + Abrir {item.label}
          </button>
        ))}
      </div>
    </section>
  );
}
