# Supabase 연결 설정 및 검증 가이드 (Standard Guide)

본 문서는 프로젝트에서 Supabase를 연동할 때 필요한 환경 설정과 인증 활성화, 그리고 연결 상태를 검증하는 표준 절차를 안내합니다.

## 1. Supabase 프로젝트 초기 설정

### 1.1 API 정보 확인
Supabase Dashboard 진입 후 다음 경로에서 정보를 복사합니다.
- **경로**: `Project Settings` > `API`
- **확인 항목**:
    - **Project URL**: `https://[PROJECT-ID].supabase.co`
    - **anon (public) Key**: `ey...` (JWT 형식의 긴 문자열)

### 1.2 익명 인증(Anonymous Auth) 활성화
사용자가 별도의 회원가입 없이 즉시 참여할 수 있도록 익명 로그인을 허용해야 합니다.
- **상세 경로**:
    1.  Supabase Dashboard 좌측 메뉴에서 **Authentication** (열쇠 모양 아이콘) 선택
    2.  왼쪽 서브 메뉴의 **Configuration** 섹션 내에 있는 **Providers** 메뉴 선택
    3.  인증 제공자 목록 중 **Anonymous** 행을 찾음
    4.  **Allow Anonymous Sign-ins** 스위치를 클릭하여 **Enabled** 상태로 변경
    5.  우측 하단의 **Save** 버튼을 클릭하여 적용

## 2. 로컬 환경 변수 설정 (.env.local)

프로젝트 루트의 `.env.local` 파일에 다음과 같이 설정합니다. 
- `NEXT_PUBLIC_`: 클라이언트(브라우저) 노출용
- 접두사 없음: 서버 사이드 전용 (보안 중요)

```bash
# Supabase Configuration (Public)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Supabase Configuration (Server Only - DO NOT EXPOSE TO CLIENT)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## 3. 연결 검증 테스트 (CLI)

### 3.1 익명 인증 테스트 (`test-supabase.ts`)
```typescript
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

async function runTest() {
  const { data, error } = await supabase.auth.signInAnonymously()
  if (error) console.error('❌ 인증 실패:', error.message)
  else console.log('✅ 인증 성공! 유저 ID:', data.user?.id)
}
runTest()
```

### 3.2 관리자 권한 테스트 (`test-supabase-admin.ts`)
```typescript
import { createClient } from '@supabase/supabase-js'
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function runAdminTest() {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers()
  if (error) console.error('❌ 관리자 인증 실패:', error.message)
  else console.log('✅ 관리자 연결 성공! 유저 수:', data.users.length)
}
runAdminTest()
```

## 4. 흔한 오류 및 해결 방법 (Troubleshooting)

| 오류 메시지 | 원인 | 해결 전략 |
| :--- | :--- | :--- |
| `Anonymous sign-ins are disabled` | 인증 공급자 미설정 | Supabase Dashboard > Auth > Providers > Anonymous 활성화 |
| `JWT expired` / `Invalid Key` | API Key 만료 또는 오기입 | 대시보드 API 탭에서 Key 재확인 |
| `API key is invalid` | 서비스 롤 키 오기입 | `SUPABASE_SERVICE_ROLE_KEY` 값 확인 |

> [!CAUTION]
> **보안 주의**: `SUPABASE_SERVICE_ROLE_KEY`는 절대로 클라이언트 측에서 사용하지 마십시오.

---
**최종 업데이트**: 2026-04-22
