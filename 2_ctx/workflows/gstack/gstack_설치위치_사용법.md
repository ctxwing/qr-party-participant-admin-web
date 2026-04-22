# gstack 설치 및 사용법 가이드

- **작성일**: 2026-03-24
- **버전**: gstack latest (garrytan/gstack)
- **설치 환경**: Ubuntu 24.04, ctx-tower 개발 서버

---

## 1. gstack 개요

gstack은 Y Combinator CEO Garry Tan이 만든 오픈소스 AI 엔지니어링 워크플로우 도구.
Claude Code를 가상 엔지니어링 팀으로 전환하여, CEO 리뷰어, 엔지니어링 매니저, 디자이너, QA 리드, 보안 책임자, 릴리스 엔지니어 등 20개 이상의 전문 역할을 슬래시 명령어로 사용할 수 있다.

SKILL.md 표준을 지원하는 모든 AI 코딩 에이전트(Claude Code, Gemini CLI, Antigravity, Codex 등)에서 동작한다.

---

## 2. 설치 위치 및 구조

### 2.1 소스 저장소 (원본)

```
~/gstack/                          ← git clone 원본
├── SKILL.md                       ← 루트 스킬 정의
├── setup                          ← 설치/빌드 스크립트
├── browse/dist/browse             ← 헤드리스 브라우저 바이너리
├── .agents/skills/                ← Codex/Gemini 포맷 생성 스킬 (28개)
│   ├── gstack/SKILL.md
│   ├── gstack-autoplan/SKILL.md
│   ├── gstack-browse/SKILL.md
│   └── ... (총 27개 하위 스킬)
├── office-hours/SKILL.md          ← Claude 포맷 소스 스킬
├── review/SKILL.md
├── qa/SKILL.md
└── ...
```

### 2.2 에이전트별 설치 경로

| 에이전트 | 설치 경로 | 연결 방식 | 스킬 수 |
|----------|-----------|-----------|---------|
| **Claude Code** | `~/.claude/skills/gstack` → `~/gstack` (심볼릭 링크) | 심볼릭 링크 28개 (각 스킬별) | 28개 |
| **Gemini CLI** | `~/.gemini/skills/` | `gemini skills link ~/gstack` | 28개 |
| **Antigravity** | `~/.gemini/skills/` (Gemini와 공유) | Gemini 스킬 자동 인식 | 28개 |

### 2.3 Claude Code 스킬 심볼릭 링크 상세

`~/.claude/skills/` 디렉토리에 생성된 gstack 관련 링크:

```
~/.claude/skills/
├── gstack -> ~/gstack              ← 루트 (메인 엔트리)
├── gstack-upgrade                   ← 업그레이드 스킬
├── autoplan -> gstack 내부 링크
├── benchmark
├── browse
├── canary
├── careful
├── codex
├── cso
├── design-consultation
├── design-review
├── document-release
├── freeze
├── guard
├── investigate
├── land-and-deploy
├── office-hours
├── plan-ceo-review
├── plan-design-review
├── plan-eng-review
├── qa
├── qa-only
├── retro
├── review
├── setup-browser-cookies
├── setup-deploy
├── ship
└── unfreeze
```

---

## 3. 설치 방법 (재현용)

### 3.1 최초 설치 (이미 완료)

```bash
# Step 1: 소스 클론
git clone https://github.com/garrytan/gstack.git ~/gstack

# Step 2: Claude Code용 심볼릭 링크 생성 후 setup
ln -s ~/gstack ~/.claude/skills/gstack
cd ~/.claude/skills/gstack && ./setup

# Step 3: Gemini CLI / Antigravity용 링크
gemini skills link ~/gstack
```

### 3.2 업그레이드

```bash
# 방법 1: gstack 슬래시 명령어 사용
/gstack-upgrade

# 방법 2: 수동
cd ~/gstack && git pull && ./setup
```

### 3.3 새 프로젝트 시작 시 초기화 (추천)

새로운 프로젝트(N)가 시작되었을 때, 전역 `~/gstack` 설정을 프로젝트로 가져오고 **슬래시 명령어를 활성화**하려면 다음 스크립트를 한 번 실행합니다.

```bash
# Antigravity 환경용 초기화 스크립트 실행
bash 2_ctx/workflows/gstack/init_gstack.sh (실제 파일 존재 여부 확인 필요)
```

**이 스크립트의 특징:**
1.  **용량 최적화**: 350MB의 `gstack`을 복사하지 않고 필요한 정의 파일(`SKILL.md`)만 가져옵니다.
2.  **명령어 노출**: Antigravity가 `/review`, `/qa` 등을 즉시 인식하게 합니다.
3.  **메모리 격리**: 설계 이력(`DESIGN.md`, `PLAN.md` 등)이 전역 폴더가 아닌 **현재 프로젝트의 `.agent/gstack-state/`에 고유하게 저장**됩니다.
4.  **휴대성**: 프로젝트 폴더를 복사하거나 이동해도 절대 경로 참조를 통해 안전하게 동작합니다.

---

## 4. 명령어 모음

### 4.1 전체 명령어 표

| 분류 | 명령어 | 설명 |
|------|--------|------|
| **기획/브레인스토밍** | `/office-hours` | YC 오피스 아워 스타일 아이디어 검증. 시작점으로 추천 |
| **플랜 리뷰** | `/plan-ceo-review` | CEO/창업자 관점 리뷰. 10-star 제품 찾기, 스코프 확장/축소 |
| | `/plan-eng-review` | 엔지니어링 매니저 관점. 아키텍처, 데이터플로우, 엣지케이스, 테스트 |
| | `/plan-design-review` | 디자이너 관점 리뷰. 각 디자인 차원 0-10점 평가 |
| | `/autoplan` | CEO + Design + Eng 리뷰 자동 순차 실행 (질문 없이 자동 결정) |
| **디자인** | `/design-consultation` | 디자인 시스템 구축. 타이포그래피, 컬러, 레이아웃, 모션 제안 → DESIGN.md 생성 |
| | `/design-review` | 라이브 사이트 시각적 QA. 불일치/간격/슬롭 탐지 후 수정 |
| **코드 리뷰** | `/review` | PR 사전 리뷰. SQL 안전성, LLM 신뢰경계, 조건부 사이드이펙트 검사 |
| | `/codex` | OpenAI Codex로 독립적 코드 리뷰/챌린지/컨설팅 (세컨드 오피니언) |
| **QA/테스트** | `/qa` | 실제 브라우저로 QA 테스트 → 버그 발견 → 코드 수정 → 재검증 루프 |
| | `/qa-only` | QA 테스트 보고서만 생성 (코드 수정 없음) |
| | `/browse` | 헤드리스 브라우저. URL 탐색, 스크린샷, 요소 인터랙션 (~100ms/명령) |
| | `/benchmark` | 성능 회귀 탐지. 페이지 로드, Core Web Vitals, 리소스 크기 비교 |
| | `/canary` | 배포 후 카나리 모니터링. 콘솔 에러, 성능 저하, 페이지 실패 감시 |
| **배포** | `/ship` | 테스트 → 리뷰 → 푸시 → PR 생성. 원커맨드 배포 |
| | `/land-and-deploy` | PR 머지 → CI 대기 → 프로덕션 헬스체크 검증 |
| | `/setup-deploy` | 배포 플랫폼 설정 (Fly.io, Render, Vercel, Netlify 등) |
| **디버깅** | `/investigate` | 체계적 디버깅. 4단계: 조사 → 분석 → 가설 → 구현. 근본원인 없이 수정 금지 |
| **문서화** | `/document-release` | 배포 후 문서 업데이트. README/ARCHITECTURE/CHANGELOG 동기화 |
| | `/retro` | 주간 엔지니어링 회고. 커밋 분석, 기여도 통계, 트렌드 추적 |
| **보안** | `/cso` | Chief Security Officer 모드. OWASP Top 10, STRIDE, 공급망 보안 감사 |
| | `/careful` | 파괴적 명령어 경고 (rm -rf, DROP TABLE, force-push 등) |
| | `/freeze` | 특정 디렉토리만 편집 허용. 나머지 잠금 |
| | `/guard` | careful + freeze 동시 적용. 최대 안전 모드 |
| | `/unfreeze` | freeze 해제. 전체 편집 허용 |
| **쿠키/인증** | `/setup-browser-cookies` | 실제 브라우저 쿠키를 헤드리스 세션으로 가져오기 |
| **유지보수** | `/gstack-upgrade` | gstack 최신 버전으로 업그레이드 |

### 4.2 에이전트별 명령어 호출 방식

| 에이전트 | 호출 방식 | 예시 |
|----------|-----------|------|
| Claude Code | `/명령어` (슬래시 명령) | `/office-hours` |
| Gemini CLI | `/명령어` 또는 자연어로 스킬 호출 | `/review` 또는 "review my code" |
| Antigravity | Gemini와 동일 | `/qa` |

---

## 5. 시나리오별 사용 방법

### 시나리오 1: 새로운 기능 아이디어 → 프로덕션 배포 (풀 파이프라인)

전체 개발 파이프라인을 gstack으로 진행하는 흐름.

```
1단계: 아이디어 검증
> /office-hours
→ "일일 캘린더 브리핑 앱을 만들고 싶다" 라고 설명
→ gstack이 6가지 핵심 질문으로 아이디어 검증

2단계: CEO 관점 리뷰
> /plan-ceo-review
→ 스코프 확장/축소 모드 선택
→ 10-star 제품이 되려면 무엇이 필요한지 분석

3단계: 엔지니어링 리뷰
> /plan-eng-review
→ 아키텍처, 데이터 흐름, 엣지 케이스, 테스트 전략 확정

4단계: 디자인 리뷰
> /plan-design-review
→ 각 디자인 차원 0-10점 평가, 10점에 도달하기 위한 방법 제시

5단계: (또는 1~4단계를 한번에)
> /autoplan
→ CEO + Design + Eng 리뷰를 자동 순차 실행

6단계: 코드 작성 후 리뷰
> /review
→ PR 사전 리뷰, SQL 안전성, 보안 경계 검사

7단계: QA 테스트
> /qa https://localhost:3000
→ 실제 브라우저로 테스트 → 버그 발견 → 자동 수정 → 재검증

8단계: 배포
> /ship
→ 테스트 실행 → 리뷰 → 커밋 → PR 생성

9단계: 프로덕션 검증
> /land-and-deploy
→ PR 머지 → CI 대기 → 헬스체크 → 카나리 모니터링

10단계: 문서 업데이트
> /document-release
→ README, CHANGELOG, ARCHITECTURE 문서 자동 동기화
```

### 시나리오 2: 기존 코드 PR 리뷰

작업 중인 브랜치의 변경사항을 리뷰받고 싶을 때.

```
1단계: 코드 리뷰 실행
> /review
→ diff 기반 분석: SQL 인젝션, LLM 신뢰경계, 조건부 사이드이펙트 검사
→ pass/fail 판정 + 수정 제안

2단계: (선택) 세컨드 오피니언
> /codex
→ "codex review" 모드: OpenAI Codex로 독립적 리뷰
→ "codex challenge" 모드: 적대적으로 코드 깨뜨리기 시도

3단계: 수정 후 배포
> /ship
→ 테스트 → 리뷰 통과 확인 → PR 생성
```

### 시나리오 3: 라이브 사이트 QA 테스트

배포된 사이트의 버그를 찾고 수정하고 싶을 때.

```
1단계: (선택) 인증이 필요한 사이트라면 쿠키 설정
> /setup-browser-cookies
→ Chrome/Arc/Brave 등에서 쿠키를 가져와 헤드리스 세션에 적용

2단계: QA 테스트 + 자동 수정
> /qa https://your-site.com
→ Quick (critical/high만), Standard (+medium), Exhaustive (+cosmetic) 중 선택
→ 헤드리스 브라우저로 실제 테스트
→ 버그 발견 → 소스 코드 수정 → 재검증 → 커밋
→ before/after 헬스 스코어 보고

또는 보고서만 원할 때:
> /qa-only https://your-site.com
→ 버그 보고서만 생성 (코드 수정 없음)
```

### 시나리오 4: 디자인 시스템 구축

프로젝트에 일관된 디자인 시스템을 만들고 싶을 때.

```
1단계: 디자인 시스템 생성
> /design-consultation
→ 제품 이해 → 시장 조사 → 디자인 시스템 제안
→ 미학, 타이포그래피, 컬러, 레이아웃, 간격, 모션 정의
→ DESIGN.md 생성 (프로젝트 디자인 소스 오브 트루스)

2단계: 라이브 사이트 디자인 감사
> /design-review
→ 시각적 불일치, 간격 문제, 계층 구조, AI 슬롭 패턴 탐지
→ 문제 발견 → 수정 → 스크린샷 비교 → 커밋
```

### 시나리오 5: 보안 감사

프로덕션 배포 전 보안 점검을 수행하고 싶을 때.

```
1단계: CSO 모드 실행
> /cso
→ daily 모드 (zero-noise, 8/10 확신도 게이트)
→ comprehensive 모드 (월간 심층 스캔, 2/10 기준)
→ 점검 항목:
   - 시크릿 아카이빌리티 (하드코딩된 키/토큰)
   - 디펜던시 공급망 (알려진 취약점)
   - CI/CD 파이프라인 보안
   - LLM/AI 보안
   - OWASP Top 10
   - STRIDE 위협 모델링

2단계: (선택) 안전 모드 활성화
> /guard
→ careful (파괴적 명령어 경고) + freeze (디렉토리 잠금) 동시 적용
→ 프로덕션 환경 작업 시 실수 방지
```

### 시나리오 6: 디버깅 (근본원인 분석)

버그의 원인을 체계적으로 추적하고 싶을 때.

```
1단계: 편집 범위 제한 (선택)
> /freeze src/services/rendering
→ 렌더링 모듈만 편집 허용, 관련 없는 코드 수정 방지

2단계: 체계적 디버깅
> /investigate
→ 4단계 프로세스:
   1. 조사 (Investigate): 에러 로그, 재현 조건 수집
   2. 분석 (Analyze): 코드 흐름 추적, 관련 변경사항 확인
   3. 가설 (Hypothesize): 가능한 원인 목록 작성
   4. 구현 (Implement): 근본원인 확인 후에만 수정 적용
→ "근본원인 없이 수정 금지" 원칙 적용

3단계: 편집 잠금 해제
> /unfreeze
```

### 시나리오 7: 주간 회고 / 성과 분석

한 주간의 개발 성과를 분석하고 싶을 때.

```
> /retro
→ 커밋 히스토리 분석
→ 사람별 기여도 분석 (팀 프로젝트의 경우)
→ 코드 품질 메트릭
→ 추가/삭제 라인 수, 커밋 수, net LOC
→ 이전 회고 대비 트렌드 추적
→ 칭찬할 점 + 성장 영역 제시
```

### 시나리오 8: 성능 벤치마크

배포 전후 성능 비교를 하고 싶을 때.

```
1단계: 베이스라인 측정
> /benchmark https://your-site.com
→ 페이지 로드 시간, Core Web Vitals, 리소스 크기 측정

2단계: 코드 변경 후 재측정
> /benchmark https://your-site.com
→ before/after 비교
→ 성능 회귀가 있으면 경고
→ PR 단위로 추적 가능
```

---

## 6. 빌드/관리 명령어

gstack 자체의 빌드 및 관리에 사용하는 명령어:

```bash
cd ~/gstack

bun install              # 의존성 설치
bun test                 # 테스트 실행 (무료, <5초)
bun run build            # 문서 생성 + 바이너리 컴파일
bun run gen:skill-docs   # SKILL.md 파일 재생성 (Claude용)
bun run gen:skill-docs --host codex  # Codex/Gemini용 SKILL.md 재생성
bun run skill:check      # 전체 스킬 건강 상태 대시보드
```

---

## 7. 주의사항

- SKILL.md 파일은 `.tmpl` 템플릿에서 **자동 생성**됨. 직접 수정하지 말고 템플릿 수정 후 `bun run gen:skill-docs` 실행
- `/browse`는 헤드리스 Chromium 기반. 실행에 Bun v1.0+ 필요
- safety 스킬 (`/careful`, `/freeze`, `/guard`)은 Claude가 아닌 에이전트에서는 인라인 경고 문구로 동작
- `~/gstack/`은 git 저장소이므로 `git pull`로 업데이트 가능
- Claude Code에서 gstack 스킬이 동작하지 않으면: `cd ~/.claude/skills/gstack && ./setup` 재실행

---

## 8. 참고 링크

| 제목 | 링크 |
|------|------|
| gstack GitHub 저장소 (garrytan/gstack) | https://github.com/garrytan/gstack |
| gstack - Claude Code로 만드는 가상 엔지니어링 팀 (GeekNews) | https://news.hada.io/topic?id=27756 |
| Y Combinator의 AI 에이전트 사용법 완벽 정리 - Gstack (GPTers) | https://www.gpters.org/nocode/post/complete-guide-using-y-Ctg4mEpXdCUJjek |
