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
| `place-detail.html`    | 지도 핀 진입 — 변경 후/현재 모습만 노출              |
| `archive.html`         | 진행 중·완료 프로젝트 기록 (변경 전 사진·평면·콘셉트) |
| `styles.css`           | 공통 스타일                                          |
| `data/places.json`     | 지도·상세 공통 장소 데이터 (주소·좌표·평면·Before 사진) |
| `js/places-runtime.js` | JSON 로드 + 지도/상세 렌더 런타임                    |
| `Asset/Home_1/before/` | 첫 번째 유후공간 변경 전 사진 자산                   |

상단 네비게이션 순서는 모든 페이지에서 **소개 / 지도 / 기록 / 예약 / 팀**으로 통일되어 있습니다.

---

## 주요 기능

### 지도 (`map-demo.html`)
- OpenStreetMap 타일 + Leaflet, **커스텀 SVG 핀**.
- 핀 클릭 시 즉시 상세 페이지로 이동하지 않고 **위치 카드 팝업**(제목 · 주소 · "자세히 보기" 링크) 표시.

### 상세 (`place-detail.html?id=…`)
- 지도 핀 클릭 시 진입. **변경 후/현재 모습**만 노출.
- `places.json`의 `afterReady`가 `true`이고 `afterPhotos`가 있으면 사진 스트립 + 결과 콘셉트 노출.
- 그 외는 "변경 후 모습은 곧 공개됩니다" 안내 + 기록 페이지 링크.

### 기록 (`archive.html`)
- 진행 중·완료 프로젝트 전체 기록. 각 프로젝트의 **변경 전 현장 사진(인스타 피드 톤 스트립) · 평면 SVG · 콘셉트/운영 포인트**를 한 자리에 모아서 표시.
- `archive.html#<id>` 형태로 특정 프로젝트로 직접 스크롤.

### 예약 (`booking.html`)
- 클라이언트 측 유효성 검증 후 제출 시뮬레이션. 서버 전송은 아직 없음.

---

## 데이터 추가/수정

`data/places.json`만 수정하면 지도 핀·상세 페이지가 동시에 반영됩니다.

```jsonc
{
  "id": "my-place",            // URL 식별자
  "lat": 36.0859, "lng": 129.4166,
  "address": "경상북도 …",     // (선택) 핀 팝업에 표시
  "tooltip": "…",              // 핀 hover 툴팁
  "status": "진행 중",          // 진행 중 / 완료 / 공개 준비 중 등
  "afterReady": false,          // true면 detail에 변경 후 사진 노출
  "title": "…", "lead": "…",
  "tags": ["…"],
  "bullets": ["…"],
  "beforePhotos": {            // (선택) 기록 페이지에 노출
    "basePath": "Asset/My_Place/before/",
    "items": ["file_01.jpeg", "file_02.jpeg"]
  },
  "afterPhotos": {             // (선택) detail 페이지에 노출, afterReady=true 시
    "basePath": "Asset/My_Place/after/",
    "items": ["after_01.jpeg"]
  },
  "afterSummary": "…",         // (선택) detail의 결과 콘셉트 문단
  "floorPlan": { /* (선택) SVG 평면, 기록 페이지에 노출 */ }
}
```

---

## 메모

- `booking.html` 폼은 데모 — 서버로 전송되지 않습니다. 운영 시 Formspree/Tally/자체 백엔드 등에 연결 필요.
- 이미지는 가능한 한 1600px 이하·JPEG 85%로 리사이즈 후 커밋 권장 (현재 `Asset/Home_1/before/` 일부 원본이 큰 편).
