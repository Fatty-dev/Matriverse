/** Next.js dev can surface Emscripten stdout (TFLite INFO logs) as a TypeError. */
export function isMediapipeWasmConsoleNoise(error: unknown): boolean {
  if (error instanceof TypeError) {
    const message = error.message;
    return (
      message.includes("ByteString") ||
      message.includes("greater than 255")
    );
  }

  // Also check for TFLite INFO/log messages that Next.js surfaces as errors
  if (error instanceof Error) {
    const message = error.message;
    return (
      message.includes("INFO:") ||
      message.includes("TensorFlow Lite") ||
      message.includes("XNNPACK") ||
      message.includes("delegate for CPU") ||
      message.includes("delegate for GPU")
    );
  }

  // Check string errors
  if (typeof error === "string") {
    return (
      error.includes("INFO:") ||
      error.includes("TensorFlow Lite") ||
      error.includes("XNNPACK")
    );
  }

  return false;
}
