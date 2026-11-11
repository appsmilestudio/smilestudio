import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { env } from "@/lib/env.server";

export const WHATSAPP_TEST_TO = "51928544342";
export const WHATSAPP_TEST_DISPLAY = "928 544 342";

const GRAPH = "https://graph.facebook.com/v23.0";
const TEMPLATE = "cita_smile_studio";
const secretPath = join(process.cwd(), ".data", "whatsapp.json");

export type CitaWhatsAppInput = {
  patientName: string;
  phone: string;
  dateLabel: string;
  timeLabel: string;
  doctorLabel: string;
};

export type CitaWhatsAppResult = {
  ok: boolean;
  message: string;
  test: boolean;
};

function readJson(): Record<string, unknown> {
  try {
    if (!existsSync(secretPath)) return {};
    const parsed = JSON.parse(readFileSync(secretPath, "utf8")) as Record<string, unknown>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function storedSecrets(): { phoneNumberId: string; token: string } | null {
  const parsed = readJson();
  if (typeof parsed.phoneNumberId !== "string" || typeof parsed.token !== "string") return null;
  if (!parsed.phoneNumberId || !parsed.token) return null;
  return { phoneNumberId: parsed.phoneNumberId, token: parsed.token };
}

function cleanParam(value: string, fallback: string) {
  const text = value.replace(/[\n\r\t]+/g, " ").replace(/ {2,}/g, " ").trim();
  return (text || fallback).slice(0, 120);
}

function digits(phone: string) {
  const only = phone.replace(/\D/g, "");
  if (only.length === 9) return `51${only}`;
  return only;
}

export function whatsappConfig() {
  const file = storedSecrets();
  const token = env("WHATSAPP_TOKEN") || file?.token;
  const phoneNumberId = env("WHATSAPP_PHONE_NUMBER_ID") || file?.phoneNumberId;
  const live = env("WHATSAPP_LIVE") === "1";
  return {
    configured: Boolean(token && phoneNumberId),
    live,
    display: live ? "" : WHATSAPP_TEST_DISPLAY,
    token,
    phoneNumberId,
  };
}

export function saveWhatsAppSecrets(phoneNumberId: string, token: string): { ok: boolean; message: string } {
  const id = phoneNumberId.replace(/\D/g, "");
  const clean = token.trim();
  if (id.length < 8) return { ok: false, message: "El Phone number ID es un número largo de Meta, no el celular." };
  if (clean.length < 20) return { ok: false, message: "El token está incompleto." };
  const current = readJson();
  mkdirSync(dirname(secretPath), { recursive: true });
  writeFileSync(
    secretPath,
    JSON.stringify({ ...current, phoneNumberId: id, token: clean }),
    { mode: 0o600 },
  );
  return {
    ok: true,
    message: `WhatsApp quedó conectado. En prueba, los avisos llegan solo al ${WHATSAPP_TEST_DISPLAY}.`,
  };
}

export function clearWhatsAppSecrets() {
  try {
    unlinkSync(secretPath);
  } catch {
    // already gone
  }
}

async function postMessage(phoneNumberId: string, token: string, body: unknown) {
  const response = await fetch(`${GRAPH}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const payload = (await response.json().catch(() => null)) as {
    error?: { message?: string; code?: number; error_user_msg?: string };
  } | null;
  return { ok: response.ok, payload };
}

function metaMessage(payload: { error?: { message?: string; code?: number; error_user_msg?: string } } | null) {
  const code = payload?.error?.code;
  const detail = payload?.error?.error_user_msg || payload?.error?.message || "Meta no aceptó el mensaje.";
  if (code === 190) return "El token de WhatsApp no es válido o ya venció.";
  if (code === 132001 || code === 132000) {
    return "La plantilla cita_smile_studio todavía no está aprobada en español.";
  }
  if (code === 131026) return "Ese celular no está en la lista de prueba de Meta.";
  if (code === 131047) return "Fuera de las 24 horas solo sale la plantilla aprobada.";
  if (code === 133010) return "El número de la API no está registrado en WhatsApp.";
  return detail;
}

export async function sendCita(input: CitaWhatsAppInput): Promise<CitaWhatsAppResult> {
  const config = whatsappConfig();
  if (!config.token || !config.phoneNumberId) {
    return {
      ok: false,
      test: !config.live,
      message: "WhatsApp todavía no está conectado. El aviso no salió y la cita sigue sin confirmar.",
    };
  }

  const to = config.live ? digits(input.phone) : WHATSAPP_TEST_TO;
  if (!to) {
    return { ok: false, test: config.live, message: "Este paciente no tiene celular." };
  }

  const name = cleanParam(input.patientName, "paciente");
  const day = cleanParam(input.dateLabel, "la fecha acordada");
  const time = cleanParam(input.timeLabel, "la hora acordada");
  const doctor = cleanParam(input.doctorLabel, "el consultorio");

  const template = await postMessage(config.phoneNumberId, config.token, {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: TEMPLATE,
      language: { code: "es" },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: name },
            { type: "text", text: day },
            { type: "text", text: time },
            { type: "text", text: doctor },
          ],
        },
      ],
    },
  });

  if (template.ok) {
    return {
      ok: true,
      test: !config.live,
      message: config.live
        ? `Aviso enviado al ${to}.`
        : `Enviado al número de prueba ${WHATSAPP_TEST_DISPLAY}. ${name} todavía no lo recibe en su celular.`,
    };
  }

  const code = template.payload?.error?.code;
  const templateMissing = code === 132001 || code === 132000;
  if (templateMissing) {
    const text = await postMessage(config.phoneNumberId, config.token, {
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: {
        body: `Hola ${name}, te escribimos de Smile Studio. Tu cita es el ${day} a las ${time} con ${doctor}. Responde CONFIRMO o OTRA HORA.`,
      },
    });
    if (text.ok) {
      return {
        ok: true,
        test: !config.live,
        message: config.live
          ? `Aviso enviado al ${to}.`
          : `Enviado al número de prueba ${WHATSAPP_TEST_DISPLAY} (texto, sin plantilla). ${name} todavía no lo recibe.`,
      };
    }
    return { ok: false, test: !config.live, message: metaMessage(text.payload) };
  }

  return { ok: false, test: !config.live, message: metaMessage(template.payload) };
}

export async function sendTest(): Promise<CitaWhatsAppResult> {
  const config = whatsappConfig();
  if (!config.token || !config.phoneNumberId) {
    return { ok: false, test: true, message: "Primero guarda el Phone number ID y el token." };
  }
  const text = await postMessage(config.phoneNumberId, config.token, {
    messaging_product: "whatsapp",
    to: WHATSAPP_TEST_TO,
    type: "text",
    text: { body: "Smile Studio: la conexión con Meta está lista. Este mensaje es solo de prueba." },
  });
  if (text.ok) {
    return { ok: true, test: true, message: `Llegó al ${WHATSAPP_TEST_DISPLAY}. Revisa ese WhatsApp.` };
  }
  if (text.payload?.error?.code === 131047) {
    return sendCita({
      patientName: "Smile Studio",
      phone: WHATSAPP_TEST_TO,
      dateLabel: "hoy",
      timeLabel: "ahora",
      doctorLabel: "recepción",
    });
  }
  return { ok: false, test: true, message: metaMessage(text.payload) };
}
