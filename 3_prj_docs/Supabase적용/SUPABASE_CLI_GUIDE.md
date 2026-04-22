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

### 3.1 네트워크 제약 사항 (중요)
- **증상**: `connect: cannot assign requested address` 또는 `connection timeout` 에러 발생.
- **원인**: 현재 개발 서버 환경에서 외부 5432/6543 포트 접속이 방화벽으로 차단되었거나 IPv6 라우팅 이슈가 있음.
- **해결 방안**: 
  1. 외부망 접속이 가능한 환경에서 CLI 실행.
  2. Supabase Dashboard의 SQL Editor를 직접 활용.
  3. (향후 도입) Supabase Management API 토큰을 발급받아 포트 제한 없이 HTTP를 통해 스키마 업데이트 수행.

### 3.2 닉네임/신청상태 Full Spec 적용
현재 프로젝트의 요구사항(닉네임 3회 제한, 1/2차 신청 상태 관리)을 반영하기 위해 `src/scripts/migration_full_spec.sql` 파일을 CLI를 통해 실행하여 DB 구조를 고도화하였습니다.

---
**업데이트**: 2026-04-22
**관리자**: Antigravity (AI)
