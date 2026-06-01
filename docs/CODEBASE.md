# 행로(Hangro) 코드베이스 가이드

정적 웹 데모입니다. 빌드 도구 없이 `python3 -m http.server` 또는 GitHub Pages로 실행합니다.

## 플로우별 진입 URL

| 플로우 | 경로 | 설명 |
| --- | --- | --- |
| 게이트 | `/index.html` | 게스트·집주인·회사 소개 선택 |
| 게스트 | `/guest/` | 숙소 검색·예약·여행·메시지 |
| 집주인 | `/host/` | 숙소·예약·캘린더·메시지 |
| 회사 공개 | `/company/` | 소개·지도·기록·팀·상담 예약 |
| 회사 운영 | `/company/ops/` | 전체 KPI·게스트/집주인 관리 (데모 로그인) |

루트의 `booking.html`, `map-demo.html` 등은 `company/`로 **리다이렉트**만 합니다.

---

## 디렉터리 구조

```
├── index.html                 # 게이트 (역할 선택)
├── company/                   # 회사 공개 + ops
├── guest/                     # 게스트 포털 HTML
├── host/                      # 집주인 포털 HTML
├── css/                       # 스타일 (영역별 분리)
├── js/                        # 런타임 로직
├── data/places.json           # 지도·기록·상세 장소 데이터
├── Asset/                     # 장소 사진 (JSON 경로와 일치)
├── demo/                      # API 통합 데모 서버 (선택)
└── docs/CODEBASE.md           # 이 문서
```

---

## JavaScript 모듈

| 파일 | 전역 객체 | 역할 |
| --- | --- | --- |
| `places-runtime.js` | `HAENG_RUNTIME` | `data/places.json` 로드, 지도(Leaflet)·장소 상세·기록 아카이브 렌더 |
| `portal-data.js` | `PORTAL_DATA` | 숙소·예약·메시지·후기 **목업 데이터** + 조회 API |
| `portal-ui.js` | `PortalUI` | 상태 뱃지, URL 파라미터, 문의 폼 데모 저장 |
| `portal-guard.js` | — | 게스트↔집주인 동시 체험 시 `sessionStorage` 잠금 |
| `guest-app.js` | `GuestApp` | 게스트 페이지 렌더 (`data-ga-page` → `autoBoot`) |
| `host-app.js` | `HostApp` | 집주인 대시보드·예약 승인·캘린더 |
| `company-ops-guard.js` | `CompanyOpsGuard` | ops 로그인 게이트 (데모: ops / hangro2026) |
| `company-ops-app.js` | `CompanyOpsApp` | ops 대시보드·목록 테이블 |
| `demo-portal.js` | — | `demo/server.py` REST 연동 (선택) |

### 데이터 흐름 (게스트 예약)

1. `guest/index.html` → `GuestApp.autoBoot()` → `renderExplore`
2. `PORTAL_DATA.listBookable()` 으로 숙소 목록
3. 예약 시 `localStorage` `hangro_guest_trips` 에 trip 추가
4. 집주인이 승인/거절 시 `host-app` → `hangro_host_booking_status` + 게스트 trip 동기화

### 데이터 흐름 (공개 지도)

1. `company/map-demo.html` 에 Leaflet + `places-runtime.js`
2. `resolvePlacesDataUrl()` → 항상 사이트 루트 `/data/places.json`
3. `HAENG_RUNTIME.initMapPage()` → 핀·팝업

---

## CSS 로딩 규칙 (`.cursorrules` / `DESIGN.md`)

| 영역 | CSS 스택 |
| --- | --- |
| 게이트 | `hangro-tokens` + `styles` + `portal` |
| 게스트 | `hangro-tokens` + `guest-airbnb` |
| 집주인 | `hangro-tokens` + `portal` + `portal-host` |
| 회사 공개 | `hangro-tokens` + `styles-editorial` + `company-unified` |
| 회사 ops | `hangro-tokens` + `portal` + `company-ops` |

- **단일 진실**: 색·간격은 `css/hangro-tokens.css`
- **디자인 스펙**: 루트 `DESIGN.md`

---

## HTML 규약

- 게스트: `<body data-ga-page="explore|listing|checkout|trips|trip|messages">`
- 집주인: `data-host-page="dashboard|bookings|properties|messages|property-edit"`
- ops: `data-ops-page="dashboard|..."` + `data-ops-guard="auto"`
- 마운트 포인트 id 변경 금지 (예: `ga-page-root`, `ga-header-mount`, `co-dashboard-root`)

---

## 수정 시 주의 (건드리지 말 것)

- `GuestApp.autoBoot()`, `HostApp.autoBoot()` 진입 방식
- `HAENG_RUNTIME.initMapPage` / `initDetailPage` / `initArchivePage` 시그니처
- `data/places.json` 최상위 키 이름 (`places`, `version` 등)
- `portal-guard` 의 `hangro_portal_lock` 키

---

## 로컬 실행

```bash
cd "/Users/jeongtaeju/Desktop/Social venture"
python3 -m http.server 8080 --bind 127.0.0.1
```

API 데모: `python3 demo/server.py` → http://127.0.0.1:9090/
