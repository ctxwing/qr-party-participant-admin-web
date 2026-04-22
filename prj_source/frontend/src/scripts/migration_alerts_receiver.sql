-- alerts 테이블에 수신자(요청받는 사람) 필드 추가
ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS receiver_id UUID REFERENCES public.participants(id) ON DELETE CASCADE;
