"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { VoiceGuidanceMessage } from "@/types/ar-training";

interface UseVoiceGuidanceOptions {
  enabled?: boolean;
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
}

const BENIGN_SPEECH_ERRORS = new Set(["canceled", "interrupted"]);

function isBenignSpeechError(event: SpeechSynthesisErrorEvent): boolean {
  if (BENIGN_SPEECH_ERRORS.has(event.error)) return true;
  // Some browsers fire onerror with an empty event when cancel() is called
  if (!event.error && event.type === "error") return true;
  return false;
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
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const isSpeakingRef = useRef(false);
  const lastMessageTimeRef = useRef<number>(0);
  const optionsRef = useRef({ rate, pitch, volume, lang });
  optionsRef.current = { rate, pitch, volume, lang };

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const synth = window.speechSynthesis;
    synthRef.current = synth;
    setIsSupported(true);

    const pickVoice = () => {
      const voices = synth.getVoices();
      if (voices.length === 0) return;
      voiceRef.current =
        voices.find((v) => v.lang === lang) ??
        voices.find((v) => v.lang.startsWith(lang.split("-")[0])) ??
        voices.find((v) => v.default) ??
        voices[0];
    };

    pickVoice();
    synth.addEventListener("voiceschanged", pickVoice);
    return () => synth.removeEventListener("voiceschanged", pickVoice);
  }, [lang]);

  const processQueue = useCallback(() => {
    const synth = synthRef.current;
    if (!synth || messageQueueRef.current.length === 0) {
      isSpeakingRef.current = false;
      setIsSpeaking(false);
      currentMessageRef.current = null;
      return;
    }

    // Chrome can pause the queue until resumed
    if (synth.paused) {
      synth.resume();
    }

    const message = messageQueueRef.current.shift()!;
    currentMessageRef.current = message;
    lastMessageTimeRef.current = message.timestamp;

    const { rate: r, pitch: p, volume: v, lang: l } = optionsRef.current;
    const utterance = new SpeechSynthesisUtterance(message.text);
    utterance.rate = r;
    utterance.pitch = p;
    utterance.volume = v;
    utterance.lang = l;
    if (voiceRef.current) {
      utterance.voice = voiceRef.current;
    }

    utterance.onstart = () => {
      isSpeakingRef.current = true;
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      isSpeakingRef.current = false;
      setIsSpeaking(false);
      window.setTimeout(processQueue, 280);
    };

    utterance.onerror = (event) => {
      isSpeakingRef.current = false;
      setIsSpeaking(false);
      currentMessageRef.current = null;

      if (!isBenignSpeechError(event)) {
        console.warn("[VoiceGuidance] Speech error:", event.error || "unknown");
      }

      window.setTimeout(processQueue, 280);
    };

    isSpeakingRef.current = true;
    synth.speak(utterance);
  }, []);

  const processQueueRef = useRef(processQueue);
  processQueueRef.current = processQueue;

  const speak = useCallback(
    (text: string, priority: "high" | "medium" | "low" = "medium") => {
      if (!enabled || !synthRef.current) return;

      const trimmed = text.trim();
      if (!trimmed) return;

      const now = Date.now();
      const message: VoiceGuidanceMessage = { text: trimmed, priority, timestamp: now };

      if (priority === "high") {
        synthRef.current.cancel();
        messageQueueRef.current = [message];
        isSpeakingRef.current = false;
        processQueueRef.current();
        return;
      }

      if (
        currentMessageRef.current?.text === trimmed &&
        now - lastMessageTimeRef.current < 3000
      ) {
        return;
      }

      messageQueueRef.current.push(message);

      if (!isSpeakingRef.current) {
        processQueueRef.current();
      }
    },
    [enabled]
  );

  const stop = useCallback(() => {
    const synth = synthRef.current;
    if (!synth) return;
    synth.cancel();
    messageQueueRef.current = [];
    currentMessageRef.current = null;
    isSpeakingRef.current = false;
    setIsSpeaking(false);
  }, []);

  const pause = useCallback(() => {
    synthRef.current?.pause();
  }, []);

  const resume = useCallback(() => {
    synthRef.current?.resume();
  }, []);

  useEffect(() => () => stop(), [stop]);

  return {
    speak,
    stop,
    pause,
    resume,
    isSupported,
    isSpeaking,
  };
};
