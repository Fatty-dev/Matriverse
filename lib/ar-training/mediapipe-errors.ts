/** Next.js dev can surface Emscripten stdout (TFLite INFO logs) as a TypeError. */
export function isMediapipeWasmConsoleNoise(error: unknown): boolean {
  if (!(error instanceof TypeError)) return false;
  const message = error.message;
  return (
    message.includes("ByteString") ||
    message.includes("greater than 255")
  );
}
