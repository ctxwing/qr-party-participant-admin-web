# 문제점 해결 내역: Supabase RLS 익명(anon) INSERT 권한 누락 및 UI 예외처리 부재

**발생 일시**: 2026년 04월 23일 09:10
**작성 일시**: 2026년 04월 23일 09:13

## 1. 발생한 문제점
1. **신청 및 상호작용 후 팝업 미닫힘 (침묵적 에러)**
   - 대시보드에서 '노래 신청', 'SOS', '쪽지 보내기' 등을 실행하고 버튼을 눌러도 성공 토스트가 발생하지 않고, 팝업이 그대로 남아 있는 현상이 발생.

## 2. 원인 분석
1. **Supabase RLS (Row Level Security) 권한 누락**
   - 참여자 웹앱은 비로그인 상태(`anon` 퍼블릭 키)로 데이터베이스에 접근함.
   - `alerts`, `messages`, `interactions` 등의 테이블에 RLS가 켜져(enabled) 있었고, 기존에는 `SELECT` 권한만 부여되어 있었음.
   - 따라서 익명 사용자가 데이터를 추가(`INSERT`)하려 할 때 데이터베이스 단에서 권한 부족(401/403)으로 조용히 실패(Reject)하고 있었음.
2. **프론트엔드 에러 핸들링 부재**
   - Supabase 삽입 쿼리가 실패(error 객체 반환)했음에도 불구하고, UI 단(`DashboardPage`)에 `else` 예외 처리문이 누락되어 있어 사용자 화면에 원인(Error Toast)이 노출되지 않고 팝업도 닫히지 않는 '침묵적 실패' 상태가 됨.

## 3. 해결해야 할 사항 (체크리스트)
- [x] **Supabase DB 권한 (RLS) 수정**
  - [x] `alerts` 테이블에 `anon` INSERT 정책 추가
  - [x] `messages` 테이블에 `anon` INSERT 정책 추가
  - [x] `interactions` 테이블에 `anon` INSERT 정책 추가
  - [x] `participants` 테이블에 `anon` UPDATE 정책 추가
- [x] **프론트엔드 예외 처리(Error Toast) 보완**
  - [x] `handleSongRequest` 실패 시 에러 이유를 출력하는 토스트 추가
  - [x] `handleSOS` 실패 시 에러 이유를 출력하는 토스트 추가
  - [x] 성공 시 팝업을 닫도록(`setIsSosOpen`, `setIsMusicOpen`) 보완 조치 (이전 커밋에 반영됨)

## 4. 해결 내역 및 조치 결과
- **2026-04-23 00:11**: `src/app/dashboard/page.tsx` 내부 `handleSongRequest`와 `handleSOS`에 실패 사유를 화면에 띄우는 `toast.error` 분기 추가 및 저장소 커밋 반영.
- **2026-04-23 00:12**: Supabase에 접속하여 `fix_rls.ts` 마이그레이션 스크립트 실행. `anon` 역할을 위한 필수 `INSERT`/`UPDATE` RLS 정책 정상 부여. 
- **2026-04-23 09:13**: 원인 파악부터 해결 조치까지 모든 내역 문서화 완료. 현재 노래 신청 시 팝업 닫힘 및 정상 토스트 송출 확인됨.
