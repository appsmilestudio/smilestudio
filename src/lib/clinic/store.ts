import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  archFromTeeth,
  blankPatient,
  isWholeTool,
  normalizePatient,
  type MarkId,
  type Patient,
  type SurfaceId,
  type SurfaceMark,
  type TabId,
  type Tool,
  type ToothChart,
  EMPTY_TOOTH,
} from "./model";

type ClinicState = {
  hydrated: boolean;
  tab: TabId;
  tool: Tool;
  activeId: string | null;
  lastOdontologo: string;
  patients: Patient[];
  setHydrated: () => void;
  setTab: (tab: TabId) => void;
  setTool: (tool: Tool) => void;
  setActive: (id: string | null) => void;
  addPatient: (tab?: TabId) => string;
  removePatient: (id: string) => void;
  edit: (id: string, recipe: (patient: Patient) => Patient) => void;
  applyTooth: (id: string, fdi: string, tool: Tool, target: SurfaceId | "crown") => void;
  applyArch: (id: string, key: string, tool: Tool) => void;
  copyArch: (id: string) => void;
  importPatients: (rows: Patient[]) => void;
};

function paintTooth(prev: ToothChart, tool: Tool, target: SurfaceId | "crown"): ToothChart {
  const next: ToothChart = {
    whole: prev.whole,
    surfaces: { ...prev.surfaces },
  };
  if (target === "crown") {
    if (tool === "sano") {
      next.whole = "";
      next.surfaces = {};
      return next;
    }
    if (isWholeTool(tool)) {
      next.whole = tool;
      return next;
    }
    for (const face of ["v", "m", "d", "l", "o"] as const) next.surfaces[face] = tool;
    return next;
  }
  if (tool === "sano") {
    delete next.surfaces[target];
    return next;
  }
  if (isWholeTool(tool)) {
    next.whole = tool;
    return next;
  }
  next.surfaces[target] = tool as SurfaceMark;
  return next;
}

export const useClinic = create<ClinicState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      tab: "ficha",
      tool: "caries",
      activeId: null,
      lastOdontologo: "",
      patients: [],
      setHydrated: () => set({ hydrated: true }),
      setTab: (tab) => set({ tab }),
      setTool: (tool) => set({ tool }),
      setActive: (activeId) => set({ activeId }),
      addPatient: (tab) => {
        const id = crypto.randomUUID();
        const patient = blankPatient(id, get().lastOdontologo);
        set((s) => ({
          patients: [patient, ...s.patients],
          activeId: id,
          tab: tab ?? s.tab,
        }));
        return id;
      },
      removePatient: (id) =>
        set((s) => {
          const patients = s.patients.filter((p) => p.id !== id);
          return {
            patients,
            activeId: s.activeId === id ? (patients[0]?.id ?? null) : s.activeId,
          };
        }),
      edit: (id, recipe) =>
        set((s) => {
          const patients = s.patients.map((p) => (p.id === id ? recipe(p) : p));
          const next = patients.find((p) => p.id === id);
          return {
            patients,
            lastOdontologo: next?.odontologo ? next.odontologo : s.lastOdontologo,
          };
        }),
      applyTooth: (id, fdi, tool, target) =>
        set((s) => ({
          patients: s.patients.map((p) => {
            if (p.id !== id) return p;
            const prev = p.teeth[fdi] ?? EMPTY_TOOTH;
            return {
              ...p,
              teeth: { ...p.teeth, [fdi]: paintTooth(prev, tool, target) },
            };
          }),
        })),
      applyArch: (id, key, tool) =>
        set((s) => ({
          patients: s.patients.map((p) => {
            if (p.id !== id) return p;
            const arch = { ...p.arch };
            if (tool === "sano") delete arch[key];
            else arch[key] = tool as MarkId;
            return { ...p, arch };
          }),
        })),
      copyArch: (id) =>
        set((s) => ({
          patients: s.patients.map((p) => {
            if (p.id !== id) return p;
            const brought = archFromTeeth(p.teeth);
            const arch = { ...p.arch };
            for (const [key, mark] of Object.entries(brought)) {
              if (mark) arch[key] = mark;
              else delete arch[key];
            }
            return { ...p, arch };
          }),
        })),
      importPatients: (rows) =>
        set((s) => {
          const map = new Map(s.patients.map((p) => [p.id, p]));
          for (const row of rows) map.set(row.id, row);
          const patients = [...map.values()];
          return {
            patients,
            activeId: s.activeId ?? patients[0]?.id ?? null,
          };
        }),
    }),
    {
      name: "smile-studio-fichas-v1",
      skipHydration: true,
      storage: createJSONStorage(() =>
        typeof window === "undefined"
          ? {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            }
          : localStorage,
      ),
      partialize: (s) => ({
        tab: s.tab,
        activeId: s.activeId,
        lastOdontologo: s.lastOdontologo,
        patients: s.patients,
      }),
    },
  ),
);

export function readImport(payload: unknown): Patient[] {
  const body =
    payload && typeof payload === "object" && "patients" in payload
      ? (payload as { patients: unknown }).patients
      : payload;
  if (!Array.isArray(body)) return [];
  return body.flatMap((row) => {
    const patient = normalizePatient(row);
    return patient ? [patient] : [];
  });
}
