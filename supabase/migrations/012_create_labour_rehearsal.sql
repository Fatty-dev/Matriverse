-- Create labour rehearsal progress tracking table
CREATE TABLE IF NOT EXISTS public.labour_rehearsal_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stage_id TEXT NOT NULL CHECK (stage_id IN ('early_labor', 'active_labor', 'transition', 'pushing', 'delivery')),
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, stage_id)
);

-- Enable RLS
ALTER TABLE public.labour_rehearsal_progress ENABLE ROW LEVEL SECURITY;

-- Users can view their own progress
CREATE POLICY "Users can view own labour rehearsal progress"
  ON public.labour_rehearsal_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own progress
CREATE POLICY "Users can insert own labour rehearsal progress"
  ON public.labour_rehearsal_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY "Users can update own labour rehearsal progress"
  ON public.labour_rehearsal_progress
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index
CREATE INDEX IF NOT EXISTS labour_rehearsal_progress_user_id_idx ON public.labour_rehearsal_progress(user_id);

-- Add updated_at trigger
CREATE TRIGGER labour_rehearsal_progress_updated_at
  BEFORE UPDATE ON public.labour_rehearsal_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
