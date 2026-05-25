"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui";
import { logMood, type MoodType, type MoodContext } from "@/app/actions/mood";

interface MoodCheckInProps {
  context?: MoodContext;
  onComplete?: () => void;
  isModal?: boolean;
  title?: string;
  subtitle?: string;
}

const MOOD_OPTIONS: { mood: MoodType; emoji: string; label: string; scores: number[] }[] = [
  { mood: "happy", emoji: "😊", label: "Happy", scores: [8, 9, 10] },
  { mood: "calm", emoji: "😌", label: "Calm", scores: [7, 8] },
  { mood: "neutral", emoji: "😐", label: "Neutral", scores: [5, 6] },
  { mood: "anxious", emoji: "😟", label: "Anxious", scores: [3, 4] },
  { mood: "sad", emoji: "😢", label: "Sad", scores: [2, 3] },
  { mood: "tired", emoji: "😴", label: "Tired", scores: [4, 5, 6] },
];

export function MoodCheckIn({
  context = "general",
  onComplete,
  isModal = false,
  title = "How are you feeling?",
  subtitle = "Daily Mood Check-in",
}: MoodCheckInProps) {
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [score, setScore] = useState<number>(5);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handleMoodSelect = (mood: MoodType) => {
    setSelectedMood(mood);
    const moodOption = MOOD_OPTIONS.find((m) => m.mood === mood);
    if (moodOption) {
      setScore(moodOption.scores[Math.floor(moodOption.scores.length / 2)]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedMood) return;

    setIsSubmitting(true);

    const result = await logMood(selectedMood, score, note || undefined, context);

    if (result.success) {
      setIsSuccess(true);
      setTimeout(() => {
        if (onComplete) {
          onComplete();
        } else {
          router.refresh();
        }
      }, 1500);
    }

    setIsSubmitting(false);
  };

  if (isSuccess) {
    return (
      <div className={isModal ? "" : "rounded-xl"}>
        <Card className={`${isModal ? "border-0 shadow-none" : ""} bg-gradient-to-r from-brand-mid to-brand-accent`}>
          <CardContent className="p-8">
            <div className="text-center text-white">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Mood Logged!</h2>
              <p className="opacity-80">Thanks for checking in. Take care of yourself.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={isModal ? "" : "rounded-xl"}>
      <Card className={`${isModal ? "border-0 shadow-none" : ""} bg-gradient-to-r from-brand-mid to-brand-dark`}>
        <CardContent className="p-8">
          <div className="text-center text-white">
            <p className="text-sm opacity-80 mb-2">{subtitle}</p>
            <h2 className="text-2xl font-bold mb-6">{title}</h2>

            {/* Mood Selection */}
            <div className="flex justify-center gap-3 flex-wrap mb-6">
              {MOOD_OPTIONS.map((option) => (
                <button
                  key={option.mood}
                  onClick={() => handleMoodSelect(option.mood)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all ${
                    selectedMood === option.mood
                      ? "bg-white text-brand-dark scale-105"
                      : "bg-white/10 hover:bg-white/20"
                  }`}
                >
                  <span className="text-3xl">{option.emoji}</span>
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              ))}
            </div>

            {/* Score and Note (shown after mood selection) */}
            {selectedMood && (
              <div className="space-y-4 mb-6">
                {/* Score slider */}
                <div className="bg-white/10 rounded-xl p-4">
                  <label className="block text-sm font-medium mb-3">
                    Rate your feeling (1-10): <span className="text-lg font-bold">{score}</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={score}
                    onChange={(e) => setScore(parseInt(e.target.value))}
                    className="w-full h-2 bg-white/30 rounded-lg appearance-none cursor-pointer accent-white"
                  />
                  <div className="flex justify-between text-xs opacity-60 mt-1">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                </div>

                {/* Note */}
                <div className="bg-white/10 rounded-xl p-4">
                  <label className="block text-sm font-medium mb-2">
                    Any notes? (optional)
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="How are you feeling today?"
                    className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 resize-none"
                    rows={2}
                  />
                </div>

                {/* Submit button */}
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full px-6 py-3 bg-white text-brand-dark rounded-xl font-semibold hover:bg-white/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-brand-dark border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    "Log My Mood"
                  )}
                </button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Modal wrapper for post-exercise mood check
export function MoodCheckInModal({
  isOpen,
  onClose,
  context,
  activityName,
}: {
  isOpen: boolean;
  onClose: () => void;
  context: MoodContext;
  activityName: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <MoodCheckIn
          context={context}
          onComplete={onClose}
          isModal
          title={`How do you feel after ${activityName}?`}
          subtitle="Post-Activity Check-in"
        />
        <button
          onClick={onClose}
          className="w-full mt-4 px-4 py-2 text-white/80 hover:text-white text-sm"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
