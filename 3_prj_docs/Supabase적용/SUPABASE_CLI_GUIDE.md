# Supabase CLI 관리 및 프로젝트 적용 가이드

본 문서는 본 프로젝트에서 Supabase CLI를 설치하고, 원격 데이터베이스에 접근하여 스키마를 관리하는 방법을 기록합니다.

## 1. CLI 설치 방법

본 환경에서는 `npm install -g supabase`가 정책상 차단되어 있으므로, GitHub 최신 릴리스에서 바이너리를 직접 다운로드하여 설치하는 방식을 사용합니다.

### 설치 스크립트
```bash
# 아키텍처 확인 후 최신 바이너리 다운로드 및 설치
curl -sSL https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz -o supabase.tar.gz
tar -xf supabase.tar.gz
mv supabase /home/ctxwing/.bun/bin/
chmod +x /home/ctxwing/.bun/bin/supabase
```

## 2. 데이터베이스 접근 방법

### 2.1 Direct Connection (현재 프로젝트 적용 방식)
로그인이나 토큰 없이 `.env.local`의 DB Connection String을 사용하여 직접 SQL을 실행합니다.

**명령어 예시:**
```bash
supabase db query --db-url "postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres" -f [SQL파일경로]
```
- **포트 참고**: 기본 `5432` 포트 또는 트랜잭션 풀러용 `6543` 포트를 사용합니다.
- **주의**: 비밀번호에 특수문자(`@` 등)가 포함된 경우 반드시 **퍼센트 인코딩**(`@` -> `%40`) 처리를 해야 합니다.

### 2.2 Management API (Link 방식)
Supabase 개인 액세스 토큰(Personal Access Token)을 사용하여 프로젝트를 로컬과 동기화합니다.
```bash
supabase link --project-ref [PROJECT_ID]
```
- 이 방식은 `db push`, `db pull` 등 마이그레이션 도구 활용 시 필수적입니다.

## 3. 프로젝트 내 적용 현황 및 트러블슈팅

### 3.1 네트워크 제약 사항 (IPv6 관련)
- **증상**: `connect: cannot assign requested address` 또는 `connection timeout` 에러 발생.
- **원인**: Supabase 기본 호스트(`db.[ref].supabase.co`)는 IPv6 전용(AAAA 레코드)이라 IPv4 전용 환경에서 접속 불가.
- **해결 방안 (기술적 해결)**: 
  1. **Pooler 호스트 사용**: IPv4를 지원하는 커넥션 풀러 호스트(`aws-0-ap-northeast-2.pooler.supabase.com`)를 사용합니다.
     - **검증 완료**: 현재 서버 환경에서 `nc` 테스트를 통해 포트 5432 연결 성공을 확인했습니다.
  2. **사용자 아이디 형식 및 SNI (주의)**: 
     - 풀러 접속은 SNI(Server Name Indication) 기술을 사용하므로, CLI 명령어(`db query` 등) 사용 시 테넌트 식별자(`postgres.[PROJECT_REF]`)를 요구하거나 SNI 핸드쉐이크 에러가 발생할 수 있습니다.
     - **해결**: 연결 문자열에 `?options=project%3D[PROJECT_REF]`를 추가하거나, SNI를 지원하는 전문 DB 클라이언트(psql, DBeaver 등)를 사용하면 100% 접속 가능합니다.
  3. **비밀번호 인코딩**: 비밀번호 내 `@` 등은 반드시 `%40`으로 인코딩해야 합니다.

### 3.2 닉네임/신청상태 Full Spec 적용
현재 프로젝트의 요구사항(닉네임 3회 제한, 1/2차 신청 상태 관리)을 반영하기 위해 `src/scripts/migration_full_spec.sql` 파일을 CLI를 통해 실행하여 DB 구조를 고도화하였습니다.

---

## 4. Node.js pg 패키지를 사용한 직접 DB 수정 (2026-04-27 추가)

### 개요
Supabase CLI 인증 설정이 복잡할 때는 **Node.js pg 패키지를 사용한 직접 PostgreSQL 연결**을 사용합니다.

### 필수 정보
```
PROJECT_REF: hlbgedbgycamzvbbykdc
DATABASE_URL: postgresql://postgres.hlbgedbgycamzvbbykdc:%40Supabase01%40@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?sslmode=require
SUPABASE_URL: https://hlbgedbgycamzvbbykdc.supabase.co
Personal Access Token: 2_ctx/0_secret/Supabase 참조
```

### 실행 방법

**Step 1: Node.js 스크립트 작성 (prj_source/frontend/ 디렉토리)**
```javascript
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.hlbgedbgycamzvbbykdc:%40Supabase01%40@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }  // 중요: SSL 인증서 오류 무시
});

async function setupDatabase() {
  try {
    const queries = [
      // 여기에 SQL 쿼리 추가
      'ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;',
      'CREATE POLICY "Allow admin to update alerts" ON public.alerts FOR UPDATE ...'
    ];

    for (const query of queries) {
      await pool.query(query);
      console.log('✅ 실행됨:', query.slice(0, 70));
    }

    // 결과 확인
    const result = await pool.query('SELECT * FROM public.admin_users;');
    console.log('결과:', result.rows);

    await pool.end();
  } catch (err) {
    console.error('❌ 에러:', err.message);
    process.exit(1);
  }
}

setupDatabase();
```

**Step 2: 실행**
```bash
cd prj_source/frontend
node << 'EOF'
# 위 스크립트 붙여넣기
EOF
```

### 실제 적용 예시

#### A. RLS 정책 설정
```sql
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all users to update alerts" ON public.alerts;

CREATE POLICY "Allow admin to update alerts"
ON public.alerts FOR UPDATE
USING (
  current_setting('request.headers')::jsonb->>'x-admin-user-id'
  IN (SELECT better_auth_user_id FROM public.admin_users)
)
WITH CHECK (
  current_setting('request.headers')::jsonb->>'x-admin-user-id'
  IN (SELECT better_auth_user_id FROM public.admin_users)
);
```

#### B. admin_users 테이블 생성
```sql
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  better_auth_user_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

INSERT INTO public.admin_users (better_auth_user_id, email, name)
VALUES ('yXPg3GolWNcpzg9nXOyq45A4MGQS104c', 'admin@gmail.com', 'Admin')
ON CONFLICT (better_auth_user_id) DO NOTHING;
```

### ⚠️ 주의사항

1. **SSL 오류 처리** (필수)
   ```javascript
   ssl: { rejectUnauthorized: false }
   ```
   AWS Supabase의 자체 서명 인증서 오류 무시

2. **실행 위치**
   - 반드시 `prj_source/frontend/` 디렉토리에서 실행
   - pg 모듈이 설치된 디렉토리

3. **CONNECTION STRING**
   - Pooler 사용: `aws-1-ap-northeast-2.pooler.supabase.com:6543`
   - 포트: `6543` (pooler) 또는 `5432` (direct)
   - `sslmode=require` 필수

### CLI vs Node.js 비교

| 항목 | Supabase CLI | Node.js pg |
|------|--------------|-----------|
| 설정 복잡도 | 높음 (login, link) | 낮음 (CONNECTION STRING만) |
| 인증 | Personal Access Token | CONNECTION STRING |
| 속도 | 느림 (인증 과정) | 빠름 (직접 연결) |
| 마이그레이션 | 우수 (db push/pull) | 수동 SQL 실행 |
| 간단한 수정 | ❌ | ✅ 추천 |

---
**업데이트**: 2026-04-27 추가 (Node.js pg 방식)
**원본 업데이트**: 2026-04-22
**관리자**: Antigravity (AI)
