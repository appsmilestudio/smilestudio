import { ageFrom, archNodes, markColor, type Patient, type Tool, type YesNo } from "@/lib/clinic/model";
import { Cell, PaperLine, RuledArea, YesNoField } from "./fields";
import { LegendList } from "./mark";

const ANTE: { key: keyof Patient["antecedentes"]; label: string }[] = [
  { key: "alergias", label: "Alergias" },
  { key: "hemorragias", label: "Hemorragias" },
  { key: "diabetes", label: "Diabetes" },
  { key: "gestante", label: "Gestante" },
  { key: "cardiovascular", label: "Enf. cardiovascular" },
  { key: "hipertension", label: "Hipertensión" },
  { key: "renal", label: "Enfermedad renal" },
  { key: "otra", label: "Otra enfermedad" },
];

export function FichaSheet({
  patient,
  tool,
  onTool,
  onEdit,
  onArch,
  onCopy,
}: {
  patient: Patient;
  tool: Tool;
  onTool: (tool: Tool) => void;
  onEdit: (recipe: (patient: Patient) => Patient) => void;
  onArch: (key: string) => void;
  onCopy: () => void;
}) {
  const nodes = archNodes();
  const setAnte = (key: keyof Patient["antecedentes"], value: YesNo) =>
    onEdit((p) => ({ ...p, antecedentes: { ...p.antecedentes, [key]: value } }));

  return (
    <article className="sheet">
      <header className="ficha-mast">
        <img
          src="/smile-banner.png"
          alt="Smile Studio Centro Odontológico"
          className="ficha-banner"
        />
        <p className="mast-address">
          Av. Grau 877, Piura
          <br />
          Centro de consultas (Sótano)
          <br />
          Tel. 949 390 316 · 961 617 933
        </p>
      </header>

      <div className="historia-grid">
        <div className="stack">
          <PaperLine
            label="Paciente:"
            value={patient.nombreCompleto}
            onChange={(nombreCompleto) => onEdit((p) => ({ ...p, nombreCompleto }))}
          />
          <div className="split-2">
            <PaperLine
              label="Apellidos:"
              value={patient.apellidos}
              onChange={(apellidos) =>
                onEdit((p) => ({
                  ...p,
                  apellidos,
                  nombreCompleto: p.nombreCompleto.trim()
                    ? p.nombreCompleto
                    : `${apellidos} ${p.nombres}`.trim(),
                }))
              }
            />
            <PaperLine
              label="Nombres:"
              value={patient.nombres}
              onChange={(nombres) =>
                onEdit((p) => ({
                  ...p,
                  nombres,
                  nombreCompleto: p.nombreCompleto.trim()
                    ? p.nombreCompleto
                    : `${p.apellidos} ${nombres}`.trim(),
                }))
              }
            />
          </div>
          <PaperLine
            label="Dirección:"
            value={patient.direccion}
            onChange={(direccion) => onEdit((p) => ({ ...p, direccion }))}
          />
          <div className="split-2">
            <PaperLine
              label="DNI:"
              value={patient.dni}
              inputMode="numeric"
              onChange={(dni) => onEdit((p) => ({ ...p, dni }))}
            />
            <PaperLine
              label="Teléfono:"
              value={patient.telefono}
              inputMode="tel"
              onChange={(telefono) => onEdit((p) => ({ ...p, telefono }))}
            />
          </div>
          <div className="split-3">
            <PaperLine
              label="Fecha:"
              value={patient.fecha}
              placeholder="dd/mm/aaaa"
              onChange={(fecha) => onEdit((p) => ({ ...p, fecha }))}
            />
            <PaperLine
              label="Fecha nac.:"
              value={patient.fechaNac}
              placeholder="dd/mm/aaaa"
              onChange={(fechaNac) =>
                onEdit((p) => ({
                  ...p,
                  fechaNac,
                  edad: ageFrom(fechaNac) ?? p.edad,
                }))
              }
            />
            <PaperLine
              label="Edad:"
              value={patient.edad}
              inputMode="numeric"
              onChange={(edad) => onEdit((p) => ({ ...p, edad }))}
            />
          </div>

          <section className="boxed">
            <h3>Antecedentes</h3>
            <div className="ante-grid">
              {ANTE.map((item) => (
                <YesNoField
                  key={item.key}
                  label={item.label}
                  value={patient.antecedentes[item.key]}
                  onChange={(value) => setAnte(item.key, value)}
                />
              ))}
            </div>
            <PaperLine
              label="Detalle:"
              value={patient.otraDetalle}
              onChange={(otraDetalle) => onEdit((p) => ({ ...p, otraDetalle }))}
            />
          </section>

          <RuledArea
            label="Motivo de la consulta:"
            value={patient.motivo}
            rows={2}
            onChange={(motivo) => onEdit((p) => ({ ...p, motivo }))}
          />
          <RuledArea
            label="Está tomando algún medicamento:"
            value={patient.medicamento}
            rows={2}
            onChange={(medicamento) => onEdit((p) => ({ ...p, medicamento }))}
          />
          <RuledArea
            label="Examen clínico general:"
            value={patient.examen}
            rows={2}
            onChange={(examen) => onEdit((p) => ({ ...p, examen }))}
          />
        </div>

        <div className="stack">
          <section className="boxed">
            <h3>Próximas citas</h3>
            <div className="teeth-scroll">
              <table className="grid-table citas-table">
                <thead>
                  <tr>
                    {["Fecha", "Hora", "Fecha", "Hora", "Fecha", "Hora"].map((label, index) => (
                      <th key={index}>{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: Math.ceil(patient.citas.length / 3) }, (_, row) => (
                    <tr key={row}>
                      {[0, 1, 2].map((col) => {
                        const index = row * 3 + col;
                        const cita = patient.citas[index];
                        if (!cita) return null;
                        return (
                          <CitaPair
                            key={col}
                            fecha={cita.fecha}
                            hora={cita.hora}
                            onFecha={(fecha) =>
                              onEdit((p) => ({
                                ...p,
                                citas: p.citas.map((item, i) => (i === index ? { ...item, fecha } : item)),
                              }))
                            }
                            onHora={(hora) =>
                              onEdit((p) => ({
                                ...p,
                                citas: p.citas.map((item, i) => (i === index ? { ...item, hora } : item)),
                              }))
                            }
                          />
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="boxed">
            <div className="section-head">
              <h3>Esquema dental</h3>
              <button type="button" className="text-btn no-print" onClick={onCopy}>
                Traer del odontograma
              </button>
            </div>
            <p className="no-print hint">
              Derecha del paciente a la izquierda del esquema. Números permanentes, letras de leche.
            </p>
            <LegendList tool={tool} onTool={onTool} wrap />
            <div className="teeth-scroll arch-scroll">
              <div className="arch-board">
                <svg viewBox="0 0 640 500" className="arch-guides">
                  <ellipse cx="320" cy="248" rx="214" ry="168" />
                  <ellipse cx="320" cy="248" rx="132" ry="104" />
                  <text x="320" y="214" textAnchor="middle">
                    PALATINO
                  </text>
                  <text x="320" y="292" textAnchor="middle">
                    LINGUAL
                  </text>
                  <text x="78" y="252" textAnchor="middle">
                    DERECHA
                  </text>
                  <text x="562" y="252" textAnchor="middle">
                    IZQUIERDA
                  </text>
                  <text transform="rotate(-90 36 248)" x="36" y="248" textAnchor="middle">
                    VESTIBULAR
                  </text>
                  <text transform="rotate(90 604 248)" x="604" y="248" textAnchor="middle">
                    VESTIBULAR
                  </text>
                </svg>
                {nodes.map((node) => {
                  const mark = patient.arch[node.id] ?? "";
                  return (
                    <button
                      key={node.id}
                      type="button"
                      className={`arch-node ${mark === "extraccion" ? "arch-x" : ""} ${mark === "ausente" ? "arch-absent" : ""}`}
                      style={{
                        left: `${(node.x / 640) * 100}%`,
                        top: `${(node.y / 500) * 100}%`,
                        width: `${((node.r * 2) / 640) * 100}%`,
                        height: `${((node.r * 2) / 500) * 100}%`,
                        backgroundColor: mark
                          ? `color-mix(in srgb, ${markColor(mark)} 78%, white)`
                          : "var(--color-paper)",
                        borderColor: mark ? markColor(mark) : "var(--color-line)",
                      }}
                      aria-label={`Pieza ${node.label}`}
                      onClick={() => onArch(node.id)}
                    >
                      {node.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      </div>

      <RuledArea
        label="Observaciones:"
        value={patient.observacionesHistoria}
        rows={4}
        onChange={(observacionesHistoria) => onEdit((p) => ({ ...p, observacionesHistoria }))}
      />
    </article>
  );
}

function CitaPair({
  fecha,
  hora,
  onFecha,
  onHora,
}: {
  fecha: string;
  hora: string;
  onFecha: (value: string) => void;
  onHora: (value: string) => void;
}) {
  return (
    <>
      <td>
        <Cell value={fecha} onChange={onFecha} label="Fecha de cita" />
      </td>
      <td>
        <Cell value={hora} onChange={onHora} label="Hora de cita" />
      </td>
    </>
  );
}
