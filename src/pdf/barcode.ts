import CODE128AUTOImport from "jsbarcode/bin/barcodes/CODE128/CODE128_AUTO";

const CODE128AUTO: any =
  (CODE128AUTOImport as any).default ?? CODE128AUTOImport;

export function encodeCode128(value: string): string | null {
  try {
    const encoder = new CODE128AUTO(value, {});
    const { data } = encoder.encode();
    return typeof data === "string" ? data : null;
  } catch {
    return null;
  }
}
