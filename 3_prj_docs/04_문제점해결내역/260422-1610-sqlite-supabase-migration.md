# 문제점 해결 내역 (260422-1610)

## 1. 문제 발생 내역
- **발생 시각**: 2026-04-22 13:17 ~ 15:30
- **문제점 내용**: 
  1. Next.js 서버 구동 후 `/setup` 페이지 접근 시 `better_sqlite3.node` 모듈을 로드하지 못하는 500 에러 발생.
  2. 로컬 개발 환경(SQLite)과 실제 운영 타겟(Supabase) DB가 이원화되어 있어 관리 및 동기화 이슈 발생.
- **예상 원인 분석**:
  - `better-sqlite3`는 C++ 네이티브 모듈이라 macOS와 Linux(Ubuntu) 간에 바이너리가 호환되지 않아 바인딩 에러 발생.
  - Next.js의 Turbopack/Webpack이 `bun:sqlite`를 번들링하려 시도하면서 `Cannot find module 'bun:sqlite'` 에러 발생.
  - 프로젝트 구조상 하나의 일관된 DB(Supabase)를 사용해야 유지보수와 실시간 기능(Realtime) 연동이 원활함.

## 2. 해결 목표 (체크리스트)
- [x] SQLite 기반(Drizzle ORM 등) 종속성 및 폴더 구조 완전 제거
- [x] Admin Dashboard의 Mock 데이터를 실제 Supabase 연결로 교체
- [x] `registerParticipant` 등 백엔드 액션을 Supabase 클라이언트로 마이그레이션
- [x] 프로젝트 설정을 정리하여 단일 DB(Supabase) 환경으로 통일

## 3. 해결된 내역 업데이트
- **해결 시각**: 2026-04-22 15:40
- **해결 내용**:
  - `src/database` 디렉토리 전체 및 `drizzle.config.ts` 삭제 완료.
  - `package.json`에서 `drizzle-orm`, `drizzle-kit`, `better-sqlite3`, `pg` 제거.
  - `src/app/actions/participant.ts`의 로직을 `@supabase/ssr` 클라이언트 기반으로 수정하여 `party_sessions`, `participants` 테이블 연동 완료.
  - `src/app/admin/page.tsx`에서 하드코딩된 Mock 데이터를 삭제하고, Supabase Realtime 채널을 통한 `alerts`, `messages`, `party_sessions` 실시간 상태 연동 적용 완료.
  - 설정 파일(`next.config.ts`) 정리 등 모든 환경을 단일 Supabase DB 기준으로 최적화함.

## 4. 향후 주의사항
- 추후 개발 시에도 SQLite 등 로컬 전용 DB를 병행하지 않고 처음부터 Supabase 기반으로 개발 및 테스트를 진행하여 환경 불일치를 방지할 것.
