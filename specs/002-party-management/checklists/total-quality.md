# Checklist: 파티 관리 및 QR 설정 종합 품질 검증 (Deep Dive)

**Purpose**: 요구사항의 완결성, 명확성, 일관성 및 운영 안정성을 엄격하게 검증하여 기획 및 개발 단계의 리스크를 최소화함.
**Depth**: Deep Dive (엄격)
**Audience**: 기획자(Author), 개발자(Developer), QA

## 1. 요구사항 완결성 [Completeness]
- [x] CHK001 파티 생성 시 필수 입력 항목(명칭, 시간, 인원 등)에 대한 누락이 없는가? [Spec §FR-001, Data Model]
- [x] CHK002 WordPress REST API 연동 시 필요한 인증 방식(API Key, OAuth 등)이 구체적으로 정의되어 있는가? [Resolved: 미정으로 처리 및 현재 단계 제외]
- [x] CHK003 예약 동기화 실패 시 재시도(Retry) 정책이나 관리자 알림 방식이 정의되어 있는가? [Resolved: WP 연동 제외에 따라 해당 사항 없음]
- [x] CHK004 최대 인원(`max_participants`) 도달 시 참여자의 추가 입장 또는 예약 처리 로직이 명시되어 있는가? [Resolved: 관리자 수동 관리]
- [x] CHK005 관리자가 파티를 '강제 종료'했을 때 진행 중인 실시간 기능(공지 등)의 정리 절차가 포함되어 있는가? [Resolved: 종료 안내 페이지로 리다이렉트]

## 2. 요구사항 명확성 [Clarity]
- [x] CHK006 '실시간 공지 발송'의 도달 기준 시간(1초 이내)에 대한 기술적 측정 지표가 명확한가? [Spec §SC-002: 1.5초로 명시됨]
- [x] CHK007 QR 코드 하단에 명시될 '사이트명'과 'URL'의 텍스트 폰트 크기 및 위치 가이드가 존재하는가? [Spec §FR-006: 규격 정의 완료]
- [x] CHK008 '슈퍼 관리자' 권한의 정의와 다른 운영진(Staff) 권한과의 구체적인 기능적 차이가 명시되어 있는가? [Spec §Clarifications: 슈퍼 관리자 전용으로 확정]
- [x] CHK009 파티 상태 변화(`Draft` -> `Active` -> `Completed`)가 발생하는 시스템 트리거(시간 기반 vs 수동)가 정의되어 있는가? [Resolved: 수동 트리거로 확정]

## 3. 요구사항 일관성 [Consistency]
- [x] CHK010 파티 목록의 검색 필터 항목과 데이터 모델(`Party` Entity)의 필드가 1:1로 매칭되는가? [Data Model vs Spec §FR-002]
- [x] CHK011 QR 앵커 URL의 중복 허용 정책이 참여자 접속 페이지의 라우팅 로직과 충돌하지 않는가? [Spec §Clarifications]
- [ ] CHK012 실시간 공지 발송 API의 응답 규격이 프론트엔드 토스트 알림 컴포넌트의 요구사항을 충족하는가? [API Spec vs UI: 연동 규격 구체화 필요]

## 4. 시나리오 및 예외 케이스 커버리지 [Coverage]
- [x] CHK013 두 명의 관리자가 동시에 파티 시작 버튼을 눌렀을 때의 Race Condition 방지 대책이 있는가? [Spec §Clarifications: Last Write Wins]
- [x] CHK014 참여자가 공지 팝업을 닫은 후 다시 확인할 수 있는 '공지 이력' 기능의 필요성이 검토되었는가? [Spec §FR-004-1: 이력 기능 추가]
- [x] CHK015 파티가 이미 종료된 후 QR 코드를 스캔한 사용자에게 보여줄 '종료 안내 페이지'의 디자인/문구가 정의되어 있는가? [Spec §FR-009: 안내 페이지 노출]
- [x] CHK016 서버 시간과 클라이언트(운영자/참여자) 시간의 오차를 해결하기 위한 동기화 전략이 포함되어 있는가? [C-002: KST 고정]

## 5. 비기능적 요구사항 [Non-Functional]
- [x] CHK017 1,000명 이상의 동시 접속 참여자에게 공지를 보낼 때의 Supabase Realtime 성능 한계 및 부하 분산 계획이 있는가? [Plan: Scale/Scope 대응 명시]
- [ ] CHK018 생성된 QR 이미지의 해상도가 오프라인 대형 배너 인쇄 시에도 깨지지 않는 수준(300dpi 이상 등)으로 정의되었는가? [Gap: 해상도 정의 필요]
- [x] CHK019 예약 데이터 동기화 시 개인정보(전화번호 뒷자리 등)의 보안 처리가 데이터 모델상에 반영되었는가? [Data Model: phone_last4]

## 6. 수용 기준 품질 [Acceptance Criteria]
- [x] CHK020 모든 수용 기준(Acceptance Scenarios)이 'Given-When-Then' 형식을 준수하며 객관적으로 검증 가능한가? [Spec §US1~3]
- [ ] CHK021 성능 지표(SC-001~004)를 측정하기 위한 구체적인 테스트 시나리오와 도구가 결정되었는가? [Gap: 테스트 도구 선정 필요]
