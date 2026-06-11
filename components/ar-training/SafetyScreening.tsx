"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui";

interface SafetyQuestion {
  id: string;
  question: string;
  description: string;
  isDangerous: boolean; // If true, selecting this will block the session
}

const SAFETY_QUESTIONS: SafetyQuestion[] = [
  {
    id: "bleeding",
    question: "Are you experiencing any vaginal bleeding?",
    description: "Any spotting or bleeding during pregnancy should be discussed with your healthcare provider.",
    isDangerous: true,
  },
  {
    id: "contractions",
    question: "Are you having regular contractions or preterm labor symptoms?",
    description: "Regular contractions before 37 weeks may indicate preterm labor.",
    isDangerous: true,
  },
  {
    id: "fluid_leak",
    question: "Have you experienced any fluid leaking from your vagina?",
    description: "This could indicate ruptured membranes and requires immediate medical attention.",
    isDangerous: true,
  },
  {
    id: "severe_pain",
    question: "Do you have severe abdominal or pelvic pain?",
    description: "Severe pain should be evaluated by your healthcare provider.",
    isDangerous: true,
  },
  {
    id: "dizziness",
    question: "Are you feeling dizzy, faint, or having severe headaches?",
    description: "These symptoms may indicate blood pressure issues and should be checked.",
    isDangerous: true,
  },
  {
    id: "reduced_movement",
    question: "Have you noticed reduced baby movement today?",
    description: "Changes in baby's movement patterns should be reported to your midwife.",
    isDangerous: true,
  },
  {
    id: "swelling",
    question: "Do you have sudden severe swelling in your face, hands, or feet?",
    description: "Sudden swelling may be a sign of pre-eclampsia.",
    isDangerous: true,
  },
  {
    id: "vision_changes",
    question: "Are you experiencing vision changes or seeing spots?",
    description: "Visual disturbances during pregnancy require immediate medical evaluation.",
    isDangerous: true,
  },
];

interface SafetyScreeningProps {
  onComplete: (isSafe: boolean) => void;
  onCancel: () => void;
}

export function SafetyScreening({ onComplete, onCancel }: SafetyScreeningProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [blocked, setBlocked] = useState(false);
  const [blockReason, setBlockReason] = useState<string>("");

  const currentQuestion = SAFETY_QUESTIONS[currentIndex];
  const progress = ((currentIndex + 1) / SAFETY_QUESTIONS.length) * 100;

  const handleAnswer = (hasSymptom: boolean) => {
    const question = SAFETY_QUESTIONS[currentIndex];

    setAnswers((prev) => ({ ...prev, [question.id]: hasSymptom }));

    // If user has a dangerous symptom, block the session
    if (hasSymptom && question.isDangerous) {
      setBlocked(true);
      setBlockReason(question.question);
      return;
    }

    // Move to next question or complete
    if (currentIndex < SAFETY_QUESTIONS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // All questions answered, user is safe to proceed
      onComplete(true);
    }
  };

  if (blocked) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-red-900 to-red-800 z-50 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full bg-white border-0 shadow-2xl">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-4">Session Blocked for Your Safety</h2>
            <p className="text-text-muted mb-4">
              Based on your response, we recommend you do not proceed with AR training at this time.
            </p>
            <div className="bg-red-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-red-700 font-medium mb-2">You indicated:</p>
              <p className="text-red-800">{blockReason}</p>
            </div>
            <div className="bg-yellow-50 rounded-xl p-4 mb-6">
              <p className="text-sm font-semibold text-yellow-800 mb-2">Please contact your healthcare provider</p>
              <p className="text-sm text-yellow-700">
                If you are experiencing any of these symptoms, please contact your midwife, doctor, or go to your nearest maternity unit immediately.
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={onCancel}
                className="w-full px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors"
              >
                Return to Dashboard
              </button>
              <p className="text-xs text-text-muted">
                Your safety and your baby's safety are our top priority.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900 to-pink-900 z-50 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full bg-white border-0 shadow-2xl">
        <CardContent className="p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-surface flex items-center justify-center">
              <svg className="w-8 h-8 text-brand-mid" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-text mb-2">Safety Check</h2>
            <p className="text-sm text-text-muted">
              Before starting your AR training session, please answer these important safety questions.
            </p>
          </div>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs text-text-muted mb-2">
              <span>Question {currentIndex + 1} of {SAFETY_QUESTIONS.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-mid transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-text mb-3">{currentQuestion.question}</h3>
            <p className="text-sm text-text-muted">{currentQuestion.description}</p>
          </div>

          {/* Answer buttons */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => handleAnswer(false)}
              className="px-6 py-4 bg-green-50 border-2 border-green-200 rounded-xl font-semibold text-green-700 hover:bg-green-100 hover:border-green-300 transition-all"
            >
              <div className="flex flex-col items-center gap-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>No</span>
              </div>
            </button>
            <button
              onClick={() => handleAnswer(true)}
              className="px-6 py-4 bg-red-50 border-2 border-red-200 rounded-xl font-semibold text-red-700 hover:bg-red-100 hover:border-red-300 transition-all"
            >
              <div className="flex flex-col items-center gap-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Yes</span>
              </div>
            </button>
          </div>

          {/* Cancel button */}
          <button
            onClick={onCancel}
            className="w-full px-4 py-2 text-text-muted hover:text-text transition-colors text-sm"
          >
            Cancel and return to dashboard
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
