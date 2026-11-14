import { Cell } from "./fields";
import { StudioLogo } from "./mark";
import type { Patient } from "@/lib/clinic/model";

export function OrtodonciaSheet({
  patient,
  onEdit,
}: {
  patient: Patient;
  onEdit: (recipe: (patient: Patient) => Patient) => void;
}) {
  const rowsCount = 20;

  return (
    <article className="sheet-page orto-page" data-pdf-page>
      {/* Cabecera idéntica a la Foto 7 */}
      <header className="flex items-center gap-4 border-b border-gold/30 pb-3">
        <StudioLogo className="w-24 h-auto object-contain" />
        <div>
          <h2 className="font-display text-2xl font-bold text-[#2a241c] flex items-baseline gap-2">
            <span>Control de</span>
            <span className="font-['Caveat',cursive] text-3xl font-bold text-gold-deep tracking-wide">
              Ortodoncia
            </span>
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Hoja de control del paciente sobre su caso de ortodoncia...
          </p>
        </div>
      </header>

      {/* 4 Cajas Redondeadas en cuadrícula 2x2 (Foto 7) */}
      <div className="my-4 grid grid-cols-2 gap-3 text-xs">
        {/* Nombre */}
        <div className="flex items-center gap-2 rounded-xl border border-[#e8d7c3] bg-[#faf6f0] px-3 py-2">
          <span className="font-bold text-[#6b4c10] min-w-16">Nombre:</span>
          <input
            className="flex-1 bg-transparent px-1 font-medium text-ink outline-none"
            value={patient.nombreCompleto || `${patient.apellidos} ${patient.nombres}`.trim()}
            onChange={(e) => onEdit((p) => ({ ...p, nombreCompleto: e.target.value }))}
          />
        </div>

        {/* Fecha Instalación Superior */}
        <div className="flex items-center gap-2 rounded-xl border border-[#e8d7c3] bg-[#faf6f0] px-3 py-2">
          <span className="font-bold text-[#6b4c10] whitespace-nowrap">Fecha Instalación Superior:</span>
          <input
            className="flex-1 bg-transparent px-1 font-medium text-ink outline-none"
            value={patient.fechaSup}
            placeholder="dd/mm/aaaa"
            onChange={(e) => onEdit((p) => ({ ...p, fechaSup: e.target.value }))}
          />
        </div>

        {/* Cuota Mensual */}
        <div className="flex items-center gap-2 rounded-xl border border-[#e8d7c3] bg-[#faf6f0] px-3 py-2">
          <span className="font-bold text-[#6b4c10] min-w-24">Cuota Mensual:</span>
          <input
            className="flex-1 bg-transparent px-1 font-medium text-ink outline-none"
            value={patient.cuotaMensual}
            placeholder="S/ "
            inputMode="decimal"
            onChange={(e) => onEdit((p) => ({ ...p, cuotaMensual: e.target.value }))}
          />
        </div>

        {/* Fecha Instalación Inferior */}
        <div className="flex items-center gap-2 rounded-xl border border-[#e8d7c3] bg-[#faf6f0] px-3 py-2">
          <span className="font-bold text-[#6b4c10] whitespace-nowrap">Fecha Instalación Inferior:</span>
          <input
            className="flex-1 bg-transparent px-1 font-medium text-ink outline-none"
            value={patient.fechaInf}
            placeholder="dd/mm/aaaa"
            onChange={(e) => onEdit((p) => ({ ...p, fechaInf: e.target.value }))}
          />
        </div>
      </div>

      {/* Tabla de Controles (20 filas con celdas redondeadas y encabezado cálido) */}
      <div className="orto-table-wrap">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-[#ede2d2] text-[#4a3922]">
              <th className="border border-[#d8c5b0] py-1.5 px-2 text-center font-bold w-[18%]">FECHA</th>
              <th className="border border-[#d8c5b0] py-1.5 px-2 text-center font-bold w-[20%]">N° DE CONTROL</th>
              <th className="border border-[#d8c5b0] py-1.5 px-2 text-left font-bold w-[42%]">TRATAMIENTO</th>
              <th className="border border-[#d8c5b0] py-1.5 px-2 text-center font-bold w-[20%]">PAGO MENSUAL</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rowsCount }, (_, idx) => {
              const row = patient.controles[idx] || { fecha: "", nro: "", tratamiento: "", pago: "" };
              return (
                <tr key={idx} className="h-7.5">
                  <td className="border border-[#d8c5b0] p-0 text-center">
                    <Cell
                      value={row.fecha}
                      label={`Fecha control ${idx + 1}`}
                      onChange={(fecha) => {
                        onEdit((p) => {
                          const next = [...p.controles];
                          while (next.length <= idx) next.push({ fecha: "", nro: "", tratamiento: "", pago: "" });
                          next[idx] = { ...next[idx], fecha, nro: next[idx].nro || (fecha ? String(idx + 1) : "") };
                          return { ...p, controles: next };
                        });
                      }}
                    />
                  </td>
                  <td className="border border-[#d8c5b0] p-0 text-center">
                    <Cell
                      value={row.nro}
                      label={`N° de control ${idx + 1}`}
                      inputMode="numeric"
                      onChange={(nro) => {
                        onEdit((p) => {
                          const next = [...p.controles];
                          while (next.length <= idx) next.push({ fecha: "", nro: "", tratamiento: "", pago: "" });
                          next[idx] = { ...next[idx], nro };
                          return { ...p, controles: next };
                        });
                      }}
                    />
                  </td>
                  <td className="border border-[#d8c5b0] p-0 text-left">
                    <Cell
                      value={row.tratamiento}
                      label={`Tratamiento control ${idx + 1}`}
                      onChange={(tratamiento) => {
                        onEdit((p) => {
                          const next = [...p.controles];
                          while (next.length <= idx) next.push({ fecha: "", nro: "", tratamiento: "", pago: "" });
                          next[idx] = { ...next[idx], tratamiento };
                          return { ...p, controles: next };
                        });
                      }}
                    />
                  </td>
                  <td className="border border-[#d8c5b0] p-0 text-center">
                    <Cell
                      value={row.pago}
                      label={`Pago control ${idx + 1}`}
                      inputMode="decimal"
                      onChange={(pago) => {
                        onEdit((p) => {
                          const next = [...p.controles];
                          while (next.length <= idx) next.push({ fecha: "", nro: "", tratamiento: "", pago: "" });
                          next[idx] = { ...next[idx], pago };
                          return { ...p, controles: next };
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
    </article>
  );
}
