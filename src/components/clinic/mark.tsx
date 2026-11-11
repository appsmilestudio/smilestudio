import { LEGEND, markColor, type Tool } from "@/lib/clinic/model";

export function StudioLogo({ className = "studio-logo" }: { className?: string }) {
  return <img src="/smile-studio-logo.png" alt="Smile Studio. Cuidamos tu sonrisa, cuidamos de ti." className={className} />;
}

export function MarkImg({ className = "mark-img" }: { className?: string }) {
  return <img src="/smile-mark.png" alt="" className={className} />;
}

export function Swatch({ tool }: { tool: Tool }) {
  const item = LEGEND.find((entry) => entry.id === tool);
  const color = tool === "sano" ? "var(--color-paper)" : markColor(tool);
  return (
    <span
      className="swatch"
      style={{ background: color, borderColor: tool === "sano" ? "var(--color-line)" : color }}
      aria-hidden
    >
      {item?.swatch === "x" ? <span className="swatch-x" /> : null}
      {item?.swatch === "empty" ? <span className="swatch-empty" /> : null}
      {item?.swatch === "crack" ? (
        <svg viewBox="0 0 16 16" className="h-3 w-3">
          <path d="M6 1.5 8.2 6H6.4L10.5 14.5 8 8.2h2.2L6 1.5Z" fill="var(--color-fractura)" />
        </svg>
      ) : null}
    </span>
  );
}

export function LegendList({
  tool,
  onTool,
  wrap = false,
}: {
  tool: Tool;
  onTool: (tool: Tool) => void;
  wrap?: boolean;
}) {
  return (
    <div className="legend-box">
      <h3>Simbología</h3>
      <div className={wrap ? "legend-list wrap" : "legend-list"}>
        {LEGEND.map((item) => (
          <button
            key={item.id}
            type="button"
            className="legend-btn"
            aria-pressed={tool === item.id}
            onClick={() => onTool(item.id)}
          >
            <Swatch tool={item.id} />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function Diamond() {
  return (
    <svg viewBox="0 0 10 10" className="h-2.5 w-2.5 text-gold" aria-hidden>
      <path d="M5 0 10 5 5 10 0 5Z" fill="currentColor" />
    </svg>
  );
}

export function GoldFooter() {
  return (
    <footer className="gold-footer">
      <span className="gold-footer-item">
        <PhoneIcon />
        949 390 316
      </span>
      <span className="gold-footer-item">
        <PinIcon />
        Av. Grau 877 · Piura
      </span>
      <span className="gold-footer-item">
        <img src="/smile-mark.png" alt="" className="footer-mark" />
        Tu sonrisa, nuestra pasión
      </span>
    </footer>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
      <path
        d="M8 4h2.5l1.2 3-1.6 1.2a12 12 0 0 0 5.7 5.7L17 12.3 20 13.5V16a2 2 0 0 1-2.2 2A16 16 0 0 1 6 6.2 2 2 0 0 1 8 4Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
      <path
        d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle cx="12" cy="11" r="2" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}
