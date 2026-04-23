# 문제점 해결 내역: system_settings 테이블 누락으로 인한 404 에러 발생

**발생 일시**: 2026년 04월 23일 10:00
**작성 일시**: 2026년 04월 23일 10:03

## 1. 발생한 문제점
1. **터미널 콘솔에 404 Not Found 에러 로그 지속 출력**
   - 프론트엔드 구동 후 브라우저 콘솔 및 터미널에 `GET https://[...].supabase.co/rest/v1/system_settings?select=value&key=eq.ranking_weights 404 (Not Found)` 에러가 발생함.
   - 팝업이나 기능상의 즉각적인 멈춤은 없었으나, 랭킹 가중치 설정값을 가져오는 과정에서 지속적으로 실패하고 있었음.

## 2. 원인 분석
1. **DB 테이블 생성(Migration) 미실행**
   - 이전 작업(관리자 랭킹 가중치 기능 추가)에서 데이터베이스 스키마 `migration_settings.sql` 파일만 작성해두고, 실제 Supabase 서버에 쿼리를 실행하여 테이블을 생성하는 작업을 누락함.
   - 이로 인해 프론트엔드가 존재하지 않는 `system_settings` 테이블에 접근을 시도하여 404 에러가 반환됨.
2. **익명 사용자(anon) 접근 권한 부재 가능성**
   - 테이블이 존재하더라도, 참여자 웹앱 환경에서는 익명(`anon`) 키로 접속하므로 해당 테이블을 읽을 수 있는 RLS 정책이 별도로 필요함.

## 3. 해결해야 할 사항 (체크리스트)
- [x] **Supabase DB 테이블 생성 및 데이터 세팅**
  - [x] `system_settings` 테이블 생성.
  - [x] 기본 랭킹 가중치 데이터(`ranking_weights`) 초기 삽입.
- [x] **Supabase DB 권한 (RLS) 설정**
  - [x] `system_settings` 테이블에 Row Level Security (RLS) 활성화.
  - [x] 익명 사용자(`anon`)가 설정값을 읽을 수 있도록 `SELECT` 정책 추가.

## 4. 해결 내역 및 조치 결과
- **2026-04-23 01:00**: 마이그레이션 스크립트 `run_migration_settings.ts` 작성.
- **2026-04-23 01:01**: 스크립트를 실행하여 Supabase 원격 DB에 테이블 생성, 초기 데이터(like: 1, message: 5, cupid: 10) 삽입, `anon` 읽기 권한 정책 추가 완료. 404 에러 로그가 더 이상 발생하지 않음.
- **2026-04-23 01:01**: 관련된 픽스 사항을 Github `main` 브랜치에 커밋 및 푸시 완료 (`fix(db): create system_settings table and add RLS to resolve 404 error`).
- **2026-04-23 10:03**: 위 과정에 대해 `ctx.log-problem` 워크플로우를 따라 현재 문서 생성 및 문제 내역 기록 완료.
