import { calculateAngle, PoseLandmark } from "@/lib/ar-training/pose-utils";
import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

export type FeetGuideHint = "wider" | "closer" | "good";

export function getFeetGuideHint(stanceRatio: number): FeetGuideHint {
  if (stanceRatio < 0.82) return "wider";
  if (stanceRatio > 2.05) return "closer";
  return "good";
}

export function isStanceGood(stanceRatio: number): boolean {
  return stanceRatio >= 0.85 && stanceRatio <= 1.95;
}

export function getArmsPoseScore(landmarks: NormalizedLandmark[]): number {
  const leftAngle = calculateAngle(
    landmarks[PoseLandmark.LEFT_SHOULDER],
    landmarks[PoseLandmark.LEFT_ELBOW],
    landmarks[PoseLandmark.LEFT_WRIST]
  );
  const rightAngle = calculateAngle(
    landmarks[PoseLandmark.RIGHT_SHOULDER],
    landmarks[PoseLandmark.RIGHT_ELBOW],
    landmarks[PoseLandmark.RIGHT_WRIST]
  );

  const leftWrist = landmarks[PoseLandmark.LEFT_WRIST];
  const rightWrist = landmarks[PoseLandmark.RIGHT_WRIST];
  const leftShoulder = landmarks[PoseLandmark.LEFT_SHOULDER];
  const rightShoulder = landmarks[PoseLandmark.RIGHT_SHOULDER];

  const wristsRaised =
    leftWrist.y < leftShoulder.y + 0.18 && rightWrist.y < rightShoulder.y + 0.18;

  const wristSpan = Math.abs(rightWrist.x - leftWrist.x);
  const shoulderSpan = Math.abs(rightShoulder.x - leftShoulder.x) || 0.01;
  const armsWideEnough = wristSpan > shoulderSpan * 0.45;

  const angleScore =
    (Math.min(1, leftAngle / 130) + Math.min(1, rightAngle / 130)) / 2;

  let score = angleScore * 0.7;
  if (wristsRaised) score += 0.2;
  if (armsWideEnough) score += 0.1;

  return Math.min(1, score);
}

export function isArmsPoseGood(landmarks: NormalizedLandmark[]): boolean {
  return getArmsPoseScore(landmarks) >= 0.82;
}
