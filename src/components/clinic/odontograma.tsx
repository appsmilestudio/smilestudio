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
import { Diamond, GoldFooter, LegendList, StudioLogo } from "./mark";

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
    <article className="sheet-page odonto-page" data-pdf-page>
      <div className="odonto-page-body">
        {/* Columna Izquierda: Logo Dorado, Simbología, Frase */}
        <aside className="odonto-sidebar">
          <div className="odonto-logo-wrap">
            <StudioLogo className="w-40 h-auto object-contain mx-auto" />
          </div>

          <div className="mt-4">
            <LegendList tool={tool} onTool={onTool} />
          </div>

          <p className="no-print mt-2 text-[11px] text-muted leading-tight">
            Marcando: <strong className="text-gold-deep">{toolLabel}</strong>. Toca una cara (oclusal, vestibular, lingual, mesial, distal) o la corona.
          </p>

          <figure className="mouth-quote mt-6 text-center">
            <div className="mx-auto mb-1 flex justify-center text-gold">
              <svg viewBox="0 0 24 24" className="w-8 h-8 fill-none stroke-current" strokeWidth="1.5">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <blockquote className="text-[11px] italic text-[#6b4c10] leading-snug">
              Una boca sana es el reflejo de una <strong className="font-semibold">vida saludable. ♡</strong>
            </blockquote>
          </figure>
        </aside>

        {/* Columna Derecha: Datos del Paciente, Título Dorado, Arco Superior e Inferior, Notas */}
        <main className="odonto-content">
          {/* Cuadro de datos superior */}
          <div className="border border-gold/40 rounded-xl p-3 bg-cream/30 text-xs space-y-1.5">
            <div className="flex items-end gap-2 border-b border-gold/30 pb-0.5">
              <span className="font-bold text-[#6b4c10] uppercase tracking-wide min-w-20">PACIENTE:</span>
              <input
                className="flex-1 bg-transparent px-1 font-medium text-ink outline-none"
                value={patient.nombreCompleto}
                placeholder={`${patient.apellidos} ${patient.nombres}`.trim()}
                onChange={(e) => onEdit((p) => ({ ...p, nombreCompleto: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-end gap-2 border-b border-gold/30 pb-0.5">
                <span className="font-bold text-[#6b4c10] uppercase tracking-wide min-w-12">EDAD:</span>
                <input
                  className="flex-1 bg-transparent px-1 font-medium text-ink outline-none"
                  value={patient.edad}
                  onChange={(e) => onEdit((p) => ({ ...p, edad: e.target.value }))}
                />
              </div>
              <div className="flex items-end gap-2 border-b border-gold/30 pb-0.5">
                <span className="font-bold text-[#6b4c10] uppercase tracking-wide min-w-10">DNI:</span>
                <input
                  className="flex-1 bg-transparent px-1 font-medium text-ink outline-none"
                  value={patient.dni}
                  onChange={(e) => onEdit((p) => ({ ...p, dni: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex items-end gap-2 border-b border-gold/30 pb-0.5">
              <span className="font-bold text-[#6b4c10] uppercase tracking-wide min-w-28">ODONTÓLOGO(A):</span>
              <input
                className="flex-1 bg-transparent px-1 font-medium text-ink outline-none"
                value={patient.odontologo}
                onChange={(e) => onEdit((p) => ({ ...p, odontologo: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-end gap-2 border-b border-gold/30 pb-0.5">
                <span className="font-bold text-[#6b4c10] uppercase tracking-wide min-w-14">FECHA:</span>
                <input
                  className="flex-1 bg-transparent px-1 font-medium text-ink outline-none"
                  value={patient.fecha}
                  placeholder="dd/mm/aaaa"
                  onChange={(e) => onEdit((p) => ({ ...p, fecha: e.target.value }))}
                />
              </div>
              <div className="flex items-end gap-2 border-b border-gold/30 pb-0.5">
                <span className="font-bold text-[#6b4c10] uppercase tracking-wide min-w-20">TELÉFONO:</span>
                <input
                  className="flex-1 bg-transparent px-1 font-medium text-ink outline-none"
                  value={patient.telefono}
                  onChange={(e) => onEdit((p) => ({ ...p, telefono: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Título Central */}
          <div className="my-3 flex items-center justify-center gap-2">
            <Diamond />
            <h2 className="font-display text-lg font-bold tracking-widest text-[#6b4c10] uppercase">
              ODONTOGRAMA
            </h2>
            <Diamond />
          </div>

          {/* Arcos Dentales con anatomía y caras */}
          <ArchBlock
            title="SUPERIOR"
            ids={UPPER}
            numbers="top"
            patient={patient}
            onTooth={onTooth}
          />
          <ArchBlock
            title="INFERIOR"
            ids={LOWER}
            numbers="bottom"
            patient={patient}
            onTooth={onTooth}
          />

          {/* Notas y Plan de Tratamiento */}
          <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
            {/* Observaciones */}
            <div className="space-y-1">
              <p className="font-bold text-[#6b4c10] uppercase tracking-wide">OBSERVACIONES:</p>
              <textarea
                className="w-full h-24 bg-transparent border border-gold/30 rounded-lg p-2 text-xs text-ink resize-none outline-none focus:border-gold"
                value={patient.observacionesOdonto}
                onChange={(e) => onEdit((p) => ({ ...p, observacionesOdonto: e.target.value }))}
              />
            </div>
            {/* Plan de Tratamiento (1 a 5) */}
            <div className="space-y-1">
              <p className="font-bold text-[#6b4c10] uppercase tracking-wide">PLAN DE TRATAMIENTO:</p>
              <div className="space-y-1">
                {patient.planOdonto.map((line, index) => (
                  <div key={index} className="flex items-center gap-1.5 border-b border-gold/30 pb-0.5">
                    <span className="font-bold text-[#6b4c10] text-xs">{index + 1}.</span>
                    <input
                      className="flex-1 bg-transparent px-1 text-xs text-ink outline-none"
                      value={line}
                      onChange={(e) => {
                        const val = e.target.value;
                        onEdit((p) => {
                          const planOdonto = [...p.planOdonto] as Patient["planOdonto"];
                          planOdonto[index] = val;
                          return { ...p, planOdonto };
                        });
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Footer dorado con teléfono, dirección y lema */}
      <div className="mt-auto">
        <GoldFooter />
      </div>
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
    <section className="arch-block my-2">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[11px] font-bold text-[#6b4c10] tracking-wider uppercase">{title}</span>
        <div className="flex-1 h-px bg-gold/30" />
      </div>
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
      <span className="midline-space" />
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
          <title>{`Pieza ${fdi}`}</title>
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
