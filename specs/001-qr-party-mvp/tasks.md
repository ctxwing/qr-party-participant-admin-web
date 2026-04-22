# Tasks: QR 기반 파티 모바일웹 MVP 개발

**Feature**: 001-qr-party-mvp
**Priority Order**: US1 -> US2 -> US3
**Tech Stack**: Bun, Next.js 16.2.1+, Supabase, Drizzle ORM, Refine, React Bits

## Implementation Strategy
1. **MVP First**: 익명 접속과 상호작용 핵심 기능을 최우선 구현합니다.
2. **Incremental Delivery**: 각 User Story가 완료될 때마다 독립적으로 테스트 가능한 결과물을 도출합니다.
3. **Real-time Core**: 모든 상호작용은 Supabase Realtime을 통해 즉각 반영되도록 처리합니다.

---

## Phase 1: Setup (초기 설정)

- [x] T001 `prj_source/frontend` 경로에 Bun을 이용한 Next.js 16.2.1+ (Turbopack) 프로젝트 초기화
    - [x] 관련 테스트(단위/Smoke/E2E) 실행 및 통과 확인 (결과 로그 확인 필수)
    - [x] 3_prj_docs/완료내역/TASK_T001_완료내역.md 작성 (테스트 성공 결과 포함)
    - [x] 현재 tasks.md 내 해당 항목 완료 체크([x])
    - [x] 한글 메시지로 git commit 및 git push 수행
- [x] T002 `prj_source/database` 경로에 Drizzle ORM 및 SQLite 설정 (local dev용)
    - [x] 관련 테스트(단위/Smoke/E2E) 실행 및 통과 확인 (결과 로그 확인 필수)
    - [x] 3_prj_docs/완료내역/TASK_T002_완료내역.md 작성 (테스트 성공 결과 포함)
    - [x] 현재 tasks.md 내 해당 항목 완료 체크([x])
    - [x] 한글 메시지로 git commit 및 git push 수행
- [x] T003 Supabase 클라이언트 라이브러리 설치 및 `.env.local` 환경 변수 설정
    - [x] 관련 테스트(단위/Smoke/E2E) 실행 및 통과 확인 (결과 로그 확인 필수)
    - [x] 3_prj_docs/완료내역/TASK_T003_완료내역.md 작성 (테스트 성공 결과 포함)
    - [x] 현재 tasks.md 내 해당 항목 완료 체크([x])
    - [x] 한글 메시지로 git commit 및 git push 수행
- [x] T004 shadcn/ui 및 Tailwind CSS 기본 테마(Dark Mode) 구성
    - [x] 관련 테스트(단위/Smoke/E2E) 실행 및 통과 확인 (결과 로그 확인 필수)
    - [x] 3_prj_docs/완료내역/TASK_T004_완료내역.md 작성 (테스트 성공 결과 포함)
    - [x] 현재 tasks.md 내 해당 항목 완료 체크([x])
    - [x] 한글 메시지로 git commit 및 git push 수행

## Phase 2: Foundational (공통 기반 작업)

- [x] T005 `prj_source/database/schema.ts`에 전체 데이터 모델(Session, Participant, Message, Interaction, Alert) 스키마 정의
    - [x] 관련 테스트(단위/Smoke/E2E) 실행 및 통과 확인 (결과 로그 확인 필수)
    - [x] 3_prj_docs/완료내역/TASK_T005_완료내역.md 작성 (테스트 성공 결과 포함)
    - [x] 현재 tasks.md 내 해당 항목 완료 체크([x])
    - [x] 한글 메시지로 git commit 및 git push 수행
- [x] T006 Supabase Anonymous Auth 기능을 이용한 익명 세션 생성 및 유지 로직 구현
    - [x] 관련 테스트(단위/Smoke/E2E) 실행 및 통과 확인 (결과 로그 확인 필수)
    - [x] 3_prj_docs/완료내역/TASK_T006_완료내역.md 작성 (테스트 성공 결과 포함)
    - [x] 현재 tasks.md 내 해당 항목 완료 체크([x])
    - [x] 한글 메시지로 git commit 및 git push 수행
- [x] T007 전역 상태 관리(Zustand)를 이용한 사용자 세션 및 실시간 알림 상태 정의
    - [x] 관련 테스트(단위/Smoke/E2E) 실행 및 통과 확인 (결과 로그 확인 필수)
    - [x] 3_prj_docs/완료내역/TASK_T007_완료내역.md 작성 (테스트 성공 결과 포함)
    - [x] 현재 tasks.md 내 해당 항목 완료 체크([x])
    - [x] 한글 메시지로 git commit 및 git push 수행

## Phase 3: User Story 1 - 파티 참여 및 프로필 설정

**Goal**: QR 접속 후 닉네임을 설정하고 파티에 정식 참여한다.
**Test**: QR 경로 접속 시 닉네임 설정창 노출 여부 및 3회 변경 제한 작동 확인.

- [x] T008 [P] [US1] `prj_source/frontend/app/setup/page.tsx` 닉네임 설정 화면 구현 (모바일 최적화)
    - [x] 관련 테스트(단위/Smoke/E2E) 실행 및 통과 확인 (결과 로그 확인 필수)
    - [x] 3_prj_docs/완료내역/TASK_T008_완료내역.md 작성 (테스트 성공 결과 포함)
    - [x] 현재 tasks.md 내 해당 항목 완료 체크([x])
    - [x] 한글 메시지로 git commit 및 git push 수행
- [x] T009 [US1] `prj_source/frontend/lib/nickname.ts` 닉네임 변경 횟수 제한(3회) 및 중복 검사 로직 구현
    - [x] 관련 테스트(단위/Smoke/E2E) 실행 및 통과 확인 (결과 로그 확인 필수)
    - [x] 3_prj_docs/완료내역/TASK_T009_완료내역.md 작성 (테스트 성공 결과 포함)
    - [x] 현재 tasks.md 내 해당 항목 완료 체크([x])
    - [x] 한글 메시지로 git commit 및 git push 수행
- [x] T010 [US1] 닉네임 설정 완료 후 메인 대시보드로의 리다이렉션 및 세션 저장 기능 구현
    - [x] 관련 테스트(단위/Smoke/E2E) 실행 및 통과 확인 (결과 로그 확인 필수)
    - [x] 3_prj_docs/완료내역/TASK_T010_완료내역.md 작성 (테스트 성공 결과 포함)
    - [x] 현재 tasks.md 내 해당 항목 완료 체크([x])
    - [x] 한글 메시지로 git commit 및 git push 수행

## Phase 4: User Story 2 - 실시간 상호작용 (쪽지, 큐피트, 랭킹)

**Goal**: 참여자 간 실시간 소통과 호감도 표시, 순위 확인 기능을 제공한다.
**Test**: 쪽지 발송 시 1초 내 수신 확인, 호감도 순위 실시간 변동 확인.

- [x] T011 [P] [US2] `prj_source/frontend/hooks/useSupabaseRealtime.ts` 실시간 데이터 구독 훅 구현
    - [x] 관련 테스트(단위/Smoke/E2E) 실행 및 통과 확인 (결과 로그 확인 필수)
    - [x] 3_prj_docs/완료내역/TASK_T011_완료내역.md 작성 (테스트 성공 결과 포함)
    - [x] 현재 tasks.md 내 해당 항목 완료 체크([x])
    - [x] 한글 메시지로 git commit 및 git push 수행
- [x] T012 [US2] `prj_source/frontend/app/dashboard/page.tsx` 참여자 리스트 및 상호작용 모달 구현
    - [x] 관련 테스트(단위/Smoke/E2E) 실행 및 통과 확인 (결과 로그 확인 필수)
    - [x] 3_prj_docs/완료내역/TASK_T012_완료내역.md 작성 (테스트 성공 결과 포함)
    - [x] 현재 tasks.md 내 해당 항목 완료 체크([x])
    - [x] 한글 메시지로 git commit 및 git push 수행
- [x] T013 [US2] `prj_source/frontend/app/ranking/page.tsx` React Bits 애니메이션을 활용한 실시간 랭킹 보드 구현
    - [x] 관련 테스트(단위/Smoke/E2E) 실행 및 통과 확인 (결과 로그 확인 필수)
    - [x] 3_prj_docs/완료내역/TASK_T013_완료내역.md 작성 (테스트 성공 결과 포함)
    - [x] 현재 tasks.md 내 해당 항목 완료 체크([x])
    - [x] 한글 메시지로 git commit 및 git push 수행
- [x] T014 [US2] 상호작용 시 3초당 1회 제한(Rate Limit) 로직 적용 및 토스트 알림 연동
    - [x] 관련 테스트(단위/Smoke/E2E) 실행 및 통과 확인 (결과 로그 확인 필수)
    - [x] 3_prj_docs/완료내역/TASK_T014_완료내역.md 작성 (테스트 성공 결과 포함)
    - [x] 현재 tasks.md 내 해당 항목 완료 체크([x])
    - [x] 한글 메시지로 git commit 및 git push 수행

## Phase 5: User Story 3 - 파티 관리 및 운영 (Admin)

**Goal**: 운영자가 파티 시간을 제어하고 SOS 요청에 즉각 대응한다.
**Test**: 파티 시간 변경 시 사용자 화면 즉시 동기화, SOS 발생 시 사운드 알림 확인.

- [ ] T015 [P] [US3] `prj_source/frontend/app/admin` 경로에 Refine 프레임워크 기반 관리자 레이아웃 구성
    - [ ] 관련 테스트(단위/Smoke/E2E) 실행 및 통과 확인 (결과 로그 확인 필수)
    - [ ] 3_prj_docs/완료내역/TASK_T015_완료내역.md 작성 (테스트 성공 결과 포함)
    - [ ] 현재 tasks.md 내 해당 항목 완료 체크([x])
- [x] T015 [P] [US3] `prj_source/frontend/app/admin/page.tsx` 관리자 대시보드 및 세션 제어 UI 구현
    - [x] 관련 테스트(단위/Smoke/E2E) 실행 및 통과 확인 (결과 로그 확인 필수)
    - [x] 3_prj_docs/완료내역/TASK_T015_완료내역.md 작성 (테스트 성공 결과 포함)
    - [x] 현재 tasks.md 내 해당 항목 완료 체크([x])
    - [x] 한글 메시지로 git commit 및 git push 수행
- [x] T016 [US3] `prj_source/frontend/app/admin/dashboard/page.tsx` 실시간 지표 관제 및 로그(닉네임 변경, 쪽지) 조회 화면 구현
    - [x] 관련 테스트(단위/Smoke/E2E) 실행 및 통과 확인 (결과 로그 확인 필수)
    - [x] 3_prj_docs/완료내역/TASK_T016_완료내역.md 작성 (테스트 성공 결과 포함)
    - [x] 현재 tasks.md 내 해당 항목 완료 체크([x])
    - [x] 한글 메시지로 git commit 및 git push 수행
- [ ] T017 [US3] `prj_source/frontend/app/admin/alerts/page.tsx` SOS 리스트 및 시청각 알림 시스템 구현
    - [ ] 관련 테스트(단위/Smoke/E2E) 실행 및 통과 확인 (결과 로그 확인 필수)
    - [ ] 3_prj_docs/완료내역/TASK_T017_완료내역.md 작성 (테스트 성공 결과 포함)
    - [ ] 현재 tasks.md 내 해당 항목 완료 체크([x])
    - [ ] 한글 메시지로 git commit 및 git push 수행
- [ ] T018 [US3] 파티 시작/종료 시간 제어 및 전체 공지사항 발송 기능 구현
    - [ ] 관련 테스트(단위/Smoke/E2E) 실행 및 통과 확인 (결과 로그 확인 필수)
    - [ ] 3_prj_docs/완료내역/TASK_T018_완료내역.md 작성 (테스트 성공 결과 포함)
    - [ ] 현재 tasks.md 내 해당 항목 완료 체크([x])
    - [ ] 한글 메시지로 git commit 및 git push 수행

## Phase 6: Polish & Cross-Cutting (마무리 및 최적화)

- [ ] T019 화면 설계서(02_화면설계) 기준 UI 정합성 및 디자인 완성도 제고 (글래스모피즘, 다크 테마)
    - [ ] 관련 테스트(단위/Smoke/E2E) 실행 및 통과 확인 (결과 로그 확인 필수)
    - [ ] 3_prj_docs/완료내역/TASK_T019_완료내역.md 작성 (테스트 성공 결과 포함)
    - [ ] 현재 tasks.md 내 해당 항목 완료 체크([x])
    - [ ] 한글 메시지로 git commit 및 git push 수행
- [ ] T020 모바일 브라우저 한 손 조작(Thumb Zone) 최적화 및 FAB 메뉴 동작 정밀 조정
    - [ ] 관련 테스트(단위/Smoke/E2E) 실행 및 통과 확인 (결과 로그 확인 필수)
    - [ ] 3_prj_docs/완료내역/TASK_T020_완료내역.md 작성 (테스트 성공 결과 포함)
    - [ ] 현재 tasks.md 내 해당 항목 완료 체크([x])
    - [ ] 한글 메시지로 git commit 및 git push 수행
- [ ] T021 배포를 위한 Dockerfile 작성 및 `.dockerignore` 설정 (standalone 빌드 최적화)
    - [ ] 관련 테스트(단위/Smoke/E2E) 실행 및 통과 확인 (결과 로그 확인 필수)
    - [ ] 3_prj_docs/완료내역/TASK_T021_완료내역.md 작성 (테스트 성공 결과 포함)
    - [ ] 현재 tasks.md 내 해당 항목 완료 체크([x])
    - [ ] 한글 메시지로 git commit 및 git push 수행
- [ ] T022 `3_prj_docs/완료내역` 문서화 및 최종 인수 테스트 수행
    - [ ] 관련 테스트(단위/Smoke/E2E) 실행 및 통과 확인 (결과 로그 확인 필수)
    - [ ] 3_prj_docs/완료내역/TASK_T022_완료내역.md 작성 (테스트 성공 결과 포함)
    - [ ] 현재 tasks.md 내 해당 항목 완료 체크([x])
    - [ ] 한글 메시지로 git commit 및 git push 수행

---

## Dependencies
- US1 완료 후 US2 상호작용 기능 개발 가능
- US3 관리자 기능은 US1, US2의 데이터 스키마가 안정화된 후 본격 진행

## Parallel Execution Examples
- T008(US1 Setup UI)과 T009(US1 Logic)는 독립적으로 동시 진행 가능
- T015(Admin Layout)는 US2 개발과 병렬로 기초 공사 진행 가능
