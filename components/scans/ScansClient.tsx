"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui";
import { UploadScanForm } from "./UploadScanForm";
import type { Scan } from "@/types/scans";

interface ScansClientProps {
  initialScans: Scan[];
}

export function ScansClient({ initialScans }: ScansClientProps) {
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
          <UploadScanForm />
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredScans.map((scan) => (
                <div
                  key={scan.id}
                  className="group bg-brand-surface/30 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-gray-100 overflow-hidden">
                    {scan.file_url.endsWith('.pdf') ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-red-50">
                        <svg className="w-20 h-20 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                      </div>
                    ) : (
                      <img
                        src={scan.file_url}
                        alt={`Scan from ${new Date(scan.scan_date || scan.created_at).toLocaleDateString()}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}

                    {/* Type badge */}
                    {scan.scan_type && (
                      <div className="absolute top-3 right-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-text capitalize">
                        {scan.scan_type.replace('_', ' ')}
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-text">
                        {new Date(scan.scan_date || scan.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                      {scan.trimester && (
                        <span className="text-xs text-text-muted bg-brand-surface px-2 py-1 rounded-full">
                          {getTrimesterLabel(scan.trimester)}
                        </span>
                      )}
                    </div>

                    {scan.notes && (
                      <p className="text-sm text-text-muted line-clamp-2">
                        {scan.notes}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <a
                        href={scan.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-3 py-1.5 bg-white border-2 border-brand-mid text-brand-mid text-xs font-medium rounded-lg hover:bg-brand-surface transition-colors text-center"
                      >
                        View
                      </a>
                      <a
                        href={scan.file_url}
                        download
                        className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
