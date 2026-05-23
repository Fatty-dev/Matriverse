"use client";

import { useState, useActionState, useEffect } from "react";
import { createPortal } from "react-dom";
import { logSymptom, type SymptomState } from "@/app/actions/symptoms";

const commonSymptoms = [
  { name: "Nausea", icon: "🤢" },
  { name: "Fatigue", icon: "😴" },
  { name: "Back Pain", icon: "💆" },
  { name: "Headache", icon: "🤕" },
  { name: "Heartburn", icon: "🔥" },
  { name: "Swelling", icon: "💧" },
  { name: "Cramps", icon: "⚡" },
  { name: "Dizziness", icon: "💫" },
];

export function SymptomLogger() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSymptom, setSelectedSymptom] = useState("");
  const [mounted, setMounted] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [lastSuccessKey, setLastSuccessKey] = useState<number | null>(null);
  const [state, action, pending] = useActionState<SymptomState, FormData>(
    logSymptom,
    null
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle successful submission
  useEffect(() => {
    // Only show success if this is a new success (not from a previous submission)
    if (state?.success && isOpen && !justSubmitted && lastSuccessKey !== formKey) {
      setJustSubmitted(true);
      setLastSuccessKey(formKey);
      const timer = setTimeout(() => {
        setIsOpen(false);
        setSelectedSymptom("");
        setJustSubmitted(false);
        // Reset form for next time
        setFormKey(prev => prev + 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state?.success, isOpen, justSubmitted, formKey, lastSuccessKey]);

  const handleQuickLog = (symptomName: string) => {
    setSelectedSymptom(symptomName);
    setJustSubmitted(false);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedSymptom("");
    setJustSubmitted(false);
  };

  return (
    <>
      {/* Quick Log Grid */}
      <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
        {commonSymptoms.map((symptom) => (
          <button
            key={symptom.name}
            onClick={() => handleQuickLog(symptom.name)}
            className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border hover:border-brand-mid hover:bg-brand-surface transition-all group"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">
              {symptom.icon}
            </span>
            <span className="text-xs font-medium text-text-muted group-hover:text-brand-mid">
              {symptom.name}
            </span>
          </button>
        ))}
      </div>

      {/* Log Button */}
      <div className="mt-4 flex justify-center">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-mid hover:text-brand-dark transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Log Other Symptom
        </button>
      </div>

      {/* Modal Portal */}
      {mounted && isOpen && createPortal(
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-text">Log Symptom</h2>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-brand-surface rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {justSubmitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium text-text">Symptom Logged!</p>
                </div>
              ) : (
                <form key={formKey} action={action} className="space-y-4">
                  {/* Symptom Name */}
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Symptom
                    </label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={selectedSymptom}
                      placeholder="e.g., Back pain, Nausea, Headache"
                      className="w-full px-4 py-3 border border-border rounded-xl focus:border-brand-mid focus:ring-1 focus:ring-brand-mid outline-none"
                    />
                    {state?.errors?.name && (
                      <p className="mt-1 text-sm text-danger">{state.errors.name[0]}</p>
                    )}
                  </div>

                  {/* Severity */}
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Severity
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <label className="relative flex items-center justify-center">
                        <input
                          type="radio"
                          name="severity"
                          value="mild"
                          className="peer sr-only"
                        />
                        <span className="w-full py-3 text-center text-sm font-medium rounded-xl border-2 cursor-pointer transition-all border-border text-text-muted hover:border-success/50 peer-checked:border-success peer-checked:bg-success/10 peer-checked:text-success">
                          Mild
                        </span>
                      </label>
                      <label className="relative flex items-center justify-center">
                        <input
                          type="radio"
                          name="severity"
                          value="moderate"
                          className="peer sr-only"
                        />
                        <span className="w-full py-3 text-center text-sm font-medium rounded-xl border-2 cursor-pointer transition-all border-border text-text-muted hover:border-warning/50 peer-checked:border-warning peer-checked:bg-warning/10 peer-checked:text-warning">
                          Moderate
                        </span>
                      </label>
                      <label className="relative flex items-center justify-center">
                        <input
                          type="radio"
                          name="severity"
                          value="severe"
                          className="peer sr-only"
                        />
                        <span className="w-full py-3 text-center text-sm font-medium rounded-xl border-2 cursor-pointer transition-all border-border text-text-muted hover:border-danger/50 peer-checked:border-danger peer-checked:bg-danger/10 peer-checked:text-danger">
                          Severe
                        </span>
                      </label>
                    </div>
                    {state?.errors?.severity && (
                      <p className="mt-1 text-sm text-danger">{state.errors.severity[0]}</p>
                    )}
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Notes (optional)
                    </label>
                    <textarea
                      name="notes"
                      rows={3}
                      placeholder="Any additional details..."
                      className="w-full px-4 py-3 border border-border rounded-xl focus:border-brand-mid focus:ring-1 focus:ring-brand-mid outline-none resize-none"
                    />
                  </div>

                  {state?.message && !state.success && (
                    <p className="text-sm text-danger">{state.message}</p>
                  )}

                  {/* Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="flex-1 px-4 py-3 border border-border text-text-muted rounded-xl font-medium hover:bg-brand-surface transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={pending}
                      className="flex-1 px-4 py-3 bg-brand-mid text-white rounded-xl font-medium hover:bg-brand-dark transition-colors disabled:opacity-50"
                    >
                      {pending ? "Logging..." : "Log Symptom"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
