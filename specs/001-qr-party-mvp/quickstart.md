# Quickstart Guide: QR 기반 파티 모바일웹 MVP 개발

## 필수 요구사항
- **Node.js**: v22+ (Bun 사용)
- **Database**: Supabase/PostgreSQL (Drizzle ORM)

## 로컬 개발 환경 설정

### 1. 프론트엔드 (Next.js)
```bash
cd prj_source/frontend
bun install
bun dev
```
- 접속 주소: `http://localhost:58100`
- API (Next.js Routes): `http://localhost:58100/api`

### 2. 데이터베이스 (Drizzle)
```bash
cd prj_source/database
bun install
bun run db:push  # Supabase 스키마 동기화 (drizzle-kit push)
```

## 주요 기능 테스트 방법
1. 모바일 브라우저로 프론트엔드 접속 (또는 QR 코드 생성 후 스캔).
2. 닉네임 설정 후 메인 대시보드 진입 확인.
3. 쪽지 발송 및 실시간 랭킹 업데이트 확인.
4. 관리자 페이지(`/admin`) 접속 후 파티 시간 조절 테스트.
