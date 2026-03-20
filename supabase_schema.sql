-- ==========================================
-- SUPABASE SCHEMA CHO NỀN TẢNG HÓA HỌC
-- Chạy toàn bộ trong SQL Editor của Supabase
-- ==========================================

-- 1. BẢNG USERS
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher')),
  full_name TEXT NOT NULL,
  class_name TEXT,
  phone TEXT,
  parent_phone TEXT,
  avatar_icon TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Teachers can view all" ON public.users;
CREATE POLICY "Teachers can view all" ON public.users FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'teacher')
);
DROP POLICY IF EXISTS "Users can update own" ON public.users;
CREATE POLICY "Users can update own" ON public.users FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can insert own" ON public.users;
CREATE POLICY "Users can insert own" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. BẢNG BADGES
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL,
  condition_code TEXT UNIQUE NOT NULL
);

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read badges" ON public.badges;
CREATE POLICY "Anyone can read badges" ON public.badges FOR SELECT USING (true);

-- Chèn badges mặc định
INSERT INTO public.badges (name, description, icon, condition_code) VALUES
  ('Nhà Giả Kim', 'Đạt điểm tuyệt đối 3 bài liên tiếp', '🧪', 'perfect_3_streak'),
  ('Chăm Chỉ', 'Luôn nộp bài sớm nhất lớp', '⭐', 'earliest_submit'),
  ('Siêu Sao', 'Đứng top 1 bảng xếp hạng', '🏆', 'top_1_rank'),
  ('Kiên Trì', 'Hoàn thành tất cả bài tập', '💪', 'all_completed')
ON CONFLICT (condition_code) DO NOTHING;

-- 3. BẢNG USER_BADGES
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE NOT NULL,
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, badge_id)
);
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read user_badges" ON public.user_badges;
CREATE POLICY "Anyone can read user_badges" ON public.user_badges FOR SELECT USING (true);

-- 4. BẢNG ASSIGNMENTS
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'quiz' CHECK (type IN ('quiz', 'essay')),
  time_limit_minutes INTEGER DEFAULT 30,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE
);
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read published assignments" ON public.assignments;
CREATE POLICY "Anyone can read published assignments" ON public.assignments FOR SELECT USING (
  is_published = true OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'teacher')
);
DROP POLICY IF EXISTS "Teachers can manage assignments" ON public.assignments;
CREATE POLICY "Teachers can manage assignments" ON public.assignments FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'teacher')
);

-- 5. BẢNG QUESTIONS
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'multiple_choice' CHECK (type IN ('multiple_choice', 'free_text')),
  correct_answer TEXT,
  options JSONB,
  points INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0
);
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read questions" ON public.questions;
CREATE POLICY "Anyone can read questions" ON public.questions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Teachers can manage questions" ON public.questions;
CREATE POLICY "Teachers can manage questions" ON public.questions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'teacher')
);

-- 6. BẢNG SUBMISSIONS
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  score NUMERIC(5,2),
  total_points INTEGER,
  teacher_feedback TEXT,
  cheat_flags INTEGER DEFAULT 0,
  cheat_log JSONB DEFAULT '[]'::jsonb,
  is_completed BOOLEAN DEFAULT false,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  submitted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(assignment_id, student_id)
);
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Students read own submissions" ON public.submissions;
CREATE POLICY "Students read own submissions" ON public.submissions FOR SELECT USING (
  student_id = auth.uid() OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'teacher')
);
DROP POLICY IF EXISTS "Students insert own" ON public.submissions;
CREATE POLICY "Students insert own" ON public.submissions FOR INSERT WITH CHECK (student_id = auth.uid());
DROP POLICY IF EXISTS "Students and teachers update" ON public.submissions;
CREATE POLICY "Students and teachers update" ON public.submissions FOR UPDATE USING (
  student_id = auth.uid() OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'teacher')
);

-- 7. BẢNG STUDENT_ANSWERS
CREATE TABLE IF NOT EXISTS public.student_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  answer_given TEXT,
  is_correct BOOLEAN,
  UNIQUE(submission_id, question_id)
);
ALTER TABLE public.student_answers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Students read own answers" ON public.student_answers;
CREATE POLICY "Students read own answers" ON public.student_answers FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.submissions WHERE submissions.id = student_answers.submission_id AND (submissions.student_id = auth.uid() OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'teacher')))
);
DROP POLICY IF EXISTS "Students insert own answers" ON public.student_answers;
CREATE POLICY "Students insert own answers" ON public.student_answers FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.submissions WHERE submissions.id = student_answers.submission_id AND submissions.student_id = auth.uid())
);

-- 8. Hàm tự động tạo profile khi user đăng ký
-- QUAN TRỌNG: Luôn gán role = 'student'. Tài khoản giáo viên phải tạo thủ công qua SQL.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, role, full_name, class_name)
  VALUES (
    NEW.id,
    'student',
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Chưa đặt tên'),
    COALESCE(NEW.raw_user_meta_data->>'class_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- TẠO TÀI KHOẢN GIÁO VIÊN (ADMIN)
-- ==========================================
-- Bước 1: Đăng ký tài khoản giáo viên qua giao diện web bình thường (sẽ tự động là student).
-- Bước 2: Chạy lệnh SQL dưới đây để nâng cấp lên teacher.
--         Thay 'email_giao_vien@example.com' bằng email thật của giáo viên.
--
-- UPDATE public.users
-- SET role = 'teacher'
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'email_giao_vien@example.com');

-- Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
