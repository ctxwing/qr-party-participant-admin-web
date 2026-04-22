-- 시스템 설정 테이블 (가중치 등 관리)
CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 초기 가중치 설정 삽입
INSERT INTO public.system_settings (key, value)
VALUES ('ranking_weights', '{"like": 1, "message": 5, "cupid": 10}')
ON CONFLICT (key) DO NOTHING;
