-- 참여자 활동일 및 행사 종료일 컬럼 추가 마이그레이션
ALTER TABLE public.participants ADD COLUMN IF NOT EXISTS last_participated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.party_sessions ADD COLUMN IF NOT EXISTS end_time TIMESTAMPTZ;
ALTER TABLE public.party_sessions ADD COLUMN IF NOT EXISTS title TEXT DEFAULT '파티';

-- 닉네임 변경 이력 테이블 생성
CREATE TABLE IF NOT EXISTS public.nickname_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    participant_id UUID REFERENCES public.participants(id) ON DELETE CASCADE,
    old_nickname TEXT,
    new_nickname TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 닉네임 변경 시 자동 기록 트리거 함수
CREATE OR REPLACE FUNCTION record_nickname_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.nickname IS DISTINCT FROM NEW.nickname) THEN
        INSERT INTO public.nickname_history (participant_id, old_nickname, new_nickname)
        VALUES (NEW.id, OLD.nickname, NEW.nickname);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 설정
DROP TRIGGER IF EXISTS on_nickname_change ON public.participants;
CREATE TRIGGER on_nickname_change
    BEFORE UPDATE ON public.participants
    FOR EACH ROW
    EXECUTE FUNCTION record_nickname_change();
