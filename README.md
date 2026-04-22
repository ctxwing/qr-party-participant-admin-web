# 💘 QR 기반 파티 모바일웹 MVP (QR Party)

파티 현장에서 QR 코드를 통해 즉시 접속하여 참여자 간 상호작용(쪽지, 큐피트, 호감도)을 즐길 수 있는 모바일 전용 웹 서비스와 운영자를 위한 통합 관리 시스템입니다.

---

## 🚀 프로젝트 개요
- **목적**: 파티 현장의 분위기를 고조시키고 참여자 간의 매칭 및 소통을 실시간으로 지원.
- **주요 타겟**: 파티 참가자 (모바일웹), 파티 운영진 (관리자 대시보드).
- **핵심 가치**: 익명 기반의 빠른 참여, 실시간 상호작용, 긴급 SOS 대응.

---

## 🛠 기술 스택
- **Runtime**: Bun
- **Framework**: Next.js 16.2.1 (App Router)
- **Database/BaaS**: Supabase (PostgreSQL, Auth, Realtime)
- **Styling**: Tailwind CSS, shadcn/ui
- **Animation**: React Bits (Ranking UI)
- **State Management**: React Hooks, Supabase Realtime Subscription

---

## 📱 주요 기능

### 1. 참여자 (Mobile Web)
- **익명 참여**: QR 스캔 시 별도 가입 없이 즉시 접속.
- **닉네임 설정**: 닉네임 등록 및 변경 (최대 3회 제한).
- **내 현황판**: 받은 쪽지, 큐피트, 호감도, 알림 개수 실시간 확인.
- **상호작용**:
  - **쪽지**: 타 참여자에게 익명 쪽지 발송.
  - **큐피트**: 호감 가는 상대에게 매칭 제안 (기본 2회).
  - **호감도**: 가벼운 관심 표시 (기본 3회).
- **랭킹 보드**: 실시간 호감도 순위 확인 (`/ranking`).
- **현장 요청**: 노래 신청 및 긴급 SOS 요청 (플로팅 버튼).

### 2. 관리자 (Admin Console)
- **세션 제어**: 파티 시작 및 종료 시간 설정, 남은 시간 실시간 동기화.
- **참여자 관리**: 1/2차 신청 상태 관리, 2차 미신청자 필터링, 잔여 횟수(큐피트/호감도) 수동 조정.
- **실시간 모니터링**: 전체 쪽지 내용 및 참여자 활동 로그 실시간 관제.
- **긴급 대응**: SOS 요청 발생 시 사운드 알림 및 즉각 해결 기능.

---

## 🔑 접속 및 계정 정보

### 접속 경로
- **참여자 메인**: `http://localhost:58100/`
- **관리자 페이지**: `http://localhost:58100/admin`
- **실시간 랭킹**: `http://localhost:58100/ranking`

### 관리자 로그인 정보
- **이메일**: `admin@example.com`
- **비밀번호**: `admin1234`
> [!NOTE]
> 해당 계정 정보는 Supabase Auth에 사전에 등록되어 있어야 합니다.

---

## 🗄️ 데이터베이스 (Supabase)
프로젝트는 다음과 같은 주요 테이블로 구성됩니다:
- `party_sessions`: 파티 상태 및 타이머 정보.
- `participants`: 참여자 프로필 및 신청 상태, 잔여 횟수.
- `messages`: 익명 쪽지 데이터.
- `interactions`: 큐피트 및 호감도 로그.
- `alerts`: SOS 요청 및 노래 신청 내역.

---

## ⚙️ 실행 방법

1. **의존성 설치**
   ```bash
   bun install
   ```

2. **환경 변수 설정**
   `.env.local` 파일을 생성하고 Supabase URL 및 Key를 입력합니다.
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

3. **개발 서버 실행**
   ```bash
   bun run dev
   ```

---

## 📝 구현 내역 및 갭 분석
- 상세 구현 현황은 [3_prj_docs/03_완료내역/260422-1850-requirement-gap-analysis.md](3_prj_docs/03_완료내역/260422-1850-requirement-gap-analysis.md)에서 확인하실 수 있습니다.
