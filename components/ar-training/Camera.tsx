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
  const notifiedRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(true);

  const notifyVideoReady = useCallback(
    (video: HTMLVideoElement) => {
      if (notifiedRef.current) return;

      const deliver = () => {
        if (video.videoWidth === 0 || video.videoHeight === 0) return;
        notifiedRef.current = true;
        setIsStarting(false);
        setError(null);
        video.playsInline = true;
        video.muted = true;
        void video.play().catch(() => {});
        onVideoReady?.(video);
      };

      if (video.readyState >= 2 && video.videoWidth > 0) {
        deliver();
        return;
      }

      video.addEventListener("loadeddata", deliver, { once: true });
      video.addEventListener("loadedmetadata", deliver, { once: true });
    },
    [onVideoReady]
  );

  const handleUserMedia = useCallback(() => {
    const video = webcamRef.current?.video;
    if (video) {
      notifyVideoReady(video);
    }
  }, [notifyVideoReady]);

  // Fallback if onUserMedia does not fire (e.g. cached permission)
  useEffect(() => {
    const interval = setInterval(() => {
      const video = webcamRef.current?.video;
      if (video && !notifiedRef.current) {
        notifyVideoReady(video);
      }
    }, 250);

    return () => clearInterval(interval);
  }, [notifyVideoReady]);

  const videoConstraints = {
    facingMode,
    width: { ideal: 1280 },
    height: { ideal: 720 },
  };

  return (
    <div className={`relative ${className}`}>
      <Webcam
        ref={webcamRef}
        audio={false}
        videoConstraints={videoConstraints}
        onUserMedia={handleUserMedia}
        onUserMediaError={(err) => {
          console.error("Webcam error:", err);
          setIsStarting(false);
          const message =
            err instanceof DOMException && err.name === "NotAllowedError"
              ? "Camera access denied. Please allow camera access in your browser settings."
              : "Failed to access camera. Check that no other app is using it.";
          setError(message);
          onError?.(err instanceof Error ? err : new Error(message));
        }}
        mirrored={mirrored}
        className="w-full h-full object-cover"
        style={{ transform: mirrored ? "scaleX(-1)" : "none" }}
        playsInline
        muted
      />

      {isStarting && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-mid border-t-transparent mx-auto mb-4" />
            <p className="text-white">Starting camera...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-20">
          <div className="text-center max-w-md px-6">
            <h3 className="text-lg font-semibold text-white mb-2">Camera Access Required</h3>
            <p className="text-gray-300 mb-4">{error}</p>
            <button
              type="button"
              onClick={() => {
                notifiedRef.current = false;
                setError(null);
                setIsStarting(true);
                window.location.reload();
              }}
              className="px-6 py-3 bg-brand-mid text-white rounded-lg font-medium hover:bg-brand-dark transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {!error && !isStarting && (
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-500 text-white px-3 py-1.5 rounded-full text-sm font-medium z-10">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          Live
        </div>
      )}
    </div>
  );
}
