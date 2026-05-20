# 행로 (Hangro) — 디자인 시스템

> 모든 디자인 결정의 단일 진실 (Single Source of Truth).
> 새 컴포넌트·페이지를 만들거나 기존을 수정할 때 반드시 이 문서 + `css/hangro-tokens.css` 를 따른다.

---

## 1. 브랜드 톤

### 정체성
- **이름**: 행로 (Hangro · 行路)
- **사업**: 빈집·유휴 시설을 지역 관광 숙소·콘텐츠로 재생
- **사용자**: 머무는 분(게스트) · 공간을 제공하는 분(집주인) · 운영팀(회사)

### 디자인 톤
- **에디토리얼** (Aesop · Norm Architects · Kinfolk · Cereal magazine 풍)
- 차분한 베이지 + 깊은 잉크 그린 + 명조체 디스플레이
- 그라데이션·과한 그림자·네온 컬러 **금지**
- 헤어라인 1px 남발 **금지** — 카드 boundary 는 페이퍼 배경으로 구분
- 한국어를 위한 어절 단위 줄바꿈 (`word-break: keep-all`)

### 영역별 톤 차이
| 영역 | 톤 |
| --- | --- |
| 공개 사이트 (/index, /archive, /map-demo, /place-detail, /booking, /team) | 에디토리얼 정통 |
| 게스트 포털 (/guest/) | 에디토리얼 + 약간 dense (포털 컴포넌트) |
| 집주인 포털 (/host/) | 에디토리얼 + 운영자 친화 |
| 회사 공개 (/company/index, etc.) | 본 사이트와 동일 |
| 회사 운영 (/company/ops/) | 에디토리얼 + admin dense + 다크 헤더 |

---

## 2. 색 팔레트

### 코어 (hangro-tokens.css)

| 토큰 | Hex | 용도 |
| --- | --- | --- |
| `--hangro-green` | `#3D6E2C` | 짙은 녹색 — 액센트 (자연·체크 마크) |
| `--hangro-green-soft` | `#B7C9A4` | 연두 — 보조 (배경 점·status badge) |
| `--hangro-amber` | `#C8742B` | 호박색 — pending/draft 상태 |
| `--hangro-bg` | `#EFE9DC` | 따뜻한 베이지 — 페이지 배경 |
| `--hangro-paper` | `#F6F1E5` | 페이퍼 — 카드·패널 배경 |
| `--hangro-paper-warm` | `#FAF6EC` | 더 밝은 페이퍼 — hover 상태 |
| `--hangro-ink` | `#1A2419` | 깊은 숲색 — 본문·헤딩·primary 버튼 |
| `--hangro-ink-soft` | `#4A4F44` | 본문 보조 텍스트 |
| `--hangro-muted` | `#87897D` | 메타데이터·라벨·placeholder |
| `--hangro-rule` | `rgba(26, 36, 25, 0.10)` | 헤어라인 (얇은) |
| `--hangro-rule-strong` | `rgba(26, 36, 25, 0.18)` | 헤어라인 (진한, input border) |

### 시맨틱 색 (상태 표시)
| 의미 | 색 | 사용 예 |
| --- | --- | --- |
| Success / Live / Active | `var(--hangro-green)` 텍스트 + `var(--hangro-green-soft)` 배경 | "운영 중", "완료" |
| Warning / Pending / Draft | `var(--hangro-amber)` 텍스트 + `rgba(200,116,43,0.18)` 배경 | "진행 중", "검토 중" |
| Danger / Error | `#9C4D3D` | 폼 에러, 삭제 액션 |

### 금지
- 무지개·네온 색
- 그라데이션 (`linear-gradient`, `radial-gradient`, `conic-gradient`) — 명시 요청 없으면 X
- hex 코드 컴포넌트 CSS 직접 사용 — 항상 `var(--hangro-*)` 변수로

---

## 3. 타이포

### 폰트 패밀리
| 용도 | 패밀리 | 비고 |
| --- | --- | --- |
| 디스플레이·헤딩 | `"Nanum Myeongjo", "Times New Roman", serif` | h1-h4, 큰 숫자, 가격 |
| 본문·UI | `"Noto Sans KR", "Helvetica Neue", system-ui, sans-serif` | p, li, button, input |
| 트래킹 캡스 라벨 | `"Helvetica Neue", system-ui, sans-serif` | eyebrow, badge, table th, meta |

### 헤딩 스펙
| 레벨 | 사이즈 | weight | line-height | letter-spacing | 비고 |
| --- | --- | --- | --- | --- | --- |
| h1 (히어로) | `clamp(2.2rem, 5.6vw, 3.85rem)` | 700 | 1.22 | -0.035em | Nanum Myeongjo |
| h1 (서브) | `clamp(1.95rem, 4vw, 2.85rem)` | 700 | 1.25 | -0.03em | page-hero 안 |
| h2 (섹션) | `clamp(1.85rem, 3.6vw, 2.55rem)` | 700 | 1.25 | -0.03em |  |
| h2 (서브섹션) | `clamp(1.4rem, 2.6vw, 1.75rem)` | 700 | 1.25 | -0.025em |  |
| h3 (카드) | `1.05rem ~ 1.2rem` | 700 | 1.35 | -0.02em |  |
| h4 (작은) | `0.92rem` | 600~700 | 1.4 | -0.01em |  |

### 본문
- 기본: `font-size: 15px; line-height: 1.7; letter-spacing: -0.005em;`
- 큰 본문(히어로 리드): `clamp(1rem, 1.4vw, 1.18rem); line-height: 1.75~1.8;`
- 작은 본문(카드 desc): `0.86rem~0.94rem; line-height: 1.55~1.7;`

### 트래킹 캡스 라벨 (.eyebrow, .badge, .kicker, .meta, .pillar-icon, .step-num)
```css
font-family: "Helvetica Neue", system-ui, sans-serif;
font-size: 0.72rem;
font-weight: 600;
letter-spacing: 0.16em;
text-transform: uppercase;
color: var(--hangro-muted);
```
- letter-spacing 변형: 0.12em (좁게) / 0.18em (넓게)

### 한국어 줄바꿈 (필수)
```css
word-break: keep-all;
overflow-wrap: break-word;
```
- body 와 h1-h4 에 항상 적용
- 영문 긴 단어는 안전하게 줄바꿈, 한국어 어절은 안 끊김

---

## 4. 여백 (Spacing)

### 일반 스케일
- xs: `0.25rem` (4px)
- sm: `0.5rem` (8px)
- md: `1rem` (16px)
- lg: `1.5rem` (24px)
- xl: `2rem` (32px)
- 2xl: `3rem` (48px)

### 반응형 여백 (clamp 사용 권장)
| 용도 | 값 |
| --- | --- |
| 섹션 padding (세로) | `clamp(4rem, 9vw, 7rem)` |
| Hero padding (위) | `clamp(3rem, 6vw, 4.75rem)` |
| Hero padding (아래) | `clamp(2.25rem, 4.5vw, 3.25rem)` |
| 카드 padding | `1.15rem ~ 1.5rem` |
| 카드 사이 gap | `1rem ~ 1.5rem` |
| 컬럼 사이 gap | `clamp(1.5rem, 3vw, 2.5rem)` |
| Section head 아래 | `clamp(2.5rem, 6vw, 4rem)` |
| Footer 위 margin | `clamp(3rem, 6vw, 5rem)` |

### 컨테이너 폭
- 본 사이트 max-width: `var(--hangro-max)` = `1240px`
- 본문 컬럼 (단단한 가독): `max-width: 56rem` 또는 28~52ch
- 헤딩: `max-width: 22~28ch`
- 본문 단락: `max-width: 42~52ch`

### Gutter (좌우 안전 영역)
```css
padding: 0 var(--gutter);
/* --gutter: clamp(1.25rem, 3vw, 2rem); */
```

---

## 5. Radius (모서리)

| 토큰 | 값 | 용도 |
| --- | --- | --- |
| `--hangro-radius` | `10px` | 입력 필드, 작은 박스 |
| `--hangro-radius-lg` | `16px` | 카드, 패널, 다이얼로그 |
| `--hangro-radius-pill` | `999px` | 알약 버튼, 태그 칩, 네비 링크 |

### 사용 규칙
- 카드: `var(--hangro-radius-lg)` (16px)
- 작은 버튼·input: `var(--hangro-radius)` (10px)
- 알약 버튼·status badge·네비 hover: `var(--hangro-radius-pill)`
- single-side border (border-left만 등) + border-radius **같이 쓰지 말 것**

---

## 6. Shadow (그림자)

| 토큰 | 값 | 용도 |
| --- | --- | --- |
| `--hangro-shadow-sm` | `0 2px 6px rgba(26,36,25,0.05)` | 카드 hover |
| `--hangro-shadow` | `0 6px 18px rgba(26,36,25,0.08)` | 강조 카드, 패널 |

### 규칙
- blur 20px 초과 X
- 색이 들어간 그림자(블루·로즈) X — 항상 잉크 톤
- drop-shadow 보다 box-shadow 우선
- 카드 hover 시 `translateY(-2~4px) + shadow-sm` 조합으로 살짝 떠오름

---

## 7. 컴포넌트

### 7.1 버튼 (`.btn`)

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  padding: 0.85rem 1.6rem;
  border-radius: var(--hangro-radius-pill);
  font-weight: 600;
  font-size: 0.92rem;
  letter-spacing: 0.02em;
  border: 1px solid var(--hangro-ink);
  background: var(--hangro-ink);     /* primary 기본 */
  color: var(--hangro-bg);
  cursor: pointer;
  transition: background 0.22s cubic-bezier(0.2, 0.7, 0.2, 1),
              color 0.22s cubic-bezier(0.2, 0.7, 0.2, 1);
}

.btn:hover:not(:disabled) {
  background: transparent;
  color: var(--hangro-ink);
}

.btn:active:not(:disabled) {
  transform: translateY(1px);
}

.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
```

### 변형
- `.btn-ghost`: `background: transparent; color: var(--hangro-ink); border: 1px solid var(--hangro-ink);` → hover 시 잉크 채움
- `.btn-link`: 텍스트 + 하단 1px border + 화살표 `→` (호버 시 화살표 슬라이드)
- 게스트 포털: `.ga-btn--primary`, `.ga-btn--ghost`, `.ga-btn--block`
- 운영 포털: `.btn-sm` (작은 사이즈)

### 7.2 카드 (.pillar, .step, .case, .team-card, .ga-card, .co-kpi)

공통 규칙:
```css
background: var(--hangro-paper);
border-radius: var(--hangro-radius-lg);
padding: 1.15rem ~ 1.5rem;
/* border 사용 X — 배경색으로 boundary */

/* hover */
transition: transform 0.25s cubic-bezier(0.2, 0.7, 0.2, 1),
            box-shadow 0.25s cubic-bezier(0.2, 0.7, 0.2, 1);
&:hover {
  transform: translateY(-3px);
  box-shadow: var(--hangro-shadow-sm);
}
```

### 7.3 status badge / pill

```css
.status-pill {
  display: inline-block;
  font-family: "Helvetica Neue", system-ui, sans-serif;
  font-size: 0.66~0.72rem;
  font-weight: 600;
  letter-spacing: 0.14~0.16em;
  text-transform: uppercase;
  padding: 0.25rem 0.65rem;
  border-radius: var(--hangro-radius-pill);
}

/* 변형 */
.status-pill--live    { background: var(--hangro-green-soft); color: var(--hangro-green); }
.status-pill--draft   { background: rgba(200,116,43,0.18); color: var(--hangro-amber); }
.status-pill--error   { background: rgba(156,77,61,0.15); color: #9C4D3D; }
```

### 7.4 입력 필드

```css
input, select, textarea {
  padding: 0.7~0.78rem 0.85rem;
  border: 1px solid var(--hangro-rule-strong);
  border-radius: var(--hangro-radius);
  background: var(--hangro-bg);
  color: var(--hangro-ink);
  font-family: "Noto Sans KR", system-ui, sans-serif;
  font-size: 0.96rem;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

input:hover { border-color: var(--hangro-muted); }
input:focus {
  outline: none;
  border-color: var(--hangro-ink);
  /* 옵션: box-shadow: 0 0 0 2px var(--hangro-ink); */
}
```

### 7.5 테이블 (운영 영역)

```css
.portal-table-wrap {
  background: var(--hangro-paper);
  border-radius: var(--hangro-radius-lg);
  overflow: hidden;
}

.portal-table thead th {
  font-family: "Helvetica Neue", system-ui, sans-serif;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--hangro-muted);
  text-align: left;
  padding: 0.95rem 1.15rem;
  background: var(--hangro-paper-warm);
  border-bottom: 1px solid var(--hangro-rule);
}

.portal-table tbody td {
  padding: 0.95rem 1.15rem;
  border-bottom: 1px solid var(--hangro-rule);
}

.portal-table tbody tr:hover {
  background: var(--hangro-paper-warm);
}
```

### 7.6 네비게이션

#### 메인 nav (공개)
- 알약형 호버 (`border-radius: var(--hangro-radius-pill)`)
- `aria-current="page"` 시 잉크 underline 1px

#### 운영 서브 nav (탭)
- 알약형, `aria-current="page"` 시 잉크 채움
- 로그아웃 링크는 `margin-left: auto` 로 우측 끝

### 7.7 섹션 마커 (홈)

```html
<div class="section-marker">
  <span class="num">01</span>
  <span>What we do</span>
  <span class="rule"></span>
</div>
```
- 숫자: 명조체 italic 1.05rem
- 라벨: 트래킹 캡스 0.72rem
- rule: 1px 잉크 (opacity 0.4), max-width 4rem 짧은 헤어라인

### 7.8 섹션 헤딩 (.section-head)

- 단일 컬럼 스택 (h2 + p)
- max-width 56rem
- h2: 명조체 디스플레이
- p: 본문 + max-width 52ch

---

## 8. 레이아웃 패턴

### 8.1 페이지 골격

```
header (sticky, bg)
└─ .wrap.nav (logo + nav-links + nav-cta)

main
├─ .page-hero (서브 페이지) 또는 .hero (홈)
└─ section * N

footer (footer-rich 또는 minimal)
```

### 8.2 Hero (공개 홈)

- masthead: `Studio · 행로 / Vol. 01 · 첫 번째 유후공간 / Spring 2026` 3분할
- inner: 좌측(H1 + lead + actions) / 우측(meta-stack 3행)
- index-line: 정적 키워드 라인 (마키 X — 정적)

### 8.3 카드 그리드

| 컴포넌트 | grid-template-columns |
| --- | --- |
| Pillars 3카드 | `repeat(3, minmax(0, 1fr))` 또는 bento (1.5fr 1fr 1fr + 첫 카드 강조) |
| Flow 4단계 | `repeat(4, minmax(0, 1fr))` |
| Cases | `repeat(2, 1fr)` |
| Team 4명 | `repeat(2~4, minmax(0, 1fr))` 반응형 |
| Stories 3개 | `repeat(auto-fit, minmax(260px, 1fr))` |

- gap: `1rem ~ 1.5rem`
- 모바일에서 1컬럼으로 자동 스택

### 8.4 컨택 배너 (.banner)

- 다크 잉크 풀패널 + 베이지 텍스트 (반전 톤)
- 2컬럼: h2 / banner-side (p + cta)
- 그라데이션 X, 단색 잉크 배경

---

## 9. 모션 / 트랜지션

### easing
```css
/* 표준 */
cubic-bezier(0.2, 0.7, 0.2, 1)

/* duration */
- 호버: 0.18~0.22s
- 페이지 fade-in: 0.32s
- 카드 transform: 0.25s
```

### 페이지 진입 fade-in
```css
@keyframes hangro-fade-in {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

body {
  animation: hangro-fade-in 0.32s cubic-bezier(0.2, 0.7, 0.2, 1);
}
```

### 모션 감소 모드 (필수)
```css
@media (prefers-reduced-motion: reduce) {
  * { transition: none !important; animation: none !important; }
}
```

### 인터랙션 상태
- **카드 hover**: `translateY(-2~4px) + shadow-sm`
- **카드 active**: `translateY(-1px) → 0`
- **버튼 hover**: 배경·색 반전 (cubic-bezier)
- **버튼 active**: `translateY(1px)`
- **링크 hover**: `opacity: 0.65` (텍스트 링크) 또는 underline (강조 링크)

---

## 10. 접근성

### 포커스 링
```css
:focus-visible {
  outline: 2px solid var(--hangro-ink);
  outline-offset: 3px;
  border-radius: 4px;
}
```

### 색 대비
- 본문 텍스트(`--hangro-ink-soft`)와 배경(`--hangro-bg`): WCAG AA 통과
- 무트 텍스트(`--hangro-muted`)는 라벨·메타에만 사용 (본문 X)

### 의미적 마크업
- 헤딩 위계 h1 → h2 → h3 순서 유지 (스킵 X)
- 네비에 `aria-label="주요 메뉴"` 또는 `aria-label="경로"`
- 현재 페이지에 `aria-current="page"`
- 버튼 vs 링크: 페이지 이동은 `<a>`, 액션은 `<button>`
- 폼 label 은 항상 `<label for="id">` 명시
- 이미지에 의미가 있으면 `alt` 작성, 장식이면 `alt=""` + `aria-hidden`

### 한국어 줄바꿈
- `word-break: keep-all` body + 헤딩에 필수
- 어색한 곳에 `<br />` 강제 줄바꿈 OR 띄어쓰기 `&nbsp;` 사용

---

## 11. 디렉터리·CSS 책임 분리

```
css/
├── hangro-tokens.css       # ★ 모든 변수의 진실. 다른 CSS는 @import 로 상속
├── styles.css              # 공개 사이트 (index/archive/team/booking/map/place-detail)
├── styles-editorial.css    # 백업 (비활성)
├── portal.css              # 포털 공통 골격 (guest/host/company)
├── portal-shell.css        # 포털 셸 (헤더 등, 옛 파일 남음)
├── portal-guest.css        # (옛, deprecated)
├── portal-host.css         # (옛, deprecated)
├── portal-company.css      # (옛, deprecated)
├── guest-airbnb.css        # 게스트 포털 풀 디자인 (에디토리얼 톤으로 재작성됨)
├── company-unified.css     # 회사 공개 페이지 (본 사이트와 동일 톤)
└── company-ops.css         # 회사 운영 (인증 후 admin)
```

### 영역별 CSS 매트릭스

| 영역 | 페이지 | 사용 CSS |
| --- | --- | --- |
| 공개 사이트 | index/archive/team/booking/map-demo/place-detail | `hangro-tokens.css` + `styles.css` |
| 게스트 | guest/* (index/listing/booking/checkout/bookings/messages/stay) | `hangro-tokens.css` + `guest-airbnb.css` |
| 집주인 | host/* | `hangro-tokens.css` + `styles.css` + `portal.css` |
| 회사 공개 | company/index/booking/team/archive/map-demo/place-detail | `hangro-tokens.css` + `styles-editorial.css` + `company-unified.css` |
| 회사 운영 | company/ops/* | `hangro-tokens.css` + `styles.css` + `portal.css` + `company-ops.css` |

---

## 12. JS 모듈 책임

| 파일 | 용도 |
| --- | --- |
| `js/places-runtime.js` | 공개 사이트 동적 렌더 (지도 핀, 기록 카드, place-detail) |
| `js/guest-app.js` | 게스트 포털 SPA-style 라우터 + 렌더 |
| `js/company-ops-app.js` | 운영 대시보드 렌더 |
| `js/portal-data.js` | 포털 목업 데이터 (PROPERTIES, BOOKINGS, MESSAGES) |
| `js/portal-ui.js` | 포털 공통 helper (escapeHtml, formatDate, statusBadge) |
| `js/portal-guard.js` | 게스트↔호스트 sessionStorage 락 |
| `js/company-ops-guard.js` | 회사 운영 인증 (sessionStorage) |
| `js/demo-portal.js` | demo/server.py API 호출 래퍼 |

### 절대 건드리지 말 것
- 함수 시그니처: `GuestApp.autoBoot()`, `HAENG_RUNTIME.init*Page()`, `CompanyOpsGuard.isAuthed()/login()`, `PortalUI.*`
- HTML mount point id: `#ga-header-mount`, `#ga-search-mount`, `#ga-listings`, `#co-dashboard-root`, `#archive-root`, `#detail-root`, `#detail-main`
- sessionStorage 키: `hangro_portal_lock`

---

## 13. 카피 톤

### 한국어 톤
- 정중하고 차분 ("~합니다" 종결)
- 전문 용어 + 시적 표현 혼용 ("머무름", "다시 켭니다", "한 권의 마을")
- 영문 라벨: Title Case ("What we do", "How it works", "Cases")

### 데모/테스트 카피 (금지)
- "테스트 페이지입니다" / "데모로 표시됩니다" 같은 표현 사용자 노출 영역 X
- 폼 응답: "신청이 접수되었습니다" 식 운영 톤

### 마이크로 카피 패턴
| 위치 | 패턴 |
| --- | --- |
| 헤더 CTA | "상담 예약" / "예약 시작" |
| 카드 링크 | "변경 전·후 보기 →" / "기록에서 자세히 보기" |
| 빈 상태 | "아직 등록된 X가 없습니다" + 액션 버튼 |
| 폼 confirm | "영업일 기준 2일 이내 회신 드릴게요" |

---

## 14. 안티 패턴 (절대 X)

### 디자인 차원
- ❌ 그라데이션 (linear/radial/conic)
- ❌ drop-shadow blur > 20px
- ❌ 네온·무지개·5색 이상 사용
- ❌ 회색 1px hairline 박스 boundary (paper bg 로 대체)
- ❌ 단일 side border (`border-left` 만) + border-radius 함께
- ❌ 글자가 1~2자만 다음 줄로 떨어지는 어색한 줄바꿈 (max-width 조정 or `&nbsp;`)
- ❌ 본문 letter-spacing 양수 값 (한글에서 어색)
- ❌ 헤딩 letter-spacing 양수 값 (-0.025em 정도가 표준)

### 코드 차원
- ❌ hex 코드를 컴포넌트 CSS에 직접 (variable만)
- ❌ 새 CSS 파일 만들기 (기존 영역 CSS에 추가)
- ❌ 인라인 `style=""` 남발 (variable 참조용 1-2개는 OK)
- ❌ `!important` 남발 (override 가 정말 필요한 경우만)
- ❌ JS 파일에 `.js.js` 같은 중복 확장자

### 카피 차원
- ❌ "테스트 페이지", "데모", "(예시)" 등 사용자 노출 X
- ❌ 영문 sentence case 무시 ("WHAT WE DO" 같은 ALL CAPS 단락)
- ❌ 과한 이모지 사용

---

## 15. 변경 작업 시 체크리스트

새 컴포넌트나 페이지 작업 전:

1. [ ] `hangro-tokens.css` 에 필요한 변수가 있는지 확인. 없으면 추가
2. [ ] 어느 CSS 파일에 추가할지 결정 (영역별 매트릭스 참조)
3. [ ] 폰트 패밀리 + 사이즈 + line-height + letter-spacing 명시
4. [ ] 한국어 줄바꿈 `word-break: keep-all` 상속 확인
5. [ ] 호버·active·focus 상태 정의
6. [ ] 모바일(≤640px) 레이아웃 확인
7. [ ] `prefers-reduced-motion` 대응
8. [ ] 접근성: aria-label, focus-visible, 색 대비
9. [ ] 작업 후 즉시 `git commit` (Cursor revert 차단)
10. [ ] 다른 영역에 영향 없는지 검증 (특히 토큰 변경 시)

---

## 16. 빠른 참조 — 자주 쓰는 한 줄

```css
/* 헤딩 */
font-family: "Nanum Myeongjo", "Times New Roman", serif;
font-weight: 700;
letter-spacing: -0.025em;
line-height: 1.25;
color: var(--hangro-ink);

/* 본문 */
font-family: "Noto Sans KR", system-ui, sans-serif;
line-height: 1.7;
color: var(--hangro-ink-soft);

/* 트래킹 캡스 라벨 */
font-family: "Helvetica Neue", system-ui, sans-serif;
font-size: 0.72rem;
font-weight: 600;
letter-spacing: 0.16em;
text-transform: uppercase;
color: var(--hangro-muted);

/* 카드 */
background: var(--hangro-paper);
border-radius: var(--hangro-radius-lg);
padding: 1.25rem 1.35rem;

/* primary 버튼 */
background: var(--hangro-ink);
color: var(--hangro-bg);
border: 1px solid var(--hangro-ink);
border-radius: var(--hangro-radius-pill);
padding: 0.85rem 1.6rem;

/* 한국어 줄바꿈 */
word-break: keep-all;
overflow-wrap: break-word;

/* 페이지 fade-in */
animation: hangro-fade-in 0.32s cubic-bezier(0.2, 0.7, 0.2, 1);
```

---

## 17. 문서 관리

- 이 파일(`DESIGN.md`)은 **디자인 결정의 단일 진실**
- 변경 시:
  1. 토큰 추가/변경은 `hangro-tokens.css` + 이 문서 동시 업데이트
  2. 새 컴포넌트는 §7 에 스펙 추가
  3. 새 페이지 유형은 §8 에 패턴 추가
- Cursor / Claude Code 가 작업 전 이 문서를 참조하도록 `.cursorrules` / `CLAUDE.md` 에 명시
- 디자인 자체 변경(예: 톤 전환)은 commit 메시지에 `design:` prefix 사용

---

> 마지막 검증: 2026-05-19 · 행로 v0.x · 에디토리얼 톤
