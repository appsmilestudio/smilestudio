import {
  blankEvolucion,
  blankPlan,
  blankPresupuesto,
  commitRow,
  formatSoles,
  isEvolucionEmpty,
  isPlanEmpty,
  isPresupuestoEmpty,
  sumMoney,
  type Patient,
} from "@/lib/clinic/model";
import { Cell, PaperLine } from "./fields";
import { MarkImg } from "./mark";

export function PlanSheet({
  patient,
  onEdit,
}: {
  patient: Patient;
  onEdit: (recipe: (patient: Patient) => Patient) => void;
}) {
  const quoted = sumMoney(patient.presupuesto.map((row) => row.total));
  const paid = sumMoney(patient.planRows.map((row) => row.pago));
  const balance = quoted - paid;

  return (
    <article className="sheet">
      <header className="plan-mast">
        <div className="plan-brand">
          <MarkImg className="mark-img sm" />
          <div>
            <p className="eyebrow">Smile Studio</p>
            <h2>Plan de tratamiento</h2>
          </div>
        </div>
        <div className="split-3 plan-id">
          <PaperLine
            label="Paciente:"
            value={patient.nombreCompleto}
            onChange={(nombreCompleto) => onEdit((p) => ({ ...p, nombreCompleto }))}
          />
          <PaperLine
            label="DNI:"
            value={patient.dni}
            inputMode="numeric"
            onChange={(dni) => onEdit((p) => ({ ...p, dni }))}
          />
          <PaperLine
            label="Fecha:"
            value={patient.fecha}
            onChange={(fecha) => onEdit((p) => ({ ...p, fecha }))}
          />
        </div>
      </header>

      <div className="plan-top">
        <section>
          <h3>Presupuesto</h3>
          <div className="teeth-scroll">
            <table className="grid-table">
              <thead>
                <tr>
                  <th>Presupuesto</th>
                  <th>Precio unit.</th>
                  <th>Precio total</th>
                </tr>
              </thead>
              <tbody>
                {patient.presupuesto.map((row, index) => (
                  <tr key={index}>
                    <td>
                      <Cell
                        value={row.concepto}
                        label={`Presupuesto ${index + 1}`}
                        onChange={(concepto) =>
                          onEdit((p) => ({
                            ...p,
                            presupuesto: commitRow(
                              p.presupuesto,
                              index,
                              { ...row, concepto },
                              isPresupuestoEmpty,
                              blankPresupuesto(),
                            ),
                          }))
                        }
                      />
                    </td>
                    <td>
                      <Cell
                        value={row.unit}
                        label={`Precio unitario ${index + 1}`}
                        inputMode="decimal"
                        onChange={(unit) =>
                          onEdit((p) => ({
                            ...p,
                            presupuesto: commitRow(
                              p.presupuesto,
                              index,
                              { ...row, unit },
                              isPresupuestoEmpty,
                              blankPresupuesto(),
                            ),
                          }))
                        }
                      />
                    </td>
                    <td>
                      <Cell
                        value={row.total}
                        label={`Precio total ${index + 1}`}
                        inputMode="decimal"
                        onChange={(total) =>
                          onEdit((p) => ({
                            ...p,
                            presupuesto: commitRow(
                              p.presupuesto,
                              index,
                              { ...row, total },
                              isPresupuestoEmpty,
                              blankPresupuesto(),
                            ),
                          }))
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <h3>Evolución</h3>
          <div className="teeth-scroll">
            <table className="grid-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Tratamiento</th>
                  <th>Saldo</th>
                  <th>Pago</th>
                </tr>
              </thead>
              <tbody>
                {patient.evolucion.map((row, index) => (
                  <tr key={index}>
                    {(
                      [
                        ["fecha", "Fecha"],
                        ["tratamiento", "Tratamiento"],
                        ["saldo", "Saldo"],
                        ["pago", "Pago"],
                      ] as const
                    ).map(([key, label]) => (
                      <td key={key}>
                        <Cell
                          value={row[key]}
                          label={`${label} evolución ${index + 1}`}
                          inputMode={key === "fecha" || key === "tratamiento" ? "text" : "decimal"}
                          onChange={(value) =>
                            onEdit((p) => ({
                              ...p,
                              evolucion: commitRow(
                                p.evolucion,
                                index,
                                { ...row, [key]: value },
                                isEvolucionEmpty,
                                blankEvolucion(),
                              ),
                            }))
                          }
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className="plan-bottom">
        <h3>Plan de tratamiento</h3>
        <div className="teeth-scroll">
          <table className="grid-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tratamiento</th>
                <th>Pago</th>
                <th>Saldo</th>
              </tr>
            </thead>
            <tbody>
              {patient.planRows.map((row, index) => (
                <tr key={index}>
                  {(
                    [
                      ["fecha", "Fecha", "text"],
                      ["tratamiento", "Tratamiento", "text"],
                      ["pago", "Pago", "decimal"],
                      ["saldo", "Saldo", "decimal"],
                    ] as const
                  ).map(([key, label, mode]) => (
                    <td key={key}>
                      <Cell
                        value={row[key]}
                        label={`${label} plan ${index + 1}`}
                        inputMode={mode}
                        onChange={(value) =>
                          onEdit((p) => ({
                            ...p,
                            planRows: commitRow(
                              p.planRows,
                              index,
                              { ...row, [key]: value },
                              isPlanEmpty,
                              blankPlan(),
                            ),
                          }))
                        }
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <dl className="money-strip no-print">
        <div>
          <dt>Presupuesto</dt>
          <dd>{formatSoles(quoted)}</dd>
        </div>
        <div>
          <dt>Cobrado</dt>
          <dd>{formatSoles(paid)}</dd>
        </div>
        <div>
          <dt>Saldo</dt>
          <dd>{formatSoles(balance)}</dd>
        </div>
      </dl>
      <p className="hint no-print">Los totales salen del precio total del presupuesto y de la columna Pago del plan. Escribe en soles, por ejemplo 150 o 150.50.</p>
    </article>
  );
}
