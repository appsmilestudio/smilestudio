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
 * Guarda las hojas en formato PDF de alta resolución (300 DPI).
 * Detecta automáticamente si la hoja es de orientación horizontal (Landscape: 297 x 210 mm)
 * o vertical (Portrait: 210 x 297 mm) para que el díptico y las fichas calcen al milímetro
 * sin cortes ni tablas partidas.
 */
export async function saveSheetsPdf(
  pages: HTMLElement[],
  filename: string,
) {
  if (!pages.length) throw new Error("No hay hojas para generar el PDF.");

  // Esperar carga completa de imágenes y fuentes tipográficas
  for (const page of pages) {
    await waitForImagesAndFonts(page);
  }

  // Detectar orientación de la primera página
  const firstIsLandscape =
    pages[0]?.getAttribute("data-orientation") === "landscape" ||
    (pages[0] && pages[0].scrollWidth > pages[0].scrollHeight);

  const pdf = new jsPDF({
    unit: "mm",
    format: "a4",
    orientation: firstIsLandscape ? "landscape" : "portrait",
    compress: true,
  });

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const isLandscape =
      page.getAttribute("data-orientation") === "landscape" ||
      page.scrollWidth > page.scrollHeight;

    // Captura a escala 2.5 para calidad de imprenta 300 DPI
    const dataUrl = await domToPng(page, {
      scale: 2.5,
      backgroundColor: "#ffffff",
      quality: 0.96,
    });

    if (i > 0) {
      pdf.addPage("a4", isLandscape ? "landscape" : "portrait");
    }

    if (isLandscape) {
      // Página A4 horizontal: 297 x 210 mm
      pdf.addImage(dataUrl, "JPEG", 0, 0, 297, 210, undefined, "FAST");
    } else {
      // Página A4 vertical: 210 x 297 mm
      pdf.addImage(dataUrl, "JPEG", 0, 0, 210, 297, undefined, "FAST");
    }
  }

  pdf.save(filename);
}
