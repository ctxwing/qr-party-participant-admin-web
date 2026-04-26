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

## 4. 두 가지 DB 수정 방식 비교 (2026-04-27 검증)

### 🏆 결론: CLI 방식 권장

실제 검증 결과, **Supabase CLI가 더 간단하고 효율적**입니다.

| 항목 | CLI 방식 | Node.js pg 방식 |
|------|---------|-----------------|
| **작동** | ✅ 확인됨 | ✅ 확인됨 |
| **난이도** | ⭐ 쉬움 | ⭐⭐⭐ 어려움 |
| **설정** | 없음 | SSL 처리 필요 |
| **속도** | 빠름 | 느림 |
| **안전성** | ✅ 안전 | ⚠️ SSL 무시 필요 |

**따라서 일반적인 DB 수정은 CLI 방식을 사용하세요.**

---

### 4.1 Supabase CLI 방식 (권장) ✅

#### 기본 명령어

```bash
supabase db query --db-url "[CONNECTION_STRING]" -f [SQL파일경로]
```

#### 실제 사용 예시

```bash
# 1. SQL 파일 준비
cat > /tmp/setup.sql << 'EOF'
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admin to update alerts"
ON public.alerts FOR UPDATE
USING (
  current_setting('request.headers')::jsonb->>'x-admin-user-id'
  IN (SELECT better_auth_user_id FROM public.admin_users)
);
EOF

# 2. CLI로 즉시 실행
supabase db query --db-url "postgresql://postgres.hlbgedbgycamzvbbykdc:%40Supabase01%40@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres" -f /tmp/setup.sql

# 3. 결과 (자동으로 JSON 형식 반환)
# {
#   "rows": [
#     { "admin_count": 1 }
#   ]
# }
```

#### 장점

1. **간단한 한 줄 명령어**
   - 추가 설정 불필요
   - 연결 문자열만 필요

2. **SNI 문제 자동 해결**
   - Pooler 호스트 자동 처리
   - 복잡한 설정 불필요

3. **구조화된 출력**
   - JSON 형식으로 자동 파싱
   - 보안 경고 자동 포함

4. **공식 도구**
   - Supabase 공식 지원
   - 정기 업데이트

---

### 4.2 Node.js pg 패키지 방식 (대체재)

참고 자료: [DB수정_방법.md](./DB수정_방법.md)

Supabase CLI가 불가능한 경우만 사용 (예: Node.js 앱 내부에서 자동화)

#### 개요
Supabase CLI 대신 **Node.js pg 패키지를 사용한 직접 PostgreSQL 연결**

#### 필수 정보
```
PROJECT_REF: hlbgedbgycamzvbbykdc
DATABASE_URL: postgresql://postgres.hlbgedbgycamzvbbykdc:%40Supabase01%40@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?sslmode=require
SUPABASE_URL: https://hlbgedbgycamzvbbykdc.supabase.co
```

#### 사용 흐름

```bash
# 1️⃣ SQL 파일 작성
cat > migration.sql << 'EOF'
-- RLS 정책 생성
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

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
EOF

# 2️⃣ CLI 실행 (한 줄)
supabase db query --db-url "postgresql://postgres.hlbgedbgycamzvbbykdc:%40Supabase01%40@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres" -f migration.sql

# 3️⃣ 완료!
```

#### 검증 결과 (실제 실행)
```
✅ admin_count: 1
✅ RLS 정책 조회 성공
✅ 테이블 구조 조회 성공
✅ UPDATE/INSERT 실행 가능
```

---

## 4.3 Node.js pg 방식 상세 (참고용)

**CLI가 불가능한 경우에만 사용.**

자세한 내용: [DB수정_방법.md](./DB수정_방법.md) 참조

---
**검증 완료**: 2026-04-27 10:15  
**권장 방식**: CLI 방식 (간단, 빠름, 안전)  
**비교 분석**: [DB수정_방법_검증.md](./DB수정_방법_검증.md) 참조
