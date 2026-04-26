---
status: 해결완료
date: 2026-04-26
tags: [better-auth, database, migration, supabase, middleware, edge-runtime, deadlock, announcements, realtime, nickname, font]
---

# 관리자 페이지 접속 불가 + 공지/닉네임 기능 문제 - 다중 원인 복합 해결

## 문제 발생 시각
- 2026-04-26 04:30 ~ 14:56 (KST)

## 문제 증상

| # | 증상 | 발생 시각 |
|---|------|-----------|
| 1 | `/admin/` 접속 시 브라우저 무반응, 서버 로그만 200 | 04:30 |
| 2 | 로그인 성공 후 페이지 이동 안함 (Turbopack "렌더링..." 멈춤) | 04:34 |
| 3 | `/admin` 404 에러 (Edge 런타임 비호환) | 05:08 |
| 4 | `announcements` 테이블 404 에러 | 05:12 |
| 5 | Safari에서 Outfit 폰트 미적용 | ~13:57 |
| 6 | 닉네임 글자 작고 수정 불가 | ~14:30 |
| 7 | 관리자 공지 발송 시 REST fallback 경고, 사용자 화면에 팝업 없음 | ~14:50 |

## 원인 분석

| # | 문제 | 근본 원인 |
|---|------|-----------|
| 1 | 로그인 500 | Better Auth DB 테이블 미생성 |
| 2 | 페이지 이동 타임아웃 | 미들웨어 `fetch(self)` → 교착상태 |
| 3 | /admin 404 | `auth.api.getSession()` → Edge 런타임에서 `net` 모듈 불가 |
| 4 | announcements 404 | Supabase에 3개 테이블 미생성 |
| 5 | Safari 폰트 다름 | CSS 변수명 `--font-outfit` ≠ Tailwind `--font-sans` |
| 6 | 닉네임 수정 불가 | 서버 액션 `supabase-server` 연결 문제 |
| 7 | 공지 팝업 없음 | API에서 `channel.send()` 브로드캐스트 사용 (구독자 없어 REST 폴백), 대시보드에 리스너 없음 |

## 해결 체크리스트

### 인증 & 인프라
- [x] 1. Better Auth DB 마이그레이션 (`@better-auth/cli migrate`)
- [x] 2. 관리자 계정 생성 (`/api/auth/sign-up/email`)
- [x] 3. 미들웨어 → proxy.ts 전환 (Next.js 16 권장)
- [x] 4. 미들웨어 self-fetch → 쿠키 체크로 변경 (Edge 호환)
- [x] 5. Supabase 누락 테이블 3개 생성 (`announcements`, `nickname_history`, `parties`)

### 미들웨어/프록시 변경 이력 (3차례)

| 버전 | 방식 | 결과 |
|------|------|------|
| v1 | `fetch(self)/api/auth/get-session` | 교착상태(deadlock), 60초+ 타임아웃 |
| v2 | `auth.api.getSession({ headers })` | Edge 런타임에서 Node.js `net` 모듈 불가 → 404 |
| v3 | `request.cookies.get("better-auth.session_token")` | 정상 동작, Edge 호환 ✓ |

### UI & 기능
- [x] 6. Outfit 폰트 CSS 변수명 수정 (`--font-outfit` → `--font-sans`)
- [x] 7. 대시보드 닉네임 영역 개선
  - 글자 크게 + 상단 이동
  - 연필(Edit2) 아이콘으로 수정 다이얼로그 진입
  - 닉네임 수정 이력(`nickname_history`) 조회 표시
- [x] 8. 닉네임 수정: 서버 액션(`updateNickname`) 사용 - 3회 제한 서버 검증
- [x] 9. 공지사항 실시간 팝업
  - API: `channel.send()` 브로드캐스트 제거 → DB INSERT만 수행
  - 대시보드: `postgres_changes`로 `announcements` INSERT 감지
  - 팝업: Dialog 컴포넌트로 공지 내용 즉시 표시

### 공지사항 아키텍처 변경

```
[Before] 관리자 공지 발송
  API Route → DB INSERT + channel.send() broadcast → (구독자 없어 REST 폴백)
  대시보드 → 리스너 없음 → 팝업 없음

[After] 관리자 공지 발송
  API Route → DB INSERT only
  Supabase Realtime → postgres_changes 자동 감지
  대시보드 → INSERT 이벤트 수신 → Dialog 팝업 즉시 표시
```

## 참고 사항
- Better Auth는 `PostgresJSDialect`(Kysely) 방식 사용 시 테이블 자동 생성하지 않음
- **Next.js 16 미들웨어(프록시)는 Edge 런타임에서 실행** → Node.js 전용 모듈(postgres 등) 사용 불가
- Supabase Realtime 브로드캐스트는 구독자가 없으면 REST로 폴백됨 → `postgres_changes` 방식이 더 안정적
- 닉네임 변경 등 비즈니스 로직은 반드시 서버 액션에서 검증 (클라이언트 우회 방지)
- `next/font/google` → Tailwind `font-sans` 적용 시 변수명은 반드시 `--font-sans`
- 향후 새 환경 구성 시: `@better-auth/cli migrate` + Supabase 테이블 생성 + RLS 정책 설정 필요
