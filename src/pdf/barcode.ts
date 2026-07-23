// Reuses jsbarcode's own CODE128 encoder — pure computation, no DOM/canvas
// involved (verified: neither this module nor its dependencies reference
// document/window/canvas) — so the bar pattern comes from their tested,
// authoritative lookup table rather than a hand-transcribed one, which would
// risk a silently wrong barcode for some character.
//
// This reaches into jsbarcode's internal module path rather than its public
// API, because the public API (`JsBarcode(domElement, text)`) always
// requires a real DOM element to render into. If jsbarcode restructures this
// internal path in a future major version, encodeCode128 below degrades to
// returning null rather than throwing.
import CODE128AUTOImport from "jsbarcode/bin/barcodes/CODE128/CODE128_AUTO";

const CODE128AUTO: any = (CODE128AUTOImport as any).default ?? CODE128AUTOImport;

/** Returns a string of "1"/"0", one character per module ("1" = black bar), or null if encoding failed. */
export function encodeCode128(value: string): string | null {
  try {
    const encoder = new CODE128AUTO(value, {});
    const { data } = encoder.encode();
    return typeof data === "string" ? data : null;
  } catch {
    return null;
  }
}
