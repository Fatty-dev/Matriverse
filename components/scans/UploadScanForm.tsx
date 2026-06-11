"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { uploadScan } from "@/app/actions/scans";
import { markScanUploaded } from "@/app/actions/profile";
import { Modal } from "@/components/ui";

interface UploadScanFormProps {
  isOnboarding?: boolean;
}

export function UploadScanForm({ isOnboarding = false }: UploadScanFormProps) {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [modal, setModal] = useState<{ show: boolean; type: "success" | "error"; title: string; message: string }>({
    show: false,
    type: "success",
    title: "",
    message: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  const handleFile = useCallback((file: File) => {
    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      setModal({
        show: true,
        type: "error",
        title: "Invalid File Type",
        message: "Please upload an image (JPG, PNG, GIF, WebP) or PDF file.",
      });
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setModal({
        show: true,
        type: "error",
        title: "File Too Large",
        message: "Please upload a file smaller than 10MB.",
      });
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);

    const formData = new FormData(e.currentTarget);
    // Replace the file input with our selected file
    formData.set("file", selectedFile);

    const result = await uploadScan(formData);

    if (result.success) {
      await markScanUploaded();

      if (isOnboarding) {
        router.push("/dashboard?welcome=true");
      } else {
        setModal({
          show: true,
          type: "success",
          title: "Upload Successful",
          message: "Your scan has been uploaded successfully!",
        });
        setSelectedFile(null);
        setPreview(null);
        formRef.current?.reset();
        router.refresh();
      }
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

      <form ref={formRef} onSubmit={handleSubmit}>
        {/* Drag & Drop Area */}
        {!selectedFile ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
              isDragging
                ? "border-brand-mid bg-brand-surface/50 scale-[1.02]"
                : "border-border hover:border-brand-mid hover:bg-brand-surface/20"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              name="file"
              accept="image/*,.pdf"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors ${
              isDragging ? "bg-brand-mid" : "bg-brand-surface"
            }`}>
              <svg className={`w-8 h-8 transition-colors ${isDragging ? "text-white" : "text-brand-mid"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>

            <h3 className="text-lg font-semibold text-text mb-2">
              {isDragging ? "Drop your file here" : "Upload your scan"}
            </h3>
            <p className="text-text-muted mb-4">
              Drag and drop your file here, or <span className="text-brand-mid font-medium">browse</span>
            </p>
            <p className="text-sm text-text-muted">
              Supports: JPG, PNG, PDF up to 10MB
            </p>

            {/* Decorative corners when dragging */}
            {isDragging && (
              <>
                <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-brand-mid rounded-tl-lg" />
                <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-brand-mid rounded-tr-lg" />
                <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-brand-mid rounded-bl-lg" />
                <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-brand-mid rounded-br-lg" />
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* File Preview */}
            <div className="flex items-start gap-4 p-4 bg-brand-surface/30 rounded-xl border border-brand-light">
              {/* Preview thumbnail */}
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-red-50">
                    <svg className="w-8 h-8 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              {/* File info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-text truncate">{selectedFile.name}</p>
                <p className="text-sm text-text-muted">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Ready to upload
                  </span>
                </div>
              </div>

              {/* Remove button */}
              <button
                type="button"
                onClick={handleRemoveFile}
                className="p-2 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">
                  Scan Type
                </label>
                <select
                  name="scanType"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:border-brand-mid focus:ring-1 focus:ring-brand-mid outline-none text-sm"
                >
                  <option value="">Select type...</option>
                  <option value="ultrasound">Ultrasound</option>
                  <option value="medical_report">Medical Report</option>
                  <option value="lab_result">Lab Result</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1.5">
                  Trimester
                </label>
                <select
                  name="trimester"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:border-brand-mid focus:ring-1 focus:ring-brand-mid outline-none text-sm"
                >
                  <option value="">Select...</option>
                  <option value="1">First (1-13 weeks)</option>
                  <option value="2">Second (14-26 weeks)</option>
                  <option value="3">Third (27+ weeks)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1.5">
                  Scan Date
                </label>
                <input
                  type="date"
                  name="scanDate"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:border-brand-mid focus:ring-1 focus:ring-brand-mid outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1.5">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  name="notes"
                  placeholder="Add a note..."
                  className="w-full px-3 py-2 border border-border rounded-lg focus:border-brand-mid focus:ring-1 focus:ring-brand-mid outline-none text-sm"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleRemoveFile}
                disabled={uploading}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="flex-1 px-4 py-2.5 bg-brand-mid text-white rounded-lg font-medium hover:bg-brand-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Upload Scan
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </>
  );
}
