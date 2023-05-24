/// <reference types="vitest" />
import { resolve } from "path";
import { defineConfig } from "vite";
import pkg from "./package.json";

export default defineConfig({
  build: {
    lib: {
      formats: ["es", "cjs"],
      entry: resolve(__dirname, "src/index.ts"),
      fileName: "sockets",
    },
  },
  test: {
    name: pkg.name,
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
  },
});
