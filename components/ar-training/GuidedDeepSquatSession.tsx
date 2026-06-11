"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "./Camera";
import { PoseDetector } from "./PoseDetector";
import { useVoiceGuidance } from "@/hooks/useVoiceGuidance";
import {
  analyzeSquatForm,
  calculateSquatDepth,
  PoseLandmark,
  type SquatFormMetrics,
} from "@/lib/ar-training/pose-utils";
import type { PoseDetectionResult, SquatPhase, RepData } from "@/types/ar-training";
import {
  startARSession,
  completeARSession,
  saveARRep,
} from "@/app/actions/ar-training";

export function GuidedDeepSquatSession() {
  const router = useRouter();
  const [currentRep, setCurrentRep] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<SquatPhase>("standing");
  const [formMetrics, setFormMetrics] = useState<SquatFormMetrics | undefined>();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [reps, setReps] = useState<RepData[]>([]);
  const [coachingMessage, setCoachingMessage] = useState("Position yourself so I can see your full body");
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [isPoseReady, setIsPoseReady] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [depthPercent, setDepthPercent] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const repStartTimeRef = useRef<number | null>(null);
  const lastFeedbackTimeRef = useRef<number>(0);
  const sessionStartedRef = useRef(false);

  const { speak } = useVoiceGuidance({ enabled: true, rate: 0.95 });

  // Auto-start session when component mounts
  useEffect(() => {
    if (!sessionStartedRef.current) {
      sessionStartedRef.current = true;
      speak("Welcome to deep squat training. Start squatting when ready!", "high");
      startARSession("deep_squat").then((result) => {
        if (result.success && result.sessionId) {
          setSessionId(result.sessionId);
        }
      });
    }
  }, [speak]);

  // Handle pose detection
  const handlePoseDetected = useCallback(
    (result: PoseDetectionResult) => {
      const { landmarks } = result;

      // Check if we can see the person
      const canSeeBody =
        landmarks[PoseLandmark.LEFT_SHOULDER].visibility! > 0.5 &&
        landmarks[PoseLandmark.RIGHT_SHOULDER].visibility! > 0.5 &&
        landmarks[PoseLandmark.LEFT_HIP].visibility! > 0.5 &&
        landmarks[PoseLandmark.RIGHT_HIP].visibility! > 0.5;

      setIsTracking(canSeeBody);

      if (!canSeeBody) {
        setCoachingMessage("Move back so I can see your full body");
        return;
      }

      // Analyze form and depth
      const metrics = analyzeSquatForm(landmarks);
      setFormMetrics(metrics);
      const depth = calculateSquatDepth(landmarks);
      setDepthPercent(Math.round(depth));

      const now = Date.now();
      const canSpeak = now - lastFeedbackTimeRef.current > 2000;

      // Simple squat phase detection
      let newPhase = currentPhase;
      let message = coachingMessage;

      if (currentPhase === "standing" && depth > 15) {
        newPhase = "descending";
        repStartTimeRef.current = Date.now();
        message = "Going down...";
      } else if (currentPhase === "descending") {
        if (depth < 10) {
          // Went back up without full depth
          newPhase = "standing";
          message = "Go deeper next time!";
          if (canSpeak) {
            speak("Try to go deeper", "medium");
            lastFeedbackTimeRef.current = now;
          }
        } else if (depth >= 70) {
          newPhase = "bottom";
          message = "Great depth! Now stand up!";
          if (canSpeak) {
            speak("Perfect! Stand back up", "high");
            lastFeedbackTimeRef.current = now;
          }
        } else {
          message = `Lower... ${Math.round(depth)}%`;
        }
      } else if (currentPhase === "bottom") {
        if (depth < 50) {
          newPhase = "ascending";
          message = "Push up!";
        }
      } else if (currentPhase === "ascending") {
        if (depth < 15) {
          newPhase = "standing";
          // Rep completed!
          completeRep(metrics, repStartTimeRef.current || Date.now());
          message = "Ready for next rep";
        } else {
          message = "Keep pushing up!";
        }
      }

      if (currentPhase === "standing" && depth < 10) {
        message = "Ready - start your squat!";
      }

      setCurrentPhase(newPhase);
      setCoachingMessage(message);
    },
    [currentPhase, coachingMessage, speak]
  );

  const completeRep = useCallback(
    async (metrics: SquatFormMetrics, startTime: number) => {
      const endTime = Date.now();
      const durationMs = endTime - startTime;
      const newRep = currentRep + 1;
      setCurrentRep(newRep);

      const repData: RepData = {
        repNumber: newRep,
        startTime,
        endTime,
        formScore: metrics.overallScore,
        depth: metrics.depth,
        issues: metrics.issues,
      };

      setReps((prev) => [...prev, repData]);

      if (sessionId) {
        await saveARRep(
          sessionId,
          newRep,
          metrics.overallScore,
          durationMs,
          metrics.depth,
          { issues: metrics.issues, hasKneeValgus: metrics.hasKneeValgus }
        );
      }

      speak(`Rep ${newRep}!`, "high");
      repStartTimeRef.current = null;
    },
    [currentRep, sessionId, speak]
  );

  const handleEndSession = useCallback(() => {
    setShowEndConfirm(true);
  }, []);

  const confirmEndSession = useCallback(async () => {
    setShowEndConfirm(false);

    if (sessionId && reps.length > 0) {
      const avgScore = reps.reduce((sum, rep) => sum + (rep.formScore || 0), 0) / reps.length;
      await completeARSession(sessionId, reps.length, avgScore);
      speak(`Great session! ${reps.length} reps completed.`, "high");
    } else {
      speak("Session ended.", "medium");
    }

    setTimeout(() => {
      router.push("/dashboard/ar-trainer");
    }, 1500);
  }, [sessionId, reps, router, speak]);

  const cancelEndSession = useCallback(() => {
    setShowEndConfirm(false);
  }, []);

  return (
    <div className="fixed inset-0 bg-black z-50">
      <div className="relative w-full h-full">
        {/* Camera */}
        <Camera
          onVideoReady={setVideoElement}
          className="absolute inset-0"
          mirrored={true}
        />

        {/* Pose skeleton canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ zIndex: 20 }}
        />

        {/* Pose detection */}
        {videoElement && (
          <PoseDetector
            videoElement={videoElement}
            onPoseDetected={handlePoseDetected}
            onReady={() => setIsPoseReady(true)}
            enableDrawing={true}
            canvasRef={canvasRef}
            mirrored={true}
          />
        )}

        {/* Top bar - Rep counter and End button */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-40">
          {/* Rep counter */}
          <div className="bg-white/95 backdrop-blur-sm px-5 py-3 rounded-2xl shadow-lg">
            <div className="text-sm text-gray-500 font-medium">Reps</div>
            <div className="text-3xl font-bold text-purple-600">{currentRep}</div>
          </div>

          {/* End Session button - always visible */}
          <button
            onClick={handleEndSession}
            className="flex items-center gap-2 px-5 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-2xl shadow-lg transition-all"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h12v12H6z" />
            </svg>
            End Session
          </button>
        </div>

        {/* Loading indicator */}
        {videoElement && !isPoseReady && (
          <div className="absolute top-20 right-4 z-40 bg-yellow-500/90 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            <span className="text-sm">Loading...</span>
          </div>
        )}

        {/* Coaching message and depth indicator */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-30">
          <div className="max-w-md mx-auto">
            {/* Depth progress bar */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Squat Depth</span>
                <span className="text-lg font-bold text-purple-600">{depthPercent}%</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-150 rounded-full ${
                    depthPercent >= 70 ? 'bg-green-500' : depthPercent >= 40 ? 'bg-yellow-500' : 'bg-purple-500'
                  }`}
                  style={{ width: `${Math.min(100, depthPercent)}%` }}
                />
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-400">
                <span>Standing</span>
                <span>Deep Squat</span>
              </div>
            </div>

            {/* Coaching message */}
            <div className="bg-purple-600 text-white px-6 py-4 rounded-2xl shadow-lg text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className={`w-3 h-3 rounded-full ${isTracking ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`} />
                <span className="text-xs font-medium">
                  {isTracking ? 'Tracking your movement' : 'Looking for you...'}
                </span>
              </div>
              <p className="text-xl font-semibold">{coachingMessage}</p>
            </div>
          </div>
        </div>

        {/* End Session Confirmation */}
        {showEndConfirm && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-2xl">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">End Session?</h3>
                <p className="text-gray-600 mb-6">
                  You&apos;ve completed {currentRep} reps. End this session?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={cancelEndSession}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Continue
                  </button>
                  <button
                    onClick={confirmEndSession}
                    className="flex-1 px-4 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors"
                  >
                    End Session
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
