import { Cell } from "./fields";
import type { Patient } from "@/lib/clinic/model";

export function CitasSheet({
  patient,
  onEdit,
}: {
  patient: Patient;
  onEdit: (recipe: (patient: Patient) => Patient) => void;
}) {
  const citas = patient.citas;
  // Organizar en filas de 2 citas por fila (Fecha Hora | Fecha Hora)
  const rowsCount = 15;

  return (
    <article className="sheet-page citas-page" data-pdf-page>
      {/* Cabecera idéntica a la hoja física */}
      <header className="sheet-mast">
        <img
          src="/smile-banner.png"
          alt="Smile Studio Centro Odontológico"
          className="h-12 w-auto object-contain"
        />
        <div className="mast-contact">
          <p className="font-semibold text-[13px] text-[#1e3a6e]">Av. Grau 877 Piura</p>
          <p className="text-[11px] text-[#3b5998]">(Dentro de consultorios Divino Niño)</p>
          <p className="font-semibold text-[12px] text-[#1e3a6e]">Tel: 949390316 - 961037933</p>
        </div>
      </header>

      {/* Datos del Paciente */}
      <div className="mt-4 space-y-2 text-sm text-[#1e3a6e]">
        <div className="flex items-end gap-2 border-b border-[#3b5998]/40 pb-0.5">
          <span className="font-semibold text-xs min-w-16">Apellidos:</span>
          <input
            className="flex-1 bg-transparent px-1 py-0.5 text-sm text-ink outline-none"
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
        <div className="flex items-end gap-2 border-b border-[#3b5998]/40 pb-0.5">
          <span className="font-semibold text-xs min-w-16">Nombres:</span>
          <input
            className="flex-1 bg-transparent px-1 py-0.5 text-sm text-ink outline-none"
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

      {/* Título de la tabla */}
      <div className="my-5 text-center">
        <h2 className="font-display text-xl font-bold tracking-wider text-[#1e3a6e] uppercase">
          PRÓXIMAS CITAS
        </h2>
      </div>

      {/* Tabla 4 columnas: Fecha | Hora | Fecha | Hora (15 filas) */}
      <div className="citas-table-wrap">
        <table className="w-full border-collapse border border-[#3b5998] text-xs">
          <thead>
            <tr className="bg-[#1e3a6e]/5 text-[#1e3a6e]">
              <th className="border border-[#3b5998] py-1.5 px-2 text-center font-bold w-1/4">Fecha</th>
              <th className="border border-[#3b5998] py-1.5 px-2 text-center font-bold w-1/4">Hora</th>
              <th className="border border-[#3b5998] py-1.5 px-2 text-center font-bold w-1/4">Fecha</th>
              <th className="border border-[#3b5998] py-1.5 px-2 text-center font-bold w-1/4">Hora</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rowsCount }, (_, rowIndex) => {
              const citaLeft = citas[rowIndex] || { fecha: "", hora: "" };
              const citaRight = citas[rowIndex + rowsCount] || { fecha: "", hora: "" };
              return (
                <tr key={rowIndex} className="h-8">
                  <td className="border border-[#3b5998]/60 p-0 text-center">
                    <Cell
                      value={citaLeft.fecha}
                      label={`Fecha cita ${rowIndex + 1}`}
                      placeholder=""
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
                      placeholder=""
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
                      placeholder=""
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
                      placeholder=""
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
    </article>
  );
}
