-- Create symptoms table
CREATE TABLE IF NOT EXISTS public.symptoms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('mild', 'moderate', 'severe')),
  notes TEXT,
  status TEXT DEFAULT 'normal' CHECK (status IN ('normal', 'monitor', 'seek_care')),
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.symptoms ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can view their own symptoms
CREATE POLICY "Users can view own symptoms"
  ON public.symptoms
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can insert their own symptoms
CREATE POLICY "Users can insert own symptoms"
  ON public.symptoms
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own symptoms
CREATE POLICY "Users can update own symptoms"
  ON public.symptoms
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policy: Users can delete their own symptoms
CREATE POLICY "Users can delete own symptoms"
  ON public.symptoms
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS symptoms_user_id_idx ON public.symptoms(user_id);
CREATE INDEX IF NOT EXISTS symptoms_logged_at_idx ON public.symptoms(logged_at DESC);
