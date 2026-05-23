"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui";
import { verifyOTP, resendOTP, type OTPState } from "@/app/actions/auth";

interface VerifyOTPFormProps {
  email: string;
}

export function VerifyOTPForm({ email }: VerifyOTPFormProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [state, action, pending] = useActionState<OTPState, FormData>(
    verifyOTP,
    null
  );
  const [resendState, setResendState] = useState<{
    message?: string;
    error?: string;
  } | null>(null);
  const [resending, setResending] = useState(false);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const digits = value.replace(/\D/g, "").slice(0, 6).split("");
      const newOtp = [...otp];
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);
      // Focus last filled input or next empty one
      const nextIndex = Math.min(index + digits.length, 5);
      document.getElementById(`otp-${nextIndex}`)?.focus();
    } else {
      const newOtp = [...otp];
      newOtp[index] = value.replace(/\D/g, "");
      setOtp(newOtp);
      // Auto-focus next input
      if (value && index < 5) {
        document.getElementById(`otp-${index + 1}`)?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleResend = async () => {
    setResending(true);
    setResendState(null);
    try {
      const result = await resendOTP(email);
      setResendState(result);
    } catch {
      setResendState({ error: "Failed to resend code" });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="space-y-6">
      <form action={action} className="space-y-6">
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="otp" value={otp.join("")} />

        <div className="flex justify-center gap-3">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-14 text-center text-2xl font-semibold border border-border rounded-lg focus:border-brand-mid focus:ring-1 focus:ring-brand-mid outline-none"
            />
          ))}
        </div>

        {state?.error && (
          <p className="text-sm text-red-500 text-center">{state.error}</p>
        )}

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={pending || otp.join("").length !== 6}
        >
          {pending ? "Verifying..." : "Verify Email"}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-text-muted mb-2">
          Didn&apos;t receive the code?
        </p>
        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="text-sm font-medium text-brand-mid hover:text-brand-dark disabled:opacity-50"
        >
          {resending ? "Sending..." : "Resend Code"}
        </button>
        {resendState?.message && (
          <p className="mt-2 text-sm text-green-600">{resendState.message}</p>
        )}
        {resendState?.error && (
          <p className="mt-2 text-sm text-red-500">{resendState.error}</p>
        )}
      </div>
    </div>
  );
}
