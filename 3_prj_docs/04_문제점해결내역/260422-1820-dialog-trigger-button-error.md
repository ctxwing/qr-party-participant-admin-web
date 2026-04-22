# 문제점 해결 내역 (260422-1820)

## 1. 문제 발생 내역
- **발생 시각**: 2026-04-22 18:16
- **문제점 내용**: 
  - `Base UI` 라이브러리의 `DialogTrigger` 컴포넌트에서 "A component that acts as a button expected a native <button> because the nativeButton prop is true" 에러 발생.
  - 대시보드 페이지에서 참여자 카드를 클릭했을 때 다이얼로그가 열리지 않거나 콘솔에 심각한 경고가 기록됨.
- **예상 원인 분석**:
  - `@base-ui/react`의 `Dialog.Trigger`는 기본적으로 `nativeButton` 속성이 `true`이며, 자식으로 `<button>` 태그를 기대함.
  - 현재 코드에서는 `Card`(`div`) 컴포넌트를 `render` 속성으로 전달하고 있어 버튼 시맨틱이 맞지 않아 발생한 문제.

## 2. 해결 목표 (체크리스트)
- [x] `DialogTrigger` 컴포넌트의 `nativeButton` 속성 조정
- [x] 카드 클릭 시 다이얼로그 정상 작동 확인
- [x] 콘솔 경고 제거

## 3. 해결된 내역 업데이트
- **해결 시각**: 2026-04-22 18:21
- **해결 내용**:
  - `src/app/dashboard/page.tsx`의 `DialogTrigger`에 `nativeButton={false}` 속성을 추가하여, 자식 요소가 네이티브 버튼이 아님을 명시함.
  - 이를 통해 `Card` 컴포넌트의 디자인을 유지하면서도 `Base UI`의 접근성 및 시맨틱 검사를 통과하도록 수정함.

## 4. 향후 주의사항
- `Base UI` 컴포넌트(Dialog, Popover 등)의 Trigger로 버튼이 아닌 일반 태그나 커스텀 컴포넌트를 사용할 때는 항상 `nativeButton={false}` 설정을 확인하여 경고를 방지할 것.
