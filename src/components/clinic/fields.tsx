import type { ReactNode } from "react";
import type { YesNo } from "@/lib/clinic/model";

export function PaperLine({
  label,
  value,
  onChange,
  id,
  placeholder,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  id?: string;
  placeholder?: string;
  inputMode?: "text" | "decimal" | "numeric" | "tel";
}) {
  return (
    <label className="paper-line" htmlFor={id}>
      <span>{label}</span>
      <input
        id={id}
        className="paper-input"
        value={value}
        placeholder={placeholder}
        inputMode={inputMode}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

export function RuledArea({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="paper-label">{label}</span>
      <textarea
        className="ruled"
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

export function YesNoField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: YesNo;
  onChange: (value: YesNo) => void;
}) {
  return (
    <div className="yesno">
      <span>{label}</span>
      <span className="yesno-opts">
        <Choice pressed={value === "si"} onClick={() => onChange(value === "si" ? "" : "si")}>
          Sí
        </Choice>
        <Choice pressed={value === "no"} onClick={() => onChange(value === "no" ? "" : "no")}>
          No
        </Choice>
      </span>
    </div>
  );
}

function Choice({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button type="button" className="choice" aria-pressed={pressed} onClick={onClick}>
      <span className="choice-box" />
      {children}
    </button>
  );
}

export function Cell({
  value,
  onChange,
  label,
  inputMode,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  inputMode?: "text" | "decimal" | "tel";
}) {
  return (
    <input
      className="cell-input"
      value={value}
      aria-label={label}
      inputMode={inputMode}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}
