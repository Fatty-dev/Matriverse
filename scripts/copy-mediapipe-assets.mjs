import { cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const srcWasm = join(root, "node_modules/@mediapipe/tasks-vision/wasm");
const destWasm = join(root, "public/mediapipe/wasm");

if (!existsSync(srcWasm)) {
  console.warn("[copy-mediapipe] @mediapipe/tasks-vision not installed, skipping.");
  process.exit(0);
}

mkdirSync(dirname(destWasm), { recursive: true });
cpSync(srcWasm, destWasm, { recursive: true });
console.log("[copy-mediapipe] Copied WASM to public/mediapipe/wasm");
