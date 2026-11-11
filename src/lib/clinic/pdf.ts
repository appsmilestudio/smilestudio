import { jsPDF } from "jspdf";
import { domToPng } from "modern-screenshot";

const MARGIN = 8;
const PAGE_W = 210 - MARGIN * 2;
const PAGE_H = 297 - MARGIN * 2;

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("No se pudo leer la hoja."));
    img.src = src;
  });
}

async function waitForImages(root: HTMLElement) {
  const imgs = [...root.querySelectorAll("img")];
  await Promise.all(
    imgs.map(async (img) => {
      if (img.complete && img.naturalWidth > 0) return;
      try {
        await img.decode();
      } catch {
        await new Promise((resolve) => {
          img.addEventListener("load", resolve, { once: true });
          img.addEventListener("error", resolve, { once: true });
        });
      }
    }),
  );
  await document.fonts?.ready;
}

export async function saveSheetsPdf(root: HTMLElement, filename: string) {
  await waitForImages(root);
  const pages = [...root.querySelectorAll<HTMLElement>("[data-pdf-page]")];
  if (!pages.length) throw new Error("No hay hojas para el PDF.");

  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  let started = false;

  for (const page of pages) {
    const dataUrl = await domToPng(page, {
      scale: 2,
      backgroundColor: "#FFFDF8",
      width: page.scrollWidth,
      height: page.scrollHeight,
    });
    const img = await loadImage(dataUrl);
    const pxPerMm = img.width / PAGE_W;
    const slicePx = Math.max(1, Math.floor(PAGE_H * pxPerMm));
    let y = 0;
    while (y < img.height - 1) {
      const sliceH = Math.min(slicePx, img.height - y);
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = sliceH;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("No se pudo armar el PDF.");
      ctx.fillStyle = "#FFFDF8";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, y, img.width, sliceH, 0, 0, img.width, sliceH);
      if (started) pdf.addPage();
      started = true;
      pdf.addImage(canvas.toDataURL("image/jpeg", 0.86), "JPEG", MARGIN, MARGIN, PAGE_W, sliceH / pxPerMm);
      y += sliceH;
    }
  }

  pdf.save(filename);
}
