export interface Scan {
  id: string;
  user_id: string;
  file_url: string;
  scan_type: string | null;
  scan_date: string | null;
  trimester: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface UploadScanResult {
  success: boolean;
  message?: string;
  data?: Scan;
}
