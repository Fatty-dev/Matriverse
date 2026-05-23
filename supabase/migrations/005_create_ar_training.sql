-- Create ar_training_sessions table
CREATE TABLE IF NOT EXISTS public.ar_training_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL CHECK (session_type IN ('deep_squat', 'pelvic_floor', 'birth_ball', 'hip_opening')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  total_reps INTEGER DEFAULT 0,
  avg_form_score DECIMAL(5,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create ar_training_reps table for detailed rep tracking
CREATE TABLE IF NOT EXISTS public.ar_training_reps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.ar_training_sessions(id) ON DELETE CASCADE,
  rep_number INTEGER NOT NULL,
  depth_percentage DECIMAL(5,2),
  form_score DECIMAL(5,2),
  duration_ms INTEGER,
  form_issues JSONB,
  landmark_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.ar_training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ar_training_reps ENABLE ROW LEVEL SECURITY;

-- Policies for ar_training_sessions
CREATE POLICY "Users can view own AR training sessions"
  ON public.ar_training_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AR training sessions"
  ON public.ar_training_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AR training sessions"
  ON public.ar_training_sessions
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own AR training sessions"
  ON public.ar_training_sessions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for ar_training_reps
CREATE POLICY "Users can view own AR training reps"
  ON public.ar_training_reps
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.ar_training_sessions
      WHERE id = ar_training_reps.session_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own AR training reps"
  ON public.ar_training_reps
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ar_training_sessions
      WHERE id = ar_training_reps.session_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own AR training reps"
  ON public.ar_training_reps
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.ar_training_sessions
      WHERE id = ar_training_reps.session_id
      AND user_id = auth.uid()
    )
  );

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS ar_training_sessions_user_id_idx ON public.ar_training_sessions(user_id);
CREATE INDEX IF NOT EXISTS ar_training_sessions_started_at_idx ON public.ar_training_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS ar_training_sessions_user_started_idx ON public.ar_training_sessions(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS ar_training_sessions_session_type_idx ON public.ar_training_sessions(session_type);

CREATE INDEX IF NOT EXISTS ar_training_reps_session_id_idx ON public.ar_training_reps(session_id);
CREATE INDEX IF NOT EXISTS ar_training_reps_created_at_idx ON public.ar_training_reps(created_at);
