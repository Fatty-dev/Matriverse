/**
 * MediaPipe asset paths — WASM version must match @mediapipe/tasks-vision in package-lock.
 * WASM files are copied to public/mediapipe/wasm via `npm run copy:mediapipe`.
 */
export const MEDIAPIPE_WASM_PATH = "/mediapipe/wasm";

export const POSE_LANDMARKER_MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";
