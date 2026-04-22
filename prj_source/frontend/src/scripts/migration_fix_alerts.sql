-- alerts 테이블 receiver_id 타입 수정: UUID -> TEXT (participants.id가 text 타입이므로)
-- 1. 기존 UUID 컬럼 제거 후 TEXT 타입으로 재생성
ALTER TABLE public.alerts DROP COLUMN IF EXISTS receiver_id;
ALTER TABLE public.alerts ADD COLUMN receiver_id TEXT REFERENCES public.participants(id) ON DELETE CASCADE;

-- 2. session_id 컬럼 추가 (없을 경우)
ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES public.party_sessions(id);
