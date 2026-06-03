import { NormalizedLandmark } from "@mediapipe/tasks-vision";

/**
 * MediaPipe Pose Landmark indices
 * Reference: https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker
 */
export const PoseLandmark = {
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_PINKY: 17,
  RIGHT_PINKY: 18,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_THUMB: 21,
  RIGHT_THUMB: 22,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32,
} as const;

export type PoseLandmarkType = (typeof PoseLandmark)[keyof typeof PoseLandmark];

/**
 * Calculate the angle between three points (in degrees)
 * Used for measuring joint angles like knee, hip, elbow
 */
export function calculateAngle(
  pointA: NormalizedLandmark,
  pointB: NormalizedLandmark,
  pointC: NormalizedLandmark
): number {
  const radians =
    Math.atan2(pointC.y - pointB.y, pointC.x - pointB.x) -
    Math.atan2(pointA.y - pointB.y, pointA.x - pointB.x);

  let angle = Math.abs((radians * 180.0) / Math.PI);

  if (angle > 180.0) {
    angle = 360 - angle;
  }

  return angle;
}

/**
 * Calculate distance between two landmarks
 */
export function calculateDistance(
  pointA: NormalizedLandmark,
  pointB: NormalizedLandmark
): number {
  const dx = pointB.x - pointA.x;
  const dy = pointB.y - pointA.y;
  const dz = pointB.z - pointA.z;

  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Get the midpoint between two landmarks
 */
export function getMidpoint(
  pointA: NormalizedLandmark,
  pointB: NormalizedLandmark
): NormalizedLandmark {
  return {
    x: (pointA.x + pointB.x) / 2,
    y: (pointA.y + pointB.y) / 2,
    z: (pointA.z + pointB.z) / 2,
    visibility: Math.min(pointA.visibility || 0, pointB.visibility || 0),
  };
}

/**
 * Check if a landmark is visible enough to use
 */
export function isLandmarkVisible(
  landmark: NormalizedLandmark,
  threshold = 0.5
): boolean {
  return (landmark.visibility || 0) > threshold;
}

/** Average visibility of key full-body joints (0–1). Smoother than per-joint AND checks. */
export function getFullBodyVisibilityScore(landmarks: NormalizedLandmark[]): number {
  const joints = [
    PoseLandmark.LEFT_SHOULDER,
    PoseLandmark.RIGHT_SHOULDER,
    PoseLandmark.LEFT_HIP,
    PoseLandmark.RIGHT_HIP,
    PoseLandmark.LEFT_KNEE,
    PoseLandmark.RIGHT_KNEE,
    PoseLandmark.LEFT_ANKLE,
    PoseLandmark.RIGHT_ANKLE,
  ];
  const sum = joints.reduce((acc, idx) => acc + (landmarks[idx].visibility ?? 0), 0);
  return sum / joints.length;
}

/**
 * Get hip center point (useful for squat depth calculation)
 */
export function getHipCenter(landmarks: NormalizedLandmark[]): NormalizedLandmark {
  return getMidpoint(
    landmarks[PoseLandmark.LEFT_HIP],
    landmarks[PoseLandmark.RIGHT_HIP]
  );
}

/**
 * Get shoulder center point
 */
export function getShoulderCenter(landmarks: NormalizedLandmark[]): NormalizedLandmark {
  return getMidpoint(
    landmarks[PoseLandmark.LEFT_SHOULDER],
    landmarks[PoseLandmark.RIGHT_SHOULDER]
  );
}

/**
 * Calculate torso lean angle (for squat form checking)
 * Returns angle from vertical (0 = perfectly upright)
 */
export function calculateTorsoLean(landmarks: NormalizedLandmark[]): number {
  const hipCenter = getHipCenter(landmarks);
  const shoulderCenter = getShoulderCenter(landmarks);

  // Calculate angle from vertical
  const dx = shoulderCenter.x - hipCenter.x;
  const dy = shoulderCenter.y - hipCenter.y;

  const angleFromHorizontal = Math.atan2(dy, dx) * (180 / Math.PI);
  const angleFromVertical = Math.abs(90 - Math.abs(angleFromHorizontal));

  return angleFromVertical;
}

/**
 * Check if knees are caving inward (valgus collapse)
 * Returns true if knees are too close together relative to hips
 */
export function detectKneeValgus(landmarks: NormalizedLandmark[]): boolean {
  const leftHip = landmarks[PoseLandmark.LEFT_HIP];
  const rightHip = landmarks[PoseLandmark.RIGHT_HIP];
  const leftKnee = landmarks[PoseLandmark.LEFT_KNEE];
  const rightKnee = landmarks[PoseLandmark.RIGHT_KNEE];

  const hipWidth = Math.abs(rightHip.x - leftHip.x);
  const kneeWidth = Math.abs(rightKnee.x - leftKnee.x);

  // Knees should be at least 70% of hip width
  return kneeWidth < hipWidth * 0.7;
}

/**
 * Deep Squat specific: Calculate squat depth percentage
 * 0% = standing, 100% = hip below knee (proper deep squat)
 */
export function calculateSquatDepth(landmarks: NormalizedLandmark[]): number {
  const hipCenter = getHipCenter(landmarks);
  const leftKnee = landmarks[PoseLandmark.LEFT_KNEE];
  const rightKnee = landmarks[PoseLandmark.RIGHT_KNEE];
  const kneeCenter = getMidpoint(leftKnee, rightKnee);

  // When standing, hip is above knee (negative difference)
  // When in deep squat, hip is below knee (positive difference)
  const depthDifference = hipCenter.y - kneeCenter.y;

  // Normalize to 0-100 scale
  // Assume full depth is when hip is 0.1 units below knee
  const depthPercentage = Math.max(0, Math.min(100, (depthDifference / 0.1) * 100));

  return depthPercentage;
}

/**
 * Squat form scoring system
 */
export interface SquatFormMetrics {
  depth: number; // 0-100
  kneeAngle: number; // degrees
  hipAngle: number; // degrees
  torsoLean: number; // degrees from vertical
  hasKneeValgus: boolean;
  overallScore: number; // 0-100
  issues: string[];
}

export function analyzeSquatForm(landmarks: NormalizedLandmark[]): SquatFormMetrics {
  const issues: string[] = [];

  // Calculate key angles
  const leftKneeAngle = calculateAngle(
    landmarks[PoseLandmark.LEFT_HIP],
    landmarks[PoseLandmark.LEFT_KNEE],
    landmarks[PoseLandmark.LEFT_ANKLE]
  );

  const rightKneeAngle = calculateAngle(
    landmarks[PoseLandmark.RIGHT_HIP],
    landmarks[PoseLandmark.RIGHT_KNEE],
    landmarks[PoseLandmark.RIGHT_ANKLE]
  );

  const kneeAngle = (leftKneeAngle + rightKneeAngle) / 2;

  const leftHipAngle = calculateAngle(
    landmarks[PoseLandmark.LEFT_SHOULDER],
    landmarks[PoseLandmark.LEFT_HIP],
    landmarks[PoseLandmark.LEFT_KNEE]
  );

  const rightHipAngle = calculateAngle(
    landmarks[PoseLandmark.RIGHT_SHOULDER],
    landmarks[PoseLandmark.RIGHT_HIP],
    landmarks[PoseLandmark.RIGHT_KNEE]
  );

  const hipAngle = (leftHipAngle + rightHipAngle) / 2;

  const depth = calculateSquatDepth(landmarks);
  const torsoLean = calculateTorsoLean(landmarks);
  const hasKneeValgus = detectKneeValgus(landmarks);

  // Scoring logic
  let depthScore = 0;
  if (depth >= 80) {
    depthScore = 40; // Full points for proper depth
  } else if (depth >= 50) {
    depthScore = 30; // Partial depth
  } else if (depth >= 30) {
    depthScore = 20; // Shallow
  } else if (depth < 10) {
    depthScore = 0; // Standing
  }

  if (depth < 80 && depth > 20) {
    issues.push("Go deeper");
  }

  // Knee alignment score (30 points)
  let kneeScore = 30;
  if (hasKneeValgus) {
    kneeScore = 10;
    issues.push("Knees caving inward");
  }

  // Back posture score (20 points)
  let backScore = 20;
  if (torsoLean > 45) {
    backScore = 10;
    issues.push("Leaning too far forward");
  } else if (torsoLean > 60) {
    backScore = 0;
    issues.push("Excessive forward lean");
  }

  // Form consistency (10 points) - based on smooth angles
  let smoothScore = 10;

  const overallScore = depthScore + kneeScore + backScore + smoothScore;

  return {
    depth,
    kneeAngle,
    hipAngle,
    torsoLean,
    hasKneeValgus,
    overallScore,
    issues,
  };
}
