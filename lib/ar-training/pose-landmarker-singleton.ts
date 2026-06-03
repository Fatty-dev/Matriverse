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

function warmupLandmarker(landmarker: PoseLandmarker): void {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, 64, 64);

  try {
    landmarker.detect(canvas);
  } catch (error) {
    if (!isMediapipeWasmConsoleNoise(error)) {
      console.warn("[PoseLandmarker] Warmup detect failed:", error);
    }
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
