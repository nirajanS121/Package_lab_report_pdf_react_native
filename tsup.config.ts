import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    native: "src/native.tsx",
  },
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ["react", "react-test-renderer", "react-native", "react-native-webview", "expo-print", "expo-file-system"],
});
