"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { PoseLandmarker, FilesetResolver, DrawingUtils } from "@mediapipe/tasks-vision";
import type { PoseDetectionResult } from "@/types/ar-training";

interface PoseDetectorProps {
  videoElement: HTMLVideoElement | null;
  onPoseDetected?: (result: PoseDetectionResult) => void;
  onError?: (error: Error) => void;
  enableDrawing?: boolean;
  canvasRef?: React.RefObject<HTMLCanvasElement>;
}

export function PoseDetector({
  videoElement,
  onPoseDetected,
  onError,
  enableDrawing = false,
  canvasRef,
}: PoseDetectorProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const animationFrameRef = useRef<number>();
  const drawingUtilsRef = useRef<DrawingUtils | null>(null);

  // Initialize MediaPipe Pose Landmarker
  useEffect(() => {
    let mounted = true;

    const initializePoseLandmarker = async () => {
      try {
        setIsLoading(true);

        // Load MediaPipe vision tasks
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );

        // Create PoseLandmarker
        const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numPoses: 1,
          minPoseDetectionConfidence: 0.5,
          minPosePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        if (mounted) {
          poseLandmarkerRef.current = poseLandmarker;
          setIsReady(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Failed to initialize pose landmarker:", error);
        if (mounted) {
          setIsLoading(false);
          onError?.(error as Error);
        }
      }
    };

    initializePoseLandmarker();

    return () => {
      mounted = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      poseLandmarkerRef.current?.close();
    };
  }, [onError]);

  // Initialize drawing utils when canvas is available
  useEffect(() => {
    if (enableDrawing && canvasRef?.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        drawingUtilsRef.current = new DrawingUtils(ctx);
      }
    }
  }, [enableDrawing, canvasRef]);

  // Process video frames
  const detectPose = useCallback(() => {
    if (
      !videoElement ||
      !poseLandmarkerRef.current ||
      !isReady ||
      videoElement.readyState < 2
    ) {
      animationFrameRef.current = requestAnimationFrame(detectPose);
      return;
    }

    try {
      const timestamp = performance.now();
      const result = poseLandmarkerRef.current.detectForVideo(videoElement, timestamp);

      if (result.landmarks && result.landmarks.length > 0) {
        const poseResult: PoseDetectionResult = {
          landmarks: result.landmarks[0],
          worldLandmarks: result.worldLandmarks?.[0] || [],
          timestamp,
        };

        onPoseDetected?.(poseResult);

        // Draw pose on canvas if enabled
        if (enableDrawing && canvasRef?.current && drawingUtilsRef.current) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext("2d");

          if (ctx) {
            // Sync canvas size with video
            if (videoElement && (canvas.width !== videoElement.videoWidth || canvas.height !== videoElement.videoHeight)) {
              canvas.width = videoElement.videoWidth;
              canvas.height = videoElement.videoHeight;
            }

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const drawingUtils = drawingUtilsRef.current;
            const landmarks = result.landmarks[0];

            if (landmarks) {
              // Enable shadow/glow for better visibility
              ctx.shadowBlur = 15;
              ctx.shadowColor = "#00FFFF";

              // Draw connectors with BRIGHT visible colors and GLOW
              drawingUtils.drawConnectors(
                landmarks,
                PoseLandmarker.POSE_CONNECTIONS,
                { color: "#00FFFF", lineWidth: 12 } // Even thicker cyan lines with glow
              );

              // Reset shadow for dots
              ctx.shadowBlur = 20;
              ctx.shadowColor = "#FFFF00";

              // Draw key joint landmarks BIGGER and BRIGHTER
              drawingUtils.drawLandmarks(landmarks, {
                color: "#FF00FF",
                fillColor: "#FFFF00",
                lineWidth: 4,
                radius: 18, // Much bigger dots
              });

              // Reset shadow for text
              ctx.shadowBlur = 0;

              // Count visible landmarks
              const visibleCount = landmarks.filter(l => (l.visibility || 0) > 0.5).length;

              // Draw detection status banner at top
              ctx.fillStyle = "rgba(0, 255, 0, 0.8)";
              ctx.fillRect(10, 10, 350, 60);
              ctx.strokeStyle = "#00FF00";
              ctx.lineWidth = 3;
              ctx.strokeRect(10, 10, 350, 60);

              ctx.fillStyle = "#000000";
              ctx.font = "bold 28px Arial";
              ctx.fillText(`🟢 TRACKING ACTIVE`, 20, 40);
              ctx.font = "bold 20px Arial";
              ctx.fillText(`${visibleCount}/33 landmarks visible`, 20, 60);

              // Add labels for key body parts with bigger text
              ctx.font = "bold 32px Arial";
              ctx.textAlign = "left";

              const keyPoints = [
                { idx: 11, text: "👈 L-SHOULDER", color: "#00FF00" },
                { idx: 12, text: "R-SHOULDER 👉", color: "#00FF00" },
                { idx: 23, text: "👈 L-HIP", color: "#FFD700" },
                { idx: 24, text: "R-HIP 👉", color: "#FFD700" },
                { idx: 25, text: "👈 L-KNEE", color: "#FF6B6B" },
                { idx: 26, text: "R-KNEE 👉", color: "#FF6B6B" },
                { idx: 27, text: "👈 L-ANKLE", color: "#4ECDC4" },
                { idx: 28, text: "R-ANKLE 👉", color: "#4ECDC4" },
              ];

              keyPoints.forEach(({ idx, text, color }) => {
                const landmark = landmarks[idx];
                if (landmark && (landmark.visibility || 0) > 0.5) {
                  const x = landmark.x * canvas.width;
                  const y = landmark.y * canvas.height;

                  // Draw large circle at joint
                  ctx.beginPath();
                  ctx.arc(x, y, 25, 0, 2 * Math.PI);
                  ctx.fillStyle = color;
                  ctx.fill();
                  ctx.strokeStyle = "#FFFFFF";
                  ctx.lineWidth = 4;
                  ctx.stroke();

                  // Draw text with thick black outline for visibility
                  const textX = idx % 2 === 0 ? x - 200 : x + 30; // Left or right side
                  ctx.strokeStyle = "#000000";
                  ctx.lineWidth = 8;
                  ctx.strokeText(text, textX, y);

                  ctx.fillStyle = color;
                  ctx.fillText(text, textX, y);
                }
              });

              // Draw bounding box around person
              const xCoords = landmarks.filter(l => (l.visibility || 0) > 0.5).map(l => l.x * canvas.width);
              const yCoords = landmarks.filter(l => (l.visibility || 0) > 0.5).map(l => l.y * canvas.height);

              if (xCoords.length > 0 && yCoords.length > 0) {
                const minX = Math.min(...xCoords) - 50;
                const maxX = Math.max(...xCoords) + 50;
                const minY = Math.min(...yCoords) - 50;
                const maxY = Math.max(...yCoords) + 50;

                ctx.strokeStyle = "#00FF00";
                ctx.lineWidth = 5;
                ctx.setLineDash([20, 10]);
                ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
                ctx.setLineDash([]);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Pose detection error:", error);
      onError?.(error as Error);
    }

    animationFrameRef.current = requestAnimationFrame(detectPose);
  }, [videoElement, isReady, onPoseDetected, enableDrawing, canvasRef, onError]);

  // Start detection loop when video is ready
  useEffect(() => {
    if (videoElement && isReady) {
      animationFrameRef.current = requestAnimationFrame(detectPose);

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [videoElement, isReady, detectPose]);

  return null; // This is a headless component
}
