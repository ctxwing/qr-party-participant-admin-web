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

## 5. Supabase Personal Access Token (PAT) 발급 및 활용

CLI를 통한 데이터베이스 관리나 자동화된 마이그레이션을 위해 개인 액세스 토큰이 필요합니다. 특히 개발 환경의 네트워크 방화벽으로 인해 DB 포트(5432) 접속이 차단된 경우, 이 토큰을 활용한 Management API 통신이 유일한 해결책이 될 수 있습니다.

### 5.1 토큰 발급 단계
1.  **Supabase 대시보드**에 접속하여 로그인합니다.
2.  왼쪽 하단의 **Account 아이콘**을 클릭하고 **[Account Settings]**를 선택합니다.
3.  사이드바 메뉴에서 **[Access Tokens]** 항목을 클릭합니다.
4.  **[Generate new token]** 버튼을 클릭합니다.
5.  토큰의 용도(예: `CLI-Access-Token`)를 입력하고 **[Confirm]**을 누릅니다.
6.  **[중요]** 생성된 토큰 문자열을 **즉시 복사하여 안전한 곳에 보관**하십시오. (창을 닫으면 다시 확인할 수 없습니다.)

### 5.2 CLI 활용 방법
토큰을 발급받은 후, 터미널 환경 변수로 설정하면 CLI 명령 시 매번 로그인할 필요가 없습니다.
```bash
# 환경 변수 설정
export SUPABASE_ACCESS_TOKEN=your_token_here

# 프로젝트 연결 (포트 제한 없이 HTTP API 사용 가능)
supabase link --project-ref your_project_id
```

### 5.3 보안 권장사항
- 토큰은 프로젝트 소유자의 권한을 그대로 가지므로 절대 공개적인 곳에 노출하지 마십시오.
- `service_role` 키와 혼동하지 마십시오. PAT는 사용자 계정 자체의 인증 토큰입니다.

---
**최종 업데이트**: 2026-04-22
