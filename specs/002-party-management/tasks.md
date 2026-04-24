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
- [x] T014 [US1] 실시간 공지 발송 인터페이스 및 참여자 모바일 수신 확인 팝업 & 공지 이력 조회 UI 구현
    - [x] 관련 테스트(단위/Smoke/E2E) 실행 및 통과 확인 (결과 로그 확인 필수)
    - [x] 3_prj_docs/완료내역/TASK_T014_완료내역.md 작성 (테스트 성공 결과 포함)
    - [x] 현재 tasks.md 내 해당 항목 완료 체크([x])
    - [x] 한글 메시지로 git commit 및 git push 수행
- [x] T015 [US3] QR 관리 설정 페이지 (`/admin/settings/qr`) 및 파티 종료 안내 페이지 구현
    - [x] 관련 테스트(단위/Smoke/E2E) 실행 및 통과 확인 (결과 로그 확인 필수)
    - [x] 3_prj_docs/완료내역/TASK_T015_완료내역.md 작성 (테스트 성공 결과 포함)
    - [x] 현재 tasks.md 내 해당 항목 완료 체크([x])
    - [x] 한글 메시지로 git commit 및 git push 수행
- [x] T016 [P] [US3] 브랜딩 QR 코드 생성 미리보기 및 다운로드(PNG/SVG) 기능 통합
    - [x] 관련 테스트(단위/Smoke/E2E) 실행 및 통과 확인 (결과 로그 확인 필수)
    - [x] 3_prj_docs/완료내역/TASK_T016_완료내역.md 작성 (테스트 성공 결과 포함)
    - [x] 현재 tasks.md 내 해당 항목 완료 체크([x])
    - [x] 한글 메시지로 git commit 및 git push 수행
- [x] T017 [설계만] WordPress 연동 API 구조 설계 (구현 보류)
    - [x] 3_prj_docs/미구현사항.md 에 상세 내용 기록 확인
    - [x] 현재 tasks.md 내 해당 항목 완료 체크([x])
    - [x] 한글 메시지로 git commit 및 git push 수행

---

## Phase 4: 전체 통합 및 상용화 준비 (STEP 4)
🎯 **목표**: 부가 기능 추가 및 최종 안정성 확보

- [x] T018 [STEP 4.1] 전체 시스템 통합 테스트 및 성능 최적화 (파티 이력 1만 건 대응)
    - [x] 관련 테스트(단위/Smoke/E2E) 실행 및 통과 확인 (결과 로그 확인 필수)
    - [x] 3_prj_docs/완료내역/TASK_T018_완료내역.md 작성 (테스트 성공 결과 포함)
    - [x] 현재 tasks.md 내 해당 항목 완료 체크([x])
    - [x] 한글 메시지로 git commit 및 git push 수행
- [x] T019 [STEP 4.1] 최종 보안 점검 (관리자 권한 확인 및 API 보안)
    - [x] 관련 테스트(단위/Smoke/E2E) 실행 및 통과 확인 (결과 로그 확인 필수)
    - [x] 3_prj_docs/완료내역/TASK_T019_완료내역.md 작성 (테스트 성공 결과 포함)
    - [x] 현재 tasks.md 내 해당 항목 완료 체크([x])
    - [x] 한글 메시지로 git commit 및 git push 수행
- [x] T020 [STEP 4.1] 최종 완료 보고서 작성 및 프로젝트 아카이빙
    - [x] 관련 테스트(단위/Smoke/E2E) 실행 및 통과 확인 (결과 로그 확인 필수)
    - [x] 3_prj_docs/완료내역/TASK_T020_완료내역.md 작성 (테스트 성공 결과 포함)
    - [x] 현재 tasks.md 내 해당 항목 완료 체크([x])
    - [x] 한글 메시지로 git commit 및 git push 수행
- [ ] T021 [STEP 4.2] Supabase DB 스키마 동기화 (Migration)
    - [ ] Drizzle Kit을 이용한 마이그레이션 파일 생성
    - [ ] Supabase 실운영 DB에 신규 테이블(parties 등) 반영
    - [ ] 반영 후 데이터 정합성 최종 확인


---

## Phase 5: 운영 완전성 확보 및 고도화 (STEP 5)
🎯 **목표**: 누락된 운영 제어 기능 및 사용자 UX 상세 구현

- [x] T022 [US4] 관리자 상세 제어 페이지(`admin/parties/[id]`) 및 수정 API 구축 (참조: [spec002-추가기능.md](file:///home/ctxwing/docker-ctx/lancer/qr-party-participant-admin-web/3_prj_docs/02_%ED%99%94%EB%A9%B4%EC%84%A4%EA%B3%84/spec002-%EC%B6%94%EA%B0%80%EA%B8%B0%EB%8A%A5.md))
    - [x] 파티 시간(시작/종료) 및 정원(인원수) 실시간 수정 기능 구현
    - [x] 초기 상호작용 횟수 3종 프리셋(일반/열정/커스텀) 설정 기능 구현
    - [x] 파티 상태 배지(대기/진행/종료) 전용 컬러 시스템 적용
    - [x] 닉네임 등록자 중 "2차 신청 미완료자" 필터링 및 **일괄 알림 발송** 기능 구현
    - [x] 3_prj_docs/완료내역/TASK_T022_완료내역.md 작성
- [x] T023 [US5] 실시간 통합 모니터링 피드 및 닉네임 로그 뷰어 구현 (참조: [spec002-추가기능.md](file:///home/ctxwing/docker-ctx/lancer/qr-party-participant-admin-web/3_prj_docs/02_%ED%99%94%EB%A9%B4%EC%84%A4%EA%B3%84/spec002-%EC%B6%94%EA%B0%80%EA%B8%B0%EB%8A%A5.md))
    - [x] 모든 상호작용(쪽지, 호감도, SOS) 실시간 스트리밍 대시보드 구축
    - [x] **시스템 실시간성 지연 시간(Latency) 모니터링 위젯 추가**
    - [x] 참여자별 닉네임 변경 전후 이력 추적 및 조회 기능 구현
    - [x] 3_prj_docs/완료내역/TASK_T023_완료내역.md 작성
- [x] T024 [US4] 참여자 신청 상태 관리 및 상호작용 잔여 횟수(개수) 조정 기능 (참조: [spec002-추가기능.md](file:///home/ctxwing/docker-ctx/lancer/qr-party-participant-admin-web/3_prj_docs/02_%ED%99%94%EB%A9%B4%EC%84%A4%EA%B3%84/spec002-%EC%B6%94%EA%B0%80%EA%B8%B0%EB%8A%A5.md))
    - [x] 관리자 UI에서 1차/2차 신청 상태 토글 및 승인/반려 기능 구현
    - [x] 개별 참여자별 큐피트/호감도 잔여 횟수 실시간 가감(개수 조정) 기능 구현
    - [x] 전체 참여자 대상 횟수 일괄 지급 기능(Bulk Grant) 및 실시간 알림 구현
    - [x] 3_prj_docs/완료내역/TASK_T024_완료내역.md 작성
- [x] T025 [US4] 참여자 대시보드 UX 고도화 (타이머 & 보관함)
    - [x] 참여자 화면 상단 실시간 파티 종료 카운트다운 타이머 구현
    - [x] 주고받은 쪽지 보관함 UI 및 읽음 처리 기능 구현
    - [x] 3_prj_docs/완료내역/TASK_T025_완료내역.md 작성
- [x] T026 [US5] 랭킹 페이지 UI 고도화 및 본인 순위 강조
    - [x] 랭킹 리스트 내 참여자 본인 위치 시각적 강조(색상, 강조선 등) 로직 적용
    - [x] 상위 1, 2, 3위 특별 메달 배지 및 프리미엄 카드 디자인 적용
    - [x] 3_prj_docs/완료내역/TASK_T026_완료내역.md 작성


---

## Dependencies & Strategy
- **의존성 순서**: Phase 1~4 (Core) -> Phase 5 (Operations & UX)
- **전략**:
    - **실시간 우선**: 모든 수정 사항은 참여자 화면에 즉시 반영되도록 Supabase Realtime을 적극 활용한다.
    - **데이터 정합성**: 관리자의 강제 조정이 참여자의 로컬 상태와 충돌하지 않도록 서버 상태를 우선시한다.
    - **가이드 준수**: 모든 신규 UI는 기존의 Glassmorphism 테마와 ag-grid v35 규격을 유지한다.
    - **추가 설계 참조**: Phase 5 구현 시 반드시 [spec002-추가기능.md](file:///home/ctxwing/docker-ctx/lancer/qr-party-participant-admin-web/3_prj_docs/02_%ED%99%94%EB%A9%B4%EC%84%A4%EA%B3%84/spec002-%EC%B6%94%EA%B0%80%EA%B8%B0%EB%8A%A5.md)를 참조하여 UI/UX를 구현해야 한다.
