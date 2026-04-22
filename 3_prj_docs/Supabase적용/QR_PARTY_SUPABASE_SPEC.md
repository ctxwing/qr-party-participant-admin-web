# QR 파티 프로젝트 전용 Supabase 명세서

본 문서는 'QR 파티 모바일 웹' 프로젝트에 특화된 Supabase 데이터베이스 구조 및 실시간(Realtime) 설정 내용을 기록합니다.

## 1. SQL 실행 시 주의사항 (중요)

Supabase SQL Editor에서 아래 쿼리를 실행할 때 **"Potential issue detected"** 경고창이 나타날 수 있습니다. 이는 새 테이블에 보안 정책(RLS)이 설정되지 않았음을 경고하는 것입니다.

- **처리 방법**: 반드시 **`Run and enable RLS`** 버튼을 클릭하십시오.
- **참고**: 본 문서의 스크립트 하단에는 이미 RLS 활성화(`ENABLE ROW LEVEL SECURITY`)와 익명 접근 허용(`CREATE POLICY`) 코드가 포함되어 있어, 실행 후 즉시 안전하게 사용 가능합니다.

## 2. 데이터베이스 스키마 (DDL)

프로젝트 운영에 필요한 5개 핵심 테이블의 구조입니다. Supabase SQL Editor에서 실행하십시오.

```sql
-- 1. 파티 세션 테이블
CREATE TABLE IF NOT EXISTS public.party_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  status text DEFAULT 'READY', -- 'READY', 'ONGOING', 'FINISHED'
  participant_limit integer DEFAULT 100,
  created_at timestamptz DEFAULT now()
);

-- 2. 참여자 테이블
CREATE TABLE IF NOT EXISTS public.participants (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid REFERENCES public.party_sessions(id),
  anonymous_id text NOT NULL UNIQUE, -- Supabase Auth ID 연동
  nickname text NOT NULL,
  nickname_change_count integer DEFAULT 0,
  last_active timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- 3. 메시지 테이블
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid REFERENCES public.party_sessions(id),
  sender_id uuid REFERENCES public.participants(id),
  receiver_id uuid REFERENCES public.participants(id),
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 4. 상호작용 테이블 (큐피트/좋아요)
CREATE TABLE IF NOT EXISTS public.interactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL, -- 'CUPID', 'LIKE'
  sender_id uuid REFERENCES public.participants(id),
  receiver_id uuid REFERENCES public.participants(id),
  weight integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- 5. 알림 테이블 (SOS 및 시스템 알림)
CREATE TABLE IF NOT EXISTS public.alerts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid REFERENCES public.party_sessions(id),
  participant_id uuid REFERENCES public.participants(id),
  type text NOT NULL, -- 'SOS', 'SYSTEM'
  message text NOT NULL,
  is_resolved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
```

## 3. 실시간(Realtime) 활성화 설정

참자들이 즉시 알림과 쪽지를 받을 수 있도록 다음 설정을 반드시 완료해야 합니다.

### 3.1 Publication 설정 (SQL)
```sql
-- Publication 생성 및 테이블 추가
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

-- 테이블들을 Publication에 추가 (이미 존재하는 테이블은 에러가 날 수 있으므로 주의)
ALTER PUBLICATION supabase_realtime ADD TABLE party_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE participants;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE interactions;
ALTER PUBLICATION supabase_realtime ADD TABLE alerts;
```

## 4. 보안 정책 (RLS)

MVP 단계에서는 빠른 개발을 위해 익명 로그인을 마친 모든 사용자(`authenticated`)의 접근을 허용합니다.

```sql
-- RLS 활성화
ALTER TABLE party_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- 익명/인증된 사용자에게 전체 권한 부여
CREATE POLICY "auth_full_access" ON party_sessions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_full_access" ON participants FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all to authenticated" ON messages FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all to authenticated" ON interactions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all to authenticated" ON alerts FOR ALL TO authenticated USING (true) WITH CHECK (true);
```

## 5. 트러블슈팅

### 5.1 "there is no unique or exclusion constraint matching the ON CONFLICT specification" 에러 발생 시
`participants` 테이블에 `anonymous_id` 유니크 제약 조건이 누락된 경우입니다. 아래 쿼리를 실행하십시오.
```sql
ALTER TABLE public.participants 
ADD CONSTRAINT participants_anonymous_id_key UNIQUE (anonymous_id);
```

### 5.2 "Could not find the table in the schema cache" 에러 발생 시
새로 생성된 테이블이 아직 API 캐시에 반영되지 않은 경우입니다. 1~2분 정도 기다리거나, 브라우저를 새로고침하십시오.

### 5.3 "null value in column 'id' violates not-null constraint" 에러 발생 시
테이블의 `id` 컬럼에 기본값(`DEFAULT gen_random_uuid()`) 설정이 누락된 경우입니다. 아래 쿼리를 실행하십시오.
```sql
-- UUID 생성 확장 활성화 (필요 시)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 기본값 설정
ALTER TABLE public.participants 
ALTER COLUMN id SET DEFAULT gen_random_uuid();
```

---
**프로젝트**: QR Party Participant Admin Web
**업데이트**: 2026-04-22 (Full Schema v2.3)
