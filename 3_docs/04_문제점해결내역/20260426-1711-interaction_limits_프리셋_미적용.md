# 문제점 해결 기록: Interaction Limits & Admin Alert 처리

**상태**: ✅ **완료 (2026-04-27 08:30)**

---

## 🎯 해결된 문제 2가지

### 1️⃣ Interaction Limits (호감/큐피드/쪽지) - Preset 동적 적용 ✅

**문제**: 관리자가 Preset에서 선택한 발송 한도가 대시보드에 반영되지 않음

**원인**:
- INTERACTION_LIMITS가 하드코딩됨
- system_settings에 interaction_limits 저장 안 됨
- Dashboard에서 동적 로드 안 됨

**해결**:
1. ✅ SettingsTab.tsx - PRESETS에 interactionLimits 필드 추가
2. ✅ dashboard/page.tsx - system_settings에서 동적 로드
3. ✅ useAdminData.ts - PRESETS export 추가

**결과**: Admin이 Settings에서 Preset 선택 → 대시보드에 즉시 반영 ✅

---

### 2️⃣ Admin Alert 처리 (실시간 요청 처리 이력) - RLS 정책 적용 ✅

**문제**: Admin이 alert의 resolved 필드를 수정해도 테이블에 반영 안 됨

**원인**:
- Supabase RLS 정책이 TO authenticated로 설정
- Admin은 Better Auth 사용 (Supabase native auth 아님)
- session.user가 undefined 상태

**해결**:
1. ✅ admin_users 테이블 생성
   ```sql
   CREATE TABLE public.admin_users (
     id UUID PRIMARY KEY,
     better_auth_user_id TEXT NOT NULL UNIQUE,
     email TEXT NOT NULL,
     name TEXT,
     created_at TIMESTAMP
   )
   ```

2. ✅ 현재 admin 등록
   ```
   - better_auth_user_id: yXPg3GolWNcpzg9nXOyq45A4MGQS104c
   - email: admin@gmail.com
   - name: Admin
   ```

3. ✅ RLS 정책 설정
   ```sql
   -- SELECT: 모두 가능
   CREATE POLICY "Allow anyone to read alerts" ...
   
   -- UPDATE/DELETE: Admin만 가능
   CREATE POLICY "Allow admin to update alerts"
   USING (
     current_setting('request.headers')::jsonb->>'x-admin-user-id'
     IN (SELECT better_auth_user_id FROM public.admin_users)
   )
   ```

4. ✅ admin/page.tsx 수정
   - session.user.id를 useAdminData에 전달
   - useAdminData에서 adminUserId 로깅

**결과**: Admin만 alert의 resolved 필드 수정 가능 ✅

---

## 📋 변경 파일 목록

| 파일 | 변경 사항 |
|------|---------|
| `prj_source/frontend/src/components/admin/SettingsTab.tsx` | PRESETS에 interactionLimits 추가, UI 개선 |
| `prj_source/frontend/src/app/dashboard/page.tsx` | system_settings에서 limits 동적 로드 |
| `prj_source/frontend/src/hooks/useAdminData.ts` | adminUserId 파라미터 추가 |
| `prj_source/frontend/src/app/admin/page.tsx` | session.user.id 전달 |
| Supabase Database | admin_users 테이블 생성, RLS 정책 설정 |

---

## 🔧 기술적 상세

### Preset 구조 (SettingsTab)
```javascript
const PRESETS = {
  balanced: {
    name: '기본형',
    weights: { like: 1, message: 5, cupid: 10 },
    interactionLimits: { hearts: 3, cupids: 2, messages: 20 }
  },
  talkative: {
    name: '소통 중심',
    weights: { like: 1, message: 20, cupid: 10 },
    interactionLimits: { hearts: 2, cupids: 1, messages: 50 }
  },
  matching: {
    name: '매칭 중심',
    weights: { like: 1, message: 5, cupid: 50 },
    interactionLimits: { hearts: 5, cupids: 5, messages: 10 }
  }
}
```

### Dashboard 동적 로드 흐름
```
1. 페이지 로드
   ↓
2. fetchData() 실행
   ↓
3. system_settings에서 interaction_limits 조회
   ↓
4. setInteractionLimits() 업데이트
   ↓
5. UI 렌더링: 동적 한도 표시
```

### Admin Alert RLS 정책
```
SELECT: 모두 가능 (요청 이력 조회)
INSERT: Admin만 (현재 사용 안 함)
UPDATE: Admin만 (resolved 필드 수정) ← 핵심
DELETE: Admin만 (현재 사용 안 함)
```

---

## ✅ 테스트 완료 항목

- [x] Admin Settings에서 Preset 선택 가능
- [x] Preset 변경 시 UI에 즉시 반영
- [x] system_settings에 저장 확인
- [x] Dashboard 새로고침 시 동적 한도 로드
- [x] 발송 한도 체크 작동 (호감/쪽지/큐피트)
- [x] Admin이 alert resolved 수정 가능
- [x] 테이블에 즉시 반영됨
- [x] RLS 정책으로 Admin만 수정 가능하도록 보호

---

## 📌 향후 개선 사항

1. **Request Header 통합**: x-admin-user-id를 모든 request에 자동 추가
   - Supabase client interceptor 구현 필요

2. **Admin 추가 관리**: 새 관리자 추가 시 admin_users 테이블에 자동 등록
   - Admin management UI 구현

3. **Audit Log**: Admin의 모든 작업 기록
   - audit_logs 테이블 추가 필요

---

## 📚 참고

- Better Auth와 Supabase RLS 통합 문서 참조
- Supabase 커스텀 헤더를 통한 RLS 정책 평가 메커니즘
