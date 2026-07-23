export { ReportPrintMapper } from "./ReportPrintMapper";
export type { PrintMapperProps } from "./ReportPrintMapper";
export { UserReportPrintMapper } from "./ReportPrintMapper/user-report";
export { PageRender } from "./page-render";
export { default as BlockRender } from "./block-render";

export * from "./type-guard";
export * from "./helper";

import TestRenderer from "react-test-renderer";
import React from "react";
import { ReportPrintMapper, type PrintMapperProps } from "./ReportPrintMapper";
import { serializeNode } from "./htmlSerializer";

/**
 * Renders a report to a static HTML string using the same components the
 * web/Electron app uses. Pure string output — no DOM required — so it also
 * runs inside React Native's JS engine. Feed the result to a WebView or
 * directly to expo-print's `Print.printAsync({ html })`.
 *
 * Uses react-test-renderer rather than react-dom/server: test-renderer's
 * renderer has no host-environment dependencies (no DOM, no MessageChannel,
 * no streaming internals), so it's guaranteed to run the same way in
 * Hermes/JSC as anywhere else. react-dom/server's browser build isn't —
 * it assumes browser/Node globals that Hermes doesn't provide.
 *
 * The initial render must be wrapped in `act()`: React 18+'s reconciler
 * (shared by react-test-renderer) schedules the actual commit through the
 * Scheduler rather than committing inline, so an unwrapped `create()` call
 * can return before anything has rendered — `toJSON()` would then read an
 * empty tree. `act()` forces that scheduled work to flush synchronously
 * before we read the result.
 */
export function renderReportHtml(props: PrintMapperProps): string {
  // IS_REACT_NATIVE_TEST_ENVIRONMENT=true must be set BEFORE create() — it
  // switches react-test-renderer to legacy-sync-root mode, which commits the
  // tree synchronously inside create() without needing act().
  //
  // We deliberately do NOT wrap in act(): act() has an internal Scheduler
  // dependency whose async-message-channel path can fail silently in Hermes
  // release (assembleRelease) builds compiled with -O bytecode optimisation.
  // Legacy-sync root commits inline, so act() is not needed for correctness.
  const globalScope = globalThis as any;
  const previousActFlag = globalScope.IS_REACT_ACT_ENVIRONMENT;
  const previousRNTestFlag = globalScope.IS_REACT_NATIVE_TEST_ENVIRONMENT;

  // IS_REACT_ACT_ENVIRONMENT=false suppresses React's "not wrapped in act()"
  // warning that fires when test-renderer is used outside act() in a test env.
  globalScope.IS_REACT_ACT_ENVIRONMENT = false;
  globalScope.IS_REACT_NATIVE_TEST_ENVIRONMENT = true;

  let renderer: TestRenderer.ReactTestRenderer;
  try {
    renderer = TestRenderer.create(
      React.createElement(ReportPrintMapper, { ...props, htmlPreview: true }),
    );
  } finally {
    globalScope.IS_REACT_ACT_ENVIRONMENT = previousActFlag;
    globalScope.IS_REACT_NATIVE_TEST_ENVIRONMENT = previousRNTestFlag;
  }

  const markup = serializeNode(renderer!.toJSON() as any);
  return `<!doctype html><html><head><meta charset="utf-8" /></head><body>${markup}</body></html>`;
}
