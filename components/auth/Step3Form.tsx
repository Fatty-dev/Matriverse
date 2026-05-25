"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Button, Input } from "@/components/ui";
import {
  updateProfileStep3,
  type ProfileState,
} from "@/app/actions/profile";
import { MEDICAL_HISTORY_OPTIONS } from "@/types";

export function Step3Form() {
  const [state, action, pending] = useActionState<ProfileState, FormData>(
    updateProfileStep3,
    null
  );

  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);

  const toggleCondition = (condition: string) => {
    setSelectedConditions(prev => {
      if (condition === 'None of the above') {
        return prev.includes(condition) ? [] : ['None of the above'];
      }

      const filtered = prev.filter(c => c !== 'None of the above');

      if (filtered.includes(condition)) {
        return filtered.filter(c => c !== condition);
      }
      return [...filtered, condition];
    });
  };

  return (
    <form action={action} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Input
            id="dueDate"
            name="dueDate"
            type="date"
            label="Expected Due Date"
            placeholder="Select date"
          />
          {state?.errors?.dueDate && (
            <p className="mt-1 text-sm text-red-500">{state.errors.dueDate[0]}</p>
          )}
        </div>
        <div>
          <Input
            id="lastMenstrualPeriod"
            name="lastMenstrualPeriod"
            type="date"
            label="Last Menstrual Period"
            placeholder="Select date"
          />
          {state?.errors?.lastMenstrualPeriod && (
            <p className="mt-1 text-sm text-red-500">{state.errors.lastMenstrualPeriod[0]}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text mb-2">
          Is this your first pregnancy?
        </label>
        <div className="flex gap-4">
          <label className="flex-1 flex items-center justify-center gap-2 p-3 border border-border rounded-lg cursor-pointer hover:border-brand-mid hover:bg-brand-surface transition-colors">
            <input
              type="radio"
              name="firstPregnancy"
              value="yes"
              className="text-brand-mid"
            />
            <span>Yes</span>
          </label>
          <label className="flex-1 flex items-center justify-center gap-2 p-3 border border-border rounded-lg cursor-pointer hover:border-brand-mid hover:bg-brand-surface transition-colors">
            <input
              type="radio"
              name="firstPregnancy"
              value="no"
              className="text-brand-mid"
            />
            <span>No</span>
          </label>
        </div>
        {state?.errors?.isFirstPregnancy && (
          <p className="mt-1 text-sm text-red-500">
            {state.errors.isFirstPregnancy[0]}
          </p>
        )}
      </div>

      {/* Medical History Section */}
      <div className="border-t border-border pt-5 mt-5">
        <h3 className="text-lg font-semibold text-brand-dark mb-2">Medical History</h3>
        <p className="text-sm text-text-muted mb-4">Select any conditions that apply to you</p>

        <input
          type="hidden"
          name="medicalHistory"
          value={JSON.stringify(selectedConditions)}
        />

        <div className="grid grid-cols-2 gap-2">
          {MEDICAL_HISTORY_OPTIONS.map((condition) => (
            <label
              key={condition}
              className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedConditions.includes(condition)
                  ? 'border-brand-mid bg-brand-surface'
                  : 'border-border hover:border-brand-light'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedConditions.includes(condition)}
                onChange={() => toggleCondition(condition)}
                className="h-4 w-4 rounded border-border text-brand-mid focus:ring-brand-accent"
              />
              <span className="text-sm">{condition}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text mb-2">
          How did you hear about us?
        </label>
        <select
          name="referralSource"
          className="w-full h-11 px-4 border border-border rounded-lg bg-white text-text focus:border-brand-mid focus:ring-1 focus:ring-brand-mid outline-none"
        >
          <option value="">Select an option</option>
          <option value="social">Social Media</option>
          <option value="friend">Friend or Family</option>
          <option value="doctor">Healthcare Provider</option>
          <option value="search">Search Engine</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="flex items-start gap-3 pt-2">
        <input
          type="checkbox"
          id="terms"
          name="terms"
          className="mt-1 h-4 w-4 rounded border border-border text-brand-mid focus:ring-brand-accent"
        />
        <label htmlFor="terms" className="text-sm text-text-muted">
          I agree to the{" "}
          <Link
            href="/terms"
            className="text-brand-mid hover:text-brand-dark font-medium"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="text-brand-mid hover:text-brand-dark font-medium"
          >
            Privacy Policy
          </Link>
        </label>
      </div>
      {state?.errors?.terms && (
        <p className="text-sm text-red-500">{state.errors.terms[0]}</p>
      )}

      {state?.message && (
        <p className="text-sm text-red-500">{state.message}</p>
      )}

      <div className="flex gap-4 pt-2">
        <Link href="/signup/step-2" className="flex-1">
          <Button type="button" variant="outline" className="w-full" size="lg">
            <svg
              className="mr-2 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 17l-5-5m0 0l5-5m-5 5h12"
              />
            </svg>
            Back
          </Button>
        </Link>
        <Button
          type="submit"
          className="flex-1"
          size="lg"
          disabled={pending}
        >
          {pending ? "Completing..." : "Complete Signup"}
        </Button>
      </div>
    </form>
  );
}
