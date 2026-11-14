import { jsPDF } from "jspdf";
import { domToPng } from "modern-screenshot";

async function waitForImagesAndFonts(root: HTMLElement) {
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
  if (document.fonts) {
    await document.fonts.ready;
  }
}

/**
 * Guarda las hojas en formato PDF de alta resolución.
 * Cada elemento con [data-pdf-page] se calibra exactamente para ocupar 1 página A4 completa (210 x 297 mm)
 * sin cortes raros ni tablas partidas a la mitad.
 */
export async function saveSheetsPdf(
  pages: HTMLElement[],
  filename: string,
) {
  if (!pages.length) throw new Error("No hay hojas para generar el PDF.");

  // Esperar carga de imágenes y tipografías
  for (const page of pages) {
    await waitForImagesAndFonts(page);
  }

  const pdf = new jsPDF({
    unit: "mm",
    format: "a4",
    orientation: "portrait",
    compress: true,
  });

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];

    // Capturar a escala 2.5 para calidad de impresión 300 DPI nítida
    const dataUrl = await domToPng(page, {
      scale: 2.5,
      backgroundColor: "#ffffff",
      quality: 0.96,
    });

    if (i > 0) {
      pdf.addPage("a4", "portrait");
    }

    // Insertar exactamente en la página A4 (210mm x 297mm)
    pdf.addImage(dataUrl, "JPEG", 0, 0, 210, 297, undefined, "FAST");
  }

  pdf.save(filename);
}
