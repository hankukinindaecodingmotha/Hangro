# data/

## places.json

공개 사이트 **프로젝트 지도·기록·장소 상세**용 데이터입니다.

- 로더: `js/places-runtime.js` → `HAENG_RUNTIME.loadPlaces()`
- 확인: `company/map-demo.html`, `company/archive.html`, `company/place-detail.html`

## spots.json

**죽천·포항 맛집·카페·명소** 지도용 데이터입니다.

- 로더: `js/spots-runtime.js` → `SPOTS_RUNTIME.initSpotsPage()`
- 확인: `company/map-spots.html`
- 필드: `id`, `name`, `category` (`cafe`|`restaurant`|`attraction`), `area` (`jukcheon`|`pohang`), `lat`, `lng`, `address`, `description`, `kakaoUrl`
