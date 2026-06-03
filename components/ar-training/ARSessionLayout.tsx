"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Camera } from "./Camera";
import { PoseDetector } from "./PoseDetector";
import { PoseOverlay } from "./PoseOverlay";
import type { PoseDetectionResult, SessionState, RepData } from "@/types/ar-training";
import type { SquatFormMetrics } from "@/lib/ar-training/pose-utils";

interface ARSessionLayoutProps {
  sessionType: string;
  onPoseDetected: (result: PoseDetectionResult) => void;
  onRepCompleted?: (repData: RepData) => void;
  onSessionEnd?: (sessionData: SessionState) => void;
  formMetrics?: SquatFormMetrics;
  currentRep: number;
  children?: React.ReactNode;
}

export function ARSessionLayout({
  sessionType,
  onPoseDetected,
  onRepCompleted,
  onSessionEnd,
  formMetrics,
  currentRep,
  children,
}: ARSessionLayoutProps) {
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isPoseReady, setIsPoseReady] = useState(false);
  const [poseError, setPoseError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleVideoReady = useCallback((video: HTMLVideoElement) => {
    console.log("[ARSessionLayout] Video ready:", video.videoWidth, "x", video.videoHeight);
    setVideoElement(video);
  }, []);

  const handlePoseReady = useCallback(() => {
    console.log("[ARSessionLayout] PoseDetector ready");
    setIsPoseReady(true);
  }, []);

  const handlePoseError = useCallback((error: Error) => {
    console.error("[ARSessionLayout] PoseDetector error:", error);
    setPoseError(error.message);
  }, []);

  const handleStartSession = useCallback(() => {
    setIsSessionActive(true);
    setIsPaused(false);
  }, []);

  const handlePauseSession = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  const handleEndSession = useCallback(() => {
    setShowExitConfirm(true);
  }, []);

  const confirmEndSession = useCallback(() => {
    setIsSessionActive(false);
    setShowExitConfirm(false);
    // Call parent callback if provided
    onSessionEnd?.({
      isActive: false,
      isPaused: false,
      currentRep,
      reps: [],
    });
  }, [onSessionEnd, currentRep]);

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Video + Pose Overlay */}
      <div className="relative w-full h-full">
        <Camera
          onVideoReady={handleVideoReady}
          className="absolute inset-0"
          mirrored={true}
        />

        {/* Canvas for pose skeleton - ALWAYS visible, higher z-index to ensure visibility */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ zIndex: 20 }}
        />

        {/* Pose detection - ALWAYS running when video is ready */}
        {videoElement && !isPaused && (
          <PoseDetector
            videoElement={videoElement}
            onPoseDetected={onPoseDetected}
            onReady={handlePoseReady}
            onError={handlePoseError}
            enableDrawing={true}
            canvasRef={canvasRef}
            mirrored={true}
          />
        )}

        {/* Pose detection status indicator */}
        {videoElement && !isPoseReady && !poseError && (
          <div className="absolute top-4 right-4 z-30 bg-yellow-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
            <span className="text-sm font-medium">Loading pose detection...</span>
          </div>
        )}

        {poseError && (
          <div className="absolute top-4 right-4 z-30 bg-red-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg">
            <span className="text-sm font-medium">Pose detection error: {poseError}</span>
          </div>
        )}

        {/* Visual overlay */}
        {isSessionActive && (
          <PoseOverlay
            videoElement={videoElement}
            formMetrics={formMetrics}
            currentRep={currentRep}
            className="absolute inset-0"
          />
        )}

        {/* Session controls */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-30">
          {!isSessionActive ? (
            /* Pre-session state */
            <div className="flex flex-col items-center gap-4">
              <div className="bg-black/70 backdrop-blur-sm text-white px-6 py-4 rounded-lg text-center max-w-md">
                <h2 className="text-xl font-bold mb-2">{sessionType}</h2>
                <p className="text-sm text-gray-300 mb-4">
                  Position yourself in frame and click start when ready
                </p>
              </div>
              <button
                onClick={handleStartSession}
                className="px-8 py-4 bg-brand-mid text-white rounded-full text-lg font-semibold hover:bg-brand-dark transition-all transform hover:scale-105 shadow-lg"
              >
                Start Session
              </button>
            </div>
          ) : (
            /* Active session controls */
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={handlePauseSession}
                className="p-4 bg-yellow-500/90 backdrop-blur-sm text-white rounded-full hover:bg-yellow-600 transition-colors shadow-lg"
              >
                {isPaused ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                )}
              </button>

              <button
                onClick={handleEndSession}
                className="p-4 bg-red-500/90 backdrop-blur-sm text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 6h12v12H6z" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Paused overlay */}
        {isPaused && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-40">
            <div className="bg-black/80 backdrop-blur-sm text-white px-8 py-6 rounded-lg text-center">
              <h3 className="text-2xl font-bold mb-2">Session Paused</h3>
              <p className="text-gray-300">Click play to resume</p>
            </div>
          </div>
        )}

        {/* Exit confirmation modal */}
        {showExitConfirm && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-black/90 backdrop-blur-sm text-white px-8 py-6 rounded-lg max-w-md">
              <h3 className="text-xl font-bold mb-4">End Session?</h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to end this training session? Your progress will be
                saved.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmEndSession}
                  className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  End Session
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Custom children (for exercise-specific UI) */}
        {children}
      </div>
    </div>
  );
}
