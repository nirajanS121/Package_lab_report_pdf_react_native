import { PDFDocument, PDFFont, PDFPage, rgb } from "pdf-lib";
import { fetchImage } from "./fetchImage";
import { encodeCode128 } from "./barcode";
import { buildQrMatrix } from "./qrMatrix";
import { wrapPlainText } from "./textLayout";

export interface PdfFonts {
  regular: PDFFont;
  bold: PDFFont;
  italic: PDFFont;
  boldItalic: PDFFont;
}

export function resolveFont(
  fonts: PdfFonts,
  bold?: boolean,
  italic?: boolean,
): PDFFont {
  if (bold && italic) return fonts.boldItalic;
  if (bold) return fonts.bold;
  if (italic) return fonts.italic;
  return fonts.regular;
}

export interface PdfContext {
  pdfDoc: PDFDocument;
  fonts: PdfFonts;
  imageCache: Map<string, Awaited<ReturnType<PDFDocument["embedPng"]>> | null>;
}

export function createPdfContext(
  pdfDoc: PDFDocument,
  fonts: PdfFonts,
): PdfContext {
  return { pdfDoc, fonts, imageCache: new Map() };
}

export function topToPdfY(pageHeight: number, templateY: number): number {
  return pageHeight - templateY;
}

export async function embedImageBytes(ctx: PdfContext, url: string) {
  if (ctx.imageCache.has(url)) return ctx.imageCache.get(url)!;

  const fetched = await fetchImage(url);
  let embedded = null;
  if (fetched) {
    try {
      embedded =
        fetched.format === "png"
          ? await ctx.pdfDoc.embedPng(fetched.bytes)
          : await ctx.pdfDoc.embedJpg(fetched.bytes);
    } catch {
      embedded = null;
    }
  }
  ctx.imageCache.set(url, embedded);
  return embedded;
}

function clipToWidth(
  text: string,
  font: PDFFont,
  fontSize: number,
  maxWidth: number,
): string {
  if (font.widthOfTextAtSize(text, fontSize) <= maxWidth) return text;
  let lo = 0;
  let hi = text.length;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (font.widthOfTextAtSize(text.slice(0, mid), fontSize) <= maxWidth) {
      lo = mid;
    } else {
      hi = mid - 1;
    }
  }
  return text.slice(0, lo);
}

function alignedX(
  x: number,
  width: number,
  textWidth: number,
  alignment?: string,
): number {
  if (alignment === "center") return x + (width - textWidth) / 2;
  if (alignment === "right") return x + width - textWidth;
  return x;
}

function applyCaps(value: string, isCapsLocks?: boolean): string {
  return isCapsLocks ? value.toUpperCase() : value;
}

export async function drawCaptionBlock(
  page: PDFPage,
  ctx: PdfContext,
  pageHeight: number,
  block: any,
) {
  if (
    block.hideKey &&
    block.hideValue &&
    block[block.hideKey] === block.hideValue
  )
    return;
  const value = applyCaps(String(block.value ?? ""), block.isCapsLocks);
  const font = resolveFont(ctx.fonts, block.isBold, block.isItalics);
  const fontSize = block.fontSize || 12;
  const lines = wrapPlainText(value, font, fontSize, 10000);
  let y = topToPdfY(pageHeight, block.y) - fontSize;
  for (const line of lines) {
    page.drawText(line, {
      x: block.x,
      y,
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
    });
    y -= fontSize * 1.2;
  }
}

export async function drawValueBlock(
  page: PDFPage,
  ctx: PdfContext,
  pageHeight: number,
  block: any,
) {
  if (
    block.hideKey &&
    block.hideValue &&
    block[block.hideKey] === block.hideValue
  )
    return;
  const rawValue =
    block.value === undefined || block.value === null
      ? ""
      : String(block.value);
  const width = block.width || 100;
  const isAutoResize = block.frontendConditionValue === "auto_resize_text";
  let fontSize = block.fontSize || 12;

  if (isAutoResize) {
    if (rawValue.length > 160) fontSize -= 3;
    else if (rawValue.length > 130) fontSize -= 2;
    else if (rawValue.length > 100) fontSize -= 1;
  }

  const font = resolveFont(ctx.fonts, block.isBold, block.isItalics);
  const value = applyCaps(rawValue, block.isCapsLocks);
  const topY = topToPdfY(pageHeight, block.y);

  if (isAutoResize) {
    const maxRows = block.frontendNumberOfRow;
    const lineHeight = fontSize * 1.2;
    let lines = wrapPlainText(value, font, fontSize, width);
    if (maxRows && lines.length > maxRows) lines = lines.slice(0, maxRows);
    let y = topY - fontSize;
    for (const line of lines) {
      const lineWidth = font.widthOfTextAtSize(line, fontSize);
      page.drawText(line, {
        x: alignedX(block.x, width, lineWidth, block.alignment),
        y,
        size: fontSize,
        font,
      });
      y -= lineHeight;
    }
  } else {
    const clipped = clipToWidth(value, font, fontSize, width);
    const textWidth = font.widthOfTextAtSize(clipped, fontSize);
    page.drawText(clipped, {
      x: alignedX(block.x, width, textWidth, block.alignment),
      y: topY - fontSize,
      size: fontSize,
      font,
    });
  }

  const border = block.border;
  if (border && (border.left || border.right || border.top || border.bottom)) {
    const lineWidth = border.width || 1;
    const top = topY;
    const bottom = topY - fontSize * 1.3;
    if (border.top)
      page.drawLine({
        start: { x: block.x, y: top },
        end: { x: block.x + width, y: top },
        thickness: lineWidth,
      });
    if (border.bottom)
      page.drawLine({
        start: { x: block.x, y: bottom },
        end: { x: block.x + width, y: bottom },
        thickness: lineWidth,
      });
    if (border.left)
      page.drawLine({
        start: { x: block.x, y: top },
        end: { x: block.x, y: bottom },
        thickness: lineWidth,
      });
    if (border.right)
      page.drawLine({
        start: { x: block.x + width, y: top },
        end: { x: block.x + width, y: bottom },
        thickness: lineWidth,
      });
  }
}

export async function drawImageBlock(
  page: PDFPage,
  ctx: PdfContext,
  pageHeight: number,
  block: any,
) {
  const url = block.logoImage?.name ?? block.url;
  const width = block.width || 0;
  const height = block.height || 0;
  const topY = topToPdfY(pageHeight, block.y);

  if (url) {
    const embedded = await embedImageBytes(ctx, url);
    if (embedded) {
      page.drawImage(embedded, { x: block.x, y: topY - height, width, height });
      return;
    }
  }
  if (block.label) {
    const font = ctx.fonts.regular;
    const fontSize = height * 0.25 || 10;
    const textWidth = font.widthOfTextAtSize(block.label, fontSize);
    page.drawText(block.label, {
      x: block.x + (width - textWidth) / 2,
      y: topY - height / 2,
      size: fontSize,
      font,
    });
  }
}

export function drawLineBlock(page: PDFPage, pageHeight: number, block: any) {
  if (block.isVisible === false) return;
  const isHorizontal = (block.orientation ?? "horizontal") === "horizontal";
  const color = block.color ? hexToRgb(block.color) : rgb(0, 0, 0);
  const topY = topToPdfY(pageHeight, block.y);
  const thickness = block.height || 1;
  const dashArray =
    block.borderStyle === "dashed" || block.borderStyle === "dotted"
      ? [thickness * 2, thickness * 2]
      : undefined;

  if (isHorizontal) {
    page.drawLine({
      start: { x: block.x, y: topY },
      end: { x: block.x + block.width, y: topY },
      thickness,
      color,
      dashArray,
    });
  } else {
    page.drawLine({
      start: { x: block.x, y: topY },
      end: { x: block.x, y: topY - block.width },
      thickness,
      color,
      dashArray,
    });
  }
}

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return rgb(0, 0, 0);
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  return rgb(r, g, b);
}

export async function drawBarcodeBlock(
  page: PDFPage,
  pageHeight: number,
  block: any,
) {
  const value = block.value ? String(block.value) : "";
  if (!value) return;
  const pattern = encodeCode128(value);
  if (!pattern) return;

  const unitWidth = 1.6;
  const height = (block.fontSize || 12) * 2;
  const topY = topToPdfY(pageHeight, block.y);
  let x = block.x;
  for (const char of pattern) {
    if (char === "1") {
      page.drawRectangle({
        x,
        y: topY - height,
        width: unitWidth,
        height,
        color: rgb(0, 0, 0),
      });
    }
    x += unitWidth;
  }
}

export async function drawQrcodeBlock(
  page: PDFPage,
  pageHeight: number,
  block: any,
) {
  const value = block.value ? String(block.value) : "";
  if (!value) return;
  const matrix = buildQrMatrix(value);
  if (!matrix) return;

  const boxSize = block.fontSize || 58;
  const moduleSize = boxSize / matrix.size;
  const topY = topToPdfY(pageHeight, block.y);
  for (let row = 0; row < matrix.size; row++) {
    for (let col = 0; col < matrix.size; col++) {
      if (matrix.isDark(row, col)) {
        page.drawRectangle({
          x: block.x + col * moduleSize,
          y: topY - boxSize + (matrix.size - 1 - row) * moduleSize,
          width: moduleSize,
          height: moduleSize,
          color: rgb(0, 0, 0),
        });
      }
    }
  }
}

export async function drawSignatureBlock(
  page: PDFPage,
  ctx: PdfContext,
  pageHeight: number,
  block: any,
) {
  const maxWidth = block.maxWidth || 100;
  const maxHeight = block.maxHeight || 50;
  const centerX = block.x + maxWidth / 2;
  const topY = topToPdfY(pageHeight, block.y);
  let cursorY = topY;

  const hasImage = !!block.imageUrl && !block.hide_signature;
  if (hasImage) {
    const embedded = await embedImageBytes(ctx, block.imageUrl);
    if (embedded) {
      const scale = Math.min(
        maxWidth / embedded.width,
        maxHeight / embedded.height,
        1,
      );
      const w = embedded.width * scale;
      const h = embedded.height * scale;
      page.drawImage(embedded, {
        x: centerX - w / 2,
        y: cursorY - h,
        width: w,
        height: h,
      });
      cursorY -= maxHeight;
    } else {
      cursorY -= maxHeight;
    }
  } else if (block.label) {
    const font = ctx.fonts.regular;
    const fontSize = 10;
    const textWidth = font.widthOfTextAtSize(block.label, fontSize);
    page.drawText(block.label, {
      x: centerX - textWidth / 2,
      y: cursorY - maxHeight / 2,
      size: fontSize,
      font,
    });
    cursorY -= maxHeight;
  } else {
    cursorY -= maxHeight;
  }

  const lineFontSize = 11;
  const textLines: string[] = [
    block.caption,
    block.name,
    block.qualification,
    block.specialization,
    block.designation,
    block.nmc ? `NMC No. ${block.nmc}` : undefined,
    block.nhpc_no ? `NHPC No. ${block.nhpc_no}` : undefined,
  ].filter(Boolean);

  cursorY -= 3;
  for (const line of textLines) {
    const textWidth = ctx.fonts.bold.widthOfTextAtSize(line, lineFontSize);
    page.drawText(line, {
      x: centerX - textWidth / 2,
      y: cursorY - lineFontSize,
      size: lineFontSize,
      font: ctx.fonts.bold,
    });
    cursorY -= lineFontSize * 1.3;
  }
}

export async function drawBasicBlock(
  page: PDFPage,
  ctx: PdfContext,
  pageHeight: number,
  block: any,
) {
  if (block.isVisible === false) return;
  switch (block.type) {
    case "caption":
      return drawCaptionBlock(page, ctx, pageHeight, block);
    case "value":
      return drawValueBlock(page, ctx, pageHeight, block);
    case "image":
      return drawImageBlock(page, ctx, pageHeight, block);
    case "line":
      return drawLineBlock(page, pageHeight, block);
    case "barcode":
      return drawBarcodeBlock(page, pageHeight, block);
    case "qrcode":
      return drawQrcodeBlock(page, pageHeight, block);
    case "signature":
      return drawSignatureBlock(page, ctx, pageHeight, block);
    default:
      return;
  }
}

function blockImageUrl(block: any): string | undefined {
  if (block.isVisible === false) return undefined;
  if (block.type === "image") return block.logoImage?.name ?? block.url;
  if (block.type === "signature" && !block.hide_signature)
    return block.imageUrl;
  return undefined;
}

export async function warmBlockImageCache(ctx: PdfContext, blocks: any[]) {
  const urls = new Set<string>();
  for (const block of blocks) {
    const url = blockImageUrl(block);
    if (url) urls.add(url);
  }
  await Promise.all(Array.from(urls, (url) => embedImageBytes(ctx, url)));
}
