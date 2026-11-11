import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { parseBooking, type WhatsAppLead } from "./intake";
import { env } from "@/lib/env.server";

const secretPath = join(process.cwd(), ".data", "whatsapp.json");
const inboxPath = join(process.cwd(), ".data", "whatsapp-inbox.json");

type SecretFile = {
  phoneNumberId?: string;
  token?: string;
  verifyToken?: string;
  appSecret?: string;
};

function readSecrets(): SecretFile {
  try {
    if (!existsSync(secretPath)) return {};
    return JSON.parse(readFileSync(secretPath, "utf8")) as SecretFile;
  } catch {
    return {};
  }
}

function writeSecrets(next: SecretFile) {
  mkdirSync(dirname(secretPath), { recursive: true });
  writeFileSync(secretPath, JSON.stringify(next), { mode: 0o600 });
}

export function webhookVerifyToken() {
  const current = readSecrets();
  if (current.verifyToken) return current.verifyToken;
  const verifyToken = randomBytes(12).toString("hex");
  writeSecrets({ ...current, verifyToken });
  return verifyToken;
}

export function verifyWebhook(token: string | null) {
  const expected = webhookVerifyToken();
  if (!token || token.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}

function readInbox(): WhatsAppLead[] {
  try {
    if (!existsSync(inboxPath)) return [];
    const parsed = JSON.parse(readFileSync(inboxPath, "utf8")) as WhatsAppLead[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeInbox(items: WhatsAppLead[]) {
  mkdirSync(dirname(inboxPath), { recursive: true });
  writeFileSync(inboxPath, JSON.stringify(items), { mode: 0o600 });
}

export function listInbox() {
  return readInbox();
}

export function ackInbox(ids: string[]) {
  const drop = new Set(ids);
  writeInbox(readInbox().filter((item) => !drop.has(item.id)));
}

function remember(lead: WhatsAppLead) {
  const items = readInbox();
  if (items.some((item) => item.id === lead.id)) return false;
  items.push(lead);
  writeInbox(items.slice(-100));
  return true;
}

type MetaMessage = {
  id?: string;
  from?: string;
  type?: string;
  text?: { body?: string };
  button?: { text?: string };
  interactive?: { button_reply?: { title?: string } };
};

type MetaChange = {
  value?: {
    messages?: MetaMessage[];
    contacts?: { wa_id?: string; profile?: { name?: string } }[];
  };
};

function signatureOk(raw: string, header: string | null) {
  const secret = env("WHATSAPP_APP_SECRET") || readSecrets().appSecret;
  if (!secret) return true;
  if (!header?.startsWith("sha256=")) return false;
  const expected = createHmac("sha256", secret).update(raw).digest("hex");
  const given = header.slice("sha256=".length);
  if (given.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(given), Buffer.from(expected));
}

export function ingestWebhook(raw: string, signature: string | null) {
  if (!signatureOk(raw, signature)) return { ok: false as const, added: 0 };
  let body: { entry?: { changes?: MetaChange[] }[] } | null = null;
  try {
    body = JSON.parse(raw) as { entry?: { changes?: MetaChange[] }[] };
  } catch {
    return { ok: true as const, added: 0 };
  }
  let added = 0;
  for (const entry of body?.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const contacts = change.value?.contacts ?? [];
      for (const message of change.value?.messages ?? []) {
        const text =
          message.text?.body ||
          message.button?.text ||
          message.interactive?.button_reply?.title ||
          "";
        if (!text.trim() || !message.id) continue;
        const contact = contacts.find((item) => item.wa_id === message.from);
        const lead = parseBooking(text, {
          id: message.id,
          phone: message.from ?? "",
          profileName: contact?.profile?.name ?? "",
        });
        if (remember(lead)) added += 1;
      }
    }
  }
  return { ok: true as const, added };
}

export function ingestManual(text: string, phone: string, profileName: string) {
  const lead = parseBooking(text, { phone, profileName });
  remember(lead);
  return lead;
}
