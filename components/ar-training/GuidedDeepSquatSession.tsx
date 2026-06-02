"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ARSessionLayout } from "./ARSessionLayout";
import { useVoiceGuidance } from "@/hooks/useVoiceGuidance";
import {
  analyzeSquatForm,
  calculateSquatDepth,
  getHipCenter,
  calculateDistance,
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
  | "ready_to_start"
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

  const { speak, stop: stopVoice } = useVoiceGuidance({
    enabled: true,
    rate: 0.9,
  });

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

      // Check if we can see the person properly
      const canSeeFullBody =
        landmarks[PoseLandmark.LEFT_SHOULDER].visibility! > 0.7 &&
        landmarks[PoseLandmark.RIGHT_SHOULDER].visibility! > 0.7 &&
        landmarks[PoseLandmark.LEFT_HIP].visibility! > 0.7 &&
        landmarks[PoseLandmark.RIGHT_HIP].visibility! > 0.7 &&
        landmarks[PoseLandmark.LEFT_ANKLE].visibility! > 0.7 &&
        landmarks[PoseLandmark.RIGHT_ANKLE].visibility! > 0.7;

      // Calibration phases
      if (coachingPhase === "check_visibility") {
        if (canSeeFullBody) {
          setPositionFeedback(prev => ({ ...prev, canSeeYou: true }));
          calibrationCheckRef.current++;

          if (calibrationCheckRef.current > 10) { // Stable for ~10 frames
            speak("Great! I can see you clearly. Now let's check your distance.", "medium");
            setCoachingMessage("Checking your position...");
            setCoachingPhase("check_distance");
            calibrationCheckRef.current = 0;
          }
        } else {
          setPositionFeedback(prev => ({ ...prev, canSeeYou: false }));
          if (calibrationCheckRef.current > 30) {
            setCoachingMessage("I can't see your full body. Step back or adjust the camera");
          }
          calibrationCheckRef.current++;
        }
        return;
      }

      if (coachingPhase === "check_distance") {
        // Check if person is at good distance (shoulder width in frame should be ~0.2-0.4)
        const shoulderWidth = Math.abs(
          landmarks[PoseLandmark.RIGHT_SHOULDER].x - landmarks[PoseLandmark.LEFT_SHOULDER].x
        );

        let distanceStatus: "too_close" | "too_far" | "good" = "good";
        if (shoulderWidth > 0.45) {
          distanceStatus = "too_close";
          setCoachingMessage("You're a bit too close. Take a step back");
          setPositionFeedback(prev => ({ ...prev, distance: "too_close" }));
        } else if (shoulderWidth < 0.15) {
          distanceStatus = "too_far";
          setCoachingMessage("You're too far away. Take a step forward");
          setPositionFeedback(prev => ({ ...prev, distance: "too_far" }));
        } else {
          setPositionFeedback(prev => ({ ...prev, distance: "good" }));
          calibrationCheckRef.current++;

          if (calibrationCheckRef.current > 15) {
            speak("Perfect distance! Now let's check your stance.", "medium");
            setCoachingMessage("Checking your foot position...");
            setCoachingPhase("check_stance");
            calibrationCheckRef.current = 0;
          }
        }
        return;
      }

      if (coachingPhase === "check_stance") {
        // Check feet are shoulder-width apart
        const hipWidth = Math.abs(
          landmarks[PoseLandmark.RIGHT_HIP].x - landmarks[PoseLandmark.LEFT_HIP].x
        );
        const feetWidth = Math.abs(
          landmarks[PoseLandmark.RIGHT_ANKLE].x - landmarks[PoseLandmark.LEFT_ANKLE].x
        );

        const stanceRatio = feetWidth / hipWidth;

        if (stanceRatio < 0.9) {
          setCoachingMessage("Spread your feet wider, about shoulder-width apart");
          setPositionFeedback(prev => ({ ...prev, stance: "too_narrow" }));
          if (lastCoachingMessageRef.current !== "narrow") {
            speak("Spread your feet wider, shoulder-width apart", "medium");
            lastCoachingMessageRef.current = "narrow";
          }
        } else if (stanceRatio > 1.8) {
          setCoachingMessage("Bring your feet closer together");
          setPositionFeedback(prev => ({ ...prev, stance: "too_wide" }));
          if (lastCoachingMessageRef.current !== "wide") {
            speak("Bring your feet a bit closer", "medium");
            lastCoachingMessageRef.current = "wide";
          }
        } else {
          setPositionFeedback(prev => ({ ...prev, stance: "good" }));
          calibrationCheckRef.current++;

          if (calibrationCheckRef.current > 20) {
            speak("Excellent! You're all set. Extend your arms forward and we'll begin.", "high");
            setCoachingMessage("Raise your arms in front of you, then begin squatting when ready");
            setCoachingPhase("ready_to_start");
            calibrationCheckRef.current = 0;
          }
        }
        return;
      }

      if (coachingPhase === "ready_to_start") {
        // Check if arms are extended (wrists should be forward)
        const leftWrist = landmarks[PoseLandmark.LEFT_WRIST];
        const leftShoulder = landmarks[PoseLandmark.LEFT_SHOULDER];

        const armsExtended = leftWrist.x > leftShoulder.x + 0.1; // Wrist forward of shoulder

        if (armsExtended) {
          calibrationCheckRef.current++;
          if (calibrationCheckRef.current > 10) {
            // Start session
            setCoachingPhase("active_training");
            setCoachingMessage("Begin your squat - lower down slowly");
            speak("Perfect! Now begin your first squat. Lower down slowly.", "high");

            // Initialize session
            startARSession("deep_squat").then((result) => {
              if (result.success && result.sessionId) {
                setSessionId(result.sessionId);
              }
            });
          }
        } else {
          setCoachingMessage("Raise your arms in front of you to begin");
          calibrationCheckRef.current = 0;
        }
        return;
      }

      // Active training with real-time coaching
      if (coachingPhase === "active_training") {
        const metrics = analyzeSquatForm(landmarks);
        setFormMetrics(metrics);

        const depth = calculateSquatDepth(landmarks);

        // Squat phase detection with coaching
        let newPhase = currentPhase;
        let message = coachingMessage;

        if (currentPhase === "standing" && depth > 20) {
          newPhase = "descending";
          repStartTimeRef.current = Date.now();
          message = "Going down... keep your back straight";
          speak("Lower down slowly", "low");
        } else if (currentPhase === "descending") {
          // Check if they went back up without reaching depth
          if (depth < 10) {
            newPhase = "standing";
            message = "You didn't go deep enough. Try again!";
            speak("Go deeper on the next one", "medium");
            repStartTimeRef.current = null;
          } else if (depth < 40) {
            message = `Keep going down - ${Math.round(depth)}% depth`;
          } else if (depth < 60) {
            message = `Good progress - ${Math.round(depth)}% depth, go deeper`;
            if (lastCoachingMessageRef.current !== "halfway") {
              speak("Halfway there, keep going", "medium");
              lastCoachingMessageRef.current = "halfway";
            }
          } else if (depth < 80) {
            message = `Almost there - ${Math.round(depth)}% depth`;
          } else if (depth >= 80) {
            newPhase = "bottom";
            message = "Perfect depth! Now push back up";
            speak("Excellent depth! Now stand back up", "high");
            lastCoachingMessageRef.current = "";
          }

          // Real-time form corrections
          if (metrics.hasKneeValgus) {
            message = "⚠️ Push your knees outward!";
            if (lastCoachingMessageRef.current !== "knees") {
              speak("Push your knees out to the sides", "high");
              lastCoachingMessageRef.current = "knees";
            }
          } else if (metrics.torsoLean > 50) {
            message = "⚠️ Keep your chest up, don't lean forward too much";
            if (lastCoachingMessageRef.current !== "lean") {
              speak("Keep your chest up", "medium");
              lastCoachingMessageRef.current = "lean";
            }
          }
        } else if (currentPhase === "bottom" && depth < 70) {
          newPhase = "ascending";
          message = "Pushing up... drive through your heels";
          speak("Good, keep going up", "low");
        } else if (currentPhase === "ascending" && depth < 20) {
          newPhase = "standing";
          // Rep completed!
          completeRep(metrics, repStartTimeRef.current || Date.now());
          message = `Rep ${currentRep + 1} complete! Get ready for the next one`;
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

      // Performance feedback
      if (metrics.overallScore >= 90) {
        speak(`Rep ${newRep} complete! Outstanding form!`, "high");
      } else if (metrics.overallScore >= 80) {
        speak(`Rep ${newRep} complete! Excellent work!`, "high");
      } else if (metrics.overallScore >= 60) {
        speak(`Rep ${newRep} done. Try to go a bit deeper next time`, "medium");
      } else {
        speak(`Rep ${newRep} complete. Focus on your form`, "medium");
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
          {coachingPhase !== "active_training" && (
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
            </div>
          )}
        </div>
      </div>

      {/* MediaPipe Status Indicator */}
      <div className="absolute bottom-24 left-4 z-40 bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg border-2 border-cyan-400">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold">MediaPipe Active</span>
          </div>
          <div className="text-xs text-gray-300">
            33 landmarks tracked
          </div>
        </div>
        <div className="text-xs text-cyan-300 mt-1">
          {positionFeedback.canSeeYou ? "✓ Tracking your pose" : "⚠ Position yourself in frame"}
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
