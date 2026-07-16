export { ReportPrintMapper } from "./ReportPrintMapper";
export type { PrintMapperProps } from "./ReportPrintMapper";
export { UserReportPrintMapper } from "./ReportPrintMapper/user-report";
export { PageRender } from "./page-render";
export { default as BlockRender } from "./block-render";

export * from "./type-guard";
export * from "./helper";

import "./polyfills/messageChannel";
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import { ReportPrintMapper, type PrintMapperProps } from "./ReportPrintMapper";

/**
 * Renders a report to a static HTML string using the same components the
 * web/Electron app uses. Pure string output — no DOM required — so it also
 * runs inside React Native's JS engine. Feed the result to a WebView or
 * directly to expo-print's `Print.printAsync({ html })`.
 */
export function renderReportHtml(props: PrintMapperProps): string {
  const markup = renderToStaticMarkup(React.createElement(ReportPrintMapper, { ...props, htmlPreview: true }));
  return `<!doctype html><html><head><meta charset="utf-8" /></head><body>${markup}</body></html>`;
}
