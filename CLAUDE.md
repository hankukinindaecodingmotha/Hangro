# 행로 (Hangro) — 프로젝트 인수인계 노트

> Claude Code가 새 세션을 시작할 때 이 문서를 먼저 읽어. 직전 세션(Cowork)에서 진행한 작업·결정·미해결 이슈가 모두 정리되어 있어.

---

## 1. 프로젝트 개요

**행로(Hangro)** — 빈집·유휴시설을 지역 관광 숙소·콘텐츠로 재생하는 서비스의 임시 소개 사이트.

- **유저**: 행로야 (`projecthangrow@gmail.com`, GitHub `hankukinindaecodingmotha`)
- **저장소**: <https://github.com/hankukinindaecodingmotha/Hangro>
- **배포 목표**: GitHub Pages (`https://hankukinindaecodingmotha.github.io/Hangro/`)
- **빌드 단계 없음**: 정적 HTML/CSS/JS만 사용. 그대로 push → Pages 자동 서빙.

---

## 2. 파일 구조

```
Social venture/
├── index.html               # 홈 (소개·진행 흐름·컨택)
├── team.html                # 팀 4인 카드 그리드
├── booking.html             # 상담 예약 폼 (데모 — 실제 전송 X)
├── map-demo.html            # OSM + Leaflet 지도, 핀 클릭 → place-detail
├── place-detail.html        # ?id=… 쿼리스트링으로 매장 변경 전/후 렌더
├── styles.css               # ⚠️  현재 활성 — 원래 다크 톤
├── styles-editorial.css     # ⚠️  비활성 백업 — Claude가 만든 에디토리얼 톤(베이지+세리프+헤어라인)
├── data/
│   └── places.json          # 매장 데이터(JSON) — 사용자가 리팩터링한 결과
├── js/
│   └── places-runtime.js    # 데이터 → 렌더 런타임
├── assets/                  # 로고 등 (현재 비어있음 — haengro-logo.png 삭제됨)
├── README.md                # GitHub Pages 배포 가이드
├── .gitignore               # macOS·IDE·node 제외
├── .nojekyll                # GitHub Pages가 Jekyll 처리 안 하도록
└── .git/                    # git repo (origin: hankukinindaecodingmotha/Hangro.git)
```

---

## 3. 디자인 — 두 가지 버전 공존 중

### 활성: `styles.css` (다크 톤 / 원본)

원래 Cursor가 만든 다크 톤. 토큰:

```css
--bg: #0f1412;          /* 다크 배경 */
--bg-elevated: #171d1a;
--text: #e8eee9;
--text-muted: #9aa99e;
--accent: #6b9b7a;       /* 세이지 그린 */
--accent-soft: rgba(107, 155, 122, 0.15);
--line: rgba(232, 238, 233, 0.12);
--radius: 14px;
```

### 비활성 백업: `styles-editorial.css` (에디토리얼 톤)

Cowork 세션에서 사용자가 "차분한 전문 회사 느낌, 그라데이션 빼고"를 요청해서 만든 버전. **Aesop·Norm Architects·Kinfolk 톤** — 따뜻한 베이지 배경, 헤어라인 1px, Nanum Myeongjo 디스플레이 헤딩, 트래킹 캡스 라벨. 그라데이션 0건. 토큰:

```css
--bg: #EFE9DC;           /* 따뜻한 베이지 */
--paper: #F6F1E5;
--ink: #1A2419;          /* 깊은 숲색 */
--ink-soft: #4A4F44;
--ink-mute: #87897D;
--rule: rgba(26, 36, 25, 0.14);   /* 헤어라인 */
--green-deep: #3D6E2C;
--green-soft: #B7C9A4;
--yellow:     #E9D896;
--orange:     #C8742B;
```

옛 토큰(`--text`, `--accent`, `--line` 등) → 새 토큰 alias 포함되어 있어서 **HTML 마크업은 다크 버전 그대로 둬도 호환됨**.

### 적용 방법
HTML의 `<link rel="stylesheet" href="styles.css" />` →
`<link rel="stylesheet" href="styles-editorial.css" />`로 5개 HTML에서 바꾸면 톤 전환.

---

## 4. ⚠️ 알려진 이슈 — Cursor 자동 revert

**문제**: 행로야가 평소 Cursor IDE를 같이 쓰는데, Cursor가 변경된 `styles.css`/`index.html`을 자동으로 원본 다크 톤으로 되돌리는 패턴이 여러 번 발생함.

**대처법 (이미 적용됨)**: 새 디자인은 `styles-editorial.css` 같은 별도 파일에 보관. Cursor가 `styles.css`를 덮어써도 백업이 살아있음.

**Claude Code에서 작업 시**: 사용자가 디자인 수정을 요청하면, `styles.css`를 직접 수정하기 전에 한 번 더 확인할 것 ("Cursor가 또 되돌릴 수 있어요. styles-editorial.css 쪽에 작업할까요, 아니면 그대로 styles.css에?").

---

## 5. 디자인 결정 메모 (히스토리)

사용자가 톤을 여러 번 바꿔봄. 시간순:
1. **다크 톤** (Cursor 원본) → "너무 어두워"
2. **밝은 여행 팔레트** (그린/연두/노랑/주황 라이트) → 1차 시도
3. **트렌디 네오브루탈리즘** (마키, 폴라로이드, 컨투어 그림자) → "너무 익사이팅, 가벼움"
4. **에디토리얼 정제 톤** (현재 `styles-editorial.css`) → 사용자가 "전문성 있는 회사 느낌"으로 채택
5. → Cursor가 1번 다크 톤으로 자동 revert (현재 `styles.css` 상태)

**현재 사용자 의도**: 에디토리얼 톤을 유지하고 싶어 함. 다만 Cursor 자동 revert 때문에 styles.css가 다크 톤으로 보일 수 있음.

---

## 6. GitHub 배포 — 현재 상태

**완료**:
- `git init` + 첫 커밋 (`fd2fd20 init: 행로 서비스 소개 페이지`)
- 리모트 origin: `https://github.com/hankukinindaecodingmotha/Hangro.git` 설정됨
- GitHub repo 생성됨

**미완료 — 사용자가 터미널에서 직접 해야 할 것**:
```bash
cd ~/Desktop/Social\ venture
git add -A
git commit -m "feat: 작업물 업데이트"
git push -u origin main
```
처음 push면 GitHub 인증 한 번 필요(브라우저 OAuth 또는 Personal Access Token).

**push 이후**: GitHub repo → Settings → Pages → Source `main` `/(root)` → Save → 1분 대기 → 라이브 URL.

---

## 7. 미해결 과제 (우선순위 순)

1. **GitHub push 마무리** — 인증 단계에서 막히는지 확인 후 Pages 활성화
2. **`assets/haengro-logo.png` 복구 여부 결정** — 폴더는 비어있고 git에는 deletion으로 잡혀있음. 텍스트 로고로 갈지, PNG 다시 넣을지 사용자 의도 확인 필요
3. **에디토리얼 톤 적용** — 사용자가 원하면 5개 HTML의 `<link>`를 `styles-editorial.css`로 일괄 교체
4. **`data/places.json` + `js/places-runtime.js` 통합 검증** — 사용자가 직접 리팩터링한 부분. 기존 `place-detail.html` 안의 `PLACES` 인라인 객체와 중복일 수 있음. 한 번 점검 필요
5. **booking.html 폼 백엔드 연결** — 현재 데모. Formspree·Tally·Typeform 등 결정 필요

---

## 8. 로컬 프리뷰

```bash
cd ~/Desktop/Social\ venture
python3 -m http.server 8000
# → http://localhost:8000
```

(`map-demo.html`의 OSM 타일이 `file://`에서는 막혀서 간단 서버가 필요)

---

## 9. 사용자 톤 (작업 스타일 메모)

- 사용자는 "행로야"라고 부르면 됨
- 한국어로 응대
- 코드보다는 **시각적 결과·디자인 톤**에 더 관심 많음
- 변경 시 한 번에 큰 덩어리로 보여주기보다, **단계별로 보여주고 피드백 받는 방식** 선호
- 너무 가볍거나 익사이팅한 톤보다 **차분하고 전문가스러운 디자인** 선호
- 그라데이션·과한 그림자·애니메이션 비선호

---

> 새 세션 첫 메시지로 추천: "현재 작업 상태 파악했어. styles.css는 다크 톤(Cursor 원본)이고 styles-editorial.css에 에디토리얼 백업이 있어. 어디서부터 이어갈까?"
