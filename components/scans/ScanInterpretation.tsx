"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { analyzeScan } from "@/app/actions/scans";
import type { ScanInterpretation } from "@/types";

interface ScanInterpretationProps {
  scanId: string;
  existingInterpretation?: ScanInterpretation | null;
  scanType?: string;
}

export function ScanInterpretationButton({ scanId, existingInterpretation, scanType }: ScanInterpretationProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [interpretation, setInterpretation] = useState<ScanInterpretation | null>(
    existingInterpretation || null
  );
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Track mount state for portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showModal]);

  const handleAnalyze = async () => {
    if (interpretation) {
      setShowModal(true);
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    const result = await analyzeScan(scanId);

    if (result.success && result.interpretation) {
      setInterpretation(result.interpretation);
      setShowModal(true);
    } else {
      setError(result.error || "Failed to analyze scan");
    }

    setIsAnalyzing(false);
  };

  const formatScanType = (type: string) => {
    return type
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Remove emojis from text
  const stripEmojis = (text: string) => {
    return text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}]/gu, '').trim();
  };

  return (
    <>
      <button
        onClick={handleAnalyze}
        disabled={isAnalyzing}
        className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1 ${
          interpretation
            ? "bg-brand-mid text-white hover:bg-brand-dark"
            : "bg-gradient-to-r from-brand-mid to-brand-accent text-white hover:opacity-90"
        } disabled:opacity-50`}
      >
        {isAnalyzing ? (
          <>
            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Analyzing...</span>
          </>
        ) : interpretation ? (
          <>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>View Analysis</span>
          </>
        ) : (
          <>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span>AI Analysis</span>
          </>
        )}
      </button>

      {error && (
        <p className="text-xs text-red-500 mt-1 text-center">{error}</p>
      )}

      {/* Modal rendered via Portal to document.body */}
      {mounted && showModal && interpretation && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />

          {/* Modal - Centered */}
          <div
            className="relative w-[90vw] max-w-5xl max-h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
              {/* Header */}
              <div className="flex-shrink-0 bg-linear-to-r from-brand-dark to-brand-mid text-white px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-lg font-bold">Scan Analysis Report</h2>
                      <p className="text-white/70 text-xs">
                        {scanType ? formatScanType(scanType) : "Medical Scan"} - AI-Powered Analysis
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    aria-label="Close modal"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content - Scrollable with better grid layout */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-5">

                  {/* Top row: Summary and Trimester Info side by side */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Summary Section */}
                    <section>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Summary</h3>
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 h-full">
                        <p className="text-gray-800 leading-relaxed text-sm">{stripEmojis(interpretation.summary)}</p>
                      </div>
                    </section>

                    {/* Trimester Information */}
                    {interpretation.trimester_info && (
                      <section>
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Pregnancy Stage</h3>
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 h-full">
                          <p className="text-gray-700 leading-relaxed text-sm">{stripEmojis(interpretation.trimester_info)}</p>
                        </div>
                      </section>
                    )}
                  </div>

                  {/* Key Findings - Horizontal grid */}
                  {interpretation.key_findings && interpretation.key_findings.length > 0 && (
                    <section>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Key Observations</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                        {interpretation.key_findings.map((finding, index) => (
                          <div
                            key={index}
                            className="bg-white rounded-lg border border-gray-200 p-3 flex gap-3"
                          >
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-medium">
                              {index + 1}
                            </span>
                            <p className="text-gray-700 text-sm leading-relaxed">{stripEmojis(finding)}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Recommendations and Next Steps side by side */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Recommendations */}
                    {interpretation.recommendations && interpretation.recommendations.length > 0 && (
                      <section>
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Recommendations</h3>
                        <div className="space-y-2">
                          {interpretation.recommendations.map((rec, index) => (
                            <div key={index} className="flex gap-2 items-start bg-green-50 rounded-lg p-3 border border-green-100">
                              <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <p className="text-gray-700 text-sm leading-relaxed">{stripEmojis(rec)}</p>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    {/* Next Steps */}
                    {interpretation.next_steps && interpretation.next_steps.length > 0 && (
                      <section>
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Next Steps</h3>
                        <div className="space-y-2">
                          {interpretation.next_steps.map((step, index) => (
                            <div key={index} className="flex gap-2 items-start bg-amber-50 rounded-lg p-3 border border-amber-100">
                              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center text-xs font-semibold">
                                {index + 1}
                              </span>
                              <p className="text-gray-700 text-sm leading-relaxed">{stripEmojis(step)}</p>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}
                  </div>

                  {/* Disclaimer - Compact */}
                  <section>
                    <div className="bg-gray-100 border border-gray-200 rounded-lg p-4">
                      <div className="flex gap-3">
                        <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-gray-600 text-xs leading-relaxed">
                          <span className="font-semibold">Medical Disclaimer:</span> This AI-generated analysis is for educational purposes only and does not constitute medical advice. Always consult with a qualified healthcare provider for professional guidance.
                        </p>
                      </div>
                    </div>
                  </section>
                </div>
              </div>

              {/* Footer */}
              <div className="flex-shrink-0 bg-brand-surface/50 border-t border-brand-light/30 px-6 py-3">
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2 bg-brand-mid text-white rounded-lg text-sm font-medium hover:bg-brand-dark transition-colors"
                  >
                    Close Report
                  </button>
                </div>
              </div>
            </div>
        </div>,
        document.body
      )}
    </>
  );
}
