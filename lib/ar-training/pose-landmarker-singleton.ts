import { FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision";
import {
  MEDIAPIPE_WASM_PATH,
  POSE_LANDMARKER_MODEL_URL,
} from "@/lib/ar-training/mediapipe-config";
import { isMediapipeWasmConsoleNoise } from "@/lib/ar-training/mediapipe-errors";

let landmarkerPromise: Promise<PoseLandmarker> | null = null;

async function createPoseLandmarker(
  vision: Awaited<ReturnType<typeof FilesetResolver.forVisionTasks>>
): Promise<PoseLandmarker> {
  const options = {
    baseOptions: {
      modelAssetPath: POSE_LANDMARKER_MODEL_URL,
    },
    // IMAGE mode avoids VIDEO timestamp issues and plays nicer with webcam frames
    runningMode: "IMAGE" as const,
    numPoses: 1,
    minPoseDetectionConfidence: 0.5,
    minPosePresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
  };

  try {
    return await PoseLandmarker.createFromOptions(vision, {
      ...options,
      baseOptions: { ...options.baseOptions, delegate: "CPU" },
    });
  } catch {
    return await PoseLandmarker.createFromOptions(vision, {
      ...options,
      baseOptions: { ...options.baseOptions, delegate: "GPU" },
    });
  }
}

// Warmup is disabled in dev mode due to Next.js error overlay capturing TFLite WASM logs
// The first real detection will be slightly slower, but avoids the false error display
function warmupLandmarker(_landmarker: PoseLandmarker): void {
  // No-op in development - warmup triggers TFLite INFO logs that Next.js shows as errors
  if (process.env.NODE_ENV === "development") {
    return;
  }

  // In production, warmup is safe
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, 64, 64);

  try {
    _landmarker.detect(canvas);
  } catch {
    // Silently ignore warmup errors
  }
}

/**
 * One PoseLandmarker per page load. Avoids double-init under React Strict Mode.
 */
export function getPoseLandmarker(): Promise<PoseLandmarker> {
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      const vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_PATH);
      const landmarker = await createPoseLandmarker(vision);
      warmupLandmarker(landmarker);
      return landmarker;
    })();
  }
  return landmarkerPromise;
}
