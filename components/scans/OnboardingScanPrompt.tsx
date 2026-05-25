"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui";

export function OnboardingScanPrompt() {
  return (
    <Card className="mb-8 bg-gradient-to-r from-brand-mid to-brand-accent border-0 shadow-xl">
      <CardContent className="p-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Icon */}
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>

          {/* Content */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold text-white mb-2">
              Upload Your First Scan
            </h2>
            <p className="text-white/90 text-lg mb-1">
              Unlock the full potential of MatriVerse!
            </p>
            <p className="text-white/75">
              Upload your ultrasound scan to get personalized AI insights, track your baby&apos;s development,
              and receive tailored recommendations throughout your pregnancy journey.
            </p>
          </div>

          {/* Skip link */}
          <div className="flex-shrink-0">
            <Link
              href="/dashboard?welcome=true"
              className="text-white/80 hover:text-white text-sm underline underline-offset-2"
            >
              Skip for now
            </Link>
          </div>
        </div>

        {/* Benefits list */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-white text-sm">AI-powered scan analysis</span>
          </div>
          <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-white text-sm">Personalized recommendations</span>
          </div>
          <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-white text-sm">Track baby&apos;s development</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
