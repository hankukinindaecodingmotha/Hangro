# data/places.json

공개 사이트 **지도·기록·장소 상세**용 정적 데이터입니다.

- 로더: `js/places-runtime.js` → `HAENG_RUNTIME.loadPlaces()`
- 이미지: `Asset/` 아래 경로는 JSON의 `basePath`, `before[]`, `after[]` 와 일치해야 합니다.
- `id`, `lat`, `lng`, `title`, `lead`, `tags`, `beforeCaption`, `afterCaption` 등은 런타임에서 필수 검증합니다.

수정 후 `company/map-demo.html`, `company/archive.html`, `company/place-detail.html` 에서 확인하세요.
