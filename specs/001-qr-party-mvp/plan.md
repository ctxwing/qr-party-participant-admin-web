# Implementation Plan: QR 기반 파티 모바일웹 MVP 개발

**Branch**: `main` (001-qr-party-mvp) | **Date**: 2026-04-21 | **Spec**: [spec.md](file:///home/ctxwing/docker-ctx/lancer/qr-party-participant-admin-web/specs/001-qr-party-mvp/spec.md)
**Input**: Feature specification from `/specs/001-qr-party-mvp/spec.md`

## Summary

이 프로젝트는 파티 현장에서 QR 코드를 통해 접속하여 실시간 상호작용(쪽지, 큐피트, 호감도 등)을 지원하는 모바일웹과 운영자를 위한 관리자 페이지를 구축하는 MVP 개발 프로젝트입니다. Supabase를 BaaS로 활용하여 실시간 데이터 동기화와 익명 인증을 처리하며, Refine을 사용하여 관리자 대시보드를 신속하게 구축합니다.

## Technical Context

**Language/Version**: Bun (Node.js 22+)  
**Primary Dependencies**: Next.js 16.2.1+, Supabase (Realtime, Auth, SDK), Drizzle ORM, Tailwind CSS, shadcn/ui, ag-grid v35+, React Bits.  
**Storage**: SQLite (Local Dev/MVP), Supabase PostgreSQL (Production)  
**Testing**: Bun test  
**Target Platform**: Web (Mobile Optimized)
**Project Type**: Web Application (Full-stack with Next.js & Supabase)  
**Performance Goals**: 실시간 상호작용 지연 시간 1초 이내, 동시 접속 100명 이상 수용  
**Constraints**: KST 타임존, 모든 문서/주석 한글 작성, 포트 58100+ 사용, main 브랜치 단일 운영  
**Scale/Scope**: 파티 상호작용 핵심 기능(쪽지, 큐피트, 호감도, 랭킹) 및 관리자 제어 기능 포함

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

1. **언어 및 문서화 준수**: 한글 작성, 주석, 커밋 메시지, 작성자(ctxwing@gmail.com) 확인 (원칙 I, V, VII) ✅
2. **시간대 설정**: KST/Asia/Seoul 및 Docker TZ 설정 확인 (원칙 II) ✅
3. **기술 스택 준수**: Bun(JS), Next.js 16.2.1+, Supabase, Drizzle ORM 준수 확인 (원칙 I, IV) ✅
4. **UI/UX 규격**: ag-grid, Tailwind, shadcn/ui, React Bits, Toast 사용 확인 (원칙 III) ✅
5. **소스 구조**: `./prj_source` 하위 경로 준수 확인 (원칙 V) ✅
6. **Docker/포트 규격**: 58100+ 포트 및 .env.docker, healthcheck 확인 (원칙 VI) ✅
7. **단일 브랜치 운영**: `main` 브랜치 유지 및 완료 내역(3_prj_docs) 보고 확인 (원칙 VII, 거버넌스) ✅

## Project Structure

### Documentation (this feature)

```text
specs/001-qr-party-mvp/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
prj_source/
├── frontend/            # Next.js (Bun) - 포함 API Routes
├── database/            # Drizzle Schema & Migrations
└── tests/               # Unit/Integration Tests
```

**Structure Decision**: 헌장 원칙 V에 따라 `./prj_source` 하위에 프론트엔드, 백엔드, 데이터베이스 등을 분리하여 관리합니다.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | - | - |
