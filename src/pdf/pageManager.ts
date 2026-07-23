import { PDFDocument, PDFPage, rgb } from "pdf-lib";
import {
  PdfContext,
  drawBasicBlock,
  embedImageBytes,
  topToPdfY,
  warmBlockImageCache,
} from "./blocks";

interface HeaderFooterConfig {
  config: any;
  headerImage?: any;
  footerImage?: any;
  watermark?: any;
  headerBlocks: any[];
  footerBlocks: any[];
  hideHeader?: boolean;
  hideFooter?: boolean;
}

export class PageManager {
  pdfDoc: PDFDocument;
  ctx: PdfContext;
  pageWidth: number;
  pageHeight: number;
  contentTop: number;
  contentBottom: number;
  page!: PDFPage;
  cursorY = 0;
  private hf: HeaderFooterConfig;

  constructor(pdfDoc: PDFDocument, ctx: PdfContext, hf: HeaderFooterConfig) {
    this.pdfDoc = pdfDoc;
    this.ctx = ctx;
    this.hf = hf;
    this.pageWidth = hf.config?.width || 595;
    this.pageHeight = hf.config?.height || 842;

    const header = hf.config?.header;
    const footer = hf.config?.footer;
    const headerHeight = header?.isEnabled ? header.height : 0;
    const footerHeight = footer?.isEnabled ? footer.height : 0;
    this.contentTop = headerHeight;
    this.contentBottom = this.pageHeight - footerHeight;
  }

  async start() {
    await this.newPage();
  }

  async newPage() {
    this.page = this.pdfDoc.addPage([this.pageWidth, this.pageHeight]);
    this.cursorY = this.contentTop;
    await this.drawHeaderFooterWatermark();
  }

  async ensureSpace(neededHeight: number) {
    if (this.cursorY + neededHeight > this.contentBottom) {
      await this.newPage();
    }
  }

  private async drawHeaderFooterWatermark() {
    const {
      config,
      headerImage,
      footerImage,
      watermark,
      headerBlocks,
      footerBlocks,
      hideHeader,
      hideFooter,
    } = this.hf;
    const printPreference = config?.printPreference ?? {};

    const wantsHeader =
      !hideHeader && printPreference.printWithImage && !!headerImage?.name;
    const wantsFooter =
      !hideFooter && printPreference.printWithImage && !!footerImage?.name;
    const wantsWatermark =
      !!watermark?.name &&
      printPreference.printWithImage &&
      typeof watermark.width === "number";
    const drawnHeaderBlocks = hideHeader ? [] : headerBlocks;
    const drawnFooterBlocks = hideFooter ? [] : footerBlocks;

    const [headerEmbedded, footerEmbedded, watermarkEmbedded] =
      await Promise.all([
        wantsHeader ? embedImageBytes(this.ctx, headerImage.name) : null,
        wantsFooter ? embedImageBytes(this.ctx, footerImage.name) : null,
        wantsWatermark ? embedImageBytes(this.ctx, watermark.name) : null,
        warmBlockImageCache(this.ctx, [...drawnHeaderBlocks, ...drawnFooterBlocks]),
      ]);

    if (wantsHeader && headerEmbedded) {
      const height =
        (this.pageWidth / headerImage.width) * headerImage.height;
      this.page.drawImage(headerEmbedded, {
        x: 0,
        y: this.pageHeight - height,
        width: this.pageWidth,
        height,
      });
    }
    if (wantsFooter && footerEmbedded) {
      const height =
        (this.pageWidth / footerImage.width) * footerImage.height;
      this.page.drawImage(footerEmbedded, {
        x: 0,
        y: 0,
        width: this.pageWidth,
        height,
      });
    }
    if (wantsWatermark && watermarkEmbedded) {
      const paperMin = Math.min(this.pageWidth, this.pageHeight);
      const watermarkWidth = paperMin * 0.9;
      const watermarkHeight =
        (watermarkWidth / watermark.width) * watermark.height;
      const opacity = (config?.watermark?.opacity ?? 0) / 100;
      this.page.drawImage(watermarkEmbedded, {
        x: (this.pageWidth - watermarkWidth) / 2,
        y: (this.pageHeight - watermarkHeight) / 2,
        width: watermarkWidth,
        height: watermarkHeight,
        opacity,
      });
    }

    for (const block of drawnHeaderBlocks) {
      await drawBasicBlock(this.page, this.ctx, this.pageHeight, block);
    }
    for (const block of drawnFooterBlocks) {
      await drawBasicBlock(this.page, this.ctx, this.pageHeight, block);
    }
  }

  advance(height: number): number {
    const y = this.pageHeight - this.cursorY - height;
    this.cursorY += height;
    return y;
  }

  topY(): number {
    return topToPdfY(this.pageHeight, this.cursorY);
  }
}

export function drawRect(
  page: PDFPage,
  x: number,
  y: number,
  width: number,
  height: number,
  borderWidth = 1,
) {
  page.drawRectangle({
    x,
    y,
    width,
    height,
    borderWidth,
    borderColor: rgb(0, 0, 0),
  });
}
