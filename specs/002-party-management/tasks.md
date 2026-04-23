# Tasks: 파티 관리 및 QR 설정

## Phase 1: Technology PoC (STEP 1)
🎯 **목표**: 기술 스택 확정 및 구현 가능성 검증 (UI 제외)

- [x] T001 [STEP 1.1] 관리자 인증 방식(ID/PWD) 기술 조사 및 Better Auth 연동 검증
    - [x] 관련 테스트(단위/Smoke/E2E) 실행 및 통과 확인 (결과 로그 확인 필수)
    - [x] 3_prj_docs/완료내역/TASK_T001_완료내역.md 작성 (테스트 성공 결과 포함)
    - [x] 현재 tasks.md 내 해당 항목 완료 체크([x])
    - [x] 한글 메시지로 git commit 및 git push 수행
- [x] T002 [STEP 1.1] ag-grid v35, qrcode.react, Supabase Realtime 기술 조사
    - [x] 관련 테스트(단위/Smoke/E2E) 실행 및 통과 확인 (결과 로그 확인 필수)
    - [x] 3_prj_docs/완료내역/TASK_T002_완료내역.md 작성 (테스트 성공 결과 포함)
    - [x] 현재 tasks.md 내 해당 항목 완료 체크([x])
    - [x] 한글 메시지로 git commit 및 git push 수행
- [x] T003 [P] [STEP 1.2] qrcode.react 및 Canvas API를 활용한 로고 병합 기술 검증
    - [x] 관련 테스트(단위/Smoke/E2E) 실행 및 통과 확인 (결과 로그 확인 필수)
    - [x] 3_prj_docs/완료내역/TASK_T003_완료내역.md 작성 (테스트 성공 결과 포함)
    - [x] 현재 tasks.md 내 해당 항목 완료 체크([x])
    - [x] 한글 메시지로 git commit 및 git push 수행
- [x] T004 [P] [STEP 1.2] Supabase Realtime을 통한 실시간 공지 수신 기술 검증
    - [x] 관련 테스트(단위/Smoke/E2E) 실행 및 통과 확인 (결과 로그 확인 필수)
    - [x] 3_prj_docs/완료내역/TASK_T004_완료내역.md 작성 (테스트 성공 결과 포함)
    - [x] 현재 tasks.md 내 해당 항목 완료 체크([x])
    - [x] 한글 메시지로 git commit 및 git push 수행

---

## Phase 2: Core Feature Verification (STEP 2)
🎯 **목표**: UI 없이 스크립트만으로 비즈니스 로직 완전 검증

- [x] T005 [STEP 2.1] 관리자 로그인/세션 관리 및 권한 체크(Admin Only) 로직 검증
    - [x] 관련 테스트(단위/Smoke/E2E) 실행 및 통과 확인 (결과 로그 확인 필수)
    - [x] 3_prj_docs/완료내역/TASK_T005_완료내역.md 작성 (테스트 성공 결과 포함)
    - [x] 현재 tasks.md 내 해당 항목 완료 체크([x])
    - [x] 한글 메시지로 git commit 및 git push 수행
- [x] T006 [STEP 2.1] 파티 생명주기(Draft->Active->Completed) 전환 및 중복 활성 방지 로직 구현
    - [x] 관련 테스트(단위/Smoke/E2E) 실행 및 통과 확인 (결과 로그 확인 필수)
    - [x] 3_prj_docs/완료내역/TASK_T006_완료내역.md 작성 (테스트 성공 결과 포함)
    - [x] 현재 tasks.md 내 해당 항목 완료 체크([x])
    - [x] 한글 메시지로 git commit 및 git push 수행

---

## Phase 3: MVP Implementation (STEP 3)
🎯 **목표**: DB 연동 및 실제 UI가 포함된 최소 제품 구현

### STEP 3.1: 백엔드 및 DB 구현
- [x] T007 [US1] `prj_source/database/schema.ts`에 `parties`, `announcements` 테이블 스키마 정의
    - [x] 관련 테스트(단위/Smoke/E2E) 실행 및 통과 확인 (결과 로그 확인 필수)
    - [x] 3_prj_docs/완료내역/TASK_T007_완료내역.md 작성 (테스트 성공 결과 포함)
    - [x] 현재 tasks.md 내 해당 항목 완료 체크([x])
    - [x] 한글 메시지로 git commit 및 git push 수행
- [x] T008 [US1] 파티 CRUD 및 상태 변경 API 구현 (`/api/admin/parties`)
    - [x] 관련 테스트(단위/Smoke/E2E) 실행 및 통과 확인 (결과 로그 확인 필수)
    - [x] 3_prj_docs/완료내역/TASK_T008_완료내역.md 작성 (테스트 성공 결과 포함)
    - [x] 현재 tasks.md 내 해당 항목 완료 체크([x])
    - [x] 한글 메시지로 git commit 및 git push 수행
- [x] T009 [US1] 실시간 공지 발송 API 및 Supabase 브로드캐스트 연동 (`/api/admin/announcements`)
    - [x] 관련 테스트(단위/Smoke/E2E) 실행 및 통과 확인 (결과 로그 확인 필수)
    - [x] 3_prj_docs/완료내역/TASK_T009_완료내역.md 작성 (테스트 성공 결과 포함)
    - [x] 현재 tasks.md 내 해당 항목 완료 체크([x])
    - [x] 한글 메시지로 git commit 및 git push 수행

### STEP 3.2: 프론트엔드 UI 및 통합 (MVP)
- [x] T010 [US1] 관리자 로그인 페이지 UI 및 인증 연동 구현
    - [x] 관련 테스트(단위/Smoke/E2E) 실행 및 통과 확인 (결과 로그 확인 필수)
    - [x] 3_prj_docs/완료내역/TASK_T010_완료내역.md 작성 (테스트 성공 결과 포함)
    - [x] 현재 tasks.md 내 해당 항목 완료 체크([x])
    - [x] 한글 메시지로 git commit 및 git push 수행
- [x] T011 [US1] ag-grid v35 공통 설정 파일 작성 (`prj_source/frontend/src/lib/ag-grid-setup.ts`)
    - [x] 관련 테스트(단위/Smoke/E2E) 실행 및 통과 확인 (결과 로그 확인 필수)
    - [x] 3_prj_docs/완료내역/TASK_T011_완료내역.md 작성 (테스트 성공 결과 포함)
    - [x] 현재 tasks.md 내 해당 항목 완료 체크([x])
    - [x] 한글 메시지로 git commit 및 git push 수행
- [x] T012 [US2] 파티 관리 목록 페이지 (`/admin/parties`) 구현 (ag-grid, 검색, 페이징)
    - [x] 관련 테스트(단위/Smoke/E2E) 실행 및 통과 확인 (결과 로그 확인 필수)
    - [x] 3_prj_docs/완료내역/TASK_T012_완료내역.md 작성 (테스트 성공 결과 포함)
    - [x] 현재 tasks.md 내 해당 항목 완료 체크([x])
    - [x] 한글 메시지로 git commit 및 git push 수행
- [x] T013 [US1] 상단 가이드 플로우 컴포넌트 및 상세 매뉴얼 팝업 UI 구현
    - [x] 관련 테스트(단위/Smoke/E2E) 실행 및 통과 확인 (결과 로그 확인 필수)
    - [x] 3_prj_docs/완료내역/TASK_T013_완료내역.md 작성 (테스트 성공 결과 포함)
    - [x] 현재 tasks.md 내 해당 항목 완료 체크([x])
    - [x] 한글 메시지로 git commit 및 git push 수행
- [ ] T014 [US1] 실시간 공지 발송 인터페이스 및 참여자 모바일 수신 확인 팝업 & 공지 이력 조회 UI 구현
    - [ ] 관련 테스트(단위/Smoke/E2E) 실행 및 통과 확인 (결과 로그 확인 필수)
    - [ ] 3_prj_docs/완료내역/TASK_T014_완료내역.md 작성 (테스트 성공 결과 포함)
    - [ ] 현재 tasks.md 내 해당 항목 완료 체크([x])
    - [ ] 한글 메시지로 git commit 및 git push 수행
- [ ] T015 [US3] QR 관리 설정 페이지(`/admin/settings/qr`) 및 파티 종료 안내 페이지 구현
    - [ ] 관련 테스트(단위/Smoke/E2E) 실행 및 통과 확인 (결과 로그 확인 필수)
    - [ ] 3_prj_docs/완료내역/TASK_T015_완료내역.md 작성 (테스트 성공 결과 포함)
    - [ ] 현재 tasks.md 내 해당 항목 완료 체크([x])
    - [ ] 한글 메시지로 git commit 및 git push 수행
- [ ] T016 [P] [US3] 브랜딩 QR 코드 생성 미리보기 및 다운로드(PNG/SVG) 기능 통합
    - [ ] 관련 테스트(단위/Smoke/E2E) 실행 및 통과 확인 (결과 로그 확인 필수)
    - [ ] 3_prj_docs/완료내역/TASK_T016_완료내역.md 작성 (테스트 성공 결과 포함)
    - [ ] 현재 tasks.md 내 해당 항목 완료 체크([x])
    - [ ] 한글 메시지로 git commit 및 git push 수행
- [ ] T017 [설계만] WordPress 연동 API 구조 설계 (구현 보류)
    - [ ] 3_prj_docs/미구현사항.md 에 상세 내용 기록 확인
    - [ ] 현재 tasks.md 내 해당 항목 완료 체크([x])
    - [ ] 한글 메시지로 git commit 및 git push 수행

---

## Phase 4: 전체 통합 및 상용화 준비 (STEP 4)
🎯 **목표**: 부가 기능 추가 및 최종 안정성 확보

- [ ] T018 [STEP 4.1] 전체 시스템 통합 테스트 및 성능 최적화 (파티 이력 1만 건 대응)
    - [ ] 관련 테스트(단위/Smoke/E2E) 실행 및 통과 확인 (결과 로그 확인 필수)
    - [ ] 3_prj_docs/완료내역/TASK_T018_완료내역.md 작성 (테스트 성공 결과 포함)
    - [ ] 현재 tasks.md 내 해당 항목 완료 체크([x])
    - [ ] 한글 메시지로 git commit 및 git push 수행
- [ ] T019 [STEP 4.1] 최종 보안 점검 (관리자 권한 확인 및 API 보안)
    - [ ] 관련 테스트(단위/Smoke/E2E) 실행 및 통과 확인 (결과 로그 확인 필수)
    - [ ] 3_prj_docs/완료내역/TASK_T019_완료내역.md 작성 (테스트 성공 결과 포함)
    - [ ] 현재 tasks.md 내 해당 항목 완료 체크([x])
    - [ ] 한글 메시지로 git commit 및 git push 수행
- [ ] T020 [STEP 4.1] 최종 완료 보고서 작성 및 프로젝트 아카이빙
    - [ ] 관련 테스트(단위/Smoke/E2E) 실행 및 통과 확인 (결과 로그 확인 필수)
    - [ ] 3_prj_docs/완료내역/TASK_T020_완료내역.md 작성 (테스트 성공 결과 포함)
    - [ ] 현재 tasks.md 내 해당 항목 완료 체크([x])
    - [ ] 한글 메시지로 git commit 및 git push 수행

---

## Dependencies & Strategy
- **의존성 순서**: Phase 1 (PoC) -> Phase 2 (Logic) -> Phase 3 (MVP) -> Phase 4 (Polish)
- **전략**:
    - **UI 금지 원칙**: STEP 2 완료 시점까지는 순수 로직과 API 위주로 개발하며, 모든 기능은 테스트 코드로 검증한다.
    - **점진적 배포**: US1(파티 운영)을 최우선 MVP로 개발하여 실 운영 가능 상태를 먼저 확보한다.
    - **병렬 작업**: [P] 표시가 된 태스크는 의존성이 없으므로 별도 세션에서 병렬 수행이 가능하다.
