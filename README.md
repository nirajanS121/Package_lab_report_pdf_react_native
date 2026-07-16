# lab-pdf-view-react-native

Renders a lab report (header/footer/watermark images + a `printTemplateDesign`
JSON layout + patient `data`/`table_data`) into a printable output. Same
report engine, two output modes:

- **Web / Electron** — the original React components (`ReportPrintMapper`,
  `PageRender`, block renderers) rendered directly in the DOM, exactly as
  `kiosk-frontend-app` does today.
- **React Native** — `renderReportHtml(props)` runs the *same* components
  through `react-dom/server`'s `renderToStaticMarkup`, which is pure string
  output with no DOM dependency, so it also runs inside Hermes/JSC. Feed the
  resulting HTML string to a WebView for preview or straight to a native
  print API.

## Install

```
npm install lab-pdf-view-react-native
```

For the React Native helpers (`./native` subpath) also install:

```
npm install react-native-webview expo-print
```

## Usage — Web / Electron (same as before)

```tsx
import { ReportPrintMapper } from "lab-pdf-view-react-native";

<ReportPrintMapper
  ref={componentRef}
  headerImage={organization.header}
  footerImage={organization.footer}
  watermark={organization.watermark}
  data={{ ...header_data, ...footer_data, ...report_footers }}
  table_data={table_data}
  signatures={report_footers}
  printTemplateDesign={report_templates}
/>;
```

Print it with `react-to-print` (browser) or by reading
`componentRef.current.innerHTML` and sending it to Electron's silent print
IPC — nothing changes from the current app.

## Usage — React Native

```tsx
import { ReportWebView, printReport } from "lab-pdf-view-react-native/native";

// On-screen preview:
<ReportWebView
  style={{ flex: 1 }}
  headerImage={organization.header}
  footerImage={organization.footer}
  watermark={organization.watermark}
  data={{ ...header_data, ...footer_data, ...report_footers }}
  table_data={table_data}
  signatures={report_footers}
  printTemplateDesign={report_templates}
/>;

// Or print directly, no preview:
await printReport({ data, table_data, signatures, printTemplateDesign, headerImage, footerImage, watermark });
```

Both take the exact same JSON payload your API already returns for lab
report printing — no reshaping needed between platforms.

## Why HTML string instead of native `View`/`Text`?

The report layout is pixel-precise: absolute-positioned blocks, HTML
`<table>` pagination, and `@page`/`@media print` CSS. React Native's Yoga
layout engine has no equivalent for tables or CSS print pagination, so
rebuilding every block as native components would mean re-deriving that
layout logic and losing exact fidelity with the designed templates. Reusing
the existing components and only changing the *output target* (DOM vs. HTML
string) keeps both platforms byte-for-byte consistent with zero duplicated
layout logic.

## What's intentionally not in this package

`ck-editor/*` and the Ant Design editor form (`AntFormItem.tsx`) from the
original `LabPrintSetup` module were template **authoring** tools, not part
of the render/print path — this package only covers rendering an
already-designed `printTemplateDesign`.

## Scripts

- `npm run build` — bundles `src/index.ts` and `src/native.tsx` with `tsup`
  (ESM + CJS + `.d.ts`).
- `npm run typecheck` — `tsc --noEmit`.
