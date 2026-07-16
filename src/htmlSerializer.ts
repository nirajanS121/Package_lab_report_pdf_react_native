// Converts a react-test-renderer JSON tree into an HTML string. This
// replaces react-dom/server's renderToStaticMarkup for the native path:
// react-test-renderer's renderer has zero host-environment dependencies (no
// DOM, no MessageChannel, no streaming/Fizz internals) by design — it's built
// to run in bare Node for unit tests — so it runs in Hermes/JSC exactly as
// reliably as it runs anywhere else. react-dom/server does not offer that
// guarantee: its browser build assumes browser/Node globals (MessageChannel
// among them) that Hermes doesn't have.
//
// Only handles what this package's own components actually emit: div/span/
// table-ish HTML tags with style objects and dangerouslySetInnerHTML, plus
// the small set of real SVG elements/attributes qrcode.react's QRCodeSVG
// renders (svg/path/title with height/width/viewBox/fill/d/shapeRendering).
// It is not a general react-dom/server replacement.

type TestRendererNode =
  | string
  | number
  | boolean
  | null
  | undefined
  | TestRendererNode[]
  | { type: string; props: Record<string, any>; children: TestRendererNode[] | null };

const VOID_ELEMENTS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr",
]);

// Real attribute spelling differs from the React prop name for these.
// (Most SVG attributes — viewBox, preserveAspectRatio, etc. — are already
// spelled in camelCase in real markup, so no mapping is needed for those.)
const ATTRIBUTE_NAME_OVERRIDES: Record<string, string> = {
  className: "class",
  htmlFor: "for",
  shapeRendering: "shape-rendering",
  crossOrigin: "crossorigin",
  tabIndex: "tabindex",
  readOnly: "readonly",
  autoFocus: "autofocus",
  autoCapitalize: "autocapitalize",
  autoCorrect: "autocorrect",
  autoComplete: "autocomplete",
  acceptCharset: "accept-charset",
  xmlnsXlink: "xmlns:xlink",
  xlinkHref: "xlink:href",
};

// react-dom's isUnitlessNumber list (the CSS properties that must NOT get an
// implicit "px" appended when given a bare number).
const UNITLESS_CSS_PROPERTIES = new Set([
  "animationIterationCount", "aspectRatio", "borderImageOutset", "borderImageSlice",
  "borderImageWidth", "boxFlex", "boxFlexGroup", "boxOrdinalGroup", "columnCount",
  "columns", "flex", "flexGrow", "flexPositive", "flexShrink", "flexNegative",
  "flexOrder", "gridArea", "gridRow", "gridRowEnd", "gridRowSpan", "gridRowStart",
  "gridColumn", "gridColumnEnd", "gridColumnSpan", "gridColumnStart", "fontWeight",
  "lineClamp", "lineHeight", "opacity", "order", "orphans", "tabSize", "widows",
  "zIndex", "zoom", "fillOpacity", "floodOpacity", "stopOpacity", "strokeDasharray",
  "strokeDashoffset", "strokeMiterlimit", "strokeOpacity", "strokeWidth",
]);

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function cssPropertyToKebabCase(name: string): string {
  if (name.startsWith("--")) return name; // CSS custom property
  return name.replace(/([A-Z])/g, "-$1").toLowerCase();
}

function styleObjectToCss(style: Record<string, any>): string {
  return Object.entries(style)
    .filter(([, value]) => value !== null && value !== undefined && value !== false)
    .map(([key, value]) => {
      const cssKey = cssPropertyToKebabCase(key);
      const needsPx = typeof value === "number" && value !== 0 && !UNITLESS_CSS_PROPERTIES.has(key);
      return `${cssKey}:${needsPx ? `${value}px` : value}`;
    })
    .join(";");
}

function serializeAttributes(props: Record<string, any>): string {
  let html = "";
  for (const [key, value] of Object.entries(props)) {
    if (key === "children" || key === "dangerouslySetInnerHTML") continue;
    if (value === null || value === undefined || typeof value === "function") continue;

    const attrName = ATTRIBUTE_NAME_OVERRIDES[key] ?? key;

    if (key === "style" && typeof value === "object") {
      const css = styleObjectToCss(value);
      if (css) html += ` style="${escapeHtml(css)}"`;
      continue;
    }
    if (typeof value === "boolean") {
      if (value) html += ` ${attrName}`;
      continue;
    }
    html += ` ${attrName}="${escapeHtml(String(value))}"`;
  }
  return html;
}

// <style>/<script> are "raw text elements" per the HTML spec — their
// content is never entity-decoded, so escaping it (e.g. `"` -> `&quot;`)
// would corrupt the CSS/JS rather than protect anything.
const RAW_TEXT_ELEMENTS = new Set(["style", "script"]);

function rawText(node: TestRendererNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(rawText).join("");
  return ""; // raw-text elements never contain element children in this codebase
}

export function serializeNode(node: TestRendererNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string") return escapeHtml(node);
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(serializeNode).join("");

  const { type, props, children } = node;
  const attrs = serializeAttributes(props);
  const innerHtml = props?.dangerouslySetInnerHTML?.__html;

  if (VOID_ELEMENTS.has(type)) return `<${type}${attrs} />`;

  if (RAW_TEXT_ELEMENTS.has(type)) {
    return `<${type}${attrs}>${children ? rawText(children) : ""}</${type}>`;
  }

  const inner = innerHtml !== undefined ? innerHtml : (children ? serializeNode(children) : "");
  return `<${type}${attrs}>${inner}</${type}>`;
}
