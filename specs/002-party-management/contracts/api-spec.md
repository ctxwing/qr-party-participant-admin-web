# API Contracts: 파티 관리 시스템

모든 API는 Next.js API Routes (`/api/admin/*`)를 통해 구현됩니다.

## 1. 파티 관리 API

### `GET /api/admin/parties`
- **목적**: 파티 목록 조회 (ag-grid 연동용)
- **Query Parameters**:
    - `page`: 페이지 번호
    - `limit`: 페이지당 개수
    - `search`: 검색어 (파티명)
- **Response**:
    ```json
    {
      "data": [
        { "id": "...", "name": "불금 파티", "start_at": "...", "status": "active", ... }
      ],
      "total": 100
    }
    ```

### `POST /api/admin/parties`
- **목적**: 신규 파티 생성
- **Request Body**: `name`, `start_at`, `end_at`, `max_participants`

### `PATCH /api/admin/parties/:id`
- **목적**: 파티 정보 수정 및 상태 변경 (시작/종료)

---

## 2. 공지 및 연동 API

### `POST /api/admin/announcements`
- **목적**: 실시간 공지 발송
- **Request Body**: `party_id`, `content`, `type`
- **Behavior**: DB 저장 후 Supabase Realtime 채널을 통해 브로드캐스트

### `POST /api/admin/parties/:id/sync-reservations`
- **목적**: 외부 예약 데이터 동기화
- **Request Body**: `{ source: "wordpress" }` (향후 확장 가능)

---

## 3. QR 관리 API

### `GET /api/admin/settings/qr`
- **목적**: 전역 QR 설정 정보 조회 (Anchor URL 등)

### `PUT /api/admin/settings/qr`
- **목적**: 전역 QR 설정 정보 업데이트
