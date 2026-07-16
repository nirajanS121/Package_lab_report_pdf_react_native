// Hermes/JSC (React Native's JS engines) have no MessageChannel global, which
// react-dom/server's browser build (what Metro resolves "react-dom/server" to
// on React Native) needs at module-evaluation time for its internal Fizz
// scheduler. renderToStaticMarkup is synchronous and never actually needs the
// channel to pass real messages, so a minimal stand-in is enough to satisfy
// the reference.
//
// This must be imported before "react-dom/server" anywhere in the module
// graph. Import declarations in a single file evaluate in the order they're
// written (that ordering is not affected by hoisting — hoisting only moves
// all of a file's imports ahead of its own non-import code, siblings keep
// source order), and both Metro and esbuild preserve that when bundling. So
// as long as this import is listed first whichever file imports
// "react-dom/server", the polyfill is guaranteed to exist first.
if (typeof (globalThis as any).MessageChannel === "undefined") {
  class MessageChannelPolyfill {
    port1: { onmessage: ((event: { data: any }) => void) | null };
    port2: { postMessage: (data: any) => void };
    constructor() {
      const port1: { onmessage: ((event: { data: any }) => void) | null } = { onmessage: null };
      this.port1 = port1;
      this.port2 = {
        postMessage(data: any) {
          port1.onmessage?.({ data });
        },
      };
    }
  }
  (globalThis as any).MessageChannel = MessageChannelPolyfill;
}

export {};
