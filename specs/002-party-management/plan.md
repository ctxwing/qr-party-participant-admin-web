# Implementation Plan: 파티 관리 및 QR 설정 (Party Management & QR Settings)

**Branch**: `main` (002-party-management) | **Date**: 2026-04-24 | **Spec**: [/specs/002-party-management/spec.md](file:///home/ctxwing/docker-ctx/lancer/qr-party-participant-admin-web/specs/002-party-management/spec.md)
**Input**: Feature specification from `/specs/002-party-management/spec.md`

**Note**: 본 플랜은 `/speckit.plan` 명령에 의해 생성되었으며, `2_ctx/workflows/speckit/ctx.03_plan.md`의 기술 가이드를 준수합니다.

## Summary

관리자가 아이디/패스워드 인증을 통해 로그인하고, 파티의 생명주기(생성/시작/종료)를 관리하며, 실시간 공지를 발송하고, 브랜딩된 QR 코드를 설정 및 다운로드할 수 있는 기능을 구현합니다. 특히 누락되었던 관리자 상세 제어 기능(시간/인원/횟수 수정)과 참여자 상세 내역 조회, 실시간 타이머 기능을 Phase 5에서 집중 구현합니다.

## Technical Context

**Language/Version**: Bun 1.1+, Next.js 16.2.1+ *(참고: Python 3.13+ 및 uv는 에이전트/툴링용으로 한정)*
**Primary Dependencies**: ag-grid-react v35+, Better Auth (관리자 인증), shadcn/ui, Tailwind CSS, Zustand, Supabase SDK, Drizzle ORM, qrcode.react
**Storage**: Supabase/PostgreSQL (Drizzle ORM 활용)
**Testing**: Bun test
**Target Platform**: Linux Server (Docker), Mobile/PC Web (반응형)
**Project Type**: Next.js Full-stack Web Application
**Performance Goals**: 실시간 공지 도달 시간 < 1초, 파티 목록 로딩 < 0.5초, 실시간 제어 반영 < 1초
**Constraints**: KST 시간대 고정, `main` 브랜치 단일 운영, 58100+ 포트 사용
**Scale/Scope**: 파티 이력 10,000건 이상 대응, 실시간 참여자 1,000명 동시 접속 대응

## Constitution Check

1. **언어 및 문서화 준수**: 한글 작성, 주석(상단 정보 포함), 커밋 메시지, 작성자(ctxwing@gmail.com) 확인 - **PASSED**
2. **시간대 설정**: KST/Asia/Seoul 및 Docker TZ 설정(Asia/Seoul) 확인 - **PASSED**
3. **기술 스택 준수**: Bun, uv, Next.js 16.2.1+, Drizzle ORM 준수 확인 - **PASSED**
4. **UI/UX 규격**: ag-grid v35+(setup 가이드 준수), Tailwind, shadcn/ui, React Bits, Toast(window.alert 금지) 확인 - **PASSED**
5. **소스 구조**: `./prj_source` 하위 경로(frontend, database 등) 준수 확인 - **PASSED**
6. **Docker/포트 규격**: 58100+ 포트, .env.docker, healthcheck 확인 - **PASSED**
7. **단일 브랜치 운영**: `main` 브랜치 유지 및 완료 내역 보고 확인 - **PASSED**

## Project Structure

### Documentation (this feature)

```text
specs/002-party-management/
├── spec.md              # 기능 명세서 (고도화 반영됨)
├── plan.md              # 이 파일
├── research.md          # Phase 0: 기술 조사 결과
├── data-model.md        # Phase 1: DB 스키마 정의
├── quickstart.md        # Phase 1: 개발 시작 가이드
├── contracts/           # Phase 1: API 정의 (Next.js API Routes)
└── checklists/          # 검증 체크리스트
    └── ux-ops.md
```

### Source Code (repository root)

```text
prj_source/
├── frontend/             # Next.js App
│   ├── src/
│   │   ├── app/
│   │   │   ├── admin/
│   │   │   │   ├── parties/      # 파티 목록 및 상세 관리
│   │   │   │   │   └── [id]/     # [NEW] 파티 상세 제어 (시간/인원/상태)
│   │   │   │   ├── alerts/       # 실시간 모니터링 피드
│   │   │   │   └── settings/
│   │   │   │       └── qr/       # QR 브랜딩 설정
│   │   │   ├── dashboard/        # 참여자 메인 (실시간 타이머 추가)
│   │   │   │   └── inbox/        # [NEW] 상호작용 상세 보관함
│   │   │   ├── ranking/          # 순위 (본인 강조 로직 추가)
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   │   ├── monitoring-feed.tsx # [NEW] 실시간 로그 피드
│   │   │   │   └── party-editor.tsx    # [NEW] 파티 정보 실시간 수정 폼
│   │   │   └── user/
│   │   │       ├── live-timer.tsx      # [NEW] 파티 잔여 시간 카운트다운
│   │   │       └── interaction-list.tsx # [NEW] 수신/발신 상세 리스트
│   │   ├── lib/
│   │   │   ├── ag-grid-setup.ts
│   │   │   └── supabase.ts
│   │   └── store/               # Zustand (전역 상태 관리)
```

## Implementation Phases

### Phase 5: 운영 완전성 및 관리자 제어 기능 구현 (NEW)

1.  **관리자 상세 제어 대시보드 (`admin/parties/[id]`)**
    *   파티 시간(시작/종료) 및 인원수 실시간 수정 기능 (Optimistic UI 적용).
    *   참여자 신청 상태(1차/2차) 토글 및 횟수(큐피트/호감도) 수동 조정 API 구축.
2.  **실시간 모니터링 시스템 고도화**
    *   `interactions`, `messages`, `participants` 테이블의 INSERT/UPDATE 이벤트를 Supabase Realtime으로 구독하여 통합 피드 구현.
    *   닉네임 변경 전후 이력을 추적하여 보여주는 로그 UI 구축.
3.  **참여자 대시보드 UX 강화**
    *   `live-timer` 컴포넌트: 서버 시간 기준 파티 종료 카운트다운 구현.
    *   `inbox` 페이지: 내가 주고받은 모든 상호작용 상세 내역(누가, 언제, 무엇을) 조회 기능.
4.  **랭킹 시스템 정교화 및 설정**
    *   시스템 설정(`ranking_weights`)을 UI에서 관리자가 직접 수정할 수 있는 설정 화면 구축.
    *   참여자 본인의 순위를 리스트 최상단에 고정하거나 배경색으로 강조하는 로직 적용.

## Complexity Tracking

- **실시간 데이터 일관성**: 관리자가 횟수를 조정했을 때 참여자 클라이언트의 상태가 즉시 갱신되어야 하므로 Supabase Realtime 채널 구독 최적화 필요.
- **성능 최적화**: 1,000명 동시 접속 시 실시간 모니터링 로그가 관리자 화면을 마비시키지 않도록 가상 스크롤(Virtual Scroll) 적용 필수.

*Constitution Check 위반 사항 없음.*
