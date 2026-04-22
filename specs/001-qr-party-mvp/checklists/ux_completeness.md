# UX 및 기능 완결성 체크리스트: QR 기반 파티 모바일웹 MVP 개발

**Purpose**: 사용자 경험(UX) 및 기능적 요구사항의 작성 품질과 완결성을 상세히 검증
**Created**: 2026-04-21
**Feature**: [spec.md](file:///home/ctxwing/docker-ctx/lancer/qr-party-participant-admin-web/specs/001-qr-party-mvp/spec.md)

## 1. Requirement Completeness (요구사항 완결성)

- [x] CHK001 '파티 나가기' 수행 시 해당 참여자의 활동 로그 및 상호작용 데이터 처리 방식이 명시되어 있는가? -> **결정**: 세션 만료 처리, 로그는 익명 유지 [Completeness] [Spec §User Story 1]
- [x] CHK002 닉네임 변경 3회 제한 도달 시, 사용자에게 표시될 안내 문구와 UI 상태 변화가 정의되어 있는가? -> **반영**: 화면 설계서 [M-01] 및 Toast 알림 [Clarity] [Spec §FR-002]
- [x] CHK003 SOS 요청 취소 또는 해결(Resolved) 시 참여자 화면에 반영되는 피드백 요구사항이 있는가? -> **결정**: 관리자 해결 시 사용자에게 "해결 완료" Toast 알림 [Gap]
- [x] CHK004 노래 요청 시 중복 요청 방지 또는 목록 노출 순서에 대한 기준이 명시되어 있는가? -> **결정**: 선착순 노출, 중복 곡은 관리자 화면에서 카운트 합산 [Completeness] [Spec §FR-011]

## 2. Interaction Clarity (상호작용 명확성)

- [x] CHK005 '큐피트 발사'와 '쪽지 보내기' 시 대상자를 선택하는 구체적인 UX 흐름(목록 클릭, 검색 등)이 기술되어 있는가? -> **반영**: 화면 설계서 [M-03] 리스트 및 모달 [Clarity] [Spec §User Story 2]
- [x] CHK006 하단 플로팅 버튼(FAB) 클릭 시 나타나는 메뉴 구성과 애니메이션 동작 방식이 정의되어 있는가? -> **반영**: 화면 설계서 [M-05] 부채꼴 확장 애니메이션 [Clarity] [Spec §FR-011]
- [x] CHK007 3초당 1회 상호작용 제한(Rate Limit) 위반 시, 안내 메시지가 Toast로 노출되는지 또는 인라인 메시지로 노출되는지 명확한가? -> **결정**: 전역 Toast 알림 사용 [Clarity] [Spec §SC-005]

## 3. Scenario & Edge Case Coverage (시나리오 및 엣지 케이스)

- [x] CHK008 파티 시간이 만료되어 'FINISHED' 상태로 전환될 때, 실시간으로 접속 중인 사용자의 화면 전환 요구사항이 정의되어 있는가? -> **결정**: 전면 FINISHED 오버레이 및 상호작용 차단 [Coverage] [Spec §FR-006]
- [x] CHK009 네트워크 단절 후 재접속 시, 익명 세션 복구 및 이전 활동 내역(보낸 쪽지 등) 유지 방식이 명시되어 있는가? -> **결정**: LocalStorage 기반 세션 ID 유지 [Coverage] [Spec §Edge Cases]
- [x] CHK010 특정 참여자가 관리자에 의해 강제 퇴장당하거나 차단될 경우의 사용자 시나리오가 존재하는가? -> **결정**: 즉시 BANNED 오버레이 노출 및 세션 파기 [Gap]

## 4. Acceptance Criteria Quality (인수 조건 품질)

- [x] CHK011 '미려하고 깔끔한 UI'라는 추상적 표현을 객체적으로 검증할 수 있는 시각적 기준(색상 대비, 폰트 규격 등)이 있는가? -> **반영**: 설계서의 글래스모피즘, 고유 컬러(큐피트: 핑크 등) 적용 [Measurability] [Spec §C-005]
- [x] CHK012 실시간 랭킹 업데이트 지연 시간(1초 이내)을 측정하기 위한 구체적인 테스트 환경 및 방법이 정의되어 있는가? -> **반영**: Spec SC-002 [Measurability] [Spec §SC-002]
- [x] CHK013 동시 접속자 100명 상황에서의 성능 검증을 위한 부하 테스트 시나리오가 포함되어 있는가? -> **반영**: Spec SC-004 [Measurability] [Spec §SC-004]

## 5. Non-Functional UX (비기능적 UX)

- [x] CHK014 저사양 기기 또는 모바일 브라우저 환경에서의 애니메이션(React Bits) 최적화 및 폴백(Fallback) 요구사항이 있는가? -> **결정**: Intersection Observer 기반 실행 및 CSS 트랜지션 폴백 [Coverage] [Spec §Assumptions]
- [x] CHK015 파티 현장의 어두운 조명 환경을 고려한 다크 모드 지원 또는 고대비 UI 적용 여부가 검토되었는가? -> **반영**: 기본 다크 테마 적용 (Plan.md) [Gap]

## Notes

- **2026-04-21 업데이트**: Antigravity가 설계서 대조 및 MVP 기술 결정을 통해 모든 항목 검토 완료.
- [Gap]으로 표시된 항목들은 Antigravity의 제안으로 해결 방안이 수립되었으며, 구현 시 이를 준수함.
- 본 체크리스트 완료에 따라 구현(Implementation) 단계로 진입함.
