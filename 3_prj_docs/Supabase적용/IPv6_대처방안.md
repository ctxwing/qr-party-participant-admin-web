# Supabase IPv6 연결 문제 대처 방안

## 문제 상황
Supabase의 기본 데이터베이스 호스트(`db.[project-ref].supabase.co`)는 IPv6 전용으로 설정되어 있어, IPv4 전용 네트워크 환경에서 직접 연결이 불가능합니다.

## 에러 증상
```
OSError: [Errno 99] Cannot assign requested address
connection timeout
dial tcp [IPv6주소]:5432: connect: cannot assign requested address
```

## 해결 방안

### 방안 1: Transaction Pooler 사용 (최종 성공 방법 ⭐)

#### 연결 정보
- **Host**: `aws-1-ap-northeast-2.pooler.supabase.com`
- **Port**: `6543`
- **User**: `postgres.pmrdxgqrjdreurdsznex`
- **Database**: `postgres`
- **SSL**: `require`

#### 특징
- ✅ IPv4 완전 호환
- ✅ 무료 제공
- ✅ 높은 성능 (Connection Pooling)
- ✅ 자동 연결 관리

#### 연결 문자열 예시
```python
# Python psycopg2
CONNECTION_STRING = "host=aws-1-ap-northeast-2.pooler.supabase.com port=6543 user=postgres.pmrdxgqrjdreurdsznex password=비밀번호 dbname=postgres sslmode=require"

# URL 형식
postgresql://postgres.pmrdxgqrjdreurdsznex:비밀번호@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres
```

#### 확인 방법
Supabase 대시보드에서 확인:
1. Database > Connection Pooling 메뉴
2. "Transaction" 탭 선택
3. "IPv4 compatible" 표시 확인
4. 연결 정보 복사

### 방안 2: Session Pooler 사용

#### 연결 정보
- **Host**: `aws-1-ap-northeast-2.pooler.supabase.com`
- **Port**: `5432`
- **User**: `postgres.pmrdxgqrjdreurdsznex`
- **Database**: `postgres`

#### 특징
- ✅ IPv4 호환
- ⚠️ 일부 SQL 기능 제한 (pgbouncer session mode)
- 📊 더 많은 동시 연결 지원

### 방안 3: IPv4 Add-on 구매 (유료)

#### 개요
- Supabase에서 제공하는 IPv4 전용 주소
- 기본 호스트를 IPv4로 변경
- 월 $4 추가 비용

#### 장점
- 기존 연결 문자열 그대로 사용 가능
- 모든 도구와 완벽 호환

#### 단점
- 추가 비용 발생
- 무료 플랜에서 사용 불가

## 실제 적용 과정

### 시도한 방법들과 결과

#### 1. 직접 연결 (실패)
```python
# 실패한 연결
host="db.pmrdxgqrjdreurdsznex.supabase.co"
port=5432
# 결과: IPv6 주소로 인한 연결 실패
```

#### 2. Pooler 호스트 잘못된 형식 (실패)
```python
# 잘못된 호스트명
host="aws-0-ap-northeast-2.pooler.supabase.com"  # aws-0 (틀림)
# 결과: 호스트 존재하지 않음
```

#### 3. 올바른 Transaction Pooler (성공)
```python
# 성공한 연결
host="aws-1-ap-northeast-2.pooler.supabase.com"  # aws-1 (정확)
port=6543
user="postgres.pmrdxgqrjdreurdsznex"
# 결과: IPv4 연결 성공
```

### 핵심 포인트

#### 1. 호스트명 정확성
- ❌ `aws-0-ap-northeast-2.pooler.supabase.com`
- ✅ `aws-1-ap-northeast-2.pooler.supabase.com`

#### 2. 포트 번호
- Transaction Pooler: `6543`
- Session Pooler: `5432`

#### 3. 사용자명 형식
- 기본 연결: `postgres`
- Pooler 연결: `postgres.프로젝트ref`

#### 4. 지역별 차이
- 지역마다 다른 번호 사용 가능 (`aws-1`, `aws-2` 등)
- 대시보드에서 정확한 정보 확인 필수

## 개발 환경별 설정

### Python (psycopg2)
```python
import psycopg2

conn = psycopg2.connect(
    host="aws-1-ap-northeast-2.pooler.supabase.com",
    port=6543,
    user="postgres.pmrdxgqrjdreurdsznex",
    password="비밀번호",
    database="postgres",
    sslmode="require"
)
```

### Node.js (pg)
```javascript
const { Pool } = require('pg');

const pool = new Pool({
  host: 'aws-1-ap-northeast-2.pooler.supabase.com',
  port: 6543,
  user: 'postgres.pmrdxgqrjdreurdsznex',
  password: '비밀번호',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});
```

### CLI 도구 (psql)
```bash
psql "postgresql://postgres.pmrdxgqrjdreurdsznex:비밀번호@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?sslmode=require"
```

## 네트워크 테스트 방법

### 연결 가능성 확인
```bash
# IPv4 연결 테스트
nc -zv aws-1-ap-northeast-2.pooler.supabase.com 6543

# 성공 시 출력 예시
# Connection to aws-1-ap-northeast-2.pooler.supabase.com 6543 port [tcp/*] succeeded!
```

### DNS 조회 확인
```bash
# IPv4 주소 확인
nslookup aws-1-ap-northeast-2.pooler.supabase.com

# IPv6 전용 호스트 (연결 불가)
nslookup db.pmrdxgqrjdreurdsznex.supabase.co
```

## 트러블슈팅

### 여전히 연결 실패하는 경우

#### 1. 호스트명 재확인
- 대시보드에서 정확한 Pooler 호스트 확인
- 지역별로 다른 번호 사용 가능

#### 2. 비밀번호 문제
- 특수문자 포함 시 URL 인코딩 필요
- 최근 변경한 비밀번호 적용 시간 대기

#### 3. 방화벽 문제
- 포트 6543 아웃바운드 허용 확인
- 회사 네트워크 정책 확인

#### 4. SSL 인증서 문제
- `sslmode=require` 설정 확인
- 인증서 검증 비활성화 옵션 시도

## 성능 비교

| 연결 방식 | IPv4 지원 | 성능 | 비용 | 제한사항 |
|-----------|-----------|------|------|----------|
| 직접 연결 | ❌ | 최고 | 무료 | IPv6 전용 |
| Transaction Pooler | ✅ | 높음 | 무료 | 없음 |
| Session Pooler | ✅ | 중간 | 무료 | 일부 SQL 제한 |
| IPv4 Add-on | ✅ | 최고 | $4/월 | 없음 |

## 권장사항

### 개발 환경
- **Transaction Pooler 사용** (무료, 고성능)
- 연결 정보를 환경 변수로 관리
- 정기적인 연결 테스트 자동화

### 프로덕션 환경
- 높은 가용성이 필요한 경우: IPv4 Add-on 고려
- 비용 절약이 우선인 경우: Transaction Pooler 사용
- 연결 풀링으로 성능 최적화

---
**작성일**: 2026-04-22
**최종 업데이트**: 2026-04-22
**검증 환경**: Ubuntu Linux, IPv4 전용 네트워크
**작성자**: Kiro AI