import React from "react";
import { WebView } from "react-native-webview";
import * as Print from "expo-print";
import { renderReportHtml } from "./index";
import type { PrintMapperProps } from "./ReportPrintMapper";

export interface ReportWebViewProps extends PrintMapperProps {
  style?: any;
}

/** Renders the report as an HTML WebView — use for on-screen preview in React Native. */
export const ReportWebView: React.FC<ReportWebViewProps> = ({ style, ...reportProps }) => {
  const html = renderReportHtml(reportProps);
  return <WebView originWhitelist={["*"]} source={{ html }} style={style} />;
};

/** Sends the report straight to a printer via the native print dialog (no on-screen preview). */
export function printReport(props: PrintMapperProps) {
  return Print.printAsync({ html: renderReportHtml(props) });
}

/** Renders the report to a PDF file and returns its local uri (e.g. to share or archive). */
export async function reportToPdf(props: PrintMapperProps) {
  const { uri } = await Print.printToFileAsync({ html: renderReportHtml(props) });
  return uri;
}
