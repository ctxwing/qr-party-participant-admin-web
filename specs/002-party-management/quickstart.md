# Quickstart: 파티 관리 및 QR 설정 개발 시작하기

## 1. 환경 설정

### 의존성 설치
```bash
bun install ag-grid-react ag-grid-community qrcode.react zustand
```

### DB 마이그레이션 (Drizzle)
1. `prj_source/database/schema.ts`에 신규 테이블(`parties`, `announcements`) 정의 추가.
2. 마이그레이션 생성 및 적용:
```bash
bun x drizzle-kit generate
bun x drizzle-kit push
```

## 2. 주요 개발 단계

### Step 1: ag-grid v35+ 공통 설정
- `prj_source/frontend/src/lib/ag-grid-setup.ts` 파일을 생성하고 `ctx.03_plan.md`의 가이드에 따라 테마를 설정합니다.

### Step 2: 파티 관리 페이지 (`/admin/party`)
- `AgGridReact`를 사용하여 파티 목록을 구현합니다.
- 상단에 `FlowStep` 컴포넌트와 `HelpManual` 팝업을 배치합니다.

### Step 3: 실시간 공지 기능
- Supabase Realtime을 활성화합니다.
- 관리자 상세 뷰에서 공지 전송 시 `announcements` 테이블에 INSERT 쿼리를 실행합니다.

### Step 4: QR 설정 페이지 (`/admin/settings/qr`)
- `qrcode.react`를 사용하여 Canvas 모드로 QR을 렌더링합니다.
- Canvas API를 활용하여 하단 텍스트(URL)를 병합하는 유틸리티 함수를 작성합니다.

## 3. 확인 사항
- 모든 UI 요소에는 적절한 아이콘을 포함합니다 (Lucide-react 권장).
- 알림은 반드시 `toast`를 사용합니다 (window.alert 금지).
- 시간 데이터는 항상 KST 기준임을 유의하세요.
