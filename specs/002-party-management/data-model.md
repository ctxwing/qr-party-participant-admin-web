# Data Model: 파티 관리 및 실시간 공지

## Entity: Party (파티)

파티의 생명주기와 기본 정보를 관리합니다.

| Field | Type | Constraint | Description |
|-------|------|------------|-------------|
| id | uuid | PK, default: uuid() | 고유 식별자 |
| name | text | NOT NULL | 파티 명칭 |
| description | text | | 파티 상세 설명 |
| start_at | timestamp | NOT NULL | 파티 시작 일시 (KST) |
| end_at | timestamp | NOT NULL | 파티 종료 일시 (KST) |
| status | text | default: 'draft' | 상태: draft, active, completed |
| max_participants | integer | default: 0 | 최대 참여 가능 인원 (0: 제한없음) |
| qr_anchor_url | text | | 해당 파티 전용 접속 URL (설정값) |
| created_at | timestamp | default: now() | 생성 일시 |
| updated_at | timestamp | default: now() | 수정 일시 |

- **Validation Rules**: `end_at`은 반드시 `start_at` 이후여야 함.
- **State Transitions**: `draft` -> `active` (시작) -> `completed` (종료).

---

## Entity: Announcement (실시간 공지)

관리자가 파티 참여자들에게 보낸 공지 내역을 저장합니다.

| Field | Type | Constraint | Description |
|-------|------|------------|-------------|
| id | uuid | PK, default: uuid() | 고유 식별자 |
| party_id | uuid | FK (parties.id) | 대상 파티 ID |
| content | text | NOT NULL | 공지 내용 |
| type | text | default: 'info' | 공지 유형: info, emergency, notice |
| created_at | timestamp | default: now() | 발송 일시 |

- **Relationships**: Party (1) : Announcement (N)

---

## Entity: ExternalReservation (외부 예약 연동)

외부 시스템(WordPress 등)에서 가져온 예약 데이터입니다.

| Field | Type | Constraint | Description |
|-------|------|------------|-------------|
| id | uuid | PK | 고유 식별자 |
| party_id | uuid | FK (parties.id) | 연결된 파티 ID |
| external_id | text | | 외부 시스템의 ID (WP ID 등) |
| name | text | NOT NULL | 예약자 성함 |
| phone_last4 | text | NOT NULL | 전화번호 뒷자리 (인증용) |
| status | text | | 예약 상태 (confirmed, cancelled 등) |
| synced_at | timestamp | | 동기화 일시 |
