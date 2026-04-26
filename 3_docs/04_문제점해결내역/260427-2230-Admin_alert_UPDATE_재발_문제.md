# 문제점 해결 기록: Admin Alert UPDATE 재발 문제

**상태**: ✅ **완료 (2026-04-27 22:30)**

---

## 🎯 문제 요약

Admin 콘솔에서 Alert 상태 스위치 클릭 시 UPDATE가 작동하지 않음
- 이전 해결(2026-04-27 08:30)과 동일한 증상 재발
- **원인**: RLS 정책에 Better Auth user ID 전달 메커니즘 부재

---

## 📋 문제 상세

### 발생 시각
- **2026-04-27 22:00** 경 사용자 보고

### 증상

**로그**:
```
Switch 클릭 - Before: 280e71ec-6666-45e6-b9a9-9ebb52388124 false
UPDATE 시작: 280e71ec resolved: true adminUserId: yXPg3GolWNcpzg9nXOyq45A4MGQS104c
UPDATE 응답: [] null
fetchAlerts 완료: resolved는 여전히 false
```

**UI 동작**:
- Switch 클릭 → Toast "완료" 메시지 출력
- 하지만 테이블의 데이터는 변경 안 됨
- 새로고침 후 원래 상태로 되돌아옴

### 영향 범위
- Admin 콘솔의 [실시간 요청 처리] 대시보드
- Alert resolved 필드 UPDATE만 실패
- 다른 기능은 정상 작동

---

## 🔍 원인 분석

### 근본 원인

**Supabase RLS 정책**이 `x-admin-user-id` header를 기대하지만, 요청에 포함되지 않음:

```sql
-- RLS 정책
CREATE POLICY "Allow admin to update alerts"
ON public.alerts FOR UPDATE
USING (
  current_setting('request.headers')::jsonb->>'x-admin-user-id'
  IN (SELECT better_auth_user_id FROM public.admin_users)
)
```

### 재발 원인 분석

1. **이전 해결책의 불완전성**
   - Better Auth user ID를 Supabase 클라이언트에 설정 시도
   - Supabase JS 클라이언트의 fetch interceptor가 제대로 작동 안 함

2. **프론트엔드 인증 방식의 분리**
   - Better Auth (Admin 로그인)
   - Supabase Native Auth (클라이언트 인증)
   - 두 시스템이 분리되어 있음

3. **Header 전달 실패**
   - Supabase 클라이언트 → fetch interceptor 미작동
   - REST API 호출 시 header 미포함

### 이전 해결책이 왜 실패했는가?

```typescript
// ❌ 시도 1: fetch interceptor (미작동)
supabase.fetch = async (input, init) => {
  const newInit = {
    ...init,
    headers: {
      ...init?.headers,
      'x-admin-user-id': adminUserIdGlobal,
    },
  }
  return originalFetch(input, newInit)
}
```

Supabase 클라이언트가 내부적으로 fetch를 사용하지 않았거나, 다른 메커니즘 사용

---

## ✅ 해결 방법 (체크리스트)

### 단계 1: 문제 재현 및 진단 ✅
- [x] 로그 분석으로 UPDATE 요청 실패 확인
- [x] Status 코드 확인 필요 판단
- [x] 상세 로깅 추가 (status, statusText, data, headers)

### 단계 2: 원인 파악 ✅
- [x] 401 Unauthorized 에러 확인
- [x] `No API key found in request` 메시지 수신
- [x] REST API 인증 헤더 누락 진단

### 단계 3: 해결책 선택 ✅
- [x] Supabase JS 클라이언트 대신 **REST API 직접 호출** 결정
- [x] fetch()로 PATCH 요청 구현
- [x] x-admin-user-id header 명시적 포함

### 단계 4: 인증 헤더 추가 ✅
- [x] `apikey` header 추가 (Supabase REST API 요구)
- [x] Authorization header도 함께 포함
- [x] x-admin-user-id header 명시적 전달

### 단계 5: 테스트 및 검증 ✅
- [x] 하드 리프레시 (Ctrl+Shift+R)
- [x] Switch 클릭으로 UPDATE 작동 확인
- [x] 로그에서 성공 메시지 확인

---

## 🛠️ 기술적 해결 내역

### 파일 1: useAdminData.ts

**변경 전**:
```typescript
const { data, error } = await supabase
  .from('alerts')
  .update({ resolved: !current })
  .eq('id', id)
  .select('*')
```

**변경 후**:
```typescript
const response = await fetch(
  `${supabaseUrl}/rest/v1/alerts?id=eq.${id}&select=*`,
  {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': anonKey,              // ← 필수!
      'Authorization': `Bearer ${anonKey}`,
      'x-admin-user-id': adminUserId, // ← RLS 정책 통과
      'Prefer': 'return=representation',
    },
    body: JSON.stringify({ resolved: !current }),
  }
)
```

### 파일 2: supabase.ts

**추가 사항**:
```typescript
// setAdminUserId() 함수 추가 (미사용이지만 유지)
// fetch interceptor 추가 (미사용이지만 유지)
// 향후 필요시 참고용으로 보관
```

### Commit 히스토리

1. **e459f99**: fetch interceptor + setAdminUserId() 추가
2. **cdd820e**: REST API 직접 호출 구현
3. **8f02e03**: 상세 로깅 추가
4. **f91cc90**: apikey header 추가 (최종 해결)

---

## 🔄 동작 흐름

```
Admin 로그인 (Better Auth)
  ↓
AdminDashboard: setAdminUserId(session.user.id) 호출
  ↓
useAdminData.ts: adminUserId 수신
  ↓
Switch 클릭
  ↓
handleToggleResolve() 호출
  ↓
fetch() with PATCH 요청
  ↓
Headers:
  - apikey: {ANON_KEY}
  - x-admin-user-id: {ADMIN_USER_ID}
  ↓
RLS 정책 검증
  ↓
current_setting('request.headers')::jsonb->>'x-admin-user-id'
IN (SELECT better_auth_user_id FROM admin_users)
  ↓
✅ PASS
  ↓
UPDATE 실행 & 데이터 반환
  ↓
fetchAlerts() → UI 갱신
```

---

## ✅ 테스트 결과

**성공 확인 (2026-04-27 22:30)**

```
Switch 클릭 → resolved: false → true 변경
테이블 즉시 반영
새로고침 후에도 true 유지
DB에 정상 저장됨
```

**로그**:
```
UPDATE 시작: adminUserId: yXPg3GolWNcpzg9nXOyq45A4MGQS104c ✅
PATCH https://hlbgedbgycamzvbbykdc.supabase.co/rest/v1/alerts?... 200 ✅
UPDATE 성공 ✅
```

---

## 📚 학습 포인트

### 1. Supabase REST API 인증
- ❌ `Authorization: Bearer` (일부 API용)
- ✅ `apikey` header (REST API 필수)

### 2. 프론트엔드에서 RLS 정책 통과
- 단순 설정 header만으로는 부족
- **명시적인 fetch() 호출**이 필요
- HTTP header로 custom 정보 전달 가능

### 3. Better Auth + Supabase 통합
- 두 인증 시스템의 분리
- Custom header로 Better Auth user를 Supabase RLS에 연결
- Request header → RLS policy → DB 접근 제어

### 4. 디버깅 방법론
- 로그에서 정확한 HTTP Status 확인 필수
- 응답 데이터(data.message) 활용
- 단계별 검증 (인증 → 권한 → 실행)

---

## 🚨 재발 방지

### 체크리스트

- [x] RLS 정책 재확인: admin_users 테이블에 user 등록됨
- [x] x-admin-user-id header가 모든 alert UPDATE에 포함됨
- [x] API key 관리: .env.local에 NEXT_PUBLIC_SUPABASE_ANON_KEY 기록
- [x] 로깅 강화: 요청 status, 응답 data 모두 기록

### 주의사항

1. **Supabase 클라이언트의 한계**
   - JS 클라이언트는 자동으로 RLS header 전달 불가
   - Admin 권한이 필요한 작업은 REST API 직접 호출 권장

2. **Better Auth + Supabase 분리**
   - 향후 새로운 Supabase 작업 시 request header 전달 필수
   - 패턴화된 util 함수 작성 고려

3. **Header 형식**
   - `x-admin-user-id`: Better Auth user.id (문자열)
   - `apikey`: Supabase ANON_KEY (필수)
   - 빠진 항목이 없는지 매번 확인

---

## 📌 결론

**핵심**: Supabase RLS 정책을 통과하려면 HTTP request header로 user 정보를 명시적으로 전달해야 함

**영구 해결책**:
- ✅ REST API 직접 호출 (PATCH with apikey + x-admin-user-id)
- ✅ RLS 정책: current_setting('request.headers')로 header 검증
- ✅ Admin user: admin_users 테이블에서 확인

**향후 적용**:
- 다른 RLS 보호 테이블도 동일한 패턴 사용 가능
- Util 함수화하여 재사용성 높임

---

**최종 상태**: ✅ **완전 해결 및 재발 방지 조치 완료**
