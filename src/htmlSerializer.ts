type TestRendererNode =
  | string
  | number
  | boolean
  | null
  | undefined
  | TestRendererNode[]
  | {
      type: string;
      props: Record<string, any>;
      children: TestRendererNode[] | null;
    };

const VOID_ELEMENTS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

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

const UNITLESS_CSS_PROPERTIES = new Set([
  "animationIterationCount",
  "aspectRatio",
  "borderImageOutset",
  "borderImageSlice",
  "borderImageWidth",
  "boxFlex",
  "boxFlexGroup",
  "boxOrdinalGroup",
  "columnCount",
  "columns",
  "flex",
  "flexGrow",
  "flexPositive",
  "flexShrink",
  "flexNegative",
  "flexOrder",
  "gridArea",
  "gridRow",
  "gridRowEnd",
  "gridRowSpan",
  "gridRowStart",
  "gridColumn",
  "gridColumnEnd",
  "gridColumnSpan",
  "gridColumnStart",
  "fontWeight",
  "lineClamp",
  "lineHeight",
  "opacity",
  "order",
  "orphans",
  "tabSize",
  "widows",
  "zIndex",
  "zoom",
  "fillOpacity",
  "floodOpacity",
  "stopOpacity",
  "strokeDasharray",
  "strokeDashoffset",
  "strokeMiterlimit",
  "strokeOpacity",
  "strokeWidth",
]);

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function cssPropertyToKebabCase(name: string): string {
  if (name.startsWith("--")) return name;
  return name.replace(/([A-Z])/g, "-$1").toLowerCase();
}

function styleObjectToCss(style: Record<string, any>): string {
  return Object.entries(style)
    .filter(
      ([, value]) => value !== null && value !== undefined && value !== false,
    )
    .map(([key, value]) => {
      const cssKey = cssPropertyToKebabCase(key);
      const needsPx =
        typeof value === "number" &&
        value !== 0 &&
        !UNITLESS_CSS_PROPERTIES.has(key);
      return `${cssKey}:${needsPx ? `${value}px` : value}`;
    })
    .join(";");
}

function serializeAttributes(props: Record<string, any>): string {
  let html = "";
  for (const [key, value] of Object.entries(props)) {
    if (key === "children" || key === "dangerouslySetInnerHTML") continue;
    if (value === null || value === undefined || typeof value === "function")
      continue;

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

const RAW_TEXT_ELEMENTS = new Set(["style", "script"]);

function rawText(node: TestRendererNode): string {
  if (node === null || node === undefined || typeof node === "boolean")
    return "";
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(rawText).join("");
  return "";
}

export function serializeNode(node: TestRendererNode): string {
  if (node === null || node === undefined || typeof node === "boolean")
    return "";
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

  const inner =
    innerHtml !== undefined
      ? innerHtml
      : children
        ? serializeNode(children)
        : "";
  return `<${type}${attrs}>${inner}</${type}>`;
}
