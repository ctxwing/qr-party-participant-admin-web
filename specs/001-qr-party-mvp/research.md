# Research & Decisions: QR 기반 파티 모바일웹 MVP 개발

## Decision 1: Supabase as Core BaaS
- **Decision**: Supabase를 메인 백엔드 플랫폼으로 사용합니다.
- **Rationale**: 
    - **실시간성**: Supabase Realtime을 통해 소켓 서버를 직접 구현하지 않고도 쪽지 및 랭킹 실시간 업데이트가 가능합니다.
    - **인증**: Anonymous Auth 기능을 통해 QR 접속 사용자에게 즉각적인 세션을 제공할 수 있습니다.
    - **생산성**: 10일이라는 짧은 기간 내에 스토리지, 인증, 실시간 DB를 통합적으로 해결할 수 있습니다.
- **Alternatives considered**: Firebase (문법 및 비용 산정의 복잡성으로 제외), PocketBase (실시간 알림 기능이 Supabase 대비 제한적).

## Decision 2: Refine for Admin Panel
- **Decision**: 관리자 페이지 구축을 위해 Refine 프레임워크를 사용합니다.
- **Rationale**:
    - **자동화**: Supabase 데이터 어댑터를 통해 DB 테이블 기반의 CRUD 및 관리 기능을 거의 코드 생성 수준으로 빠르게 구축할 수 있습니다.
    - **확장성**: shadcn/ui 등 모던 UI 라이브러리와 결합이 용이하여 미려한 UI를 유지할 수 있습니다.
- **Alternatives considered**: shadcn/ui 기반 직접 개발 (공수 과다).

## Decision 3: Next.js API Routes for Backend Logic
- **Decision**: 추가적인 백엔드 로직이 필요한 경우 Next.js API Routes를 사용합니다.
- **Rationale**:
    - **단일 스택**: Python/FastAPI 없이 JavaScript/TypeScript만으로 프론트엔드와 백엔드를 통합 관리하여 개발 복잡도를 낮춥니다.
    - **배포 용이성**: Vercel 또는 Docker 환경에서 단일 애플리케이션으로 배포가 가능합니다.

## Decision 4: React Bits for Animations
- **Decision**: `React Bits` 라이브러리를 사용하여 현장 분위기를 살리는 미려한 애니메이션을 구현합니다.
- **Rationale**:
    - **프리미엄 디자인**: 헌장 원칙 III에 명시된 대로 결과 화면의 미려함을 확보하기 위한 최적의 오픈소스 모음입니다.
- **Alternatives considered**: Framer Motion 직접 구현 (학습 및 구현 공수 과다).

## Decision 5: Drizzle ORM
- **Decision**: Drizzle ORM을 사용하여 데이터베이스 스키마를 관리합니다.
- **Rationale**:
    - **유연성**: MVP 단계의 SQLite와 운영 단계의 PostgreSQL 간의 전환이 매우 용이합니다.
    - **타입 안정성**: TypeScript와의 강력한 결합으로 런타임 오류를 최소화합니다.
- **Alternatives considered**: Prisma (Bun과의 호환성 문제 및 무거운 런타임으로 인해 배제 권고).
