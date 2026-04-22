# 완료 내역: UI/UX 최적화 및 구성 요소 수정

**날짜**: 2026-04-22
**작업 내용**:
- `DashboardPage`: `DialogTrigger`의 중첩 렌더링 오류 수정 및 UI 정리.
- `AdminDashboard`: 알림(Alerts) 목록의 메시지 표시 로직 단순화 및 가독성 개선.
- `migration_alerts_receiver.sql`: 불필요한 마이그레이션 스크립트 삭제.
- 노래 신청 및 쪽지 보내기 로직의 사용자 경험(UX) 개선.

**상세 변경 사항**:
1. **참여자 대시보드 (`dashboard/page.tsx`)**:
   - `DialogTrigger` 내부에 `Button`이 중첩되어 발생하는 렌더링 경고 해결.
   - 노래 신청 시 수신자 지정 로직을 제거하고 전체 요청으로 단순화.
   - SOS 및 Music 버튼의 클릭 영역 및 피드백 강화.
2. **관리자 대시보드 (`admin/page.tsx`)**:
   - 알림 피드에서 보낸 이의 닉네임과 메시지를 명확하게 구분하여 표시.
3. **기타**:
   - 사용하지 않는 SQL 스크립트 정리.
