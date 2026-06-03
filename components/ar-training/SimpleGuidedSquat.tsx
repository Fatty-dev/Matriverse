"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "./Camera";
import { CalibrationOverlay } from "./CalibrationOverlay";
import { PoseDetector } from "./PoseDetector";
import { useVoiceGuidance } from "@/hooks/useVoiceGuidance";
import {
  analyzeSquatForm,
  calculateSquatDepth,
  getFullBodyVisibilityScore,
  PoseLandmark,
  type SquatFormMetrics,
} from "@/lib/ar-training/pose-utils";
import {
  getArmsPoseScore,
  getFeetGuideHint,
  isArmsPoseGood,
  isStanceGood,
  type FeetGuideHint,
} from "@/lib/ar-training/calibration-metrics";
import { StableBoolean } from "@/lib/ar-training/stable-signal";
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
  const [positionProgress, setPositionProgress] = useState(0);
  const [holdProgress, setHoldProgress] = useState(0);
  const [feetOk, setFeetOk] = useState(false);
  const [feetLockProgress, setFeetLockProgress] = useState(0);
  const [feetHoldProgress, setFeetHoldProgress] = useState(0);
  const [armsOk, setArmsOk] = useState(false);
  const [armsLockProgress, setArmsLockProgress] = useState(0);
  const [armsHoldProgress, setArmsHoldProgress] = useState(0);
  const [isPoseReady, setIsPoseReady] = useState(false);
  const [poseError, setPoseError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const repStartTimeRef = useRef<number | null>(null);
  const phaseCheckCountRef = useRef<number>(0);
  const lastMessageRef = useRef<string>("");
  const canSeeYouSignalRef = useRef(new StableBoolean(12, 8));
  const feetOkSignalRef = useRef(new StableBoolean(14, 10));
  const armsOkSignalRef = useRef(new StableBoolean(14, 10));
  const lastFeetHintRef = useRef<FeetGuideHint | null>(null);
  const lastArmsHintTierRef = useRef(0);
  const POSITION_HOLD_FRAMES = 24;
  const FEET_HOLD_FRAMES = 22;
  const ARMS_HOLD_FRAMES = 22;

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

      const visibilityScore = getFullBodyVisibilityScore(landmarks);
      const fullBodyVisible = visibilityScore >= 0.42;
      const canSeeYouStable = canSeeYouSignalRef.current.update(fullBodyVisible);
      setCanSeeYou(canSeeYouStable);
      setPositionProgress(canSeeYouSignalRef.current.getOnProgress());

      // PHASE: Position yourself
      if (phase === "position_yourself") {
        if (canSeeYouStable) {
          phaseCheckCountRef.current++;
          const holdRatio = Math.min(
            1,
            phaseCheckCountRef.current / POSITION_HOLD_FRAMES
          );
          setHoldProgress(holdRatio);
          if (holdRatio < 1) {
            setMessage(`Hold still… ${Math.round(holdRatio * 100)}%`);
          } else {
            speak("Perfect! I can see you. Now check your feet.", "medium");
            setMessage("Spread your feet shoulder-width apart");
            setPhase("check_feet");
            phaseCheckCountRef.current = 0;
            feetOkSignalRef.current.reset();
          }
        } else {
          setHoldProgress(0);
          if (!fullBodyVisible) {
            phaseCheckCountRef.current = 0;
            setMessage("Step back so I can see your whole body");
          }
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
        const stanceRatio = hipWidth > 0.01 ? feetWidth / hipWidth : 0;

        const feetStable = feetOkSignalRef.current.update(isStanceGood(stanceRatio));
        setFeetOk(feetStable);
        setFeetLockProgress(feetOkSignalRef.current.getOnProgress());

        if (feetStable) {
          phaseCheckCountRef.current++;
          const holdRatio = Math.min(1, phaseCheckCountRef.current / FEET_HOLD_FRAMES);
          setFeetHoldProgress(holdRatio);
          if (holdRatio < 1) {
            setMessage(`Great stance — hold… ${Math.round(holdRatio * 100)}%`);
          } else {
            speak("Good! Now raise your arms out in front of you.", "medium");
            setMessage("Raise your arms forward, about shoulder height");
            setPhase("arms_ready");
            phaseCheckCountRef.current = 0;
            setFeetHoldProgress(0);
            armsOkSignalRef.current.reset();
            lastFeetHintRef.current = null;
          }
        } else {
          setFeetHoldProgress(0);
          phaseCheckCountRef.current = 0;
          const hint = getFeetGuideHint(stanceRatio);
          if (hint !== lastFeetHintRef.current) {
            lastFeetHintRef.current = hint;
            if (hint === "wider") {
              setMessage("Spread your feet a little wider");
            } else if (hint === "closer") {
              setMessage("Bring your feet a little closer");
            } else {
              setMessage("Almost — adjust your stance slowly");
            }
          }
        }
        return;
      }

      // PHASE: Arms ready
      if (phase === "arms_ready") {
        const armsGood = isArmsPoseGood(landmarks);
        const armsStable = armsOkSignalRef.current.update(armsGood);
        setArmsOk(armsStable);
        setArmsLockProgress(armsOkSignalRef.current.getOnProgress());

        if (armsStable) {
          phaseCheckCountRef.current++;
          const holdRatio = Math.min(1, phaseCheckCountRef.current / ARMS_HOLD_FRAMES);
          setArmsHoldProgress(holdRatio);
          if (holdRatio < 1) {
            setMessage(`Perfect arms — hold… ${Math.round(holdRatio * 100)}%`);
          } else {
            speak("Excellent! Starting in 3... 2... 1...", "high");
            setMessage("Get ready!");
            setPhase("counting_down");
            setCountdown(3);
            phaseCheckCountRef.current = 0;
            setArmsHoldProgress(0);
          }
        } else {
          setArmsHoldProgress(0);
          phaseCheckCountRef.current = 0;
          const score = getArmsPoseScore(landmarks);
          const tier = score < 0.45 ? 1 : score < 0.7 ? 2 : 3;
          if (tier !== lastArmsHintTierRef.current) {
            lastArmsHintTierRef.current = tier;
            if (tier === 1) {
              setMessage("Raise both arms forward, about shoulder height");
            } else if (tier === 2) {
              setMessage("Straighten your arms a bit more in front of you");
            } else {
              setMessage("Almost there — keep arms forward and steady");
            }
          }
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
          msg = "Going down... keep going";
          speak("Go down", "low");
        } else if (squatPhase === "descending") {
          if (depth < 10) {
            // They went back up without reaching depth
            newPhase = "standing";
            msg = "Try to go deeper on the next one!";
            repStartTimeRef.current = null;
          } else if (depth < 50) {
            msg = `Keep going down (${Math.round(depth)}%)`;
          } else if (depth < 80) {
            msg = `Almost there! Go deeper (${Math.round(depth)}%)`;
          } else if (depth >= 80) {
            newPhase = "bottom";
            msg = "Perfect! Now stand back up";
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
          msg = "Coming up... push through your heels";
        } else if (squatPhase === "ascending" && depth < 20) {
          newPhase = "standing";
          completeRep(metrics, repStartTimeRef.current || Date.now());
          msg = "Well done! Ready for the next one?";
          lastMessageRef.current = "";
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

        {/* Canvas for pose skeleton overlay */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ zIndex: 20 }}
        />

        {videoElement && (
          <PoseDetector
            videoElement={videoElement}
            onPoseDetected={handlePoseDetected}
            onReady={() => setIsPoseReady(true)}
            onError={(err) => setPoseError(err.message)}
            enableDrawing={true}
            canvasRef={canvasRef}
            mirrored={true}
          />
        )}

        {videoElement && !isPoseReady && !poseError && (
          <div className="absolute top-4 right-4 z-50 bg-yellow-500/90 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            <span className="text-sm font-medium">Loading pose tracking...</span>
          </div>
        )}

        {poseError && (
          <div className="absolute top-4 right-4 z-50 bg-red-500/90 text-white px-4 py-2 rounded-lg max-w-sm">
            <span className="text-sm font-medium">Pose tracking: {poseError}</span>
          </div>
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
            <div className="bg-gradient-to-r from-purple-600/95 to-pink-600/95 backdrop-blur-xl px-8 py-6 rounded-3xl shadow-2xl border-4 border-white/30 transition-all duration-300">
              <p className="text-4xl font-bold text-white text-center leading-tight">
                {message}
              </p>
            </div>
          )}
        </div>

        {phase === "position_yourself" && (
          <CalibrationOverlay
            success={canSeeYou}
            successTitle="You're in frame"
            holdProgress={holdProgress}
            lockProgress={positionProgress}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-white/60 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <p className="text-white text-3xl font-bold bg-black/60 px-6 py-3 rounded-2xl">
                Step back — show your full body
              </p>
            </div>
            <div className="absolute top-8 left-8 w-20 h-20 border-l-4 border-t-4 border-white/40" />
            <div className="absolute top-8 right-8 w-20 h-20 border-r-4 border-t-4 border-white/40" />
            <div className="absolute bottom-8 left-8 w-20 h-20 border-l-4 border-b-4 border-white/40" />
            <div className="absolute bottom-8 right-8 w-20 h-20 border-r-4 border-b-4 border-white/40" />
          </CalibrationOverlay>
        )}

        {phase === "check_feet" && (
          <CalibrationOverlay
            success={feetOk}
            successTitle="Great stance!"
            holdProgress={feetHoldProgress}
            lockProgress={feetLockProgress}
          >
            <div className="absolute bottom-0 left-0 right-0 flex justify-center items-end pb-16">
              <div className="text-center">
                <div className="flex items-center justify-center gap-16 mb-6">
                  <div className="w-12 h-12 rounded-full border-3 border-white/60 flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-white/80" />
                  </div>
                  <div className="text-white text-2xl font-semibold bg-black/50 px-5 py-2 rounded-xl">
                    Shoulder-width apart
                  </div>
                  <div className="w-12 h-12 rounded-full border-3 border-white/60 flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-white/80" />
                  </div>
                </div>
                <div className="mx-auto w-48 h-1 bg-white/30 rounded-full relative">
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white" />
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/60" />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/60" />
                </div>
              </div>
            </div>
          </CalibrationOverlay>
        )}

        {phase === "arms_ready" && (
          <CalibrationOverlay
            success={armsOk}
            successTitle="Arms ready!"
            holdProgress={armsHoldProgress}
            lockProgress={armsLockProgress}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full border-4 border-white/60 flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h4m12 0h-4m-4-4v4m0 8v4M8 12h8" />
                  </svg>
                </div>
                <p className="text-white text-3xl font-bold bg-black/50 px-6 py-3 rounded-2xl">
                  Arms forward, shoulder height
                </p>
                <p className="text-white/70 text-lg mt-3">Keep a comfortable width between your hands</p>
              </div>
            </div>
          </CalibrationOverlay>
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
