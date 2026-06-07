# css/ — 스타일시트

매트릭스: [DESIGN.md §11](../DESIGN.md) · [.cursorrules](../.cursorrules)

| 영역 | HTML | CSS (로드 순서) |
| --- | --- | --- |
| 공개·게이트 | `index.html`, 루트 redirect, `demo/` | tokens → `styles.css` |
| 게스트 | `guest/*` | tokens → `guest-airbnb.css` |
| 집주인 | `host/*` | tokens → `styles.css` → `portal.css` |
| 회사 공개 | `company/*` (ops·redirect 제외) | tokens → `styles-editorial.css` → `company-unified.css` |
| 회사 운영 | `company/ops/*` | tokens → `styles.css` → `portal.css` → `company-ops.css` (+ `hangro-notify.css`) |

## 파일

| 파일 | 역할 |
| --- | --- |
| `hangro-tokens.css` | **단일 진실** — 색·간격·radius·shadow·키프레임·reduced-motion |
| `styles.css` | 게이트 + 호스트/ops 의 일반 컴포넌트(.btn, .wrap, .page-hero 등) |
| `styles-editorial.css` | 회사 공개 페이지 에디토리얼 톤 |
| `company-unified.css` | 회사 공개 nav 보조 |
| `guest-airbnb.css` | 게스트 포털 (`.ga-*`) |
| `portal.css` | 집주인·ops 공통 포털 레이아웃 (`.portal-*`, `body.portal-host` 변수 override) |
| `company-ops.css` | 운영 어드민 (`.co-*`, `body.co-ops`) |
| `hangro-notify.css` | 토스트·노티 (필요 페이지만) |

## Deprecated (link 하지 말 것)

- `portal-shell.css`, `portal-host.css`, `portal-guest.css`, `portal-company.css`
  - 규칙은 `portal.css` 에 병합. 파일은 호환 보존용.
- `guest-travel.css` — TravelPerk 톤 시험본. 현재 `guest-airbnb.css` 가 사용됨.

## 단일 진실 원칙

- hex 컬러는 `hangro-tokens.css` 안에만. 다른 파일은 `var(--hangro-*)` 또는 별칭(`--co-*`, `--ga-*`, `--bg`, `--accent` …) 사용.
- 모든 CSS 파일 맨 위 `@import url("hangro-tokens.css");` 1줄 (파일당 1번).
- `@keyframes hangro-fade-in`, `:focus-visible`, `prefers-reduced-motion` 은 토큰 파일에서 정의 — 영역 CSS 에서 재정의 금지.
