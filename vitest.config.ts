import { defineConfig } from "vitest/config";
import pkg from "./package.json";

export default defineConfig({
  test: {
    name: pkg.name,
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
  },
});
