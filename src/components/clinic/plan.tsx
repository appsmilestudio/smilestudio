import { Cell } from "./fields";
import type { Patient } from "@/lib/clinic/model";

export function PlanSheet({
  patient,
  onEdit,
}: {
  patient: Patient;
  onEdit: (recipe: (patient: Patient) => Patient) => void;
}) {
  return (
    <div className="space-y-6">
      {/* 1. Hoja A4: Plan de Tratamiento (Foto 5 Izquierda) */}
      <article className="sheet-page plan-page" data-pdf-page>
        <header className="mb-4">
          <div className="flex items-center justify-between border-b-2 border-[#1e3a6e] pb-2">
            <h2 className="font-display text-xl font-bold tracking-wider text-[#1e3a6e] uppercase">
              PLAN DE TRATAMIENTO
            </h2>
            <div className="text-right text-xs text-[#1e3a6e]">
              <span className="font-semibold">{patient.nombreCompleto || `${patient.apellidos} ${patient.nombres}`.trim()}</span>
              {patient.dni ? <span> · DNI: {patient.dni}</span> : null}
            </div>
          </div>
        </header>

        <div className="plan-table-wrap">
          <table className="w-full border-collapse border border-[#3b5998] text-xs">
            <thead>
              <tr className="bg-[#1e3a6e]/5 text-[#1e3a6e]">
                <th className="border border-[#3b5998] py-1.5 px-2 text-center font-bold w-[15%]">Fecha</th>
                <th className="border border-[#3b5998] py-1.5 px-2 text-left font-bold w-[55%]">Tratamiento</th>
                <th className="border border-[#3b5998] py-1.5 px-2 text-center font-bold w-[15%]">Pago</th>
                <th className="border border-[#3b5998] py-1.5 px-2 text-center font-bold w-[15%]">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 22 }, (_, idx) => {
                const row = patient.planRows[idx] || { fecha: "", tratamiento: "", pago: "", saldo: "" };
                return (
                  <tr key={idx} className="h-7">
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
      </article>

      {/* 2. Hoja A4: Presupuesto y Evolución (Foto 3 y Foto 5 Derecha) */}
      <article className="sheet-page presupuesto-evolucion-page" data-pdf-page>
        {/* Tabla Superior: Presupuesto (9 filas) */}
        <section className="mb-6">
          <table className="w-full border-collapse border border-[#3b5998] text-xs">
            <thead>
              <tr className="bg-[#1e3a6e]/5 text-[#1e3a6e]">
                <th className="border border-[#3b5998] py-1.5 px-3 text-left font-bold w-[65%]">Presupuesto</th>
                <th className="border border-[#3b5998] py-1.5 px-2 text-center font-bold w-[17%]">Precio Unit.</th>
                <th className="border border-[#3b5998] py-1.5 px-2 text-center font-bold w-[18%]">Precio Total</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 9 }, (_, idx) => {
                const row = patient.presupuesto[idx] || { concepto: "", unit: "", total: "" };
                return (
                  <tr key={idx} className="h-7">
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

        {/* Tabla Inferior: Evolución (16 filas) */}
        <section>
          <div className="mb-2">
            <h3 className="font-bold text-sm text-[#1e3a6e]">Evolución:</h3>
          </div>
          <table className="w-full border-collapse border border-[#3b5998] text-xs">
            <thead>
              <tr className="bg-[#1e3a6e]/5 text-[#1e3a6e]">
                <th className="border border-[#3b5998] py-1.5 px-2 text-center font-bold w-[15%]">Fecha</th>
                <th className="border border-[#3b5998] py-1.5 px-2 text-left font-bold w-[55%]">Tratamiento</th>
                <th className="border border-[#3b5998] py-1.5 px-2 text-center font-bold w-[15%]">Saldo</th>
                <th className="border border-[#3b5998] py-1.5 px-2 text-center font-bold w-[15%]">Pago</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 16 }, (_, idx) => {
                const row = patient.evolucion[idx] || { fecha: "", tratamiento: "", saldo: "", pago: "" };
                return (
                  <tr key={idx} className="h-7">
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
      </article>
    </div>
  );
}
