# QR 파티 프로젝트 전용 Supabase 명세서

본 문서는 'QR 파티 모바일 웹' 프로젝트에 특화된 Supabase 데이터베이스 구조 및 실시간(Realtime) 설정 내용을 기록합니다.

## 1. SQL 실행 시 주의사항 (중요)

Supabase SQL Editor에서 아래 쿼리를 실행할 때 **"Potential issue detected"** 경고창이 나타날 수 있습니다. 이는 새 테이블에 보안 정책(RLS)이 설정되지 않았음을 경고하는 것입니다.

- **처리 방법**: 반드시 **`Run and enable RLS`** 버튼을 클릭하십시오.
- **참고**: 본 문서의 스크립트 하단에는 이미 RLS 활성화(`ENABLE ROW LEVEL SECURITY`)와 익명 접근 허용(`CREATE POLICY`) 코드가 포함되어 있어, 실행 후 즉시 안전하게 사용 가능합니다.

## 2. 데이터베이스 스키마 (DDL)

프로젝트 운영에 필요한 3개 핵심 테이블의 구조입니다. Supabase SQL Editor에서 실행하십시오.

```sql
-- 1. 알림 테이블 (SOS 및 시스템 알림)
CREATE TABLE IF NOT EXISTS public.alerts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  participant_id text,
  type text,           -- 'SOS', 'BROADCAST', 'SYSTEM'
  message text,
  resolved boolean DEFAULT false
);

-- 2. 메시지 테이블 (참여자 간 쪽지)
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  sender_id text,
  receiver_id text,
  content text,
  is_read boolean DEFAULT false
);

-- 3. 참여자 테이블 (실시간 상태 관리)
CREATE TABLE IF NOT EXISTS public.participants (
  id text PRIMARY KEY, -- 익명 Auth의 User ID와 연동
  nickname text,
  created_at timestamptz DEFAULT now(),
  last_active timestamptz DEFAULT now()
);
```

## 3. 실시간(Realtime) 활성화 설정

참여자들이 즉시 알림과 쪽지를 받을 수 있도록 다음 설정을 반드시 완료해야 합니다.

### 3.1 Publication 설정 (SQL)
```sql
-- Publication 생성 및 테이블 추가
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

ALTER PUBLICATION supabase_realtime ADD TABLE alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE participants;
```

### 3.2 Dashboard 수동 설정 확인
SQL 실행이 완료된 후, 실제로 실시간 기능이 켜졌는지 다음 두 가지 방법 중 하나로 확인하십시오.

- **방법 A (권장)**: **Database** > **Publications** 메뉴 클릭 -> `supabase_realtime` 행의 `Tables` 컬럼에 `3 tables`가 포함되어 있는지 확인
- **방법 B (개별 확인)**: **Database** > **Tables** 메뉴 클릭 -> 각 테이블(`alerts`, `messages`, `participants`)의 **Realtime** 열에 **Active** 표시가 있는지 확인

> [!TIP]
> 만약 표시되지 않는다면, 해당 테이블의 `Edit Table` 버튼을 누르고 하단의 **Enable Realtime** 체크박스를 직접 체크한 후 저장하십시오.

## 4. 보안 정책 (RLS)

MVP 단계에서는 빠른 개발을 위해 익명 로그인을 마친 모든 사용자(`authenticated`)의 접근을 허용합니다.

```sql
-- 1. RLS 활성화
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- 2. 기존 정책 삭제 (재설정 시 충돌 방지)
DROP POLICY IF EXISTS "auth_full_access_alerts" ON alerts;
DROP POLICY IF EXISTS "auth_full_access_messages" ON messages;
DROP POLICY IF EXISTS "auth_full_access_participants" ON participants;

-- 3. 인증된 사용자(익명 로그인 유저 포함)에게 전체 권한 부여
CREATE POLICY "auth_full_access_alerts" ON alerts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_full_access_messages" ON messages FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_full_access_participants" ON participants FOR ALL TO authenticated USING (true) WITH CHECK (true);
```

---
**프로젝트**: QR Party Participant Admin Web
**업데이트**: 2026-04-22
