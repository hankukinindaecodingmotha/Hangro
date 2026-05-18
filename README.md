# 행로 — Hangro

빈집·유후시설 재생 프로젝트의 **정적 웹사이트**입니다. 빌드 없이 GitHub Pages 또는 로컬 HTTP 서버로 실행합니다.

## 디렉터리 구조

```
Hangro/
├── index.html              # 공개 랜딩
├── archive.html            # 작업 기록
├── map-demo.html           # 지도
├── place-detail.html       # 장소 상세
├── booking.html            # 상담 예약 (데모)
├── team.html               # 팀 소개
│
├── guest/                  # 게스트 포털 (/guest/)
├── host/                   # 집주인 포털 (/host/)
├── company/                # 회사 포털 (/company/)
│
├── css/
│   ├── styles.css          # 공통 스타일 (메인)
│   ├── portal.css          # 포털 전용
│   └── styles-editorial.css  # 에디토리얼 톤 백업 (비활성)
│
├── js/
│   ├── places-runtime.js   # 지도·기록·상세 JSON 렌더
│   ├── portal-data.js      # 포털 목업 데이터
│   ├── portal-ui.js        # 포털 공통 UI
│   └── demo-portal.js      # demo/server.py API 연동
│
├── data/
│   └── places.json         # 장소·기록·사진 경로
│
├── Asset/                  # 이미지 (places.json 경로와 일치)
│   └── Home_1/
│       ├── before/
│       └── after/
│
└── demo/                   # 로컬 통합 데모 서버
    ├── server.py           # 정적 파일 + /api/*
    ├── index.html
    └── HOWTO.txt
```

## 로컬 실행

**정적 미리보기** (포털·공개 페이지):

```bash
cd "/Users/jeongtaeju/Desktop/Social venture"
python3 -m http.server 8080
```

- http://127.0.0.1:8080/
- http://127.0.0.1:8080/guest/
- http://127.0.0.1:8080/host/
- http://127.0.0.1:8080/company/

**API 데모 포함** (한 포트):

```bash
python3 demo/server.py
# http://127.0.0.1:9090/
```

## GitHub Pages

`main` 브랜치 루트 배포 기준 URL 예:

- `https://<user>.github.io/Hangro/`
- `https://<user>.github.io/Hangro/guest/`

HTML·`css/`·`js/`·`data/`·`Asset/` 경로는 루트 기준 상대 경로로 연결되어 있습니다.

## 데이터

`data/places.json` 수정 시 지도·상세·기록 페이지에 반영됩니다. 이미지는 `Asset/…` 아래에 두고 JSON의 `basePath`와 파일명을 맞춥니다.

## 포털 (목업)

| 역할 | 경로 | 용도 |
|------|------|------|
| 게스트 | `/guest/` | 예약·숙소 안내·문의 |
| 집주인 | `/host/` | 숙소·예약·문의함 |
| 회사 | `/company/` | 전체 대시보드·공지 |

실제 저장·인증은 `demo/server.py` 또는 추후 BaaS/API 연동 예정입니다.
