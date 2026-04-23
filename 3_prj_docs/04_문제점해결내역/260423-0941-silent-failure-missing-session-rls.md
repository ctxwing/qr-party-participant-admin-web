# 문제점 해결 내역: party_sessions RLS 권한 누락으로 인한 상호작용 침묵적 실패

**발생 일시**: 2026년 04월 23일 09:32
**작성 일시**: 2026년 04월 23일 09:41

## 1. 발생한 문제점
1. **노래 신청 등 상호작용 시 팝업 미닫힘 및 무반응 지속**
   - 앞서 `alerts` 테이블에 대한 INSERT RLS 권한을 추가하고 에러 토스트를 보완했음에도 불구하고, 여전히 노래 신청 시 에러 토스트나 성공 토스트가 전혀 뜨지 않고 팝업이 그대로 남아있는(침묵적 실패) 현상이 발생.

2. **팝업 닫힘 지연 (체감 속도 저하)**
   - 위 문제를 해결한 후에도, 사용자가 '신청하기'를 눌렀을 때 입력창 텍스트만 초기화된 채 서버(Supabase) 요청이 완료될 때까지 약 0.3초간 팝업이 허공에 늦게 떠 있다가 닫히는 현상이 관찰됨.

## 2. 원인 분석
1. **party_sessions 테이블 RLS 조회(SELECT) 권한 누락**
   - 프론트엔드가 초기 로드될 때 `party_sessions` 테이블에서 현재 진행 중인('ONGOING') 세션 ID를 가져와 `sessionId` 상태에 저장함.
   - 하지만 `party_sessions` 테이블에 익명 사용자(`anon`)가 접근할 수 있는 `SELECT` 권한 정책이 없어서 데이터를 가져오지 못하고 `sessionId`가 `null` 상태로 유지됨.
2. **프론트엔드 방어 로직의 함정 (Silent Return)**
   - 노래 신청(`handleSongRequest`), 쪽지 보내기 등 모든 상호작용 함수의 최상단에 `if (!participant || !sessionId) return;` 이라는 방어 로직이 존재함.
   - `sessionId`가 `null`이므로 함수가 아무런 피드백(에러 토스트 등) 없이 즉시 실행 종료(`return`)되어 버려 사용자 화면에서는 무반응으로 보임.

3. **서버 응답 대기로 인한 다이얼로그 닫힘 지연**
   - 버튼 클릭 시 `onSubmit` 이벤트가 발생하고 내부적으로 Supabase API 호출을 `await`로 기다림.
   - 통신이 완료된 후에야 `setIsMusicOpen(false)` 등이 호출되므로, 네트워크 지연 시간(약 0.2~0.3초)만큼 팝업 창이 화면에 남아 있어 답답한 UX를 유발함.

## 3. 해결해야 할 사항 (체크리스트)
- [x] **Supabase DB 권한 (RLS) 추가**
  - [x] `party_sessions` 테이블에 익명 사용자(`anon`)를 위한 `SELECT` 권한 정책 추가.
- [x] **프론트엔드 에러 가시성(Visibility) 강화**
   - [x] 모든 상호작용 함수에서 `!sessionId` 또는 `!participant`로 인해 함수가 종료될 때, 조용히 종료하지 않고 `toast.error('활성화된 파티 세션이 없습니다.')` 등 명확한 에러 메시지를 띄우도록 방어 로직 수정.
- [x] **체감 속도 개선 (Optimistic UI Update 적용)**
   - [x] 노래 신청, SOS, 쪽지, 호감도 전송 등 모든 상호작용 발생 시, **서버(Supabase) 요청 전에 다이얼로그 닫기 함수를 먼저 호출**하여 즉시 팝업이 닫히도록 로직 순서 변경.

## 4. 해결 내역 및 조치 결과
- **2026-04-23 00:34**: `fix_sessions_rls.ts` 스크립트를 통해 Supabase DB의 `party_sessions` 테이블에 `anon` SELECT 정책(`anon_select_sessions`) 추가 완료.
- **2026-04-23 00:34**: `src/app/dashboard/page.tsx`의 모든 상호작용 함수(`handleInteraction`, `handleSendMessage`, `handleSOS`, `handleSongRequest`) 내부에 세션 부재 시 에러 토스트를 발생시키는 코드 반영 완료.
- **2026-04-23 00:34**: 관련된 모든 변경사항을 Github `main` 브랜치에 커밋 및 푸시 완료 (`fix(dashboard): resolve silent failure caused by missing session ID and add session RLS policy`).
- **2026-04-23 00:55**: `src/app/dashboard/page.tsx`의 모든 상호작용 함수에 Optimistic Close 로직을 적용하여 팝업이 즉시(0초) 닫히도록 UI 체감 속도 최적화 완료. 관련된 수정 사항 깃허브 커밋 및 푸시 완료 (`perf(dashboard): apply optimistic UI updates to immediately close interaction dialogs`).
- **2026-04-23 09:58**: 추가로 발견된 팝업 닫힘 지연 문제와 체감 속도 개선(Optimistic Update) 조치 내역을 본 문서에 병합하여 업데이트 완료.
