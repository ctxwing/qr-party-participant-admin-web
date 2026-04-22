# Changelog

프로젝트의 주요 변경 사항을 기록합니다.

## [Unreleased]

## [2026-03-28]

### 추가
- `.kilocode/skills/` - KiloCode 커스텀 스킬 추가 (after-effects, google-docs, lottie, lottie-bodymovin, notion-knowledge-capture, notion-meeting-intelligence, notion-research-documentation, notion-spec-to-implementation, vercel-composition-patterns, vercel-react-best-practices, vercel-react-native-skills, web-design-guidelines)
- `.qwen/` - Qwen AI 관련 설정 폴더 (output-language, skills 등)
- `.specify/README.md` - Specify 워크플로우 커스텀 패치 노트 (main 브랜치 우회 허용 등)
- `2_ctx/0_secret/` - AI 모델, 이미지/영상, Notion, S3 관련 비밀 정보 폴더
- `2_ctx/AG-Grid/` - AG-Grid 라이브러리 요약 문서
- `2_ctx/CONSTITUTION.md` - 프로젝트 헌법 문서 (최상위 규칙 정의)
- `2_ctx/docs/1_고객제안서_제출용.txt` - 고객 제안서 제출용 원본 문서
- `2_ctx/gstack/` - gstack 설치 위치 및 사용법 문서 + `init_gstack.sh` 초기화 스크립트
- `2_ctx/specify_README.md` - Specify 관련 README (로컬 참조용)
- `2_ctx/workflow/` - 업무 워크플로우 문서 모음 (고객요구사항 분석, 화면설계, 제안서 작성, 보안 취약점 검사 등 14개 워크플로우)
- `docs/` - 프로젝트 문서 디렉토리 신설

### 변경
- `.specify/scripts/bash/common.sh` - `main` 브랜치에서도 오류 없이 동작하도록 브랜치 유효성 검사 로직 수정 (2026-03-21 패치)
- `.specify/scripts/bash/create-new-feature.sh` - 기능 브랜치 생성 스크립트 대폭 간소화
- `.specify/templates/plan-template.md` - 플랜 템플릿 업데이트
- `.specify/templates/spec-template.md` - 스펙 템플릿 업데이트
- `.specify/templates/tasks-template.md` - 태스크 템플릿 업데이트
- `.specify/memory/constitution.md` - 헌법 메모리 문서 업데이트
- `2_ctx/ctx.constitution.md` - 컨텍스트 헌법 규칙 업데이트
- `2_ctx/ctx.plan.md` - 프로젝트 플랜 문서 대폭 보강
- `2_ctx/ctx.tasks.md` - 태스크 목록 정리 및 업데이트
- `2_ctx/docs/1_고객제안서_제출용_샘플.txt` - 고객 제안서 샘플 내용 갱신

## [2026-01-07]

### 변경
- README.md를 이전 버전(0_groundzero 프로젝트 설명)으로 복구
- 프론트엔드, 백엔드, 컴포넌트 등 주요 외부 모듈 추가 시 선호하는 내용 반영

### 수정
- 타 프로젝트에서 잘못 푸시된 README.md를 복구하여 원래의 0_groundzero 프로젝트 설명으로 복원
