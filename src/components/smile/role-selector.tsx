import { useState, useRef, useEffect } from "react";
import { Users, Stethoscope, ShieldCheck, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Role } from "@/lib/smile/model";

const ROLES: {
  id: Role;
  label: string;
  desc: string;
}[] = [
  {
    id: "recepcion",
    label: "Recepción",
    desc: "Vista completa de ambos doctores",
  },
  {
    id: "judith",
    label: "Dra. Judith",
    desc: "Ortodoncia y clínica general",
  },
  {
    id: "miguel",
    label: "Dr. Miguel",
    desc: "Endodoncia",
  },
  {
    id: "dueno",
    label: "Administración",
    desc: "Control general y caja",
  },
];

export function RoleSelector({
  role,
  onChange,
}: {
  role: Role;
  onChange: (role: Role) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer click afuera o con Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const currentRole = ROLES.find((r) => r.id === role) ?? ROLES[0];

  const getRoleIcon = (roleId: Role) => {
    switch (roleId) {
      case "judith":
      case "miguel":
        return Stethoscope;
      case "dueno":
        return ShieldCheck;
      default:
        return Users;
    }
  };

  const CurrentIcon = getRoleIcon(role);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "press flex h-11 items-center gap-2 rounded-full border border-line bg-paper px-3.5 text-sm font-medium shadow-card transition-all hover:border-gold/60",
          open && "border-gold ring-2 ring-gold/20",
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <CurrentIcon className="size-4 shrink-0 text-gold-deep" />
        <span className="text-ink">{currentRole.label}</span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="rise absolute right-0 top-full z-50 mt-2 w-64 origin-top-right overflow-hidden rounded-2xl border border-line bg-paper p-1.5 shadow-2xl">
          <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
            Cambiar Rol Activo
          </div>
          <div role="listbox" className="space-y-1">
            {ROLES.map((item) => {
              const Icon = getRoleIcon(item.id);
              const isSelected = item.id === role;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onChange(item.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-start gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                    isSelected
                      ? "bg-cream text-ink font-medium"
                      : "text-ink hover:bg-cream/60",
                  )}
                  role="option"
                  aria-selected={isSelected}
                >
                  <Icon
                    className={cn(
                      "mt-0.5 size-4 shrink-0",
                      isSelected ? "text-gold-deep" : "text-muted",
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="leading-tight font-medium text-ink">{item.label}</p>
                    <p className="mt-0.5 text-xs text-muted leading-tight">{item.desc}</p>
                  </div>
                  {isSelected && (
                    <Check className="mt-0.5 size-4 shrink-0 text-gold-deep" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
