import type { PDFFont } from "pdf-lib";

export interface TextRun {
  text: string;
  bold?: boolean;
  italic?: boolean;
}

export interface LineRun {
  text: string;
  font: PDFFont;
  bold?: boolean;
}

export interface WrappedLine {
  runs: LineRun[];
  width: number;
}

export type FontResolver = (bold?: boolean, italic?: boolean) => PDFFont;

/**
 * Wraps a sequence of styled runs (mixed bold/italic within one paragraph)
 * into lines that fit maxWidth, splitting on whitespace and respecting
 * explicit "\n" breaks within a run's own text.
 */
export function wrapRuns(
  runs: TextRun[],
  fontSize: number,
  maxWidth: number,
  resolveFont: FontResolver,
): WrappedLine[] {
  const lines: WrappedLine[] = [];
  let currentLine: LineRun[] = [];
  let currentWidth = 0;

  const pushLine = () => {
    lines.push({ runs: currentLine, width: currentWidth });
    currentLine = [];
    currentWidth = 0;
  };

  for (const run of runs) {
    const font = resolveFont(run.bold, run.italic);
    const paragraphs = run.text.split("\n");
    paragraphs.forEach((paragraph, pIdx) => {
      if (pIdx > 0) pushLine();
      const tokens = paragraph.split(/(\s+)/).filter((t) => t.length > 0);
      for (const token of tokens) {
        const tokenWidth = font.widthOfTextAtSize(token, fontSize);
        const isWhitespace = token.trim().length === 0;
        if (!isWhitespace && currentLine.length > 0 && currentWidth + tokenWidth > maxWidth) {
          pushLine();
        }
        currentLine.push({ text: token, font, bold: run.bold });
        currentWidth += tokenWidth;
      }
    });
  }
  if (currentLine.length > 0 || lines.length === 0) pushLine();
  return lines;
}

export function wrapPlainText(
  text: string,
  font: PDFFont,
  fontSize: number,
  maxWidth: number,
): string[] {
  if (!text) return [];
  const wrapped = wrapRuns([{ text }], fontSize, maxWidth, () => font);
  return wrapped.map((line) => line.runs.map((r) => r.text).join("").replace(/\s+$/, ""));
}

export function measureWidth(text: string, font: PDFFont, fontSize: number): number {
  return font.widthOfTextAtSize(text, fontSize);
}
