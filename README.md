# 0_groundzero

AI Vibe Coding을 위한 공통 스켈레톤 프로젝트입니다. 새로운 프로젝트를 시작할 때 이 템플릿을 활용하여 빠르게 개발을 시작할 수 있습니다.

## 📋 개요

이 프로젝트는 다양한 AI 코딩 도구와 워크플로우를 통합하여 개발 생산성을 극대화하기 위해 만들어졌습니다. OpenSpec과 SpecKit(Speckit) 워크플로우를 지원하며, 다양한 AI 코딩 환경에서 활용할 수 있습니다.

## 🚀 빠른 시작

### 1단계: 새 프로젝트 폴더 생성

먼저 새로운 프로젝트를 위한 폴더를 생성합니다.

```bash
mkdir my-new-project
cd my-new-project
```

### 2단계: 0_groundzero 클론

이 프로젝트를 현재 폴더에 클론합니다.

```bash
git clone https://github.com/ctxwing/0_groundzero.git .
```

### 3단계: 원격 저장소 설정

새로운 프로젝트를 위한 원격 저장소를 설정합니다.

```bash
git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_NEW_PROJECT.git
```

### 4단계: 개발 시작

이제 프로젝트 구조가 준비되었으므로 개발을 시작할 수 있습니다!

## 📊 지원하는 플랫폼 및 워크플로우

| 플랫폼 | OpenSpec | Speckit | 비고 |
|--------|----------|---------|------|
| **Antigravity** | ✅ 지원 | ✅ 지원 (커스텀) | 커스텀 워크플로우 적용 |
| **VS Code** | ✅ 지원 | ✅ 지원 | VS Code 확장과 호환 |
| **KiloCode.dev** | ❌ 미지원 | ✅ 지원 (커스텀 스킬) | `.kilocode/skills/`에 커스텀 스킬 포함 |
| **Qwen** | ❌ 미지원 | ❌ 미지원 | `.qwen/` 설정 폴더 제공 |

## 🔧 워크플로우 설명

### OpenSpec
OpenSpec은 프로젝트의 제안서(Pproposal), 적용(Apply), 아카이브(Archive) 등을 관리하는 표준화된 워크플로우입니다. 복잡한 프로젝트 변경 사항을 체계적으로 관리할 수 있습니다.

### Speckit (SpecKit)
SpecKit은 프로젝트 분석, 명세화, 구현 등 전체 개발 라이프사이클을 지원하는 워크플로우입니다.

**커스텀 소스**: 이 프로젝트의 Speckit 워크플로우는 [ctxwing](https://github.com/ctxwing)이 [GitHub SpecKit Discussions #1233](https://github.com/github/spec-kit/discussions/1233)에서 질의하여 얻은 답변을 바탕으로, [markuswondrak](https://github.com/markuswondrak) 개발자가 자신의 프로젝트 [finance-app](https://github.com/markuswondrak/finance-app/tree/main/.agent/workflows)에서 변환하여 공개한 워크플로우를 사용합니다.

## 📁 프로젝트 구조

```
0_groundzero/
├── .agent/              # Agent 워크플로우 파일들
├── .claude/             # Claude AI 관련 설정
├── .gemini/             # Gemini AI 관련 설정
├── .kilocode/           # KiloCode 관련 설정
│   └── skills/          # KiloCode 커스텀 스킬 (notion, vercel, lottie 등)
├── .opencode/           # OpenCode 관련 설정
├── .qwen/               # Qwen AI 관련 설정
├── .specify/            # Specify 관련 설정 및 스크립트
│   ├── memory/          # Specify 메모리 (헌법 등)
│   ├── scripts/         # 자동화 스크립트 (bash)
│   └── templates/       # 플랜/스펙/태스크 템플릿
├── 1_prd/               # PRD (제품 요구사항 문서)
├── 2_ctx/               # 컨텍스트 및 워크플로우
│   ├── 0_secret/        # AI 모델, Notion, S3 등 비밀 정보
│   ├── AG-Grid/         # AG-Grid 라이브러리 참조 문서
│   ├── docs/            # 고객 제안서 등 문서
│   ├── gstack/          # gstack 설치 및 사용법
│   └── workflow/        # 업무 워크플로우 문서 모음
├── 3_prj_docs/          # 프로젝트 문서
├── docs/                # 공개 문서 디렉토리
├── openspec/            # OpenSpec 관련 파일
└── README.md            # 이 파일
```

## 💻 사용법

### Antigravity 환경에서 사용하기

1. 프로젝트를 Antigravity에서 엽니다.
2. `.agent/workflows/` 폴더의 워크플로우 파일들이 자동으로 로드됩니다.
3. OpenSpec 또는 Speckit 워크플로우를 선택하여 사용합니다.

### VS Code 환경에서 사용하기

1. VS Code에서 프로젝트를 엽니다.
2. `.claude/commands/` 또는 `.kilocode/workflows/` 폴더의 워크플로우를 참조합니다.
3. AI 코딩 확장 기능과 함께 사용합니다.

### KiloCode.dev 환경에서 사용하기

1. VS Code에서 KiloCode 확장과 함께 프로젝트를 엽니다.
2. `.kilocode/skills/` 폴더의 커스텀 스킬이 자동으로 로드됩니다.
3. notion-*, vercel-*, lottie, web-design-guidelines 등의 스킬을 활용합니다.

### Qwen 환경에서 사용하기

`.qwen/` 폴더의 설정 파일을 참조하여 Qwen AI 코딩 환경을 구성합니다.

## 📝 문서 작성 가이드

### PRD (제품 요구사항 문서)
`1_prd/` 폴더에 다음 문서를 작성합니다:
- `1_고객요구사항.md`: 고객의 요구사항 정리
- `2_설계분석.md`: 시스템 설계 분석
- `3_예시화면설계.md`: 화면 설계 예시
- `4_기간_비용_추정.md`: 기간 및 비용 추정
- `5_제안차별점.md`: 제안의 차별점

### 프로젝트 문서
`3_prj_docs/` 폴더에 다음 문서를 작성합니다:
- `기동방법.md`: 프로젝트 실행 방법
- `미구현사항.md`: 아직 구현되지 않은 기능 목록
- `Phase_NN_완료내역.md`: 각 단계별 완료 내역

## 🔄 Git 워크플로우

### 커밋 및 푸시

변경 사항을 커밋하고 푸시할 때는 다음 명령어를 사용합니다:

```bash
# 변경 사항 스테이징
git add -A

# 커밋 (한글로 작성)
git commit -m "커밋 메시지"

# 푸시
git push origin main
```

### 브랜치 전략

- `main`: 메인 브랜치
- 기능 개발 시에는 새로운 브랜치를 생성하여 작업한 후 PR을 통해 병합합니다.


## 📊 수정 이력

| 날짜 | 버전 | 변경 내용 | 비고 |
|------|------|-----------|------|
| 2026-03-28 | 1.1.0 | .kilocode/skills, .qwen, 2_ctx/workflow 등 신규 디렉토리 다수 추가 | 플랫폼 지원 확대 및 워크플로우 문서 보강 |
| 2026-03-28 | - | .specify 스크립트 패치 (main 브랜치 우회 허용), 템플릿 업데이트 | 로컬 규칙 준수 위한 Specify 커스텀 수정 |
| 2026-01-07 | 1.0.0 | README.md 이전 버전으로 복구 (0_groundzero 프로젝트 설명) | 타 프로젝트에서 잘못 푸시된 내용 복구 |
| 2026-01-07 | - | 프론트엔드, 백엔드, 컴포넌트 등 주요 외부 모듈 추가 시 선호하는 내용 반영 | 프로젝트 구조 및 워크플로우 개선 |

> 📝 **참고**: 자세한 변경 이력은 [CHANGELOG.md](CHANGELOG.md)를 확인하세요.

## 🔗 관련 링크

- [GitHub Repository](https://github.com/ctxwing/0_groundzero)
- [SpecKit Discussions](https://github.com/github/spec-kit/discussions/1233)
- [Finance App (Speckit 커스텀 소스)](https://github.com/markuswondrak/finance-app/tree/main/.agent/workflows)

## 🔐 개발 계정 정보

개발 및 테스트용 계정 정보는 [2_ctx/workflows/개발계정정보.md](2_ctx/workflows/개발계정정보.md)를 참조하세요.

- **관리자 계정 (Admin)**: `admin` / `Admin1234!`
- **일반 사용자 계정 (User)**: `user@example.com` / `User1234!`

> ⚠️ **주의**: 이 계정 정보는 개발 환경 전용이며, 운영 환경(Production)에는 절대 사용하지 마세요.

## 🔐 개발 계정 정보

개발 및 테스트용 계정 정보는 [2_ctx/workflows/개발계정정보.md](2_ctx/workflows/개발계정정보.md)를 참조하세요.

- **관리자 계정 (Admin)**: `admin` / `Admin1234!`
- **일반 사용자 계정 (User)**: `user@example.com` / `User1234!`

> ⚠️ **주의**: 이 계정 정보는 개발 환경 전용이며, 운영 환경(Production)에는 절대 사용하지 마세요.
