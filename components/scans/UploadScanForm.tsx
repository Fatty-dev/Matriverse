"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { uploadScan } from "@/app/actions/scans";
import { Modal } from "@/components/ui";

export function UploadScanForm() {
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [modal, setModal] = useState<{ show: boolean; type: "success" | "error"; title: string; message: string }>({
    show: false,
    type: "success",
    title: "",
    message: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);

    const formData = new FormData(e.currentTarget);
    const result = await uploadScan(formData);

    if (result.success) {
      setModal({
        show: true,
        type: "success",
        title: "Upload Successful",
        message: "Your scan has been uploaded successfully!",
      });
      setShowForm(false);
      e.currentTarget.reset();
      router.refresh();
    } else {
      setModal({
        show: true,
        type: "error",
        title: "Upload Failed",
        message: result.message || "Failed to upload scan. Please try again.",
      });
    }

    setUploading(false);
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

      {!showForm ? (
        <div className="border-2 border-dashed border-border rounded-2xl p-12 text-center hover:border-brand-mid transition-colors cursor-pointer"
          onClick={() => setShowForm(true)}
        >
          <div className="w-16 h-16 bg-brand-surface rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-brand-mid" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-text mb-2">Upload your scan</h3>
          <p className="text-text-muted mb-4">Click to add your ultrasound or medical images</p>
          <p className="text-sm text-text-muted">Supports: JPG, PNG, PDF up to 10MB</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border-2 border-brand-mid">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Select File *
              </label>
              <input
                ref={fileInputRef}
                type="file"
                name="file"
                accept="image/*,.pdf"
                required
                className="block w-full text-sm text-text file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-mid file:text-white hover:file:bg-brand-dark"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Scan Type
              </label>
              <select
                name="scanType"
                className="w-full px-3 py-2 border border-border rounded-lg focus:border-brand-mid focus:ring-1 focus:ring-brand-mid outline-none"
              >
                <option value="">Select type...</option>
                <option value="ultrasound">Ultrasound</option>
                <option value="medical_report">Medical Report</option>
                <option value="lab_result">Lab Result</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Scan Date
                </label>
                <input
                  type="date"
                  name="scanDate"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:border-brand-mid focus:ring-1 focus:ring-brand-mid outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Trimester
                </label>
                <select
                  name="trimester"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:border-brand-mid focus:ring-1 focus:ring-brand-mid outline-none"
                >
                  <option value="">Select...</option>
                  <option value="1">First (1-13 weeks)</option>
                  <option value="2">Second (14-26 weeks)</option>
                  <option value="3">Third (27+ weeks)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Notes (Optional)
              </label>
              <textarea
                name="notes"
                rows={3}
                placeholder="Add any notes about this scan..."
                className="w-full px-3 py-2 border border-border rounded-lg focus:border-brand-mid focus:ring-1 focus:ring-brand-mid outline-none resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                disabled={uploading}
                className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="flex-1 px-4 py-2.5 bg-brand-mid text-white rounded-lg font-medium hover:bg-brand-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Uploading...
                  </>
                ) : (
                  "Upload Scan"
                )}
              </button>
            </div>
          </div>
        </form>
      )}
    </>
  );
}
