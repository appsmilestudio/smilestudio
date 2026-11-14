import { createServerFn } from "@tanstack/react-start";

export type CitaWhatsAppInput = {
  patientName: string;
  phone: string;
  dateLabel: string;
  timeLabel: string;
  doctorLabel: string;
};

export const sendCitaWhatsApp = createServerFn({ method: "POST" })
  .validator((data: CitaWhatsAppInput) => data)
  .handler(async ({ data }) => {
    const { sendCita } = await import("./whatsapp.server");
    return sendCita(data);
  });

export const whatsappStatus = createServerFn({ method: "POST" }).handler(async () => {
  const { whatsappConfig } = await import("./whatsapp.server");
  const config = whatsappConfig();
  return { configured: config.configured, live: config.live, display: config.display };
});

export const saveWhatsAppConnection = createServerFn({ method: "POST" })
  .validator((data: { phoneNumberId: string; token: string }) => data)
  .handler(async ({ data }) => {
    const { saveWhatsAppSecrets } = await import("./whatsapp.server");
    return saveWhatsAppSecrets(data.phoneNumberId, data.token);
  });

export const clearWhatsAppConnection = createServerFn({ method: "POST" }).handler(async () => {
  const { clearWhatsAppSecrets } = await import("./whatsapp.server");
  clearWhatsAppSecrets();
  return { ok: true as const };
});

export const testWhatsAppConnection = createServerFn({ method: "POST" }).handler(async () => {
  const { sendTest } = await import("./whatsapp.server");
  return sendTest();
});

export const listWhatsAppInbox = createServerFn({ method: "POST" }).handler(async () => {
  const { listInbox } = await import("./inbox.server");
  return { items: listInbox() };
});

export const ackWhatsAppInbox = createServerFn({ method: "POST" })
  .validator((data: { ids: string[] }) => data)
  .handler(async ({ data }) => {
    const { ackInbox } = await import("./inbox.server");
    ackInbox(data.ids);
    return { ok: true as const };
  });

export const whatsappWebhookInfo = createServerFn({ method: "POST" }).handler(async () => {
  const { webhookVerifyToken } = await import("./inbox.server");
  return { verifyToken: webhookVerifyToken(), path: "/api/whatsapp/webhook" };
});

