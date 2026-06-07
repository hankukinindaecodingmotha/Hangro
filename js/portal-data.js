/**
 * 포털 목업 데이터 (PORTAL_DATA)
 * ─────────────────────────────────────────────────────────────
 * 게스트·집주인·회사 ops UI가 공유하는 숙소·예약·메시지·후기 데이터.
 * 실서비스 연동 시 이 파일의 global.PORTAL_DATA 를 fetch 래퍼로 교체.
 */
(function (global) {
  "use strict";

  /* 숙소 목록 (home-1 … home-18) — photos, amenities, hostId 등 */
  var PROPERTIES = [
    {
      id: "home-1",
      name: "죽천길 85 · 첫 번째 유후공간",
      address: "경상북도 포항시 북구 흥해읍 죽천길 85",
      lat: 36.0898783667699,
      lng: 129.418860149057,
      placeId: "sakjeon-hanok",
      hostId: "host-a",
      status: "active",
      summary: "우드·화이트 톤 유휴시설 재생 숙소",
      region: "경북",
      locationLabel: "경북 포항 흥해",
      pricePerNight: 95000,
      rating: 4.92,
      reviewCount: 31,
      guests: 4,
      bedrooms: 2,
      beds: 3,
      baths: 1,
      propertyType: "전체 숙소",
      amenities: ["주방", "와이파이", "무료 주차", "세탁기", "야외 정원"],
      photos: [
        "../Asset/Home_1/after/Home_1_after_08.jpeg",
        "../Asset/Home_1/after/Home_1_after_09.jpeg",
        "../Asset/Home_1/after/Home_1_after_12.jpeg",
      ],
      hostName: "민수",
      hostBio: "마을 재생 숙소를 함께 운영합니다.",
      description:
        "오래 비어 있던 유휴시설을 정리한 체류형 숙소입니다. 2~4인 가족·친구 여행에 적합합니다.",
      highlights: [
        "행로 첫 유휴공간 재생 사례",
        "마을 산책로·작은 정원",
        "주방·세탁기 완비",
      ],
      nearbyTips: ["포항 시내 차량 15분", "해맞이 숲길·해안 산책"],
    },
    {
      id: "home-2",
      name: "죽천길 75",
      address: "경상북도 포항시 북구 흥해읍 죽천길 75",
      lat: 36.0890144516567,
      lng: 129.418185069177,
      placeId: "jookcheon-75",
      hostId: "host-a",
      status: "active",
      summary: "죽천길 일대 유후 공간 재생 후보",
      region: "경북",
      locationLabel: "경북 포항 흥해",
      pricePerNight: 72000,
      rating: 4.78,
      reviewCount: 19,
      guests: 2,
      bedrooms: 1,
      beds: 1,
      baths: 1,
      propertyType: "독채",
      amenities: ["와이파이", "주차", "테라스", "바베큐"],
      photos: [],
      photoTheme: "forest",
      hostName: "지연",
      hostBio: "마을 풍경을 살린 소규모 숙소를 운영합니다.",
      description: "마을 끝 언덕의 작은채. 창밖으로 논과 산책로가 보입니다.",
    },
    {
      id: "home-3",
      name: "죽천길185번길 14",
      address: "경상북도 포항시 북구 흥해읍 죽천길185번길 14",
      lat: 36.0966221421479,
      lng: 129.42649379309,
      placeId: "jookcheon185-14",
      hostId: "host-a",
      status: "paused",
      summary: "185번길 골목 재생 준비 중",
      region: "경북",
      locationLabel: "경북 포항 흥해",
      pricePerNight: 68000,
      rating: 4.65,
      reviewCount: 8,
      guests: 3,
      bedrooms: 1,
      beds: 2,
      baths: 1,
      propertyType: "게스트룸",
      amenities: ["와이파이", "공용 주방"],
      photos: [],
      photoTheme: "hanok",
      hostName: "민수",
      hostBio: "학당 인근 공간 리노베이션 준비 중입니다.",
      description: "옛 학당 옆 부속 공간. 현재 예약은 일시 중단되었습니다.",
    },
    {
      id: "home-4",
      name: "죽천길185번길 11",
      address: "경상북도 포항시 북구 흥해읍 죽천길185번길 11",
      lat: 36.0962712455684,
      lng: 129.426465569796,
      placeId: "jookcheon185-11",
      hostId: "host-a",
      status: "active",
      summary: "185번길 14번지 인접 재생 공간",
      region: "경북",
      locationLabel: "경북 포항 흥해",
      pricePerNight: 118000,
      rating: 4.89,
      reviewCount: 54,
      guests: 5,
      bedrooms: 2,
      beds: 3,
      baths: 1,
      propertyType: "한옥",
      amenities: ["한옥 체험", "와이파이", "주차", "전통 다실", "정원"],
      photos: [],
      photoTheme: "hanok",
      hostName: "서연",
      hostBio: "전주 한옥마을 인근, 전통과 편안함을 함께 제공합니다.",
      description: "한옥 마당에서 차를 마시며 쉬는 숙소. 한복 체험·골목 산책 추천.",
    },
    {
      id: "home-5",
      name: "죽천길 87",
      address: "경상북도 포항시 북구 흥해읍 죽천길 87",
      lat: 36.0897339289562,
      lng: 129.419119468369,
      placeId: "jookcheon-87",
      hostId: "host-a",
      status: "active",
      summary: "죽천길 75·85와 연계된 재생 공간",
      region: "경북",
      locationLabel: "경북 포항 흥해",
      pricePerNight: 142000,
      rating: 4.95,
      reviewCount: 87,
      guests: 4,
      bedrooms: 2,
      beds: 2,
      baths: 2,
      propertyType: "독채",
      amenities: ["바다 전망", "와이파이", "주차", "취사 가능", "테라스"],
      photos: [],
      photoTheme: "ocean",
      hostName: "하준",
      hostBio: "제주에서 8년째 로컬 숙소를 운영하고 있습니다.",
      description: "서귀포 바다와 오름이 가까운 독채. 렌트카 여행에 적합합니다.",
    },
    {
      id: "home-6",
      name: "강릉 바다 보이는 loft",
      address: "강원 강릉시 ○○해변로 102",
      hostId: "host-e",
      status: "active",
      summary: "해변 도보 5분, 오션뷰 로프트",
      region: "강원",
      locationLabel: "강원 강릉",
      pricePerNight: 128000,
      rating: 4.88,
      reviewCount: 62,
      guests: 3,
      bedrooms: 1,
      beds: 2,
      baths: 1,
      propertyType: "로프트",
      amenities: ["오션뷰", "와이파이", "엘리베이터", "주차", "커피머신"],
      photos: [],
      photoTheme: "ocean",
      hostName: "수빈",
      hostBio: "강릉 로컬 가이드이자 숙소 호스트입니다.",
      description: "일출·해변 산책 후 돌아와 쉬기 좋은 오픈형 로프트입니다.",
    },
    {
      id: "home-7",
      name: "평창 숲속 A-frame",
      address: "강원 평창군 ○○면 ○○리 7",
      hostId: "host-f",
      status: "active",
      summary: "삼나무 숲 속 A-frame 통나무집",
      region: "강원",
      locationLabel: "강원 평창",
      pricePerNight: 165000,
      rating: 4.97,
      reviewCount: 41,
      guests: 4,
      bedrooms: 2,
      beds: 2,
      baths: 1,
      propertyType: "통나무집",
      amenities: ["벽난로", "와이파이", "주차", "숲 산책로", "바베큐"],
      photos: [],
      photoTheme: "mountain",
      hostName: "도윤",
      hostBio: "겨울 스포츠·힐링 스테이를 기획합니다.",
      description: "눈 내리는 겨울, 녹음 가득한 여름 모두 인기 있는 숲속 숙소입니다.",
    },
    {
      id: "home-8",
      name: "경주 황리단길 게스트하우스",
      address: "경북 경주시 황남동 ○○로 3",
      hostId: "host-c",
      status: "active",
      summary: "황리단길 도보 3분, 도미토리·개인실",
      region: "경북",
      locationLabel: "경북 경주",
      pricePerNight: 38000,
      rating: 4.71,
      reviewCount: 112,
      guests: 1,
      bedrooms: 1,
      beds: 1,
      baths: 1,
      propertyType: "게스트하우스",
      amenities: ["공용 주방", "와이파이", "세탁", "라운지", "자전거 대여"],
      photos: [],
      photoTheme: "hanok",
      hostName: "서연",
      hostBio: "배낭 여행객을 위한 편안한 공간을 만듭니다.",
      description: "혼행·친구 여행에 부담 없는 가격. 야경·유적지 산책에 최적입니다.",
    },
    {
      id: "home-9",
      name: "부산 광안리 스튜디오",
      address: "부산 수영구 광안해변로 ○○",
      hostId: "host-g",
      status: "active",
      summary: "광안대교 야경이 보이는 스튜디오",
      region: "부산",
      locationLabel: "부산 광안리",
      pricePerNight: 89000,
      rating: 4.83,
      reviewCount: 73,
      guests: 2,
      bedrooms: 1,
      beds: 1,
      baths: 1,
      propertyType: "아파트",
      amenities: ["야경", "와이파이", "엘리베이터", "주차", "근처 맛집"],
      photos: [],
      photoTheme: "sunset",
      hostName: "예린",
      hostBio: "부산 로컬 맛집·산책 코스를 안내해 드립니다.",
      description: "광안리 해변과 대교 야경을 즐기는 커플·친구 여행에 인기입니다.",
    },
    {
      id: "home-10",
      name: "여수 밤바다 펜션",
      address: "전남 여수시 ○○해안로 88",
      hostId: "host-b",
      status: "active",
      summary: "여수 밤바다 뷰, 가족형 펜션",
      region: "전남",
      locationLabel: "전남 여수",
      pricePerNight: 110000,
      rating: 4.76,
      reviewCount: 36,
      guests: 6,
      bedrooms: 3,
      beds: 4,
      baths: 2,
      propertyType: "펜션",
      amenities: ["바다 전망", "주방", "와이파이", "주차", "바베큐"],
      photos: [],
      photoTheme: "ocean",
      hostName: "지연",
      hostBio: "남해안 풍경을 살린 가족 숙소를 운영합니다.",
      description: "넓은 거실과 테라스에서 여수 밤바다를 감상할 수 있습니다.",
    },
    {
      id: "home-11",
      name: "춘천 남이섬 근처 캐빈",
      address: "강원 춘천시 ○○로 55",
      hostId: "host-f",
      status: "active",
      summary: "호수 근처 조용한 캐빈",
      region: "강원",
      locationLabel: "강원 춘천",
      pricePerNight: 78000,
      rating: 4.74,
      reviewCount: 28,
      guests: 3,
      bedrooms: 1,
      beds: 2,
      baths: 1,
      propertyType: "캐빈",
      amenities: ["호수 근처", "와이파이", "주차", "캠프파이어", "자전거"],
      photos: [],
      photoTheme: "forest",
      hostName: "도윤",
      hostBio: "춘천·남이섬 당일치기와 연계하기 좋습니다.",
      description: "닭갈비·막국수 맛집과 남이섬 보트 투어를 추천합니다.",
    },
    {
      id: "home-12",
      name: "안동 하회마을 한옥",
      address: "경북 안동시 풍천면 ○○리 2",
      hostId: "host-h",
      status: "active",
      summary: "하회마을 인근 전통 한옥 체류",
      region: "경북",
      locationLabel: "경북 안동",
      pricePerNight: 135000,
      rating: 4.91,
      reviewCount: 47,
      guests: 4,
      bedrooms: 2,
      beds: 2,
      baths: 1,
      propertyType: "한옥",
      amenities: ["한옥", "와이파이", "주차", "전통 체험", "정원"],
      photos: [],
      photoTheme: "hanok",
      hostName: "정호",
      hostBio: "하회탈·전통 문화 프로그램을 연결합니다.",
      description: "하회마을 산책과 안동찜·간고등어 맛집을 함께 즐겨 보세요.",
    },
    {
      id: "home-13",
      name: "속초 해변 근처 아파트",
      address: "강원 속초시 ○○해변로 201",
      hostId: "host-e",
      status: "active",
      summary: "속초 해변·중앙시장 도보권",
      region: "강원",
      locationLabel: "강원 속초",
      pricePerNight: 98000,
      rating: 4.8,
      reviewCount: 55,
      guests: 5,
      bedrooms: 2,
      beds: 3,
      baths: 1,
      propertyType: "아파트",
      amenities: ["해변 근처", "와이파이", "엘리베이터", "주차", "주방"],
      photos: [],
      photoTheme: "ocean",
      hostName: "수빈",
      hostBio: "속초 당근시장·아바이마을 코스를 안내합니다.",
      description: "가족 단위로 속초 해변과 시장을 누비기 좋은 아파트입니다.",
    },
    {
      id: "home-14",
      name: "남해 섬마을 독채",
      address: "경남 남해군 ○○면 ○○리 19",
      hostId: "host-i",
      status: "active",
      summary: "남해 바다와 섬 풍경이 보이는 독채",
      region: "경남",
      locationLabel: "경남 남해",
      pricePerNight: 102000,
      rating: 4.86,
      reviewCount: 33,
      guests: 4,
      bedrooms: 2,
      beds: 2,
      baths: 1,
      propertyType: "독채",
      amenities: ["바다 전망", "와이파이", "주차", "테라스", "조용한 마을"],
      photos: [],
      photoTheme: "rural",
      hostName: "유진",
      hostBio: "남해 드라이브·카페 투어를 좋아합니다.",
      description: "조용한 섬마을에서 며칠 머물며 바다와 숲을 오가기 좋습니다.",
    },
    {
      id: "home-15",
      name: "가평 북한강 글램핑",
      address: "경기 가평군 ○○면 ○○리 30",
      hostId: "host-j",
      status: "active",
      summary: "북한강 뷰 글램핑 텐트",
      region: "경기",
      locationLabel: "경기 가평",
      pricePerNight: 85000,
      rating: 4.72,
      reviewCount: 64,
      guests: 4,
      bedrooms: 1,
      beds: 2,
      baths: 1,
      propertyType: "글램핑",
      amenities: ["강 전망", "바베큐", "와이파이", "주차", "캠프파이어"],
      photos: [],
      photoTheme: "forest",
      hostName: "태희",
      hostBio: "서울 근교 1박 2일 힐링을 기획합니다.",
      description: "주말 캠핑 감성을 편의시설과 함께 즐길 수 있는 글램핑입니다.",
    },
    {
      id: "home-16",
      name: "보령 머드 축제 근처 스테이",
      address: "충남 보령시 ○○해안로 15",
      hostId: "host-k",
      status: "active",
      summary: "대천·보령 해안가 스테이",
      region: "충남",
      locationLabel: "충남 보령",
      pricePerNight: 69000,
      rating: 4.69,
      reviewCount: 22,
      guests: 4,
      bedrooms: 2,
      beds: 2,
      baths: 1,
      propertyType: "펜션",
      amenities: ["해변 근처", "와이파이", "주차", "주방", "세탁기"],
      photos: [],
      photoTheme: "ocean",
      hostName: "현우",
      hostBio: "서해안 해수욕·축제 시즌 숙소를 운영합니다.",
      description: "여름 해수욕·가을 드라이브에 적합한 해안가 펜션입니다.",
    },
    {
      id: "home-17",
      name: "통영 동피랑 언덕집",
      address: "경남 통영시 ○○로 9",
      hostId: "host-i",
      status: "active",
      summary: "동피랑 벽화마을 언덕 위 작은집",
      region: "경남",
      locationLabel: "경남 통영",
      pricePerNight: 92000,
      rating: 4.84,
      reviewCount: 39,
      guests: 3,
      bedrooms: 1,
      beds: 2,
      baths: 1,
      propertyType: "단독주택",
      amenities: ["마을 전망", "와이파이", "주차", "테라스", "근처 카페"],
      photos: [],
      photoTheme: "sunset",
      hostName: "유진",
      hostBio: "통영·거제 섬 여행 베이스로 추천합니다.",
      description: "동피랑 골목과 항구 야경을 걸으며 쉬기 좋은 언덕집입니다.",
    },
    {
      id: "home-18",
      name: "무주 리조트 근처 chalet",
      address: "전북 무주군 ○○로 77",
      hostId: "host-l",
      status: "paused",
      summary: "리조트 인근 스키·힐링 샬레 (시즌 준비)",
      region: "전북",
      locationLabel: "전북 무주",
      pricePerNight: 155000,
      rating: 4.9,
      reviewCount: 15,
      guests: 6,
      bedrooms: 3,
      beds: 4,
      baths: 2,
      propertyType: "샬레",
      amenities: ["스키장 근처", "벽난로", "와이파이", "주차", "주방"],
      photos: [],
      photoTheme: "mountain",
      hostName: "준혁",
      hostBio: "겨울 시즌 오픈을 준비 중입니다.",
      description: "무주 리조트·덕유산 연계 숙소. 현재 예약 불가(준비 중).",
    },
  ];

  var PROPERTY_MOCK = {
    "home-10": {
      photos: ["https://picsum.photos/seed/hangro-home-10-1/800/600", "https://picsum.photos/seed/hangro-home-10-2/800/600", "https://picsum.photos/seed/hangro-home-10-3/800/600", "https://picsum.photos/seed/hangro-home-10-4/800/600", "https://picsum.photos/seed/hangro-home-10-5/800/600"],
      highlights: ["가족 6인", "밤바다 뷰", "넓은 거실"],
      nearbyTips: ["오동도", "여수 밤바다"],
      descriptionExtra: "테라스에서 밤바다를 보며 쉬기 좋은 펜션입니다.",
    },
    "home-11": {
      photos: ["https://picsum.photos/seed/hangro-home-11-1/800/600", "https://picsum.photos/seed/hangro-home-11-2/800/600", "https://picsum.photos/seed/hangro-home-11-3/800/600", "https://picsum.photos/seed/hangro-home-11-4/800/600", "https://picsum.photos/seed/hangro-home-11-5/800/600"],
      highlights: ["호수 근처", "캠프파이어", "자전거"],
      nearbyTips: ["남이섬", "소양강스카이워크"],
      descriptionExtra: "닭갈비·막국수와 1박2일 코스에 좋습니다.",
    },
    "home-12": {
      photos: ["https://picsum.photos/seed/hangro-home-12-1/800/600", "https://picsum.photos/seed/hangro-home-12-2/800/600", "https://picsum.photos/seed/hangro-home-12-3/800/600", "https://picsum.photos/seed/hangro-home-12-4/800/600", "https://picsum.photos/seed/hangro-home-12-5/800/600"],
      highlights: ["하회마을 인근", "전통 체험", "정원"],
      nearbyTips: ["하회마을", "월영교"],
      descriptionExtra: "전통 마을과 안동 음식을 함께 즐기세요.",
    },
    "home-13": {
      photos: ["https://picsum.photos/seed/hangro-home-13-1/800/600", "https://picsum.photos/seed/hangro-home-13-2/800/600", "https://picsum.photos/seed/hangro-home-13-3/800/600", "https://picsum.photos/seed/hangro-home-13-4/800/600", "https://picsum.photos/seed/hangro-home-13-5/800/600"],
      highlights: ["중앙시장 도보", "해변 근처", "주방 완비"],
      nearbyTips: ["속초중앙시장", "아바이마을"],
      descriptionExtra: "가족이 시장·해변을 오가기 좋습니다.",
    },
    "home-14": {
      photos: ["https://picsum.photos/seed/hangro-home-14-1/800/600", "https://picsum.photos/seed/hangro-home-14-2/800/600", "https://picsum.photos/seed/hangro-home-14-3/800/600", "https://picsum.photos/seed/hangro-home-14-4/800/600", "https://picsum.photos/seed/hangro-home-14-5/800/600"],
      highlights: ["조용한 섬마을", "바다 전망", "드라이브 베이스"],
      nearbyTips: ["독일마을", "다랭이마을"],
      descriptionExtra: "남해안 드라이브 중간 거점으로 추천합니다.",
    },
    "home-15": {
      photos: ["https://picsum.photos/seed/hangro-home-15-1/800/600", "https://picsum.photos/seed/hangro-home-15-2/800/600", "https://picsum.photos/seed/hangro-home-15-3/800/600", "https://picsum.photos/seed/hangro-home-15-4/800/600", "https://picsum.photos/seed/hangro-home-15-5/800/600"],
      highlights: ["북한강 뷰", "글램핑", "서울 근교"],
      nearbyTips: ["남이섬", "쁘띠프랑스"],
      descriptionExtra: "캠핑 감성과 편의시설을 함께 누릴 수 있습니다.",
    },
    "home-16": {
      photos: ["https://picsum.photos/seed/hangro-home-16-1/800/600", "https://picsum.photos/seed/hangro-home-16-2/800/600", "https://picsum.photos/seed/hangro-home-16-3/800/600", "https://picsum.photos/seed/hangro-home-16-4/800/600", "https://picsum.photos/seed/hangro-home-16-5/800/600"],
      highlights: ["대천·보령 해안", "가족형", "축제 시즌"],
      nearbyTips: ["대천해수욕장", "머드축제장"],
      descriptionExtra: "여름 해수욕과 축제 시즌 예약이 많습니다.",
    },
    "home-17": {
      photos: ["https://picsum.photos/seed/hangro-home-17-1/800/600", "https://picsum.photos/seed/hangro-home-17-2/800/600", "https://picsum.photos/seed/hangro-home-17-3/800/600", "https://picsum.photos/seed/hangro-home-17-4/800/600", "https://picsum.photos/seed/hangro-home-17-5/800/600"],
      highlights: ["동피랑 언덕", "항구 야경", "카페 거리"],
      nearbyTips: ["동피랑", "케이블카"],
      descriptionExtra: "언덕 위에서 마을과 바다를 내려다봅니다.",
    },
    "home-18": {
      photos: ["https://picsum.photos/seed/hangro-home-18-1/800/600", "https://picsum.photos/seed/hangro-home-18-2/800/600", "https://picsum.photos/seed/hangro-home-18-3/800/600", "https://picsum.photos/seed/hangro-home-18-4/800/600", "https://picsum.photos/seed/hangro-home-18-5/800/600"],
      highlights: ["스키장 근처", "샬레", "시즌 준비"],
      nearbyTips: ["무주 리조트", "덕유산"],
      descriptionExtra: "겨울 시즌 오픈을 준비 중인 샬레입니다.",
    },
    "home-2": {
      photos: ["https://picsum.photos/seed/hangro-home-2-1/800/600", "https://picsum.photos/seed/hangro-home-2-2/800/600", "https://picsum.photos/seed/hangro-home-2-3/800/600", "https://picsum.photos/seed/hangro-home-2-4/800/600", "https://picsum.photos/seed/hangro-home-2-5/800/600"],
      highlights: ["논뷰 독채", "마을 끝 조용한 위치", "바베큐 테라스"],
      nearbyTips: ["순천만 국가정원", "순천 시내 맛집"],
      descriptionExtra: "1층 거실과 작은 주방이 있어 2인 체류에 최적입니다.",
    },
    "home-3": {
      photos: ["https://picsum.photos/seed/hangro-home-3-1/800/600", "https://picsum.photos/seed/hangro-home-3-2/800/600", "https://picsum.photos/seed/hangro-home-3-3/800/600", "https://picsum.photos/seed/hangro-home-3-4/800/600", "https://picsum.photos/seed/hangro-home-3-5/800/600"],
      highlights: ["학당 인근 한옥 감성", "리노베이션 예정", "담양 죽녹원 근접"],
      nearbyTips: ["담양 죽녹원", "메타세쿼이아길"],
      descriptionExtra: "옛 학당 뜰과 담장이 남아 있는 공간입니다.",
    },
    "home-4": {
      photos: ["https://picsum.photos/seed/hangro-home-4-1/800/600", "https://picsum.photos/seed/hangro-home-4-2/800/600", "https://picsum.photos/seed/hangro-home-4-3/800/600", "https://picsum.photos/seed/hangro-home-4-4/800/600", "https://picsum.photos/seed/hangro-home-4-5/800/600"],
      highlights: ["한옥마을 도보", "돌담 마당", "한복 체험 연계"],
      nearbyTips: ["경기전", "비빔밥 거리"],
      descriptionExtra: "대청마루와 마당이 있는 한옥으로 가족 여행에 인기입니다.",
    },
    "home-5": {
      photos: ["https://picsum.photos/seed/hangro-home-5-1/800/600", "https://picsum.photos/seed/hangro-home-5-2/800/600", "https://picsum.photos/seed/hangro-home-5-3/800/600", "https://picsum.photos/seed/hangro-home-5-4/800/600", "https://picsum.photos/seed/hangro-home-5-5/800/600"],
      highlights: ["돌담·감귤밭 뷰", "독채 전체", "렌트카 추천"],
      nearbyTips: ["쇠소깍", "천지연폭포"],
      descriptionExtra: "제주 감성의 돌담과 넓은 주방이 특징입니다.",
    },
    "home-6": {
      photos: ["https://picsum.photos/seed/hangro-home-6-1/800/600", "https://picsum.photos/seed/hangro-home-6-2/800/600", "https://picsum.photos/seed/hangro-home-6-3/800/600", "https://picsum.photos/seed/hangro-home-6-4/800/600", "https://picsum.photos/seed/hangro-home-6-5/800/600"],
      highlights: ["오션뷰 로프트", "해변 도보 5분", "커플 인기"],
      nearbyTips: ["경포대", "안목 커피거리"],
      descriptionExtra: "일출이 보이는 창과 오픈형 거실이 매력적입니다.",
    },
    "home-7": {
      photos: ["https://picsum.photos/seed/hangro-home-7-1/800/600", "https://picsum.photos/seed/hangro-home-7-2/800/600", "https://picsum.photos/seed/hangro-home-7-3/800/600", "https://picsum.photos/seed/hangro-home-7-4/800/600", "https://picsum.photos/seed/hangro-home-7-5/800/600"],
      highlights: ["A-frame 통나무", "벽난로", "숲 산책로"],
      nearbyTips: ["대관령", "알펜시아"],
      descriptionExtra: "겨울 눈꽃·여름 녹음 모두 인기 있는 숲속 숙소입니다.",
    },
    "home-8": {
      photos: ["https://picsum.photos/seed/hangro-home-8-1/800/600", "https://picsum.photos/seed/hangro-home-8-2/800/600", "https://picsum.photos/seed/hangro-home-8-3/800/600", "https://picsum.photos/seed/hangro-home-8-4/800/600", "https://picsum.photos/seed/hangro-home-8-5/800/600"],
      highlights: ["황리단길 3분", "가성비", "공용 라운지"],
      nearbyTips: ["첨성대", "황리단길 야경"],
      descriptionExtra: "배낭여행·혼행 게스트에게 사랑받는 공간입니다.",
    },
    "home-9": {
      photos: ["https://picsum.photos/seed/hangro-home-9-1/800/600", "https://picsum.photos/seed/hangro-home-9-2/800/600", "https://picsum.photos/seed/hangro-home-9-3/800/600", "https://picsum.photos/seed/hangro-home-9-4/800/600", "https://picsum.photos/seed/hangro-home-9-5/800/600"],
      highlights: ["광안대교 야경", "해변 도보", "커플 추천"],
      nearbyTips: ["광안리 해수욕장", "민락수변공원"],
      descriptionExtra: "창밖으로 대교 야경이 보이는 스튜디오입니다.",
    },
  };

  function enrichProperty(base) {
    if (!base) return null;
    if (base.id === "home-1") {
      return Object.assign({}, base, {
        highlights: base.highlights || [
          "행로 첫 유휴공간 재생 사례",
          "마을 산책로·작은 정원",
          "주방·세탁기 완비",
        ],
        nearbyTips: base.nearbyTips || [
          "포항 시내 차량 15분",
          "해맞이 숲길·해안 산책",
        ],
      });
    }
    var mock = PROPERTY_MOCK[base.id];
    if (!mock) return base;
    var desc = base.description || "";
    if (mock.descriptionExtra && desc.indexOf(mock.descriptionExtra) === -1) {
      desc = (desc.trim() + " " + mock.descriptionExtra).trim();
    }
    var merged = Object.assign({}, base, mock, { description: desc });
    delete merged.descriptionExtra;
    return merged;
  }

  /* 예약 목록 — guestId, propertyId, status(pending|confirmed|…) */
  var BOOKINGS = [
    {
      id: "b1",
      propertyId: "home-1",
      guestName: "김여행",
      guestId: "guest-demo",
      checkIn: "2026-05-20",
      checkOut: "2026-05-22",
      status: "confirmed",
      note: "늦은 체크인 가능 여부 문의 예정",
    },
    {
      id: "b2",
      propertyId: "home-5",
      guestName: "김여행",
      guestId: "guest-demo",
      checkIn: "2026-06-10",
      checkOut: "2026-06-13",
      status: "pending",
      note: "아기 침대 필요",
    },
    {
      id: "b3",
      propertyId: "home-2",
      guestName: "박체류",
      guestId: "guest-other",
      checkIn: "2026-02-10",
      checkOut: "2026-02-12",
      status: "done",
      note: "",
    },
    {
      id: "b4",
      propertyId: "home-9",
      guestName: "이숙박",
      guestId: "guest-other",
      checkIn: "2026-04-01",
      checkOut: "2026-04-03",
      status: "confirmed",
      note: "",
    },
    {
      id: "b5",
      propertyId: "home-1",
      guestName: "이예약",
      guestId: "guest-other",
      checkIn: "2026-05-25",
      checkOut: "2026-05-27",
      status: "pending",
      note: "주말 숙박 요청",
    },
  ];

  /* 문의함 — fromRole guest|host, propertyId, status open|replied */
  var MESSAGES = [
    {
      id: "m1",
      propertyId: "home-1",
      bookingId: "b1",
      fromRole: "guest",
      fromName: "김여행",
      subject: "체크인 시간 문의",
      body: "20일 저녁 9시쯤 도착 예정인데 가능할까요?",
      status: "open",
      createdAt: "2026-03-18",
    },
    {
      id: "m2",
      propertyId: "home-5",
      bookingId: "b2",
      fromRole: "guest",
      fromName: "김여행",
      subject: "아기 침대 문의",
      body: "6월 예약 건에 아기 침대 추가 가능할까요?",
      status: "open",
      createdAt: "2026-05-10",
    },
    {
      id: "m3",
      propertyId: "home-1",
      fromRole: "host",
      fromName: "집주인 A",
      subject: "Re: 체크인 시간",
      body: "9시 이후 도착 가능합니다. 미리 연락 주세요.",
      status: "replied",
      createdAt: "2026-03-18",
    },
  ];

  /* 체크인 안내 — propertyId별 Wi-Fi·주차 등 */
  var STAY_GUIDE = {
    "home-1": {
      checkIn: "15:00 이후 (사전 협의 시 유연)",
      checkOut: "11:00",
      wifi: "행로_Guest / 안내 카드 참고",
      parking: "마당 1대 (추가 차량은 사전 문의)",
      rules: "22시 이후 정숙, 실내 금연, 분리수거 준수",
      contact: "010-0000-0001 (민수)",
    },
    "home-10": {
      checkIn: "15:00",
      checkOut: "10:00",
      wifi: "Yeosu_NightSea",
      parking: "펜션 앞 2대",
      rules: "테라스 바베큐 후 정리 · 23시 이후 정숙",
      contact: "010-0000-0010 (지연)",
    },
    "home-11": {
      checkIn: "15:00",
      checkOut: "11:00",
      wifi: "Chuncheon_Cabin",
      parking: "캐빈 앞 1대",
      rules: "캠프파이어 구역만 사용 · 야외 소음 주의",
      contact: "010-0000-0011 (도윤)",
    },
    "home-12": {
      checkIn: "15:00",
      checkOut: "10:00",
      wifi: "Hahoe_Hanok",
      parking: "한옥 앞 1대",
      rules: "한옥 내 화기 주의 · 전통 마을 규칙 준수",
      contact: "010-0000-0012 (정호)",
    },
    "home-13": {
      checkIn: "15:00",
      checkOut: "11:00",
      wifi: "Sokcho_Beach",
      parking: "아파트 지하",
      rules: "건물 관리규정 준수 · 22시 이후 정숙",
      contact: "010-0000-0013 (수빈)",
    },
    "home-14": {
      checkIn: "15:00",
      checkOut: "11:00",
      wifi: "Namhae_Village",
      parking: "독채 앞 1대",
      rules: "마을 정숙 시간 22시 · 바다 안전 유의",
      contact: "010-0000-0014 (유진)",
    },
    "home-15": {
      checkIn: "15:00",
      checkOut: "11:00",
      wifi: "Gapyeong_Glamp",
      parking: "글램핑장 내",
      rules: "텐트 화기 규정 준수 · 23시 이후 정숙",
      contact: "010-0000-0015 (태희)",
    },
    "home-16": {
      checkIn: "15:00",
      checkOut: "11:00",
      wifi: "Boryeong_Stay",
      parking: "펜션 앞 2대",
      rules: "해수욕장 쓰레기 반출 · 실내 금연",
      contact: "010-0000-0016 (현우)",
    },
    "home-17": {
      checkIn: "15:00",
      checkOut: "11:00",
      wifi: "Tongyeong_Hill",
      parking: "언덕길 1대 (경사 주의)",
      rules: "언덕 주차 브레이크 확인 · 22시 정숙",
      contact: "010-0000-0017 (유진)",
    },
    "home-18": {
      checkIn: "시즌 오픈 후 안내",
      checkOut: "시즌 오픈 후 안내",
      wifi: "준비 중",
      parking: "샬레 앞 (오픈 후)",
      rules: "현재 예약 불가",
      contact: "010-0000-0018 (준혁)",
    },
    "home-2": {
      checkIn: "15:00 이후",
      checkOut: "11:00",
      wifi: "SmallHouse_Guest / 현관 안내",
      parking: "마을 입구 공용 주차장 1대",
      rules: "22시 이후 정숙 · 야외 화기 주의",
      contact: "010-0000-0002 (지연)",
    },
    "home-3": {
      checkIn: "오픈 후 안내",
      checkOut: "오픈 후 안내",
      wifi: "준비 중",
      parking: "인근 공용 주차",
      rules: "현재 예약 불가 · 오픈 전 출입 금지",
      contact: "010-0000-0001 (민수)",
    },
    "home-4": {
      checkIn: "15:00 이후",
      checkOut: "10:00",
      wifi: "HanokStay_24",
      parking: "인근 공영주차 (호스트 안내)",
      rules: "마당 금연 · 22시 이후 정숙",
      contact: "010-0000-0004 (서연)",
    },
    "home-5": {
      checkIn: "16:00",
      checkOut: "10:00",
      wifi: "Jeju_Stone_Wall",
      parking: "돌담 앞 1대",
      rules: "실내 금연 · 감귤밭 출입 금지",
      contact: "010-0000-0005 (하준)",
    },
    "home-6": {
      checkIn: "15:00 이후",
      checkOut: "11:00",
      wifi: "Gangneung_Loft",
      parking: "건물 지하 (호스트 안내)",
      rules: "22시 이후 정숙 · 쓰레기 분리배출",
      contact: "010-0000-0006 (수빈)",
    },
    "home-7": {
      checkIn: "16:00",
      checkOut: "11:00",
      wifi: "Pyeongchang_Aframe",
      parking: "통나무집 앞 2대",
      rules: "벽난로 사용법 숙지 · 숲 화기 주의",
      contact: "010-0000-0007 (도윤)",
    },
    "home-8": {
      checkIn: "14:00 이후",
      checkOut: "11:00",
      wifi: "Gyeongju_GH / 프런트",
      parking: "근처 유료 주차 (안내)",
      rules: "도미토리 공용공간 정숙 · 개인실 금연",
      contact: "010-0000-0008 (서연)",
    },
    "home-9": {
      checkIn: "15:00",
      checkOut: "11:00",
      wifi: "Gwangalli_View",
      parking: "건물 지하 (호스트 안내)",
      rules: "22시 이후 정숙 · 쓰레기 분리배출",
      contact: "010-0000-0009 (예린)",
    },
  };

  var NOTICES = [
    {
      id: "n1",
      title: "봄 시즌 운영 안내",
      body: "3월부터 체크인 안내 문자가 발송됩니다.",
      date: "2026-03-01",
    },
    {
      id: "n2",
      title: "archive 기록 페이지 업데이트",
      body: "첫 유휴공간 프로젝트 전·후 비교를 확인할 수 있습니다.",
      date: "2026-02-20",
    },
  ];

  var PROPERTY_EDITS_KEY = "hangro_host_property_edits";

  function loadPropertyEdits() {
    try {
      return JSON.parse(global.localStorage.getItem(PROPERTY_EDITS_KEY) || "{}");
    } catch (e) {
      return {};
    }
  }

  function mergeProperty(base) {
    if (!base) return null;
    var edit = loadPropertyEdits()[base.id];
    if (!edit) return base;
    var merged = Object.assign({}, base, edit);
    if (edit.photos !== undefined) merged.photos = edit.photos;
    if (edit.amenities !== undefined) merged.amenities = edit.amenities;
    return merged;
  }

  /* 후기 분포·항목별 점수·카드 (게스트 listing 후기 블록) */
  var REVIEWS = {
    "home-1": {"distribution": [0, 0, 0, 3, 24], "categories": [{"label": "청결도", "score": 4.95}, {"label": "정확성", "score": 4.9}, {"label": "체크인", "score": 4.88}, {"label": "의사소통", "score": 4.92}, {"label": "가성비", "score": 4.85}, {"label": "위치", "score": 4.8}], "items": [{"author": "이서연", "date": "2026-04", "rating": 5, "tripType": "커플", "text": "마을 산책하기 좋고 실내가 깔끔했어요. 사진보다 더 아늑했습니다."}, {"author": "박준호", "date": "2026-03", "rating": 5, "tripType": "친구", "text": "호스트님이 친절하고 체크인 안내가 명확했습니다."}, {"author": "김하늘", "date": "2026-02", "rating": 4, "tripType": "가족", "text": "아이와 함께 묵기 좋아요. 주방이 잘 갖춰져 있었어요."}]},
    "home-10": {"distribution": [0, 0, 1, 4, 28], "categories": [{"label": "청결도", "score": 4.74}, {"label": "위치", "score": 4.71}, {"label": "체크인", "score": 4.76}, {"label": "의사소통", "score": 4.75}, {"label": "가성비", "score": 4.68}], "items": [{"author": "이여행", "date": "2026-03", "rating": 5, "tripType": "커플", "text": "사진과 같고 체크인이 편했습니다."}, {"author": "최휴식", "date": "2026-02", "rating": 4, "tripType": "가족", "text": "가격 대비 만족스러웠어요."}]},
    "home-11": {"distribution": [0, 0, 0, 3, 22], "categories": [{"label": "청결도", "score": 4.72}, {"label": "위치", "score": 4.69}, {"label": "체크인", "score": 4.74}, {"label": "의사소통", "score": 4.73}, {"label": "가성비", "score": 4.66}], "items": [{"author": "이여행", "date": "2026-03", "rating": 5, "tripType": "커플", "text": "사진과 같고 체크인이 편했습니다."}, {"author": "최휴식", "date": "2026-02", "rating": 4, "tripType": "가족", "text": "가격 대비 만족스러웠어요."}]},
    "home-12": {"distribution": [0, 0, 1, 5, 37], "categories": [{"label": "청결도", "score": 4.89}, {"label": "위치", "score": 4.86}, {"label": "체크인", "score": 4.91}, {"label": "의사소통", "score": 4.9}, {"label": "가성비", "score": 4.83}], "items": [{"author": "이여행", "date": "2026-03", "rating": 5, "tripType": "커플", "text": "사진과 같고 체크인이 편했습니다."}, {"author": "최휴식", "date": "2026-02", "rating": 4, "tripType": "가족", "text": "가격 대비 만족스러웠어요."}]},
    "home-13": {"distribution": [0, 0, 1, 6, 44], "categories": [{"label": "청결도", "score": 4.78}, {"label": "위치", "score": 4.75}, {"label": "체크인", "score": 4.8}, {"label": "의사소통", "score": 4.79}, {"label": "가성비", "score": 4.72}], "items": [{"author": "이여행", "date": "2026-03", "rating": 5, "tripType": "커플", "text": "사진과 같고 체크인이 편했습니다."}, {"author": "최휴식", "date": "2026-02", "rating": 4, "tripType": "가족", "text": "가격 대비 만족스러웠어요."}]},
    "home-14": {"distribution": [0, 0, 0, 3, 26], "categories": [{"label": "청결도", "score": 4.84}, {"label": "위치", "score": 4.81}, {"label": "체크인", "score": 4.86}, {"label": "의사소통", "score": 4.85}, {"label": "가성비", "score": 4.78}], "items": [{"author": "이여행", "date": "2026-03", "rating": 5, "tripType": "커플", "text": "사진과 같고 체크인이 편했습니다."}, {"author": "최휴식", "date": "2026-02", "rating": 4, "tripType": "가족", "text": "가격 대비 만족스러웠어요."}]},
    "home-15": {"distribution": [0, 0, 1, 7, 51], "categories": [{"label": "청결도", "score": 4.7}, {"label": "위치", "score": 4.67}, {"label": "체크인", "score": 4.72}, {"label": "의사소통", "score": 4.71}, {"label": "가성비", "score": 4.64}], "items": [{"author": "이여행", "date": "2026-03", "rating": 5, "tripType": "커플", "text": "사진과 같고 체크인이 편했습니다."}, {"author": "최휴식", "date": "2026-02", "rating": 4, "tripType": "가족", "text": "가격 대비 만족스러웠어요."}]},
    "home-16": {"distribution": [0, 0, 0, 2, 17], "categories": [{"label": "청결도", "score": 4.67}, {"label": "위치", "score": 4.64}, {"label": "체크인", "score": 4.69}, {"label": "의사소통", "score": 4.68}, {"label": "가성비", "score": 4.61}], "items": [{"author": "이여행", "date": "2026-03", "rating": 5, "tripType": "커플", "text": "사진과 같고 체크인이 편했습니다."}, {"author": "최휴식", "date": "2026-02", "rating": 4, "tripType": "가족", "text": "가격 대비 만족스러웠어요."}]},
    "home-17": {"distribution": [0, 0, 1, 4, 31], "categories": [{"label": "청결도", "score": 4.82}, {"label": "위치", "score": 4.79}, {"label": "체크인", "score": 4.84}, {"label": "의사소통", "score": 4.83}, {"label": "가성비", "score": 4.76}], "items": [{"author": "이여행", "date": "2026-03", "rating": 5, "tripType": "커플", "text": "사진과 같고 체크인이 편했습니다."}, {"author": "최휴식", "date": "2026-02", "rating": 4, "tripType": "가족", "text": "가격 대비 만족스러웠어요."}]},
    "home-18": {"distribution": [0, 0, 0, 1, 12], "categories": [{"label": "청결도", "score": 4.88}, {"label": "위치", "score": 4.85}, {"label": "체크인", "score": 4.9}, {"label": "의사소통", "score": 4.89}, {"label": "가성비", "score": 4.82}], "items": [{"author": "이여행", "date": "2026-03", "rating": 5, "tripType": "커플", "text": "사진과 같고 체크인이 편했습니다."}, {"author": "최휴식", "date": "2026-02", "rating": 4, "tripType": "가족", "text": "가격 대비 만족스러웠어요."}]},
    "home-2": {"distribution": [0, 0, 0, 2, 15], "categories": [{"label": "청결도", "score": 4.76}, {"label": "위치", "score": 4.73}, {"label": "체크인", "score": 4.78}, {"label": "의사소통", "score": 4.77}, {"label": "가성비", "score": 4.7}], "items": [{"author": "한지우", "date": "2026-03", "rating": 5, "tripType": "커플", "text": "논뷰가 예쁘고 조용해서 힐링됐어요."}, {"author": "오세린", "date": "2026-01", "rating": 4, "tripType": "나홀로", "text": "주차·와이파이 모두 문제없었습니다."}]},
    "home-3": {"distribution": [0, 0, 0, 1, 6], "categories": [{"label": "청결도", "score": 4.63}, {"label": "위치", "score": 4.6}, {"label": "체크인", "score": 4.65}, {"label": "의사소통", "score": 4.64}, {"label": "가성비", "score": 4.57}], "items": [{"author": "이여행", "date": "2026-03", "rating": 5, "tripType": "커플", "text": "사진과 같고 체크인이 편했습니다."}, {"author": "최휴식", "date": "2026-02", "rating": 4, "tripType": "가족", "text": "가격 대비 만족스러웠어요."}]},
    "home-4": {"distribution": [0, 0, 1, 6, 43], "categories": [{"label": "청결도", "score": 4.87}, {"label": "위치", "score": 4.84}, {"label": "체크인", "score": 4.89}, {"label": "의사소통", "score": 4.88}, {"label": "가성비", "score": 4.81}], "items": [{"author": "이여행", "date": "2026-03", "rating": 5, "tripType": "커플", "text": "사진과 같고 체크인이 편했습니다."}, {"author": "최휴식", "date": "2026-02", "rating": 4, "tripType": "가족", "text": "가격 대비 만족스러웠어요."}]},
    "home-5": {"distribution": [0, 0, 2, 10, 69], "categories": [{"label": "청결도", "score": 4.96}, {"label": "전망", "score": 4.98}, {"label": "체크인", "score": 4.9}, {"label": "의사소통", "score": 4.94}, {"label": "가성비", "score": 4.88}, {"label": "위치", "score": 4.92}], "items": [{"author": "최유나", "date": "2026-02", "rating": 5, "tripType": "커플", "text": "돌담과 감귤밭 뷰가 정말 제주스러웠어요."}, {"author": "정우진", "date": "2026-01", "rating": 5, "tripType": "나홀로", "text": "조용해서 힐링하기 좋았습니다."}, {"author": "강제주", "date": "2025-12", "rating": 5, "tripType": "가족", "text": "아이들이 마당을 좋아했어요."}]},
    "home-6": {"distribution": [0, 0, 1, 7, 49], "categories": [{"label": "청결도", "score": 4.86}, {"label": "위치", "score": 4.83}, {"label": "체크인", "score": 4.88}, {"label": "의사소통", "score": 4.87}, {"label": "가성비", "score": 4.8}], "items": [{"author": "이여행", "date": "2026-03", "rating": 5, "tripType": "커플", "text": "사진과 같고 체크인이 편했습니다."}, {"author": "최휴식", "date": "2026-02", "rating": 4, "tripType": "가족", "text": "가격 대비 만족스러웠어요."}]},
    "home-7": {"distribution": [0, 0, 1, 4, 32], "categories": [{"label": "청결도", "score": 4.95}, {"label": "위치", "score": 4.92}, {"label": "체크인", "score": 4.97}, {"label": "의사소통", "score": 4.96}, {"label": "가성비", "score": 4.89}], "items": [{"author": "이여행", "date": "2026-03", "rating": 5, "tripType": "커플", "text": "사진과 같고 체크인이 편했습니다."}, {"author": "최휴식", "date": "2026-02", "rating": 4, "tripType": "가족", "text": "가격 대비 만족스러웠어요."}]},
    "home-8": {"distribution": [0, 0, 3, 13, 89], "categories": [{"label": "청결도", "score": 4.69}, {"label": "위치", "score": 4.66}, {"label": "체크인", "score": 4.71}, {"label": "의사소통", "score": 4.7}, {"label": "가성비", "score": 4.63}], "items": [{"author": "이여행", "date": "2026-03", "rating": 5, "tripType": "커플", "text": "사진과 같고 체크인이 편했습니다."}, {"author": "최휴식", "date": "2026-02", "rating": 4, "tripType": "가족", "text": "가격 대비 만족스러웠어요."}]},
    "home-9": {"distribution": [0, 0, 2, 8, 58], "categories": [{"label": "청결도", "score": 4.82}, {"label": "전망", "score": 4.95}, {"label": "체크인", "score": 4.8}, {"label": "의사소통", "score": 4.85}, {"label": "가성비", "score": 4.78}, {"label": "위치", "score": 4.9}], "items": [{"author": "정민지", "date": "2026-01", "rating": 5, "tripType": "커플", "text": "광안대교 야경이 창문으로 보여서 만족!"}, {"author": "송부산", "date": "2025-11", "rating": 4, "tripType": "친구", "text": "위치 최고, 주말엔 주변이 붐벼요."}]},
  };

  function defaultReviewBundle(property) {
    var count = property.reviewCount || 0;
    var r = property.rating || 4.8;
    return {
      distribution: [0, 0, Math.max(1, Math.round(count * 0.05)), Math.max(1, Math.round(count * 0.15)), Math.max(1, Math.round(count * 0.75))],
      categories: [
        { label: "청결도", score: r },
        { label: "위치", score: Math.max(4, r - 0.05) },
        { label: "체크인", score: r },
        { label: "의사소통", score: r },
        { label: "가성비", score: Math.max(4, r - 0.1) },
      ],
      items: [
        { author: "방문객", date: "2026-03", rating: Math.round(r), tripType: "체류", text: "깔끔하고 호스트 응대가 빨랐어요." },
        { author: "여행자", date: "2026-01", rating: Math.max(4, Math.round(r) - 1), tripType: "커플", text: "위치·가격 대비 만족스러운 숙소였습니다." },
      ],
    };
  }

  var DEMO_GUEST_ID = "guest-demo";  // 게스트 데모 계정
  var DEMO_HOST_ID = "host-a";       // 집주인 데모 계정 (host-app)

  /* 게스트/집주인/ops 앱이 호출하는 조회·필터 API */
  global.PORTAL_DATA = {
    properties: PROPERTIES,
    bookings: BOOKINGS,
    messages: MESSAGES,
    stayGuide: STAY_GUIDE,
    notices: NOTICES,
    demoGuestId: DEMO_GUEST_ID,
    demoHostId: DEMO_HOST_ID,
    getProperty: function (id) {
      var base = PROPERTIES.find(function (p) {
        return p.id === id;
      });
      return mergeProperty(enrichProperty(base));
    },
    getStayGuide: function (propertyId) {
      var base = STAY_GUIDE[propertyId];
      var edit = loadPropertyEdits()[propertyId];
      if (edit && edit.stayGuide) {
        return Object.assign({}, base || {}, edit.stayGuide);
      }
      return base;
    },
    savePropertyEdit: function (id, patch) {
      var all = loadPropertyEdits();
      var prev = all[id] || {};
      var next = Object.assign({}, prev, patch);
      if (patch.stayGuide) {
        next.stayGuide = Object.assign({}, prev.stayGuide || {}, patch.stayGuide);
      }
      all[id] = next;
      try {
        global.localStorage.setItem(PROPERTY_EDITS_KEY, JSON.stringify(all));
      } catch (e) {}
    },
    reviewsForProperty: function (id) {
      var p = mergeProperty(
        PROPERTIES.find(function (x) {
          return x.id === id;
        })
      );
      var custom = loadPropertyEdits()[id];
      var base = REVIEWS[id] || defaultReviewBundle(p || { rating: 4.8, reviewCount: 0 });
      var bundle = JSON.parse(JSON.stringify(base));
      bundle.rating = p ? p.rating : 4.8;
      bundle.count = p ? p.reviewCount : 0;
      if (custom && custom.reviewItems && custom.reviewItems.length) {
        bundle.items = custom.reviewItems.concat(bundle.items);
      }
      return bundle;
    },
    listBookable: function () {
      return PROPERTIES.map(function (p) { return mergeProperty(enrichProperty(p)); }).filter(function (p) {
        return p && p.status === "active";
      });
    },
    formatPrice: function (n) {
      return "₩" + Number(n).toLocaleString("ko-KR");
    },
    getBooking: function (id) {
      return BOOKINGS.find(function (b) {
        return b.id === id;
      });
    },
    bookingsForGuest: function (guestId) {
      return BOOKINGS.filter(function (b) {
        return b.guestId === guestId;
      });
    },
    bookingsForHost: function (hostId) {
      var ids = PROPERTIES.filter(function (p) {
        return p.hostId === hostId;
      }).map(function (p) {
        return p.id;
      });
      return BOOKINGS.filter(function (b) {
        return ids.indexOf(b.propertyId) !== -1;
      });
    },
    messagesForPropertyIds: function (propertyIds) {
      return MESSAGES.filter(function (m) {
        return propertyIds.indexOf(m.propertyId) !== -1;
      });
    },
    messagesForGuest: function (guestId) {
      var trips = BOOKINGS.filter(function (b) {
        return b.guestId === guestId;
      });
      var propIds = trips.map(function (b) {
        return b.propertyId;
      });
      return MESSAGES.filter(function (m) {
        return m.fromRole === "guest" || propIds.indexOf(m.propertyId) !== -1;
      });
    },

    listHosts: function () {
      var seen = {};
      var out = [];
      PROPERTIES.forEach(function (p) {
        if (!p.hostId || seen[p.hostId]) return;
        seen[p.hostId] = true;
        var props = PROPERTIES.filter(function (x) { return x.hostId === p.hostId; });
        var active = props.filter(function (x) { return x.status === "active"; }).length;
        out.push({
          id: p.hostId,
          name: p.hostName || ("집주인 " + p.hostId.replace("host-", "").toUpperCase()),
          propertyCount: props.length,
          activeCount: active,
          region: props[0] && props[0].locationLabel ? props[0].locationLabel.split("·")[0].trim() : "",
        });
      });
      return out;
    },
    listGuests: function () {
      var seen = {};
      var out = [];
      BOOKINGS.forEach(function (b) {
        var gid = b.guestId || b.guestName;
        if (!gid || seen[gid]) return;
        seen[gid] = true;
        var trips = BOOKINGS.filter(function (x) {
          return (x.guestId && x.guestId === b.guestId) || x.guestName === b.guestName;
        });
        out.push({
          id: b.guestId || gid,
          name: b.guestName || "게스트",
          tripCount: trips.length,
          lastTrip: trips[trips.length - 1],
        });
      });
      try {
        var extra = JSON.parse(global.localStorage.getItem("hangro_guest_trips") || "[]");
        extra.forEach(function (t) {
          var gid = t.guestId || "guest-demo";
          if (seen[gid]) return;
          seen[gid] = true;
          out.push({ id: gid, name: t.guestName || "게스트", tripCount: 1, lastTrip: t });
        });
      } catch (e) {}
      return out;
    },
    openMessagesCount: function (propertyIds) {
      return MESSAGES.filter(function (m) {
        return propertyIds.indexOf(m.propertyId) !== -1 && m.status === "open";
      }).length;
    },
  };
})(typeof window !== "undefined" ? window : global);
