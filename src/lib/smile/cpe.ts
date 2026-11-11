export type CpeTipo = "03" | "01";
export type CpeDoc = "1" | "6" | "0";
export type CpeStatus = "local" | "anulado";

export type Emisor = {
  ruc: string;
  razonSocial: string;
  direccion: string;
  nextBoleta: number;
  nextFactura: number;
};

export type Comprobante = {
  id: string;
  visitId: string;
  paymentIds: string[];
  tipo: CpeTipo;
  serie: "BI01" | "FI01";
  numero: number;
  fechaEmision: string;
  receptorNombre: string;
  tipoDoc: CpeDoc;
  numDoc: string;
  descripcion: string;
  opGravada: number;
  igv: number;
  total: number;
  status: CpeStatus;
  leyenda: "COMPROBANTE INTERNO — NO ENVIADO A SUNAT";
};

export const LEYENDA = "COMPROBANTE INTERNO — NO ENVIADO A SUNAT" as const;

export function defaultEmisor(): Emisor {
  return {
    ruc: "",
    razonSocial: "Smile Studio",
    direccion: "Piura",
    nextBoleta: 1,
    nextFactura: 1,
  };
}

export function splitIgv(total: number) {
  const cents = Math.round(total * 100);
  const base = Math.round(cents / 1.18);
  const igv = cents - base;
  return { opGravada: base / 100, igv: igv / 100, total: cents / 100 };
}

export function cpeNumber(value: number) {
  return String(value).padStart(8, "0");
}

export function money(value: number) {
  return value.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function activeForPayments(comprobantes: Comprobante[], paymentIds: string[]) {
  const taken = new Set(
    comprobantes.filter((item) => item.status !== "anulado").flatMap((item) => item.paymentIds),
  );
  return paymentIds.filter((id) => taken.has(id));
}

export function receiptHtml(item: Comprobante, emisor: Emisor) {
  const kind = item.tipo === "01" ? "FACTURA" : "BOLETA DE VENTA";
  const doc =
    item.tipoDoc === "6" ? `RUC ${item.numDoc}` : item.tipoDoc === "1" ? `DNI ${item.numDoc}` : "Sin documento";
  const ruc = emisor.ruc.trim() || "RUC pendiente";
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${item.serie}-${cpeNumber(item.numero)}</title>
<style>
  body{font-family:Georgia,serif;color:#1c1915;margin:24px;max-width:420px}
  h1{font-size:22px;margin:0} p{margin:4px 0} .muted{color:#5c564c;font-size:13px}
  .banner{margin:16px 0;padding:8px;border:1px solid #8a6a2f;font-size:12px;letter-spacing:.04em}
  table{width:100%;border-collapse:collapse;margin-top:12px} td{padding:4px 0;font-size:14px}
  .right{text-align:right} .void{color:#9b2c2c;font-weight:700}
</style></head><body>
<p class="muted">${emisor.razonSocial || "Smile Studio"}</p>
<h1>${kind}</h1>
<p>${item.serie}-${cpeNumber(item.numero)}</p>
<p class="muted">${ruc} · ${emisor.direccion || "Piura"}</p>
<p class="banner">${item.leyenda}</p>
<p>${item.fechaEmision}</p>
<p>${item.receptorNombre}</p>
<p class="muted">${doc}</p>
<table>
<tr><td>${item.descripcion}</td><td class="right">S/ ${money(item.total)}</td></tr>
<tr><td>Op. gravada</td><td class="right">S/ ${money(item.opGravada)}</td></tr>
<tr><td>IGV 18%</td><td class="right">S/ ${money(item.igv)}</td></tr>
<tr><td><strong>Total</strong></td><td class="right"><strong>S/ ${money(item.total)}</strong></td></tr>
</table>
${item.status === "anulado" ? '<p class="void">ANULADO</p>' : ""}
<p class="muted">El monto ya incluye IGV. No es un comprobante de SUNAT ni tiene validez tributaria.</p>
</body></html>`;
}

export function openReceipt(item: Comprobante, emisor: Emisor) {
  const blob = new Blob([receiptHtml(item, emisor)], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const opened = window.open(url, "_blank", "noopener");
  if (!opened) {
    const link = document.createElement("a");
    link.href = url;
    link.download = `${item.serie}-${cpeNumber(item.numero)}.html`;
    link.click();
  }
}
