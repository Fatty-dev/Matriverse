"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { PoseLandmarker, DrawingUtils } from "@mediapipe/tasks-vision";
import { getPoseLandmarker } from "@/lib/ar-training/pose-landmarker-singleton";
import { isMediapipeWasmConsoleNoise } from "@/lib/ar-training/mediapipe-errors";
import { syncOverlayCanvasToVideo } from "@/lib/ar-training/canvas-video-sync";
import { getVideoFrameCanvas } from "@/lib/ar-training/video-frame-canvas";
import type { PoseDetectionResult } from "@/types/ar-training";

interface PoseDetectorProps {
  videoElement: HTMLVideoElement | null;
  onPoseDetected?: (result: PoseDetectionResult) => void;
  onError?: (error: Error) => void;
  onReady?: () => void;
  enableDrawing?: boolean;
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
  mirrored?: boolean;
}

function runDetect(
  landmarker: PoseLandmarker,
  frameSource: HTMLCanvasElement
) {
  return landmarker.detect(frameSource);
}

export function PoseDetector({
  videoElement,
  onPoseDetected,
  onError,
  onReady,
  enableDrawing = false,
  canvasRef,
  mirrored = true,
}: PoseDetectorProps) {
  const [isReady, setIsReady] = useState(false);
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const drawingUtilsRef = useRef<DrawingUtils | null>(null);
  const activeRef = useRef(true);
  const wasmNoiseLoggedRef = useRef(false);

  const onPoseDetectedRef = useRef(onPoseDetected);
  const onErrorRef = useRef(onError);
  const onReadyRef = useRef(onReady);

  useEffect(() => {
    onPoseDetectedRef.current = onPoseDetected;
    onErrorRef.current = onError;
    onReadyRef.current = onReady;
  });

  useEffect(() => {
    activeRef.current = true;
    let cancelled = false;

    const initialize = async () => {
      try {
        const poseLandmarker = await getPoseLandmarker();
        if (cancelled) return;

        poseLandmarkerRef.current = poseLandmarker;
        setIsReady(true);
        onReadyRef.current?.();
      } catch (error) {
        if (cancelled || isMediapipeWasmConsoleNoise(error)) return;
        onErrorRef.current?.(
          error instanceof Error
            ? error
            : new Error("Failed to load pose detection. Run npm install and refresh.")
        );
      }
    };

    initialize();

    return () => {
      cancelled = true;
      activeRef.current = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      poseLandmarkerRef.current = null;
      setIsReady(false);
    };
  }, []);

  const ensureDrawingUtils = useCallback(() => {
    if (!drawingUtilsRef.current && canvasRef?.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        drawingUtilsRef.current = new DrawingUtils(ctx);
      }
    }
    return drawingUtilsRef.current;
  }, [canvasRef]);

  const detectPose = useCallback(() => {
    if (!activeRef.current) return;

    if (
      !videoElement ||
      !poseLandmarkerRef.current ||
      !isReady ||
      videoElement.readyState < 2 ||
      videoElement.videoWidth === 0 ||
      videoElement.paused ||
      videoElement.ended
    ) {
      animationFrameRef.current = requestAnimationFrame(detectPose);
      return;
    }

    let result: ReturnType<PoseLandmarker["detect"]> | null = null;

    try {
      if (enableDrawing && canvasRef?.current) {
        syncOverlayCanvasToVideo(canvasRef.current, videoElement);
      }

      const frameCanvas = getVideoFrameCanvas(videoElement, mirrored);
      result = runDetect(poseLandmarkerRef.current, frameCanvas);
    } catch (error) {
      if (isMediapipeWasmConsoleNoise(error)) {
        if (!wasmNoiseLoggedRef.current) {
          wasmNoiseLoggedRef.current = true;
          console.warn(
            "[PoseDetector] Ignoring MediaPipe dev-console noise; pose tracking continues."
          );
        }
        try {
          const frameCanvas = getVideoFrameCanvas(videoElement, mirrored);
          result = runDetect(poseLandmarkerRef.current, frameCanvas);
        } catch {
          // Still noisy in dev — skip this frame
        }
      } else if (activeRef.current) {
        onErrorRef.current?.(error as Error);
      }
    }

    if (result) {
      const timestamp = performance.now();

      if (!result.landmarks || result.landmarks.length === 0) {
        if (enableDrawing && canvasRef?.current) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "rgba(255, 165, 0, 0.85)";
            ctx.fillRect(10, 10, 280, 44);
            ctx.fillStyle = "#000";
            ctx.font = "bold 18px Arial";
            ctx.fillText("Searching for your pose...", 20, 38);
          }
        }
      } else {
        const poseResult: PoseDetectionResult = {
          landmarks: result.landmarks[0],
          worldLandmarks: result.worldLandmarks?.[0] || [],
          timestamp,
        };

        onPoseDetectedRef.current?.(poseResult);

        const drawingUtils = ensureDrawingUtils();
        if (enableDrawing && canvasRef?.current && drawingUtils) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext("2d");

          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const landmarks = result.landmarks[0];

            drawingUtils.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS, {
              color: "#00FFFF",
              lineWidth: 6,
            });

            drawingUtils.drawLandmarks(landmarks, {
              color: "#FF00FF",
              fillColor: "#FFFF00",
              lineWidth: 2,
              radius: 8,
            });
          }
        }
      }
    }

    animationFrameRef.current = requestAnimationFrame(detectPose);
  }, [videoElement, isReady, enableDrawing, canvasRef, mirrored, ensureDrawingUtils]);

  useEffect(() => {
    if (videoElement && isReady && activeRef.current) {
      animationFrameRef.current = requestAnimationFrame(detectPose);

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [videoElement, isReady, detectPose]);

  return null;
}
