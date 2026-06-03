"use client";

interface CalibrationOverlayProps {
  /** When true, shows success check + hold bar; when false, shows guide content */
  success: boolean;
  successTitle: string;
  holdProgress: number;
  lockProgress: number;
  holdHint?: string;
  children: React.ReactNode;
}

export function CalibrationOverlay({
  success,
  successTitle,
  holdProgress,
  lockProgress,
  holdHint = "Hold steady to continue",
  children,
}: CalibrationOverlayProps) {
  const barWidth = success ? holdProgress : lockProgress;

  return (
    <div className="absolute inset-0 z-30 pointer-events-none">
      <div
        className="absolute inset-0 transition-opacity duration-500 ease-out"
        style={{ opacity: success ? 0 : 1 }}
      >
        {children}
      </div>

      <div
        className="absolute inset-0 flex items-center justify-center transition-opacity duration-500 ease-out"
        style={{ opacity: success ? 1 : 0 }}
      >
        <div className="text-center px-6">
          <div className="w-36 h-36 rounded-full bg-green-500/25 border-4 border-green-400 flex items-center justify-center mx-auto">
            <svg className="w-20 h-20 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-white text-3xl font-bold mt-5">{successTitle}</p>
          <div className="mt-5 mx-auto w-64 h-2 rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full bg-green-400 transition-all duration-150 ease-out"
              style={{ width: `${Math.round(Math.min(100, barWidth * 100))}%` }}
            />
          </div>
          <p className="text-white/80 text-base mt-2">{holdHint}</p>
        </div>
      </div>
    </div>
  );
}
