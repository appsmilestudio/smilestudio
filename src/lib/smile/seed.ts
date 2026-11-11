import {
  inferNoCharge,
  slug,
  fold,
  type DayClose,
  type Debt,
  type DoctorId,
  type Patient,
  type PayMethod,
  type Payment,
  type Visit,
  type VisitSource,
  type VisitStatus,
} from "./model";

type PayIn = { method: PayMethod; amount: number; note?: string };

type Row = {
  date: string;
  doctor: DoctorId;
  name: string;
  treatment: string;
  age?: string;
  dni?: string;
  phone?: string;
  address?: string;
  payments?: PayIn[];
  month?: string;
  time?: string;
  status?: VisitStatus;
  source?: VisitSource;
  ev?: boolean;
  note?: string;
};

const ROWS: Row[] = [
  {
    date: "2026-10-01",
    doctor: "judith",
    name: "Silva Sernaque Franklin Jhonatan",
    age: "26",
    dni: "76618935",
    phone: "910669413",
    address: "Caserío Paredones, Catacaos",
    treatment: "Limpieza completa + pasta quita manchas",
    payments: [{ method: "plin", amount: 154, note: "Adicional S/ 34" }],
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
    payments: [
      { method: "efectivo", amount: 50 },
      { method: "yape", amount: 23 },
    ],
    note: "La pasta de S/ 34 sigue en deudores.",
  },
  {
    date: "2026-10-02",
    doctor: "judith",
    name: "Zeña Arteaga Nicol Estrella",
    age: "15",
    address: "Villa Universitaria, Castilla",
    treatment: "Restauraciones compuestas pz. 3.6 y 3.7",
    payments: [{ method: "yape", amount: 160 }],
  },
  {
    date: "2026-10-02",
    doctor: "judith",
    name: "Zeña Arteaga Angélica",
    age: "17",
    phone: "953399535",
    address: "Villa Universitaria, Castilla",
    treatment: "Restauración estética",
    payments: [{ method: "yape", amount: 90 }],
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
    payments: [{ method: "plin", amount: 120 }],
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
    payments: [{ method: "yape", amount: 60 }],
  },
  {
    date: "2026-10-02",
    doctor: "judith",
    name: "García de Tineo Yolanda",
    age: "56",
    dni: "2873036",
    phone: "962988107",
    address: "AA.HH Miguel Grau, Piura",
    treatment: "Ajuste de prótesis",
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
    payments: [{ method: "efectivo", amount: 100, note: "Yape cancelado el 28/09" }],
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
    payments: [{ method: "plin", amount: 100 }],
    month: "Septiembre",
  },
  {
    date: "2026-10-03",
    doctor: "judith",
    name: "Llacsahuanga Sondor Leslie",
    age: "26",
    dni: "73310668",
    phone: "946241805",
    address: "Ciudad Blanca, Paita",
    treatment: "Cadena inferior y doble ajuste superior",
  },
  {
    date: "2026-10-03",
    doctor: "judith",
    name: "Bereche Almendáriz Fabricio",
    age: "7",
    phone: "926711811",
    address: "Túpac Amaru II, Piura",
    treatment: "Solo control",
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
    payments: [{ method: "plin", amount: 120 }],
  },
  {
    date: "2026-10-05",
    doctor: "judith",
    name: "Silva Castro Angie",
    age: "14",
    phone: "998522892",
    address: "Urb. San José, Piura",
    treatment: "Cadena superior y ajuste inferior + pasta",
    payments: [{ method: "yape", amount: 135, note: "Pasta + S/ 35" }],
    month: "Septiembre",
  },
  {
    date: "2026-10-05",
    doctor: "judith",
    name: "Rodríguez Rojas Celeste",
    age: "13",
    dni: "77926176",
    phone: "900647332",
    address: "Calle Ayabaca, Piura",
    treatment: "Cadena pz. 2.3-2.4, ajuste y pegado de tubo",
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
    payments: [{ method: "plin", amount: 140 }],
    month: "Septiembre",
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
    payments: [{ method: "yape", amount: 100 }],
    month: "Septiembre",
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
    payments: [{ method: "pos", amount: 100 }],
    month: "Septiembre",
  },
  {
    date: "2026-10-05",
    doctor: "judith",
    name: "Sifuentes Celi Lizzeth",
    age: "47",
    address: "Sullana",
    treatment: "Limpieza profunda",
    payments: [{ method: "plin", amount: 100 }],
  },
  {
    date: "2026-10-05",
    doctor: "judith",
    name: "Zegarra Ramírez Marco Augusto",
    age: "48",
    dni: "40152343",
    address: "Urb. Los Cocos del Chipe",
    treatment: "Cirugía de tercer molar",
    payments: [{ method: "plin", amount: 150 }],
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
    payments: [{ method: "plin", amount: 350 }],
  },
  {
    date: "2026-10-06",
    doctor: "judith",
    name: "Sandoval Urbina Junior Denilson",
    age: "21",
    dni: "76056487",
    phone: "906963824",
    address: "Calle Ch, AA.HH El Indio",
    treatment: "Striping y cadena inferior",
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
    payments: [
      { method: "efectivo", amount: 50 },
      { method: "plin", amount: 150 },
    ],
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
    payments: [{ method: "pos", amount: 100 }],
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
    payments: [{ method: "efectivo", amount: 150 }],
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
    payments: [{ method: "plin", amount: 80 }],
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
    payments: [{ method: "plin", amount: 140 }],
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
    payments: [
      { method: "efectivo", amount: 290 },
      { method: "pos", amount: 120, note: "Pago Lidice" },
    ],
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
    payments: [{ method: "plin", amount: 100 }],
    month: "Septiembre",
  },
  {
    date: "2026-10-09",
    doctor: "judith",
    name: "Ruiz Lequernaque Raitza",
    treatment: "Solo evaluación",
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
    payments: [{ method: "plin", amount: 20 }],
    ev: false,
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
    payments: [{ method: "plin", amount: 20 }],
    ev: true,
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
    payments: [
      { method: "efectivo", amount: 160 },
      { method: "plin", amount: 10 },
    ],
    ev: false,
    note: "Incluye saldo anterior de ortodoncia.",
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
    payments: [{ method: "yape", amount: 130 }],
    ev: true,
  },
  {
    date: "2026-10-09",
    doctor: "judith",
    name: "Cobeñas Yovera Felipa",
    age: "56",
    dni: "2808336",
    phone: "983212270",
    address: "AA.HH El Indio, Castilla",
    treatment: "Solo evaluación",
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
    payments: [{ method: "yape", amount: 110 }],
    ev: false,
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
    payments: [{ method: "efectivo", amount: 100 }],
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
    payments: [{ method: "yape", amount: 50 }],
    ev: false,
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
    payments: [{ method: "plin", amount: 100 }],
    ev: true,
  },
  {
    date: "2026-10-10",
    doctor: "judith",
    name: "Calle Yarlequé María Fernanda",
    age: "13",
    phone: "975636148",
    address: "Centro poblado Chapaira",
    treatment: "Consulta + apertura de endodoncia pz. 1.6",
    payments: [{ method: "efectivo", amount: 400 }],
  },
  {
    date: "2026-10-10",
    doctor: "judith",
    name: "Calle Yarlequé Briana Mercedes",
    age: "9",
    phone: "975636148",
    address: "Centro poblado Chapaira",
    treatment: "Consulta + limpieza dental",
    note: "Vino con su hermana María Fernanda. En el libro no quedó el monto.",
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
    payments: [{ method: "efectivo", amount: 100 }],
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
    payments: [{ method: "plin", amount: 150 }],
  },
  {
    date: "2026-10-06",
    doctor: "miguel",
    name: "Córdova Huamán Yanela Cristina",
    treatment: "Última sesión de endodoncia + restauración",
    payments: [{ method: "yape", amount: 90 }],
  },
  {
    date: "2026-10-09",
    doctor: "miguel",
    name: "García de Tineo Yolanda",
    treatment: "Solo evaluación",
  },
  {
    date: "2026-10-09",
    doctor: "miguel",
    name: "Ruiz Lequernaque Raitza",
    treatment: "Segunda sesión de endodoncia pz. 4.6",
    payments: [{ method: "yape", amount: 200 }],
    ev: false,
  },
  {
    date: "2026-10-09",
    doctor: "miguel",
    name: "López Pintado Etelvina",
    treatment: "Tercera sesión de endodoncia pz. 3.4",
    payments: [{ method: "plin", amount: 130 }],
    ev: true,
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
    payments: [{ method: "plin", amount: 100 }],
    ev: false,
  },
  {
    date: "2026-10-12",
    doctor: "judith",
    name: "Castillo Holguín Leticia",
    treatment: "Control de ortodoncia",
    time: "10:00",
    status: "confirmada",
    source: "agenda",
  },
  {
    date: "2026-10-12",
    doctor: "judith",
    name: "Flores Soluco Gerardo",
    treatment: "Cadena inferior y ajuste",
    time: "10:30",
    status: "recordatorio",
    source: "agenda",
  },
  {
    date: "2026-10-12",
    doctor: "judith",
    name: "Gonzales Díaz Wilton Erlin",
    treatment: "Ajuste de ortodoncia",
    time: "11:00",
    status: "agendada",
    source: "agenda",
  },
  {
    date: "2026-10-12",
    doctor: "judith",
    name: "Tineo Ollaguez Sendy",
    treatment: "Doble ajuste inferior",
    time: "11:30",
    status: "confirmada",
    source: "agenda",
  },
  {
    date: "2026-10-12",
    doctor: "judith",
    name: "Sandoval Urbina Junior Denilson",
    treatment: "Striping y cadena",
    time: "12:00",
    status: "agendada",
    source: "agenda",
  },
  {
    date: "2026-10-12",
    doctor: "judith",
    name: "Chunga Nizama Aldair",
    treatment: "Control de ortodoncia",
    time: "17:00",
    status: "recordatorio",
    source: "agenda",
  },
  {
    date: "2026-10-12",
    doctor: "miguel",
    name: "López Pintado Etelvina",
    treatment: "Cuarta sesión de endodoncia pz. 3.4",
    time: "10:00",
    status: "confirmada",
    source: "agenda",
  },
  {
    date: "2026-10-12",
    doctor: "miguel",
    name: "Pozo Yovera Tatiana Elizabeth",
    treatment: "Tercera sesión de endodoncia pz. 1.7",
    time: "11:00",
    status: "recordatorio",
    source: "agenda",
  },
  {
    date: "2026-10-12",
    doctor: "miguel",
    name: "Ruiz Lequernaque Raitza",
    treatment: "Tercera sesión de endodoncia pz. 4.6",
    time: "17:30",
    status: "agendada",
    source: "agenda",
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
    source: "whatsapp",
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
    source: "whatsapp",
  },
];

const DIRECTORY: Omit<Patient, "id">[] = [
  {
    fullName: "Puelles Cruz Vanessa",
    age: "26",
    dni: "75186927",
    phone: "962586317",
    address: "AA.HH La Victoria, Piura",
  },
  {
    fullName: "Córdova Livia Jesús",
    age: "56",
    dni: "2821076",
    phone: "924251202",
    address: "Pueblo Joven San Pedro",
  },
  { fullName: "Aguallo Castillo Lídice", age: "", dni: "", phone: "", address: "" },
  {
    fullName: "Palacios Zapata Mirna",
    age: "69",
    dni: "2779921",
    phone: "976081292",
    address: "Av. Junín 645, Piura",
  },
  { fullName: "Agurto Colmenares Johan", age: "", dni: "", phone: "", address: "" },
  { fullName: "Fossa Rojas Lidia", age: "", dni: "", phone: "", address: "" },
  { fullName: "Seminario Esquen Claudia Gabriela", age: "18", dni: "70640285", phone: "942002134", address: "AA.HH Los Ficus, Piura" },
  { fullName: "Arteaga Encalada Rafael", age: "", dni: "", phone: "", address: "" },
  { fullName: "Montero Rebata Darwin", age: "16", dni: "7259303", phone: "970410947", address: "AA.HH Túpac Amaru III" },
  { fullName: "Chiroque Correa Karen América", age: "", dni: "", phone: "", address: "" },
];

const DEBT_ROWS: { name: string; amount: number; concept: string; status: Debt["status"] }[] = [
  { name: "Agurto Colmenares Johan", amount: 40, concept: "Control", status: "pendiente" },
  { name: "Seminario Esquen Claudia Gabriela", amount: 100, concept: "Ortodoncia junio", status: "pendiente" },
  { name: "Arteaga Encalada Rafael", amount: 100, concept: "3 restauraciones", status: "pendiente" },
  { name: "Montero Rebata Darwin", amount: 100, concept: "Ortodoncia mayo", status: "pendiente" },
  { name: "Chiroque Correa Karen América", amount: 34, concept: "Pasta", status: "pendiente" },
  { name: "Yovera Sánchez Salvador Jesús", amount: 34, concept: "Pasta", status: "pendiente" },
];

function opFrom(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return String(((h >>> 0) % 900000) + 100000);
}

export type SmileData = {
  patients: Patient[];
  visits: Visit[];
  debts: Debt[];
  closes: Record<string, DayClose>;
};

export function createSeed(): SmileData {
  const patients = new Map<string, Patient>();
  const visits: Visit[] = [];
  let n = 0;
  let payN = 0;

  const touch = (row: { name: string; age?: string; dni?: string; phone?: string; address?: string }) => {
    const key = fold(row.name);
    const found = [...patients.values()].find((patient) => fold(patient.fullName) === key);
    if (found) {
      found.age = found.age || row.age || "";
      found.dni = found.dni || row.dni || "";
      found.phone = found.phone || row.phone || "";
      found.address = found.address || row.address || "";
      return found;
    }
    const patient: Patient = {
      id: slug(row.name),
      fullName: row.name,
      age: row.age ?? "",
      dni: row.dni ?? "",
      phone: row.phone ?? "",
      address: row.address ?? "",
    };
    patients.set(patient.id, patient);
    return patient;
  };

  for (const row of ROWS) {
    const patient = touch(row);
    n += 1;
    const id = `v-${String(n).padStart(3, "0")}`;
    const payments: Payment[] = (row.payments ?? []).map((payment) => {
      payN += 1;
      const digital = payment.method !== "efectivo";
      const hasEvidence = digital && (row.ev ?? row.date < "2026-10-09");
      return {
        id: `pay-${payN}`,
        method: payment.method,
        amount: payment.amount,
        note: payment.note ?? "",
        operation: hasEvidence ? opFrom(`${id}-${payment.method}-${payment.amount}`) : "",
        hasEvidence,
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
      noCharge: inferNoCharge(row.treatment, payments),
    });
  }

  for (const extra of DIRECTORY) {
    touch({
      name: extra.fullName,
      age: extra.age,
      dni: extra.dni,
      phone: extra.phone,
      address: extra.address,
    });
  }

  const debts: Debt[] = DEBT_ROWS.map((debt, index) => {
    const patient = touch({ name: debt.name });
    return {
      id: `debt-${index + 1}`,
      patientId: patient.id,
      amount: debt.amount,
      concept: debt.concept,
      status: debt.status,
    };
  });

  return {
    patients: [...patients.values()],
    visits,
    debts,
    closes: {},
  };
}
