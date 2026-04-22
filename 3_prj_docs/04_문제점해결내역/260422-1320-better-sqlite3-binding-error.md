# 문제점 해결 내역 (260422-1320)

## 1. 문제 현상
- `/setup` 페이지 접속 및 닉네임 설정 시 서버 에러(500) 발생.
- 터미널 로그: `⨯ Error: Could not locate the bindings file. Tried: ... better_sqlite3.node`
- 원인: `better-sqlite3` 라이브러리의 네이티브 바인딩 파일이 현재 실행 환경(Ubuntu Linux)과 일치하지 않아 발생한 오류. (macOS 등 다른 환경에서 설치된 `node_modules`가 복사되었거나 빌드 환경 불일치)

## 2. 해결 방안
- 현재 프로젝트는 **Bun** 런타임에서 구동 중이므로, 네이티브 바인딩 의존성이 없는 Bun 내장 SQLite 드라이버(`bun:sqlite`)로 교체하여 환경 의존성 문제를 근본적으로 해결함.

## 3. 조치 내역
1.  **의존성 라이브러리 교체**:
    - `better-sqlite3` 및 `@types/better-sqlite3` 삭제.
    - Drizzle ORM 드라이버를 `drizzle-orm/better-sqlite3`에서 `drizzle-orm/bun-sqlite`로 교체.
2.  **데이터베이스 설정 수정 (`src/database/db.ts`)**:
    - `import Database from "better-sqlite3"` → `import { Database } from "bun:sqlite"`
    - `import { drizzle } from "drizzle-orm/better-sqlite3"` → `import { drizzle } from "drizzle-orm/bun-sqlite"`
    - 데이터베이스 파일 경로를 `src/database/sqlite.db`로 명시하여 `drizzle.config.ts`와 동기화.
3.  **불필요 파일 정리**:
    - 프로젝트 루트의 빈 `sqlite.db` 파일 삭제.
    - 중복된 `src/database/package.json` 등의 의존성 정리.

## 4. 결과 확인
- `src/database/db.ts` 로드 테스트 완료 (`bun src/database/db.ts` 실행 시 에러 없음).
- `/setup` 페이지 접속 시 500 에러 사라짐 확인.

---
**해결 시간**: 2026-04-22 13:20
**담당자**: Antigravity (AI)
