-- Add new profile fields for enhanced onboarding
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS last_menstrual_period DATE,
ADD COLUMN IF NOT EXISTS medical_history JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS partner_name TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_relationship TEXT,
ADD COLUMN IF NOT EXISTS has_uploaded_scan BOOLEAN DEFAULT FALSE;

-- Create video library table
CREATE TABLE IF NOT EXISTS public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  category TEXT NOT NULL CHECK (category IN ('education', 'exercise', 'breathing', 'labor_prep', 'postpartum', 'nutrition')),
  trimester INTEGER CHECK (trimester IN (1, 2, 3)),
  tags TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create user video progress table to track watched videos
CREATE TABLE IF NOT EXISTS public.user_video_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE NOT NULL,
  progress_seconds INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  last_watched_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, video_id)
);

-- Enable RLS on videos (public read, admin write)
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Everyone can view videos
CREATE POLICY "Anyone can view videos"
  ON public.videos
  FOR SELECT
  TO authenticated
  USING (true);

-- Enable RLS on user_video_progress
ALTER TABLE public.user_video_progress ENABLE ROW LEVEL SECURITY;

-- Users can view their own progress
CREATE POLICY "Users can view own video progress"
  ON public.user_video_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own progress
CREATE POLICY "Users can insert own video progress"
  ON public.user_video_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY "Users can update own video progress"
  ON public.user_video_progress
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS videos_category_idx ON public.videos(category);
CREATE INDEX IF NOT EXISTS videos_trimester_idx ON public.videos(trimester);
CREATE INDEX IF NOT EXISTS user_video_progress_user_id_idx ON public.user_video_progress(user_id);

-- Add updated_at trigger for videos
CREATE TRIGGER videos_updated_at
  BEFORE UPDATE ON public.videos
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Insert dummy video content
INSERT INTO public.videos (title, description, video_url, thumbnail_url, duration_seconds, category, trimester, tags, is_featured, sort_order) VALUES
-- Education videos
('Understanding Your First Trimester', 'Learn about the changes happening in your body during weeks 1-13.', 'https://example.com/videos/first-trimester.mp4', '/images/videos/first-trimester-thumb.jpg', 480, 'education', 1, ARRAY['pregnancy', 'first trimester', 'development'], true, 1),
('Second Trimester: What to Expect', 'Your guide to weeks 14-26 of pregnancy.', 'https://example.com/videos/second-trimester.mp4', '/images/videos/second-trimester-thumb.jpg', 540, 'education', 2, ARRAY['pregnancy', 'second trimester', 'baby growth'], true, 2),
('Third Trimester Preparation', 'Preparing for the final stretch of your pregnancy journey.', 'https://example.com/videos/third-trimester.mp4', '/images/videos/third-trimester-thumb.jpg', 600, 'education', 3, ARRAY['pregnancy', 'third trimester', 'preparation'], true, 3),
('Understanding Your Ultrasound', 'How to read and understand your ultrasound scans.', 'https://example.com/videos/ultrasound-guide.mp4', '/images/videos/ultrasound-thumb.jpg', 420, 'education', NULL, ARRAY['ultrasound', 'scans', 'medical'], false, 4),

-- Exercise videos
('Safe Prenatal Yoga - Beginner', 'Gentle yoga poses safe for all trimesters.', 'https://example.com/videos/prenatal-yoga-beginner.mp4', '/images/videos/yoga-beginner-thumb.jpg', 1200, 'exercise', NULL, ARRAY['yoga', 'exercise', 'stretching'], true, 1),
('Pelvic Floor Exercises', 'Strengthen your pelvic floor for labor and recovery.', 'https://example.com/videos/pelvic-floor.mp4', '/images/videos/pelvic-floor-thumb.jpg', 600, 'exercise', NULL, ARRAY['pelvic floor', 'kegels', 'strength'], true, 2),
('Walking Workout for Pregnancy', 'Low-impact cardio safe for expectant mothers.', 'https://example.com/videos/walking-workout.mp4', '/images/videos/walking-thumb.jpg', 900, 'exercise', NULL, ARRAY['cardio', 'walking', 'low impact'], false, 3),
('Third Trimester Stretches', 'Relieve discomfort with these gentle stretches.', 'https://example.com/videos/third-tri-stretches.mp4', '/images/videos/stretches-thumb.jpg', 720, 'exercise', 3, ARRAY['stretching', 'comfort', 'third trimester'], false, 4),

-- Breathing videos
('Introduction to Labor Breathing', 'Learn the breathing techniques that will help during labor.', 'https://example.com/videos/labor-breathing-intro.mp4', '/images/videos/breathing-intro-thumb.jpg', 480, 'breathing', 3, ARRAY['breathing', 'labor', 'techniques'], true, 1),
('Deep Relaxation Breathing', 'Master deep breathing for stress relief and sleep.', 'https://example.com/videos/relaxation-breathing.mp4', '/images/videos/relaxation-thumb.jpg', 600, 'breathing', NULL, ARRAY['relaxation', 'sleep', 'stress relief'], false, 2),

-- Labor prep videos
('What to Pack in Your Hospital Bag', 'Essential items for your hospital stay.', 'https://example.com/videos/hospital-bag.mp4', '/images/videos/hospital-bag-thumb.jpg', 480, 'labor_prep', 3, ARRAY['hospital', 'packing', 'preparation'], true, 1),
('Labor Positions and Movement', 'Different positions to try during labor.', 'https://example.com/videos/labor-positions.mp4', '/images/videos/labor-positions-thumb.jpg', 720, 'labor_prep', 3, ARRAY['labor', 'positions', 'birth'], true, 2),
('Partner Support During Labor', 'How partners can help during the birthing process.', 'https://example.com/videos/partner-support.mp4', '/images/videos/partner-support-thumb.jpg', 600, 'labor_prep', 3, ARRAY['partner', 'support', 'labor'], false, 3),
('Understanding Labor Stages', 'Learn what happens during each stage of labor.', 'https://example.com/videos/labor-stages.mp4', '/images/videos/labor-stages-thumb.jpg', 540, 'labor_prep', 3, ARRAY['labor', 'stages', 'birth'], true, 4),

-- Nutrition videos
('Healthy Eating During Pregnancy', 'Nutrition guidelines for a healthy pregnancy.', 'https://example.com/videos/pregnancy-nutrition.mp4', '/images/videos/nutrition-thumb.jpg', 540, 'nutrition', NULL, ARRAY['nutrition', 'diet', 'health'], true, 1),
('Foods to Avoid While Pregnant', 'Important dietary restrictions during pregnancy.', 'https://example.com/videos/foods-to-avoid.mp4', '/images/videos/foods-avoid-thumb.jpg', 360, 'nutrition', NULL, ARRAY['nutrition', 'safety', 'food'], false, 2),

-- Postpartum videos
('Preparing for Postpartum Recovery', 'What to expect after giving birth.', 'https://example.com/videos/postpartum-prep.mp4', '/images/videos/postpartum-thumb.jpg', 600, 'postpartum', 3, ARRAY['postpartum', 'recovery', 'preparation'], true, 1),
('Breastfeeding Basics', 'Getting started with breastfeeding your newborn.', 'https://example.com/videos/breastfeeding.mp4', '/images/videos/breastfeeding-thumb.jpg', 720, 'postpartum', 3, ARRAY['breastfeeding', 'newborn', 'feeding'], true, 2);
