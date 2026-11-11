import { useEffect, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatDay, shiftDay, soles } from "@/lib/smile/model";

export function Pill({
  children,
  tone,
}: {
  children: ReactNode;
  tone: "muted" | "gold" | "moss" | "alert" | "ink";
}) {
  const cls = {
    muted: "bg-cream text-muted",
    gold: "bg-gold-soft text-gold-deep",
    moss: "bg-moss-soft text-moss",
    alert: "bg-alert-soft text-alert",
    ink: "bg-ink text-paper",
  }[tone];
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", cls)}>
      {children}
    </span>
  );
}

export const inputClass =
  "h-11 w-full rounded-xl border border-line bg-cream px-3 text-sm text-ink";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-muted">{label}</span>
      {children}
    </label>
  );
}

export function Btn({
  children,
  onClick,
  tone = "ink",
  type = "button",
  disabled,
  full,
}: {
  children: ReactNode;
  onClick?: () => void;
  tone?: "ink" | "paper" | "moss" | "alert";
  type?: "button" | "submit";
  disabled?: boolean;
  full?: boolean;
}) {
  const tones = {
    ink: "bg-ink text-paper hover:bg-ink/90",
    paper: "border border-line bg-paper text-ink hover:bg-cream hover:border-gold/50",
    moss: "bg-moss text-paper hover:bg-moss/90",
    alert: "bg-alert text-paper hover:bg-alert/90",
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "press inline-flex h-11 min-h-[44px] items-center justify-center gap-2 rounded-full px-4 text-sm font-medium shadow-card disabled:opacity-40 transition-all",
        tones[tone],
        full && "w-full",
      )}
    >
      {children}
    </button>
  );
}

export function DayNav({
  date,
  today,
  onChange,
}: {
  date: string;
  today: string;
  onChange: (date: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-line bg-paper px-2 py-2 shadow-card sm:gap-3 sm:px-3">
      <button
        type="button"
        aria-label="Día anterior"
        className="press grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line bg-cream hover:bg-gold-soft hover:border-gold/50 transition-colors"
        onClick={() => onChange(shiftDay(date, -1))}
      >
        <ChevronLeft className="size-5" />
      </button>
      <div className="min-w-0 flex-1 text-center">
        <h1 className="truncate font-display text-2xl leading-tight text-ink sm:text-3xl">{formatDay(date)}</h1>
        {date !== today ? (
          <button type="button" className="mt-1 text-sm font-medium text-gold-deep hover:underline" onClick={() => onChange(today)}>
            Volver a hoy
          </button>
        ) : (
          <p className="mt-1 text-xs font-medium text-muted uppercase tracking-wider">Hoy</p>
        )}
      </div>
      <button
        type="button"
        aria-label="Día siguiente"
        className="press grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line bg-cream hover:bg-gold-soft hover:border-gold/50 transition-colors"
        onClick={() => onChange(shiftDay(date, 1))}
      >
        <ChevronRight className="size-5" />
      </button>
    </div>
  );
}

export function Money({ amount, tone = "ink" }: { amount: number; tone?: "ink" | "moss" | "alert" }) {
  const color = tone === "moss" ? "text-moss" : tone === "alert" ? "text-alert" : "text-ink";
  return <span className={cn("tabular-nums", color)}>{soles(amount)}</span>;
}

export function Sheet({
  title,
  subtitle,
  onClose,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-end sm:items-stretch">
      <button type="button" aria-label="Cerrar" className="sheet-back absolute inset-0 bg-ink/40 backdrop-blur-xs transition-opacity" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="sheet-panel relative flex h-[92vh] w-full max-w-lg flex-col rounded-t-3xl bg-paper shadow-2xl sm:h-full sm:rounded-none sm:border-l sm:border-line"
      >
        <header className="flex items-start gap-3 border-b border-line px-4 py-4 sm:px-5">
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-2xl leading-tight">{title}</h2>
            {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            aria-label="Cerrar panel"
            className="press grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line hover:bg-cream transition-colors"
            onClick={onClose}
          >
            <X className="size-5" />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">{children}</div>
        {footer ? <footer className="border-t border-line px-4 py-3 sm:px-5">{footer}</footer> : null}
      </div>
    </div>
  );
}
