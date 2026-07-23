import React, { useEffect, useState } from "react";
import { WebView } from "react-native-webview";
import * as Print from "expo-print";
import { File, Paths } from "expo-file-system";
import { renderReportHtml, renderReportPdf } from "./index";
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
