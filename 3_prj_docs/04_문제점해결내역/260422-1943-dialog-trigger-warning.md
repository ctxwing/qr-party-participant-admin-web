# 문제점 해결 내역: Base UI DialogTrigger 경고 및 팝업 제어 이슈

**작성 일시**: 2026-04-22 19:43
**상태**: **해결 진행 중**

## 1. 발생한 문제점

### 이슈 1: Base UI DialogTrigger nativeButton 경고
- **내용**: `DialogTrigger`가 `render` 프로입을 통해 `<button>`이 아닌 요소(`Card`)를 렌더링할 때, `nativeButton` 속성이 `true`(기본값)로 되어 있어 발생하는 경고.
- **영향**: 웹 접근성 및 폼 동작에 영향을 줄 수 있으며 콘솔에 지속적인 에러 로그 발생.

### 이슈 2: Controlled/Uncontrolled 상태 변경 경고
- **내용**: `isNicknameDialogOpen` 상태를 통해 `Dialog`를 제어할 때, 컴포넌트가 제어 상태와 비제어 상태를 오가며 발생하는 경고.

### 이슈 3: LCP(Largest Contentful Paint) 최적화 경고
- **내용**: `/logo.png` 이미지가 LCP 요소로 감지되었으나 `priority` 속성이 없어 성능 최적화 권고 발생.

## 2. 원인 분석 및 해결 방안

| 문제점 | 예상 원인 | 해결 방안 |
| :--- | :--- | :--- |
| **이슈 1** | Base UI `Trigger`는 기본적으로 요소를 버튼으로 감싸려 함 | `DialogTrigger`에 `nativeButton={false}` 속성 추가 전달 |
| **이슈 2** | `Dialog` 컴포넌트의 `open` 프롭 처리 미흡 | `isNicknameDialogOpen` 초기값 및 프롭 전달 방식 재점검 |
| **이슈 3** | Next.js Image 컴포넌트 최적화 누락 | 로고 이미지에 `priority` 속성 추가 |

## 3. 해결 체크리스트
- [x] `src/components/ui/dialog.tsx` 수정 (nativeButton 프롭 허용 확인)
- [x] `src/app/dashboard/page.tsx` 수정 (모든 DialogTrigger에 nativeButton={false} 적용)
- [x] `src/app/page.tsx` 수정 (로고 이미지 priority 추가)
- [x] 브라우저 콘솔 로그 재확인 (경고 사라짐 확인)

## 4. 해결 내역 요약
1. **Base UI 경고 해결**: `DialogTrigger`가 버튼이 아닌 요소(Card, Button 컴포넌트 등)를 렌더링할 때 발생하는 `nativeButton` 관련 경고를 `nativeButton={false}` 명시를 통해 해결하였습니다.
2. **LCP 최적화**: 랜딩 페이지의 메인 로고에 `priority` 속성을 부여하여 초기 로딩 성능 최적화 및 Next.js 권고 사항을 이행하였습니다.
3. **안정성 확보**: 제어/비제어 상태 전환 관련 경고를 방지하기 위해 다이얼로그 상태 관리 로직을 정교화하였습니다.
