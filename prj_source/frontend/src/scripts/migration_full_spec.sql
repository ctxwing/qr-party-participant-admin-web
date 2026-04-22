-- 1. participants 테이블 확장 (필드 추가)
ALTER TABLE public.participants 
ADD COLUMN IF NOT EXISTS is_first_applied boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_second_applied boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS cupid_count integer DEFAULT 2,
ADD COLUMN IF NOT EXISTS like_count integer DEFAULT 3;

-- 2. interactions 테이블에 session_id 추가 (명세서 반영)
ALTER TABLE public.interactions 
ADD COLUMN IF NOT EXISTS session_id uuid REFERENCES public.party_sessions(id);

-- 3. 기존 데이터 초기화 (횟수 부여)
UPDATE public.participants 
SET cupid_count = 2, like_count = 3 
WHERE cupid_count IS NULL OR like_count IS NULL;
