"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { VoiceGuidanceMessage } from "@/types/ar-training";

interface UseVoiceGuidanceOptions {
  enabled?: boolean;
  rate?: number; // 0.1 to 10
  pitch?: number; // 0 to 2
  volume?: number; // 0 to 1
  lang?: string;
}

export function useVoiceGuidance({
  enabled = true,
  rate = 1.0,
  pitch = 1.0,
  volume = 1.0,
  lang = "en-US",
}: UseVoiceGuidanceOptions = {}) {
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messageQueueRef = useRef<VoiceGuidanceMessage[]>([]);
  const currentMessageRef = useRef<VoiceGuidanceMessage | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const lastMessageTimeRef = useRef<number>(0);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setIsSupported(true);
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const speak = useCallback(
    (text: string, priority: "high" | "medium" | "low" = "medium") => {
      if (!enabled || !isSupported || !synthRef.current) return;

      const now = Date.now();
      const message: VoiceGuidanceMessage = { text, priority, timestamp: now };

      // High priority messages interrupt current speech
      if (priority === "high") {
        synthRef.current.cancel();
        messageQueueRef.current = [message];
        processQueue();
        return;
      }

      // Prevent spamming - don't queue if same message was spoken recently (within 3 seconds)
      if (
        currentMessageRef.current?.text === text &&
        now - lastMessageTimeRef.current < 3000
      ) {
        return;
      }

      // Add to queue
      messageQueueRef.current.push(message);

      // Start processing if not already speaking
      if (!isSpeaking) {
        processQueue();
      }
    },
    [enabled, isSupported, isSpeaking]
  );

  const processQueue = useCallback(() => {
    if (!synthRef.current || messageQueueRef.current.length === 0) {
      setIsSpeaking(false);
      currentMessageRef.current = null;
      return;
    }

    const message = messageQueueRef.current.shift()!;
    currentMessageRef.current = message;
    lastMessageTimeRef.current = message.timestamp;

    const utterance = new SpeechSynthesisUtterance(message.text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;
    utterance.lang = lang;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      // Process next message in queue after a short delay
      setTimeout(processQueue, 300);
    };

    utterance.onerror = (error) => {
      console.error("Speech synthesis error:", error);
      setIsSpeaking(false);
      currentMessageRef.current = null;
      // Try next message
      setTimeout(processQueue, 300);
    };

    synthRef.current.speak(utterance);
  }, [rate, pitch, volume, lang]);

  const stop = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      messageQueueRef.current = [];
      currentMessageRef.current = null;
      setIsSpeaking(false);
    }
  }, []);

  const pause = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.pause();
    }
  }, []);

  const resume = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.resume();
    }
  }, []);

  return {
    speak,
    stop,
    pause,
    resume,
    isSupported,
    isSpeaking,
  };
}
