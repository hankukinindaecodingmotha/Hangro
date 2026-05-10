# 행로 — 서비스 소개 페이지

빈집·유후시설을 지역 관광 숙소·콘텐츠로 재생하는 행로의 임시 소개 사이트.
정적 HTML/CSS만 사용하므로 빌드 단계 없이 GitHub Pages로 바로 배포 가능.

## 파일 구성

| 파일                | 역할                                  |
| ------------------- | ------------------------------------- |
| `index.html`        | 홈 — 서비스 소개·진행 흐름            |
| `team.html`         | 팀 소개                               |
| `booking.html`      | 상담 예약 폼 (테스트용)               |
| `map-demo.html`     | OSM + Leaflet 데모 지도               |
| `place-detail.html` | 매장별 변경 전/후 (querystring으로)   |
| `styles.css`        | 공통 스타일                           |
| `assets/`           | 로고 등 정적 자산                     |
| `.nojekyll`         | GitHub Pages가 Jekyll 처리하지 않도록 |

---

## GitHub Pages 배포 — 한 번만 하면 끝

### 0. 사전 정리 (필수)

이 폴더 안에 권한이 깨진 `.git` 폴더가 있을 수 있어. 터미널에서:

```bash
cd ~/Desktop/Social\ venture
sudo rm -rf .git
```

> macOS 비밀번호 한 번 물어봐. 이건 빈 폴더 지우는 것뿐이라 안전함.

### 1. GitHub에서 빈 저장소 만들기

1. <https://github.com/new> 접속 (행로야 본인 계정으로 로그인)
2. Repository name: 예) `hangro-site`
3. Public 선택
4. **README, .gitignore, license 모두 체크 해제** (이미 로컬에 있음)
5. `Create repository` 클릭

만들면 GitHub이 보여주는 URL을 복사해 둬. 예시:
`https://github.com/your-username/hangro-site.git`

### 2. 로컬 → GitHub 푸시

터미널에서 (URL은 위에서 복사한 값으로 바꿔):

```bash
cd ~/Desktop/Social\ venture
git init -b main
git add .
git commit -m "init: 행로 서비스 소개 페이지"
git remote add origin https://github.com/your-username/hangro-site.git
git push -u origin main
```

> 처음이면 GitHub 인증 한 번 뜸. 브라우저 인증(권장) 또는 Personal Access Token으로.

### 3. GitHub Pages 켜기

1. 방금 만든 저장소로 이동
2. `Settings` → 좌측 메뉴 `Pages`
3. **Source**: `Deploy from a branch`
4. **Branch**: `main` / `(root)` 선택 → `Save`
5. 1–2분 기다리면 상단에 URL이 뜸:
   `https://your-username.github.io/hangro-site/`

끝. 이 URL을 누구한테든 공유 가능.

### 4. 이후 수정사항 반영

코드 바꾼 다음 매번:

```bash
git add .
git commit -m "수정 메시지"
git push
```

푸시하면 GitHub Pages가 30초~1분 안에 자동 재배포함.

---

## 자주 쓰는 보너스

### 커스텀 도메인 (예: hangro.kr) 연결

1. 도메인 DNS에서 CNAME → `your-username.github.io` 추가
2. 저장소 root에 `CNAME` 파일 만들고 안에 `hangro.kr` 한 줄
3. Settings → Pages → Custom domain에 `hangro.kr` 입력 → Save → Enforce HTTPS 체크

### 로컬에서 미리 보기

```bash
cd ~/Desktop/Social\ venture
python3 -m http.server 8000
# 브라우저에서 http://localhost:8000
```

`map-demo.html`의 OpenStreetMap 타일은 file:// 로 열면 막힐 수 있어서 위처럼 간단 서버로 보는 걸 추천.

---

## 메모

- 정적 사이트라 백엔드·DB·인증 없음 — 폼은 데모(`booking.html`)이므로 실제 전송 안 됨. 정식 운영 시 Formspree, Tally, Notion form, 자체 API 중 택해서 연결.
- `place-detail.html`의 데이터는 페이지 안 JS의 `PLACES` 객체에서 관리. 케이스를 추가할 땐 객체에 새 ID로 항목 추가하고 `map-demo.html`의 `sites` 배열에도 같은 ID로 핀 좌표를 추가.
- 지도 라이브러리는 무료 OSM/Leaflet 사용. 상용 트래픽이 커지면 카카오/네이버 지도 SDK로 갈아끼우는 게 한국 서비스에는 더 적합.
