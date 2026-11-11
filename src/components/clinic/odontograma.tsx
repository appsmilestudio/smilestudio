import {
  crownPath,
  EMPTY_TOOTH,
  isUpper,
  LEGEND,
  LOWER,
  markColor,
  mesialOnRight,
  toothKind,
  UPPER,
  type Patient,
  type SurfaceId,
  type Tool,
  type ToothChart,
} from "@/lib/clinic/model";
import { Diamond, GoldFooter, LegendList, MarkImg, StudioLogo } from "./mark";
import { PaperLine, RuledArea } from "./fields";

export function OdontogramaSheet({
  patient,
  tool,
  onTool,
  onEdit,
  onTooth,
}: {
  patient: Patient;
  tool: Tool;
  onTool: (tool: Tool) => void;
  onEdit: (recipe: (patient: Patient) => Patient) => void;
  onTooth: (fdi: string, target: SurfaceId | "crown") => void;
}) {
  const toolLabel = LEGEND.find((item) => item.id === tool)?.label ?? "Sano";

  return (
    <article className="sheet">
      <div className="odonto-layout">
        <aside className="odonto-side">
          <div className="brand-lockup">
            <StudioLogo />
          </div>
          <LegendList tool={tool} onTool={onTool} />
          <p className="no-print hint">
            Elige un símbolo. En caries, obturación o sellante toca una cara; en el resto, toca la
            corona. Sano borra.
          </p>
          <figure className="mouth-quote">
            <MarkImg className="mark-img sm" />
            <blockquote>
              Una boca sana es el reflejo de una <em>vida saludable.</em>
            </blockquote>
          </figure>
        </aside>
        <div className="odonto-main">
          <div className="identity-grid">
            <PaperLine
              id="field-paciente"
              label="Paciente:"
              value={patient.nombreCompleto}
              placeholder={`${patient.apellidos} ${patient.nombres}`.trim()}
              onChange={(nombreCompleto) => onEdit((p) => ({ ...p, nombreCompleto }))}
            />
            <div className="split-2">
              <PaperLine
                label="Edad:"
                value={patient.edad}
                inputMode="numeric"
                onChange={(edad) => onEdit((p) => ({ ...p, edad }))}
              />
              <PaperLine
                label="DNI:"
                value={patient.dni}
                inputMode="numeric"
                onChange={(dni) => onEdit((p) => ({ ...p, dni }))}
              />
            </div>
            <PaperLine
              label="Odontólogo(a):"
              value={patient.odontologo}
              onChange={(odontologo) => onEdit((p) => ({ ...p, odontologo }))}
            />
            <div className="split-2">
              <PaperLine
                label="Fecha:"
                value={patient.fecha}
                placeholder="dd/mm/aaaa"
                onChange={(fecha) => onEdit((p) => ({ ...p, fecha }))}
              />
              <PaperLine
                label="Teléfono:"
                value={patient.telefono}
                inputMode="tel"
                onChange={(telefono) => onEdit((p) => ({ ...p, telefono }))}
              />
            </div>
          </div>

          <div className="chart-title">
            <Diamond />
            <h2>Odontograma</h2>
            <Diamond />
          </div>
          <p className="no-print marking">Marcando: {toolLabel}</p>

          <ArchBlock
            title="Superior"
            ids={UPPER}
            numbers="top"
            patient={patient}
            onTooth={onTooth}
          />
          <ArchBlock
            title="Inferior"
            ids={LOWER}
            numbers="bottom"
            patient={patient}
            onTooth={onTooth}
          />

          <div className="notes-grid">
            <RuledArea
              label="Observaciones:"
              value={patient.observacionesOdonto}
              rows={5}
              onChange={(observacionesOdonto) => onEdit((p) => ({ ...p, observacionesOdonto }))}
            />
            <div>
              <p className="paper-label">Plan de tratamiento:</p>
              <ol className="plan-lines">
                {patient.planOdonto.map((line, index) => (
                  <li key={index}>
                    <span>{index + 1}.</span>
                    <input
                      className="paper-input"
                      value={line}
                      aria-label={`Plan ${index + 1}`}
                      onChange={(event) => {
                        const value = event.target.value;
                        onEdit((p) => {
                          const planOdonto = [...p.planOdonto] as Patient["planOdonto"];
                          planOdonto[index] = value;
                          return { ...p, planOdonto };
                        });
                      }}
                    />
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
      <GoldFooter />
    </article>
  );
}

function ArchBlock({
  title,
  ids,
  numbers,
  patient,
  onTooth,
}: {
  title: string;
  ids: string[];
  numbers: "top" | "bottom";
  patient: Patient;
  onTooth: (fdi: string, target: SurfaceId | "crown") => void;
}) {
  const upper = numbers === "top";
  const occlusal = (
    <div className="teeth-row">
      {ids.slice(0, 8).map((fdi) => (
        <ToothColumn
          key={fdi}
          fdi={fdi}
          tooth={patient.teeth[fdi] ?? EMPTY_TOOTH}
          show="occlusal"
          onTooth={onTooth}
        />
      ))}
      <div className="midline" />
      {ids.slice(8).map((fdi) => (
        <ToothColumn
          key={fdi}
          fdi={fdi}
          tooth={patient.teeth[fdi] ?? EMPTY_TOOTH}
          show="occlusal"
          onTooth={onTooth}
        />
      ))}
    </div>
  );
  const crowns = (
    <div className="teeth-row">
      {ids.slice(0, 8).map((fdi) => (
        <ToothColumn
          key={`${fdi}-c`}
          fdi={fdi}
          tooth={patient.teeth[fdi] ?? EMPTY_TOOTH}
          show="crown"
          onTooth={onTooth}
        />
      ))}
      <div className="midline" />
      {ids.slice(8).map((fdi) => (
        <ToothColumn
          key={`${fdi}-c`}
          fdi={fdi}
          tooth={patient.teeth[fdi] ?? EMPTY_TOOTH}
          show="crown"
          onTooth={onTooth}
        />
      ))}
    </div>
  );
  return (
    <section className="arch-block">
      <h3>{title}</h3>
      <div className="teeth-scroll">
        <div className="teeth-stack">
          {upper ? <NumberRow ids={ids} /> : null}
          {upper ? occlusal : crowns}
          {upper ? crowns : occlusal}
          {upper ? null : <NumberRow ids={ids} />}
        </div>
      </div>
    </section>
  );
}

function NumberRow({ ids }: { ids: string[] }) {
  return (
    <div className="teeth-row numbers">
      {ids.slice(0, 8).map((id) => (
        <span key={id}>{id}</span>
      ))}
      <span />
      {ids.slice(8).map((id) => (
        <span key={id}>{id}</span>
      ))}
    </div>
  );
}

function ToothColumn({
  fdi,
  tooth,
  show,
  onTooth,
}: {
  fdi: string;
  tooth: ToothChart;
  show: "occlusal" | "crown";
  onTooth: (fdi: string, target: SurfaceId | "crown") => void;
}) {
  return (
    <div className="tooth">
      {show === "occlusal" ? (
        <Occlusal fdi={fdi} tooth={tooth} onTooth={onTooth} />
      ) : (
        <Crown fdi={fdi} tooth={tooth} onTooth={onTooth} />
      )}
    </div>
  );
}

function Occlusal({
  fdi,
  tooth,
  onTooth,
}: {
  fdi: string;
  tooth: ToothChart;
  onTooth: (fdi: string, target: SurfaceId | "crown") => void;
}) {
  const vestTop = isUpper(fdi);
  const mesialRight = mesialOnRight(fdi);
  const top: SurfaceId = vestTop ? "v" : "l";
  const bottom: SurfaceId = vestTop ? "l" : "v";
  const left: SurfaceId = mesialRight ? "d" : "m";
  const right: SurfaceId = mesialRight ? "m" : "d";
  const zones: { id: SurfaceId; points: string }[] = [
    { id: top, points: "2,2 38,2 27,15 13,15" },
    { id: right, points: "38,2 38,42 27,29 27,15" },
    { id: bottom, points: "2,42 13,29 27,29 38,42" },
    { id: left, points: "2,2 13,15 13,29 2,42" },
    { id: "o", points: "13,15 27,15 27,29 13,29" },
  ];
  const absent = tooth.whole === "ausente";
  return (
    <svg viewBox="0 0 40 44" className="tooth-svg">
      {zones.map((zone) => (
        <polygon
          key={zone.id}
          points={zone.points}
          className="face"
          style={{
            fill: absent
              ? "transparent"
              : tooth.surfaces[zone.id]
                ? markColor(tooth.surfaces[zone.id]!)
                : "var(--color-paper)",
          }}
          strokeDasharray={absent ? "2 1.5" : undefined}
          role="button"
          tabIndex={0}
          onClick={() => onTooth(fdi, zone.id)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onTooth(fdi, zone.id);
            }
          }}
        >
          <title>{`Pieza ${fdi}, ${faceName(fdi, zone.id)}`}</title>
        </polygon>
      ))}
      {tooth.whole === "extraccion" ? <path d="M6 6 L34 38 M34 6 L6 38" className="mark-line" /> : null}
      {tooth.whole === "fractura" ? <path d="M8 30 16 18 20 26 28 12" className="crack-line" /> : null}
      {tooth.whole === "endodoncia" ? <circle cx="20" cy="22" r="2.2" className="endo-dot" /> : null}
    </svg>
  );
}

function Crown({
  fdi,
  tooth,
  onTooth,
}: {
  fdi: string;
  tooth: ToothChart;
  onTooth: (fdi: string, target: SurfaceId | "crown") => void;
}) {
  const art = crownPath(toothKind(fdi));
  const upper = isUpper(fdi);
  const absent = tooth.whole === "ausente";
  const fill = crownFill(tooth);
  return (
    <button type="button" className="crown-btn" onClick={() => onTooth(fdi, "crown")} aria-label={`Pieza ${fdi}`}>
      <svg viewBox="0 0 48 56" className="tooth-svg crown-svg">
        <g transform={upper ? undefined : "translate(0 56) scale(1 -1)"}>
          <path
            d={art.body}
            style={{ fill }}
            className={absent ? "crown-absent" : "crown-body"}
            stroke={tooth.whole === "corona" ? "var(--color-corona)" : "var(--color-ink)"}
          />
          <path d={art.grooves} className="grooves" />
          {tooth.whole === "extraccion" ? <path d="M10 12 38 46 M38 12 10 46" className="mark-line" /> : null}
          {tooth.whole === "fractura" ? <path d="M14 40 22 24 26 32 36 16" className="crack-line" /> : null}
          {tooth.whole === "endodoncia" ? <path d="M24 16 v24" className="endo-line" /> : null}
        </g>
      </svg>
    </button>
  );
}

function crownFill(tooth: ToothChart): string {
  if (tooth.whole === "ausente") return "transparent";
  if (tooth.whole && tooth.whole !== "extraccion") return `color-mix(in srgb, ${markColor(tooth.whole)} 72%, white)`;
  const surface = Object.values(tooth.surfaces)[0];
  if (surface) return `color-mix(in srgb, ${markColor(surface)} 58%, white)`;
  return "var(--color-paper)";
}

function faceName(fdi: string, face: SurfaceId): string {
  if (face === "v") return "vestibular";
  if (face === "o") return "oclusal";
  if (face === "m") return "mesial";
  if (face === "d") return "distal";
  return isUpper(fdi) ? "palatino" : "lingual";
}
