import React, { useEffect, useState } from "react";
import { WebView } from "react-native-webview";
import * as Print from "expo-print";
import { File, Paths } from "expo-file-system";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { renderReportHtml, renderReportPdf } from "./index";
import { fetchImage } from "./pdf/fetchImage";
import type { PrintMapperProps } from "./ReportPrintMapper";

export interface ReportWebViewProps extends PrintMapperProps {
  style?: any;
}

export const ReportWebView: React.FC<ReportWebViewProps> = ({
  style,
  ...reportProps
}) => {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    renderReportHtml(reportProps).then((result) => {
      if (!cancelled) setHtml(result);
    });
    return () => {
      cancelled = true;
    };
  }, [JSON.stringify(reportProps)]);

  if (html === null) return null;
  return <WebView originWhitelist={["*"]} source={{ html }} style={style} />;
};

async function writePdfToFile(
  props: PrintMapperProps,
  fileName: string,
): Promise<string> {
  const bytes = await renderReportPdf(props);
  const file = new File(Paths.cache, fileName);
  if (file.exists) file.delete();
  file.create();
  file.write(bytes);
  return file.uri;
}

export async function printReport(props: PrintMapperProps) {
  const uri = await writePdfToFile(props, `report-${Date.now()}.pdf`);
  return Print.printAsync({ uri });
}

export async function reportToPdf(props: PrintMapperProps) {
  return writePdfToFile(props, `report-${Date.now()}.pdf`);
}

let pdfEnginePrewarmed = false;

export function prewarmPdfEngine(): void {
  if (pdfEnginePrewarmed) return;
  pdfEnginePrewarmed = true;
  PDFDocument.create()
    .then((doc) =>
      Promise.all([
        doc.embedFont(StandardFonts.Helvetica),
        doc.embedFont(StandardFonts.HelveticaBold),
        doc.embedFont(StandardFonts.HelveticaOblique),
        doc.embedFont(StandardFonts.HelveticaBoldOblique),
      ]),
    )
    .catch(() => {});
}

export function prewarmImages(urls: Array<string | null | undefined>): void {
  for (const url of urls) {
    if (url) fetchImage(url);
  }
}

export function prewarmReportAssets(props: {
  headerImage?: { name?: string };
  footerImage?: { name?: string };
  watermark?: { name?: string };
}): void {
  prewarmPdfEngine();
  prewarmImages([
    props.headerImage?.name,
    props.footerImage?.name,
    props.watermark?.name,
  ]);
}
