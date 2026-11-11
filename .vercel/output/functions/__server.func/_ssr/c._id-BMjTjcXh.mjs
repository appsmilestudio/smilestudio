import { i as __toESM } from "../_runtime.mjs";
import { q as require_react, x as require_jsx_runtime, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Route } from "./router-CS1aPv0b.mjs";
import { L as useSmileStore, b as formatTime, g as doctorById, t as Btn, v as formatDay } from "./ui-CLvcTPwU.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/c._id-BMjTjcXh.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ConfirmPage() {
	const { id } = Route.useParams();
	const [ready, setReady] = (0, import_react.useState)(false);
	const visit = useSmileStore((state) => state.visits.find((item) => item.id === id));
	const patient = useSmileStore((state) => state.patients.find((item) => item.id === visit?.patientId));
	const moveVisit = useSmileStore((state) => state.moveVisit);
	const [done, setDone] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		Promise.resolve(useSmileStore.persist.rehydrate()).finally(() => setReady(true));
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: "/clinic-logo.png",
				alt: "Smile Studio",
				className: "mark-in mx-auto h-36 w-auto sm:h-44"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-center text-sm text-muted",
				children: "Piura"
			}),
			!ready ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-8 text-center text-sm text-muted",
				children: "Cargando tu cita…"
			}) : null,
			ready && (!visit || !patient) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-8 text-center text-sm",
				children: "Este enlace no corresponde a una cita vigente."
			}) : null,
			ready && visit && patient ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rise mt-6 rounded-2xl border border-line bg-paper px-4 py-5 shadow-card",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Cita de"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-3xl leading-tight",
						children: patient.fullName
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-sm",
						children: [formatDay(visit.date), visit.time ? ` · ${formatTime(visit.time)}` : ""]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted",
						children: [
							doctorById(visit.doctorId).short,
							" · ",
							doctorById(visit.doctorId).name
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm",
						children: visit.treatment
					}),
					done === "confirmada" || visit.status === "confirmada" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 rounded-xl bg-moss-soft px-3 py-3 text-sm text-moss",
						children: "Quedó confirmada. Te esperamos en Smile Studio."
					}) : null,
					done === "reprogramada" || visit.status === "reprogramada" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 rounded-xl bg-gold-soft px-3 py-3 text-sm text-gold-deep",
						children: "Pediste otra hora. Recepción te escribe por WhatsApp."
					}) : null,
					visit.status !== "confirmada" && visit.status !== "reprogramada" && visit.status !== "cancelada" && !done ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
							full: true,
							onClick: () => {
								moveVisit(visit.id, { status: "confirmada" });
								setDone("confirmada");
							},
							children: "Confirmo que voy"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
							full: true,
							tone: "paper",
							onClick: () => {
								moveVisit(visit.id, { status: "reprogramada" });
								setDone("reprogramada");
							},
							children: "Quiero otra hora"
						})]
					}) : null
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/",
				className: "mt-6 text-center text-sm text-gold-deep",
				children: "Volver al consultorio"
			})
		]
	});
}
//#endregion
export { ConfirmPage as component };
