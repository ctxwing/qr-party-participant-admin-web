# 💘 QR 기반 파티 모바일웹 MVP (QR Party)

파티 현장에서 QR 코드를 통해 즉시 접속하여 참여자 간 상호작용(쪽지, 큐피트, 호감도)을 즐길 수 있는 모바일 전용 웹 서비스와 운영자를 위한 통합 관리 시스템입니다.

---

## 🚀 프로젝트 개요

- **목적**: 파티 현장의 분위기를 고조시키고 참여자 간의 매칭 및 소통을 실시간으로 지원.
- **주요 타겟**: 파티 참가자 (모바일웹), 파티 운영진 (관리자 대시보드).
- **핵심 가치**: 익명 기반의 빠른 참여, 실시간 상호작용, 긴급 SOS 대응.
- 노션에 공개한 링크: https://www.notion.so/QR-Party-QR-MVP-350b2ab1af55812ea970c68485dd4ae5?source=copy_link

---

## 🛠 기술 스택

- **Runtime**: Bun
- **Framework**: Next.js 16.2.4 (App Router)
- **React**: 19.2.4
- **Database**: Supabase Cloud (PostgreSQL 17) — ap-northeast-2 (서울)
- **ORM**: Drizzle ORM
- **Auth**: Better Auth (관리자 인증)
- **Styling**: Tailwind CSS v4, shadcn/ui, 글래스모피즘 (Dark 모드 기본)
- **Animation**: Framer Motion
- **State Management**: Zustand, React Hooks, Supabase Realtime Subscription
- **Data Grid**: AG Grid (관리자 대시보드)
- **Icons**: Lucide React
- **Toast**: Sonner
- **Theme**: next-themes (다크/라이트)
- **QR Code**: qrcode.react
- **Font**: Outfit (Google Fonts)

---

## 📁 프로젝트 구조

```
qr-party-participant-admin-web/
├── prj_source/
│   ├── frontend/              # Next.js 앱 (메인 소스코드)
│   │   ├── src/
│   │   │   ├── app/           # App Router 페이지 및 API 라우트
│   │   │   ├── components/    # React 컴포넌트 (admin/, dashboard/, ui/)
│   │   │   ├── hooks/         # 커스텀 훅
│   │   │   ├── lib/           # 유틸리티, DB 스키마, Supabase 클라이언트
│   │   │   ├── store/         # Zustand 상태관리
│   │   │   ├── proxy.ts       # Next.js 미들웨어 (관리자 인증 보호)
│   │   │   └── scripts/       # DB 마이그레이션/시딩 스크립트
│   │   ├── supabase/          # Supabase 설정 및 마이그레이션
│   │   └── Dockerfile         # 멀티스테이지 Docker 빌드
│   └── database/              # Drizzle 스키마 (독립 패키지)
├── DB-backup-Supabase/        # Supabase Cloud DB 완전 백업
│   ├── schema-full.sql        # 스키마 DDL + RLS 정책 + 권한
│   ├── data.sql               # 전체 데이터 (auth + public + storage)
│   ├── roles.sql              # DB 역할 정의
│   ├── env.local.backup       # 환경변수 백업
│   └── README-백업-복원.md     # 백업/복원 가이드
├── 3_prj_docs/                # 프로젝트 산출물 (완료내역, 화면설계, 문제해결 등)
├── 2_ctx/                     # 컨텍스트/참고 문서
├── 1_prd/                     # 제품 요구사항 문서
└── start.sh                   # 개발 서버 기동 스크립트
```

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
- **참여자 관리**: 1/2차 신청 상태 관리, 잔여 횟수(큐피트/호감도) 수동 조정.
- **실시간 모니터링**: 전체 쪽지 내용 및 참여자 활동 로그 실시간 관제.
- **긴급 대응**: SOS 요청 발생 시 사운드 알림 및 즉각 해결 기능.
- **공지 관리**: 실시간 공지 발송 (정보/긴급/공지 유형).
- **QR 코드 관리**: 파티별 QR 코드 생성 및 설정.

---

## 🔑 접속 및 계정 정보

### 접속 경로

- **참여자 메인**: `http://localhost:59500/`
- **관리자 로그인**: `http://localhost:59500/admin/login`
- **관리자 대시보드**: `http://localhost:59500/admin/dashboard`
- **파티 관리**: `http://localhost:59500/admin/parties`
- **QR 코드 설정**: `http://localhost:59500/admin/settings/qr`
- **실시간 랭킹**: `http://localhost:59500/ranking`

### 관리자 로그인 정보

- **이메일**: `admin@gmail.com`
- **비밀번호**: `Admin1234!`
  > [!NOTE]
  > 해당 계정은 Better Auth + Supabase DB로 인증됩니다.

---

## 🗄️ 데이터베이스 (Supabase Cloud)

### 연결 정보

- **리전**: ap-northeast-2 (서울)
- **DB 버전**: PostgreSQL 17.6
- **Pooler 연결**: `aws-1-ap-northeast-2.pooler.supabase.com:6543` (IPv4 호환, 권장)
- **Direct 연결**: `db.*.supabase.co:5432` (IPv6 전용)

### 주요 테이블 (14개)

| 테이블             | 용도                       | RLS |
| ------------------ | -------------------------- | --- |
| `parties`          | 파티 정보 및 설정          | ✅  |
| `party_sessions`   | 파티 세션 상태             | ✅  |
| `participants`     | 참여자 프로필 및 잔여 횟수 | ✅  |
| `interactions`     | 큐피드 및 호감도 상호작용  | ❌  |
| `messages`         | 익명 쪽지                  | ✅  |
| `alerts`           | SOS 요청 및 노래 신청      | ✅  |
| `announcements`    | 실시간 공지                | ✅  |
| `nickname_history` | 닉네임 변경 이력           | ✅  |
| `system_settings`  | 시스템 설정 (JSONB)        | ✅  |
| `admin_users`      | 관리자 정보                | ❌  |
| `user`             | Better Auth 사용자         | ❌  |
| `account`          | Better Auth 계정 연동      | ❌  |
| `session`          | Better Auth 세션           | ❌  |
| `verification`     | Better Auth 인증           | ❌  |

### Realtime 구독 (6개 테이블)

`alerts`, `announcements`, `interactions`, `messages`, `participants`, `party_sessions`

### DB 백업

- Supabase Cloud DB의 완전 백업은 `DB-backup-Supabase/` 디렉토리에 보관됩니다.
- 백업 파일: 스키마 (`schema-full.sql`), 데이터 (`data.sql`), 역할 (`roles.sql`), 환경변수 (`env.local.backup`)
- 백업/복원 가이드: [DB-backup-Supabase/README-백업-복원.md](DB-backup-Supabase/README-백업-복원.md)

---

## ⚙️ 실행 방법

### 1. 의존성 설치

```bash
cd prj_source/frontend && bun install
```

### 2. 환경 변수 설정

`prj_source/frontend/.env.local` 파일 생성 후 아래 항목 입력:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=postgresql://postgres.project_ref:password@pooler.supabase.com:6543/postgres
BETTER_AUTH_SECRET=your_secret
BETTER_AUTH_URL=http://localhost:59500
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:59500
NEXT_PUBLIC_ENABLE_VIBRATION=ON
```

### 3. 개발 서버 실행

```bash
# 기동 스크립트 사용 (권장)
bash start.sh

# 또는 수동 기동
cd prj_source/frontend && bun run dev --port 59500
```

### 4. Docker 빌드 (프로덕션)

```bash
cd prj_source/frontend
docker build -t qr-party .
docker run -p 3000:3000 qr-party
```

---

## 📝 구현 내역 및 갭 분석

- 상세 구현 현황은 [3*prj_docs/03*완료내역/V1/260422-1850-requirement-gap-analysis.md](3_prj_docs/03_완료내역/V1/260422-1850-requirement-gap-analysis.md)에서 확인하실 수 있습니다.
- 미구현 사항 (WP 연동 등)은 [3_prj_docs/미구현사항.md](3_prj_docs/미구현사항.md)에 정리되어 있습니다.
- 문제 해결 내역은 [3*prj_docs/04*문제점해결내역/](3_prj_docs/04_문제점해결내역/)을 참조하세요.

---

## 📸 스크린샷

| <img src="3_prj_docs/screenshots/participants/01-landing-page.png" width="250"/> | <img src="3_prj_docs/screenshots/admin/01-admin-login.png" width="400"/> |
|:---:|:---:|
| **참여자 랜딩 페이지** (모바일) | **관리자 로그인** (PC) |

> 전체 상세 화면 (참여자 18장 + 관리자 10장)은 **[README-Screenshot.md](README-Screenshot.md)** 를 참조하세요.
