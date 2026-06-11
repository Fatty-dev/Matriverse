"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SimpleMovementSession } from "@/components/ar-training/SimpleMovementSession";
import { SafetyScreening } from "@/components/ar-training/SafetyScreening";

export default function SimpleMovementPage() {
  const router = useRouter();
  const [showSafetyScreen, setShowSafetyScreen] = useState(true);
  const [isSafeToStart, setIsSafeToStart] = useState(false);

  const handleSafetyComplete = (isSafe: boolean) => {
    if (isSafe) {
      setIsSafeToStart(true);
      setShowSafetyScreen(false);
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/ar-trainer");
  };

  // Show safety screening first
  if (showSafetyScreen && !isSafeToStart) {
    return (
      <SafetyScreening
        onComplete={handleSafetyComplete}
        onCancel={handleCancel}
      />
    );
  }

  // Show the simple movement session after safety check passes
  return <SimpleMovementSession />;
}
