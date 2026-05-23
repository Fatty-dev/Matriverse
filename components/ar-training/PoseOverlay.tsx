"use client";

import { useEffect, useRef } from "react";
import type { SquatFormMetrics } from "@/lib/ar-training/pose-utils";

interface PoseOverlayProps {
  videoElement: HTMLVideoElement | null;
  formMetrics?: SquatFormMetrics;
  currentRep: number;
  className?: string;
}

export function PoseOverlay({
  videoElement,
  formMetrics,
  currentRep,
  className = "",
}: PoseOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Sync canvas size with video
  useEffect(() => {
    if (!canvasRef.current || !videoElement) return;

    const canvas = canvasRef.current;
    const updateCanvasSize = () => {
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
    };

    updateCanvasSize();
    videoElement.addEventListener("loadedmetadata", updateCanvasSize);

    return () => {
      videoElement.removeEventListener("loadedmetadata", updateCanvasSize);
    };
  }, [videoElement]);

  return (
    <div className={`relative ${className}`}>
      {/* Pose skeleton canvas - this will be drawn on by PoseDetector */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 10 }}
      />

      {/* HUD Overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 20 }}>
        {/* Top bar - Rep counter */}
        <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-lg">
          <div className="text-sm font-medium">Rep</div>
          <div className="text-3xl font-bold">{currentRep}</div>
        </div>

        {/* Form metrics panel */}
        {formMetrics && (
          <div className="absolute left-4 top-4 space-y-2">
            {/* Overall score */}
            <div className="bg-black/70 backdrop-blur-sm text-white px-4 py-3 rounded-lg min-w-[200px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Form Score</span>
                <span
                  className={`text-2xl font-bold ${
                    formMetrics.overallScore >= 80
                      ? "text-green-400"
                      : formMetrics.overallScore >= 60
                      ? "text-yellow-400"
                      : "text-red-400"
                  }`}
                >
                  {Math.round(formMetrics.overallScore)}
                </span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    formMetrics.overallScore >= 80
                      ? "bg-green-400"
                      : formMetrics.overallScore >= 60
                      ? "bg-yellow-400"
                      : "bg-red-400"
                  }`}
                  style={{ width: `${formMetrics.overallScore}%` }}
                />
              </div>
            </div>

            {/* Depth indicator */}
            <div className="bg-black/70 backdrop-blur-sm text-white px-4 py-3 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Depth</span>
                <span className="text-lg font-bold">
                  {Math.round(formMetrics.depth)}%
                </span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-mid rounded-full transition-all duration-300"
                  style={{ width: `${formMetrics.depth}%` }}
                />
              </div>
            </div>

            {/* Form issues */}
            {formMetrics.issues.length > 0 && (
              <div className="bg-red-500/90 backdrop-blur-sm text-white px-4 py-3 rounded-lg">
                <div className="text-sm font-medium mb-1">Form Issues:</div>
                <ul className="text-sm space-y-1">
                  {formMetrics.issues.map((issue, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-yellow-300">⚠</span>
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Good form indicator */}
            {formMetrics.overallScore >= 80 && formMetrics.issues.length === 0 && (
              <div className="bg-green-500/90 backdrop-blur-sm text-white px-4 py-3 rounded-lg flex items-center gap-2">
                <span className="text-2xl">✓</span>
                <span className="font-medium">Excellent Form!</span>
              </div>
            )}
          </div>
        )}

        {/* Center guide - alignment helper */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-1 h-32 bg-white/30"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border-2 border-white/30 rounded-full"></div>
        </div>

        {/* Bottom instruction bar */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white px-6 py-3 rounded-lg text-center max-w-md">
          <p className="text-sm">
            Position yourself in the center and perform a deep squat
          </p>
        </div>
      </div>
    </div>
  );
}

export const poseOverlayCanvasRef = (node: HTMLCanvasElement | null) => {
  return node;
};
