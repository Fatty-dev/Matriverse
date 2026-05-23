"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";

interface CameraProps {
  onVideoReady?: (video: HTMLVideoElement) => void;
  onError?: (error: Error) => void;
  className?: string;
  mirrored?: boolean;
  facingMode?: "user" | "environment";
}

export function Camera({
  onVideoReady,
  onError,
  className = "",
  mirrored = true,
  facingMode = "user",
}: CameraProps) {
  const webcamRef = useRef<Webcam>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Request camera permission
  const requestPermission = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      // Stop the stream immediately - webcam component will handle it
      stream.getTracks().forEach((track) => track.stop());

      setHasPermission(true);
      setIsLoading(false);
    } catch (err) {
      console.error("Camera permission denied:", err);
      setError("Camera access denied. Please grant permission to use AR training.");
      setHasPermission(false);
      setIsLoading(false);
      onError?.(err as Error);
    }
  }, [facingMode, onError]);

  // Auto-request permission on mount
  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  // Handle video ready
  const handleUserMedia = useCallback(() => {
    if (webcamRef.current?.video) {
      const video = webcamRef.current.video;

      // Wait for video to be fully loaded
      const checkVideoReady = () => {
        if (video.readyState >= 2) {
          onVideoReady?.(video);
        } else {
          setTimeout(checkVideoReady, 100);
        }
      };

      checkVideoReady();
    }
  }, [onVideoReady]);

  const videoConstraints = {
    facingMode,
    width: { ideal: 1280 },
    height: { ideal: 720 },
    aspectRatio: 16 / 9,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-black/90 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-mid border-t-transparent mx-auto mb-4"></div>
          <p className="text-white">Requesting camera access...</p>
        </div>
      </div>
    );
  }

  if (error || hasPermission === false) {
    return (
      <div className="flex items-center justify-center h-full bg-black/90 rounded-lg">
        <div className="text-center max-w-md px-6">
          <svg
            className="w-16 h-16 text-red-400 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-white mb-2">Camera Access Required</h3>
          <p className="text-gray-300 mb-4">
            {error || "Please allow camera access to use AR training features."}
          </p>
          <button
            onClick={requestPermission}
            className="px-6 py-3 bg-brand-mid text-white rounded-lg font-medium hover:bg-brand-dark transition-colors"
          >
            Grant Camera Access
          </button>
          <p className="text-sm text-gray-400 mt-4">
            Your video is processed locally and never uploaded to our servers.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <Webcam
        ref={webcamRef}
        audio={false}
        videoConstraints={videoConstraints}
        onUserMedia={handleUserMedia}
        onUserMediaError={(err) => {
          console.error("Webcam error:", err);
          setError("Failed to access camera");
          onError?.(err as Error);
        }}
        mirrored={mirrored}
        className="w-full h-full object-cover rounded-lg"
        style={{ transform: mirrored ? "scaleX(-1)" : "none" }}
      />

      {/* Privacy indicator */}
      <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-500 text-white px-3 py-1.5 rounded-full text-sm font-medium">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        Recording
      </div>
    </div>
  );
}
