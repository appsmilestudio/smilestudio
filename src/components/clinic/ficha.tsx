import { useState } from "react";
import { markColor, type Patient, type Tool, type YesNo } from "@/lib/clinic/model";
import { Cell } from "./fields";

const ANTE_LEFT: { key: keyof Patient["antecedentes"]; label: string }[] = [
  { key: "alergias", label: "Alergias:" },
  { key: "diabetes", label: "Diabetes:" },
  { key: "cardiovascular", label: "Enfermedad Cardiovascular:" },
];

const ANTE_MID: { key: keyof Patient["antecedentes"]; label: string }[] = [
  { key: "hemorragias", label: "Hemorragias:" },
  { key: "gestante", label: "Gestante:" },
];

const ANTE_RIGHT: { key: keyof Patient["antecedentes"]; label: string }[] = [
  { key: "hipertension", label: "Hipertensión:" },
  { key: "renal", label: "Enfermedad Renal:" },
  { key: "otra", label: "Otra enfermedad:" },
];

export function FichaSheet({
  patient,
  tool,
  onTool: _onTool,
  onEdit,
  onArch,
}: {
  patient: Patient;
  tool: Tool;
  onTool: (tool: Tool) => void;
  onEdit: (recipe: (patient: Patient) => Patient) => void;
  onArch: (key: string) => void;
  onCopy?: () => void;
}) {
  const [viewSide, setViewSide] = useState<"both" | "front" | "back">("both");

  return (
    <div className="space-y-6">
      {/* Selector de cara para previsualización en pantalla */}
      <div className="no-print flex items-center justify-between bg-paper border border-line rounded-xl px-4 py-2.5 text-xs text-ink shadow-sm">
        <span className="font-semibold text-gold-deep">
          Documento Único en Formato Horizontal (Díptico Tiro/Retiro A4):
        </span>
        <div className="flex gap-1">
          <button
            type="button"
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${viewSide === "both" ? "bg-ink text-paper" : "bg-cream/60 hover:bg-cream text-ink"}`}
            onClick={() => setViewSide("both")}
          >
            Ver ambas caras
          </button>
          <button
            type="button"
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${viewSide === "front" ? "bg-ink text-paper" : "bg-cream/60 hover:bg-cream text-ink"}`}
            onClick={() => setViewSide("front")}
          >
            Cara 1: Ficha y Citas
          </button>
          <button
            type="button"
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${viewSide === "back" ? "bg-ink text-paper" : "bg-cream/60 hover:bg-cream text-ink"}`}
            onClick={() => setViewSide("back")}
          >
            Cara 2: Plan y Presupuesto
          </button>
        </div>
      </div>

      {/* CARA 1: Ficha Clínica (Izq) + Próximas Citas (Der) en formato horizontal */}
      {(viewSide === "both" || viewSide === "front") && (
        <article
          className="sheet-page landscape-sheet-page"
          data-pdf-page
          data-orientation="landscape"
        >
          <div className="landscape-spread">
            {/* Panel Izquierdo: Ficha Clínica y Odontograma Concéntrico */}
            <div className="spread-panel spread-left">
              <FichaClinicaPanel
                patient={patient}
                tool={tool}
                onEdit={onEdit}
                onArch={onArch}
              />
            </div>

            {/* Línea de pliegue central del díptico */}
            <div className="spread-fold" aria-hidden />

            {/* Panel Derecho: Próximas Citas */}
            <div className="spread-panel spread-right">
              <ProximasCitasPanel patient={patient} onEdit={onEdit} />
            </div>
          </div>
        </article>
      )}

      {/* CARA 2: Plan de Tratamiento (Izq) + Presupuesto y Evolución (Der) en formato horizontal */}
      {(viewSide === "both" || viewSide === "back") && (
        <article
          className="sheet-page landscape-sheet-page"
          data-pdf-page
          data-orientation="landscape"
        >
          <div className="landscape-spread">
            {/* Panel Izquierdo: Plan de Tratamiento */}
            <div className="spread-panel spread-left">
              <PlanTratamientoPanel patient={patient} onEdit={onEdit} />
            </div>

            {/* Línea de pliegue central del díptico */}
            <div className="spread-fold" aria-hidden />

            {/* Panel Derecho: Presupuesto y Evolución */}
            <div className="spread-panel spread-right">
              <PresupuestoEvolucionPanel patient={patient} onEdit={onEdit} />
            </div>
          </div>
        </article>
      )}
    </div>
  );
}

/**
 * Panel Ficha Clínica: Datos personales, antecedentes y odontograma concéntrico.
 */
function FichaClinicaPanel({
  patient,
  tool,
  onEdit,
  onArch,
}: {
  patient: Patient;
  tool: Tool;
  onEdit: (recipe: (patient: Patient) => Patient) => void;
  onArch: (key: string) => void;
}) {
  const setAnte = (key: keyof Patient["antecedentes"], value: YesNo) =>
    onEdit((p) => ({ ...p, antecedentes: { ...p.antecedentes, [key]: value } }));

  return (
    <div className="h-full flex flex-col justify-between text-xs text-[#1e3a6e]">
      {/* Cabecera */}
      <header className="flex items-center justify-between border-b border-[#1e3a6e] pb-1 mb-2">
        <img
          src="/smile-banner.png"
          alt="Smile Studio Centro Odontológico"
          className="h-9 w-auto object-contain"
        />
        <div className="text-right text-[10px] leading-tight text-[#1e3a6e]">
          <p className="font-semibold text-[11px]">Av. Grau 877 Piura</p>
          <p className="text-[9.5px] text-[#3b5998]">(Dentro de consultorios Divino Niño)</p>
          <p className="font-semibold">Tel: 949390316 - 961037933</p>
        </div>
      </header>

      {/* Datos personales */}
      <div className="space-y-1 text-[11px]">
        <div className="grid grid-cols-12 gap-2 items-end">
          <div className="col-span-8 flex items-end gap-1 border-b border-[#3b5998]/50 pb-0.5">
            <span className="font-bold min-w-14">Apellidos:</span>
            <input
              className="flex-1 bg-transparent px-1 text-[11px] text-ink outline-none"
              value={patient.apellidos}
              onChange={(e) =>
                onEdit((p) => ({
                  ...p,
                  apellidos: e.target.value,
                  nombreCompleto: p.nombreCompleto.trim()
                    ? p.nombreCompleto
                    : `${e.target.value} ${p.nombres}`.trim(),
                }))
              }
            />
          </div>
          <div className="col-span-4 flex items-end gap-1 border-b border-[#3b5998]/50 pb-0.5">
            <span className="font-bold min-w-10">Fecha:</span>
            <input
              className="flex-1 bg-transparent px-1 text-[11px] text-ink outline-none"
              value={patient.fecha}
              onChange={(e) => onEdit((p) => ({ ...p, fecha: e.target.value }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-12 gap-2 items-end">
          <div className="col-span-8 flex items-end gap-1 border-b border-[#3b5998]/50 pb-0.5">
            <span className="font-bold min-w-14">Nombres:</span>
            <input
              className="flex-1 bg-transparent px-1 text-[11px] text-ink outline-none"
              value={patient.nombres}
              onChange={(e) =>
                onEdit((p) => ({
                  ...p,
                  nombres: e.target.value,
                  nombreCompleto: p.nombreCompleto.trim()
                    ? p.nombreCompleto
                    : `${p.apellidos} ${e.target.value}`.trim(),
                }))
              }
            />
          </div>
          <div className="col-span-4 flex items-end gap-1 border-b border-[#3b5998]/50 pb-0.5">
            <span className="font-bold min-w-10">Teléfono:</span>
            <input
              className="flex-1 bg-transparent px-1 text-[11px] text-ink outline-none"
              value={patient.telefono}
              inputMode="tel"
              onChange={(e) => onEdit((p) => ({ ...p, telefono: e.target.value }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-12 gap-2 items-end">
          <div className="col-span-8 flex items-end gap-1 border-b border-[#3b5998]/50 pb-0.5">
            <span className="font-bold min-w-14">Dirección:</span>
            <input
              className="flex-1 bg-transparent px-1 text-[11px] text-ink outline-none"
              value={patient.direccion}
              onChange={(e) => onEdit((p) => ({ ...p, direccion: e.target.value }))}
            />
          </div>
          <div className="col-span-4 flex items-end gap-1 border-b border-[#3b5998]/50 pb-0.5">
            <span className="font-bold min-w-14">Fecha Nac.:</span>
            <input
              className="flex-1 bg-transparent px-1 text-[11px] text-ink outline-none"
              value={patient.fechaNac}
              onChange={(e) => onEdit((p) => ({ ...p, fechaNac: e.target.value }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-12 gap-2 items-end">
          <div className="col-span-8 flex items-end justify-end gap-1 border-b border-[#3b5998]/50 pb-0.5">
            <span className="font-bold">DNI:</span>
            <input
              className="w-36 bg-transparent px-1 text-[11px] text-ink outline-none"
              value={patient.dni}
              inputMode="numeric"
              onChange={(e) => onEdit((p) => ({ ...p, dni: e.target.value }))}
            />
          </div>
          <div className="col-span-4 flex items-end gap-1 border-b border-[#3b5998]/50 pb-0.5">
            <span className="font-bold min-w-10">Edad:</span>
            <input
              className="flex-1 bg-transparent px-1 text-[11px] text-ink outline-none"
              value={patient.edad}
              onChange={(e) => onEdit((p) => ({ ...p, edad: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* Antecedentes */}
      <div className="my-1.5 text-[10px]">
        <p className="font-bold uppercase tracking-wide text-[#1e3a6e]">Antecedentes:</p>
        <div className="mt-0.5 grid grid-cols-3 gap-x-2 gap-y-0.5">
          <div className="space-y-0.5">
            {ANTE_LEFT.map((item) => (
              <AnteRow
                key={item.key}
                label={item.label}
                value={patient.antecedentes[item.key]}
                onChange={(val) => setAnte(item.key, val)}
              />
            ))}
          </div>
          <div className="space-y-0.5">
            {ANTE_MID.map((item) => (
              <AnteRow
                key={item.key}
                label={item.label}
                value={patient.antecedentes[item.key]}
                onChange={(val) => setAnte(item.key, val)}
              />
            ))}
          </div>
          <div className="space-y-0.5">
            {ANTE_RIGHT.map((item) => (
              <AnteRow
                key={item.key}
                label={item.label}
                value={patient.antecedentes[item.key]}
                onChange={(val) => setAnte(item.key, val)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Líneas de consulta médica */}
      <div className="space-y-1 text-[10.5px]">
        <div className="flex items-end gap-1 border-b border-[#3b5998]/50 pb-0.5">
          <span className="font-bold whitespace-nowrap">Motivo de la consulta:</span>
          <input
            className="flex-1 bg-transparent px-1 text-[10.5px] text-ink outline-none"
            value={patient.motivo}
            onChange={(e) => onEdit((p) => ({ ...p, motivo: e.target.value }))}
          />
        </div>
        <div className="flex items-end gap-1 border-b border-[#3b5998]/50 pb-0.5">
          <span className="font-bold whitespace-nowrap">Está tomando algún medicamento:</span>
          <input
            className="flex-1 bg-transparent px-1 text-[10.5px] text-ink outline-none"
            value={patient.medicamento}
            onChange={(e) => onEdit((p) => ({ ...p, medicamento: e.target.value }))}
          />
        </div>
        <div className="flex items-end gap-1 border-b border-[#3b5998]/50 pb-0.5">
          <span className="font-bold whitespace-nowrap">Examen clínico general:</span>
          <input
            className="flex-1 bg-transparent px-1 text-[10.5px] text-ink outline-none"
            value={patient.examen}
            onChange={(e) => onEdit((p) => ({ ...p, examen: e.target.value }))}
          />
        </div>
      </div>

      {/* Odontograma Concéntrico (Circular idéntico a la Foto 1) */}
      <div className="my-1">
        <ConcentricOdontograma
          arch={patient.arch}
          activeTool={tool}
          onToothClick={onArch}
        />
      </div>

      {/* Observaciones */}
      <div className="flex items-end gap-1 border-b border-[#3b5998]/50 pb-0.5 text-[10.5px]">
        <span className="font-bold whitespace-nowrap">Observaciones:</span>
        <input
          className="flex-1 bg-transparent px-1 text-[10.5px] text-ink outline-none"
          value={patient.observacionesHistoria}
          onChange={(e) => onEdit((p) => ({ ...p, observacionesHistoria: e.target.value }))}
        />
      </div>
    </div>
  );
}

/**
 * Panel Próximas Citas: Cabecera, apellidos, nombres y tabla de 4 columnas (15 filas).
 */
function ProximasCitasPanel({
  patient,
  onEdit,
}: {
  patient: Patient;
  onEdit: (recipe: (patient: Patient) => Patient) => void;
}) {
  const citas = patient.citas;
  const rowsCount = 15;

  return (
    <div className="h-full flex flex-col justify-between text-xs text-[#1e3a6e]">
      {/* Cabecera */}
      <header className="flex items-center justify-between border-b border-[#1e3a6e] pb-1 mb-2">
        <img
          src="/smile-banner.png"
          alt="Smile Studio Centro Odontológico"
          className="h-9 w-auto object-contain"
        />
        <div className="text-right text-[10px] leading-tight text-[#1e3a6e]">
          <p className="font-semibold text-[11px]">Av. Grau 877 Piura</p>
          <p className="text-[9.5px] text-[#3b5998]">(Dentro de consultorios Divino Niño)</p>
          <p className="font-semibold">Tel: 949390316 - 961037933</p>
        </div>
      </header>

      {/* Apellidos y Nombres */}
      <div className="space-y-1.5 text-[11px] mb-3">
        <div className="flex items-end gap-2 border-b border-[#3b5998]/50 pb-0.5">
          <span className="font-bold min-w-16">Apellidos:</span>
          <input
            className="flex-1 bg-transparent px-1 text-[11px] text-ink outline-none"
            value={patient.apellidos}
            onChange={(e) =>
              onEdit((p) => ({
                ...p,
                apellidos: e.target.value,
                nombreCompleto: p.nombreCompleto.trim()
                  ? p.nombreCompleto
                  : `${e.target.value} ${p.nombres}`.trim(),
              }))
            }
          />
        </div>
        <div className="flex items-end gap-2 border-b border-[#3b5998]/50 pb-0.5">
          <span className="font-bold min-w-16">Nombres:</span>
          <input
            className="flex-1 bg-transparent px-1 text-[11px] text-ink outline-none"
            value={patient.nombres}
            onChange={(e) =>
              onEdit((p) => ({
                ...p,
                nombres: e.target.value,
                nombreCompleto: p.nombreCompleto.trim()
                  ? p.nombreCompleto
                  : `${p.apellidos} ${e.target.value}`.trim(),
              }))
            }
          />
        </div>
      </div>

      {/* Título */}
      <div className="my-2 text-center">
        <h3 className="font-display text-base font-bold tracking-widest text-[#1e3a6e] uppercase">
          PRÓXIMAS CITAS
        </h3>
      </div>

      {/* Tabla 4 columnas: Fecha | Hora | Fecha | Hora (15 filas) */}
      <div className="flex-1 flex flex-col justify-center">
        <table className="w-full border-collapse border border-[#3b5998] text-[10.5px]">
          <thead>
            <tr className="bg-[#1e3a6e]/5 text-[#1e3a6e]">
              <th className="border border-[#3b5998] py-1 px-1.5 text-center font-bold w-1/4">Fecha</th>
              <th className="border border-[#3b5998] py-1 px-1.5 text-center font-bold w-1/4">Hora</th>
              <th className="border border-[#3b5998] py-1 px-1.5 text-center font-bold w-1/4">Fecha</th>
              <th className="border border-[#3b5998] py-1 px-1.5 text-center font-bold w-1/4">Hora</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rowsCount }, (_, rowIndex) => {
              const citaLeft = citas[rowIndex] || { fecha: "", hora: "" };
              const citaRight = citas[rowIndex + rowsCount] || { fecha: "", hora: "" };
              return (
                <tr key={rowIndex} className="h-6">
                  <td className="border border-[#3b5998]/60 p-0 text-center">
                    <Cell
                      value={citaLeft.fecha}
                      label={`Fecha cita ${rowIndex + 1}`}
                      onChange={(fecha) => {
                        onEdit((p) => {
                          const next = [...p.citas];
                          while (next.length <= rowIndex) next.push({ fecha: "", hora: "" });
                          next[rowIndex] = { ...next[rowIndex], fecha };
                          return { ...p, citas: next };
                        });
                      }}
                    />
                  </td>
                  <td className="border border-[#3b5998]/60 p-0 text-center">
                    <Cell
                      value={citaLeft.hora}
                      label={`Hora cita ${rowIndex + 1}`}
                      onChange={(hora) => {
                        onEdit((p) => {
                          const next = [...p.citas];
                          while (next.length <= rowIndex) next.push({ fecha: "", hora: "" });
                          next[rowIndex] = { ...next[rowIndex], hora };
                          return { ...p, citas: next };
                        });
                      }}
                    />
                  </td>
                  <td className="border border-[#3b5998]/60 p-0 text-center">
                    <Cell
                      value={citaRight.fecha}
                      label={`Fecha cita ${rowIndex + rowsCount + 1}`}
                      onChange={(fecha) => {
                        onEdit((p) => {
                          const next = [...p.citas];
                          while (next.length <= rowIndex + rowsCount) next.push({ fecha: "", hora: "" });
                          next[rowIndex + rowsCount] = { ...next[rowIndex + rowsCount], fecha };
                          return { ...p, citas: next };
                        });
                      }}
                    />
                  </td>
                  <td className="border border-[#3b5998]/60 p-0 text-center">
                    <Cell
                      value={citaRight.hora}
                      label={`Hora cita ${rowIndex + rowsCount + 1}`}
                      onChange={(hora) => {
                        onEdit((p) => {
                          const next = [...p.citas];
                          while (next.length <= rowIndex + rowsCount) next.push({ fecha: "", hora: "" });
                          next[rowIndex + rowsCount] = { ...next[rowIndex + rowsCount], hora };
                          return { ...p, citas: next };
                        });
                      }}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Panel Plan de Tratamiento (22 filas).
 */
function PlanTratamientoPanel({
  patient,
  onEdit,
}: {
  patient: Patient;
  onEdit: (recipe: (patient: Patient) => Patient) => void;
}) {
  return (
    <div className="h-full flex flex-col justify-between text-xs text-[#1e3a6e]">
      <header className="mb-2 border-b border-[#1e3a6e] pb-1">
        <h3 className="font-display text-sm font-bold tracking-wider uppercase text-[#1e3a6e]">
          PLAN DE TRATAMIENTO
        </h3>
      </header>

      <div className="flex-1 flex flex-col justify-center">
        <table className="w-full border-collapse border border-[#3b5998] text-[10px]">
          <thead>
            <tr className="bg-[#1e3a6e]/5 text-[#1e3a6e]">
              <th className="border border-[#3b5998] py-1 px-1.5 text-center font-bold w-[16%]">Fecha</th>
              <th className="border border-[#3b5998] py-1 px-1.5 text-left font-bold w-[54%]">Tratamiento</th>
              <th className="border border-[#3b5998] py-1 px-1.5 text-center font-bold w-[15%]">Pago</th>
              <th className="border border-[#3b5998] py-1 px-1.5 text-center font-bold w-[15%]">Saldo</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 22 }, (_, idx) => {
              const row = patient.planRows[idx] || { fecha: "", tratamiento: "", pago: "", saldo: "" };
              return (
                <tr key={idx} className="h-5.5">
                  <td className="border border-[#3b5998]/60 p-0 text-center">
                    <Cell
                      value={row.fecha}
                      label={`Fecha plan ${idx + 1}`}
                      onChange={(fecha) => {
                        onEdit((p) => {
                          const next = [...p.planRows];
                          while (next.length <= idx) next.push({ fecha: "", tratamiento: "", pago: "", saldo: "" });
                          next[idx] = { ...next[idx], fecha };
                          return { ...p, planRows: next };
                        });
                      }}
                    />
                  </td>
                  <td className="border border-[#3b5998]/60 p-0 text-left">
                    <Cell
                      value={row.tratamiento}
                      label={`Tratamiento ${idx + 1}`}
                      onChange={(tratamiento) => {
                        onEdit((p) => {
                          const next = [...p.planRows];
                          while (next.length <= idx) next.push({ fecha: "", tratamiento: "", pago: "", saldo: "" });
                          next[idx] = { ...next[idx], tratamiento };
                          return { ...p, planRows: next };
                        });
                      }}
                    />
                  </td>
                  <td className="border border-[#3b5998]/60 p-0 text-center">
                    <Cell
                      value={row.pago}
                      label={`Pago ${idx + 1}`}
                      inputMode="decimal"
                      onChange={(pago) => {
                        onEdit((p) => {
                          const next = [...p.planRows];
                          while (next.length <= idx) next.push({ fecha: "", tratamiento: "", pago: "", saldo: "" });
                          next[idx] = { ...next[idx], pago };
                          return { ...p, planRows: next };
                        });
                      }}
                    />
                  </td>
                  <td className="border border-[#3b5998]/60 p-0 text-center">
                    <Cell
                      value={row.saldo}
                      label={`Saldo ${idx + 1}`}
                      inputMode="decimal"
                      onChange={(saldo) => {
                        onEdit((p) => {
                          const next = [...p.planRows];
                          while (next.length <= idx) next.push({ fecha: "", tratamiento: "", pago: "", saldo: "" });
                          next[idx] = { ...next[idx], saldo };
                          return { ...p, planRows: next };
                        });
                      }}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Panel Presupuesto (9 filas) y Evolución (16 filas).
 */
function PresupuestoEvolucionPanel({
  patient,
  onEdit,
}: {
  patient: Patient;
  onEdit: (recipe: (patient: Patient) => Patient) => void;
}) {
  return (
    <div className="h-full flex flex-col justify-between text-xs text-[#1e3a6e]">
      {/* Tabla Presupuesto */}
      <section className="mb-2">
        <table className="w-full border-collapse border border-[#3b5998] text-[10px]">
          <thead>
            <tr className="bg-[#1e3a6e]/5 text-[#1e3a6e]">
              <th className="border border-[#3b5998] py-1 px-2 text-left font-bold w-[65%]">Presupuesto</th>
              <th className="border border-[#3b5998] py-1 px-1.5 text-center font-bold w-[17%]">Precio Unit.</th>
              <th className="border border-[#3b5998] py-1 px-1.5 text-center font-bold w-[18%]">Precio Total</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 9 }, (_, idx) => {
              const row = patient.presupuesto[idx] || { concepto: "", unit: "", total: "" };
              return (
                <tr key={idx} className="h-5.5">
                  <td className="border border-[#3b5998]/60 p-0 text-left">
                    <Cell
                      value={row.concepto}
                      label={`Presupuesto ${idx + 1}`}
                      onChange={(concepto) => {
                        onEdit((p) => {
                          const next = [...p.presupuesto];
                          while (next.length <= idx) next.push({ concepto: "", unit: "", total: "" });
                          next[idx] = { ...next[idx], concepto };
                          return { ...p, presupuesto: next };
                        });
                      }}
                    />
                  </td>
                  <td className="border border-[#3b5998]/60 p-0 text-center">
                    <Cell
                      value={row.unit}
                      label={`Precio unitario ${idx + 1}`}
                      inputMode="decimal"
                      onChange={(unit) => {
                        onEdit((p) => {
                          const next = [...p.presupuesto];
                          while (next.length <= idx) next.push({ concepto: "", unit: "", total: "" });
                          next[idx] = { ...next[idx], unit };
                          return { ...p, presupuesto: next };
                        });
                      }}
                    />
                  </td>
                  <td className="border border-[#3b5998]/60 p-0 text-center">
                    <Cell
                      value={row.total}
                      label={`Precio total ${idx + 1}`}
                      inputMode="decimal"
                      onChange={(total) => {
                        onEdit((p) => {
                          const next = [...p.presupuesto];
                          while (next.length <= idx) next.push({ concepto: "", unit: "", total: "" });
                          next[idx] = { ...next[idx], total };
                          return { ...p, presupuesto: next };
                        });
                      }}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* Tabla Evolución */}
      <section className="flex-1 flex flex-col justify-end">
        <div className="mb-1">
          <h4 className="font-bold text-xs text-[#1e3a6e]">Evolución:</h4>
        </div>
        <table className="w-full border-collapse border border-[#3b5998] text-[10px]">
          <thead>
            <tr className="bg-[#1e3a6e]/5 text-[#1e3a6e]">
              <th className="border border-[#3b5998] py-1 px-1.5 text-center font-bold w-[16%]">Fecha</th>
              <th className="border border-[#3b5998] py-1 px-1.5 text-left font-bold w-[54%]">Tratamiento</th>
              <th className="border border-[#3b5998] py-1 px-1.5 text-center font-bold w-[15%]">Saldo</th>
              <th className="border border-[#3b5998] py-1 px-1.5 text-center font-bold w-[15%]">Pago</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 16 }, (_, idx) => {
              const row = patient.evolucion[idx] || { fecha: "", tratamiento: "", saldo: "", pago: "" };
              return (
                <tr key={idx} className="h-5.5">
                  <td className="border border-[#3b5998]/60 p-0 text-center">
                    <Cell
                      value={row.fecha}
                      label={`Fecha evolución ${idx + 1}`}
                      onChange={(fecha) => {
                        onEdit((p) => {
                          const next = [...p.evolucion];
                          while (next.length <= idx) next.push({ fecha: "", tratamiento: "", saldo: "", pago: "" });
                          next[idx] = { ...next[idx], fecha };
                          return { ...p, evolucion: next };
                        });
                      }}
                    />
                  </td>
                  <td className="border border-[#3b5998]/60 p-0 text-left">
                    <Cell
                      value={row.tratamiento}
                      label={`Tratamiento evolución ${idx + 1}`}
                      onChange={(tratamiento) => {
                        onEdit((p) => {
                          const next = [...p.evolucion];
                          while (next.length <= idx) next.push({ fecha: "", tratamiento: "", saldo: "", pago: "" });
                          next[idx] = { ...next[idx], tratamiento };
                          return { ...p, evolucion: next };
                        });
                      }}
                    />
                  </td>
                  <td className="border border-[#3b5998]/60 p-0 text-center">
                    <Cell
                      value={row.saldo}
                      label={`Saldo evolución ${idx + 1}`}
                      inputMode="decimal"
                      onChange={(saldo) => {
                        onEdit((p) => {
                          const next = [...p.evolucion];
                          while (next.length <= idx) next.push({ fecha: "", tratamiento: "", saldo: "", pago: "" });
                          next[idx] = { ...next[idx], saldo };
                          return { ...p, evolucion: next };
                        });
                      }}
                    />
                  </td>
                  <td className="border border-[#3b5998]/60 p-0 text-center">
                    <Cell
                      value={row.pago}
                      label={`Pago evolución ${idx + 1}`}
                      inputMode="decimal"
                      onChange={(pago) => {
                        onEdit((p) => {
                          const next = [...p.evolucion];
                          while (next.length <= idx) next.push({ fecha: "", tratamiento: "", saldo: "", pago: "" });
                          next[idx] = { ...next[idx], pago };
                          return { ...p, evolucion: next };
                        });
                      }}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function AnteRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: YesNo;
  onChange: (v: YesNo) => void;
}) {
  return (
    <div className="flex items-center justify-between text-[9.5px] leading-tight">
      <span className="font-medium">{label}</span>
      <div className="flex items-center gap-1 font-normal">
        <button
          type="button"
          onClick={() => onChange(value === "si" ? "" : "si")}
          className="hover:opacity-75 focus:outline-none"
        >
          Si( {value === "si" ? <span className="font-bold text-[#1e3a6e]">✓</span> : " "} )
        </button>
        <button
          type="button"
          onClick={() => onChange(value === "no" ? "" : "no")}
          className="hover:opacity-75 focus:outline-none"
        >
          No( {value === "no" ? <span className="font-bold text-[#1e3a6e]">✓</span> : " "} )
        </button>
      </div>
    </div>
  );
}

function ConcentricOdontograma({
  arch,
  activeTool: _activeTool,
  onToothClick,
}: {
  arch: Record<string, string>;
  activeTool: Tool;
  onToothClick: (id: string) => void;
}) {
  const cx = 240;
  const cy = 180;

  const upperAdult = Array.from({ length: 16 }, (_, i) => String(i + 1));
  const upperDeciduous = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
  const lowerDeciduous = ["T", "S", "R", "Q", "P", "O", "N", "M", "L", "K"];
  const lowerAdult = ["32", "31", "30", "29", "28", "27", "26", "25", "24", "23", "22", "21", "20", "19", "18", "17"];

  return (
    <div className="relative mx-auto flex flex-col items-center select-none">
      <svg
        viewBox="0 0 480 360"
        className="w-full max-w-[420px] h-auto text-[#1e3a6e]"
      >
        <ellipse cx={cx} cy={cy} rx="180" ry="140" fill="none" stroke="#3b5998" strokeWidth="0.6" strokeDasharray="3 3" opacity="0.4" />
        <ellipse cx={cx} cy={cy} rx="118" ry="88" fill="none" stroke="#3b5998" strokeWidth="0.6" strokeDasharray="3 3" opacity="0.4" />

        <text x={cx} y="16" textAnchor="middle" className="text-[10px] font-black fill-[#1e3a6e] tracking-widest uppercase">
          VESTIBULAR
        </text>
        <text x={cx} y={cy - 42} textAnchor="middle" className="text-[9px] font-bold fill-[#1e3a6e] tracking-wider uppercase">
          PALATINO
        </text>
        <text x="36" y={cy + 4} textAnchor="middle" className="text-[9.5px] font-bold fill-[#1e3a6e] tracking-wider uppercase">
          DERECHA
        </text>
        <text x="444" y={cy + 4} textAnchor="middle" className="text-[9.5px] font-bold fill-[#1e3a6e] tracking-wider uppercase">
          IZQUIERDA
        </text>
        <text x={cx} y={cy + 48} textAnchor="middle" className="text-[9px] font-bold fill-[#1e3a6e] tracking-wider uppercase">
          LINGUAL
        </text>
        <text x={cx} y="352" textAnchor="middle" className="text-[10px] font-black fill-[#1e3a6e] tracking-widest uppercase">
          VESTIBULAR
        </text>

        {upperAdult.map((label, i) => {
          const deg = 175 - (i / 15) * 170;
          const rad = (deg * Math.PI) / 180;
          const tx = cx + Math.cos(rad) * 180;
          const ty = cy - Math.sin(rad) * 140;
          const lx = cx + Math.cos(rad) * 158;
          const ly = cy - Math.sin(rad) * 120;
          const mark = arch[`u${label}`] || "";

          return (
            <g key={`u${label}`} className="cursor-pointer group" onClick={() => onToothClick(`u${label}`)}>
              <circle
                cx={tx}
                cy={ty}
                r="10"
                fill={mark ? markColor(mark) : "#ffffff"}
                stroke="#1e3a6e"
                strokeWidth="1.1"
                strokeDasharray={mark === "ausente" ? "2 2" : undefined}
                className="transition-colors group-hover:stroke-gold"
              />
              <line x1={tx - 10} y1={ty} x2={tx + 10} y2={ty} stroke="#1e3a6e" strokeWidth="0.7" />
              <line x1={tx} y1={ty - 10} x2={tx} y2={ty + 10} stroke="#1e3a6e" strokeWidth="0.7" />
              <circle cx={tx} cy={ty} r="3.8" fill={mark ? markColor(mark) : "#ffffff"} stroke="#1e3a6e" strokeWidth="0.7" />
              {mark === "extraccion" && (
                <path d={`M${tx - 7} ${ty - 7} L${tx + 7} ${ty + 7} M${tx + 7} ${ty - 7} L${tx - 7} ${ty + 7}`} stroke="#c2414b" strokeWidth="1.8" />
              )}
              <text x={lx} y={ly + 3} textAnchor="middle" className="text-[8.5px] font-extrabold fill-[#1e3a6e]">
                {label}
              </text>
            </g>
          );
        })}

        {upperDeciduous.map((label, i) => {
          const deg = 160 - (i / 9) * 140;
          const rad = (deg * Math.PI) / 180;
          const tx = cx + Math.cos(rad) * 118;
          const ty = cy - Math.sin(rad) * 88;
          const lx = cx + Math.cos(rad) * 98;
          const ly = cy - Math.sin(rad) * 70;
          const mark = arch[`p${label}`] || "";

          return (
            <g key={`p${label}`} className="cursor-pointer group" onClick={() => onToothClick(`p${label}`)}>
              <circle
                cx={tx}
                cy={ty}
                r="8"
                fill={mark ? markColor(mark) : "#ffffff"}
                stroke="#1e3a6e"
                strokeWidth="1"
                strokeDasharray={mark === "ausente" ? "2 2" : undefined}
                className="transition-colors group-hover:stroke-gold"
              />
              <line x1={tx - 8} y1={ty} x2={tx + 8} y2={ty} stroke="#1e3a6e" strokeWidth="0.6" />
              <line x1={tx} y1={ty - 8} x2={tx} y2={ty + 8} stroke="#1e3a6e" strokeWidth="0.6" />
              <circle cx={tx} cy={ty} r="2.8" fill={mark ? markColor(mark) : "#ffffff"} stroke="#1e3a6e" strokeWidth="0.6" />
              {mark === "extraccion" && (
                <path d={`M${tx - 5} ${ty - 5} L${tx + 5} ${ty + 5} M${tx + 5} ${ty - 5} L${tx - 5} ${ty + 5}`} stroke="#c2414b" strokeWidth="1.5" />
              )}
              <text x={lx} y={ly + 3} textAnchor="middle" className="text-[8.5px] font-extrabold fill-[#1e3a6e]">
                {label}
              </text>
            </g>
          );
        })}

        {lowerDeciduous.map((label, i) => {
          const deg = 200 + (i / 9) * 140;
          const rad = (deg * Math.PI) / 180;
          const tx = cx + Math.cos(rad) * 118;
          const ty = cy - Math.sin(rad) * 88;
          const lx = cx + Math.cos(rad) * 98;
          const ly = cy - Math.sin(rad) * 70;
          const mark = arch[`p${label}`] || "";

          return (
            <g key={`p${label}`} className="cursor-pointer group" onClick={() => onToothClick(`p${label}`)}>
              <circle
                cx={tx}
                cy={ty}
                r="8"
                fill={mark ? markColor(mark) : "#ffffff"}
                stroke="#1e3a6e"
                strokeWidth="1"
                strokeDasharray={mark === "ausente" ? "2 2" : undefined}
                className="transition-colors group-hover:stroke-gold"
              />
              <line x1={tx - 8} y1={ty} x2={tx + 8} y2={ty} stroke="#1e3a6e" strokeWidth="0.6" />
              <line x1={tx} y1={ty - 8} x2={tx} y2={ty + 8} stroke="#1e3a6e" strokeWidth="0.6" />
              <circle cx={tx} cy={ty} r="2.8" fill={mark ? markColor(mark) : "#ffffff"} stroke="#1e3a6e" strokeWidth="0.6" />
              {mark === "extraccion" && (
                <path d={`M${tx - 5} ${ty - 5} L${tx + 5} ${ty + 5} M${tx + 5} ${ty - 5} L${tx - 5} ${ty + 5}`} stroke="#c2414b" strokeWidth="1.5" />
              )}
              <text x={lx} y={ly + 3} textAnchor="middle" className="text-[8.5px] font-extrabold fill-[#1e3a6e]">
                {label}
              </text>
            </g>
          );
        })}

        {lowerAdult.map((label, i) => {
          const deg = 185 + (i / 15) * 170;
          const rad = (deg * Math.PI) / 180;
          const tx = cx + Math.cos(rad) * 180;
          const ty = cy - Math.sin(rad) * 140;
          const lx = cx + Math.cos(rad) * 158;
          const ly = cy - Math.sin(rad) * 120;
          const mark = arch[`u${label}`] || "";

          return (
            <g key={`u${label}`} className="cursor-pointer group" onClick={() => onToothClick(`u${label}`)}>
              <circle
                cx={tx}
                cy={ty}
                r="10"
                fill={mark ? markColor(mark) : "#ffffff"}
                stroke="#1e3a6e"
                strokeWidth="1.1"
                strokeDasharray={mark === "ausente" ? "2 2" : undefined}
                className="transition-colors group-hover:stroke-gold"
              />
              <line x1={tx - 10} y1={ty} x2={tx + 10} y2={ty} stroke="#1e3a6e" strokeWidth="0.7" />
              <line x1={tx} y1={ty - 10} x2={tx} y2={ty + 10} stroke="#1e3a6e" strokeWidth="0.7" />
              <circle cx={tx} cy={ty} r="3.8" fill={mark ? markColor(mark) : "#ffffff"} stroke="#1e3a6e" strokeWidth="0.7" />
              {mark === "extraccion" && (
                <path d={`M${tx - 7} ${ty - 7} L${tx + 7} ${ty + 7} M${tx + 7} ${ty - 7} L${tx - 7} ${ty + 7}`} stroke="#c2414b" strokeWidth="1.8" />
              )}
              <text x={lx} y={ly + 3} textAnchor="middle" className="text-[8.5px] font-extrabold fill-[#1e3a6e]">
                {label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
