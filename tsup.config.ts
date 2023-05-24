import { defineConfig } from "tsup";
import pkg from "./package.json";

export default defineConfig({
  name: pkg.name,
  entry: ["src/index.ts"],
  clean: true,
  dts: true,
  minify: true,
  format: ["esm", "cjs"],
  treeshake: true,
});
