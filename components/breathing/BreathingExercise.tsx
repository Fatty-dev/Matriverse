"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui";
import { saveBreathingSession } from "@/app/actions/breathing";
import type { BreathingExercise } from "@/constants/breathingExercises";

interface BreathingExerciseProps {
  exercise: BreathingExercise;
  onComplete: () => void;
  onCancel: () => void;
}

type Phase = "inhale" | "hold" | "exhale" | "holdAfterExhale";

export function BreathingExerciseComponent({ exercise, onComplete, onCancel }: BreathingExerciseProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentCycle, setCurrentCycle] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<Phase>("inhale");
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioContextRef = useRef<AudioContext | null>(null);
  const previousPhaseRef = useRef<Phase | null>(null);

  // Initialize audio context
  useEffect(() => {
    if (typeof window !== "undefined") {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Play sound when phase changes
  useEffect(() => {
    if (isActive && soundEnabled && previousPhaseRef.current !== currentPhase) {
      playPhaseSound(currentPhase);
      previousPhaseRef.current = currentPhase;
    }
  }, [currentPhase, isActive, soundEnabled]);

  const playPhaseSound = (phase: Phase) => {
    if (!audioContextRef.current || !soundEnabled) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Different frequencies and patterns for each phase
    switch (phase) {
      case "inhale":
        // Ascending tone
        oscillator.frequency.setValueAtTime(440, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(550, ctx.currentTime + 0.3);
        oscillator.type = "sine";
        break;
      case "hold":
        // Sustained gentle tone
        oscillator.frequency.setValueAtTime(520, ctx.currentTime);
        oscillator.type = "sine";
        break;
      case "exhale":
        // Descending tone
        oscillator.frequency.setValueAtTime(440, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(330, ctx.currentTime + 0.3);
        oscillator.type = "sine";
        break;
      case "holdAfterExhale":
        // Low sustained tone
        oscillator.frequency.setValueAtTime(392, ctx.currentTime);
        oscillator.type = "sine";
        break;
    }

    // Smooth fade in and out
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);
  };

  const getPhaseDuration = (phase: Phase): number => {
    switch (phase) {
      case "inhale":
        return exercise.pattern.inhale;
      case "hold":
        return exercise.pattern.hold || 0;
      case "exhale":
        return exercise.pattern.exhale;
      case "holdAfterExhale":
        return exercise.pattern.holdAfterExhale || 0;
      default:
        return 0;
    }
  };

  const getNextPhase = (phase: Phase): Phase | null => {
    switch (phase) {
      case "inhale":
        return exercise.pattern.hold ? "hold" : "exhale";
      case "hold":
        return "exhale";
      case "exhale":
        return exercise.pattern.holdAfterExhale ? "holdAfterExhale" : null;
      case "holdAfterExhale":
        return null;
      default:
        return null;
    }
  };

  const getPhaseText = (phase: Phase): string => {
    switch (phase) {
      case "inhale":
        return "Breathe In";
      case "hold":
        return "Hold";
      case "exhale":
        return "Breathe Out";
      case "holdAfterExhale":
        return "Hold";
      default:
        return "";
    }
  };

  const handleComplete = useCallback(async () => {
    setIsActive(false);
    await saveBreathingSession(exercise.name, exercise.typeKey, totalTime);
    onComplete();
  }, [exercise.name, exercise.typeKey, totalTime, onComplete]);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTotalTime((prev) => prev + 1);
      setPhaseProgress((prev) => {
        const phaseDuration = getPhaseDuration(currentPhase);
        const newProgress = prev + (100 / phaseDuration);

        if (newProgress >= 100) {
          // Phase complete, move to next
          const nextPhase = getNextPhase(currentPhase);

          if (nextPhase) {
            setCurrentPhase(nextPhase);
            return 0;
          } else {
            // Cycle complete
            if (currentCycle + 1 >= exercise.cycles) {
              // Exercise complete
              handleComplete();
              return 0;
            } else {
              // Start next cycle
              setCurrentCycle((c) => c + 1);
              setCurrentPhase("inhale");
              return 0;
            }
          }
        }

        return newProgress;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, currentPhase, currentCycle, exercise.cycles, handleComplete]);

  const startExercise = () => {
    setIsActive(true);
    setCurrentCycle(0);
    setCurrentPhase("inhale");
    setPhaseProgress(0);
    setTotalTime(0);
    previousPhaseRef.current = null;
  };

  const pauseExercise = () => {
    setIsActive(false);
  };

  const resumeExercise = () => {
    setIsActive(true);
  };

  const stopExercise = () => {
    setIsActive(false);
    setCurrentCycle(0);
    setCurrentPhase("inhale");
    setPhaseProgress(0);
    setTotalTime(0);
    previousPhaseRef.current = null;
    onCancel();
  };

  const toggleSound = () => {
    setSoundEnabled((prev) => !prev);
  };

  const circleScale = currentPhase === "inhale" || currentPhase === "hold" ? 1.3 : 0.7;
  const circleOpacity = currentPhase === "hold" || currentPhase === "holdAfterExhale" ? 1 : 0.8;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white border-0 shadow-2xl">
        <CardContent className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1" />
              <h2 className="text-2xl font-bold text-text flex-1">{exercise.name}</h2>
              <div className="flex-1 flex justify-end">
                <button
                  onClick={toggleSound}
                  className={`p-2 rounded-lg transition-colors ${
                    soundEnabled
                      ? "bg-brand-surface text-brand-mid hover:bg-brand-light"
                      : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                  }`}
                  title={soundEnabled ? "Sound On" : "Sound Off"}
                >
                  {soundEnabled ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <p className="text-text-muted">{exercise.description}</p>
          </div>

          {/* Main breathing circle */}
          <div className="relative h-80 flex items-center justify-center mb-8">
            {/* Outer circle */}
            <div className="absolute w-64 h-64 rounded-full border-4 border-brand-light opacity-30" />

            {/* Animated breathing circle */}
            <div
              className="absolute w-48 h-48 rounded-full bg-gradient-to-br from-brand-mid to-brand-accent shadow-2xl transition-all duration-1000 ease-in-out flex items-center justify-center"
              style={{
                transform: `scale(${circleScale})`,
                opacity: circleOpacity,
              }}
            >
              <div className="text-center text-white">
                <p className="text-4xl font-bold mb-2">{getPhaseText(currentPhase)}</p>
                <p className="text-xl opacity-90">{Math.ceil(getPhaseDuration(currentPhase) - (phaseProgress / 100) * getPhaseDuration(currentPhase))}</p>
              </div>
            </div>

            {/* Progress ring */}
            {isActive && (
              <svg className="absolute w-72 h-72 -rotate-90">
                <circle
                  cx="144"
                  cy="144"
                  r="140"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-brand-light opacity-30"
                />
                <circle
                  cx="144"
                  cy="144"
                  r="140"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-brand-mid transition-all duration-300"
                  strokeDasharray={2 * Math.PI * 140}
                  strokeDashoffset={2 * Math.PI * 140 * (1 - phaseProgress / 100)}
                  strokeLinecap="round"
                />
              </svg>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="text-center p-4 bg-brand-surface/50 rounded-xl">
              <p className="text-sm text-text-muted mb-1">Cycle</p>
              <p className="text-2xl font-bold text-text">
                {currentCycle + 1}/{exercise.cycles}
              </p>
            </div>
            <div className="text-center p-4 bg-brand-surface/50 rounded-xl">
              <p className="text-sm text-text-muted mb-1">Time</p>
              <p className="text-2xl font-bold text-text">
                {Math.floor(totalTime / 60)}:{(totalTime % 60).toString().padStart(2, "0")}
              </p>
            </div>
            <div className="text-center p-4 bg-brand-surface/50 rounded-xl">
              <p className="text-sm text-text-muted mb-1">Progress</p>
              <p className="text-2xl font-bold text-text">
                {Math.round(((currentCycle + phaseProgress / 400) / exercise.cycles) * 100)}%
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            {!isActive && currentCycle === 0 && (
              <button
                onClick={startExercise}
                className="px-8 py-3 bg-brand-mid text-white rounded-xl font-semibold hover:bg-brand-dark transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Start Exercise
              </button>
            )}

            {!isActive && currentCycle > 0 && (
              <button
                onClick={resumeExercise}
                className="px-8 py-3 bg-brand-mid text-white rounded-xl font-semibold hover:bg-brand-dark transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                </svg>
                Resume
              </button>
            )}

            {isActive && (
              <button
                onClick={pauseExercise}
                className="px-8 py-3 bg-warning text-white rounded-xl font-semibold hover:bg-warning/80 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Pause
              </button>
            )}

            <button
              onClick={stopExercise}
              className="px-6 py-3 border border-danger text-danger rounded-xl font-semibold hover:bg-danger hover:text-white transition-colors"
            >
              Stop & Exit
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
