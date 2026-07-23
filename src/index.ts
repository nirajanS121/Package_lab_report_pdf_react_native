export { ReportPrintMapper } from "./ReportPrintMapper";
export type { PrintMapperProps } from "./ReportPrintMapper";
export { UserReportPrintMapper } from "./ReportPrintMapper/user-report";
export { PageRender } from "./page-render";
export { default as BlockRender } from "./block-render";

export * from "./type-guard";
export * from "./helper";
export { renderReportPdf } from "./pdf/renderReportPdf";

import TestRenderer from "react-test-renderer";
import React from "react";
import { ReportPrintMapper, type PrintMapperProps } from "./ReportPrintMapper";
import { serializeNode } from "./htmlSerializer";

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// react-test-renderer's create() schedules the actual commit through React's
// Scheduler rather than committing inline — reading toJSON() immediately
// after create() reliably returns null, confirmed empirically (500-node
// trees included) in both dev and production React builds. The work always
// completes by the next macrotask (setTimeout(0)), never a microtask, so we
// poll a few ticks instead of assuming any fixed number.
//
// This does NOT use act(): act() is undefined in a release build — it's
// literally `var act = React.act`, and React's *production* build has no
// `act` export at all (only react.development.js does). Calling it there
// throws. Polling toJSON() works identically in both builds since it doesn't
// depend on act existing.
async function waitForRenderedTree(
  renderer: TestRenderer.ReactTestRenderer,
  maxAttempts = 50,
): Promise<unknown> {
  let tree = renderer.toJSON();
  let attempts = 0;
  while (tree === null && attempts < maxAttempts) {
    await wait(10);
    tree = renderer.toJSON();
    attempts += 1;
  }
  return tree;
}

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
 */
export async function renderReportHtml(props: PrintMapperProps): Promise<string> {
  // Switches react-test-renderer to legacy (non-concurrent-only) mode, and
  // silences its "is deprecated" console.error — both meant for exactly this
  // use case (test-renderer used outside Jest).
  const globalScope = globalThis as any;
  const previousRNTestFlag = globalScope.IS_REACT_NATIVE_TEST_ENVIRONMENT;
  globalScope.IS_REACT_NATIVE_TEST_ENVIRONMENT = true;

  let renderer: TestRenderer.ReactTestRenderer;
  try {
    renderer = TestRenderer.create(
      React.createElement(ReportPrintMapper, { ...props, htmlPreview: true }),
    );
    const tree = await waitForRenderedTree(renderer);
    const markup = serializeNode(tree as any);
    return `<!doctype html><html><head><meta charset="utf-8" /></head><body>${markup}</body></html>`;
  } finally {
    globalScope.IS_REACT_NATIVE_TEST_ENVIRONMENT = previousRNTestFlag;
  }
}
