---
status: 해결완료
date: 2026-04-26
tags: [font, tailwindcss, safari, next-font]
---

# Safari에서 Outfit 폰트 미적용 - CSS 변수명 불일치

## 문제 발생 시각
- 2026-04-26 13:57 (KST)

## 문제 증상
- Mac Safari에서 `http://localhost:59500/dashboard` 접속 시 폰트가 다르게 보임
- Chrome 등 다른 브라우저와 폰트 렌더링 차이 발생

## 원인 분석

| 항목 | 내용 |
|------|------|
| 근본 원인 | `next/font/google`에서 Outfit 폰트를 `--font-outfit` 변수로 로드했으나, Tailwind `font-sans`는 `--font-sans`를 참조 |
| 결과 | `font-sans` 클래스가 Outfit이 아닌 브라우저 기본 sans-serif 폰트를 사용 |
| Safari 특이사항 | Safari의 기본 sans-serif는 Helvetica Neue → Chrome(Apple SD 산돌고딕 Neo)과 시각적 차이 큼 |

### 문제 코드 (`layout.tsx`)
```ts
// 수정 전 - 변수명 불일치
const outfit = Outfit({ variable: "--font-outfit" });
// font-sans는 --font-sans를 참조 → Outfit 적용 안됨
```

## 해결 체크리스트

- [x] 1. Outfit 폰트 CSS 변수명을 `--font-outfit` → `--font-sans`으로 변경
- [x] 2. Safari에서 폰트 렌더링 확인

## 해결 내역

| 파일 | 변경 내용 |
|------|-----------|
| `src/app/layout.tsx` | `variable: "--font-outfit"` → `variable: "--font-sans"` |

## 참고 사항
- `next/font/google` 폰트를 Tailwind `font-sans`에 적용하려면 변수명이 반드시 `--font-sans`여야 함
- Tailwind v4에서 `font-sans`는 `@theme inline { --font-sans: var(--font-sans); }`로 정의됨
- 향후 새 폰트 추가 시 Tailwind CSS 변수 매핑 확인 필수
