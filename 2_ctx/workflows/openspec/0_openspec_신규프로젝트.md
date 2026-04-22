# OpenSpec: 최초 기능/스펙을 “처음부터 만들 때(0→1)”를 기준

| 커맨드 | 입력 (형식 \& 예시) | 주요 출력/효과 (최초 스펙 작성 관점) |
| :-- | :-- | :-- |
| `/openspec-proposal <change-id> <설명>` | - `change-id`: 새 기능용 ID. 예: `create-core-spec`, `init-auth-module`  <br>- `설명`: “처음 만드는 기능/제품”에 대한 설명. 예: `Create initial spec for core booking flow`  <br>- 예시 전체: `/openspec-proposal create-core-spec Create initial spec for core booking flow`[^2][^3] | - 아직 스펙이 없는 상태에서도 `openspec/changes/<change-id>/` 생성  <br>- `proposal.md`: 새 기능에 대한 목적, 범위, 요구사항 초안 생성(0→1용 제안서)  <br>- `tasks.md`: 프로젝트 뼈대를 만드는 태스크(프로젝트 구조, 핵심 도메인 모델, 기본 API/화면 등) 체크리스트 생성  <br>- `specs/.../spec.md`: 기존 스펙이 없어도 `## ADDED Requirements` 형태로 최초 스펙 초안(delta) 생성 → 이후 이게 첫 “공식 스펙”의 기반이 됨[^2][^1][^4] |
| `/openspec-apply <change-id>` | - `change-id`: 위에서 생성한 최초 기능 change ID  <br>- 예시: `/openspec-apply create-core-spec`[^1][^5] | - `tasks.md`를 따라 **처음 프로젝트 골격 및 첫 기능 구현**을 수행  <br>- 예: 초기 디렉터리 구조, 도메인 엔티티, 기본 라우트/페이지, 첫 API 엔드포인트/테스트 코드 등을 생성  <br>- 태스크 단위로 “0에서 1까지” 진행 상황을 표시(각 Task가 체크되며, 첫 버전 코드베이스가 완성됨)[^2][^6][^7] |
| `/openspec-archive <change-id>` | - `change-id`: 최초 기능 구현이 끝난 ID  <br>- 예시: `/openspec-archive create-core-spec`[^2][^1] | - 첫 번째 스펙 delta를 `openspec/specs/.../spec.md`에 병합하여 **프로젝트의 초기 “진실의 스펙”**으로 승격  <br>- 0→1 작업에서 사용했던 change 폴더는 archive로 이동하고, 이제부터는 이 초기 스펙을 기준으로 이후 “수정/확장” change들을 추가 생성  <br>- 결과적으로 “최초 기능/아키텍처에 대한 공식 문서 + 구현 코드”가 동시에 정리된 상태로 프로젝트가 초기화됨[^2][^8][^9] |

<span style="display:none">[^10][^11][^12][^13][^14][^15][^16][^17][^18][^19][^20]</span>

<div align="center">⁂</div>

[^1]: https://github.com/Fission-AI/OpenSpec

[^2]: https://dev.to/webdeveloperhyper/how-to-make-ai-follow-your-instructions-more-for-free-openspec-2c85

[^3]: https://hashrocket.com/blog/posts/openspec-vs-spec-kit-choosing-the-right-ai-driven-development-workflow-for-your-team

[^4]: https://blog.csdn.net/yangshangwei/article/details/154361472

[^5]: https://www.youtube.com/watch?v=5oUmpdpbejk

[^6]: https://www.youtube.com/watch?v=cQv3ocbsKHY

[^7]: https://hashrocket.com/blog/posts/from-spec-to-shipping-how-developers-implement-features-with-ai-driven-workflows

[^8]: https://www.linkedin.com/pulse/spec-driven-development-openspec-source-truth-hari-krishnan--obrfc

[^9]: https://www.toolify.ai/ai-news/openspec-streamlining-specdriven-ai-development-simply-3894563

[^10]: https://aisparkup.com/posts/6007

[^11]: https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/

[^12]: https://lilys.ai/notes/ko/vibe-coding-20251113/openspec-new-toolkit-ends-vibe-coding

[^13]: https://github.com/Fission-AI/OpenSpec/issues

[^14]: https://www.reddit.com/r/vibecoding/comments/1p4a6eg/whenever_you_start_a_new_vibecoding_project_from/

[^15]: https://www.nosam.com/spec-driven-development-openspec-vs-spec-kit-vs-bmad-which-ones-actually-worth-your-time/

[^16]: https://claude-plugins.dev/skills/@bacoco/BMad-Skills/openspec-change-closure

[^17]: https://www.facebook.com/groups/techtitansgroup/posts/1504042774256369/

[^18]: https://redreamality.com/blog/-sddbmad-vs-spec-kit-vs-openspec-vs-promptx/

[^19]: https://libraries.io/npm/@minidoracat%2Fopenspec-tw

[^20]: https://tilnote.io/pages/68e69418411a716bc2e361b1

