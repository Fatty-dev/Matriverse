"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui";

interface StageContent {
  id: string;
  name: string;
  description: string;
  duration: string;
  sections: {
    title: string;
    content: string;
    type: "info" | "breathing" | "position" | "tips";
  }[];
  breathingExercise?: {
    name: string;
    inhale: number;
    hold?: number;
    exhale: number;
    cycles: number;
    description: string;
  };
}

const STAGE_CONTENT: Record<string, StageContent> = {
  early_labor: {
    id: "early_labor",
    name: "Early Labour",
    description: "Understanding contractions and timing",
    duration: "30 min",
    sections: [
      {
        title: "What is Early Labour?",
        content: "Early labour is the first stage where your cervix begins to dilate (open) from 0 to about 3-4 centimeters. Contractions are usually mild to moderate, lasting 30-45 seconds and occurring every 5-20 minutes. This stage can last hours or even days for first-time mothers.",
        type: "info",
      },
      {
        title: "Signs of Early Labour",
        content: "Look for: regular contractions that get stronger over time, lower back pain or cramping, a 'show' (mucus plug discharge), waters breaking (though this often happens later), and a feeling of restlessness or nesting instinct.",
        type: "info",
      },
      {
        title: "What to Do During Early Labour",
        content: "Stay calm and conserve energy. Rest when possible, eat light snacks and stay hydrated. Take a warm bath or shower for comfort. Time your contractions but don't obsess over them. Call your midwife when contractions are regular and about 5 minutes apart.",
        type: "tips",
      },
      {
        title: "Comfortable Positions",
        content: "Try upright positions like standing, walking, or sitting on a birth ball. Lean forward against a wall or partner. Rock your hips in a circular motion. These positions use gravity to help baby descend and can ease discomfort.",
        type: "position",
      },
    ],
    breathingExercise: {
      name: "Calm Breathing",
      inhale: 4,
      exhale: 6,
      cycles: 5,
      description: "Slow, deep breathing helps you stay calm and conserves energy for active labour.",
    },
  },
  active_labor: {
    id: "active_labor",
    name: "Active Labour",
    description: "Breathing techniques and positions",
    duration: "45 min",
    sections: [
      {
        title: "What is Active Labour?",
        content: "Active labour is when your cervix dilates from 4 to 7 centimeters. Contractions become stronger, longer (45-60 seconds), and closer together (3-4 minutes apart). This is when you should be at your chosen birth location.",
        type: "info",
      },
      {
        title: "Coping with Stronger Contractions",
        content: "Focus on one contraction at a time. Use breathing techniques consistently. Move between contractions and find positions that feel comfortable. Vocalize if it helps - low moans or humming can be very effective.",
        type: "tips",
      },
      {
        title: "Partner Support",
        content: "Partners can apply counter-pressure to lower back, offer sips of water between contractions, provide encouragement and reassurance, help with position changes, and keep the environment calm with dim lights and quiet voices.",
        type: "info",
      },
      {
        title: "Active Labour Positions",
        content: "Hands and knees position helps rotate baby and relieves back pain. Leaning over a birth ball or bed. Slow dancing with your partner. Squatting opens the pelvis. Side-lying for rest between contractions.",
        type: "position",
      },
    ],
    breathingExercise: {
      name: "Rhythmic Breathing",
      inhale: 3,
      exhale: 4,
      cycles: 8,
      description: "Maintain a steady rhythm during contractions. Breathe in through nose, out through mouth.",
    },
  },
  transition: {
    id: "transition",
    name: "Transition Phase",
    description: "Managing intense contractions",
    duration: "30 min",
    sections: [
      {
        title: "What is Transition?",
        content: "Transition is the most intense but shortest phase, lasting 15 minutes to an hour. Your cervix dilates from 7 to 10 centimeters. Contractions are very strong, lasting 60-90 seconds with only 1-2 minutes between them.",
        type: "info",
      },
      {
        title: "Common Feelings During Transition",
        content: "You may feel overwhelmed, shaky, nauseous, or hot and cold. Many women say 'I can't do this' during transition - this is normal and actually a sign you're almost there! You may feel pressure in your bottom as baby descends.",
        type: "info",
      },
      {
        title: "Coping Strategies",
        content: "Take it one contraction at a time - you're almost there. Focus on your breathing. Use visualization - imagine your cervix opening. Squeeze someone's hand or grip something firm. Remember: transition means you're close to meeting your baby.",
        type: "tips",
      },
      {
        title: "Support During Transition",
        content: "Partners should offer calm reassurance, help maintain breathing rhythm, provide physical comfort like cool cloths, and remind you that this phase is temporary and you're doing brilliantly.",
        type: "tips",
      },
    ],
    breathingExercise: {
      name: "Patterned Breathing",
      inhale: 2,
      exhale: 3,
      cycles: 10,
      description: "Shorter, quicker breaths help you through the most intense contractions. Focus only on this breath, this moment.",
    },
  },
  pushing: {
    id: "pushing",
    name: "Pushing Stage",
    description: "Effective pushing techniques",
    duration: "40 min",
    sections: [
      {
        title: "When to Push",
        content: "Once fully dilated, you'll feel an overwhelming urge to push - like needing to have a bowel movement. Your midwife will guide you on when to start pushing. Some women feel immediate urge; others need time for baby to descend.",
        type: "info",
      },
      {
        title: "Effective Pushing Technique",
        content: "When a contraction starts, take a deep breath. Tuck your chin to your chest. Bear down into your bottom (like you're having a bowel movement). Push for about 6-8 seconds at a time. Take another breath and repeat. Rest between contractions.",
        type: "tips",
      },
      {
        title: "Pushing Positions",
        content: "Upright positions use gravity to help: squatting, kneeling, or hands and knees. Semi-recumbent with feet supported. Side-lying can slow things down if needed. Your midwife may suggest different positions to help baby's descent.",
        type: "position",
      },
      {
        title: "What to Expect",
        content: "Pushing can take minutes to a few hours. You'll feel intense pressure and stretching. Baby's head may move forward and back (two steps forward, one step back). Your midwife will guide you to push gently as baby's head crowns to prevent tearing.",
        type: "info",
      },
    ],
    breathingExercise: {
      name: "Push Breathing",
      inhale: 4,
      hold: 6,
      exhale: 2,
      cycles: 3,
      description: "Take a deep breath, hold and push down, then release. Practice this to build muscle memory.",
    },
  },
  delivery: {
    id: "delivery",
    name: "Delivery",
    description: "Final moments and first contact",
    duration: "20 min",
    sections: [
      {
        title: "The Moment of Birth",
        content: "As your baby's head emerges, you'll feel a stretching sensation. Your midwife may ask you to stop pushing and pant while they check for the cord. One or two more pushes and your baby is born! The relief and joy at this moment is indescribable.",
        type: "info",
      },
      {
        title: "Immediate Skin-to-Skin",
        content: "Your baby will be placed directly on your chest for skin-to-skin contact. This helps regulate baby's temperature, heart rate, and breathing. It promotes bonding and helps initiate breastfeeding. Delayed cord clamping allows extra blood to reach your baby.",
        type: "info",
      },
      {
        title: "The Third Stage",
        content: "The placenta usually delivers within 30 minutes. You may have mild contractions. Your midwife will check that the placenta is complete. You may receive an injection to help the uterus contract and reduce bleeding.",
        type: "info",
      },
      {
        title: "The Golden Hour",
        content: "The first hour after birth is precious. Focus on bonding with your baby. Try breastfeeding when baby shows feeding cues. Partners can participate in skin-to-skin too. This is the beginning of your new life together as a family.",
        type: "tips",
      },
    ],
    breathingExercise: {
      name: "Recovery Breathing",
      inhale: 4,
      exhale: 6,
      cycles: 5,
      description: "Gentle, calming breaths to help you relax and bond with your newborn.",
    },
  },
};

interface LabourRehearsalSessionProps {
  stageId: string;
  onComplete: () => void;
  onCancel: () => void;
}

export function LabourRehearsalSession({ stageId, onComplete, onCancel }: LabourRehearsalSessionProps) {
  const [currentSection, setCurrentSection] = useState(0);
  const [showBreathing, setShowBreathing] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<"idle" | "inhale" | "hold" | "exhale">("idle");
  const [breathingCycle, setBreathingCycle] = useState(0);
  const [isBreathingActive, setIsBreathingActive] = useState(false);

  const stage = STAGE_CONTENT[stageId];

  if (!stage) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-brand-dark to-brand-mid z-50 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full bg-white border-0 shadow-2xl">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold text-text mb-4">Stage Not Found</h2>
            <button onClick={onCancel} className="px-6 py-3 bg-brand-mid text-white rounded-xl font-semibold">
              Return to Dashboard
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalSections = stage.sections.length + (stage.breathingExercise ? 1 : 0);
  const progress = ((currentSection + 1) / totalSections) * 100;
  const isOnBreathingSection = currentSection >= stage.sections.length && stage.breathingExercise;

  const handleNext = () => {
    if (currentSection < totalSections - 1) {
      setCurrentSection(currentSection + 1);
      setShowBreathing(false);
      setIsBreathingActive(false);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      setShowBreathing(false);
      setIsBreathingActive(false);
    }
  };

  const startBreathingExercise = () => {
    if (!stage.breathingExercise) return;
    setIsBreathingActive(true);
    setBreathingCycle(0);
    runBreathingCycle();
  };

  const runBreathingCycle = () => {
    if (!stage.breathingExercise) return;
    const { inhale, hold, exhale, cycles } = stage.breathingExercise;

    let cycleCount = 0;
    const runCycle = () => {
      if (cycleCount >= cycles) {
        setBreathingPhase("idle");
        setIsBreathingActive(false);
        return;
      }

      setBreathingCycle(cycleCount + 1);
      setBreathingPhase("inhale");

      setTimeout(() => {
        if (hold) {
          setBreathingPhase("hold");
          setTimeout(() => {
            setBreathingPhase("exhale");
            setTimeout(() => {
              cycleCount++;
              runCycle();
            }, exhale * 1000);
          }, hold * 1000);
        } else {
          setBreathingPhase("exhale");
          setTimeout(() => {
            cycleCount++;
            runCycle();
          }, exhale * 1000);
        }
      }, inhale * 1000);
    };

    runCycle();
  };

  const getSectionIcon = (type: string) => {
    switch (type) {
      case "info":
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "breathing":
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
      case "position":
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case "tips":
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 z-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full bg-white border-0 shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-brand-dark to-brand-mid text-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">{stage.name}</h2>
              <p className="text-white/70 text-sm">{stage.description}</p>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-white/70 mb-1">
              <span>Section {currentSection + 1} of {totalSections}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isOnBreathingSection && stage.breathingExercise ? (
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-brand-surface flex items-center justify-center">
                <svg className="w-10 h-10 text-brand-mid" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-text mb-2">{stage.breathingExercise.name}</h3>
              <p className="text-text-muted mb-8">{stage.breathingExercise.description}</p>

              {!isBreathingActive ? (
                <div className="space-y-4">
                  <div className="bg-brand-surface rounded-xl p-6">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-brand-mid">{stage.breathingExercise.inhale}s</p>
                        <p className="text-sm text-text-muted">Inhale</p>
                      </div>
                      {stage.breathingExercise.hold && (
                        <div>
                          <p className="text-2xl font-bold text-brand-mid">{stage.breathingExercise.hold}s</p>
                          <p className="text-sm text-text-muted">Hold</p>
                        </div>
                      )}
                      <div>
                        <p className="text-2xl font-bold text-brand-mid">{stage.breathingExercise.exhale}s</p>
                        <p className="text-sm text-text-muted">Exhale</p>
                      </div>
                    </div>
                    <p className="text-sm text-text-muted mt-4">{stage.breathingExercise.cycles} cycles</p>
                  </div>
                  <button
                    onClick={startBreathingExercise}
                    className="px-8 py-4 bg-brand-mid text-white rounded-xl font-semibold hover:bg-brand-dark transition-colors"
                  >
                    Start Breathing Exercise
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className={`w-40 h-40 mx-auto rounded-full flex items-center justify-center transition-all duration-1000 ${
                    breathingPhase === "inhale" ? "bg-blue-100 scale-125" :
                    breathingPhase === "hold" ? "bg-purple-100 scale-125" :
                    breathingPhase === "exhale" ? "bg-green-100 scale-100" :
                    "bg-gray-100"
                  }`}>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-text capitalize">{breathingPhase}</p>
                      <p className="text-sm text-text-muted">Cycle {breathingCycle} of {stage.breathingExercise.cycles}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              {stage.sections[currentSection] && (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      stage.sections[currentSection].type === "info" ? "bg-blue-100 text-blue-600" :
                      stage.sections[currentSection].type === "tips" ? "bg-yellow-100 text-yellow-600" :
                      stage.sections[currentSection].type === "position" ? "bg-green-100 text-green-600" :
                      "bg-purple-100 text-purple-600"
                    }`}>
                      {getSectionIcon(stage.sections[currentSection].type)}
                    </div>
                    <h3 className="text-xl font-bold text-text">{stage.sections[currentSection].title}</h3>
                  </div>
                  <p className="text-text-muted leading-relaxed text-lg">{stage.sections[currentSection].content}</p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 bg-gray-50 border-t px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentSection === 0}
              className="px-4 py-2 text-text-muted hover:text-text transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="flex gap-2">
              {Array.from({ length: totalSections }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === currentSection ? "bg-brand-mid" : i < currentSection ? "bg-brand-light" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-brand-mid text-white rounded-lg font-medium hover:bg-brand-dark transition-colors"
            >
              {currentSection === totalSections - 1 ? "Complete Stage" : "Next"}
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
