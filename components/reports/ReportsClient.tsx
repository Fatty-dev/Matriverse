"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, Modal } from "@/components/ui";
import { generateReport, deleteReport } from "@/app/actions/reports";
import { generatePDF } from "@/lib/pdf-generator";
import type { Report } from "@/app/actions/reports";

interface ReportsClientProps {
  initialReports: Report[];
}

export function ReportsClient({ initialReports }: ReportsClientProps) {
  const [generating, setGenerating] = useState(false);
  const [generatingType, setGeneratingType] = useState<string | null>(null);
  const [modal, setModal] = useState<{ show: boolean; type: "success" | "error"; title: string; message: string }>({
    show: false,
    type: "success",
    title: "",
    message: "",
  });
  const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; reportId: string | null }>({
    show: false,
    reportId: null,
  });
  const router = useRouter();

  const handleGenerateReport = async (reportType: Report["report_type"]) => {
    setGenerating(true);
    setGeneratingType(reportType);

    const result = await generateReport(reportType);

    if (result.success) {
      setModal({
        show: true,
        type: "success",
        title: "Report Generated",
        message: "Your report has been generated successfully!",
      });
      router.refresh();
    } else {
      setModal({
        show: true,
        type: "error",
        title: "Generation Failed",
        message: result.message || "Failed to generate report. Please try again.",
      });
    }

    setGenerating(false);
    setGeneratingType(null);
  };

  const handleDeleteReport = async (reportId: string) => {
    const result = await deleteReport(reportId);

    if (result.success) {
      setModal({
        show: true,
        type: "success",
        title: "Report Deleted",
        message: "Report has been deleted successfully.",
      });
      router.refresh();
    } else {
      setModal({
        show: true,
        type: "error",
        title: "Deletion Failed",
        message: result.message || "Failed to delete report. Please try again.",
      });
    }
    setConfirmDelete({ show: false, reportId: null });
  };

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case "full_summary":
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case "symptoms_report":
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        );
      case "progress_report":
      case "ar_training_report":
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
    }
  };

  const formatReportType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const downloadReportAsPDF = (report: Report) => {
    const userInfo = {
      name: "", // Could be passed from props if needed
      dueDate: "",
    };

    const pdf = generatePDF(report.report_type, report.report_data, userInfo);
    const fileName = `${report.title.replace(/\s+/g, "_")}_${new Date(report.created_at).toLocaleDateString().replace(/\//g, "-")}.pdf`;
    pdf.save(fileName);
  };

  return (
    <>
      <Modal
        isOpen={modal.show}
        onClose={() => setModal({ ...modal, show: false })}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />

      {/* Confirmation Modal for Delete */}
      {confirmDelete.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setConfirmDelete({ show: false, reportId: null })} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-text mb-2">Delete Report?</h3>
            <p className="text-text-muted mb-6">Are you sure you want to delete this report? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete({ show: false, reportId: null })}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDelete.reportId && handleDeleteReport(confirmDelete.reportId)}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Report Card */}
      <Card className="mb-6 bg-gradient-to-r from-brand-mid to-brand-dark border-0 shadow-lg">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <h2 className="text-2xl font-bold mb-2">Generate Pregnancy Report</h2>
              <p className="text-white/80 max-w-lg">
                Create a comprehensive report of your pregnancy journey including symptoms, progress, and health data to share with your healthcare provider.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-brand-dark/5 hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-brand-surface rounded-xl flex items-center justify-center mb-4">
              {getReportTypeIcon("full_summary")}
            </div>
            <h3 className="font-semibold text-text mb-2">Full Summary Report</h3>
            <p className="text-sm text-text-muted mb-4">Complete overview of your pregnancy journey with all tracked data.</p>
            <button
              onClick={() => handleGenerateReport("full_summary")}
              disabled={generating}
              className="text-sm font-medium text-brand-mid hover:text-brand-dark flex items-center gap-1 disabled:opacity-50"
            >
              {generatingType === "full_summary" ? "Generating..." : "Generate Report"}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-brand-dark/5 hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-info/10 rounded-xl flex items-center justify-center mb-4 text-info">
              {getReportTypeIcon("symptoms_report")}
            </div>
            <h3 className="font-semibold text-text mb-2">Symptoms Report</h3>
            <p className="text-sm text-text-muted mb-4">Detailed log of all symptoms you&apos;ve tracked during pregnancy.</p>
            <button
              onClick={() => handleGenerateReport("symptoms_report")}
              disabled={generating}
              className="text-sm font-medium text-brand-mid hover:text-brand-dark flex items-center gap-1 disabled:opacity-50"
            >
              {generatingType === "symptoms_report" ? "Generating..." : "Generate Report"}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-brand-dark/5 hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center mb-4 text-success">
              {getReportTypeIcon("ar_training_report")}
            </div>
            <h3 className="font-semibold text-text mb-2">AR Training Report</h3>
            <p className="text-sm text-text-muted mb-4">Your AR training sessions and exercise progress.</p>
            <button
              onClick={() => handleGenerateReport("ar_training_report")}
              disabled={generating}
              className="text-sm font-medium text-brand-mid hover:text-brand-dark flex items-center gap-1 disabled:opacity-50"
            >
              {generatingType === "ar_training_report" ? "Generating..." : "Generate Report"}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Previous Reports */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-brand-dark/5">
        <CardHeader className="border-b-0">
          <div>
            <h3 className="text-lg font-semibold text-text">Previous Reports</h3>
            <p className="text-sm text-text-muted">Your previously generated reports</p>
          </div>
        </CardHeader>
        <CardContent>
          {initialReports.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-brand-surface rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-brand-mid" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text mb-2">No reports generated yet</h3>
              <p className="text-text-muted">Generate your first report to see it here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {initialReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 bg-brand-surface/30 rounded-xl hover:bg-brand-surface/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-mid/10 rounded-xl flex items-center justify-center text-brand-mid">
                      {getReportTypeIcon(report.report_type)}
                    </div>
                    <div>
                      <h4 className="font-medium text-text">{report.title}</h4>
                      <p className="text-sm text-text-muted">
                        {formatReportType(report.report_type)} • Generated on{" "}
                        {new Date(report.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => downloadReportAsPDF(report)}
                      className="px-3 py-1.5 bg-brand-mid text-white text-sm font-medium rounded-lg hover:bg-brand-dark transition-colors flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download PDF
                    </button>
                    <button
                      onClick={() => setConfirmDelete({ show: true, reportId: report.id })}
                      className="px-3 py-1.5 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
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
