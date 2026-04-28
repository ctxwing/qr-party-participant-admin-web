# Supabase Cloud 완전 백업 및 복원 가이드

**백업 일시**: 2026-04-28 11:50 KST  
**백업 도구**: Supabase CLI v2.90.0 (`supabase db dump`)  
**복원 대상**: 동일한 프로젝트 또는 새 Supabase 프로젝트에 완전 복원

---

## 0. 용어 설명

### RLS (Row Level Security) — 행 수준 보안

PostgreSQL의 기능으로, **테이블의 각 행(Row)에 대해 접근 권한을 제어**하는 보안 메커니즘입니다.

Supabase에서는 기본적으로 모든 테이블이 외부에서 접근 가능하므로, RLS를 활성화하고 정책(Policy)을 설정하지 않으면 누구나 모든 데이터를 읽고 수정할 수 있습니다.

**작동 방식:**
```
클라이언트 요청 → Supabase API → PostgreSQL RLS 정책 평가 → 조건 만족하는 행만 반환
```

**본 프로젝트의 RLS 예시:**
| 정책 | 대상 테이블 | 설명 |
|------|-----------|------|
| `anon_insert_messages` | `messages` | 익명 사용자는 쪽지 삽입만 가능 |
| `anon_read_participants` | `participants` | 익명 사용자는 참여자 목록 조회만 가능 |
| `Allow admin to update alerts` | `alerts` | 관리자만 알림 수정 가능 (x-admin-user-id 헤더로 검증) |
| `auth_full_access_participants` | `participants` | 인증된 사용자는 참여자 전체 접근 |

> **참고**: RLS가 비활성화된 테이블(`user`, `account`, `session`, `verification`, `admin_users`, `interactions`)은 Supabase의 service_role 키를 통해서만 접근해야 합니다.

---

## 1. 백업 파일 구성

```
DB-backup-Supabase/
├── README-백업-복원.md    ← 이 문서 (복원 절차)
├── schema-full.sql        ← 스키마 전체 (DDL + RLS 정책 + FK + 권한 + Realtime Publication)
├── data.sql               ← 전체 데이터 (auth + public + storage, COPY 형식)
├── roles.sql              ← DB 역할(roles) 정의
├── env.local.backup       ← .env.local 원본 (API 키, 연결 문자열 포함)
└── data.json              ← (구버전) 2026-04-23 백업 (참고용)
```

### 백업 파일별 상세 내용

| 파일 | 크기 | 내용 |
|------|------|------|
| `schema-full.sql` (19KB) | 테이블 DDL 14개, RLS 정책 17개, FK 제약조건, 인덱스, 권한(GRANT), Realtime Publication, 확장(pgcrypto, uuid-ossp 등) |
| `data.sql` (74KB) | auth 스키마 22개 테이블 + public 스키마 14개 테이블 + storage 스키마 7개 테이블의 전체 데이터 |
| `roles.sql` (297B) | DB 역할 정의 (anon, authenticated, service_role 등) |
| `env.local.backup` | 프로젝트 환경변수 전체 |

---

## 2. 백업 대상 프로젝트 정보

```
프로젝트명:     qr-party-participant-admin-web
Project Ref:    hlbgedbgycamzvbbykdc
리전:           ap-northeast-2 (서울)
DB 비밀번호:    @Supabase01@
DB 버전:        PostgreSQL 17.6
```

### 연결 문자열

Supabase는 2가지 연결 방식을 제공합니다:

| 구분 | 호스트 | 포트 | 용도 | IPv4 호환 |
|------|--------|------|------|-----------|
| **Pooler (Transaction Mode)** ⬅️ **현재 사용 중** | `aws-1-ap-northeast-2.pooler.supabase.com` | **6543** | CLI, 앱에서 사용 (권장) | ✅ |
| Direct (Session Mode) | `db.hlbgedbgycamzvbbykdc.supabase.co` | 5432 | 마이그레이션, 관리 작업 | ❌ (IPv6 only) |

**Pooler 연결 문자열 (CLI용 — 반드시 이것 사용):**
```
postgresql://postgres.hlbgedbgycamzvbbykdc:%40Supabase01%40@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres
```

**Direct 연결 문자열 (IPv6 전용 — ctx-tower에서 접근 불가):**
```
postgresql://postgres:%40Supabase01%40@db.hlbgedbgycamzvbbykdc.supabase.co:5432/postgres
```

### 연결 문자열 작성 규칙

1. **사용자명에 `.project_ref` 포함 필수** (Pooler 전용)
   - ✅ `postgres.hlbgedbgycamzvbbykdc` → Tenant 식별 가능
   - ❌ `postgres` → SNI 에러 (`ENOIDENTIFIER`)

2. **비밀번호 특수문자 인코딩**
   - `@` → `%40` 필수 (예: `@Supabase01@` → `%40Supabase01%40`)

3. **포트 번호**
   - Pooler: **6543** (Transaction Mode, 다수 연결 처리)
   - Direct: 5432 (단일 연결, IPv6 전용)

### CLI 명령어 기본 템플릿

```bash
# 모든 CLI 명령어의 기본 형태
export DB_URL="postgresql://postgres.hlbgedbgycamzvbbykdc:%40Supabase01%40@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres"

# SQL 파일 실행
supabase db query --db-url "$DB_URL" -f [SQL파일경로]

# 스키마 덤프
supabase db dump --db-url "$DB_URL" -f [출력파일]

# 데이터 덤프
supabase db dump --db-url "$DB_URL" --data-only --use-copy -f [출력파일]
```

---

## 3. 백업된 스키마 구조

### public 스키마 테이블 (14개)

| 테이블 | 용도 | RLS 활성화 |
|--------|------|-----------|
| `user` | Better Auth 관리자 사용자 | ❌ |
| `account` | Better Auth 계정 연동 | ❌ |
| `session` | Better Auth 세션 | ❌ |
| `verification` | Better Auth 인증 | ❌ |
| `admin_users` | 관리자 정보 (이메일, 이름) | ❌ |
| `participants` | 파티 참여자 (닉네임, 익명ID) | ✅ |
| `interactions` | 상호작용 (쪽지, 호감, 큐피드) | ❌ |
| `messages` | 쪽지 | ✅ |
| `alerts` | 알림 (SOS 등) | ✅ |
| `announcements` | 공지사항 | ✅ |
| `nickname_history` | 닉네임 변경 이력 | ✅ |
| `parties` | 파티 정보 | ✅ |
| `party_sessions` | 파티 세션 | ✅ |
| `system_settings` | 시스템 설정 (JSONB) | ✅ |

### RLS 정책 (17개)

- `alerts`: 익명 읽기/삽입, 관리자 업데이트/삭제/삽입, 인증 사용자 전체
- `announcements`: anon/authenticated 전체 허용
- `parties`: anon/authenticated 전체 허용
- `nickname_history`: anon/authenticated 전체 허용
- `messages`: anon 읽기/삽입, authenticated 전체
- `participants`: anon 읽기/수정, authenticated 전체
- `party_sessions`: anon 읽기, authenticated 전체
- `system_settings`: anon 읽기

### Realtime Publication (6개 테이블)

`alerts`, `announcements`, `interactions`, `messages`, `participants`, `party_sessions`

---

## 4. 복원 방법

### 전제조건
- Supabase CLI 설치 (`supabase --version`)
- 새 Supabase 프로젝트가 생성되어 있어야 함 (또는 기존 프로젝트 초기화)

### Step 0: Supabase CLI 설치 (필요 시)

```bash
# GitHub에서 바이너리 다운로드
curl -sSL https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz -o supabase.tar.gz
tar -xf supabase.tar.gz
mv supabase /home/ctxwing/.bun/bin/
chmod +x /home/ctxwing/.bun/bin/supabase
supabase --version
```

### Step 1: 새 프로젝트 생성 후 연결 정보 준비

새 Supabase 프로젝트의 다음 정보가 필요:
- `NEW_PROJECT_REF`: 새 프로젝트 Ref
- `NEW_DB_PASSWORD`: 새 프로젝트 DB 비밀번호
- `NEW_POOLER_HOST`: 새 프로젝트 Pooler 호스트 (예: `aws-1-ap-northeast-2.pooler.supabase.com`)

```bash
# 연결 문자열 설정
export DB_URL="postgresql://postgres.${NEW_PROJECT_REF}:${NEW_DB_PASSWORD}@${NEW_POOLER_HOST}:6543/postgres"
```

### Step 2: 복원 실행 (순서 중요)

**중요: 반드시 아래 순서대로 실행해야 합니다.**

#### 2-1: 확장(Extensions) 설치

```bash
supabase db query --db-url "$DB_URL" -f /dev/stdin << 'EOF'
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
EOF
```

> **참고**: `supabase_vault` 확장은 Supabase 클라우드에서만 사용 가능합니다. 로컬 또는 셀프호스팅에서는 생략합니다.

#### 2-2: 스키마 복원 (DDL + RLS + 권한)

```bash
supabase db query --db-url "$DB_URL" -f schema-full.sql
```

스키마 파일에는 다음이 포함되어 있습니다:
- 테이블 생성 (CREATE TABLE)
- 기본키, 고유키, 인덱스
- 외래키 (FOREIGN KEY)
- RLS 정책 (CREATE POLICY)
- Realtime Publication 설정
- 권한 부여 (GRANT)

#### 2-3: 데이터 복원

```bash
supabase db query --db-url "$DB_URL" -f data.sql
```

데이터 파일에는 다음이 포함되어 있습니다:
- auth 스키마: 사용자 계정, 세션, ID 등
- public 스키마: 모든 비즈니스 데이터
- storage 스키마: 버킷 메타데이터

#### 2-4: 역할(Roles) 복원 (필요 시)

```bash
supabase db query --db-url "$DB_URL" -f roles.sql
```

> Supabase 클라우드 프로젝트는 기본 역할이 이미 생성되어 있으므로, 이 단계는 **셀프호스팅** 환경에서만 필요합니다.

### Step 3: 환경변수 복원

`env.local.backup` 파일을 새 프로젝트의 값으로 수정 후 사용:

```bash
# 새 프로젝트의 값으로 변경 필요:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
# - DATABASE_URL

cp env.local.backup /path/to/prj_source/frontend/.env.local
# 편집기로 새 프로젝트의 값으로 수정
```

**반드시 변경해야 할 항목:**

| 변수 | 설명 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://{NEW_PROJECT_REF}.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 새 프로젝트의 anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | 새 프로젝트의 service_role key |
| `DATABASE_URL` | 새 Pooler 연결 문자열 |
| `BETTER_AUTH_SECRET` | 그대로 유지 (또는 새로 생성) |

---

## 5. 복원 검증

### 데이터 확인

```bash
# 테이블별 행 수 확인
supabase db query --db-url "$DB_URL" -f /dev/stdin << 'EOF'
SELECT 
  'participants' as 테이블, count(*) as 건수 FROM public.participants
UNION ALL SELECT 'interactions', count(*) FROM public.interactions
UNION ALL SELECT 'messages', count(*) FROM public.messages
UNION ALL SELECT 'alerts', count(*) FROM public.alerts
UNION ALL SELECT 'announcements', count(*) FROM public.announcements
UNION ALL SELECT 'admin_users', count(*) FROM public.admin_users
UNION ALL SELECT 'parties', count(*) FROM public.parties
UNION ALL SELECT 'system_settings', count(*) FROM public.system_settings;
EOF
```

### RLS 정책 확인

```bash
supabase db query --db-url "$DB_URL" -f /dev/stdin << 'EOF'
SELECT tablename, count(*) as 정책수 FROM pg_policies 
WHERE schemaname = 'public' 
GROUP BY tablename ORDER BY tablename;
EOF
```

### Realtime Publication 확인

```bash
supabase db query --db-url "$DB_URL" -f /dev/stdin << 'EOF'
SELECT schemaname, tablename FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' ORDER BY tablename;
EOF
```

---

## 6. 백업 파일 재생성 (갱신이 필요한 경우)

```bash
# 연결 문자열 설정
export DB_URL="postgresql://postgres.hlbgedbgycamzvbbykdc:%40Supabase01%40@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres"

# 스키마 백업 (DDL + RLS + 권한)
supabase db dump --db-url "$DB_URL" -f schema-full.sql

# 데이터 백업 (모든 스키마 포함)
supabase db dump --db-url "$DB_URL" --data-only --use-copy -f data.sql

# 역할 백업
supabase db dump --db-url "$DB_URL" --role-only -f roles.sql

# 환경변수 백업
cp /path/to/prj_source/frontend/.env.local env.local.backup
```

---

## 7. 주의사항

1. **복원 순서**: 반드시 스키마(schema-full.sql) → 데이터(data.sql) 순서로 실행
2. **auth 스키마**: Supabase가 자동 관리하는 auth 테이블 데이터는 복원 시 충돌 가능. 새 프로젝트에서는 auth 데이터를 제외하고 public 스키마만 복원하는 것을 권장
3. **비밀번호**: `env.local.backup`에 DB 비밀번호가 평문으로 포함되어 있으니 .gitignore에 추가 권장
4. **Storage 파일**: 이 백업은 스토리지 메타데이터만 포함. 실제 업로드된 파일은 Supabase Dashboard에서 별도 다운로드 필요 (현재 Storage 버킷이 비어있음)
5. **Pooler 연결**: 연결 시 반드시 `aws-1-ap-northeast-2.pooler.supabase.com:6543` (Pooler) 사용. `db.*.supabase.co`는 IPv6 전용
6. **비밀번호 인코딩**: CLI 사용 시 `@` → `%40` 인코딩 필수

---

## 8. 트러블슈팅

### "prepared statement already exists" 에러
Pooler 연결 캐시 문제. 잠시 대기 후 재시도:
```bash
sleep 10
supabase db query --db-url "$DB_URL" -f data.sql
```

### "ENOIDENTIFIER" SNI 에러
연결 문자열에서 사용자명에 `.project_ref` 누락:
- ❌ `postgresql://postgres:pass@host`
- ✅ `postgresql://postgres.PROJECT_REF:pass@host`

### RLS 정책 충돌
기존 정책이 있는 경우 삭제 후 재생성:
```sql
DROP POLICY IF EXISTS "정책명" ON public.테이블명;
```

### FK 제약조건 위반
데이터 복원 시 참조 무결성 오류가 발생하면:
```sql
SET session_replication_role = replica;  -- data.sql에 자동 포함됨
```
