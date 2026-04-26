# Supabase 데이터베이스 수정 가이드

**작성일**: 2026-04-27  
**방법**: Node.js pg 패키지를 사용한 직접 PostgreSQL 연결

---

## 개요

Supabase.com의 클라우드 데이터베이스를 수정할 때는 **Supabase CLI 대신 Node.js pg 패키지를 사용**하여 직접 연결한다.

**이유**: 
- CLI 환경 설정 복잡도 회피
- 직접 SQL 실행으로 즉시성 확보
- 스크립트 재사용 가능

---

## 필수 정보

프로젝트의 `.env.local` 파일에서 다음 정보 확인:

```
NEXT_PUBLIC_SUPABASE_URL=https://hlbgedbgycamzvbbykdc.supabase.co
DATABASE_URL=postgresql://postgres.hlbgedbgycamzvbbykdc:%40Supabase01%40@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?sslmode=require
```

---

## 단계별 실행 방법

### 1️⃣ Node.js 스크립트 작성

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.hlbgedbgycamzvbbykdc:%40Supabase01%40@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }  // 중요: SSL 인증서 오류 무시
});

async function setupDatabase() {
  try {
    const queries = [
      'CREATE TABLE IF NOT EXISTS public.admin_users (...)',
      'INSERT INTO public.admin_users VALUES (...)',
      'CREATE POLICY "policy_name" ON public.table_name ...'
    ];

    for (const query of queries) {
      await pool.query(query);
      console.log('✅ 실행됨:', query.slice(0, 70));
    }

    console.log('✅✅✅ 완료! ✅✅✅');
    await pool.end();
  } catch (err) {
    console.error('❌ 에러:', err.message);
    process.exit(1);
  }
}

setupDatabase();
```

### 2️⃣ 실행

```bash
# frontend 디렉토리에서 실행
cd prj_source/frontend

node << 'EOF'
# 위의 스크립트 내용 붙여넣기
EOF
```

---

## 실제 적용 예시

### A. RLS 정책 설정

```javascript
// RLS 정책 추가
const queries = [
  'ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;',
  'DROP POLICY IF EXISTS "Allow all users to update alerts" ON public.alerts;',
  `CREATE POLICY "Allow admin to update alerts"
   ON public.alerts FOR UPDATE
   USING (
     current_setting('request.headers')::jsonb->>'x-admin-user-id'
     IN (SELECT better_auth_user_id FROM public.admin_users)
   )
   WITH CHECK (
     current_setting('request.headers')::jsonb->>'x-admin-user-id'
     IN (SELECT better_auth_user_id FROM public.admin_users)
   );`
];
```

### B. 테이블 생성

```javascript
// admin_users 테이블 생성
const queries = [
  `CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    better_auth_user_id TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
  );`,
  
  // 현재 admin 추가
  `INSERT INTO public.admin_users (better_auth_user_id, email, name)
   VALUES ('yXPg3GolWNcpzg9nXOyq45A4MGQS104c', 'admin@gmail.com', 'Admin')
   ON CONFLICT (better_auth_user_id) DO NOTHING;`
];
```

### C. 데이터 확인

```javascript
// 적용 결과 확인
const result = await pool.query('SELECT * FROM public.admin_users;');
console.log('Admin users:', result.rows);

const policies = await pool.query(
  "SELECT tablename, policyname FROM pg_policies WHERE tablename = 'alerts';"
);
console.log('Alert policies:', policies.rows);
```

---

## ⚠️ 주의사항

### SSL 오류 처리
```javascript
ssl: { rejectUnauthorized: false }  // 필수!
```
AWS Supabase의 자체 서명 인증서로 인한 오류 무시

### 연결 문자열 확인
- Pooler 사용: `aws-1-ap-northeast-2.pooler.supabase.com:6543`
- 포트: `6543` (pooler) 또는 `5432` (direct)
- `?sslmode=require` 필수

### 스크립트 실행 위치
- **반드시** `prj_source/frontend/` 디렉토리에서 실행
- pg 모듈이 설치된 디렉토리에서 실행해야 함

---

## 자동화 스크립트 저장

자주 사용하는 쿼리는 `setup-rls.js` 같은 파일로 저장하고 재사용:

```bash
# setup-rls.js 실행
node setup-rls.js
```

---

## 트러블슈팅

### "pg module not found"
```bash
# 현재 디렉토리 확인 후 실행
cd prj_source/frontend
npm install pg  # 필요시
node script.js
```

### "self-signed certificate"
```javascript
// 반드시 포함
ssl: { rejectUnauthorized: false }
```

### 연결 타임아웃
- AWS 보안 그룹 확인
- Pooler vs Direct 연결 모드 확인
- 방화벽 규칙 확인

---

## 성공 확인

실행 후 다음 메시지 출력:
```
✅ CREATE TABLE IF NOT EXISTS ...
✅ INSERT INTO public.admin_users ...
✅ CREATE POLICY ...

✅✅✅ 완료! ✅✅✅

정책 목록:
  ✓ Allow admin to update alerts
  ✓ Allow anyone to read alerts
```

---

## 참고: 이전 방법 (비추천)

❌ **Supabase CLI** (권장하지 않음)
- 환경 변수 설정 복잡
- 인증 절차 많음
- 로컬 저장소 연결 필요

✅ **Node.js pg 패키지** (현재 방법)
- 간단한 스크립트
- 즉시 실행
- 재사용 가능

---

## 다음 번 수정 체크리스트

- [ ] `.env.local`에서 DATABASE_URL 확인
- [ ] Node.js 스크립트 작성
- [ ] `prj_source/frontend/` 디렉토리에서 실행
- [ ] `ssl: { rejectUnauthorized: false }` 포함 확인
- [ ] 실행 후 완료 메시지 확인
- [ ] 데이터베이스에서 변경사항 확인 (쿼리 결과 출력)
