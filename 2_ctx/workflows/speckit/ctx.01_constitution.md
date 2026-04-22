# 충돌 및 문제 발생 시 대응 원칙

- 설계 문서 간, 또는 지시 사항 간에 서로 충돌하는 내용이 발견되면 **반드시 사용자에게 확인 후 진행**한다.
- 구현 중 예상치 못한 문제나 기술적 장애물이 발생하면 **즉시 사용자에게 보고하고** 해결 방향에 대한 승인을 받는다.
- 임의로 판단하여 충돌을 해소하거나 문제를 우회하지 않는다.

---

- 모든 설계 문서와 주석은 반드시 한글(korean)로 작성한다.
- 작성일자는 현재 일자로 하고, 작성자는 **ctxwing@gmail.com** 으로 기록하라. (AI 명칭이나 "Antigravity" 등 AI 작성자 표기는 절대 금지한다.)
- 큰 task ( 1, 1.1 등의 task) 가 완료로 종료되면 로컬에 커밋하고, 항상 github에 푸시한다. 이때 커밋 내용은 반드시 한글로 기록하고 한줄로 표시한다.

# 타임존(Timezone) 설정

- 모든 개발 코드 및 Docker 환경에서는 반드시 대한민국 표준시(KST, UTC+9)를 사용하도록 설정한다.
- Dockerfile 작성 시 `ENV TZ=Asia/Seoul`을 포함하고, 관련 패키지(tzdata 등)를 설치하여 시스템 타임존을 강제한다.
- 데이터베이스(PostgreSQL 등) 연결 및 저장 시에도 KST 기준을 준수한다.

# Tasks.md 의 관리

- 개발의 phase 종료 후에는 반드시 완료사항을 3*prj_docs/완료내역/TASK*<X>\_완료내역.md 파일을 작성하고 내부에 작성일자를 기록한다.
- git commit ㅎ한다.

# 프로젝트 소스 구조

- 모든 소스 코드는 `./prj_source` 디렉토리 하위에 위치한다.
  - `./prj_source/frontend`: Next.js 기반 프론트엔드 코드
  - `./prj_source/backend`: FastAPI 기반의 API 서버 및 핵심 로직
  - `./prj_source/background`: Celery 기반의 비동기 워커 및 배치 작업
  - `./prj_source/database`: 데이터비이스 자체, 데이터베이스 스키마 및 마이그레이션 파일
  - `./prj_source/docs`: 프로젝트 문서 및 API 문서
  - `./prj_source/tests`: 테스트 코드
  - `./prj_source/scripts`: 유틸리티 스크립트 및 배포 스크립트

## React/Node.js 사용 시

- **패키지 매니저 강제**:
  - 1. 모든 JavaScript/Node.js 프로젝트는 오직 **`bun`**만을 사용한다. (`bun install`, `bun run`, `bunx` 사용)
  - 2. 어떠한 경우에도 `npm` 사용은 절대 금지하며, `pnpm`은 특별한 예외 사유(bun과의 극심한 호환성 문제) 발생 시 사용자의 명시적 허락 하에서만 검토한다.
- Next.js 를 사용하는 경우, 버전은 16.1+ 로 하고 telemetry 를 사용하지 않도록 차단해.
- **Next.js 프로젝트**: Turbopack을 사용한다. (Next.js 16+ 공식 권장 번들러, Webpack 대비 700배 빠름)
- **Vanilla React 프로젝트**: Vite를 사용한다. (빠른 개발 서버 및 빌드)
- vercel에 배포하는 경우, vercel 직접 배포하지 말고 github Action을 통해 배포한다.

### Strapi 설정

- **SQLite DB 경로**: Strapi의 SQLite 데이터베이스 파일은 반드시 `prj_source/backend/database/data.db` 를 사용해야 한다. (기본 `.tmp/data.db` 사용 금지)

## python 사용 시

- python의 버전은 3.13+을 사용하라
- python 명령어 수행 시에는, 반드시 uv(패키지관리자)로 만들어진 가상환경을 사용하라. 없다면 생성할지 여부를 사용자에게 반드시 질문하라
- pyproject.toml을 사용하여 관리한다
- 모듈, 플러그인 추가시에는 반드시 uv add <설치모듈> 형식으로 한다.
- 프로젝트 또는 경우에 따라 프로젝트의 /backend/.venv 와 같이 가상환경을 사용한다.
- 코드 실행시 반드시 아래와 같이 한다.

```
#이렇게 하지말고
source .venv/bin/activate && python main.py
# 반드시 이렇게 해
uv run python main.py
```

# Github repo 관리

- github repo 생성시 반드시 사용자에게 묻고 진행한다.
- 생성 및 관리시 gh를 사용하되, .gitignore를 반드시 만들고 확인한다. repo의 생성은 반드시 public 이 아닌 private 이다.
- 작성자, 기여자는 ctxwing@gmail.com 이다.
- Co-Authored-By 또는 추가적인 contributor 는 없다
- 브랜치는 오로지 main하나만 관리한다. 다른 브랜치는 추가하지 말라. 문제가 발생되면 반드시 나에게 보고하고 알려라
- 로컬의 git 작업시 지난번 작업이후 추가된 사항을 기능 추가하는 경우 [feat]를 붙이고, 에러 수정은 [fix] 를 붙여서 커밋해.
- git commit 진행시 메시지가 길 경우, 반드시 개행 표시를 하여 모두 한줄에 모두 표시해
- 로컬과 github의 브랜치는 main으로만 사용한다. 하위 브랜치를 신규로 만들거나 사용하지 않는다.

# 프롬프트에서 여러 줄로 나뉜 복합 셸 명령 실행시

## 현재의 문제점

1. 사용 환경

- 통합 개발 환경(IDE): VSC (Visual Studio Code)

2. 실행하려는 명령

- 핵심 내용: 프로젝트 디렉토리 이동, 가상 환경 활성화, PYTHONPATH 설정, 그리고 여러 줄에 걸친 Python 코드를 인라인 문자열로 받아 실행하는 작업.
- 아래의 예시와 같이 여러 줄로 나뉜 복합 셸 명령어를 수행 시, 하나의 라인이 하나의 명령어오 인식되어, 프롬프트에서 일일이 run을 수흥하여야 다음 작업을 진행할 수 있음으로, 매번 승인 필요하여 매우 불편함.
- 아래 예시 참조

```Bash

cd backend && source .venv/bin/activate && \
PYTHONPATH=/Users/michael/works/lancer/videogen-by-template/backend/src python3 -c "
from services.qc_checker import QCChecker
from models.photo import Photo
from uuid import uuid4
from datetime import datetime
:
"
```

## 문제의 원인

- 복합 셸 명령의 마지막 부분인 python3 -c "..." 안에 포함된 Python 코드가 여러 줄로 작성되어 있어, 터미널(셸)이 명령이 끝났다고 인식하지 못하고 명령을 실행할 때마다 사용자에게 추가 입력 여부를 묻습니다.

## 사용자 지시 사항

- 명령 실행 시 사용자에게 묻지 않고, 복잡한 인라인 Python 코드가 한 줄 명령으로 인식되어 바로 실행되게 하고 싶음. (즉, 여러 줄 입력을 하나의 완전한 명령으로 처리하고 싶음.)

## 해결방법

-문제는 터미널에서 여러 줄의 Python 코드를 인라인 문자열로 실행할 때 발생하는 줄 바꿈 인식 오류이며, 이를 해결하기 위해 Python 코드를 별도 파일로 분리하거나 (권장), 코드를 강제로 세미콜론(;)으로 연결된 한 줄 문자열로 변환해야 합니다

- 예시- 복합 셸 명령: 아래 코드예시와 cd backend && source .venv/bin/activate && PYTHONPATH=... python3 -c

### 다음은 두 가지 해결책을 Kilocode에게 지시하는 방법입니다.

1. 방법 1 (권장): Python 코드를 새 파일로 분리하여 실행

- 이 방법은 가장 깔끔하며, Kilocode가 코드를 분석하고 새로운 파일을 생성하도록 지시하는 방식입니다.
- 예시)
  "선택된 Python 코드를 /backend/run_qc.py라는 새 파일로 분리하고, from services.qc_checker import QCChecker 등의 import 구문과 모든 로직을 포함시켜줘. 원본 셸 명령은 이 파일을 실행하도록 업데이트하고."
- 새 파일 생성: /backend/run_qc.py 경로에 필요한 Python 코드를 작성하여 생성합니다.

2. 기존의 긴 셸 명령을 코드를 강제로 세미콜론(;)으로 연결된 한 줄 문자열로 변환

- 해당 셸 명령을 python3 -c "..." 안의 Python 코드를 모두 세미콜론(;)을 사용하여 하나의 연속된 줄로 변환하고, 셸 명령의 이스케이프 문제가 없도록 따옴표와 이스케이프 문자(\)를 조정해줘. 터미널에서 엔터 한 번으로 실행되게 만들어야 해."

예시)

```Bash
cd backend && source .venv/bin/activate && PYTHONPATH=/Users/michael/works/lancer/videogen-by-template/backend/src python3 run_qc.py
```

## 결론

- 복잡한 셸/Python 인라인 명령의 따옴표 및 이스케이프 처리는 오류 발생 가능성이 높으므로, **방법 1 (파일 분리)**을 사용하는 것이 훨씬 안전하고 유지보수에도 좋습니다.

# 프로젝트 계획 내용 반영 (ctx.03_plan.md)

# 공통사항

- 본 프로젝트의 개발에 가장 적합한 기술 스택을 분석하고 제시하라
- 별도의 지시된 기술 스택이 있다면 그것을 우선으로 한다
- **설계 및 지시 충돌 시**: 설계 문서 간, 또는 지시 사항 간에 충돌이 발생하거나 기술적 문제가 발생하면 **반드시 사용자에게 확인 후 진행한다**. 임의로 판단하여 진행하지 않는다.
- 코드 내의 주석은 반드시 상단에 파일명과 작성일자, 코드 파일명, 용도, 주의 사항을 반드시 상세히 기록한다.
- 산출물의 폴더는 ./prj_source 아래 ./prj_source/frontend, ./prj_source/backend, ./prj_source/database 등의 형식으로 진행하도록 한다. 이 폴더 외 루트 레벨 폴더가 필요한 경우 반드시 사용자에게 확인 후 진행한다.

## DB

### 개발기간 중

- DB는 MVP 개발중에는 sqlite 최신버전을 사용한다. 향후 DB변경을 고려하여 ORM(객체 관계형 매핑) 적용한다.
- 개발중에는 개발서버에 기동되어 있으며 공통으로 사용하는 개발기에 로컬 docker로 기동되어있는 Supabase+pgvector 를 연동할 수 있다.
- sqlite과 공통 도커 컨테이너 사용 여부는 반드시 상용자에게 묻고 지시받은대로 진행한다.

### 최종 상용화 시

- PostgresQL/Supabase+pgvector (상용서버에 도커 또는 Supabase.com 연동)을 사용하되, 개발중 구성된 ORM(객체 관계형 매핑)을 사용한다.
- Drizzle ORM 정의하여 사용하라
- 필드 매핑 테이블 (snake_case)
- 필요시, DB 초기화 SQL 스크립트와 초기 SEED 데이터를 생성하는 스크립트를 반드시 제공하라

## UI/UX

- 사용자의 편의성을 최우선으로 고려한다
- 개발에 적합한 기술 스택을 분석하고, 설치과정이 복잡하지 않고, 결과화면이 미려한 방식으로 개발하여야한다.
- 화면의 UI컴포넌트는 모던하며 깔끔하며, 결과화면이 미려한 방식으로 개발하여야한다

# 프론트

## NextJS / React를 사용하는 경우

- nodejs는 반드시 22+을 사용한다.
  - 1. 모든 설치 및 실행 시 반드시 `bun`만을 사용한다. (`bun install`, `bun run`, `bunx` 사용)
  - 2. 어떠한 경우에도 `npm` 사용은 절대 금지하며, `pnpm`은 특별한 예외 사유 발생 시 사용자의 명시적 허락 하에서만 검토한다.
- Next.js: 16.2.+ 이상을 적용한다.
- 별도로 지시하지 않으면 Tailwind와 shadcn/ui를 적용한다.
- 파일업로드용 React 라이브러리는 Uppy,react-dronezone 순으로 사용한다.

### 테이블 구현 시

- 목록, 테이블형 정보의 제공이 필요한 경우(특히 관리자 패널 등), **`ag-grid`**를 최우선으로 사용한다.
- AG-Grid v35+는 모듈 등록이 필요하다. 공통 설정 파일을 만들어 각 페이지에 적용하여야 한다.
- 테이블 구현시에는 반드시 하단에 한번에 보기 갯수(10,25,50,100,전체)를 선택할 수 있는 드롭다운을 제공한다.
- 테이블의 경우, 반드시 정렬, 필터링, 검색, 페이지네이션을 제공하여야 한다.

### 알림, 팝업

- 이 프로젝트에서는 window.alert을 절대 쓰지 않는다. 모든 알림은 toast를 사용하고 우하단에 표시한다.
- 공통요소를 깔금하고 이쁘게 만들고 공통으로 사용한다.
- 삭제 등 중요 사항의 변경에 대해서는 공통 다이얼로그를 만들고, 사용자에게 반드시 확인 후 진행한다.
- 모든 버튼은 그 버튼이름에 적절한 아이콘을 반드시 버튼 이름 앞에 포함한다.

### 컴포넌트, 상태관리, 인증

- 상태관리: Zustand를 사용한다
- UI animation: React Bits (https://github.com/DavidHDev/react-bits)를 사용하여 미려하고 깔끔한 결과를 생성한다.
- 인증: Better Auth (https://github.com/better-auth/better-auth)를 사용한다

## 기능 UI

### 오픈소스 Notion & Miro 대체재: AFFiNE (https://github.com/toeverything/AFFiNE)

### Excalidraw (https://github.com/excalidraw/excalidraw)

- 손글씨 느낌을 재현해주는 가상의 칠판이라고 보시면 됩니다.
- 간단한 다이어그램을 그리거나 아이디어 스케치, UI 와이어프레임 등을 그리는데 사용할 수 있으며,데스크탑뿐만 아니라 태블릿에서도 편리하게 사용할 수 있습니다

## Flutter를 사용하는 경우

-Flutter SDK 3.35.7+ 을 사용

- 모든 Dart Null Safety 에러 필수 해결

# 백엔드 / 풀스택

## Payload 를 사용하는 경우

- 특별히 지시되지 않으면 기본 Headeless CMS는 Payload를 사용한다.
- 설치 및 실행 시 반드시 `pnpm`을 사용한다.
- https://github.com/payloadcms/payload
- https://payloadcms.com/

## strapi 를 사용하는 경우

- strapi 사용 시 버전은 5+, TS를 적용한다.
- 설치 및 실행 시 반드시 **`bun`**을 사용한다. (npm/pnpm 사용 금지)
- **DB 설정**: SQLite 사용 시 DB 파일은 반드시 `prj_source/backend/database/data.db`에 위치하도록 설정한다. (.tmp 폴더 사용 금지)

## python을 사용하는 경우

- python을 사용하는 경우 python=3.13+을 사용한다.
- python 명령어 수행 시에는, 반드시 uv(패키지관리자)로 만들어진 가상환경을 사용하라. 없다면 생성할지 여부를 사용자에게 반드시 질문하라
- API관련 사항은 FastAPI를 사용하고 scalar 을 구현한다. 내용은 한글로 작성하고, 예시 파라라미터를 상세히 설명한다.
- FastAPI는 0.135.3+ (2026년 4월 릴리스) 버전을 사용한다.
- 반드시 swagger대신 scalar를 구현하고 보안대책을 반영한다.

# Desktop

## Tauri (https://github.com/tauri-apps/tauri)

# Docker 사용하는 경우

## 🛠 Docker 구성 프롬프트 (최종 고도화 버전)

### [기본 원칙]

#### 1. **포트 충돌 방지:** Well-known 포트(5432, 3306, 80 등) 사용 금지. 반드시 본 프로젝트 지정 포트를 사용한다. 특별히 지정되지 않았다면 58100 부터 필요시 +1 하여 사용한다.

사용자에게 이 포트를 사용함을 알려야 한다. 아래의 포트는 예시 이다

- **프론트엔드**: 58100
- **백엔드 (FastAPI)**: 58101
- **Redis**: 58102
- **기타 (MinIO 등)**: 58103~ 영역을 사용하며 중복 여부를 확인한다.

#### 2. **환경 설정:** `.env` 파일은 프로젝트 루트와 혼선되지 않도록 Docker 전용 파일(예: `.env.docker` 또는 명시적 지정)을 정의하고 활용할 것.

### [docker-compose.yml 작성 규격]

#### 1. **상단 주석 (Header):**

- - 서비스 명칭, 주요 스택 버전, 포트 맵핑(Host:Container), 볼륨 경로 요약 포함.
- - 제공된 템플릿의 시각적 구분선 스타일 준수.

#### 2. **이미지(Image):**

- - `hub.docker.com`, `ghcr.io`, 또는 `Quay.io` 등 공식 이미지 사용.
- - `latest` 사용 금지. 최신 안정화 버전(Stable Tag) 명시.

#### 3. **볼륨(Volumes):**

- - Named Volume 사용 금지. 호스트 디렉토리 바인드 마운트만 사용.
- - `./data/{service}` 등 프로젝트 하위 경로로 고정.

#### 4. **리소스 및 재시작 (Resources & Restart):**

- - `restart: unless-stopped` 기본 적용.
- - `mem_limit` 설정 및 GPU 사용 허가(`deploy.resources`).

#### 5. **상태 확인 (Healthcheck):**

- - 서비스 가용성 검증을 위한 `healthcheck` 구문을 반드시 포함할 것. (test, interval, timeout, retries 명시)

---

#### 📄 에이전트 출력 예시 (참조용)

```yaml
# ==============================================================================
# [서비스명] Docker 설정
# - 외부 포트: [Host Port] (지정 필수)
# - 데이터: ./data/[Service] 바인드 마운트
# ==============================================================================

services:
  database:
    image: postgres:16-alpine
    container_name: ctx-db
    restart: unless-stopped
    env_file: .env.docker
    ports:
      - "${DB_HOST_PORT}:5432" # 5432 직접 사용 금지, 외부 지정 포트 매핑
    volumes:
      - ./data/postgres:/var/lib/postgresql/data
    deploy:
      resources:
        limits:
          memory: 2gb
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $${POSTGRES_USER} -d $${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5
```

---
