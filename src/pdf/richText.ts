import type { TextRun } from "./textLayout";

const ENTITY_PATTERN = /&nbsp;|&amp;|&lt;|&gt;|&quot;|&#39;|&apos;/g;
const ENTITY_MAP: Record<string, string> = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
};

function decodeEntities(text: string): string {
  return text.replace(ENTITY_PATTERN, (m) => ENTITY_MAP[m] ?? m);
}

/**
 * Parses the small HTML subset actually used in comment/endnote/remarks
 * fields (b/strong, i/em, u, br, p, div — anything else is stripped down to
 * its text content) into paragraphs of styled text runs, ready for
 * wrapRuns(). This is not a general HTML parser; it's scoped to what
 * dangerouslySetInnerHTML is fed in this codebase.
 */
export function parseRichText(html: string | undefined | null): TextRun[][] {
  if (!html) return [[]];

  const paragraphs: TextRun[][] = [[]];
  const boldStack: boolean[] = [false];
  const italicStack: boolean[] = [false];

  const tagPattern = /<\/?([a-zA-Z0-9]+)[^>]*>/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const currentParagraph = () => paragraphs[paragraphs.length - 1];

  const pushText = (raw: string) => {
    const decoded = decodeEntities(raw);
    if (!decoded) return;
    currentParagraph().push({
      text: decoded,
      bold: boldStack[boldStack.length - 1],
      italic: italicStack[italicStack.length - 1],
    });
  };

  while ((match = tagPattern.exec(html)) !== null) {
    pushText(html.slice(lastIndex, match.index));
    lastIndex = tagPattern.lastIndex;

    const isClosing = match[0].startsWith("</");
    const tag = match[1].toLowerCase();

    if (tag === "br") {
      paragraphs.push([]);
    } else if (tag === "p" || tag === "div") {
      if (currentParagraph().length > 0) paragraphs.push([]);
    } else if (tag === "b" || tag === "strong") {
      if (isClosing) {
        if (boldStack.length > 1) boldStack.pop();
      } else {
        boldStack.push(true);
      }
    } else if (tag === "i" || tag === "em") {
      if (isClosing) {
        if (italicStack.length > 1) italicStack.pop();
      } else {
        italicStack.push(true);
      }
    }
    // other tags (u, span, etc.) are ignored — only their text content survives
  }
  pushText(html.slice(lastIndex));

  const nonEmpty = paragraphs.filter((p) => p.length > 0);
  return nonEmpty.length > 0 ? nonEmpty : [[]];
}

/** Strips all tags, keeping only decoded text — used where we don't need styling. */
export function stripHtml(html: string | undefined | null): string {
  if (!html) return "";
  return decodeEntities(html.replace(/<[^>]*>/g, "")).trim();
}
