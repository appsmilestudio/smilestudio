import {
  blankControl,
  commitRow,
  formatSoles,
  isControlEmpty,
  sumMoney,
  type Patient,
} from "@/lib/clinic/model";
import { Cell, PaperLine } from "./fields";
import { MarkImg } from "./mark";

export function OrtodonciaSheet({
  patient,
  onEdit,
}: {
  patient: Patient;
  onEdit: (recipe: (patient: Patient) => Patient) => void;
}) {
  const paid = sumMoney(patient.controles.map((row) => row.pago));
  const done = patient.controles.filter((row) => row.fecha || row.tratamiento || row.pago).length;

  return (
    <article className="sheet">
      <header className="orto-head">
        <MarkImg className="mark-img lg" />
        <div>
          <h2>Control de Ortodoncia</h2>
          <p className="brand-tag">Hoja de control del paciente sobre su caso de ortodoncia.</p>
        </div>
      </header>

      <div className="orto-fields">
        <PaperLine
          label="Nombre:"
          value={patient.nombreCompleto}
          onChange={(nombreCompleto) => onEdit((p) => ({ ...p, nombreCompleto }))}
        />
        <PaperLine
          label="Fecha instalación superior:"
          value={patient.fechaSup}
          placeholder="dd/mm/aaaa"
          onChange={(fechaSup) => onEdit((p) => ({ ...p, fechaSup }))}
        />
        <PaperLine
          label="Cuota mensual:"
          value={patient.cuotaMensual}
          inputMode="decimal"
          placeholder="S/"
          onChange={(cuotaMensual) => onEdit((p) => ({ ...p, cuotaMensual }))}
        />
        <PaperLine
          label="Fecha instalación inferior:"
          value={patient.fechaInf}
          placeholder="dd/mm/aaaa"
          onChange={(fechaInf) => onEdit((p) => ({ ...p, fechaInf }))}
        />
      </div>

      <div className="teeth-scroll">
        <table className="grid-table warm">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>N° de control</th>
              <th>Tratamiento</th>
              <th>Pago mensual</th>
            </tr>
          </thead>
          <tbody>
            {patient.controles.map((row, index) => (
              <tr key={index}>
                <td>
                  <Cell
                    value={row.fecha}
                    label={`Fecha control ${index + 1}`}
                    onChange={(fecha) =>
                      onEdit((p) => ({
                        ...p,
                        controles: commitRow(
                          p.controles,
                          index,
                          { ...row, fecha, nro: row.nro || (fecha ? String(index + 1) : "") },
                          isControlEmpty,
                          blankControl(),
                        ),
                      }))
                    }
                  />
                </td>
                <td>
                  <Cell
                    value={row.nro}
                    label={`Número de control ${index + 1}`}
                    inputMode="decimal"
                    onChange={(nro) =>
                      onEdit((p) => ({
                        ...p,
                        controles: commitRow(
                          p.controles,
                          index,
                          { ...row, nro },
                          isControlEmpty,
                          blankControl(),
                        ),
                      }))
                    }
                  />
                </td>
                <td>
                  <Cell
                    value={row.tratamiento}
                    label={`Tratamiento control ${index + 1}`}
                    onChange={(tratamiento) =>
                      onEdit((p) => ({
                        ...p,
                        controles: commitRow(
                          p.controles,
                          index,
                          { ...row, tratamiento },
                          isControlEmpty,
                          blankControl(),
                        ),
                      }))
                    }
                  />
                </td>
                <td>
                  <Cell
                    value={row.pago}
                    label={`Pago control ${index + 1}`}
                    inputMode="decimal"
                    onChange={(pago) =>
                      onEdit((p) => ({
                        ...p,
                        controles: commitRow(
                          p.controles,
                          index,
                          { ...row, pago },
                          isControlEmpty,
                          blankControl(),
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

      <dl className="money-strip no-print">
        <div>
          <dt>Controles</dt>
          <dd>{done}</dd>
        </div>
        <div>
          <dt>Cuota</dt>
          <dd>{patient.cuotaMensual ? formatSoles(sumMoney([patient.cuotaMensual])) : "—"}</dd>
        </div>
        <div>
          <dt>Pagado</dt>
          <dd>{formatSoles(paid)}</dd>
        </div>
      </dl>
    </article>
  );
}
