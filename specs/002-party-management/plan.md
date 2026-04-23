# Implementation Plan: 파티 관리 및 QR 설정 (Party Management & QR Settings)

**Branch**: `main` (002-party-management) | **Date**: 2026-04-23 | **Spec**: [/specs/002-party-management/spec.md](file:///home/ctxwing/docker-ctx/lancer/qr-party-participant-admin-web/specs/002-party-management/spec.md)
**Input**: Feature specification from `/specs/002-party-management/spec.md`

**Note**: 본 플랜은 `/speckit.plan` 명령에 의해 생성되었으며, `2_ctx/workflows/speckit/ctx.03_plan.md`의 기술 가이드를 준수합니다.

## Summary

관리자가 아이디/패스워드 인증을 통해 로그인하고, 파티의 생명주기(생성/시작/종료)를 관리하며, 실시간 공지를 발송하고, 브랜딩된 QR 코드를 설정 및 다운로드할 수 있는 기능을 구현합니다. 백엔드는 Drizzle ORM과 Supabase Realtime을 사용하며, 프론트엔드는 Next.js와 ag-grid v35+를 활용합니다. WordPress 연동은 추후 고도화 단계로 미룹니다.

## Technical Context

**Language/Version**: Bun 1.1+, Next.js 16.2.1+, Python 3.13+ (uv 가상환경)
**Primary Dependencies**: ag-grid-react v35+, Better Auth (관리자 인증), shadcn/ui, Tailwind CSS, Zustand, Supabase SDK, Drizzle ORM, qrcode.react
**Storage**: SQLite (개발용), Supabase/PostgreSQL (상용)
**Testing**: Bun test
**Target Platform**: Linux Server (Docker), Mobile/PC Web (반응형)
**Project Type**: Next.js Full-stack Web Application
**Performance Goals**: 실시간 공지 도달 시간 < 1초, 파티 목록 로딩 < 0.5초
**Constraints**: KST 시간대 고정, `main` 브랜치 단일 운영, 58100+ 포트 사용
**Scale/Scope**: 파티 이력 10,000건 이상 대응, 실시간 참여자 1,000명 동시 접속 대응

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

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
├── spec.md              # 기능 명세서
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
│   │   │   │   ├── party/       # 파티 관리 페이지
│   │   │   │   └── settings/
│   │   │   │       └── qr/      # QR 설정 페이지
│   │   ├── components/
│   │   │   ├── party/           # 파티 관련 공용 컴포넌트
│   │   │   └── ui/              # shadcn/ui 컴포넌트
│   │   ├── lib/
│   │   │   ├── ag-grid-setup.ts # ag-grid v35 테마 설정
│   │   │   └── supabase.ts      # Supabase 클라이언트
│   │   └── store/               # Zustand 상태 관리
└── database/
    ├── schema.ts         # Drizzle 스키마 정의
    └── data.db           # SQLite (개발용)
```

**Structure Decision**: Next.js 기반의 Full-stack 구조를 채택하며, 모든 소스는 `./prj_source` 하위에 배치합니다.

## Complexity Tracking

*Constitution Check 위반 사항 없음.*
