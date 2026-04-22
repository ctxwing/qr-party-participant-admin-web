# Data Model: QR 기반 파티 모바일웹 MVP 개발

## Entities

### PartySession (파티 세션)
- `id`: uuid (PK)
- `title`: varchar (파티명)
- `start_time`: timestamp (KST)
- `end_time`: timestamp (KST)
- `status`: enum ('READY', 'ONGOING', 'FINISHED')
- `participant_limit`: integer (인원 제한)
- `created_at`: timestamp

### Participant (참여자)
- `id`: uuid (PK)
- `session_id`: uuid (FK -> PartySession)
- `anonymous_id`: varchar (Supabase Auth ID)
- `nickname`: varchar (현재 닉네임)
- `nickname_change_count`: integer (기본 0, 최대 3)
- `app_status_1`: boolean (1차 신청 여부)
- `app_status_2`: boolean (2차 신청 여부)
- `created_at`: timestamp

### Message (쪽지)
- `id`: uuid (PK)
- `session_id`: uuid (FK)
- `sender_id`: uuid (FK -> Participant)
- `receiver_id`: uuid (FK -> Participant)
- `content`: text
- `is_read`: boolean (기본 false)
- `created_at`: timestamp

### Interaction (상호작용 - 큐피트/호감도)
- `id`: uuid (PK)
- `type`: enum ('CUPID', 'LIKE')
- `sender_id`: uuid (FK -> Participant)
- `receiver_id`: uuid (FK -> Participant)
- `weight`: integer (점수 가중치)
- `created_at`: timestamp

### Alert (알림 - SOS/시스템)
- `id`: uuid (PK)
- `session_id`: uuid (FK)
- `participant_id`: uuid (FK -> Participant)
- `type`: enum ('SOS', 'SYSTEM')
- `message`: text
- `is_resolved`: boolean (기본 false)
- `created_at`: timestamp

## State Transitions
- **PartySession**: READY -> ONGOING (관리자 수동 또는 시간 도달) -> FINISHED (시간 만료)
- **Participant**: 닉네임 변경 시 `nickname_change_count` 증가 (3회 도달 시 갱신 차단)
- **Alert**: SOS 발생 시 `is_resolved` = false -> 관리자 처리 시 true

## Validation Rules
- 쪽지 내용 최대 200자 제한.
- 큐피트 발사 횟수: 각 참여자당 기본 2회 제한.
- 호감도 주기 횟수: 각 참여자당 기본 3회 제한.
