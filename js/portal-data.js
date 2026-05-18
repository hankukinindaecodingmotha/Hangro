/**
 * 포털 목업 데이터 (데모·정적 UI용). 추후 API 응답으로 교체.
 */
(function (global) {
  "use strict";

  var PROPERTIES = [
    {
      id: "home-1",
      name: "첫 번째 유후공간",
      address: "전남 ○○군 ○○면 ○○리 12",
      hostId: "host-a",
      status: "active",
      summary: "우드·화이트 톤으로 정리한 유후시설 재생 숙소",
    },
    {
      id: "home-2",
      name: "마을 끝 작은채",
      address: "전남 ○○군 ○○면 ○○리 8",
      hostId: "host-b",
      status: "active",
      summary: "단독 체류형, 조용한 마을 풍경",
    },
    {
      id: "home-3",
      name: "옛 학당 옆 게스트룸",
      address: "전남 ○○군 ○○면 ○○리 3",
      hostId: "host-a",
      status: "paused",
      summary: "리노베이션 준비 중",
    },
  ];

  var BOOKINGS = [
    {
      id: "b1",
      propertyId: "home-1",
      guestName: "김여행",
      guestId: "guest-demo",
      checkIn: "2026-03-20",
      checkOut: "2026-03-22",
      status: "confirmed",
      note: "늦은 체크인 가능 여부 문의 예정",
    },
    {
      id: "b2",
      propertyId: "home-1",
      guestName: "이숙박",
      guestId: "guest-other",
      checkIn: "2026-03-25",
      checkOut: "2026-03-27",
      status: "pending",
      note: "",
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
  ];

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
      propertyId: "home-1",
      bookingId: "b2",
      fromRole: "guest",
      fromName: "이숙박",
      subject: "주차 가능 여부",
      body: "SUV 한 대 주차 가능한지 알려주세요.",
      status: "open",
      createdAt: "2026-03-17",
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

  var STAY_GUIDE = {
    "home-1": {
      checkIn: "15:00 이후 (사전 협의 시 유연)",
      checkOut: "11:00",
      wifi: "Hangro_Guest / 안내 카드 참고",
      parking: "마당 1대 (추가 차량은 사전 문의)",
      rules: "22시 이후 정숙, 실내 금연, 분리수거 준수",
      contact: "010-0000-0000 (집주인)",
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
      body: "첫 유후공간 프로젝트 전·후 비교를 확인할 수 있습니다.",
      date: "2026-02-20",
    },
  ];

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
      return PROPERTIES.find(function (p) {
        return p.id === id;
      });
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
    openMessagesCount: function (propertyIds) {
      return MESSAGES.filter(function (m) {
        return propertyIds.indexOf(m.propertyId) !== -1 && m.status === "open";
      }).length;
    },
  };
})(typeof window !== "undefined" ? window : global);
