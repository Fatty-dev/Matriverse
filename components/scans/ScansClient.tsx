"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui";
import { UploadScanForm } from "./UploadScanForm";
import { ScanInterpretationButton } from "./ScanInterpretation";
import type { Scan } from "@/types/scans";

interface ScansClientProps {
  initialScans: Scan[];
  isOnboarding?: boolean;
}

export function ScansClient({ initialScans, isOnboarding = false }: ScansClientProps) {
  const [filter, setFilter] = useState<"all" | "trimester" | "month">("all");
  const scans = initialScans; // In a real app, you'd re-fetch based on filter

  const getFilteredScans = () => {
    const now = new Date();
    switch (filter) {
      case "trimester":
        // Show scans from current trimester (simplified)
        return scans;
      case "month":
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
        return scans.filter(scan => new Date(scan.created_at) >= lastMonth);
      default:
        return scans;
    }
  };

  const filteredScans = getFilteredScans();

  const getTrimesterLabel = (trimester: number | null) => {
    if (!trimester) return "Not specified";
    return `${trimester}${trimester === 1 ? 'st' : trimester === 2 ? 'nd' : 'rd'} Trimester`;
  };

  return (
    <>
      {/* Upload Area */}
      <Card className="mb-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-brand-dark/5">
        <CardContent className="p-8">
          <UploadScanForm isOnboarding={isOnboarding} />
        </CardContent>
      </Card>

      {/* Scans Grid */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-brand-dark/5">
        <CardHeader className="border-b-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-text">Your Scans</h3>
              <p className="text-sm text-text-muted">All your uploaded ultrasound images</p>
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-2 border border-border rounded-lg text-sm text-text-muted focus:border-brand-mid focus:ring-1 focus:ring-brand-mid outline-none"
            >
              <option value="all">All Scans</option>
              <option value="trimester">This Trimester</option>
              <option value="month">Last Month</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredScans.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-brand-surface rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-brand-mid" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text mb-2">No scans found</h3>
              <p className="text-text-muted">Upload your first ultrasound scan to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-brand-light/30">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Preview</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Date</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Type</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Trimester</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Analysis</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-light/20">
                  {filteredScans.map((scan) => (
                    <tr key={scan.id} className="hover:bg-brand-surface/30 transition-colors">
                      {/* Preview Thumbnail */}
                      <td className="py-3 px-4">
                        <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {scan.file_url.endsWith('.pdf') ? (
                            <div className="w-full h-full flex items-center justify-center bg-red-50">
                              <svg className="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                              </svg>
                            </div>
                          ) : (
                            <img
                              src={scan.file_url}
                              alt={`Scan preview`}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4">
                        <span className="text-sm font-medium text-text">
                          {new Date(scan.scan_date || scan.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </td>

                      {/* Type */}
                      <td className="py-3 px-4">
                        {scan.scan_type ? (
                          <span className="px-2 py-1 bg-brand-surface text-brand-mid text-xs font-medium rounded-full capitalize">
                            {scan.scan_type.replace('_', ' ')}
                          </span>
                        ) : (
                          <span className="text-sm text-text-muted">—</span>
                        )}
                      </td>

                      {/* Trimester */}
                      <td className="py-3 px-4">
                        {scan.trimester ? (
                          <span className="text-sm text-text">
                            {getTrimesterLabel(scan.trimester)}
                          </span>
                        ) : (
                          <span className="text-sm text-text-muted">—</span>
                        )}
                      </td>

                      {/* Analysis Status */}
                      <td className="py-3 px-4">
                        {scan.file_url.endsWith('.pdf') ? (
                          <span className="text-xs text-text-muted">N/A</span>
                        ) : scan.ai_interpretation ? (
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full w-fit">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Analyzed
                            </span>
                            <p className="text-xs text-text-muted line-clamp-2 max-w-50" title={scan.ai_interpretation.summary}>
                              {scan.ai_interpretation.summary.slice(0, 80)}...
                            </p>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Not analyzed
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {/* AI Analysis Button - Only for image scans */}
                          {!scan.file_url.endsWith('.pdf') && (
                            <ScanInterpretationButton
                              scanId={scan.id}
                              existingInterpretation={scan.ai_interpretation}
                              scanType={scan.scan_type || undefined}
                            />
                          )}
                          <a
                            href={scan.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-white border-2 border-brand-mid text-brand-mid text-xs font-medium rounded-lg hover:bg-brand-surface transition-colors"
                          >
                            View
                          </a>
                          <a
                            href={scan.file_url}
                            download
                            className="p-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            title="Download"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
