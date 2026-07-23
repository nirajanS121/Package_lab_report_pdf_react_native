import qrcodeGenerator from "qrcode-generator";

export interface QrMatrix {
  size: number;
  isDark: (row: number, col: number) => boolean;
}

export function buildQrMatrix(value: string): QrMatrix | null {
  try {
    const qr = qrcodeGenerator(0, "M");
    qr.addData(value);
    qr.make();
    const size = qr.getModuleCount();
    return { size, isDark: (row, col) => qr.isDark(row, col) };
  } catch {
    return null;
  }
}
