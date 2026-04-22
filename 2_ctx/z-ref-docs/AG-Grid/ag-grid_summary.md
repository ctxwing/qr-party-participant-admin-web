# 기술 검토: AG Grid 도입 타당성 및 데이터 시각화 전략 (Technical Review)

본 문서는 **photo-refine-ai-orchestrator-saas** 프로젝트의 핵심 데이터 처리 및 시각화 라이브러리로 선정된 **AG Grid**의 도입 타당성, TanStack Table과의 심층 비교, 그리고 프로젝트 전반의 공통 UI 정책을 정의합니다.

---

## 1. 개요 (Context)

AI 이미지 고도화 SaaS는 대량의 이미지 메타데이터, AI 엔진별 분석 점수, 사용자 피드백(RLHF) 등 **고밀도 데이터**를 다룹니다. 이를 효율적으로 관리하기 위해 단순한 테이블을 넘어선 **엔터프라이즈급 그리드 엔진**이 필수적입니다.

---

## 2. 라이브러리 심층 비교 (Deep Dive Comparison)

| 비교 항목 | AG Grid (Community / Enterprise) | TanStack Table v8 (Headless) |
| :--- | :--- | :--- |
| **철학** | **Battery-Included**: 모든 기능이 내장된 완성형 UI | **Headless-First**: 로직만 제공, UI는 0부터 빌드 |
| **개발 생산성** | **Very High**: 설정만으로 복잡한 기능 즉시 구현 | **High (Custom)**: 원하는 디자인 100% 구현 가능 |
| **성능 (Virtualization)** | **Native Support**: 수백만 행 처리 최적화 완료 | **Plugin required**: 별도 라이브러리 연동 필요 |
| **내장 기능** | 정렬, 다중 필터, 열 그룹화, 피벗, 피닝(Pinning) | (직접 훅을 사용하여 모든 로직을 작성해야 함) |
| **러닝 커브** | API 학습 중심 (방대하지만 매뉴얼이 잘 됨) | 프레임워크 설계 중심 (직접 테이블 엔진 구축 수준) |
| **유지보수** | 라이브러리 업데이트만으로 기능 개선 가능 | UI 코드와 로직 코드를 모두 관리해야 함 |
| **추천 사례** | **관리자 대시보드, 핀테크, AI 로깅 시스템** | 마이크로 서비스의 단순 목록, 고도의 커스텀 UI |

---

## 3. AG Grid 선정 및 도입 타당성 (Justification)

### 3.1 생산성 중심의 MVP 개발
- **관리자 기능(Admin)**은 화려함보다 **기능적 완성도와 속도**가 중요합니다. AG Grid는 설정값(ColumnDefs) 정의만으로 데이터 시각화의 90%를 해결합니다.
- **Refine** 프레임워크와의 결합도가 높으며, 복잡한 데이터 관계를 시각적으로 표현하는 데 최적입니다.

### 3.2 고성능 데이터 가입력 및 분석
- **AI Vision 분석 결과**는 수십 개의 기술 지표를 포함합니다. AG Grid의 **Column Pinning**과 **Floating Filter**를 통해 수많은 컬럼 사이에서도 핵심 지표(Score)를 고정하여 볼 수 있습니다.
- **Row Virtualization**을 통해 이미지 썸네일이 수백 개 포함된 리스트에서도 부드러운 스크롤 성능을 보장합니다.

---

## 4. 공통 UI 정책 (Unified UI Policy)

본 프로젝트는 사용자 경험(UX)의 일관성을 위해 다음 라이브러리를 **표준 UI 스택**으로 정의합니다.

### 4.1 Table & Grid: AG Grid 일원화
- **적용 대상**: 일반 사용자 주문 히스토리, 관리자 주문 현황, RLHF 로그 분석.
- **표준화**: 공통 `BaseGrid` 컴포넌트를 개발하여 테마(Dark Mode), 페이징 처리, 로딩 상태를 통일합니다.

### 4.2 Notification: Refine Toast (NotificationProvider)
- **표준 라이브러리**: **Refine Notification Provider** (내부적으로 `react-toastify` 또는 `sonner` 사용).
- **알림 유형**:
    - **Success (Green)**: 이미지 생성 완료, 결제 성공, 데이터 저장 완료.
    - **Error (Red)**: API 서버 통신 실패, AI 모델 타임아웃, 권한 오류.
    - **Info (Blue)**: 시스템 공지, 상태 업데이트 안내.
- **통합 관리**: 모든 서비스 로직 내부의 알림은 `useNotification` 훅을 통해서만 호출합니다.

---

## 5. 결론 (Conclusion)

**AG Grid**는 단순한 테이블 라이브러리가 아닌, 본 프로젝트의 데이터 자산화를 실현할 **"데이터 운영 엔진"**입니다. TanStack Table에 비해 초기 도입 시 설정 비용이 발생할 수 있으나, 장기적인 유지보수와 기능 확장성 측면에서 압도적인 우위를 점합니다.

---
**최종 승인일**: 2026-03-26  
**검토자**: ctxwing@gmail.com
