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

// renderReportHtml does a heavy synchronous render (test-renderer + string
// serialization of every content block). Calling the native print bridge
// immediately afterward, with the JS thread having just been busy for a
// while, can get silently dropped on first call on some Android devices —
// yielding one tick first gives the bridge queue a chance to flush before
// the native call goes out.
function yieldToEventLoop(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

/** Sends the report straight to a printer via the native print dialog (no on-screen preview). */
export async function printReport(props: PrintMapperProps) {
  const html = renderReportHtml(props);
  await yieldToEventLoop();
  return Print.printAsync({ html });
}

/** Renders the report to a PDF file and returns its local uri (e.g. to share or archive). */
export async function reportToPdf(props: PrintMapperProps) {
  const html = renderReportHtml(props);
  await yieldToEventLoop();
  const { uri } = await Print.printToFileAsync({ html });
  return uri;
}
