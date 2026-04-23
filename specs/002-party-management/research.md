# Research: 파티 관리 및 QR 설정 기술 조사

## 결정 및 조사 결과

### 1. 예약 시스템 연동 패턴 (WordPress 연동)
- **결정**: 초기 단계에서는 **CSV/JSON 수동 업로드** 기능을 먼저 구현하고, 2단계에서 WordPress REST API를 통한 자동 동기화를 구현함.
- **근거**: 외부 시스템의 DB 직접 접근은 보안 및 인프라 설정(VPN, 방화벽 등)이 복잡할 수 있음. API 방식이 더 안전하고 표준적임.
- **대안**: WordPress DB 직접 연결 (복잡성 및 보안 이슈로 제외).

### 2. 브랜딩 QR 코드 생성 (qrcode.react)
- **결정**: `qrcode.react` 라이브러리의 `Canvas` 모드를 사용하며, `imageSettings` 속성을 통해 중앙 로고를 배치함.
- **구현 방식**:
    - `Canvas` API를 사용하여 QR 하단에 '사이트명'과 'URL'을 텍스트로 렌더링한 후 병합함.
    - `toDataURL()`을 통해 PNG/SVG 다운로드 기능 제공.
- **Rationale**: 라이브러리 지원 기능만으로는 하단 텍스트 병합이 어려우므로 HTML5 Canvas를 활용한 후처리가 가장 깔끔함.

### 3. ag-grid v35+ 테마 및 페이지네이션
- **결정**: 가이드라인(`ctx.03_plan.md`)에 따라 `src/lib/ag-grid-setup.ts`에 `themeQuartz` 기반 테마를 정의하고 전역 적용함.
- **설정 항목**:
    - `paginationPageSizeSelector`: [20, 50, 100, 200]
    - `rowSelection`: { mode: 'multiRow' }
    - 포인트 컬러(#6366f1)를 테마 변수에 반영하여 일관성 유지.

### 4. 실시간 공지 (Supabase Realtime)
- **결정**: `announcements` 테이블의 `INSERT` 이벤트를 모바일 클라이언트에서 구독함.
- **방식**: `supabase.channel('public:announcements')`를 통해 실시간 수신 및 토스트 알림 노출.

---

## Technical Clarifications Resolved

- **로고 파일**: `public/images/logo-qr.png` 경로를 기본 로고로 사용하며, 관리자가 업로드하여 교체 가능하도록 설계함.
- **포트 할당**: 프론트엔드는 `58100` 포트를 사용하며, Docker Compose 설정에 반영함.
