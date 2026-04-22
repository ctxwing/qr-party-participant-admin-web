# OpenSpec의 주요 특징과 장점
- 공식 홈: https://github.com/Fission-AI/OpenSpec
- https://youtu.be/cQv3ocbsKHY

## 자주 쓰는 CLI/슬래시 명령 요약

- CLI  
  - `openspec init` : 프로젝트에 OpenSpec 초기화  
  - `openspec list` : 활성 change 목록  
  - `openspec view` : 스펙/changes 대시보드 보기  
  - `openspec show <change-id>` : 해당 change 상세 보기  
  - `openspec validate <change-id>` : 스펙/델타 구조 검증  
  - `openspec archive <change-id> [--yes]` : change 아카이브 및 스펙 병합[web:2][web:15]

- AI/IDE 슬래시 커맨드 (도구에 따라 prefix 다를 수 있음)  
  - `/openspec-proposal <change-id> <설명>` : 변경 제안(프로포절) + 델타/태스크 생성  
  - `/openspec-apply <change-id>` : 승인된 스펙 기반으로 구현/태스크 수행  
  - `/openspec-archive <change-id>` : 완료된 change 아카이브 및 스펙 갱신[web:9][web:18][web:20]

# 신규 프로젝트 시

# 기존 프로젝트 수정 시 
## AI/IDE 슬래시 커맨드 (도구에 따라 prefix 다를 수 있음)
    - `/openspec-proposal <change-id> <설명>` : 변경 제안(프로포절) + 델타/태스크 생성
    - `/openspec-apply <change-id>` : 승인된 스펙 기반으로 구현/태스크 수행
    - `/openspec-archive <change-id>` : 완료된 change 아카이브 및 스펙 갱신[web:9][web:18][web:20]

## 아래 표는 각 슬래시 커맨드에 대해 **입력 형식(파라미터)**과 **주요 출력/효과**를 정리한 것이다.[^1][^2][^3]

| 커맨드 | 입력 (형식 \& 예시) | 주요 출력/효과 |
| :-- | :-- | :-- |
| `/openspec-proposal <change-id> <설명>` | - `change-id`: 변경 식별자. 예: `add-profile-filters`, `init-auth`  <br>- `설명`: 자연어 설명. 예: `Add profile search filters by role and team`  <br>- 예시 전체: `/openspec-proposal add-profile-filters Add profile search filters by role and team`[^1][^4] | - `openspec/changes/<change-id>/` 폴더 자동 생성  <br>- `proposal.md`: 변경 이유/목적/범위 스켈레톤 생성  <br>- `tasks.md`: 구현용 체크리스트(Task 1.1, 1.2 …) 생성  <br>- `specs/.../spec.md`: 기존 스펙 대비 delta(ADDED/MODIFIED/REMOVED) 초안 생성[^1][^3][^5] |
| `/openspec-apply <change-id>` | - `change-id`: 기존에 proposal로 생성된 변경 ID  <br>- 예시: `/openspec-apply add-profile-filters`[^3] | - 지정된 change의 `tasks.md`를 따라 AI가 코드/테스트를 순차 구현  <br>- 각 태스크 완료 시 체크(예: `Task 1.1 ✓`, `Task 2.1 ✓`)  <br>- 관련 소스 파일 수정 및 신규 파일 생성, 앱에 변경사항 반영[^6][^3] |
| `/openspec-archive <change-id>` | - `change-id`: 구현이 완료된 변경 ID  <br>- 예시: `/openspec-archive add-profile-filters`[^1][^3] | - 내부적으로 `openspec archive <change-id> --yes` 실행 효과[^1][^7]  <br>- `openspec/changes/<change-id>/`의 spec delta를 `openspec/specs/.../spec.md`에 병합하여 “진실의 소스” 갱신  <br>- change는 archive 폴더로 이동, 다음 기능 개발을 위한 상태로 정리됨[^8][^7][^5] |

<span style="display:none">[^10][^11][^12][^13][^14][^15][^16][^17][^18][^19][^20][^9]</span>

<div align="center">⁂</div>

[^1]: https://github.com/Fission-AI/OpenSpec

[^2]: https://aisparkup.com/posts/6007

[^3]: https://aicoding.csdn.net/692cea762087ae0db79dd182.html

[^4]: https://blog.csdn.net/zhangzehai2234/article/details/154710756

[^5]: https://2048ai.net/6913678382fbe0098caaa8e6.html

[^6]: https://www.youtube.com/watch?v=cQv3ocbsKHY

[^7]: https://sven-chr.github.io/myblog/2025/10/14/2025-10-14-openspec-spec-driven-development-guide/

[^8]: https://www.toolify.ai/ai-news/openspec-streamlining-specdriven-ai-development-simply-3894563

[^9]: https://dev.to/webdeveloperhyper/how-to-make-ai-follow-your-instructions-more-for-free-openspec-2c85

[^10]: https://forum.cursor.com/t/openspec-lightweight-portable-spec-driven-framework-for-ai-coding-assistants/134052

[^11]: https://github.com/github/copilot-cli/issues/618

[^12]: https://open-vsx.org/extension/AngDrew/openspec-vscode

[^13]: https://model-spec.openai.com

[^14]: https://www.linkedin.com/pulse/spec-driven-development-openspec-source-truth-hari-krishnan--obrfc

[^15]: https://lilys.ai/notes/ko/vibe-coding-20251113/openspec-new-toolkit-ends-vibe-coding

[^16]: https://github.com/Fission-AI/OpenSpec/blob/main/CHANGELOG.md

[^17]: https://www.reddit.com/r/ClaudeCode/comments/1pba1ud/spec_driven_development_sdd_speckit_openspec_bmad/

[^18]: https://www.youtube.com/watch?v=UtZyvtexJRM

[^19]: https://openspec.dev

[^20]: https://libraries.io/npm/@minidoracat%2Fopenspec-tw



## How It Works
┌────────────────────┐
│ Draft Change       │
│ Proposal           │
└────────┬───────────┘
         │ share intent with your AI
         ▼
┌────────────────────┐
│ Review & Align     │
│ (edit specs/tasks) │◀──── feedback loop ──────┐
└────────┬───────────┘                          │
         │ approved plan                        │
         ▼                                      │
┌────────────────────┐                          │
│ Implement Tasks    │──────────────────────────┘
│ (AI writes code)   │
└────────┬───────────┘
         │ ship the change
         ▼
┌────────────────────┐
│ Archive & Update   │
│ Specs (source)     │
└────────────────────┘

1. Draft a change proposal that captures the spec updates you want.
2. Review the proposal with your AI assistant until everyone agrees.
3. Implement tasks that reference the agreed specs.
4. Archive the change to merge the approved updates back into the source-of-truth specs.
Getting Started

## 한글 소개 블로그 
#### 1. - AI 코딩의 불확실성을 줄이는 새로운 접근, OpenSpec
- 출처: https://digitalbourgeois.tistory.com/2155 [평범한 직장인이 사는 세상:티스토리]

3. OpenSpec의 주요 특징과 장점
OpenSpec의 강점은 “명세의 투명성”과 “변경의 추적 가능성”입니다.
1) 명세와 변경의 분리 관리
OpenSpec은 명세(specs/)와 변경사항(changes/)을 명확히 분리해 관리합니다.

specs/ 폴더는 현재 승인된 ‘진짜 명세’를 저장하고,
changes/ 폴더는 제안 중이거나 검토 중인 변경 사항을 기록합니다.

이 구조 덕분에 누가 어떤 변경을 제안했는지, 어떤 논의가 있었는지 모두 추적할 수 있습니다.
2) 변경 관리의 구조화
OpenSpec은 변경 과정을 세 가지로 구분합니다.

Proposals: 새로운 기능 제안이나 변경 요청
Tasks: 실제 개발 작업
Spec Updates (Deltas): 명세의 구체적인 수정 내역

이 덕분에 모든 변경 사항이 하나의 흐름으로 정리되고, 작업 이력이 투명하게 남습니다.
3) 팀 협업 및 검토 효율성 향상
OpenSpec은 단순히 개인이 쓰는 도구가 아닙니다.팀 단위로 명세를 검토하고 합의하는 구조를 제공해, AI와 팀원이 같은 문서를 기준으로 일할 수 있게 합니다.결과적으로 AI 코딩의 불확실성을 줄이고, 개발자 간의 커뮤니케이션 비용을 최소화할 수 있습니다.

4. OpenSpec의 작동 방식
OpenSpec은 다음 네 단계의 명확한 흐름을 가집니다.

Draft Change Proposal (초안 작성)새로운 기능이나 변경 사항에 대한 제안을 작성합니다.이때, 명세가 어떻게 바뀔지를 초안 형태로 작성합니다.
Review & Align (리뷰 및 합의)팀과 AI가 함께 제안을 검토하고 피드백을 주고받습니다.이 과정을 통해 명세가 구체화되고, 모두가 같은 이해를 갖게 됩니다.
Implement Tasks (구현 단계)AI 어시스턴트가 승인된 명세를 기반으로 코드를 작성합니다.이 단계에서 불필요한 반복 지시나 프롬프트 수정이 줄어듭니다.
Archive & Update Specs (승인 및 업데이트)구현이 완료되면, 변경사항을 승인하여 공식 명세(specs/)에 반영합니다.이로써 프로젝트의 ‘진짜 상태’가 명확히 유지됩니다.

이 과정은 단순하면서도 강력한 구조를 제공합니다.AI와 사람이 같은 “언어”로 일하게 만드는 일종의 협업 프레임워크인 셈입니다.
출처: https://digitalbourgeois.tistory.com/2155 [평범한 직장인이 사는 세상:티스토리]

#### 2. 2025년형 오픈스펙 사용기: 3가지 slash 명령으로 AI 개발 자동화 실전 후기
- https://tilnote.io/pages/68e69418411a716bc2e361b1
스펙드리븐 개발 접근과 OpenSpec의 주요 절차
스펙드리븐 개발 방식에서는 모호한 요구사항을 구체적인 문서와 AI 에이전트가 따라갈 수 있는 작업 단위로 세분화하여, 프로젝트 완성도와 오류 발생률을 크게 낮추는 데에 기여합니다. 실제로 OpenSpec에서는 이 과정을 단 3단계로 압축해 운영합니다.

- Draft Proposal(제안서 초안 작성)
- Task Review(작업 확인)
- Task Implementation(작업 구현)

# OpenSpec을 “명령어 치트키 + 전체 진행 플로우” 관점에서 정리한 .md
# OpenSpec 워크플로우 & 명령어 치트시트

AI 코딩 어시스턴트와 함께 **스펙 주도 개발(spec-driven)**을 할 때, OpenSpec을 프로젝트 전체 라이프사이클 기준으로 정리한 치트시트이다.[web:2][web:12]

---

## 공통: 기본 설치 & 초기화

- 전역 설치  
  - `npm install -g @fission-ai/openspec@latest`  
  - `openspec --version` 으로 확인[web:2]

- 프로젝트 초기화 (신규/기존 공통)  
  - `cd <my-project>`  
  - `openspec init`  
    - `openspec/` 디렉터리 구조 생성  
    - `openspec/project.md`, `openspec/AGENTS.md` 생성  
    - 선택한 IDE/AI 도구에 `/openspec-...` 슬래시 커맨드 세팅[web:2][web:9]

- 선택: 프로젝트 컨텍스트 채우기  
  - AI에게: `"openspec/project.md를 읽고 우리 프로젝트 기술 스택/컨벤션을 채워줘"` 요청[web:2]

---

## 1) 새 프로젝트 시작 시

### 1. 프로젝트 생성

- 일반적인 방식으로 코드베이스 생성 (Next.js, FastAPI 등 자유)[web:2]
- 위의 `openspec init` 수행 후, Git에 `openspec/` 포함해서 커밋

---

### 2. 초기 스펙 결정 (첫 기능 정의)

1. **변경 제안(프로포절) 생성**  
   - AI 도구에서:  
     - `/openspec-proposal <change-id> <설명>`  
       - 예: `/openspec-proposal init-auth 기본 로그인/회원가입 기능 추가`  
   - 또는 자연어:  
     - “OpenSpec 변경 제안으로 `<설명>`에 대한 proposal을 만들어줘”  
   - 결과: `openspec/changes/<change-id>/` 아래  
     - `proposal.md`, `tasks.md`, `specs/.../spec.md` delta 생성[web:2][web:9][web:12]

2. **CLI로 생성 상태 확인**  
   - `openspec list` : 활성 change 목록 확인[web:2]  
   - `openspec show <change-id>` : proposal/tasks/spec delta 전체 조회[web:2]  
   - `openspec validate <change-id>` : 스펙/델타 구조 검증[web:2][web:12]

---

### 3. 변경 스펙 결정 (합의 완료까지 반복)

- AI와 함께 다음을 반복  
  - “이 요구사항/시나리오를 스펙에 추가/수정해줘”  
  - `/openspec-proposal` 로 다시 델타 갱신  
- 체크포인트  
  - `openspec show <change-id>` 로 요구사항/시나리오/수용 기준(acceptance criteria) 재확인[web:2][web:12]  
  - 필요하면 `openspec validate <change-id>` 재실행

---

### 4. 작업 수행 (구현 단계)

1. **구현 시작**  
   - AI 도구에서:  
     - `/openspec-apply <change-id>`  
       - 예: `/openspec-apply init-auth`  
     - AI가 `tasks.md`를 기준으로 코드/테스트를 순차 구현[web:9][web:12]  
   - 또는 수동 구현:  
     - `tasks.md`의 체크리스트를 사람이 직접 구현하고 체크

2. **진행 모니터링**  
   - `openspec list` : 진행 중 change 및 상태 확인  
   - `openspec view` : 대시보드 뷰(지원되는 환경에서 상호작용 UI)[web:2][web:15]

---

### 5. 리뷰 / 수정

- 코드 리뷰, QA 후 수정 필요 시  
  - 동일 `<change-id>`에서  
    - `proposal.md` / `specs/.../spec.md` / `tasks.md`를 AI에게 수정 요청  
    - 또는 수동 편집 후 `openspec validate <change-id>` 재실행[web:2][web:12]
- 수정 완료 후 다시 `/openspec-apply <change-id>` 로 나머지 작업/코드 반영 가능[web:9]

---

### 6. 아카이브 (스펙에 병합 & 종료)

1. **완료 여부 확인**  
   - `openspec show <change-id>` : 모든 task 완료 상태 및 spec delta 확인[web:2]

2. **아카이브 실행**  
   - CLI:  
     - `openspec archive <change-id> --yes`  
   - 또는 AI 도구에서:  
     - `/openspec-archive <change-id>`[web:6][web:9][web:20]

3. **결과**  
   - `openspec/changes/<change-id>/` 의 delta 내용이  
     `openspec/specs/.../spec.md` “진실의 소스(source of truth)”에 병합[web:10][web:20]  
   - 변경 이력은 archive로 이동, 새 기능 또는 변경 시에는 항상 **새로운 `<change-id>`** 생성[web:6][web:10]

---

## 2) 기존 소스가 있는 경우에서 시작

기존 레거시/운영 중 서비스에 OpenSpec을 도입할 때의 권장 흐름이다.[web:2][web:12]

### 1. OpenSpec만 붙이고 끝-to-end 최소 세팅

- 기존 repo에 바로 적용  
  - `cd <existing-repo>`  
  - `npm install -g @fission-ai/openspec@latest`  
  - `openspec init`[web:2]  
- AI에게 `openspec/project.md` 작성 보조 요청  
  - “기존 코드베이스를 참고해서 프로젝트 전반 스펙/아키텍처/컨벤션을 요약해서 `openspec/project.md`에 채워줘”

> 기존 기능 전체를 한 번에 스펙화하려 하지 말고, **“다음에 손댈 기능부터”** OpenSpec으로 관리하는 것이 권장된다.[web:2][web:12]

---

### 2. “첫 변경”을 기준으로 스펙 캡처

가장 먼저 수정할/추가할 기능을 하나 정한 뒤, 그 기능을 기준으로 스펙을 쌓아 나간다.[web:2][web:12]

1. **현재 동작을 스펙으로 역설계 (옵션)**  
   - AI에게  
     - “기존 코드 기준으로 `<기능>`의 현재 동작을 요약해서 OpenSpec 스펙 초안을 만들어줘”  
   - 필요 시 수동으로 `openspec/specs/.../spec.md`에 추가

2. **변경 제안 생성**  
   - `/openspec-proposal <change-id> <설명>`  
     - 예: `/openspec-proposal refactor-billing 결제 로직 모듈화 및 오류 처리 개선`  
   - `openspec list`, `openspec show <change-id>`, `openspec validate <change-id>`로 구조 점검[web:2][web:9]

---

### 3. 변경 스펙 정제 → 구현 → 리뷰 → 아카이브

기본 흐름은 새 프로젝트와 동일하지만, “기존 동작”을 깨지 않는지와 “레거시 제약사항”을 스펙에 명시적으로 넣는 것이 포인트이다.[web:2][web:12]

- **스펙 정제**  
  - 변경 전/후 요구사항을 명시:  
    - `## MODIFIED Requirements`  
    - `## REMOVED Requirements` 섹션 활용[web:2]
- **구현/검증**  
  - `/openspec-apply <change-id>` 또는 수동 구현 + 테스트[web:9]
- **리뷰/수정**  
  - 기존 영향 범위를 QA/리뷰로 확인, 필요시 델타 수정 후 다시 validate[web:12]
- **아카이브**  
  - 완료 시 `openspec archive <change-id> --yes` 또는 `/openspec-archive <change-id>` 실행하여  
    스펙에 변경사항 병합, 레거시 기능도 점진적으로 “살아있는 스펙”으로 전환[web:6][web:10][web:20]

---

## 자주 쓰는 CLI/슬래시 명령 요약

- CLI  
  - `openspec init` : 프로젝트에 OpenSpec 초기화  
  - `openspec list` : 활성 change 목록  
  - `openspec view` : 스펙/changes 대시보드 보기  
  - `openspec show <change-id>` : 해당 change 상세 보기  
  - `openspec validate <change-id>` : 스펙/델타 구조 검증  
  - `openspec archive <change-id> [--yes]` : change 아카이브 및 스펙 병합[web:2][web:15]

- AI/IDE 슬래시 커맨드 (도구에 따라 prefix 다를 수 있음)  
  - `/openspec-proposal <change-id> <설명>` : 변경 제안(프로포절) + 델타/태스크 생성  
  - `/openspec-apply <change-id>` : 승인된 스펙 기반으로 구현/태스크 수행  
  - `/openspec-archive <change-id>` : 완료된 change 아카이브 및 스펙 갱신[web:9][web:18][web:20]
