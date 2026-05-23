# Setup Guide - Scans & Reports Features

This guide will help you set up and test the newly implemented Scans Upload and Reports features.

## Prerequisites

1. Supabase project configured
2. Authentication working
3. AR Training features already set up (migrations 001-005 applied)

## Step 1: Apply Database Migrations

Run these migrations in your Supabase SQL editor:

### 1. Scans Migration
```bash
# File: supabase/migrations/006_create_scans.sql
```

This creates:
- `scans` table for storing scan metadata
- RLS policies for user data security
- Indexes for performance

### 2. Reports Migration
```bash
# File: supabase/migrations/007_create_reports.sql
```

This creates:
- `reports` table for storing generated reports
- RLS policies
- Trigger for auto-updating timestamps

## Step 2: Create Supabase Storage Bucket

1. Go to your Supabase dashboard
2. Navigate to Storage
3. Click "Create bucket"
4. Name it: `scans`
5. Choose "Public bucket" (recommended) or "Private bucket" based on your security needs
   - **Public**: Easier file serving, files accessible via URL
   - **Private**: More secure, requires authentication to access

If you choose Private, you'll need to update the file serving logic.

## Step 3: Install Dependencies (if needed)

All required dependencies are already in package.json:
```bash
npm install
```

No new dependencies were added for Scans/Reports features.

## Step 4: Test the Features

### Testing Scans Upload:

1. Navigate to `/dashboard/scans`
2. Click the upload area
3. Fill in the form:
   - Select a file (JPG, PNG, or PDF)
   - Choose scan type (ultrasound, medical report, etc.)
   - Select scan date
   - Choose trimester
   - Add optional notes
4. Click "Upload Scan"
5. Verify:
   - Success message appears
   - Scan appears in the grid below
   - Thumbnail displays correctly
   - "View" button opens the file
   - Download button works

### Testing Reports:

1. Navigate to `/dashboard/reports`
2. Click "Generate Report" on any report type:
   - Full Summary Report (all data)
   - Symptoms Report
   - AR Training Report
3. Verify:
   - Success message appears
   - Report appears in "Previous Reports" section
   - Report shows correct type and date
4. Click "Download JSON"
   - File downloads with report data
5. Verify report content includes:
   - For Full Summary: symptoms, scans, AR training data
   - For Symptoms: symptom logs
   - For AR Training: stats and session history

## Step 5: Verify Database

### Check Scans Table:
```sql
SELECT * FROM scans ORDER BY created_at DESC LIMIT 5;
```

Should show your uploaded scans with:
- file_url
- scan_type
- trimester
- notes

### Check Reports Table:
```sql
SELECT * FROM reports ORDER BY created_at DESC LIMIT 5;
```

Should show generated reports with:
- report_type
- title
- report_data (JSONB)

## Troubleshooting

### Scans Upload Fails

**Error: "Upload failed: Bucket not found"**
- Solution: Create the "scans" bucket in Supabase Storage

**Error: "Upload failed: Permission denied"**
- Solution: Check RLS policies on scans table
- Run migration 006 again if needed

**Files don't display**
- If using private bucket, files need authentication
- Switch to public bucket or update file serving logic

### Reports Generation Fails

**Error: "You must be logged in"**
- Solution: Verify authentication is working
- Check if user session is valid

**Empty report data**
- This is normal if you haven't logged symptoms or done AR training yet
- Add some data first, then generate reports

**Report not appearing after generation**
- Check browser console for errors
- Verify migration 007 was applied
- Check RLS policies on reports table

## File Structure Overview

### New Files Created:

**Database:**
- `supabase/migrations/006_create_scans.sql`
- `supabase/migrations/007_create_reports.sql`

**Server Actions:**
- `app/actions/scans.ts` - Upload, get, delete scans
- `app/actions/reports.ts` - Generate, get, delete reports

**Components:**
- `components/scans/UploadScanForm.tsx` - Upload UI
- `components/scans/ScansClient.tsx` - Scans grid display
- `components/scans/index.ts` - Exports
- `components/reports/ReportsClient.tsx` - Reports UI
- `components/reports/index.ts` - Exports

**Types:**
- `types/scans.ts` - Scan type definitions

**Pages Updated:**
- `app/(dashboard)/dashboard/scans/page.tsx` - Now functional
- `app/(dashboard)/dashboard/reports/page.tsx` - Now functional

**AR Training Updates:**
- `components/ar-training/SimpleGuidedSquat.tsx` - Added End Session button
- `app/(dashboard)/dashboard/ar-trainer/page.tsx` - Added session history

**Modified Server Actions:**
- `app/actions/symptoms.ts` - Updated return type for reports
- `app/actions/ar-training.ts` - Updated return type for reports

## Next Steps

1. **Test thoroughly** - Upload scans, generate reports, verify data
2. **Customize UI** - Adjust colors, layouts to match your design
3. **Add PDF generation** (optional):
   - Install `@react-pdf/renderer` or `jspdf`
   - Create PDF templates
   - Update report generation to create PDFs
4. **Add more report types** - Custom reports for specific needs
5. **Implement charts** - Visualize AR training progress, symptom trends

## Support

If you encounter issues:
1. Check browser console for errors
2. Check Supabase logs for database errors
3. Verify all migrations were applied successfully
4. Ensure storage bucket exists and has correct permissions

## Future Enhancements

Consider adding:
- Drag & drop file upload
- Multiple file upload at once
- Image preview/cropping before upload
- PDF preview in the UI
- Email reports to healthcare providers
- Share reports via link
- Progress charts and visualizations
- Export data to CSV
