-- Add AI interpretation column to scans table
ALTER TABLE public.scans
ADD COLUMN IF NOT EXISTS ai_interpretation JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS interpretation_created_at TIMESTAMPTZ DEFAULT NULL;
