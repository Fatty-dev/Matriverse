-- Create breathing_sessions table
CREATE TABLE IF NOT EXISTS public.breathing_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  exercise_type TEXT NOT NULL CHECK (exercise_type IN ('relaxation', 'sleep_aid', 'labor_prep', 'stress_relief', 'energy')),
  duration_seconds INTEGER NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.breathing_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can view their own sessions
CREATE POLICY "Users can view own breathing sessions"
  ON public.breathing_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can insert their own sessions
CREATE POLICY "Users can insert own breathing sessions"
  ON public.breathing_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can delete their own sessions
CREATE POLICY "Users can delete own breathing sessions"
  ON public.breathing_sessions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS breathing_sessions_user_id_idx ON public.breathing_sessions(user_id);
CREATE INDEX IF NOT EXISTS breathing_sessions_completed_at_idx ON public.breathing_sessions(completed_at DESC);
CREATE INDEX IF NOT EXISTS breathing_sessions_user_completed_idx ON public.breathing_sessions(user_id, completed_at DESC);
