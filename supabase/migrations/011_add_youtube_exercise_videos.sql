-- Replace all placeholder videos with real NHS YouTube videos
-- Delete all existing placeholder videos
DELETE FROM public.videos;

-- Insert only the 5 real NHS YouTube videos

-- Pelvic Floor Exercise Videos (3 videos)
INSERT INTO public.videos (title, description, video_url, thumbnail_url, duration_seconds, category, trimester, tags, is_featured, sort_order) VALUES
(
  'NHS Pelvic Floor Exercises',
  'Learn the correct pelvic floor exercise technique from a pelvic health physiotherapist. Essential exercises to strengthen your pelvic floor during pregnancy and prepare for birth.',
  'https://www.youtube.com/watch?v=JFJtUtKQCuM',
  NULL,
  300,
  'exercise',
  NULL,
  ARRAY['pelvic floor', 'NHS', 'kegels', 'strength', 'pregnancy', 'physiotherapist'],
  true,
  1
),
(
  'NHS: How and When to Do Pelvic Floor Exercises',
  'Learn from NHS experts about the best times and techniques for pelvic floor exercises during pregnancy. Essential for labor preparation and postpartum recovery.',
  'https://www.youtube.com/watch?v=LMiNq_ai1hU',
  NULL,
  300,
  'exercise',
  NULL,
  ARRAY['pelvic floor', 'NHS', 'kegels', 'technique', 'timing'],
  true,
  2
),
(
  'NHS South Yorkshire: Pelvic Health During Pregnancy',
  'Comprehensive guide to maintaining pelvic health throughout your pregnancy journey from NHS South Yorkshire specialists.',
  'https://www.youtube.com/watch?v=bSmPmsgcq80',
  NULL,
  420,
  'exercise',
  NULL,
  ARRAY['pelvic floor', 'NHS', 'pregnancy health', 'pelvic health', 'South Yorkshire'],
  false,
  3
),

-- Labour Breathing Videos (2 videos)
(
  'NHS: Antenatal Breathing and Relaxation for Labour',
  'Official NHS guide to breathing and relaxation techniques specifically designed for labour. Practice these techniques to feel prepared and confident on your delivery day.',
  'https://www.youtube.com/watch?v=6lEeXQE8q_0',
  NULL,
  600,
  'breathing',
  3,
  ARRAY['breathing', 'labour', 'NHS', 'relaxation', 'antenatal', 'contractions'],
  true,
  1
),
(
  'Royal Berkshire NHS: Breathing Exercises and Movement in Labour',
  'Learn effective breathing exercises and movement techniques to help you during labour, presented by Royal Berkshire NHS Foundation Trust.',
  'https://www.youtube.com/watch?v=rKWjmk1cKhE',
  NULL,
  480,
  'breathing',
  3,
  ARRAY['breathing', 'labour', 'NHS', 'movement', 'delivery', 'Royal Berkshire'],
  true,
  2
);
