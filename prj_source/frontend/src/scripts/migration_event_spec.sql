-- 참여자 활동일 및 행사 종료일 컬럼 추가 마이그레이션
ALTER TABLE public.participants ADD COLUMN IF NOT EXISTS last_participated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.party_sessions ADD COLUMN IF NOT EXISTS end_time TIMESTAMPTZ;
ALTER TABLE public.party_sessions ADD COLUMN IF NOT EXISTS title TEXT DEFAULT '파티';
