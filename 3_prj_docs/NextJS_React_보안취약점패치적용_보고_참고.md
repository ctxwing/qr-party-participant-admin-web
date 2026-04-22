# Next.js 및 React 마이그레이션 통합 보고서

**작성일**: 2025년 12월 09일
**프로젝트**: interior-3dviewer (Online 3D Viewer)

---

## 1. 개요
본 문서는 기존 `interior-3dviewer` 프로젝트를 **Next.js 16.0.7** 및 **React 19.2.1** 기반으로 마이그레이션한 내역과 보안 취약점 패치 적용 결과를 기술합니다. 

이번 작업의 주 목적은 최신 보안 패치가 적용된 프레임워크 버전을 도입하고, 기존 HTML/JS 기반 구조를 Next.js App Router 구조로 변경하여 유지보수성과 확장성을 확보하는 것입니다.

## 2. 적용 버전 정보
다음과 같이 보안 취약점(CVE-2025-55182, CVE-2025-66478)이 해결된 최신 버전을 적용하였습니다.

| 패키지명 | 적용 버전 | 비고 |
| --- | --- | --- |
| **next** | `16.11.X` | CVE-2025-55182 패치 포함 |
| **react** | `19.2.1` | CVE-2025-66478 패치 포함 |
| **react-dom** | `19.2.1` | 상동 |
| **@types/react** | `^19.0.0` | React 19 타입 지원 |

## 3. 상세 구현 내역 (Implementation Details)

### 3.1 프로젝트 구조 변경
- **Next.js App Router 도입**: 기존 `website/index.html` 중심의 구조를 `app/page.tsx`와 `app/layout.tsx`로 재구성하였습니다.
- **정적 리소스 이동**: `website/assets` 디렉토리를 Next.js 표준 정적 폴더인 `public/assets`로 이동하여 이미지 및 3D 모델 파일 접근이 가능하도록 설정했습니다.
- **설정 파일 추가**: 
  - `next.config.mjs`: Next.js 빌드 설정
  - `tsconfig.json`: TypeScript 및 Next.js 컴파일 옵션 설정

### 3.2 주요 코드 변경 사항
#### `app/layout.tsx`
- 전역 스타일시트(`source/website/css/*.css`)를 import하여 기존 디자인을 유지했습니다.
- Import 경로 오류를 수정하여 `../source/` 경로를 통해 CSS 파일을 올바르게 참조하도록 조치했습니다.

#### `app/page.tsx`
- **SSR(Server-Side Rendering) 이슈 해결**:
  - 기존 `source/website/website.js` 및 엔진 코드가 브라우저 전역 객체(`window`, `self`)를 참조함에 따라 빌드 타임에 `ReferenceError: self is not defined` 오류가 발생했습니다.
  - 이를 해결하기 위해 `useEffect` 내에서 `import()` 문을 사용하는 **Dynamic Import** 방식을 적용하여, 해당 모듈들이 클라이언트 사이드에서만 로드되도록 변경하였습니다.
- React의 `useRef`와 `useEffect`를 활용하여 DOM이 마운트된 이후에 3D 뷰어 인스턴스(`new Website(...)`)를 초기화하도록 로직을 구성했습니다.

### 3.3 빌드 스크립트 업데이트 (`package.json`)
```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "start:legacy": "npm run build_website_dev && http-server . -p 57080 -a 0.0.0.0 -o /website/"
}
```
- Next.js 기반의 개발(`dev`) 및 빌드(`build`) 스크립트를 추가했습니다.
- 기존의 방식도 `start:legacy` 명령어로 유지하여 하위 호환성을 보장했습니다.

## 4. 검증 결과
- **빌드 테스트**: `npm run build` 명령 수행 결과, 에러 없이 성공적으로 빌드가 완료됨을 확인했습니다.
- **실행 테스트**: 정적 에셋(`public/assets`) 파일들이 정상적으로 포함되었으며, TypeScript 컴파일 및 린트 검사를 통과했습니다.

## 5. 결론
`interior-3dviewer` 프로젝트는 이제 Next.js 16 및 React 19 환경에서 동작하며, 최신 보안 패치가 적용되었습니다. 기존 3D 엔진 코드를 유지하면서도 최신 웹 프레임워크의 이점을 활용할 수 있는 구조로 성공적으로 전환되었습니다.
