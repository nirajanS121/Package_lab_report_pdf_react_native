import React, { useEffect, useState } from "react";
import { WebView } from "react-native-webview";
import * as Print from "expo-print";
import { renderReportHtml } from "./index";
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

// renderReportHtml already awaits several ticks internally (waiting for
// react-test-renderer's scheduled commit to finish), so the JS thread has
// already yielded repeatedly by the time we get the html back. Still worth
// one more explicit yield here in case that changes — a native print call
// immediately after heavy synchronous work can get silently dropped on some
// Android devices.
function yieldToEventLoop(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

/** Sends the report straight to a printer via the native print dialog (no on-screen preview). */
export async function printReport(props: PrintMapperProps) {
  const html = await renderReportHtml(props);
  await yieldToEventLoop();
  return Print.printAsync({ html });
}

/** Renders the report to a PDF file and returns its local uri (e.g. to share or archive). */
export async function reportToPdf(props: PrintMapperProps) {
  const html = await renderReportHtml(props);
  await yieldToEventLoop();
  const { uri } = await Print.printToFileAsync({ html });
  return uri;
}
