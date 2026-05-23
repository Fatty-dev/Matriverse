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

type SimplePhase =
  | "welcome"
  | "position_yourself"
  | "check_feet"
  | "arms_ready"
  | "counting_down"
  | "training"
  | "complete";

export function SimpleGuidedSquat() {
  const router = useRouter();
  const [phase, setPhase] = useState<SimplePhase>("welcome");
  const [message, setMessage] = useState("Welcome! Let's get you ready");
  const [currentRep, setCurrentRep] = useState(0);
  const [squatPhase, setSquatPhase] = useState<SquatPhase>("standing");
  const [formMetrics, setFormMetrics] = useState<SquatFormMetrics | undefined>();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [reps, setReps] = useState<RepData[]>([]);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [countdown, setCountdown] = useState(3);

  const [canSeeYou, setCanSeeYou] = useState(false);
  const [feetOk, setFeetOk] = useState(false);
  const [armsOk, setArmsOk] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const repStartTimeRef = useRef<number | null>(null);
  const phaseCheckCountRef = useRef<number>(0);
  const lastMessageRef = useRef<string>("");

  const { speak } = useVoiceGuidance({ enabled: true, rate: 0.9 });

  // Phase progression
  useEffect(() => {
    if (phase === "welcome") {
      setTimeout(() => {
        speak("Welcome! Let me see you. Please step back so I can see your full body.", "high");
        setMessage("Step back so I can see your whole body");
        setPhase("position_yourself");
      }, 1000);
    }
  }, [phase, speak]);

  // Countdown logic
  useEffect(() => {
    if (phase === "counting_down" && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
        speak(countdown.toString(), "high");
      }, 1000);
      return () => clearTimeout(timer);
    } else if (phase === "counting_down" && countdown === 0) {
      speak("Begin!", "high");
      setPhase("training");
      setMessage("Squat down slowly");

      // Start session
      startARSession("deep_squat").then((result) => {
        if (result.success && result.sessionId) {
          setSessionId(result.sessionId);
        }
      });
    }
  }, [phase, countdown, speak]);

  const handlePoseDetected = useCallback(
    (result: PoseDetectionResult) => {
      const { landmarks } = result;

      // Check visibility
      const fullBodyVisible =
        landmarks[PoseLandmark.LEFT_SHOULDER].visibility! > 0.7 &&
        landmarks[PoseLandmark.RIGHT_SHOULDER].visibility! > 0.7 &&
        landmarks[PoseLandmark.LEFT_HIP].visibility! > 0.7 &&
        landmarks[PoseLandmark.RIGHT_HIP].visibility! > 0.7 &&
        landmarks[PoseLandmark.LEFT_ANKLE].visibility! > 0.7 &&
        landmarks[PoseLandmark.RIGHT_ANKLE].visibility! > 0.7;

      setCanSeeYou(fullBodyVisible);

      // PHASE: Position yourself
      if (phase === "position_yourself") {
        if (fullBodyVisible) {
          phaseCheckCountRef.current++;
          if (phaseCheckCountRef.current > 15) {
            speak("Perfect! I can see you. Now check your feet.", "medium");
            setMessage("Spread your feet shoulder-width apart");
            setPhase("check_feet");
            phaseCheckCountRef.current = 0;
          }
        } else {
          phaseCheckCountRef.current = 0;
          setMessage("Step back a bit more");
        }
        return;
      }

      // PHASE: Check feet
      if (phase === "check_feet") {
        const hipWidth = Math.abs(
          landmarks[PoseLandmark.RIGHT_HIP].x - landmarks[PoseLandmark.LEFT_HIP].x
        );
        const feetWidth = Math.abs(
          landmarks[PoseLandmark.RIGHT_ANKLE].x - landmarks[PoseLandmark.LEFT_ANKLE].x
        );
        const stanceRatio = feetWidth / hipWidth;

        if (stanceRatio >= 0.9 && stanceRatio <= 1.8) {
          setFeetOk(true);
          phaseCheckCountRef.current++;
          if (phaseCheckCountRef.current > 20) {
            speak("Good! Now raise your arms straight forward.", "medium");
            setMessage("Raise your arms straight in front of you");
            setPhase("arms_ready");
            phaseCheckCountRef.current = 0;
          }
        } else if (stanceRatio < 0.9) {
          setFeetOk(false);
          setMessage("👣 Spread your feet wider");
        } else {
          setFeetOk(false);
          setMessage("👣 Bring your feet closer together");
        }
        return;
      }

      // PHASE: Arms ready
      if (phase === "arms_ready") {
        const leftWrist = landmarks[PoseLandmark.LEFT_WRIST];
        const leftShoulder = landmarks[PoseLandmark.LEFT_SHOULDER];
        const armsForward = leftWrist.x > leftShoulder.x + 0.1;

        if (armsForward) {
          setArmsOk(true);
          phaseCheckCountRef.current++;
          if (phaseCheckCountRef.current > 10) {
            speak("Excellent! Starting in 3... 2... 1...", "high");
            setMessage("Get ready!");
            setPhase("counting_down");
            setCountdown(3);
          }
        } else {
          setArmsOk(false);
          setMessage("🙌 Raise your arms forward");
          phaseCheckCountRef.current = 0;
        }
        return;
      }

      // PHASE: Training
      if (phase === "training") {
        const metrics = analyzeSquatForm(landmarks);
        setFormMetrics(metrics);

        const depth = calculateSquatDepth(landmarks);
        let newPhase = squatPhase;
        let msg = message;

        if (squatPhase === "standing" && depth > 20) {
          newPhase = "descending";
          repStartTimeRef.current = Date.now();
          msg = "⬇️ Going down... keep going";
          speak("Go down", "low");
        } else if (squatPhase === "descending") {
          if (depth < 50) {
            msg = `⬇️ Keep going down (${Math.round(depth)}%)`;
          } else if (depth < 80) {
            msg = `⬇️ Almost there! Go deeper (${Math.round(depth)}%)`;
          } else if (depth >= 80) {
            newPhase = "bottom";
            msg = "✓ Perfect! Now stand back up";
            speak("Great depth! Come back up", "high");
          }

          // Form corrections
          if (metrics.hasKneeValgus && lastMessageRef.current !== "knees") {
            speak("Push your knees outward", "high");
            lastMessageRef.current = "knees";
          } else if (metrics.torsoLean > 50 && lastMessageRef.current !== "lean") {
            speak("Keep your chest up", "medium");
            lastMessageRef.current = "lean";
          }
        } else if (squatPhase === "bottom" && depth < 70) {
          newPhase = "ascending";
          msg = "⬆️ Coming up... push through your heels";
        } else if (squatPhase === "ascending" && depth < 20) {
          newPhase = "standing";
          completeRep(metrics, repStartTimeRef.current || Date.now());
          msg = "✓ Well done! Ready for the next one?";
          lastMessageRef.current = "";
        } else if (squatPhase === "descending" && depth < 10) {
          newPhase = "standing";
          msg = "Try to go deeper on the next one!";
          repStartTimeRef.current = null;
        }

        setSquatPhase(newPhase);
        setMessage(msg);
      }
    },
    [phase, squatPhase, message, sessionId, speak]
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

      if (metrics.overallScore >= 85) {
        speak(`Rep ${newRep}! Excellent form!`, "high");
      } else if (metrics.overallScore >= 70) {
        speak(`Rep ${newRep}! Good job!`, "high");
      } else {
        speak(`Rep ${newRep} complete`, "medium");
      }

      repStartTimeRef.current = null;
    },
    [currentRep, sessionId, speak]
  );

  const handleEndSession = useCallback(async () => {
    if (sessionId && reps.length > 0) {
      const avgScore = reps.reduce((sum, rep) => sum + (rep.formScore || 0), 0) / reps.length;
      await completeARSession(sessionId, reps.length, avgScore);
      speak(`Great work! You completed ${reps.length} squats. Well done!`, "high");

      setTimeout(() => {
        router.push("/dashboard/ar-trainer");
      }, 2500);
    } else {
      router.push("/dashboard/ar-trainer");
    }
  }, [sessionId, reps, router, speak]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900 to-pink-900 z-50">
      <div className="relative w-full h-full">
        <Camera
          onVideoReady={setVideoElement}
          className="absolute inset-0 opacity-90"
          mirrored={true}
        />

        {/* Simple overlay - no technical stuff */}
        <canvas ref={canvasRef} className="hidden" />

        {videoElement && (
          <PoseDetector
            videoElement={videoElement}
            onPoseDetected={handlePoseDetected}
            enableDrawing={false}
            canvasRef={canvasRef}
          />
        )}

        {/* Big, clear message */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 w-full max-w-3xl px-6">
          {phase === "counting_down" ? (
            <div className="text-center">
              <div className="text-[200px] font-bold text-white animate-pulse drop-shadow-2xl">
                {countdown}
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-purple-600/95 to-pink-600/95 backdrop-blur-xl px-8 py-6 rounded-3xl shadow-2xl border-4 border-white/30">
              <p className="text-4xl font-bold text-white text-center leading-tight">
                {message}
              </p>
            </div>
          )}
        </div>

        {/* Dynamic positioning feedback - no rigid shapes */}
        {phase === "position_yourself" && (
          <>
            {/* Success state - big checkmark */}
            {canSeeYou ? (
              <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                <div className="text-center">
                  <div className="w-48 h-48 rounded-full bg-green-400/30 border-8 border-green-400 flex items-center justify-center animate-pulse">
                    <span className="text-9xl">✓</span>
                  </div>
                  <div className="text-white text-5xl font-bold mt-8">Perfect!</div>
                </div>
              </div>
            ) : (
              /* Guidance arrows and indicators */
              <div className="absolute inset-0 z-30 pointer-events-none">
                {/* Directional indicators */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  {/* Step back indicator */}
                  <div className="flex flex-col items-center gap-6">
                    <div className="text-white text-7xl animate-bounce">⬆️</div>
                    <div className="text-white text-4xl font-bold bg-black/60 px-8 py-4 rounded-2xl">
                      Step Back
                    </div>
                    <div className="text-white/80 text-2xl">Move until I can see your whole body</div>
                  </div>
                </div>

                {/* Corner guides to show frame */}
                <div className="absolute top-8 left-8 w-24 h-24 border-l-8 border-t-8 border-white/50"></div>
                <div className="absolute top-8 right-8 w-24 h-24 border-r-8 border-t-8 border-white/50"></div>
                <div className="absolute bottom-8 left-8 w-24 h-24 border-l-8 border-b-8 border-white/50"></div>
                <div className="absolute bottom-8 right-8 w-24 h-24 border-r-8 border-b-8 border-white/50"></div>
              </div>
            )}
          </>
        )}

        {/* Feet guide - dynamic feedback */}
        {phase === "check_feet" && (
          <div className="absolute inset-0 z-30 pointer-events-none">
            {feetOk ? (
              /* Perfect stance */
              <div className="absolute bottom-32 left-1/2 -translate-x-1/2 text-center">
                <div className="w-32 h-32 rounded-full bg-green-400/30 border-8 border-green-400 flex items-center justify-center mb-4 animate-pulse">
                  <span className="text-7xl">✓</span>
                </div>
                <div className="text-white text-4xl font-bold">Great stance!</div>
              </div>
            ) : (
              /* Visual feet indicators with arrows */
              <div className="absolute bottom-0 left-0 right-0 flex justify-center items-end pb-12">
                <div className="relative">
                  {/* Animated arrows showing to spread */}
                  <div className="flex items-center gap-48">
                    <div className="text-center">
                      <div className="text-7xl animate-pulse">⬅️</div>
                      <div className="text-8xl mt-4">👣</div>
                    </div>
                    <div className="text-center">
                      <div className="text-7xl animate-pulse">➡️</div>
                      <div className="text-8xl mt-4">👣</div>
                    </div>
                  </div>
                  {/* Distance indicator */}
                  <div className="absolute -top-20 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <div className="text-white text-3xl font-bold bg-black/60 px-6 py-3 rounded-2xl">
                      Shoulder-width apart ↔️
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Rep counter */}
        {phase === "training" && (
          <div className="absolute top-8 right-8 z-40 bg-white/95 backdrop-blur-sm px-8 py-4 rounded-2xl shadow-2xl">
            <div className="text-sm font-semibold text-gray-600">Reps</div>
            <div className="text-6xl font-bold text-purple-600">{currentRep}</div>
          </div>
        )}

        {/* Form score during training */}
        {phase === "training" && formMetrics && (
          <div className="absolute top-8 left-8 z-40 bg-white/95 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-2xl">
            <div className="text-sm font-semibold text-gray-600 mb-2">Form</div>
            <div className={`text-5xl font-bold ${
              formMetrics.overallScore >= 80 ? 'text-green-500' :
              formMetrics.overallScore >= 60 ? 'text-yellow-500' : 'text-red-500'
            }`}>
              {Math.round(formMetrics.overallScore)}
            </div>
            <div className="mt-2 flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i < Math.round(formMetrics.overallScore / 20) ? 'bg-purple-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* End session button - always visible during training */}
        {phase === "training" && (
          <div className="absolute top-8 left-1/2 -translate-x-1/2 z-40">
            <button
              onClick={handleEndSession}
              className="flex items-center gap-3 px-6 py-3 bg-red-500/90 hover:bg-red-600 text-white text-lg font-bold rounded-full shadow-2xl transition-all backdrop-blur-sm border-2 border-white/30"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h12v12H6z" />
              </svg>
              End Session
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
