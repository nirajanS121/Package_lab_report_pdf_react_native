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

export async function renderReportHtml(
  props: PrintMapperProps,
): Promise<string> {
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
