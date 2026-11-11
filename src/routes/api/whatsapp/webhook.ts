import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/whatsapp/webhook")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const mode = url.searchParams.get("hub.mode");
        const token = url.searchParams.get("hub.verify_token");
        const challenge = url.searchParams.get("hub.challenge");
        const { verifyWebhook } = await import("@/lib/smile/inbox.server");
        if (mode === "subscribe" && challenge && verifyWebhook(token)) {
          return new Response(challenge, { status: 200 });
        }
        return new Response("forbidden", { status: 403 });
      },
      POST: async ({ request }) => {
        const raw = await request.text();
        const { ingestWebhook } = await import("@/lib/smile/inbox.server");
        const result = ingestWebhook(raw, request.headers.get("x-hub-signature-256"));
        if (!result.ok) return new Response("invalid signature", { status: 401 });
        return new Response("ok", { status: 200 });
      },
    },
  },
});
