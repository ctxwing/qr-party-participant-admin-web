---
description: Supabase 클라이언트가 호출 시마다 새로 생성되어 WebSocket이 CLOSING/CLOSED 상태가 되는 문제
created: 2026-04-28T11:19:00+09:00
resolved: 2026-04-28T11:22:00+09:00
status: 해결 완료
---

# WebSocket "already in CLOSING or CLOSED state" 에러

## 발생 시각
- 2026-04-28 11:19

## 문제 현상
- 브라우저 콘솔에 `WebSocket is already in CLOSING or CLOSED state` 에러 반복 출력
- 실시간 구독(쪽지, 알림)이 끊기거나 누락될 수 있음

## 원인 분석

### 핵심 원인
`src/lib/supabase.ts`의 `createClient()`가 **호출할 때마다 새 Supabase 인스턴스를 생성**함.

Supabase 클라이언트는 내부적으로 WebSocket 연결을 관리하므로, 매번 새 인스턴스가 생성되면:
1. 이전 WebSocket 연결은 정리되지 않은 채 방치됨
2. 방치된 연결이 CLOSING/CLOSED 상태가 되어 에러 발생
3. 여러 컴포넌트에서 `createClient()` 호출 시 WebSocket 연결이 기하급수적으로 증가

### 발생 위치
- `useRealtime.ts:8` — `const supabase = createClient()` (렌더링마다 호출)
- `setup/page.tsx:22` — `const supabase = createClient()` (렌더링마다 호출)
- `dashboard/page.tsx:175` — `const supabase = createClient()` (렌더링마다 호출)

### 해결 방법
`createClient()`를 **싱글톤 패턴**으로 변경하여 브라우저 전체에서 단 하나의 Supabase 인스턴스만 사용하도록 수정.

## 해결 체크리스트

- [x] **수정**: `supabase.ts` — 싱글톤 패턴 적용 (모듈 변수 캐시)
- [x] **테스트**: 브라우저 콘솔에서 WebSocket 에러 0건 확인
- [x] **테스트**: `/setup`, `/dashboard` 정상 렌더링 확인
- [x] **문서**: 해결 내역 업데이트

## 해결 상세 내역

### `supabase.ts` 변경

**변경 전** (매 호출 시 새 인스턴스):
```ts
export function createClient() {
  const supabase = createBrowserClient(url, key)
  // ... intercept fetch
  return supabase
}
```

**변경 후** (싱글톤):
```ts
let clientSingleton: ReturnType<typeof createBrowserClient> | undefined = undefined

export function createClient() {
  if (clientSingleton) return clientSingleton
  clientSingleton = createBrowserClient(url, key)
  // ... intercept fetch (최초 1회만)
  return clientSingleton
}
```

### 추가 정리
- 디버그용 `console.log` 제거 (`setAdminUserId`, fetch interceptor 내)

## 결과
- WebSocket 에러 **0건** (이전: 반복 발생)
- 단일 Supabase 인스턴스로 모든 컴포넌트가 공유
- `/setup`, `/dashboard` 정상 렌더링

## 교훈
- Supabase `createBrowserClient()`는 모듈 수준 싱글톤으로 관리해야 함
- 호출 시마다 생성하면 WebSocket 연결 누적 → 에러 발생
- [Supabase 공식 가이드](https://supabase.com/docs/guides/auth/server-side/creating-a-client)에서도 싱글톤 패턴 권장

## 관련 파일
- `prj_source/frontend/src/lib/supabase.ts` — 싱글톤 적용
