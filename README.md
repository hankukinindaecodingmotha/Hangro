# 행로 — Hangro

빈집·유휴시설 재생 프로젝트의 **정적 웹 데모**입니다. 빌드 없이 GitHub Pages 또는 로컬 HTTP 서버로 실행합니다.

상세 구조·모듈 역할은 **[docs/CODEBASE.md](docs/CODEBASE.md)** 를 참고하세요.  
디자인 규칙은 **[DESIGN.md](DESIGN.md)** · **[css/hangro-tokens.css](css/hangro-tokens.css)** 입니다.

## 디렉터리 요약

```
├── index.html              # 게이트 (게스트 / 집주인 / 회사)
├── guest/                  # 게스트 포털
├── host/                   # 집주인 포털
├── company/                # 회사 공개 + company/ops/ 운영
├── css/                    # hangro-tokens + 영역별 스타일
├── js/                     # places-runtime, portal-data, guest/host-app …
├── data/places.json        # 지도·기록·상세
├── Asset/                  # 장소 이미지
└── demo/                   # 선택: API 통합 서버
```

## 로컬 실행

```bash
cd "/Users/jeongtaeju/Desktop/Social venture"
python3 -m http.server 8080 --bind 127.0.0.1
```

| 화면 | URL |
| --- | --- |
| 게이트 | http://127.0.0.1:8080/ |
| 게스트 | http://127.0.0.1:8080/guest/ |
| 집주인 | http://127.0.0.1:8080/host/ |
| 회사 | http://127.0.0.1:8080/company/ |
| 운영 | http://127.0.0.1:8080/company/ops/ (ops / hangro2026) |

## GitHub Pages

`main` 브랜치 루트 배포. 경로는 모두 **상대 경로**로 연결되어 있습니다.

## 데이터 · API

- `data/places.json` — 지도·아카이브·장소 상세 (`js/places-runtime.js`)
- `js/portal-data.js` — 숙소·예약·메시지 목업
- `js/portal-api.js` — `/api/*` 호출, 실패 시 localStorage 폴백 ([docs/API.md](docs/API.md))
- `python3 demo/server.py` — 예약·상담·숙소 편집 API (포트 9090)
- 이미지는 `Asset/` 아래, JSON의 `basePath`와 파일명을 맞춥니다.
