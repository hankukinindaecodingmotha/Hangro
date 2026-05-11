# 행로 — 서비스 소개 페이지

> **Hangro** · Social venture
> 빈집·유후시설을 지역 관광 숙소·콘텐츠로 재생하는 행로의 임시 소개 사이트.

정적 HTML/CSS/JS만 사용 — 빌드 단계 없이 어디서든 호스팅 가능합니다.

---

## 파일 구성

| 파일                   | 역할                                                 |
| ---------------------- | ---------------------------------------------------- |
| `index.html`           | 홈 — 서비스 소개·진행 흐름                           |
| `map-demo.html`        | OSM + Leaflet 지도 (핀 클릭 → 주소 카드 팝업)         |
| `booking.html`         | 상담 예약 폼 (데모 — 실제 전송 X)                    |
| `team.html`            | 팀 4인 카드 그리드                                    |
| `place-detail.html`    | 프로젝트별 상세 (`?id=` 쿼리스트링)                  |
| `styles.css`           | 공통 스타일                                          |
| `data/places.json`     | 지도·상세 공통 장소 데이터 (주소·좌표·평면·Before 사진) |
| `js/places-runtime.js` | JSON 로드 + 지도/상세 렌더 런타임                    |
| `Asset/Home_1/before/` | 첫 번째 유후공간 변경 전 사진 자산                   |

상단 네비게이션 순서는 모든 페이지에서 **소개 / 지도 / 예약 / 팀**으로 통일되어 있습니다.

---

## 주요 기능

### 지도 (`map-demo.html`)
- OpenStreetMap 타일 + Leaflet, **커스텀 SVG 핀**.
- 핀 클릭 시 즉시 상세 페이지로 이동하지 않고 **위치 카드 팝업**(제목 · 주소 · "자세히 보기" 링크) 표시.

### 상세 (`place-detail.html?id=…`)
- **현장 사진 스트립** — 변경 전 현장 사진을 한 장씩 넘겨 보는 컴팩트 형태(인스타 피드 톤).
- **내부 평면 SVG** — 방을 누르면 다이얼로그 팝업으로 설명.

### 예약 (`booking.html`)
- 클라이언트 측 유효성 검증 후 제출 시뮬레이션. 서버 전송은 아직 없음.

---

## 데이터 추가/수정

`data/places.json`만 수정하면 지도 핀·상세 페이지가 동시에 반영됩니다.

```jsonc
{
  "id": "my-place",            // URL 식별자
  "lat": 36.0859, "lng": 129.4166,
  "address": "경상북도 …",     // 핀 팝업에 표시
  "tooltip": "…",              // 핀 hover 툴팁
  "title": "…", "lead": "…",
  "tags": ["…"],
  "beforeCaption": "…", "afterCaption": "…",
  "beforeText": "…", "afterText": "…",
  "bullets": ["…"],
  "beforePhotos": {            // (선택) 사진 슬라이더
    "basePath": "Asset/My_Place/before/",
    "items": ["file_01.jpeg", "file_02.jpeg"]
  },
  "floorPlan": { /* (선택) SVG 평면 */ }
}
```

---

## 메모

- `booking.html` 폼은 데모 — 서버로 전송되지 않습니다. 운영 시 Formspree/Tally/자체 백엔드 등에 연결 필요.
- 이미지는 가능한 한 1600px 이하·JPEG 85%로 리사이즈 후 커밋 권장 (현재 `Asset/Home_1/before/` 일부 원본이 큰 편).
