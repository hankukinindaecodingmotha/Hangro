# 행로 — 서비스 소개 페이지

> **Hangro** · Social venture  
> 빈집·유후시설을 지역 관광 숙소·콘텐츠로 재생하는 행로의 임시 소개 사이트.

정적 HTML/CSS만 사용하므로 빌드 단계 없이 GitHub Pages로 바로 배포 가능합니다.

## 파일 구성

| 파일                | 역할                                  |
| ------------------- | ------------------------------------- |
| `index.html`        | 홈 — 서비스 소개·진행 흐름            |
| `team.html`         | 팀 소개                               |
| `booking.html`      | 상담 예약 폼 (테스트용)               |
| `map-demo.html`     | OSM + Leaflet 데모 지도               |
| `place-detail.html` | 프로젝트별 변경 전/후 (`?id=` 쿼리)   |
| `styles.css`        | 공통 스타일                           |
| `data/places.json`  | 지도·상세 공통 장소 데이터            |
| `js/places-runtime.js` | JSON 로드·지도·상세 렌더           |

---

## 로컬에서 미리 보기

```bash
cd "/경로/Social venture"
python3 -m http.server 8765
# http://localhost:8765/index.html
```

`map-demo.html`의 OSM 타일은 `http://localhost` 같은 서버로 열어야 합니다.

---

## GitHub Pages

저장소 **Settings → Pages**에서 `main` 브랜치 / `(root)` 로 배포할 수 있습니다.

---

## 메모

- 폼(`booking.html`)은 데모용이며 서버로 전송되지 않습니다.
- 장소 추가는 `data/places.json`을 수정하면 지도와 상세가 함께 반영됩니다.
