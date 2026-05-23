# Deployment Checklist

Before deploying or testing the new features, complete this checklist:

## Database Setup

- [ ] Apply migration `005_create_ar_training.sql` (if not already done)
- [ ] Apply migration `006_create_scans.sql`
- [ ] Apply migration `007_create_reports.sql`
- [ ] Verify all tables exist in Supabase:
  - [ ] `ar_training_sessions`
  - [ ] `ar_training_reps`
  - [ ] `scans`
  - [ ] `reports`

## Storage Setup

- [ ] Create Supabase Storage bucket named `scans`
- [ ] Choose bucket type (public or private)
- [ ] Set appropriate bucket policies if using private bucket

## Dependencies

- [ ] Run `npm install` to ensure all packages are installed
- [ ] Verify MediaPipe dependencies: `@mediapipe/tasks-vision`
- [ ] Verify other dependencies: `react-webcam`, `framer-motion`

## Environment Variables

- [ ] Verify Supabase URL is set
- [ ] Verify Supabase Anon Key is set
- [ ] Check that auth is working

## Testing Checklist

### AR Training
- [ ] Navigate to `/dashboard/ar-trainer`
- [ ] Click "Start" on Deep Squat Training
- [ ] Verify camera permissions work
- [ ] Complete at least one rep
- [ ] Click "End Session" button
- [ ] Verify session appears in history with stats

### Scans Upload
- [ ] Navigate to `/dashboard/scans`
- [ ] Click upload area
- [ ] Upload a test image or PDF
- [ ] Fill in metadata fields
- [ ] Submit form
- [ ] Verify scan appears in grid
- [ ] Test "View" button
- [ ] Test download button
- [ ] Test filter dropdown

### Reports
- [ ] Navigate to `/dashboard/reports`
- [ ] Click "Generate Report" on Full Summary
- [ ] Verify report appears in Previous Reports
- [ ] Download the JSON file
- [ ] Verify JSON contains expected data
- [ ] Test report deletion

## Code Review

- [ ] Review server actions for security
- [ ] Verify RLS policies are correct
- [ ] Check file size limits (currently no limit on scans)
- [ ] Review error handling in components
- [ ] Verify all imports are correct

## Optional Enhancements

- [ ] Add file size validation (recommend 10MB max)
- [ ] Add image compression before upload
- [ ] Implement PDF generation for reports
- [ ] Add loading states and skeletons
- [ ] Add toast notifications instead of alerts
- [ ] Add error boundaries

## Performance

- [ ] Test with multiple scans (10+)
- [ ] Test with multiple reports
- [ ] Verify image loading is optimized
- [ ] Check database query performance

## Security

- [ ] Verify users can only see their own data
- [ ] Test RLS policies (try accessing another user's data)
- [ ] Check file upload validation
- [ ] Ensure no sensitive data is exposed in JSON downloads

## Browser Compatibility

- [ ] Test in Chrome
- [ ] Test in Safari
- [ ] Test in Firefox
- [ ] Test on mobile devices

## Documentation

- [ ] Review IMPLEMENTATION_SUMMARY.md
- [ ] Review SETUP_GUIDE.md
- [ ] Update README if needed
- [ ] Document any custom configurations

---

## Quick Start Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Apply migrations
# (Copy SQL from migration files and run in Supabase SQL Editor)

# Create storage bucket
# (Use Supabase dashboard: Storage > New bucket > "scans")
```

## Common Issues

**Camera not working in AR Training:**
- Check HTTPS is enabled (camera requires secure context)
- Check browser permissions
- Try a different browser

**File upload fails:**
- Verify storage bucket exists
- Check bucket name is exactly "scans"
- Verify RLS policies on scans table

**Reports show no data:**
- This is expected if no symptoms/AR training sessions exist
- Add data first, then generate reports

**TypeScript errors:**
- Run `npm run build` to check for type errors
- Verify all imports are correct
