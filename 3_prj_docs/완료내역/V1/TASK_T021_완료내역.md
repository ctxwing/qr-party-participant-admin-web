# TASK_T021_완료내역: 배포를 위한 Docker 및 빌드 최적화 설정

**태스크 ID**: T021
**작업 일시**: 2026-04-22
**작성자**: ctxwing@gmail.com

## 1. 작업 내용
- **Next.js Standalone 빌드 활성화**:
    - `next.config.ts`에 `output: 'standalone'` 옵션을 추가하여 운영 환경에 최적화된 최소 파일 셋을 생성하도록 설정
- **멀티 스테이지 Dockerfile 작성**:
    - `oven/bun` 이미지를 활용한 고속 빌드 단계와 `node:slim` 이미지를 활용한 경량 실행 단계로 분리
    - 보안을 위해 `nextjs` 비특권 사용자(Non-privileged user) 계정으로 실행되도록 구성
- **.dockerignore 최적화**:
    - 빌드 컨텍스트에서 `node_modules`, `.next`, `.git` 등 대용량 폴더를 제외하여 이미지 빌드 성능 개선 및 보안성 확보

## 2. 테스트 결과
- `bun run build` 실행 시 `standalone` 폴더 정상 생성 확인
- Dockerfile 구문 및 스테이지 구성의 논리적 정합성 검토 완료

## 3. 관련 파일
- [prj_source/frontend/next.config.ts](file:///home/ctxwing/docker-ctx/lancer/qr-party-participant-admin-web/prj_source/frontend/next.config.ts)
- [prj_source/frontend/Dockerfile](file:///home/ctxwing/docker-ctx/lancer/qr-party-participant-admin-web/prj_source/frontend/Dockerfile)
- [prj_source/frontend/.dockerignore](file:///home/ctxwing/docker-ctx/lancer/qr-party-participant-admin-web/prj_source/frontend/.dockerignore)

## 4. 특이사항
- 실제 Docker 이미지 빌드 시 환경 변수(`.env`)는 보안을 위해 런타임에 주입하거나 Docker Compose 등을 통해 관리하는 것을 권장합니다.
