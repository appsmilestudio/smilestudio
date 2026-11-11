import { i as __toESM } from "../_runtime.mjs";
import { q as require_react, x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as ChevronLeft, r as ChevronRight, t as X } from "../_libs/lucide-react.mjs";
import { n as format, t as es } from "../_libs/date-fns.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ui-CLvcTPwU.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var DOCTORS = [{
	id: "judith",
	short: "Dra. Judith",
	name: "Judith Escobedo Arteaga",
	focus: "Ortodoncia y clínica general"
}, {
	id: "miguel",
	short: "Dr. Miguel",
	name: "Miguel Oyola Bayona",
	focus: "Endodoncia"
}];
var SLOTS = [
	"10:00",
	"10:30",
	"11:00",
	"11:30",
	"12:00",
	"17:00",
	"17:30",
	"18:00",
	"18:30",
	"19:00",
	"19:30"
];
var METHODS = [
	"efectivo",
	"yape",
	"plin",
	"pos"
];
var METHOD_LABEL = {
	efectivo: "Efectivo",
	yape: "Yape",
	plin: "Plin",
	pos: "POS"
};
var TREATMENTS = [
	"Consulta",
	"Control de ortodoncia",
	"Limpieza completa",
	"Restauración",
	"Extracción",
	"Apertura de endodoncia",
	"Sesión de endodoncia",
	"Cirugía de tercer molar",
	"Ajuste"
];
var QUICK_AMOUNTS = [
	20,
	50,
	80,
	100,
	120,
	150,
	200,
	350
];
var MONTHS = [
	"Enero",
	"Febrero",
	"Marzo",
	"Abril",
	"Mayo",
	"Junio",
	"Julio",
	"Agosto",
	"Septiembre",
	"Octubre",
	"Noviembre",
	"Diciembre"
];
var STATUS_LABEL = {
	solicitud: "Solicitud",
	agendada: "Sin confirmar",
	recordatorio: "Aviso enviado",
	confirmada: "Confirmada",
	en_sala: "En sala",
	en_atencion: "En atención",
	atendida: "Atendida",
	no_show: "No asistió",
	reprogramada: "Por reprogramar",
	cancelada: "Cancelada"
};
var NO_CHARGE = /solo control|solo evaluaci[oó]n|^evaluaci[oó]n$|retiro de puntos|ajuste de pr[oó]tesis/i;
function doctorById(id) {
	return DOCTORS.find((d) => d.id === id) ?? DOCTORS[0];
}
function fold(value) {
	return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
}
function slug(value) {
	return fold(value).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function uid(prefix) {
	return `${prefix}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
}
function dayDate(iso) {
	const [y, m, d] = iso.split("-").map(Number);
	return new Date(y, (m ?? 1) - 1, d ?? 1);
}
function toIso(date) {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function shiftDay(iso, days) {
	const date = dayDate(iso);
	date.setDate(date.getDate() + days);
	return toIso(date);
}
function isSunday(iso) {
	return dayDate(iso).getDay() === 0;
}
function limaToday() {
	return new Intl.DateTimeFormat("en-CA", {
		timeZone: "America/Lima",
		year: "numeric",
		month: "2-digit",
		day: "2-digit"
	}).format(/* @__PURE__ */ new Date());
}
function nextOpenDay(today = limaToday()) {
	return isSunday(today) ? shiftDay(today, 1) : today;
}
function latestOnOrBefore(dates, today) {
	let best = "";
	for (const date of dates) if (date <= today && date > best) best = date;
	return best || today;
}
function formatDay(iso) {
	const raw = format(dayDate(iso), "EEEE d 'de' MMMM", { locale: es });
	return raw.charAt(0).toLocaleUpperCase("es-PE") + raw.slice(1);
}
function formatTime(hhmm) {
	const [hs, ms] = hhmm.split(":");
	const h = Number(hs);
	const suffix = h >= 12 ? "p. m." : "a. m.";
	return `${h % 12 || 12}:${ms} ${suffix}`;
}
function formatStamp(iso) {
	return new Intl.DateTimeFormat("es-PE", {
		timeZone: "America/Lima",
		day: "numeric",
		month: "short",
		hour: "numeric",
		minute: "2-digit"
	}).format(new Date(iso));
}
function soles(amount) {
	const sign = amount < 0 ? "-" : "";
	const abs = Math.abs(amount);
	return `${sign}S/ ${abs.toLocaleString("es-PE", {
		minimumFractionDigits: Number.isInteger(abs) ? 0 : 2,
		maximumFractionDigits: 2
	})}`;
}
function parseAmount(raw) {
	const n = Number(raw.replace(/[^\d.,]/g, "").replace(",", "."));
	if (!Number.isFinite(n)) return 0;
	return Math.round(n * 100) / 100;
}
function prettyPhone(phone) {
	const digits = phone.replace(/\D/g, "");
	if (digits.length !== 9) return phone;
	return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
}
function sumVisit(visit) {
	return visit.payments.reduce((sum, payment) => sum + payment.amount, 0);
}
function inferNoCharge(treatment, payments) {
	return payments.length === 0 && NO_CHARGE.test(treatment.trim());
}
function occupiesSlot(visit) {
	return Boolean(visit.time) && visit.status !== "cancelada" && visit.status !== "reprogramada";
}
function needsMorningPing(visit) {
	return Boolean(visit.time) && (visit.status === "agendada" || visit.status === "recordatorio");
}
function statusTone(status) {
	switch (status) {
		case "confirmada":
		case "atendida": return "moss";
		case "agendada":
		case "no_show": return "alert";
		case "recordatorio":
		case "solicitud":
		case "reprogramada": return "gold";
		case "en_sala":
		case "en_atencion": return "ink";
		default: return "muted";
	}
}
function slotAccent(status) {
	switch (status) {
		case "confirmada":
		case "atendida": return "border-l-moss";
		case "agendada":
		case "no_show": return "border-l-alert";
		case "recordatorio":
		case "solicitud": return "border-l-gold";
		default: return "border-l-ink";
	}
}
function nextStep(status) {
	switch (status) {
		case "agendada":
		case "recordatorio":
		case "reprogramada": return {
			status: "confirmada",
			label: "Confirmar cita"
		};
		case "confirmada": return {
			status: "en_sala",
			label: "Ya llegó"
		};
		case "en_sala": return {
			status: "en_atencion",
			label: "Pasar a atención"
		};
		case "en_atencion": return {
			status: "atendida",
			label: "Marcar atendida"
		};
		default: return null;
	}
}
function waHref(phone, text) {
	const digits = phone.replace(/\D/g, "");
	if (!digits) return null;
	return `https://wa.me/${digits.length === 9 ? `51${digits}` : digits}?text=${encodeURIComponent(text)}`;
}
function reminderText(patient, visit, link = "") {
	const doctor = doctorById(visit.doctorId);
	const when = visit.time ? `${formatDay(visit.date)} a las ${formatTime(visit.time)}` : formatDay(visit.date);
	const lines = [
		"Hola, te escribimos de Smile Studio.",
		`Cita de ${patient.fullName} el ${when} con ${doctor.short}.`,
		`Motivo: ${visit.treatment}.`,
		"Responde 1 para confirmar o 2 para reprogramar."
	];
	if (link) lines.push(`También puedes confirmar aquí: ${link}`);
	return lines.join("\n");
}
function emptyMethods() {
	return {
		efectivo: 0,
		yape: 0,
		plin: 0,
		pos: 0
	};
}
function countsForCash(visit) {
	return visit.status === "atendida" || visit.payments.length > 0;
}
function dayReport(visits, date) {
	const list = visits.filter((visit) => visit.date === date && visit.status !== "cancelada" && visit.status !== "reprogramada" && countsForCash(visit));
	const byMethod = emptyMethods();
	const byDoctor = {
		judith: emptyMethods(),
		miguel: emptyMethods()
	};
	const missingEvidence = [];
	for (const visit of list) for (const payment of visit.payments) {
		byMethod[payment.method] += payment.amount;
		byDoctor[visit.doctorId][payment.method] += payment.amount;
		if (payment.method !== "efectivo" && (!payment.hasEvidence || !payment.operation.trim())) missingEvidence.push({
			visit,
			payment
		});
	}
	return {
		visits: list,
		byMethod,
		total: METHODS.reduce((sum, method) => sum + byMethod[method], 0),
		byDoctor,
		missingEvidence,
		sinMonto: list.filter((visit) => sumVisit(visit) === 0 && !visit.noCharge && visit.source === "libro"),
		faltaCobro: list.filter((visit) => sumVisit(visit) === 0 && !visit.noCharge && visit.source !== "libro")
	};
}
function moneyGap(counted, expected) {
	if (counted == null) return null;
	return Math.round((counted - expected) * 100) / 100;
}
var ROWS = [
	{
		date: "2026-10-01",
		doctor: "judith",
		name: "Silva Sernaque Franklin Jhonatan",
		age: "26",
		dni: "76618935",
		phone: "910669413",
		address: "Caserío Paredones, Catacaos",
		treatment: "Limpieza completa + pasta quita manchas",
		payments: [{
			method: "plin",
			amount: 154,
			note: "Adicional S/ 34"
		}]
	},
	{
		date: "2026-10-01",
		doctor: "judith",
		name: "Yovera Sánchez Salvador Jesús",
		age: "17",
		dni: "72590432",
		phone: "934981907",
		address: "Piura",
		treatment: "Instalación de brackets inferior + tubo",
		payments: [{
			method: "efectivo",
			amount: 50
		}, {
			method: "yape",
			amount: 23
		}],
		note: "La pasta de S/ 34 sigue en deudores."
	},
	{
		date: "2026-10-02",
		doctor: "judith",
		name: "Zeña Arteaga Nicol Estrella",
		age: "15",
		address: "Villa Universitaria, Castilla",
		treatment: "Restauraciones compuestas pz. 3.6 y 3.7",
		payments: [{
			method: "yape",
			amount: 160
		}]
	},
	{
		date: "2026-10-02",
		doctor: "judith",
		name: "Zeña Arteaga Angélica",
		age: "17",
		phone: "953399535",
		address: "Villa Universitaria, Castilla",
		treatment: "Restauración estética",
		payments: [{
			method: "yape",
			amount: 90
		}]
	},
	{
		date: "2026-10-02",
		doctor: "judith",
		name: "Dávila Carrera Jean Piere",
		age: "6",
		dni: "91748327",
		phone: "953399535",
		address: "AA.HH San Pedro, Piura",
		treatment: "Consulta + extracciones (2)",
		payments: [{
			method: "plin",
			amount: 120
		}]
	},
	{
		date: "2026-10-02",
		doctor: "judith",
		name: "Cunya Núñez Ricardo Alonso",
		age: "16",
		dni: "62404489",
		phone: "993774560",
		address: "Las Lomas, Piura",
		treatment: "Extracción pz. 4.6",
		payments: [{
			method: "yape",
			amount: 60
		}]
	},
	{
		date: "2026-10-02",
		doctor: "judith",
		name: "García de Tineo Yolanda",
		age: "56",
		dni: "2873036",
		phone: "962988107",
		address: "AA.HH Miguel Grau, Piura",
		treatment: "Ajuste de prótesis"
	},
	{
		date: "2026-10-03",
		doctor: "judith",
		name: "Navarro Siancas Keydi Rubén",
		age: "20",
		dni: "74658602",
		phone: "929161071",
		address: "Caserío Punta Arena",
		treatment: "Ligas intermaxilares y ajuste",
		payments: [{
			method: "efectivo",
			amount: 100,
			note: "Yape cancelado el 28/09"
		}]
	},
	{
		date: "2026-10-03",
		doctor: "judith",
		name: "García Agurto Asly Noemí",
		age: "25",
		dni: "76968377",
		phone: "921788945",
		address: "Tambogrande, Piura",
		treatment: "Tubo pz. 3.7 y 3.5 + doble ajuste",
		payments: [{
			method: "plin",
			amount: 100
		}],
		month: "Septiembre"
	},
	{
		date: "2026-10-03",
		doctor: "judith",
		name: "Llacsahuanga Sondor Leslie",
		age: "26",
		dni: "73310668",
		phone: "946241805",
		address: "Ciudad Blanca, Paita",
		treatment: "Cadena inferior y doble ajuste superior"
	},
	{
		date: "2026-10-03",
		doctor: "judith",
		name: "Bereche Almendáriz Fabricio",
		age: "7",
		phone: "926711811",
		address: "Túpac Amaru II, Piura",
		treatment: "Solo control"
	},
	{
		date: "2026-10-03",
		doctor: "judith",
		name: "Ruiz Lequernaque Raitza",
		age: "29",
		dni: "75176224",
		phone: "918334866",
		address: "Calle Mariscal Castilla",
		treatment: "Consulta + apertura de endodoncia pz. 4.6",
		payments: [{
			method: "plin",
			amount: 120
		}]
	},
	{
		date: "2026-10-05",
		doctor: "judith",
		name: "Silva Castro Angie",
		age: "14",
		phone: "998522892",
		address: "Urb. San José, Piura",
		treatment: "Cadena superior y ajuste inferior + pasta",
		payments: [{
			method: "yape",
			amount: 135,
			note: "Pasta + S/ 35"
		}],
		month: "Septiembre"
	},
	{
		date: "2026-10-05",
		doctor: "judith",
		name: "Rodríguez Rojas Celeste",
		age: "13",
		dni: "77926176",
		phone: "900647332",
		address: "Calle Ayabaca, Piura",
		treatment: "Cadena pz. 2.3-2.4, ajuste y pegado de tubo"
	},
	{
		date: "2026-10-05",
		doctor: "judith",
		name: "Flores Soluco Gerardo",
		age: "41",
		dni: "43460616",
		phone: "974293436",
		address: "La Nueva Providencia, Piura",
		treatment: "Cadena inferior + ajuste y tubo nuevo",
		payments: [{
			method: "plin",
			amount: 140
		}],
		month: "Septiembre"
	},
	{
		date: "2026-10-05",
		doctor: "judith",
		name: "Tineo Ollaguez Sendy",
		age: "23",
		dni: "70310111",
		phone: "960357357",
		address: "AA.HH La Victoria, Piura",
		treatment: "Doble ajuste inferior",
		payments: [{
			method: "yape",
			amount: 100
		}],
		month: "Septiembre"
	},
	{
		date: "2026-10-05",
		doctor: "judith",
		name: "Gonzales Díaz Wilton Erlin",
		age: "26",
		dni: "76208818",
		phone: "943308642",
		address: "Calle Marañón 419, Pachitea",
		treatment: "Cadena superior e inferior y ajuste pz. 2.3",
		payments: [{
			method: "pos",
			amount: 100
		}],
		month: "Septiembre"
	},
	{
		date: "2026-10-05",
		doctor: "judith",
		name: "Sifuentes Celi Lizzeth",
		age: "47",
		address: "Sullana",
		treatment: "Limpieza profunda",
		payments: [{
			method: "plin",
			amount: 100
		}]
	},
	{
		date: "2026-10-05",
		doctor: "judith",
		name: "Zegarra Ramírez Marco Augusto",
		age: "48",
		dni: "40152343",
		address: "Urb. Los Cocos del Chipe",
		treatment: "Cirugía de tercer molar",
		payments: [{
			method: "plin",
			amount: 150
		}]
	},
	{
		date: "2026-10-06",
		doctor: "judith",
		name: "Matías Villegas José Regino",
		age: "63",
		dni: "2779097",
		phone: "968839893",
		address: "Calle Pachacútec, Castilla",
		treatment: "Tallado, escaneo y toma de impresión",
		payments: [{
			method: "plin",
			amount: 350
		}]
	},
	{
		date: "2026-10-06",
		doctor: "judith",
		name: "Sandoval Urbina Junior Denilson",
		age: "21",
		dni: "76056487",
		phone: "906963824",
		address: "Calle Ch, AA.HH El Indio",
		treatment: "Striping y cadena inferior"
	},
	{
		date: "2026-10-07",
		doctor: "judith",
		name: "Romero Requena Antony Jesús",
		age: "19",
		dni: "61263078",
		phone: "922871405",
		address: "Cuartel Grau, Piura",
		treatment: "Cirugía de tercer molar pz. 2.8",
		payments: [{
			method: "efectivo",
			amount: 50
		}, {
			method: "plin",
			amount: 150
		}]
	},
	{
		date: "2026-10-07",
		doctor: "judith",
		name: "Encalada Arroyo Alberto",
		age: "45",
		dni: "42854962",
		phone: "960855057",
		address: "San Sebastián, Piura",
		treatment: "Control de ortodoncia",
		payments: [{
			method: "pos",
			amount: 100
		}]
	},
	{
		date: "2026-10-07",
		doctor: "judith",
		name: "Sandoval Urbina Keyla Belén",
		age: "23",
		dni: "75434353",
		phone: "948366672",
		address: "Calle Ch, AA.HH El Indio",
		treatment: "Limpieza completa",
		payments: [{
			method: "efectivo",
			amount: 150
		}]
	},
	{
		date: "2026-10-07",
		doctor: "judith",
		name: "Magallanes Morales Francis Rebeca",
		age: "28",
		dni: "6390258",
		phone: "929063810",
		address: "Morropón, Piura",
		treatment: "Consulta y extracción",
		payments: [{
			method: "plin",
			amount: 80
		}]
	},
	{
		date: "2026-10-07",
		doctor: "judith",
		name: "Castillo García Jorge Luis",
		age: "34",
		dni: "70039066",
		phone: "974877527",
		address: "Morropón, Piura",
		treatment: "Consulta + limpieza completa",
		payments: [{
			method: "plin",
			amount: 140
		}]
	},
	{
		date: "2026-10-07",
		doctor: "judith",
		name: "Castillo Holguín Leticia",
		age: "15",
		dni: "74333011",
		phone: "941678137",
		address: "Urb. Los Tallanes, Piura",
		treatment: "Control de ortodoncia y reconstrucción",
		payments: [{
			method: "efectivo",
			amount: 290
		}, {
			method: "pos",
			amount: 120,
			note: "Pago Lidice"
		}]
	},
	{
		date: "2026-10-07",
		doctor: "judith",
		name: "Ancajima Facundo Álvaro",
		age: "15",
		dni: "77119653",
		phone: "902899744",
		address: "Villa Jardín, Piura",
		treatment: "Resorte abierto inferior + alambre de ligadura pz. 2.2",
		payments: [{
			method: "plin",
			amount: 100
		}],
		month: "Septiembre"
	},
	{
		date: "2026-10-09",
		doctor: "judith",
		name: "Ruiz Lequernaque Raitza",
		treatment: "Solo evaluación"
	},
	{
		date: "2026-10-09",
		doctor: "judith",
		name: "Saavedra Calero Clariza Araceli",
		age: "26",
		dni: "76440643",
		phone: "918297095",
		address: "AA.HH Mónica Zapata, Piura",
		treatment: "Consulta",
		payments: [{
			method: "plin",
			amount: 20
		}],
		ev: false
	},
	{
		date: "2026-10-09",
		doctor: "judith",
		name: "Meza Andrade Carlos Hipólito",
		age: "66",
		dni: "22090392",
		phone: "954185322",
		address: "Urb. Santa Margarita, Ica",
		treatment: "Consulta",
		payments: [{
			method: "plin",
			amount: 20
		}],
		ev: true
	},
	{
		date: "2026-10-09",
		doctor: "judith",
		name: "Ruiz Ruiz Elena",
		age: "20",
		dni: "76034940",
		phone: "965327102",
		address: "Villa Kurber, Piura",
		treatment: "Retiro de brackets y saldo anterior",
		payments: [{
			method: "efectivo",
			amount: 160
		}, {
			method: "plin",
			amount: 10
		}],
		ev: false,
		note: "Incluye saldo anterior de ortodoncia."
	},
	{
		date: "2026-10-09",
		doctor: "judith",
		name: "Salcedo Cobeñas María Elizabeth",
		age: "38",
		dni: "47999116",
		phone: "983212270",
		address: "AA.HH El Indio, Castilla",
		treatment: "Cirugía de tercer molar pz. 1.8",
		payments: [{
			method: "yape",
			amount: 130
		}],
		ev: true
	},
	{
		date: "2026-10-09",
		doctor: "judith",
		name: "Cobeñas Yovera Felipa",
		age: "56",
		dni: "2808336",
		phone: "983212270",
		address: "AA.HH El Indio, Castilla",
		treatment: "Solo evaluación"
	},
	{
		date: "2026-10-09",
		doctor: "judith",
		name: "Piscoya Coronado José Carlos",
		age: "29",
		dni: "74719681",
		phone: "974489173",
		address: "UPIS Monterrico, Piura",
		treatment: "Consulta + restauración con reconstrucción",
		payments: [{
			method: "yape",
			amount: 110
		}],
		ev: false
	},
	{
		date: "2026-10-09",
		doctor: "judith",
		name: "Medina Bravo Felipe Alessandro",
		age: "3",
		dni: "93511816",
		phone: "970679795",
		address: "Urb. Miraflores, Castilla",
		treatment: "Consulta + restauración con base",
		payments: [{
			method: "efectivo",
			amount: 100
		}]
	},
	{
		date: "2026-10-10",
		doctor: "judith",
		name: "Lalupu Nizama Víctor Yoel",
		age: "25",
		dni: "76977971",
		phone: "940109691",
		address: "AA.HH Ciudad del Sol",
		treatment: "Certificado médico",
		payments: [{
			method: "yape",
			amount: 50
		}],
		ev: false
	},
	{
		date: "2026-10-10",
		doctor: "judith",
		name: "Chunga Nizama Aldair",
		age: "20",
		dni: "71120434",
		phone: "994828736",
		address: "La Arena, Bajo Piura",
		treatment: "Reposición pz. 1.1 y 2.1 + cadena inferior",
		payments: [{
			method: "plin",
			amount: 100
		}],
		ev: true
	},
	{
		date: "2026-10-10",
		doctor: "judith",
		name: "Calle Yarlequé María Fernanda",
		age: "13",
		phone: "975636148",
		address: "Centro poblado Chapaira",
		treatment: "Consulta + apertura de endodoncia pz. 1.6",
		payments: [{
			method: "efectivo",
			amount: 400
		}]
	},
	{
		date: "2026-10-10",
		doctor: "judith",
		name: "Calle Yarlequé Briana Mercedes",
		age: "9",
		phone: "975636148",
		address: "Centro poblado Chapaira",
		treatment: "Consulta + limpieza dental",
		note: "Vino con su hermana María Fernanda. En el libro no quedó el monto."
	},
	{
		date: "2026-10-01",
		doctor: "miguel",
		name: "Córdova Huamán Yanela Cristina",
		age: "29",
		dni: "70368717",
		phone: "981649446",
		address: "Calle Grau, Ayabaca",
		treatment: "Segunda sesión de endodoncia pz. 2.4",
		payments: [{
			method: "efectivo",
			amount: 100
		}]
	},
	{
		date: "2026-10-05",
		doctor: "miguel",
		name: "López Pintado Etelvina",
		age: "50",
		dni: "3359809",
		phone: "969457322",
		address: "Calle Amazonas 1101, Castilla",
		treatment: "Segunda sesión de endodoncia pz. 3.4",
		payments: [{
			method: "plin",
			amount: 150
		}]
	},
	{
		date: "2026-10-06",
		doctor: "miguel",
		name: "Córdova Huamán Yanela Cristina",
		treatment: "Última sesión de endodoncia + restauración",
		payments: [{
			method: "yape",
			amount: 90
		}]
	},
	{
		date: "2026-10-09",
		doctor: "miguel",
		name: "García de Tineo Yolanda",
		treatment: "Solo evaluación"
	},
	{
		date: "2026-10-09",
		doctor: "miguel",
		name: "Ruiz Lequernaque Raitza",
		treatment: "Segunda sesión de endodoncia pz. 4.6",
		payments: [{
			method: "yape",
			amount: 200
		}],
		ev: false
	},
	{
		date: "2026-10-09",
		doctor: "miguel",
		name: "López Pintado Etelvina",
		treatment: "Tercera sesión de endodoncia pz. 3.4",
		payments: [{
			method: "plin",
			amount: 130
		}],
		ev: true
	},
	{
		date: "2026-10-10",
		doctor: "miguel",
		name: "Pozo Yovera Tatiana Elizabeth",
		age: "31",
		dni: "70121806",
		phone: "917050800",
		address: "Ignacio Merino, Piura",
		treatment: "Segunda sesión de endodoncia pz. 1.7",
		payments: [{
			method: "plin",
			amount: 100
		}],
		ev: false
	},
	{
		date: "2026-10-12",
		doctor: "judith",
		name: "Castillo Holguín Leticia",
		treatment: "Control de ortodoncia",
		time: "10:00",
		status: "confirmada",
		source: "agenda"
	},
	{
		date: "2026-10-12",
		doctor: "judith",
		name: "Flores Soluco Gerardo",
		treatment: "Cadena inferior y ajuste",
		time: "10:30",
		status: "recordatorio",
		source: "agenda"
	},
	{
		date: "2026-10-12",
		doctor: "judith",
		name: "Gonzales Díaz Wilton Erlin",
		treatment: "Ajuste de ortodoncia",
		time: "11:00",
		status: "agendada",
		source: "agenda"
	},
	{
		date: "2026-10-12",
		doctor: "judith",
		name: "Tineo Ollaguez Sendy",
		treatment: "Doble ajuste inferior",
		time: "11:30",
		status: "confirmada",
		source: "agenda"
	},
	{
		date: "2026-10-12",
		doctor: "judith",
		name: "Sandoval Urbina Junior Denilson",
		treatment: "Striping y cadena",
		time: "12:00",
		status: "agendada",
		source: "agenda"
	},
	{
		date: "2026-10-12",
		doctor: "judith",
		name: "Chunga Nizama Aldair",
		treatment: "Control de ortodoncia",
		time: "17:00",
		status: "recordatorio",
		source: "agenda"
	},
	{
		date: "2026-10-12",
		doctor: "miguel",
		name: "López Pintado Etelvina",
		treatment: "Cuarta sesión de endodoncia pz. 3.4",
		time: "10:00",
		status: "confirmada",
		source: "agenda"
	},
	{
		date: "2026-10-12",
		doctor: "miguel",
		name: "Pozo Yovera Tatiana Elizabeth",
		treatment: "Tercera sesión de endodoncia pz. 1.7",
		time: "11:00",
		status: "recordatorio",
		source: "agenda"
	},
	{
		date: "2026-10-12",
		doctor: "miguel",
		name: "Ruiz Lequernaque Raitza",
		treatment: "Tercera sesión de endodoncia pz. 4.6",
		time: "17:30",
		status: "agendada",
		source: "agenda"
	},
	{
		date: "2026-10-12",
		doctor: "judith",
		name: "Palacios Arce Mía",
		age: "11",
		dni: "78860205",
		phone: "955643519",
		address: "María Goretti, Castilla",
		treatment: "Control de ortodoncia",
		status: "solicitud",
		source: "whatsapp"
	},
	{
		date: "2026-10-12",
		doctor: "judith",
		name: "Flores Bravo Néstor Adriano",
		age: "15",
		dni: "76111034",
		phone: "974293436",
		address: "La Nueva Providencia, Piura",
		treatment: "Ajuste superior e inferior",
		status: "solicitud",
		source: "whatsapp"
	}
];
var DIRECTORY = [
	{
		fullName: "Puelles Cruz Vanessa",
		age: "26",
		dni: "75186927",
		phone: "962586317",
		address: "AA.HH La Victoria, Piura"
	},
	{
		fullName: "Córdova Livia Jesús",
		age: "56",
		dni: "2821076",
		phone: "924251202",
		address: "Pueblo Joven San Pedro"
	},
	{
		fullName: "Aguallo Castillo Lídice",
		age: "",
		dni: "",
		phone: "",
		address: ""
	},
	{
		fullName: "Palacios Zapata Mirna",
		age: "69",
		dni: "2779921",
		phone: "976081292",
		address: "Av. Junín 645, Piura"
	},
	{
		fullName: "Agurto Colmenares Johan",
		age: "",
		dni: "",
		phone: "",
		address: ""
	},
	{
		fullName: "Fossa Rojas Lidia",
		age: "",
		dni: "",
		phone: "",
		address: ""
	},
	{
		fullName: "Seminario Esquen Claudia Gabriela",
		age: "18",
		dni: "70640285",
		phone: "942002134",
		address: "AA.HH Los Ficus, Piura"
	},
	{
		fullName: "Arteaga Encalada Rafael",
		age: "",
		dni: "",
		phone: "",
		address: ""
	},
	{
		fullName: "Montero Rebata Darwin",
		age: "16",
		dni: "7259303",
		phone: "970410947",
		address: "AA.HH Túpac Amaru III"
	},
	{
		fullName: "Chiroque Correa Karen América",
		age: "",
		dni: "",
		phone: "",
		address: ""
	}
];
var DEBT_ROWS = [
	{
		name: "Aguallo Castillo Lídice",
		amount: 120,
		concept: "Blanqueamiento",
		status: "pagado"
	},
	{
		name: "Palacios Zapata Mirna",
		amount: 80,
		concept: "Reconstrucción",
		status: "pagado"
	},
	{
		name: "Agurto Colmenares Johan",
		amount: 40,
		concept: "Control",
		status: "pendiente"
	},
	{
		name: "Fossa Rojas Lidia",
		amount: 50,
		concept: "Enjuague",
		status: "pagado"
	},
	{
		name: "Castillo Holguín Leticia",
		amount: 100,
		concept: "Ortodoncia agosto",
		status: "pagado"
	},
	{
		name: "Ruiz Ruiz Elena",
		amount: 50,
		concept: "Control",
		status: "pagado"
	},
	{
		name: "Seminario Esquen Claudia Gabriela",
		amount: 100,
		concept: "Ortodoncia junio",
		status: "pendiente"
	},
	{
		name: "Arteaga Encalada Rafael",
		amount: 100,
		concept: "3 restauraciones",
		status: "pendiente"
	},
	{
		name: "Montero Rebata Darwin",
		amount: 100,
		concept: "Ortodoncia mayo",
		status: "pendiente"
	},
	{
		name: "Chiroque Correa Karen América",
		amount: 34,
		concept: "Pasta",
		status: "pendiente"
	},
	{
		name: "Yovera Sánchez Salvador Jesús",
		amount: 34,
		concept: "Pasta",
		status: "pendiente"
	}
];
function opFrom(seed) {
	let h = 2166136261;
	for (let i = 0; i < seed.length; i++) {
		h ^= seed.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return String((h >>> 0) % 9e5 + 1e5);
}
function createSeed() {
	const patients = /* @__PURE__ */ new Map();
	const visits = [];
	let n = 0;
	let payN = 0;
	const touch = (row) => {
		const key = fold(row.name);
		const found = [...patients.values()].find((patient) => fold(patient.fullName) === key);
		if (found) {
			found.age = found.age || row.age || "";
			found.dni = found.dni || row.dni || "";
			found.phone = found.phone || row.phone || "";
			found.address = found.address || row.address || "";
			return found;
		}
		const patient = {
			id: slug(row.name),
			fullName: row.name,
			age: row.age ?? "",
			dni: row.dni ?? "",
			phone: row.phone ?? "",
			address: row.address ?? ""
		};
		patients.set(patient.id, patient);
		return patient;
	};
	for (const row of ROWS) {
		const patient = touch(row);
		n += 1;
		const id = `v-${String(n).padStart(3, "0")}`;
		const payments = (row.payments ?? []).map((payment) => {
			payN += 1;
			const hasEvidence = payment.method !== "efectivo" && (row.ev ?? row.date < "2026-10-09");
			return {
				id: `pay-${payN}`,
				method: payment.method,
				amount: payment.amount,
				note: payment.note ?? "",
				operation: hasEvidence ? opFrom(`${id}-${payment.method}-${payment.amount}`) : "",
				hasEvidence
			};
		});
		visits.push({
			id,
			patientId: patient.id,
			doctorId: row.doctor,
			date: row.date,
			time: row.time ?? null,
			treatment: row.treatment,
			status: row.status ?? "atendida",
			payments,
			monthTag: row.month ?? "",
			note: row.note ?? "",
			source: row.source ?? "libro",
			noCharge: inferNoCharge(row.treatment, payments)
		});
	}
	for (const extra of DIRECTORY) touch({
		name: extra.fullName,
		age: extra.age,
		dni: extra.dni,
		phone: extra.phone,
		address: extra.address
	});
	const debts = DEBT_ROWS.map((debt, index) => {
		const patient = touch({ name: debt.name });
		return {
			id: `debt-${index + 1}`,
			patientId: patient.id,
			amount: debt.amount,
			concept: debt.concept,
			status: debt.status
		};
	});
	return {
		patients: [...patients.values()],
		visits,
		debts,
		closes: {}
	};
}
function blankClose() {
	return {
		cashCounted: null,
		note: "",
		closedAt: null
	};
}
var useSmileStore = create()(persist((set, get) => ({
	...createSeed(),
	role: "recepcion",
	setRole: (role) => set({ role }),
	savePatient: (patient) => {
		const patients = get().patients;
		const index = patients.findIndex((item) => item.id === patient.id);
		if (index === -1) set({ patients: [...patients, patient] });
		else {
			const next = patients.slice();
			next[index] = patient;
			set({ patients: next });
		}
	},
	createPatient: (draft) => {
		const patients = get().patients;
		const exact = patients.find((item) => item.fullName.trim().toLowerCase() === draft.fullName.trim().toLowerCase());
		if (exact) return exact.id;
		const id = uid("p");
		set({ patients: [...patients, {
			...draft,
			id
		}] });
		return id;
	},
	addVisit: (visit) => {
		const id = uid("v");
		set({ visits: [...get().visits, {
			...visit,
			id
		}] });
		return id;
	},
	patchVisit: (id, patch) => {
		set({ visits: get().visits.map((visit) => visit.id === id ? {
			...visit,
			...patch
		} : visit) });
	},
	moveVisit: (id, patch) => {
		const current = get().visits.find((visit) => visit.id === id);
		if (!current) return {
			ok: false,
			reason: "No encontramos la cita."
		};
		const next = {
			...current,
			...patch
		};
		if (next.status === "reprogramada" || next.status === "cancelada") next.time = null;
		if (next.time && occupiesSlot(next)) {
			if (get().visits.some((visit) => visit.id !== id && visit.date === next.date && visit.doctorId === next.doctorId && visit.time === next.time && occupiesSlot(visit))) return {
				ok: false,
				reason: "Ese horario ya está ocupado."
			};
		}
		set({ visits: get().visits.map((visit) => visit.id === id ? next : visit) });
		return { ok: true };
	},
	removeVisit: (id) => set({ visits: get().visits.filter((visit) => visit.id !== id) }),
	addPayment: (visitId, payment) => {
		set({ visits: get().visits.map((visit) => visit.id === visitId ? {
			...visit,
			payments: [...visit.payments, {
				...payment,
				id: uid("pay")
			}]
		} : visit) });
	},
	patchPayment: (visitId, paymentId, patch) => {
		set({ visits: get().visits.map((visit) => visit.id === visitId ? {
			...visit,
			payments: visit.payments.map((payment) => payment.id === paymentId ? {
				...payment,
				...patch
			} : payment)
		} : visit) });
	},
	removePayment: (visitId, paymentId) => {
		set({ visits: get().visits.map((visit) => visit.id === visitId ? {
			...visit,
			payments: visit.payments.filter((payment) => payment.id !== paymentId)
		} : visit) });
	},
	setCashDraft: (date, patch) => {
		const current = get().closes[date] ?? blankClose();
		set({ closes: {
			...get().closes,
			[date]: {
				...current,
				...patch
			}
		} });
	},
	closeDay: (date) => {
		const report = dayReport(get().visits, date);
		const current = get().closes[date] ?? blankClose();
		if (current.cashCounted == null) return "Cuenta el efectivo antes de cerrar.";
		const gap = moneyGap(current.cashCounted, report.byMethod.efectivo) ?? 0;
		if ((report.missingEvidence.length > 0 || report.faltaCobro.length > 0 || Math.abs(gap) > .009) && !current.note.trim()) return "Anota el motivo de la diferencia o de lo que falta.";
		set({ closes: {
			...get().closes,
			[date]: {
				...current,
				closedAt: (/* @__PURE__ */ new Date()).toISOString()
			}
		} });
		return null;
	},
	reopenDay: (date) => {
		const current = get().closes[date];
		if (!current) return;
		set({ closes: {
			...get().closes,
			[date]: {
				...current,
				closedAt: null
			}
		} });
	},
	collectDebt: (debtId, method, date) => {
		const debt = get().debts.find((item) => item.id === debtId);
		if (!debt || debt.status === "pagado") return null;
		const visit = {
			id: uid("v"),
			patientId: debt.patientId,
			doctorId: "judith",
			date,
			time: null,
			treatment: `Cobro de saldo · ${debt.concept}`,
			status: "atendida",
			payments: [{
				id: uid("pay"),
				method,
				amount: debt.amount,
				operation: "",
				note: debt.concept,
				hasEvidence: false
			}],
			monthTag: "",
			note: "",
			source: "mostrador",
			noCharge: false
		};
		set({
			debts: get().debts.map((item) => item.id === debtId ? {
				...item,
				status: "pagado"
			} : item),
			visits: [...get().visits, visit]
		});
		return visit.id;
	},
	resetLibro: () => set({
		...createSeed(),
		role: get().role
	})
}), {
	name: "smile-studio-libro-1",
	skipHydration: true,
	partialize: (state) => ({
		patients: state.patients,
		visits: state.visits,
		debts: state.debts,
		closes: state.closes,
		role: state.role
	})
}));
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function Pill({ children, tone }) {
	const cls = {
		muted: "bg-cream text-muted",
		gold: "bg-gold-soft text-gold-deep",
		moss: "bg-moss-soft text-moss",
		alert: "bg-alert-soft text-alert",
		ink: "bg-ink text-paper"
	}[tone];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", cls),
		children
	});
}
var inputClass = "h-11 w-full rounded-xl border border-line bg-cream px-3 text-sm text-ink";
function Field({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "mb-1 block text-sm text-muted",
			children: label
		}), children]
	});
}
function Btn({ children, onClick, tone = "ink", type = "button", disabled, full }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type,
		disabled,
		onClick,
		className: cn("press inline-flex h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-medium shadow-card disabled:opacity-40", {
			ink: "bg-ink text-paper",
			paper: "border border-line bg-paper text-ink",
			moss: "bg-moss text-paper",
			alert: "bg-alert text-paper"
		}[tone], full && "w-full"),
		children
	});
}
function DayNav({ date, today, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2 rounded-2xl border border-line bg-paper px-2 py-2 shadow-card sm:gap-3 sm:px-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-label": "Día anterior",
				className: "press grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line bg-cream",
				onClick: () => onChange(shiftDay(date, -1)),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-5" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1 text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "truncate font-display text-2xl leading-tight text-ink sm:text-3xl",
					children: formatDay(date)
				}), date !== today ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "mt-1 text-sm text-gold-deep",
					onClick: () => onChange(today),
					children: "Volver a hoy"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "Hoy"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-label": "Día siguiente",
				className: "press grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line bg-cream",
				onClick: () => onChange(shiftDay(date, 1)),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-5" })
			})
		]
	});
}
function Sheet({ title, subtitle, onClose, children, footer }) {
	(0, import_react.useEffect)(() => {
		const onKey = (event) => {
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-40 flex items-end justify-end sm:items-stretch",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			"aria-label": "Cerrar",
			className: "sheet-back absolute inset-0 bg-ink/40",
			onClick: onClose
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			role: "dialog",
			"aria-modal": "true",
			"aria-label": title,
			className: "sheet-panel relative flex h-[92vh] w-full max-w-lg flex-col rounded-t-3xl bg-paper shadow-card sm:h-full sm:rounded-none",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "flex items-start gap-3 border-b border-line px-4 py-4 sm:px-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl leading-tight",
							children: title
						}), subtitle ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: subtitle
						}) : null]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": "Cerrar panel",
						className: "press grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line",
						onClick: onClose,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5",
					children
				}),
				footer ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
					className: "border-t border-line px-4 py-3 sm:px-5",
					children: footer
				}) : null
			]
		})]
	});
}
//#endregion
export { parseAmount as A, latestOnOrBefore as C, nextOpenDay as D, needsMorningPing as E, statusTone as F, sumVisit as I, useSmileStore as L, reminderText as M, slotAccent as N, nextStep as O, soles as P, waHref as R, isSunday as S, moneyGap as T, fold as _, METHODS as a, formatTime as b, Pill as c, STATUS_LABEL as d, Sheet as f, doctorById as g, dayReport as h, Field as i, prettyPhone as j, occupiesSlot as k, QUICK_AMOUNTS as l, cn as m, DOCTORS as n, METHOD_LABEL as o, TREATMENTS as p, DayNav as r, MONTHS as s, Btn as t, SLOTS as u, formatDay as v, limaToday as w, inputClass as x, formatStamp as y };
