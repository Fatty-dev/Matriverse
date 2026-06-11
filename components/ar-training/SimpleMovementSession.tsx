"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "./Camera";
import { PoseDetector } from "./PoseDetector";
import { useVoiceGuidance } from "@/hooks/useVoiceGuidance";
import { PoseLandmark } from "@/lib/ar-training/pose-utils";
import type { PoseDetectionResult } from "@/types/ar-training";

type SessionPhase = "welcome" | "ready" | "exercise" | "rest" | "complete";

interface Exercise {
  name: string;
  instruction: string;
  duration: number; // seconds
  type: "hold" | "movement";
}

const SIMPLE_EXERCISES: Exercise[] = [
  {
    name: "Deep Breathing",
    instruction: "Breathe in slowly through your nose, then out through your mouth",
    duration: 30,
    type: "hold",
  },
  {
    name: "Gentle Head Rolls",
    instruction: "Slowly roll your head in a circle, first clockwise, then counter-clockwise",
    duration: 20,
    type: "movement",
  },
  {
    name: "Shoulder Shrugs",
    instruction: "Raise your shoulders up to your ears, hold, then release",
    duration: 20,
    type: "movement",
  },
  {
    name: "Seated Pelvic Tilts",
    instruction: "Sitting comfortably, tilt your pelvis forward and back gently",
    duration: 30,
    type: "movement",
  },
  {
    name: "Arm Circles",
    instruction: "Extend your arms and make small circles, then larger ones",
    duration: 20,
    type: "movement",
  },
];

export function SimpleMovementSession() {
  const router = useRouter();
  const [phase, setPhase] = useState<SessionPhase>("welcome");
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalExercisesCompleted, setTotalExercisesCompleted] = useState(0);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [isPoseReady, setIsPoseReady] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [movementScore, setMovementScore] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastPoseRef = useRef<PoseDetectionResult | null>(null);
  const movementAccumulatorRef = useRef(0);
  const { speak } = useVoiceGuidance({ enabled: true, rate: 0.9 });

  const currentExercise = SIMPLE_EXERCISES[currentExerciseIndex];

  // Start welcome phase
  useEffect(() => {
    if (phase === "welcome") {
      speak("Welcome to your simple movement session. Get comfortable and we'll begin shortly.", "high");
      setTimeout(() => {
        setPhase("ready");
        speak("Let's start with some gentle exercises. Make sure you can see yourself on screen.", "medium");
      }, 3000);
    }
  }, [phase, speak]);

  // Handle exercise timer
  useEffect(() => {
    if (phase === "exercise" && timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);

        // Halfway reminder
        if (timeRemaining === Math.floor(currentExercise.duration / 2)) {
          speak("Halfway there, keep going!", "low");
        }

        // Almost done
        if (timeRemaining === 5) {
          speak("5 seconds left", "low");
        }
      }, 1000);

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    } else if (phase === "exercise" && timeRemaining === 0) {
      // Exercise complete
      setTotalExercisesCompleted((prev) => prev + 1);
      speak("Well done!", "high");

      if (currentExerciseIndex < SIMPLE_EXERCISES.length - 1) {
        // Move to rest phase
        setPhase("rest");
        setTimeRemaining(5);
      } else {
        // All exercises complete
        setPhase("complete");
        speak(`Excellent work! You completed ${SIMPLE_EXERCISES.length} exercises. Great job!`, "high");
      }
    }
  }, [phase, timeRemaining, currentExerciseIndex, currentExercise, speak]);

  // Handle rest timer
  useEffect(() => {
    if (phase === "rest" && timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    } else if (phase === "rest" && timeRemaining === 0) {
      // Rest complete, move to next exercise
      setCurrentExerciseIndex((prev) => prev + 1);
      setPhase("ready");
    }
  }, [phase, timeRemaining]);

  // Pose detection handler - tracks movement
  const handlePoseDetected = useCallback((result: PoseDetectionResult) => {
    if (phase !== "exercise") {
      lastPoseRef.current = result;
      return;
    }

    const { landmarks } = result;

    // Calculate movement based on exercise type
    if (lastPoseRef.current) {
      const prevLandmarks = lastPoseRef.current.landmarks;
      let totalMovement = 0;

      // Track relevant body parts based on exercise
      const exerciseName = currentExercise.name.toLowerCase();

      if (exerciseName.includes("head") || exerciseName.includes("breathing")) {
        // Track head/nose movement
        const noseMove = Math.abs(landmarks[PoseLandmark.NOSE].y - prevLandmarks[PoseLandmark.NOSE].y);
        totalMovement = noseMove * 100;
      } else if (exerciseName.includes("shoulder")) {
        // Track shoulder movement
        const leftShoulderMove = Math.abs(landmarks[PoseLandmark.LEFT_SHOULDER].y - prevLandmarks[PoseLandmark.LEFT_SHOULDER].y);
        const rightShoulderMove = Math.abs(landmarks[PoseLandmark.RIGHT_SHOULDER].y - prevLandmarks[PoseLandmark.RIGHT_SHOULDER].y);
        totalMovement = (leftShoulderMove + rightShoulderMove) * 50;
      } else if (exerciseName.includes("arm") || exerciseName.includes("circle")) {
        // Track arm/wrist movement
        const leftWristMove = Math.sqrt(
          Math.pow(landmarks[PoseLandmark.LEFT_WRIST].x - prevLandmarks[PoseLandmark.LEFT_WRIST].x, 2) +
          Math.pow(landmarks[PoseLandmark.LEFT_WRIST].y - prevLandmarks[PoseLandmark.LEFT_WRIST].y, 2)
        );
        const rightWristMove = Math.sqrt(
          Math.pow(landmarks[PoseLandmark.RIGHT_WRIST].x - prevLandmarks[PoseLandmark.RIGHT_WRIST].x, 2) +
          Math.pow(landmarks[PoseLandmark.RIGHT_WRIST].y - prevLandmarks[PoseLandmark.RIGHT_WRIST].y, 2)
        );
        totalMovement = (leftWristMove + rightWristMove) * 30;
      } else if (exerciseName.includes("pelvic") || exerciseName.includes("hip")) {
        // Track hip movement
        const leftHipMove = Math.abs(landmarks[PoseLandmark.LEFT_HIP].y - prevLandmarks[PoseLandmark.LEFT_HIP].y);
        const rightHipMove = Math.abs(landmarks[PoseLandmark.RIGHT_HIP].y - prevLandmarks[PoseLandmark.RIGHT_HIP].y);
        totalMovement = (leftHipMove + rightHipMove) * 80;
      } else {
        // General body movement
        const bodyParts = [PoseLandmark.LEFT_SHOULDER, PoseLandmark.RIGHT_SHOULDER, PoseLandmark.LEFT_HIP, PoseLandmark.RIGHT_HIP];
        bodyParts.forEach(part => {
          totalMovement += Math.abs(landmarks[part].y - prevLandmarks[part].y) * 20;
        });
      }

      // Accumulate movement
      movementAccumulatorRef.current += totalMovement;

      // Detect if actively moving (threshold)
      const isCurrentlyMoving = totalMovement > 0.3;
      setIsMoving(isCurrentlyMoving);

      // Update movement score (0-100)
      const newScore = Math.min(100, movementAccumulatorRef.current);
      setMovementScore(newScore);
    }

    lastPoseRef.current = result;
  }, [phase, currentExercise]);

  const startExercise = useCallback(() => {
    setPhase("exercise");
    setTimeRemaining(currentExercise.duration);
    movementAccumulatorRef.current = 0;
    setMovementScore(0);
    speak(`Starting ${currentExercise.name}. ${currentExercise.instruction}`, "high");
  }, [currentExercise, speak]);

  const handleEndSession = useCallback(() => {
    setShowEndConfirm(true);
  }, []);

  const confirmEndSession = useCallback(() => {
    setShowEndConfirm(false);
    speak("Session ended. Great effort today!", "high");
    setTimeout(() => {
      router.push("/dashboard/ar-trainer");
    }, 1500);
  }, [router, speak]);

  const cancelEndSession = useCallback(() => {
    setShowEndConfirm(false);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, "0")}` : `${secs}s`;
  };

  const progressPercentage = ((currentExerciseIndex + (phase === "exercise" ? (currentExercise.duration - timeRemaining) / currentExercise.duration : 0)) / SIMPLE_EXERCISES.length) * 100;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900 to-pink-900 z-50">
      <div className="relative w-full h-full">
        {/* Camera view */}
        <Camera
          onVideoReady={setVideoElement}
          className="absolute inset-0 opacity-80"
          mirrored={true}
        />

        {/* Canvas for pose skeleton */}
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

        {/* Pose detection status */}
        {videoElement && !isPoseReady && (
          <div className="absolute top-16 right-4 z-40 bg-yellow-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
            <span className="text-sm font-medium">Loading pose detection...</span>
          </div>
        )}

        {/* Overlay gradient for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 pointer-events-none" />

        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-white/20">
          <div
            className="h-full bg-white transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Top bar */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-40">
          <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl">
            <span className="text-sm font-medium text-gray-600">Exercise</span>
            <span className="ml-2 text-lg font-bold text-purple-600">
              {currentExerciseIndex + 1}/{SIMPLE_EXERCISES.length}
            </span>
          </div>

          <button
            onClick={handleEndSession}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/90 hover:bg-red-600 text-white font-semibold rounded-xl shadow-lg transition-all backdrop-blur-sm"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h12v12H6z" />
            </svg>
            End Session
          </button>
        </div>

        {/* Main content area */}
        <div className="absolute inset-x-0 bottom-0 p-6">
          {/* Exercise card */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 shadow-2xl max-w-lg mx-auto">
            {phase === "welcome" && (
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
                  <svg className="w-10 h-10 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Simple Movement Session</h2>
                <p className="text-gray-600">Getting ready...</p>
              </div>
            )}

            {phase === "ready" && (
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{currentExercise.name}</h2>
                <p className="text-gray-600 mb-6">{currentExercise.instruction}</p>
                <div className="flex items-center justify-center gap-4 mb-4">
                  <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm font-medium">
                    {formatTime(currentExercise.duration)}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium capitalize">
                    {currentExercise.type}
                  </span>
                </div>
                <button
                  onClick={startExercise}
                  className="w-full px-6 py-4 bg-purple-600 text-white text-lg font-bold rounded-xl hover:bg-purple-700 transition-colors"
                >
                  Start Exercise
                </button>
              </div>
            )}

            {phase === "exercise" && (
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-800 mb-1">{currentExercise.name}</h2>
                <p className="text-gray-600 text-sm mb-4">{currentExercise.instruction}</p>
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="none"
                      stroke="#9333ea"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={351.86}
                      strokeDashoffset={351.86 * (1 - timeRemaining / currentExercise.duration)}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-bold text-purple-600">{timeRemaining}</span>
                  </div>
                </div>
                {/* Movement detection feedback */}
                <div className="mb-2">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div className={`w-3 h-3 rounded-full ${isMoving ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                    <span className={`text-sm font-medium ${isMoving ? 'text-green-600' : 'text-gray-500'}`}>
                      {isMoving ? 'Movement detected!' : 'Start moving...'}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                      style={{ width: `${movementScore}%` }}
                    />
                  </div>
                </div>
                <p className="text-purple-600 font-medium animate-pulse">Keep going!</p>
              </div>
            )}

            {phase === "rest" && (
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Great job!</h2>
                <p className="text-gray-600">Next exercise in {timeRemaining}...</p>
              </div>
            )}

            {phase === "complete" && (
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Session Complete!</h2>
                <p className="text-gray-600 mb-2">You completed {totalExercisesCompleted} exercises</p>
                <p className="text-sm text-gray-500 mb-6">Great work taking care of yourself today!</p>
                <button
                  onClick={() => router.push("/dashboard/ar-trainer")}
                  className="w-full px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors"
                >
                  Return to AR Trainer
                </button>
              </div>
            )}
          </div>
        </div>

        {/* End Session Confirmation Popup */}
        {showEndConfirm && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-2xl">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">End Session?</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to end this session? You&apos;ve completed {totalExercisesCompleted} of {SIMPLE_EXERCISES.length} exercises.
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
