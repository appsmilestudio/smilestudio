import { markColor, type Patient, type Tool, type YesNo } from "@/lib/clinic/model";

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
  onTool,
  onEdit,
  onArch,
}: {
  patient: Patient;
  tool: Tool;
  onTool: (tool: Tool) => void;
  onEdit: (recipe: (patient: Patient) => Patient) => void;
  onArch: (key: string) => void;
  onCopy: () => void;
}) {
  const setAnte = (key: keyof Patient["antecedentes"], value: YesNo) =>
    onEdit((p) => ({ ...p, antecedentes: { ...p.antecedentes, [key]: value } }));

  return (
    <article className="sheet-page ficha-page" data-pdf-page>
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

      {/* Datos del Paciente (Líneas continuas como en la foto 2) */}
      <div className="mt-2 space-y-1.5 text-xs text-[#1e3a6e]">
        <div className="grid grid-cols-12 gap-3 items-end">
          <div className="col-span-8 flex items-end gap-1.5 border-b border-[#3b5998]/50 pb-0.5">
            <span className="font-bold min-w-16">Apellidos:</span>
            <input
              className="flex-1 bg-transparent px-1 text-xs text-ink outline-none"
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
          <div className="col-span-4 flex items-end gap-1.5 border-b border-[#3b5998]/50 pb-0.5">
            <span className="font-bold min-w-12">Fecha:</span>
            <input
              className="flex-1 bg-transparent px-1 text-xs text-ink outline-none"
              value={patient.fecha}
              placeholder="dd/mm/aaaa"
              onChange={(e) => onEdit((p) => ({ ...p, fecha: e.target.value }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-12 gap-3 items-end">
          <div className="col-span-8 flex items-end gap-1.5 border-b border-[#3b5998]/50 pb-0.5">
            <span className="font-bold min-w-16">Nombres:</span>
            <input
              className="flex-1 bg-transparent px-1 text-xs text-ink outline-none"
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
          <div className="col-span-4 flex items-end gap-1.5 border-b border-[#3b5998]/50 pb-0.5">
            <span className="font-bold min-w-12">Teléfono:</span>
            <input
              className="flex-1 bg-transparent px-1 text-xs text-ink outline-none"
              value={patient.telefono}
              inputMode="tel"
              onChange={(e) => onEdit((p) => ({ ...p, telefono: e.target.value }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-12 gap-3 items-end">
          <div className="col-span-8 flex items-end gap-1.5 border-b border-[#3b5998]/50 pb-0.5">
            <span className="font-bold min-w-16">Dirección:</span>
            <input
              className="flex-1 bg-transparent px-1 text-xs text-ink outline-none"
              value={patient.direccion}
              onChange={(e) => onEdit((p) => ({ ...p, direccion: e.target.value }))}
            />
          </div>
          <div className="col-span-4 flex items-end gap-1.5 border-b border-[#3b5998]/50 pb-0.5">
            <span className="font-bold min-w-16">Fecha Nac.:</span>
            <input
              className="flex-1 bg-transparent px-1 text-xs text-ink outline-none"
              value={patient.fechaNac}
              placeholder="dd/mm/aaaa"
              onChange={(e) => onEdit((p) => ({ ...p, fechaNac: e.target.value }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-12 gap-3 items-end">
          <div className="col-span-8 flex items-end justify-end gap-1.5 border-b border-[#3b5998]/50 pb-0.5">
            <span className="font-bold">DNI:</span>
            <input
              className="w-48 bg-transparent px-1 text-xs text-ink outline-none"
              value={patient.dni}
              inputMode="numeric"
              onChange={(e) => onEdit((p) => ({ ...p, dni: e.target.value }))}
            />
          </div>
          <div className="col-span-4 flex items-end gap-1.5 border-b border-[#3b5998]/50 pb-0.5">
            <span className="font-bold min-w-12">Edad:</span>
            <input
              className="flex-1 bg-transparent px-1 text-xs text-ink outline-none"
              value={patient.edad}
              onChange={(e) => onEdit((p) => ({ ...p, edad: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* Sección Antecedentes (3 columnas limpias como la foto 2) */}
      <div className="mt-3 text-xs text-[#1e3a6e]">
        <p className="font-bold uppercase tracking-wide text-[#1e3a6e]">Antecedentes:</p>
        <div className="mt-1 grid grid-cols-3 gap-x-4 gap-y-1">
          {/* Columna 1 */}
          <div className="space-y-1">
            {ANTE_LEFT.map((item) => (
              <AnteRow
                key={item.key}
                label={item.label}
                value={patient.antecedentes[item.key]}
                onChange={(val) => setAnte(item.key, val)}
              />
            ))}
          </div>
          {/* Columna 2 */}
          <div className="space-y-1">
            {ANTE_MID.map((item) => (
              <AnteRow
                key={item.key}
                label={item.label}
                value={patient.antecedentes[item.key]}
                onChange={(val) => setAnte(item.key, val)}
              />
            ))}
          </div>
          {/* Columna 3 */}
          <div className="space-y-1">
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
      <div className="mt-3 space-y-1.5 text-xs text-[#1e3a6e]">
        <div className="flex items-end gap-1.5 border-b border-[#3b5998]/50 pb-0.5">
          <span className="font-bold whitespace-nowrap">Motivo de la consulta:</span>
          <input
            className="flex-1 bg-transparent px-1 text-xs text-ink outline-none"
            value={patient.motivo}
            onChange={(e) => onEdit((p) => ({ ...p, motivo: e.target.value }))}
          />
        </div>
        <div className="flex items-end gap-1.5 border-b border-[#3b5998]/50 pb-0.5">
          <span className="font-bold whitespace-nowrap">Está tomando algún medicamento:</span>
          <input
            className="flex-1 bg-transparent px-1 text-xs text-ink outline-none"
            value={patient.medicamento}
            onChange={(e) => onEdit((p) => ({ ...p, medicamento: e.target.value }))}
          />
        </div>
        <div className="flex items-end gap-1.5 border-b border-[#3b5998]/50 pb-0.5">
          <span className="font-bold whitespace-nowrap">Examen clínico general:</span>
          <input
            className="flex-1 bg-transparent px-1 text-xs text-ink outline-none"
            value={patient.examen}
            onChange={(e) => onEdit((p) => ({ ...p, examen: e.target.value }))}
          />
        </div>
      </div>

      {/* Odontograma Concéntrico (Circular idéntico a la Foto 2) */}
      <div className="concentric-odonto-container my-2">
        <ConcentricOdontograma
          arch={patient.arch}
          activeTool={tool}
          onSelectTool={onTool}
          onToothClick={onArch}
        />
      </div>

      {/* Observaciones al pie */}
      <div className="mt-1 flex items-end gap-1.5 border-b border-[#3b5998]/50 pb-0.5 text-xs text-[#1e3a6e]">
        <span className="font-bold whitespace-nowrap">Observaciones:</span>
        <input
          className="flex-1 bg-transparent px-1 text-xs text-ink outline-none"
          value={patient.observacionesHistoria}
          onChange={(e) => onEdit((p) => ({ ...p, observacionesHistoria: e.target.value }))}
        />
      </div>
    </article>
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
    <div className="flex items-center justify-between text-[11px] leading-tight">
      <span className="font-medium">{label}</span>
      <div className="flex items-center gap-1.5 font-normal">
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

/**
 * Odontograma concéntrico que reproduce exactamente la gráfica impresa de la Foto 2.
 */
function ConcentricOdontograma({
  arch,
  activeTool: _activeTool,
  onSelectTool: _onSelectTool,
  onToothClick,
}: {
  arch: Record<string, string>;
  activeTool: Tool;
  onSelectTool: (t: Tool) => void;
  onToothClick: (id: string) => void;
}) {
  const cx = 275;
  const cy = 215;

  // Piezas superiores permanentes: 1 a 16 (1 en la izquierda / DERECHA del paciente, 16 en la derecha)
  const upperAdult = Array.from({ length: 16 }, (_, i) => String(i + 1));
  // Piezas superiores temporales: A a J
  const upperDeciduous = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
  // Piezas inferiores temporales: T a K
  const lowerDeciduous = ["T", "S", "R", "Q", "P", "O", "N", "M", "L", "K"];
  // Piezas inferiores permanentes: 32 a 17 (32 a la izquierda, 17 a la derecha)
  const lowerAdult = ["32", "31", "30", "29", "28", "27", "26", "25", "24", "23", "22", "21", "20", "19", "18", "17"];

  return (
    <div className="relative mx-auto flex flex-col items-center select-none">
      <svg
        viewBox="0 0 550 430"
        className="w-full max-w-[480px] h-auto text-[#1e3a6e]"
      >
        {/* Guías elípticas tenues */}
        <ellipse cx={cx} cy={cy} rx="205" ry="165" fill="none" stroke="#3b5998" strokeWidth="0.7" strokeDasharray="3 3" opacity="0.4" />
        <ellipse cx={cx} cy={cy} rx="135" ry="105" fill="none" stroke="#3b5998" strokeWidth="0.7" strokeDasharray="3 3" opacity="0.4" />

        {/* Textos descriptivos principales de la gráfica */}
        <text x={cx} y="22" textAnchor="middle" className="text-[12px] font-black fill-[#1e3a6e] tracking-widest uppercase">
          VESTIBULAR
        </text>
        <text x={cx} y={cy - 50} textAnchor="middle" className="text-[10px] font-bold fill-[#1e3a6e] tracking-wider uppercase">
          PALATINO
        </text>
        <text x="50" y={cy + 4} textAnchor="middle" className="text-[11px] font-bold fill-[#1e3a6e] tracking-wider uppercase">
          DERECHA
        </text>
        <text x="500" y={cy + 4} textAnchor="middle" className="text-[11px] font-bold fill-[#1e3a6e] tracking-wider uppercase">
          IZQUIERDA
        </text>
        <text x={cx} y={cy + 55} textAnchor="middle" className="text-[10px] font-bold fill-[#1e3a6e] tracking-wider uppercase">
          LINGUAL
        </text>
        <text x={cx} y="420" textAnchor="middle" className="text-[12px] font-black fill-[#1e3a6e] tracking-widest uppercase">
          VESTIBULAR
        </text>

        {/* 1. Dientes superiores permanentes (1 a 16) */}
        {upperAdult.map((label, i) => {
          // De 175° a 5°
          const deg = 175 - (i / 15) * 170;
          const rad = (deg * Math.PI) / 180;
          const tx = cx + Math.cos(rad) * 205;
          const ty = cy - Math.sin(rad) * 165;
          // Posición del número por fuera del círculo
          const lx = cx + Math.cos(rad) * 182;
          const ly = cy - Math.sin(rad) * 142;
          const mark = arch[`u${label}`] || "";

          return (
            <g key={`u${label}`} className="cursor-pointer group" onClick={() => onToothClick(`u${label}`)}>
              {/* Raíz anatómica exterior */}
              <circle
                cx={tx}
                cy={ty}
                r="11.5"
                fill={mark ? markColor(mark) : "#ffffff"}
                stroke="#1e3a6e"
                strokeWidth="1.2"
                strokeDasharray={mark === "ausente" ? "2 2" : undefined}
                className="transition-colors group-hover:stroke-gold"
              />
              {/* Cuadrantes internos (cruz) */}
              <line x1={tx - 11.5} y1={ty} x2={tx + 11.5} y2={ty} stroke="#1e3a6e" strokeWidth="0.8" />
              <line x1={tx} y1={ty - 11.5} x2={tx} y2={ty + 11.5} stroke="#1e3a6e" strokeWidth="0.8" />
              <circle cx={tx} cy={ty} r="4.5" fill={mark ? markColor(mark) : "#ffffff"} stroke="#1e3a6e" strokeWidth="0.8" />

              {mark === "extraccion" && (
                <path d={`M${tx - 8} ${ty - 8} L${tx + 8} ${ty + 8} M${tx + 8} ${ty - 8} L${tx - 8} ${ty + 8}`} stroke="#c2414b" strokeWidth="2" />
              )}

              {/* Número del diente */}
              <text x={lx} y={ly + 3.5} textAnchor="middle" className="text-[10px] font-extrabold fill-[#1e3a6e]">
                {label}
              </text>
            </g>
          );
        })}

        {/* 2. Dientes superiores temporales (A a J) */}
        {upperDeciduous.map((label, i) => {
          // De 160° a 20°
          const deg = 160 - (i / 9) * 140;
          const rad = (deg * Math.PI) / 180;
          const tx = cx + Math.cos(rad) * 135;
          const ty = cy - Math.sin(rad) * 105;
          const lx = cx + Math.cos(rad) * 112;
          const ly = cy - Math.sin(rad) * 85;
          const mark = arch[`p${label}`] || "";

          return (
            <g key={`p${label}`} className="cursor-pointer group" onClick={() => onToothClick(`p${label}`)}>
              <circle
                cx={tx}
                cy={ty}
                r="9.5"
                fill={mark ? markColor(mark) : "#ffffff"}
                stroke="#1e3a6e"
                strokeWidth="1.1"
                strokeDasharray={mark === "ausente" ? "2 2" : undefined}
                className="transition-colors group-hover:stroke-gold"
              />
              <line x1={tx - 9.5} y1={ty} x2={tx + 9.5} y2={ty} stroke="#1e3a6e" strokeWidth="0.7" />
              <line x1={tx} y1={ty - 9.5} x2={tx} y2={ty + 9.5} stroke="#1e3a6e" strokeWidth="0.7" />
              <circle cx={tx} cy={ty} r="3.5" fill={mark ? markColor(mark) : "#ffffff"} stroke="#1e3a6e" strokeWidth="0.7" />

              {mark === "extraccion" && (
                <path d={`M${tx - 6} ${ty - 6} L${tx + 6} ${ty + 6} M${tx + 6} ${ty - 6} L${tx - 6} ${ty + 6}`} stroke="#c2414b" strokeWidth="1.8" />
              )}

              <text x={lx} y={ly + 3.5} textAnchor="middle" className="text-[10px] font-extrabold fill-[#1e3a6e]">
                {label}
              </text>
            </g>
          );
        })}

        {/* 3. Dientes inferiores temporales (T a K) */}
        {lowerDeciduous.map((label, i) => {
          // De 200° a 340°
          const deg = 200 + (i / 9) * 140;
          const rad = (deg * Math.PI) / 180;
          const tx = cx + Math.cos(rad) * 135;
          const ty = cy - Math.sin(rad) * 105;
          const lx = cx + Math.cos(rad) * 112;
          const ly = cy - Math.sin(rad) * 85;
          const mark = arch[`p${label}`] || "";

          return (
            <g key={`p${label}`} className="cursor-pointer group" onClick={() => onToothClick(`p${label}`)}>
              <circle
                cx={tx}
                cy={ty}
                r="9.5"
                fill={mark ? markColor(mark) : "#ffffff"}
                stroke="#1e3a6e"
                strokeWidth="1.1"
                strokeDasharray={mark === "ausente" ? "2 2" : undefined}
                className="transition-colors group-hover:stroke-gold"
              />
              <line x1={tx - 9.5} y1={ty} x2={tx + 9.5} y2={ty} stroke="#1e3a6e" strokeWidth="0.7" />
              <line x1={tx} y1={ty - 9.5} x2={tx} y2={ty + 9.5} stroke="#1e3a6e" strokeWidth="0.7" />
              <circle cx={tx} cy={ty} r="3.5" fill={mark ? markColor(mark) : "#ffffff"} stroke="#1e3a6e" strokeWidth="0.7" />

              {mark === "extraccion" && (
                <path d={`M${tx - 6} ${ty - 6} L${tx + 6} ${ty + 6} M${tx + 6} ${ty - 6} L${tx - 6} ${ty + 6}`} stroke="#c2414b" strokeWidth="1.8" />
              )}

              <text x={lx} y={ly + 3.5} textAnchor="middle" className="text-[10px] font-extrabold fill-[#1e3a6e]">
                {label}
              </text>
            </g>
          );
        })}

        {/* 4. Dientes inferiores permanentes (32 a 17) */}
        {lowerAdult.map((label, i) => {
          // De 185° a 355°
          const deg = 185 + (i / 15) * 170;
          const rad = (deg * Math.PI) / 180;
          const tx = cx + Math.cos(rad) * 205;
          const ty = cy - Math.sin(rad) * 165;
          const lx = cx + Math.cos(rad) * 182;
          const ly = cy - Math.sin(rad) * 142;
          const mark = arch[`u${label}`] || "";

          return (
            <g key={`u${label}`} className="cursor-pointer group" onClick={() => onToothClick(`u${label}`)}>
              <circle
                cx={tx}
                cy={ty}
                r="11.5"
                fill={mark ? markColor(mark) : "#ffffff"}
                stroke="#1e3a6e"
                strokeWidth="1.2"
                strokeDasharray={mark === "ausente" ? "2 2" : undefined}
                className="transition-colors group-hover:stroke-gold"
              />
              <line x1={tx - 11.5} y1={ty} x2={tx + 11.5} y2={ty} stroke="#1e3a6e" strokeWidth="0.8" />
              <line x1={tx} y1={ty - 11.5} x2={tx} y2={ty + 11.5} stroke="#1e3a6e" strokeWidth="0.8" />
              <circle cx={tx} cy={ty} r="4.5" fill={mark ? markColor(mark) : "#ffffff"} stroke="#1e3a6e" strokeWidth="0.8" />

              {mark === "extraccion" && (
                <path d={`M${tx - 8} ${ty - 8} L${tx + 8} ${ty + 8} M${tx + 8} ${ty - 8} L${tx - 8} ${ty + 8}`} stroke="#c2414b" strokeWidth="2" />
              )}

              <text x={lx} y={ly + 3.5} textAnchor="middle" className="text-[10px] font-extrabold fill-[#1e3a6e]">
                {label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
