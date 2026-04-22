# Supabase DB 초기화 및 Realtime 활성화 SQL

이 쿼리를 Supabase Dashboard의 **SQL Editor**에 붙여넣고 실행하십시오.

```sql
-- 1. 테이블 생성
CREATE TABLE IF NOT EXISTS public.alerts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  participant_id text,
  type text,
  message text,
  resolved boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  sender_id text,
  receiver_id text,
  content text,
  is_read boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.participants (
  id text PRIMARY KEY,
  nickname text,
  created_at timestamptz DEFAULT now(),
  last_active timestamptz DEFAULT now()
);

-- 2. Realtime 활성화
-- publication이 없으면 생성
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

-- 테이블을 Realtime 구독 목록에 추가
-- (이미 추가된 경우 오류가 발생할 수 있으므로 개별 실행 권장)
ALTER PUBLICATION supabase_realtime ADD TABLE alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE participants;

-- 3. RLS 설정 (참고: MVP를 위해 모든 권한을 일단 허용하거나 정책을 세분화하세요)
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- 익명 사용자 읽기/쓰기 정책 예시
CREATE POLICY "Allow anon access" ON alerts FOR ALL TO anon USING (true);
CREATE POLICY "Allow anon access" ON messages FOR ALL TO anon USING (true);
CREATE POLICY "Allow anon access" ON participants FOR ALL TO anon USING (true);
```
