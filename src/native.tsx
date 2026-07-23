import React, { useEffect, useState } from "react";
import { WebView } from "react-native-webview";
import * as Print from "expo-print";
import { File, Paths } from "expo-file-system";
import { renderReportHtml, renderReportPdf } from "./index";
import type { PrintMapperProps } from "./ReportPrintMapper";

export interface ReportWebViewProps extends PrintMapperProps {
  style?: any;
}

/** Renders the report as an HTML WebView — use for on-screen preview in React Native. */
export const ReportWebView: React.FC<ReportWebViewProps> = ({ style, ...reportProps }) => {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    renderReportHtml(reportProps).then((result) => {
      if (!cancelled) setHtml(result);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(reportProps)]);

  if (html === null) return null;
  return <WebView originWhitelist={["*"]} source={{ html }} style={style} />;
};

// Both printReport and reportToPdf render via renderReportPdf (pdf-lib —
// direct PDF construction, no WebView) rather than going through
// expo-print's `{ html }` option. That option internally loads the HTML in
// a hidden WebView and calls Android's own `WebView.createPrintDocumentAdapter()`
// to rasterize it — measured at a fixed ~32s regardless of content size or
// document complexity, on real hardware, because that Android API itself is
// slow (confirmed: react-native-html-to-pdf, an entirely different library,
// uses that exact same API and even ships a 30s timeout around it).
//
// expo-print's `{ uri }` option is a different code path
// (PrintDocumentAdapter constructed directly from an existing file) that
// never touches WebView/createPrintDocumentAdapter at all — so once we have
// a PDF file already on disk, handing expo-print that file's uri keeps the
// "send to an actual printer" use case fast too.
async function writePdfToFile(props: PrintMapperProps, fileName: string): Promise<string> {
  const bytes = await renderReportPdf(props);
  const file = new File(Paths.cache, fileName);
  if (file.exists) file.delete();
  file.create();
  file.write(bytes);
  return file.uri;
}

/** Sends the report straight to a printer via the native print dialog (no on-screen preview). */
export async function printReport(props: PrintMapperProps) {
  const uri = await writePdfToFile(props, `report-${Date.now()}.pdf`);
  return Print.printAsync({ uri });
}

/** Renders the report to a PDF file and returns its local uri (e.g. to share or archive). */
export async function reportToPdf(props: PrintMapperProps) {
  return writePdfToFile(props, `report-${Date.now()}.pdf`);
}
