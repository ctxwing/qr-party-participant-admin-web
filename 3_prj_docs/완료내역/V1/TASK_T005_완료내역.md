# TASK_T005_완료내역: 전체 데이터 모델 스키마 정의

**태스크 ID**: T005
**작업 일시**: 2026-04-22
**작성자**: ctxwing@gmail.com

## 1. 작업 내용
- `prj_source/database/schema.ts`에 MVP 필수 데이터 모델 정의 완료
- 정의된 테이블:
    - `party_sessions`: 파티 정보 및 상태 관리
    - `participants`: 익명 참여자 정보 및 신청 현황
    - `messages`: 실시간 쪽지 데이터
    - `interactions`: 큐피트/호감도 상호작용
    - `alerts`: SOS 요청 및 시스템 알림
- SQLite 제약사항에 맞춰 UUID(text), Enum(text), Timestamp(integer ms) 타입 매핑 적용

## 2. 테스트 결과
- `bunx drizzle-kit push` 실행 결과: **SUCCESS**
- 모든 테이블(5종) 및 외래 키(References) 관계 정상 생성 확인

## 3. 관련 파일
- [prj_source/database/schema.ts](file:///home/ctxwing/docker-ctx/lancer/qr-party-participant-admin-web/prj_source/database/schema.ts)

## 4. 특이사항
- 초기 테스트용 `users` 테이블을 삭제하고 실제 도메인 모델로 데이터베이스를 리셋했습니다.
- 각 ID는 `crypto.randomUUID()`를 통해 기본 생성되도록 설정되었습니다.
