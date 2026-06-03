"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ARSessionLayout } from "./ARSessionLayout";
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

type CoachingPhase =
  | "calibration_start"
  | "check_visibility"
  | "check_distance"
  | "check_stance"
  | "active_training"
  | "session_complete";

export function GuidedDeepSquatSession() {
  const router = useRouter();
  const [currentRep, setCurrentRep] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<SquatPhase>("standing");
  const [coachingPhase, setCoachingPhase] = useState<CoachingPhase>("calibration_start");
  const [formMetrics, setFormMetrics] = useState<SquatFormMetrics | undefined>();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [reps, setReps] = useState<RepData[]>([]);
  const [coachingMessage, setCoachingMessage] = useState<string>("Initializing camera...");
  const [positionFeedback, setPositionFeedback] = useState<{
    canSeeYou: boolean;
    distance: "too_close" | "too_far" | "good" | null;
    stance: "too_narrow" | "too_wide" | "good" | null;
  }>({ canSeeYou: false, distance: null, stance: null });

  const repStartTimeRef = useRef<number | null>(null);
  const lastCoachingMessageRef = useRef<string>("");
  const calibrationCheckRef = useRef<number>(0);
  const lastFeedbackTimeRef = useRef<number>(0);

  const { speak } = useVoiceGuidance({
    enabled: true,
    rate: 0.95,
  });

  // Skip calibration and go directly to active training
  const skipCalibration = useCallback(() => {
    speak("Alright, let's start! Begin your squat when ready.", "high");
    setCoachingMessage("Begin your squat - lower down slowly");
    setCoachingPhase("active_training");
    setPositionFeedback({ canSeeYou: true, distance: "good", stance: "good" });

    // Initialize session
    startARSession("deep_squat").then((result) => {
      if (result.success && result.sessionId) {
        setSessionId(result.sessionId);
      }
    });
  }, [speak]);

  // Initial welcome message
  useEffect(() => {
    if (coachingPhase === "calibration_start") {
      setTimeout(() => {
        speak("Welcome to deep squat training. Let me help you get positioned.", "high");
        setCoachingMessage("Stand in front of the camera so I can see your full body");
        setCoachingPhase("check_visibility");
      }, 1000);
    }
  }, [coachingPhase, speak]);

  // Calibration and coaching logic
  const handlePoseDetected = useCallback(
    (result: PoseDetectionResult) => {
      const { landmarks } = result;

      // Check if we can see the person properly (lowered thresholds for better detection)
      const canSeeFullBody =
        landmarks[PoseLandmark.LEFT_SHOULDER].visibility! > 0.5 &&
        landmarks[PoseLandmark.RIGHT_SHOULDER].visibility! > 0.5 &&
        landmarks[PoseLandmark.LEFT_HIP].visibility! > 0.5 &&
        landmarks[PoseLandmark.RIGHT_HIP].visibility! > 0.5 &&
        landmarks[PoseLandmark.LEFT_ANKLE].visibility! > 0.4 &&
        landmarks[PoseLandmark.RIGHT_ANKLE].visibility! > 0.4;

      // Calibration phases
      if (coachingPhase === "check_visibility") {
        if (canSeeFullBody) {
          setPositionFeedback(prev => ({ ...prev, canSeeYou: true }));
          calibrationCheckRef.current++;

          if (calibrationCheckRef.current > 8) { // Stable for ~8 frames (faster)
            speak("Great! I can see you clearly.", "medium");
            setCoachingMessage("Checking your position...");
            setCoachingPhase("check_distance");
            calibrationCheckRef.current = 0;
          }
        } else {
          setPositionFeedback(prev => ({ ...prev, canSeeYou: false }));
          calibrationCheckRef.current = 0; // Reset counter when visibility lost
          setCoachingMessage("I can't see your full body. Step back or adjust the camera");
        }
        return;
      }

      if (coachingPhase === "check_distance") {
        // Check if person is at good distance (shoulder width in frame should be ~0.15-0.5)
        const shoulderWidth = Math.abs(
          landmarks[PoseLandmark.RIGHT_SHOULDER].x - landmarks[PoseLandmark.LEFT_SHOULDER].x
        );

        if (shoulderWidth > 0.5) {
          setCoachingMessage("You're a bit too close. Take a step back");
          setPositionFeedback(prev => ({ ...prev, distance: "too_close" }));
          calibrationCheckRef.current = 0;
        } else if (shoulderWidth < 0.12) {
          setCoachingMessage("You're too far away. Take a step forward");
          setPositionFeedback(prev => ({ ...prev, distance: "too_far" }));
          calibrationCheckRef.current = 0;
        } else {
          setPositionFeedback(prev => ({ ...prev, distance: "good" }));
          calibrationCheckRef.current++;

          if (calibrationCheckRef.current > 8) {
            speak("Good distance! Checking your stance.", "medium");
            setCoachingMessage("Checking your foot position...");
            setCoachingPhase("check_stance");
            calibrationCheckRef.current = 0;
          }
        }
        return;
      }

      if (coachingPhase === "check_stance") {
        // Check feet are shoulder-width apart (more lenient)
        const hipWidth = Math.abs(
          landmarks[PoseLandmark.RIGHT_HIP].x - landmarks[PoseLandmark.LEFT_HIP].x
        );
        const feetWidth = Math.abs(
          landmarks[PoseLandmark.RIGHT_ANKLE].x - landmarks[PoseLandmark.LEFT_ANKLE].x
        );

        const stanceRatio = feetWidth / hipWidth;

        if (stanceRatio < 0.7) {
          setCoachingMessage("Spread your feet wider, about shoulder-width apart");
          setPositionFeedback(prev => ({ ...prev, stance: "too_narrow" }));
          calibrationCheckRef.current = 0;
          if (lastCoachingMessageRef.current !== "narrow") {
            speak("Feet wider apart", "medium");
            lastCoachingMessageRef.current = "narrow";
          }
        } else if (stanceRatio > 2.0) {
          setCoachingMessage("Bring your feet a bit closer together");
          setPositionFeedback(prev => ({ ...prev, stance: "too_wide" }));
          calibrationCheckRef.current = 0;
          if (lastCoachingMessageRef.current !== "wide") {
            speak("Feet a bit closer", "medium");
            lastCoachingMessageRef.current = "wide";
          }
        } else {
          setPositionFeedback(prev => ({ ...prev, stance: "good" }));
          calibrationCheckRef.current++;

          if (calibrationCheckRef.current > 10) {
            speak("You're all set! Start squatting when ready.", "high");
            setCoachingMessage("Begin your squat when ready - lower down slowly");
            setCoachingPhase("active_training");
            calibrationCheckRef.current = 0;
            lastCoachingMessageRef.current = "";

            // Initialize session
            startARSession("deep_squat").then((result) => {
              if (result.success && result.sessionId) {
                setSessionId(result.sessionId);
              }
            });
          }
        }
        return;
      }

      // Active training with real-time coaching
      if (coachingPhase === "active_training") {
        const metrics = analyzeSquatForm(landmarks);
        setFormMetrics(metrics);

        const depth = calculateSquatDepth(landmarks);
        const now = Date.now();

        // Throttle voice feedback (min 1.5s between messages)
        const canSpeak = now - lastFeedbackTimeRef.current > 1500;

        // Squat phase detection with coaching
        let newPhase = currentPhase;
        let message = coachingMessage;

        if (currentPhase === "standing" && depth > 15) {
          newPhase = "descending";
          repStartTimeRef.current = Date.now();
          message = "Going down... nice and controlled";
          if (canSpeak) {
            speak("That's it, lower down slowly", "medium");
            lastFeedbackTimeRef.current = now;
          }
        } else if (currentPhase === "descending") {
          // Check if they went back up without reaching depth
          if (depth < 8) {
            newPhase = "standing";
            message = "Not deep enough - try again, you got this!";
            if (canSpeak) {
              speak("Go a bit deeper on this one", "medium");
              lastFeedbackTimeRef.current = now;
            }
            repStartTimeRef.current = null;
            lastCoachingMessageRef.current = "";
          } else if (depth < 30) {
            message = `Keep going down... ${Math.round(depth)}%`;
          } else if (depth < 50) {
            message = `Looking good! ${Math.round(depth)}% - keep going`;
            if (lastCoachingMessageRef.current !== "progress" && canSpeak) {
              speak("Good, keep lowering", "low");
              lastCoachingMessageRef.current = "progress";
              lastFeedbackTimeRef.current = now;
            }
          } else if (depth < 70) {
            message = `Great depth! ${Math.round(depth)}% - almost there`;
            if (lastCoachingMessageRef.current !== "almost" && canSpeak) {
              speak("Almost there!", "medium");
              lastCoachingMessageRef.current = "almost";
              lastFeedbackTimeRef.current = now;
            }
          } else if (depth >= 70) {
            newPhase = "bottom";
            message = "Beautiful! Now push back up!";
            if (canSpeak) {
              speak("Perfect! Now stand back up", "high");
              lastFeedbackTimeRef.current = now;
            }
            lastCoachingMessageRef.current = "";
          }

          // Real-time form corrections (only if not already giving depth feedback)
          if (metrics.hasKneeValgus && lastCoachingMessageRef.current !== "knees") {
            message = "Push your knees outward!";
            if (canSpeak) {
              speak("Knees out!", "high");
              lastCoachingMessageRef.current = "knees";
              lastFeedbackTimeRef.current = now;
            }
          } else if (metrics.torsoLean > 45 && lastCoachingMessageRef.current !== "lean") {
            message = "Chest up! Don't lean forward";
            if (canSpeak) {
              speak("Chest up!", "medium");
              lastCoachingMessageRef.current = "lean";
              lastFeedbackTimeRef.current = now;
            }
          }
        } else if (currentPhase === "bottom") {
          if (depth < 60) {
            newPhase = "ascending";
            message = "Pushing up... drive through your heels!";
            if (canSpeak) {
              speak("Push through your heels", "low");
              lastFeedbackTimeRef.current = now;
            }
          } else {
            // Still at bottom
            message = "Hold it... now push up!";
          }
        } else if (currentPhase === "ascending") {
          if (depth < 15) {
            newPhase = "standing";
            // Rep completed!
            completeRep(metrics, repStartTimeRef.current || Date.now());
            message = `Nice! Rep ${currentRep + 1} done! Ready for the next one`;
            lastCoachingMessageRef.current = "";
          } else {
            message = `Coming up... ${100 - Math.round(depth)}% to go`;
          }
        }

        setCurrentPhase(newPhase);
        setCoachingMessage(message);
      }
    },
    [coachingPhase, currentPhase, coachingMessage, currentRep, sessionId, speak]
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

      // Save rep to database
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

      // Performance feedback with variety
      const excellentPhrases = ["Outstanding!", "Perfect form!", "That was beautiful!", "Incredible!"];
      const goodPhrases = ["Great job!", "Nice one!", "Well done!", "Looking strong!"];
      const okPhrases = ["Good effort!", "Keep it up!", "You're doing great!", "Nice work!"];

      if (metrics.overallScore >= 90) {
        const phrase = excellentPhrases[newRep % excellentPhrases.length];
        speak(`${phrase} Rep ${newRep}!`, "high");
      } else if (metrics.overallScore >= 75) {
        const phrase = goodPhrases[newRep % goodPhrases.length];
        speak(`${phrase} Rep ${newRep}!`, "high");
      } else if (metrics.overallScore >= 50) {
        const phrase = okPhrases[newRep % okPhrases.length];
        speak(`${phrase}`, "medium");
      } else {
        speak(`Rep ${newRep}. Try going deeper!`, "medium");
      }

      repStartTimeRef.current = null;
      lastCoachingMessageRef.current = "";
    },
    [currentRep, sessionId, speak]
  );

  const handleSessionEnd = useCallback(async () => {
    if (sessionId && reps.length > 0) {
      const avgScore =
        reps.reduce((sum, rep) => sum + (rep.formScore || 0), 0) / reps.length;

      await completeARSession(sessionId, reps.length, avgScore);

      speak(`Session complete! You did ${reps.length} reps with an average score of ${Math.round(avgScore)}. Great work!`, "high");

      setTimeout(() => {
        router.push("/dashboard/ar-trainer");
      }, 3000);
    } else {
      router.push("/dashboard/ar-trainer");
    }
  }, [sessionId, reps, router, speak]);

  return (
    <ARSessionLayout
      sessionType="Deep Squat Training"
      onPoseDetected={handlePoseDetected}
      onSessionEnd={handleSessionEnd}
      formMetrics={formMetrics}
      currentRep={currentRep}
    >
      {/* Coaching overlay */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 max-w-2xl w-full px-4">
        <div className="bg-gradient-to-r from-brand-mid to-brand-dark text-white px-6 py-4 rounded-2xl shadow-2xl border-2 border-white/20">
          <p className="text-xl font-semibold text-center">{coachingMessage}</p>

          {/* Calibration checklist */}
          {coachingPhase !== "active_training" && coachingPhase !== "session_complete" && (
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full ${positionFeedback.canSeeYou ? 'bg-green-400' : 'bg-gray-400'}`} />
                <span>Full body visible</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full ${positionFeedback.distance === 'good' ? 'bg-green-400' : 'bg-gray-400'}`} />
                <span>Optimal distance from camera</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full ${positionFeedback.stance === 'good' ? 'bg-green-400' : 'bg-gray-400'}`} />
                <span>Feet shoulder-width apart</span>
              </div>

              {/* Skip calibration button */}
              <button
                onClick={skipCalibration}
                className="mt-3 w-full py-2 px-4 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Skip Setup & Start Now
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Pose tracking status */}
      <div className="absolute bottom-24 left-4 z-40 bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg border-2 border-cyan-400">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${positionFeedback.canSeeYou ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`}></div>
          <span className="text-sm font-semibold">
            {positionFeedback.canSeeYou ? "Tracking Active" : "Waiting for pose"}
          </span>
        </div>
        <div className="text-xs text-cyan-300 mt-1">
          {positionFeedback.canSeeYou ? "Your pose is being tracked" : "Position yourself in frame"}
        </div>
      </div>

      {/* Instructions overlay */}
      <div className="absolute bottom-24 right-4 z-40 bg-purple-600/90 backdrop-blur-sm text-white px-4 py-3 rounded-lg max-w-xs">
        <div className="text-xs font-semibold mb-1">Look for:</div>
        <ul className="text-xs space-y-1">
          <li className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 bg-cyan-400 rounded-full"></span>
            Cyan lines = your skeleton
          </li>
          <li className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 bg-yellow-400 rounded-full"></span>
            Yellow dots = joint positions
          </li>
          <li className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 bg-green-400 rounded-full"></span>
            Labels = body part names
          </li>
        </ul>
      </div>
    </ARSessionLayout>
  );
}
