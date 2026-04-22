-- 1. 참여자 테이블 확장
ALTER TABLE public.participants 
ADD COLUMN IF NOT EXISTS is_first_applied boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_second_applied boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS cupid_count integer DEFAULT 2,
ADD COLUMN IF NOT EXISTS like_count integer DEFAULT 3;

-- 2. 상호작용 테이블 생성 (participants.id가 text이므로 타입을 맞춤)
CREATE TABLE IF NOT EXISTS public.interactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL, -- 'CUPID', 'LIKE'
  sender_id text REFERENCES public.participants(id),
  receiver_id text REFERENCES public.participants(id),
  session_id uuid REFERENCES public.party_sessions(id),
  weight integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- 3. 기존 데이터 보정
UPDATE public.participants 
SET cupid_count = 2, like_count = 3 
WHERE cupid_count IS NULL OR like_count IS NULL;

-- 4. 실시간(Realtime) 설정 (이미 존재할 수 있으므로 에러 무시)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- do nothing
END $$;

ALTER PUBLICATION supabase_realtime ADD TABLE interactions;
