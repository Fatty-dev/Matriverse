"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ARSessionLayout } from "./ARSessionLayout";
import { useVoiceGuidance } from "@/hooks/useVoiceGuidance";
import {
  analyzeSquatForm,
  calculateSquatDepth,
  type SquatFormMetrics,
} from "@/lib/ar-training/pose-utils";
import type { PoseDetectionResult, SquatPhase, RepData } from "@/types/ar-training";
import {
  startARSession,
  completeARSession,
  saveARRep,
} from "@/app/actions/ar-training";

export function DeepSquatSession() {
  const router = useRouter();
  const [currentRep, setCurrentRep] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<SquatPhase>("standing");
  const [formMetrics, setFormMetrics] = useState<SquatFormMetrics | undefined>();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [reps, setReps] = useState<RepData[]>([]);
  const [isSessionStarted, setIsSessionStarted] = useState(false);

  const repStartTimeRef = useRef<number | null>(null);
  const lastVoiceFeedbackRef = useRef<string>("");
  const voiceFeedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { speak, stop: stopVoice } = useVoiceGuidance({
    enabled: true,
    rate: 0.9,
  });

  // Initialize session
  useEffect(() => {
    if (!isSessionStarted) return;

    const initSession = async () => {
      const result = await startARSession("deep_squat");
      if (result.success && result.sessionId) {
        setSessionId(result.sessionId);
        speak("Deep squat session started. Begin when ready.", "high");
      }
    };

    initSession();

    return () => {
      stopVoice();
    };
  }, [isSessionStarted, speak, stopVoice]);

  // Handle pose detection and squat analysis
  const handlePoseDetected = useCallback(
    (result: PoseDetectionResult) => {
      if (!sessionId) {
        // Start session on first pose detection
        setIsSessionStarted(true);
        return;
      }

      const { landmarks } = result;

      // Analyze squat form
      const metrics = analyzeSquatForm(landmarks);
      setFormMetrics(metrics);

      const depth = calculateSquatDepth(landmarks);

      // Squat phase detection state machine
      let newPhase = currentPhase;

      if (currentPhase === "standing" && depth > 20) {
        newPhase = "descending";
        repStartTimeRef.current = Date.now();
      } else if (currentPhase === "descending" && depth >= 80) {
        newPhase = "bottom";
        // Good depth achieved
        if (
          lastVoiceFeedbackRef.current !== "good_depth" ||
          Date.now() - (voiceFeedbackTimeoutRef.current as any) > 5000
        ) {
          speak("Good depth", "medium");
          lastVoiceFeedbackRef.current = "good_depth";
        }
      } else if (currentPhase === "bottom" && depth < 70) {
        newPhase = "ascending";
      } else if (currentPhase === "ascending" && depth < 20) {
        newPhase = "standing";
        // Rep completed!
        completeRep(metrics, repStartTimeRef.current || Date.now());
      } else if (currentPhase === "descending" && depth < 10) {
        // Reset if they go back up without reaching depth
        newPhase = "standing";
        repStartTimeRef.current = null;
      }

      setCurrentPhase(newPhase);

      // Provide voice feedback for form issues
      if (metrics.issues.length > 0) {
        const primaryIssue = metrics.issues[0];
        if (
          lastVoiceFeedbackRef.current !== primaryIssue ||
          Date.now() - (voiceFeedbackTimeoutRef.current as any) > 5000
        ) {
          speak(primaryIssue, "low");
          lastVoiceFeedbackRef.current = primaryIssue;
          voiceFeedbackTimeoutRef.current = Date.now() as any;
        }
      }
    },
    [sessionId, currentPhase, speak]
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
          { issues: metrics.issues, hasKneeValgus: metrics.hasKneeValgus },
          undefined // We could optionally save landmark data here
        );
      }

      // Voice feedback
      speak(`Rep ${newRep} complete`, "high");

      if (metrics.overallScore >= 80) {
        speak("Excellent form!", "medium");
      } else if (metrics.overallScore >= 60) {
        speak("Good job", "medium");
      }

      repStartTimeRef.current = null;
    },
    [currentRep, sessionId, speak]
  );

  const handleSessionEnd = useCallback(async () => {
    if (sessionId && reps.length > 0) {
      const avgScore =
        reps.reduce((sum, rep) => sum + (rep.formScore || 0), 0) / reps.length;

      await completeARSession(sessionId, reps.length, avgScore);

      speak("Session complete. Great work!", "high");

      // Navigate back after a short delay
      setTimeout(() => {
        router.push("/dashboard/ar-trainer");
      }, 2000);
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
      {/* Additional exercise-specific UI can go here */}
    </ARSessionLayout>
  );
}
