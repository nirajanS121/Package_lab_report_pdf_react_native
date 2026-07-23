import { PDFFont, rgb } from "pdf-lib";
import { PageManager } from "./pageManager";
import { PdfContext, resolveFont } from "./blocks";
import { wrapPlainText, wrapRuns, TextRun, WrappedLine } from "./textLayout";
import { parseRichText, stripHtml } from "./richText";
import { groupAntibiotics } from "../helper";
import {
  IPathoColumnConfig,
  IPathoNoteConfig,
} from "../content-blocks/patho/type";

type ColumnConfig = IPathoColumnConfig;

interface PathoTableProps {
  title?: string;
  data?: any[];
  tableColumns?: ColumnConfig[];
  tableWidth?: number;
  endNoteConfig?: IPathoNoteConfig;
  commentsConfig?: IPathoNoteConfig;
  x: number;
}

const LINE_GAP = 1.2;
const CELL_PADDING = 3;

function textStyleFont(
  ctx: PdfContext,
  formate: any,
): { font: PDFFont; size: number } {
  return {
    font: resolveFont(ctx.fonts, formate?.isBold, formate?.isItalics),
    size: formate?.headerFontSize || formate?.bodyFontSize || 12,
  };
}

function columnWidths(
  tableColumns: ColumnConfig[],
  hasUnitRef: boolean,
  item?: any,
) {
  const widths: Record<string, number> = {};
  const unitCol = tableColumns.find((c) => c.valueKey === "unit");
  const refCol = tableColumns.find((c) => c.valueKey === "referenceRange");
  const isOrganism =
    item &&
    (item.result_type === "organism" || item.result_type === "freetext");
  const hasUnitValue = !!item?.unit;
  const hasRefValue = !!item?.referenceRange;
  const skipUnit =
    isOrganism && !hasUnitValue && (item?.result?.length ?? 0) > 20;
  const skipRef =
    isOrganism && !hasRefValue && (item?.result?.length ?? 0) > 20;

  for (const col of tableColumns) {
    if (
      (col.valueKey === "unit" && (skipUnit || !hasUnitRef)) ||
      (col.valueKey === "referenceRange" && (skipRef || !hasUnitRef))
    ) {
      continue;
    }
    let w = col.configColumn.columnWidth;
    if (col.valueKey === "result") {
      w +=
        (skipUnit ? (unitCol?.configColumn.columnWidth ?? 0) : 0) +
        (skipRef ? (refCol?.configColumn.columnWidth ?? 0) : 0);
    }
    widths[col.valueKey] = w;
  }
  return widths;
}

function cellText(col: ColumnConfig, item: any): string {
  if (col.valueKey === "result") return stripHtml(item.result) || "";
  if (col.valueKey === "unit") return item.unit ?? "-";
  if (col.valueKey === "referenceRange") {
    if (item.result_type === "freetext" && item.freetext_range)
      return stripHtml(item.freetext_range);
    return item.referenceRange ?? "-";
  }
  return item[col.valueKey] ?? "-";
}

function wrapColumn(
  ctx: PdfContext,
  col: ColumnConfig,
  text: string,
  width: number,
  isBold: boolean,
): string[] {
  const { font, size } = textStyleFont(ctx, col.configColumn.bodyFormate);
  const actualFont = isBold ? ctx.fonts.bold : font;
  return wrapPlainText(
    text,
    actualFont,
    size,
    Math.max(width - CELL_PADDING * 2, 10),
  );
}

async function drawRow(
  pm: PageManager,
  ctx: PdfContext,
  x: number,
  widths: Record<string, number>,
  columns: ColumnConfig[],
  cellLines: Record<string, string[]>,
  item: any,
  rowHeight: number,
) {
  const topY = pm.advance(rowHeight);
  let cx = x;
  const isAbnormal =
    item.flag === "H" ||
    item.flag === "L" ||
    item.flag === "CL" ||
    item.flag === "CH" ||
    item?.abnormal === true;

  for (const col of columns) {
    const width = widths[col.valueKey];
    if (width === undefined) continue;
    const { size } = textStyleFont(ctx, col.configColumn.bodyFormate);
    const isResultCol = col.valueKey === "result";
    const font = isResultCol && isAbnormal ? ctx.fonts.bold : ctx.fonts.regular;
    const lines = cellLines[col.valueKey] || [];
    let ly = topY + rowHeight - size - CELL_PADDING;
    for (const line of lines) {
      let lx = cx + CELL_PADDING;
      const alignment = col.configColumn.alignment;
      if (alignment === "center" || alignment === "right") {
        const w = font.widthOfTextAtSize(line, size);
        lx =
          alignment === "center"
            ? cx + (width - w) / 2
            : cx + width - w - CELL_PADDING;
      }
      pm.page.drawText(line, { x: lx, y: ly, size, font });
      ly -= size * LINE_GAP;
    }
    if (isResultCol && item.showFlag && item.flag) {
      const flagText = `[${item.flag}]`;
      const w = font.widthOfTextAtSize(flagText, size);
      pm.page.drawText(flagText, {
        x: cx + width - w - CELL_PADDING,
        y: topY + rowHeight - size - CELL_PADDING,
        size,
        font,
      });
    }
    pm.page.drawRectangle({
      x: cx,
      y: topY,
      width,
      height: rowHeight,
      borderWidth: 0.5,
      borderColor: rgb(0.667, 0.663, 0.663),
    });
    cx += width;
  }
}

function measureRichTextHeight(
  ctx: PdfContext,
  paragraphs: TextRun[][],
  fontSize: number,
  maxWidth: number,
): { lines: WrappedLine[][]; height: number } {
  const allLines: WrappedLine[][] = [];
  let totalLines = 0;
  for (const paragraph of paragraphs) {
    const wrapped = wrapRuns(paragraph, fontSize, maxWidth, (b, i) =>
      resolveFont(ctx.fonts, b, i),
    );
    allLines.push(wrapped);
    totalLines += wrapped.length;
  }
  return { lines: allLines, height: totalLines * fontSize * LINE_GAP };
}

function drawWrappedParagraphs(
  pm: PageManager,
  x: number,
  topY: number,
  lines: WrappedLine[][],
  fontSize: number,
) {
  let y = topY - fontSize;
  for (const paragraph of lines) {
    for (const line of paragraph) {
      let lx = x;
      for (const run of line.runs) {
        pm.page.drawText(run.text, {
          x: lx,
          y,
          size: fontSize,
          font: run.font,
        });
        lx += run.font.widthOfTextAtSize(run.text, fontSize);
      }
      y -= fontSize * LINE_GAP;
    }
  }
}

async function drawAntibioticTable(
  pm: PageManager,
  ctx: PdfContext,
  x: number,
  width: number,
  antibioticResults: any[],
) {
  const { sensitive, resistant, partiallyResistant } =
    groupAntibiotics(antibioticResults);
  const groups = [
    { label: "Sensitive", items: sensitive },
    { label: "Resistant", items: resistant },
    { label: "Partially Sensitive", items: partiallyResistant },
  ].filter((g) => g.items.length > 0);
  if (groups.length === 0) return;

  const fontSize = 10;
  const colWidth = width / groups.length;
  const maxRows = Math.max(...groups.map((g) => g.items.length));
  const height = (maxRows + 1) * fontSize * LINE_GAP + CELL_PADDING * 2;

  const topY = pm.advance(height);
  let cx = x;
  for (const group of groups) {
    pm.page.drawRectangle({
      x: cx,
      y: topY,
      width: colWidth,
      height,
      borderWidth: 0.5,
      borderColor: rgb(0.667, 0.663, 0.663),
    });
    const headerWidth = ctx.fonts.bold.widthOfTextAtSize(group.label, fontSize);
    pm.page.drawText(group.label, {
      x: cx + (colWidth - headerWidth) / 2,
      y: topY + height - fontSize - CELL_PADDING,
      size: fontSize,
      font: ctx.fonts.bold,
    });
    let ly = topY + height - fontSize * 2 - CELL_PADDING * 2;
    for (const item of group.items) {
      pm.page.drawText(item.name, {
        x: cx + CELL_PADDING,
        y: ly,
        size: fontSize,
        font: ctx.fonts.italic,
      });
      ly -= fontSize * LINE_GAP;
    }
    cx += colWidth;
  }
}

export async function drawPathoTable(
  pm: PageManager,
  ctx: PdfContext,
  props: PathoTableProps,
) {
  const { title, data = [], tableColumns = [], x } = props;
  const totalColumnWidth = tableColumns.reduce(
    (sum, c) => sum + (c.configColumn.columnWidth || 0),
    0,
  );
  const tableWidth = props.tableWidth ?? totalColumnWidth;
  const hasUnitRef = !data?.[0]?.data?.[0]?.hideUnitRef;

  if (title) {
    await pm.ensureSpace(20);
    const topY = pm.advance(20);
    const font = ctx.fonts.bold;
    const upper = title.toUpperCase();
    const w = font.widthOfTextAtSize(upper, 14);
    pm.page.drawText(upper, {
      x: x + (tableWidth - w) / 2,
      y: topY + 4,
      size: 14,
      font,
    });
  }

  await pm.ensureSpace(20);
  {
    const topY = pm.advance(20);
    let cx = x;
    pm.page.drawRectangle({
      x,
      y: topY,
      width: tableWidth,
      height: 20,
      borderWidth: 1,
      borderColor: rgb(0, 0, 0),
    });
    for (const col of tableColumns) {
      const { font, size } = textStyleFont(ctx, col.configColumn.headerFormate);
      pm.page.drawText(col.value, {
        x: cx + CELL_PADDING,
        y: topY + 6,
        size,
        font,
      });
      cx += col.configColumn.columnWidth;
    }
  }

  let previousDepartmentName: string | null = null;
  for (let profileIndex = 0; profileIndex < data.length; profileIndex++) {
    const profile = data[profileIndex];

    if (
      profile.department_name &&
      previousDepartmentName !== profile.department_name &&
      profileIndex !== 0
    ) {
      await pm.ensureSpace(18);
      const topY = pm.advance(18);
      const font = ctx.fonts.bold;
      const upper = String(profile.department_name).toUpperCase();
      const w = font.widthOfTextAtSize(upper, 12);
      pm.page.drawText(upper, {
        x: x + (tableWidth - w) / 2,
        y: topY + 3,
        size: 12,
        font,
      });
    }
    previousDepartmentName = profile.department_name ?? previousDepartmentName;

    if (profile.title) {
      await pm.ensureSpace(18);
      const topY = pm.advance(18);
      pm.page.drawRectangle({
        x,
        y: topY,
        width: tableWidth,
        height: 18,
        borderWidth: 0.5,
        borderColor: rgb(0.667, 0.663, 0.663),
      });
      pm.page.drawText(profile.title, {
        x: x + 5,
        y: topY + 4,
        size: 12,
        font: ctx.fonts.bold,
      });
    }

    for (const item of profile.data as any[]) {
      if (item.type === "department_heading" && item.title) {
        await pm.ensureSpace(16);
        const topY = pm.advance(16);
        const font = ctx.fonts.bold;
        const upper = String(item.title).toUpperCase();
        const w = font.widthOfTextAtSize(upper, 11);
        pm.page.drawText(upper, {
          x: x + (tableWidth - w) / 2,
          y: topY + 2,
          size: 11,
          font,
        });
        continue;
      }

      if (item.type === "heading") {
        await pm.ensureSpace(16);
        const topY = pm.advance(16);
        const indent = 5 + 20 * item.level;
        pm.page.drawRectangle({
          x,
          y: topY,
          width: tableWidth,
          height: 16,
          borderWidth: 0.5,
          borderColor: rgb(0.667, 0.663, 0.663),
        });
        pm.page.drawText(item.title, {
          x: x + indent,
          y: topY + 3,
          size: 11,
          font: ctx.fonts.boldItalic,
        });
        continue;
      }

      if (item.type !== "data") continue;

      const widths = columnWidths(tableColumns, hasUnitRef, item);
      const cellLines: Record<string, string[]> = {};
      let maxLines = 1;
      for (const col of tableColumns) {
        const width = widths[col.valueKey];
        if (width === undefined) continue;
        const text = cellText(col, item);
        const isAbnormal =
          col.valueKey === "result" &&
          (item.flag === "H" || item.flag === "L" || item?.abnormal === true);
        const lines = wrapColumn(ctx, col, text, width, isAbnormal);
        cellLines[col.valueKey] = lines;
        maxLines = Math.max(maxLines, lines.length);
      }
      const bodyFontSize =
        tableColumns[0]?.configColumn.bodyFormate?.bodyFontSize || 12;
      const rowHeight = maxLines * bodyFontSize * LINE_GAP + CELL_PADDING * 2;

      const antibiotics = item.antibiotic_results ?? [];
      const commentParagraphs = item.comment
        ? parseRichText(item.comment)
        : null;
      const endnoteParagraphs = item.endnote
        ? parseRichText(item.endnote)
        : null;

      const antibioticGroups =
        antibiotics.length > 0 ? groupAntibiotics(antibiotics) : null;
      const antibioticHeight =
        antibioticGroups && antibiotics.length > 0
          ? (Math.max(
              antibioticGroups.sensitive.length,
              antibioticGroups.resistant.length,
              antibioticGroups.partiallyResistant.length,
            ) +
              1) *
              10 *
              LINE_GAP +
            CELL_PADDING * 2
          : 0;

      const commentMeasure = commentParagraphs
        ? measureRichTextHeight(
            ctx,
            commentParagraphs,
            10,
            tableWidth - CELL_PADDING * 2,
          )
        : null;
      const endnoteMeasure = endnoteParagraphs
        ? measureRichTextHeight(
            ctx,
            endnoteParagraphs,
            10,
            tableWidth - CELL_PADDING * 2,
          )
        : null;

      const commentHeight = commentMeasure ? commentMeasure.height + 14 : 0;
      const endnoteHeight = endnoteMeasure ? endnoteMeasure.height + 14 : 0;

      const atomicHeight =
        rowHeight + antibioticHeight + commentHeight + endnoteHeight;
      await pm.ensureSpace(atomicHeight);

      await drawRow(
        pm,
        ctx,
        x,
        widths,
        tableColumns,
        cellLines,
        item,
        rowHeight,
      );

      if (antibioticGroups && antibiotics.length > 0) {
        await drawAntibioticTable(pm, ctx, x, tableWidth, antibiotics);
      }

      if (commentMeasure) {
        const topY = pm.advance(commentHeight);
        pm.page.drawText("Comment :", {
          x: x + CELL_PADDING,
          y: topY + commentHeight - 12,
          size: 10,
          font: resolveFont(ctx.fonts, commentsConfigBold(props)),
        });
        drawWrappedParagraphs(
          pm,
          x + CELL_PADDING,
          topY + commentHeight - 14,
          commentMeasure.lines,
          10,
        );
      }

      if (endnoteMeasure) {
        const topY = pm.advance(endnoteHeight);
        const label = item.display_nameEndnote || "EndNote";
        pm.page.drawText(`${label} :`, {
          x: x + CELL_PADDING,
          y: topY + endnoteHeight - 12,
          size: 10,
          font: ctx.fonts.regular,
        });
        pm.page.drawRectangle({
          x,
          y: topY,
          width: tableWidth,
          height: endnoteHeight - 14,
          borderWidth: 0.5,
          borderColor: rgb(0.667, 0.663, 0.663),
        });
        drawWrappedParagraphs(
          pm,
          x + CELL_PADDING,
          topY + endnoteHeight - 16,
          endnoteMeasure.lines,
          10,
        );
      }
    }

    if (profile.remarks) {
      const remarksText = stripHtml(profile.remarks);
      const font = ctx.fonts.regular;
      const lines = wrapPlainText(
        remarksText,
        font,
        10,
        tableWidth - CELL_PADDING * 2,
      );
      const height = (lines.length + 1) * 10 * LINE_GAP + CELL_PADDING * 2;
      await pm.ensureSpace(height);
      const topY = pm.advance(height);
      pm.page.drawText(`${profile.title ?? ""} Remarks :`, {
        x: x + CELL_PADDING,
        y: topY + height - 12,
        size: 10,
        font: ctx.fonts.bold,
      });
      let ly = topY + height - 24;
      for (const line of lines) {
        pm.page.drawText(line, { x: x + CELL_PADDING, y: ly, size: 10, font });
        ly -= 10 * LINE_GAP;
      }
    }
  }
}

function commentsConfigBold(props: PathoTableProps): boolean {
  return !!props.commentsConfig?.isBold;
}
