/**
 * 포털 데이터 (PORTAL_DATA)
 * ─────────────────────────────────────────────────────────────
 * data/places.json 과 동일한 포항 흥해 죽천길 5곳만 유지합니다.
 * 예약·메시지·후기는 실데이터가 생기기 전까지 비워 두며, UI는 localStorage/API로 채웁니다.
 */
(function (global) {
  "use strict";

  var PROPERTIES = [
    {
      id: "home-1",
      name: "죽천길 85 · 첫 번째 유휴공간",
      address: "경상북도 포항시 북구 흥해읍 죽천길 85",
      lat: 36.0898783667699,
      lng: 129.418860149057,
      placeId: "sakjeon-hanok",
      hostId: "host-a",
      status: "active",
      summary: "행로 첫 유휴공간 재생 프로젝트",
      region: "경북",
      locationLabel: "경북 포항 흥해",
      pricePerNight: 0,
      rating: 0,
      reviewCount: 0,
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
      hostName: "행로",
      hostBio: "포항 흥해 죽천길 유휴공간 재생을 진행합니다.",
      description:
        "장기간 사용되지 않던 공간을 지역 브랜드·체류 수요에 맞춰 숙박·체험 콘셉트로 재기획 중입니다.",
      highlights: [
        "행로 첫 유휴공간 재생 사례",
        "죽천길 일대 거리 재생",
        "현장 전·후 기록 공개",
      ],
      nearbyTips: ["포항 시내", "흥해읍 마을 산책"],
    },
    {
      id: "home-2",
      name: "죽천길 75",
      address: "경상북도 포항시 북구 흥해읍 죽천길 75",
      lat: 36.0890144516567,
      lng: 129.418185069177,
      placeId: "jookcheon-75",
      hostId: "host-a",
      status: "paused",
      summary: "죽천길 일대 유휴 공간 재생 후보",
      region: "경북",
      locationLabel: "경북 포항 흥해",
      pricePerNight: 0,
      rating: 0,
      reviewCount: 0,
      guests: 2,
      bedrooms: 1,
      beds: 1,
      baths: 1,
      propertyType: "독채",
      amenities: ["와이파이", "주차"],
      photos: ["../Asset/Home_1/after/Home_1_after_08.jpeg"],
      hostName: "행로",
      hostBio: "포항 흥해 죽천길 유휴공간 재생을 진행합니다.",
      description:
        "죽천길 거리 인근에서 사용되지 않던 공간입니다. 85·87번지와 함께 거리 단위 재생을 검토 중입니다.",
      highlights: ["죽천길 75번지", "실측 좌표 반영", "재생 검토 중"],
      nearbyTips: ["죽천길 85", "죽천길 87"],
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
      pricePerNight: 0,
      rating: 0,
      reviewCount: 0,
      guests: 3,
      bedrooms: 1,
      beds: 2,
      baths: 1,
      propertyType: "게스트룸",
      amenities: ["와이파이"],
      photos: ["../Asset/Home_1/after/Home_1_after_12.jpeg"],
      hostName: "행로",
      hostBio: "포항 흥해 죽천길 유휴공간 재생을 진행합니다.",
      description:
        "185번길 골목 안쪽 유휴 공간입니다. 11번지와 함께 골목 단위 재생을 검토합니다.",
      highlights: ["죽천길185번길 14", "골목 재생 후보", "실측 좌표 반영"],
      nearbyTips: ["죽천길185번길 11"],
    },
    {
      id: "home-4",
      name: "죽천길185번길 11",
      address: "경상북도 포항시 북구 흥해읍 죽천길185번길 11",
      lat: 36.0962712455684,
      lng: 129.426465569796,
      placeId: "jookcheon185-11",
      hostId: "host-a",
      status: "paused",
      summary: "185번길 14번지 인접 재생 공간",
      region: "경북",
      locationLabel: "경북 포항 흥해",
      pricePerNight: 0,
      rating: 0,
      reviewCount: 0,
      guests: 3,
      bedrooms: 1,
      beds: 2,
      baths: 1,
      propertyType: "단독주택",
      amenities: ["와이파이", "주차"],
      photos: ["../Asset/Home_1/after/Home_1_after_08.jpeg"],
      hostName: "행로",
      hostBio: "포항 흥해 죽천길 유휴공간 재생을 진행합니다.",
      description:
        "185번길 14번지와 인접한 유휴 공간입니다. 실측 좌표를 지도·기록에 반영했습니다.",
      highlights: ["죽천길185번길 11", "14번지 인접", "실측 좌표 반영"],
      nearbyTips: ["죽천길185번길 14"],
    },
    {
      id: "home-5",
      name: "죽천길 87",
      address: "경상북도 포항시 북구 흥해읍 죽천길 87",
      lat: 36.0897339289562,
      lng: 129.419119468369,
      placeId: "jookcheon-87",
      hostId: "host-a",
      status: "paused",
      summary: "죽천길 75·85와 연계된 재생 공간",
      region: "경북",
      locationLabel: "경북 포항 흥해",
      pricePerNight: 0,
      rating: 0,
      reviewCount: 0,
      guests: 3,
      bedrooms: 1,
      beds: 2,
      baths: 1,
      propertyType: "독채",
      amenities: ["와이파이", "주차"],
      photos: ["../Asset/Home_1/after/Home_1_after_09.jpeg"],
      hostName: "행로",
      hostBio: "포항 흥해 죽천길 유휴공간 재생을 진행합니다.",
      description:
        "75·85·87번지와 연계된 죽천길 거리 재생 대상입니다. 실측 좌표를 지도에 반영했습니다.",
      highlights: ["죽천길 87번지", "죽천길 거리 재생", "실측 좌표 반영"],
      nearbyTips: ["죽천길 75", "죽천길 85"],
    },
  ];

  var BOOKINGS = [];
  var MESSAGES = [];
  var REVIEWS = {};

  var STAY_GUIDE = {
    "home-1": {
      checkIn: "운영 확정 후 안내",
      checkOut: "운영 확정 후 안내",
      wifi: "준비 중",
      parking: "현장 협의 후 안내",
      rules: "재생·운영 세부 사항은 현장 협의 후 확정",
      contact: "projecthangrow@gmail.com",
    },
    "home-2": {
      checkIn: "재생 검토 중",
      checkOut: "재생 검토 중",
      wifi: "준비 중",
      parking: "현장 협의 후 안내",
      rules: "현재 예약 불가",
      contact: "projecthangrow@gmail.com",
    },
    "home-3": {
      checkIn: "재생 검토 중",
      checkOut: "재생 검토 중",
      wifi: "준비 중",
      parking: "현장 협의 후 안내",
      rules: "현재 예약 불가",
      contact: "projecthangrow@gmail.com",
    },
    "home-4": {
      checkIn: "재생 검토 중",
      checkOut: "재생 검토 중",
      wifi: "준비 중",
      parking: "현장 협의 후 안내",
      rules: "현재 예약 불가",
      contact: "projecthangrow@gmail.com",
    },
    "home-5": {
      checkIn: "재생 검토 중",
      checkOut: "재생 검토 중",
      wifi: "준비 중",
      parking: "현장 협의 후 안내",
      rules: "현재 예약 불가",
      contact: "projecthangrow@gmail.com",
    },
  };

  var NOTICES = [
    {
      id: "n1",
      title: "죽천길 5곳 좌표 반영",
      body: "지도·기록·포털에 포항 흥해 죽천길 실측 좌표 5곳을 반영했습니다.",
      date: "2026-05-19",
    },
    {
      id: "n2",
      title: "archive 기록 페이지",
      body: "첫 유휴공간(죽천길 85) 프로젝트 전·후 비교를 확인할 수 있습니다.",
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

  function emptyReviewBundle(property) {
    return {
      distribution: [0, 0, 0, 0, 0],
      categories: [],
      items: [],
      rating: property && property.rating ? property.rating : 0,
      count: property && property.reviewCount ? property.reviewCount : 0,
    };
  }

  var DEMO_GUEST_ID = "guest-demo";
  var DEMO_HOST_ID = "host-a";

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
      return mergeProperty(base);
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
      var base = REVIEWS[id] || emptyReviewBundle(p);
      var bundle = JSON.parse(JSON.stringify(base));
      bundle.rating = p ? p.rating : 0;
      bundle.count = p ? p.reviewCount : 0;
      if (custom && custom.reviewItems && custom.reviewItems.length) {
        bundle.items = custom.reviewItems.concat(bundle.items);
      }
      return bundle;
    },
    listBrowsable: function () {
      return PROPERTIES.map(function (p) {
        return mergeProperty(p);
      }).filter(function (p) {
        return p && (p.status === "active" || p.status === "paused");
      });
    },
    listBookable: function () {
      return this.listBrowsable().filter(function (p) {
        return p.status === "active";
      });
    },
    formatPrice: function (n) {
      if (n == null || n === 0) return "가격 협의";
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
        var props = PROPERTIES.filter(function (x) {
          return x.hostId === p.hostId;
        });
        var active = props.filter(function (x) {
          return x.status === "active";
        }).length;
        out.push({
          id: p.hostId,
          name: p.hostName || "행로",
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
