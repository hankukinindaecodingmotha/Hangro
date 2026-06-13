/**
 * 게스트 포털 앱 (GuestApp)
 * ─────────────────────────────────────────────────────────────
 * 의존: portal-data.js (PORTAL_DATA), portal-ui.js (PortalUI)
 * HTML: <body data-ga-page="explore|listing|checkout|trips|trip|messages">
 *       마운트: #ga-header-mount, #ga-page-root, 페이지별 #ga-listings 등
 * 진입: GuestApp.autoBoot() — body의 data-ga-page로 PAGE_RENDERERS 라우팅
 */
(function (global) {
  "use strict";

  /* localStorage / sessionStorage 키 */
  var TRIPS_KEY = "hangro_guest_trips";       // 사용자가 새로 예약한 trip 목록
  var SEARCH_KEY = "hangro_guest_search";     // 검색 조건(지역·날짜·인원) 세션 저장
  var CLEANING_FEE = 15000;                   // 요금 계산용 청소비 (원)

  /* 사진 없을 때 CSS 테마 클래스 접미사 */
  var PHOTO_THEME_KEYS = ["forest", "hanok", "ocean", "mountain", "sunset", "lavender", "rural", "studio"];

  /* data-ga-page 값 → 렌더 함수 매핑 */
  var PAGE_RENDERERS = {
    explore: function () { renderExplore(); },
    listing: function () { renderListing(); },
    checkout: function () { renderCheckout(); },
    trips: function () { renderTrips(); },
    trip: function () { renderTripDetail(); },
    messages: function () { renderMessages(); },
  };

  function P() { return global.PORTAL_DATA; }  // 목업 데이터 API
  function UI() { return global.PortalUI; }    // 공통 UI 헬퍼

  function esc(s) {  // HTML 이스케이프 (XSS 방지)
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function qp(name) { return new URLSearchParams(global.location.search).get(name); }  // ?id= 등

  function daysBetween(a, b) {  // 체크인~체크아웃 박 수
    var d1 = new Date(a + "T12:00:00"), d2 = new Date(b + "T12:00:00");
    return Math.max(1, Math.round((d2 - d1) / 86400000));
  }

  function todayISO() { return new Date().toISOString().slice(0, 10); }

  /** 체크인/체크아웃 유효성 — 오류 메시지 배열 */
  function validateDates(checkIn, checkOut) {
    var errs = [];
    if (!checkIn || !checkOut) {
      errs.push("체크인·체크아웃 날짜를 선택해 주세요.");
      return errs;
    }
    var today = todayISO();
    if (checkIn < today) errs.push("체크인은 오늘 이후로 선택해 주세요.");
    if (checkOut <= checkIn) errs.push("체크아웃은 체크인 다음 날 이후여야 합니다.");
    return errs;
  }

  function defaultCheckOut(ci) {
    var d = new Date(ci + "T12:00:00");
    d.setDate(d.getDate() + 2);
    return d.toISOString().slice(0, 10);
  }

  function getSearch() {  // sessionStorage 또는 오늘+2박 기본값
    try {
      var raw = global.sessionStorage.getItem(SEARCH_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    var ci = todayISO();
    return { where: "", checkIn: ci, checkOut: defaultCheckOut(ci), guests: 2 };
  }

  function saveSearch(s) {
    try { global.sessionStorage.setItem(SEARCH_KEY, JSON.stringify(s)); } catch (e) {}
  }

  function bindSearchFromQuery() {
    var q = new URLSearchParams(global.location.search);
    if (!q.has("checkIn") && !q.has("where")) return getSearch();
    var s = {
      where: q.get("where") || "",
      checkIn: q.get("checkIn") || todayISO(),
      checkOut: q.get("checkOut") || defaultCheckOut(q.get("checkIn") || todayISO()),
      guests: parseInt(q.get("guests") || "2", 10) || 2,
    };
    saveSearch(s);
    return s;
  }

  function getExtraTrips() {
    try { return JSON.parse(global.localStorage.getItem(TRIPS_KEY) || "[]"); }
    catch (e) { return []; }
  }

  function addTrip(trip) {
    var list = getExtraTrips();
    list.unshift(trip);
    global.localStorage.setItem(TRIPS_KEY, JSON.stringify(list.slice(0, 30)));
  }

  function allTrips() {
    var D = P();
    if (!D) return getExtraTrips();
    var base = D.bookingsForGuest(D.demoGuestId).map(function (b) {
      return { id: b.id, propertyId: b.propertyId, checkIn: b.checkIn, checkOut: b.checkOut, status: b.status, guests: b.guests || 2, note: b.note || "" };
    });
    var api = [];
    if (global.PortalAPI && global.PortalAPI.listBookingsLocal) {
      api = global.PortalAPI.listBookingsLocal().filter(function (b) {
        return b.guestId === D.demoGuestId || String(b.id).indexOf("trip-") === 0;
      }).map(function (b) {
        return { id: b.id, propertyId: b.propertyId, checkIn: b.checkIn, checkOut: b.checkOut, status: b.status, guests: b.guests || 2, note: b.note || "" };
      });
    }
    var extra = getExtraTrips();
    var seen = {};
    return api.concat(extra).concat(base).filter(function (t) {
      if (seen[t.id]) return false;
      seen[t.id] = true;
      return true;
    });
  }

  function resolveTrip(id) {
    var D = P();
    var b = D && D.getBooking(id);
    if (b) {
      try {
        var o = JSON.parse(global.localStorage.getItem("hangro_host_booking_status") || "{}");
        if (o[id]) b = Object.assign({}, b, { status: o[id] });
      } catch (e) {}
      return { id: b.id, propertyId: b.propertyId, checkIn: b.checkIn, checkOut: b.checkOut, status: b.status, note: b.note || "", guests: b.guests || 2 };
    }
    var t = getExtraTrips().find(function (x) { return x.id === id; });
    if (t) {
      try {
        var ov = JSON.parse(global.localStorage.getItem("hangro_host_booking_status") || "{}");
        if (ov[id]) t = Object.assign({}, t, { status: ov[id] });
      } catch (e) {}
    }
    return t || null;
  }

  function calcPrice(property, nights) {  // 숙박·청소·서비스 수수료(8%) 합계
    var sub = property.pricePerNight * nights;
    var svc = Math.round(sub * 0.08);
    return { nights: nights, subtotal: sub, cleaning: CLEANING_FEE, service: svc, total: sub + CLEANING_FEE + svc };
  }

  
  function photoThemeClass(p) {
    var key = (p && p.photoTheme) || "forest";
    return "ga-photo-theme--" + (PHOTO_THEME_KEYS.indexOf(key) !== -1 ? key : "forest");
  }

  function photoStyle(p) {
    if (p && p.photos && p.photos.length) {
      return "background-image:url('" + esc(p.photos[0]) + "');background-size:cover;background-position:center";
    }
    return "";
  }

  function photoBoxClass(p, extra) {
    extra = extra || "";
    var st = photoStyle(p);
    var cls = (extra ? extra + " " : "") + photoThemeClass(p);
    return { cls: cls.trim(), st: st };
  }

  function renderPhotoBox(p, extra, overlay) {
    var box = photoBoxClass(p, extra);
    return '<div class="' + box.cls + '"' + (box.st ? ' style="' + box.st + '"' : '') + '>' + (overlay || '') + '</div>';
  }

  function listingUrl(p, search) {
    return "listing.html?id=" + encodeURIComponent(p.id) +
      "&checkIn=" + encodeURIComponent(search.checkIn) +
      "&checkOut=" + encodeURIComponent(search.checkOut) +
      "&guests=" + encodeURIComponent(search.guests);
  }

  function statusLabel(s) {
    if (s === "confirmed") return "확정";
    if (s === "pending") return "대기";
    if (s === "done") return "완료";
    return s;
  }

  function statusBadge(s) {
    var U = UI();
    if (U && U.statusBadge) return U.statusBadge(s);
    return '<span class="ga-trip-status">' + esc(statusLabel(s)) + "</span>";
  }

  function propertyStatusBadge(p) {
    if (!p || p.status === "active") return "";
    if (p.status === "paused") {
      return '<span class="ga-status-pill ga-status-pill--paused">준비 중</span>';
    }
    return "";
  }

  function filterProperties(list, search) {
    return list.filter(function (p) {
      // 준비 중(paused)은 탐색용 — 인원 조건과 무관하게 노출
      if (p.status !== "paused" && p.guests < search.guests) return false;
      if (!search.where.trim()) return true;
      var w = search.where.trim().toLowerCase();
      return (p.region && p.region.toLowerCase().indexOf(w) !== -1) ||
        (p.locationLabel && p.locationLabel.toLowerCase().indexOf(w) !== -1) ||
        (p.address && p.address.toLowerCase().indexOf(w) !== -1) ||
        (p.name && p.name.toLowerCase().indexOf(w) !== -1);
    });
  }

  function guestMessages() {
    var D = P();
    if (!D) return [];
    if (D.messagesForGuest) return D.messagesForGuest(D.demoGuestId);
    var trips = allTrips();
    var propIds = trips.map(function (t) { return t.propertyId; });
    return D.messages.filter(function (m) {
      return m.fromRole === "guest" || propIds.indexOf(m.propertyId) !== -1 || m.bookingId === "b1";
    });
  }

  /* ── 재사용 HTML 조각 (뷰 레이어) ── */
  var V = {
    header: function (active) {  // 상단 네비 + 로고
      var items = [
        { id: "explore", href: "./", label: "숙소 찾기" },
        { id: "trips", href: "bookings.html", label: "여행" },
        { id: "messages", href: "messages.html", label: "메시지" },
      ];
      var nav = items.map(function (it) {
        return '<a href="' + it.href + '"' + (it.id === active ? ' aria-current="page"' : "") + ">" + esc(it.label) + "</a>";
      }).join("");
      return '<header class="ga-header"><div class="ga-wrap ga-nav">' +
        '<a href="./" class="ga-logo"><span class="ga-logo-mark" aria-hidden="true"></span>행로</a>' +
        '<nav class="ga-nav-links" aria-label="게스트">' + nav + '</nav>' +
        '<a href="bookings.html" class="ga-avatar" title="내 여행">게</a></div></header>';
    },

    breadcrumb: function (items) {
      return '<nav class="ga-breadcrumb" aria-label="경로">' + items.map(function (it, i) {
        var sep = i ? '<span aria-hidden="true"> / </span>' : "";
        var inner = it.href ? '<a href="' + esc(it.href) + '">' + esc(it.label) + "</a>" : esc(it.label);
        return sep + inner;
      }).join("") + "</nav>";
    },

    searchBar: function (action, overrides) {
      var s = overrides || getSearch();
      return '<form class="ga-search" method="get" action="' + esc(action || "index.html") + '">' +
        '<label class="ga-search-field"><span class="ga-search-label">지역</span><input type="text" name="where" placeholder="어디로?" value="' + esc(s.where) + '" /></label>' +
        '<label class="ga-search-field"><span class="ga-search-label">체크인</span><input type="date" name="checkIn" value="' + esc(s.checkIn) + '" required /></label>' +
        '<label class="ga-search-field"><span class="ga-search-label">체크아웃</span><input type="date" name="checkOut" value="' + esc(s.checkOut) + '" required /></label>' +
        '<label class="ga-search-field"><span class="ga-search-label">인원</span><select name="guests">' +
        [1, 2, 3, 4, 5, 6].map(function (n) {
          return '<option value="' + n + '"' + (n === s.guests ? " selected" : "") + ">" + n + "명</option>";
        }).join("") + "</select></label>" +
        '<button type="submit" class="ga-search-btn">검색</button></form>';
    },

    propertyCard: function (p, search) {
      var D = P();
      var pr = calcPrice(p, daysBetween(search.checkIn, search.checkOut));
      return '<a class="ga-card" href="' + listingUrl(p, search) + '">' +
        renderPhotoBox(p, 'ga-card-photo', propertyStatusBadge(p)) +
        '<div class="ga-card-body"><div class="ga-card-top"><h2>' + esc(p.name) + '</h2><span class="ga-rating">★ ' + esc(p.rating) + " (" + esc(p.reviewCount) + ")</span></div>" +
        '<p class="ga-card-loc">' + esc(p.locationLabel) + "</p>" +
        '<p class="ga-card-meta">' + esc(p.propertyType) + " · 최대 " + esc(p.guests) + "명</p>" +
        "<p class=\"ga-card-price\"><strong>" + D.formatPrice(pr.total) + "</strong> <span>(" + pr.nights + "박)</span></p></div></a>";
    },

    photoMosaic: function (p) {
      var photos = (p.photos && p.photos.length) ? p.photos.slice(0, 5) : [null];
      while (photos.length < 5) photos.push(photos[0]);
      return '<div class="ga-mosaic">' + photos.map(function (src, i) {
        if (src) {
          return '<div class="ga-mosaic-item ga-mosaic-item--' + i + '" style="background-image:url(\'' + esc(src) + '\');background-size:cover;background-position:center"></div>';
        }
        return renderPhotoBox(p, 'ga-mosaic-item ga-mosaic-item--' + i);
      }).join("") + "</div>";
    },

    propertyFacts: function (p) {
      return '<ul class="ga-stats"><li>최대 ' + esc(p.guests) + "명</li><li>침실 " + esc(p.bedrooms) +
        "</li><li>침대 " + esc(p.beds) + "</li><li>욕실 " + esc(p.baths) + "</li></ul>";
    },

    hostBlock: function (p) {
      return '<div class="ga-host-row"><div class="ga-host-avatar">' + esc((p.hostName || "H")[0]) + "</div>" +
        "<div><strong>호스트 " + esc(p.hostName) + "</strong><br><span>" + esc(p.hostBio || "") + "</span></div></div>";
    },


    highlights: function (p) {
      if (!p.highlights || !p.highlights.length) return "";
      return '<h2 class="ga-h2">이 숙소의 특징</h2><ul class="ga-highlights">' +
        p.highlights.map(function (h) { return "<li>" + esc(h) + "</li>"; }).join("") + "</ul>";
    },

    nearbyTips: function (p) {
      if (!p.nearbyTips || !p.nearbyTips.length) return "";
      return '<h2 class="ga-h2">주변 추천</h2><ul class="ga-nearby">' +
        p.nearbyTips.map(function (n) { return "<li>" + esc(n) + "</li>"; }).join("") + "</ul>";
    },
    amenities: function (p) {
      if (!p.amenities || !p.amenities.length) return "";
      return '<h2 class="ga-h2">편의시설</h2><ul class="ga-amenities">' +
        p.amenities.map(function (a) { return "<li>" + esc(a) + "</li>"; }).join("") + "</ul>";
    },

    priceLines: function (p, pr, ids) {
      var D = P();
      ids = ids || {};
      return '<ul class="ga-price-lines">' +
        "<li><span>" + D.formatPrice(p.pricePerNight) + " × " + pr.nights + '박</span><span id="' + (ids.sub || "") + '">' + D.formatPrice(pr.subtotal) + "</span></li>" +
        "<li><span>청소비</span><span>" + D.formatPrice(pr.cleaning) + "</span></li>" +
        "<li><span>서비스 수수료</span><span id=\"" + (ids.svc || "") + '">' + D.formatPrice(pr.service) + "</span></li>" +
        '<li class="ga-price-total"><span>합계</span><span id="' + (ids.total || "") + '">' + D.formatPrice(pr.total) + "</span></li></ul>";
    },

    bookingWidget: function (p, search) {
      var D = P();
      var pr = calcPrice(p, daysBetween(search.checkIn, search.checkOut));
      var checkoutHref = "checkout.html?property=" + encodeURIComponent(p.id) +
        "&checkIn=" + encodeURIComponent(search.checkIn) + "&checkOut=" + encodeURIComponent(search.checkOut) +
        "&guests=" + encodeURIComponent(search.guests);
      var btn = p.status === "active"
        ? '<a class="ga-btn ga-btn--primary ga-btn--block" href="' + checkoutHref + '" id="ga-reserve-btn">예약하기</a>'
        : '<button type="button" class="ga-btn ga-btn--disabled ga-btn--block" disabled>준비 중 · 예약 불가</button>';
      return '<aside class="ga-widget"><p class="ga-widget-price">' + D.formatPrice(p.pricePerNight) + ' <span>/ 박</span></p>' +
        '<form class="ga-widget-form" id="ga-widget-form" data-property-id="' + esc(p.id) + '">' +
        '<div class="ga-widget-dates"><label>체크인<input type="date" name="checkIn" value="' + esc(search.checkIn) + '" required /></label>' +
        '<label>체크아웃<input type="date" name="checkOut" value="' + esc(search.checkOut) + '" required /></label></div>' +
        '<label>인원<select name="guests">' + [1, 2, 3, 4, 5, 6].map(function (n) {
          return '<option value="' + n + '"' + (n === search.guests ? " selected" : "") + ">" + n + "명</option>";
        }).join("") + "</select></label>" +
        V.priceLines(p, pr, { sub: "ga-line-sub", svc: "ga-line-svc", total: "ga-total" }) + btn +
        '<p class="ga-widget-note">예약 확정 전 요금 미청구 (데모)</p></form></aside>';
    },

    stayGuide: function (propertyId) {
      var D = P();
      var g = D.getStayGuide ? D.getStayGuide(propertyId) : D.stayGuide[propertyId];
      if (!g) return '<p class="ga-muted">숙소 안내가 아직 등록되지 않았습니다.</p>';
      var rows = [["checkIn", "체크인"], ["checkOut", "체크아웃"], ["wifi", "Wi-Fi"], ["parking", "주차"], ["rules", "이용 규칙"], ["contact", "연락처"]];
      return '<h2 class="ga-h2">숙소 안내</h2><dl class="ga-guide">' + rows.map(function (r) {
        return "<dt>" + r[1] + "</dt><dd>" + esc(g[r[0]]) + "</dd>";
      }).join("") + "</dl>";
    },


    reviewsBlock: function (propertyId, prop) {
      var D = P();
      var data = D.reviewsForProperty(propertyId);
      if (!data) return "";
      var rating = data.rating != null ? data.rating : (prop && prop.rating) || 0;
      var count = data.count != null ? data.count : (prop && prop.reviewCount) || 0;
      var dist = data.distribution || [0, 0, 0, 0, 0];
      var maxDist = Math.max.apply(null, dist.concat([1]));
      var bars = [5, 4, 3, 2, 1].map(function (star) {
        var n = dist[star - 1] || 0;
        var pct = Math.round((n / maxDist) * 100);
        return '<li class="ga-rev-bar-row"><span class="ga-rev-star-label">' + star + '★</span>' +
          '<span class="ga-rev-bar-track"><span class="ga-rev-bar-fill" style="width:' + pct + '%"></span></span>' +
          '<span class="ga-rev-bar-count">' + n + '</span></li>';
      }).join("");
      var cats = (data.categories || []).map(function (c) {
        return '<div class="ga-rev-cat"><span class="ga-rev-cat-label">' + esc(c.label) + '</span>' +
          '<span class="ga-rev-cat-score">' + esc(c.score) + '</span></div>';
      }).join("");
      var items = data.items || [];
      if (!items.length) {
        items = [{ author: "게스트", date: "—", rating: Math.round(rating), tripType: "체류", text: "아직 등록된 후기가 없습니다." }];
      }
      var cards = items.map(function (r, i) {
        var initial = (r.author || "G")[0];
        var stars = "★".repeat(r.rating || 5) + "☆".repeat(5 - (r.rating || 5));
        return '<article class="ga-rev-card">' +
          '<div class="ga-rev-card-head">' +
          '<span class="ga-rev-avatar ga-rev-avatar--' + (i % 6) + '">' + esc(initial) + '</span>' +
          '<div><strong>' + esc(r.author) + '</strong> <span class="ga-muted">' + esc(r.date) + ' · ' + esc(r.tripType || "") + '</span></div>' +
          '</div>' +
          '<p class="ga-rev-card-stars" aria-label="' + (r.rating || 5) + '점">' + stars + '</p>' +
          '<p class="ga-rev-card-text">' + esc(r.text) + '</p></article>';
      }).join("");
      return '<section class="ga-reviews-section" id="reviews">' +
        '<h2 class="ga-h2">후기 <span class="ga-reviews-count">' + esc(count) + '개</span></h2>' +
        '<div class="ga-reviews-hero">' +
        '<div class="ga-reviews-score-box">' +
        '<span class="ga-reviews-big">' + esc(rating) + '</span>' +
        '<span class="ga-reviews-max">/ 5</span>' +
        '<p class="ga-reviews-verified">실제 이용 후기</p></div>' +
        '<ul class="ga-rev-bars">' + bars + '</ul></div>' +
        '<div class="ga-reviews-yeogi">' +
        '<h3 class="ga-reviews-subtitle">항목별 만족도</h3>' +
        '<div class="ga-rev-cats">' + cats + '</div></div>' +
        '<div class="ga-rev-cards">' + cards + '</div></section>';
    },

    relatedCards: function (currentId, search, limit) {
      var D = P();
      var list = (D.listBrowsable ? D.listBrowsable() : D.listBookable()).filter(function (p) { return p.id !== currentId; }).slice(0, limit || 4);
      if (!list.length) return "";
      return '<h2 class="ga-h2">비슷한 숙소</h2><div class="ga-listings ga-listings--compact">' +
        list.map(function (p) { return V.propertyCard(p, search); }).join("") + "</div>";
    },

    tripCard: function (trip, prop) {
      return '<a class="ga-trip-card" href="booking.html?id=' + encodeURIComponent(trip.id) + '">' +
        renderPhotoBox(prop || {}, 'ga-trip-photo') +
        '<div class="ga-trip-body"><h2>' + esc(prop ? prop.name : trip.propertyId) + "</h2>" +
        "<p>" + esc(trip.checkIn) + " – " + esc(trip.checkOut) + "</p>" +
        statusBadge(trip.status) + "</div></a>";
    },

    summaryCard: function (p, search, pr) {
      var D = P();
      return '<div class="ga-summary-card">' +
        renderPhotoBox(p, 'ga-summary-photo') +
        '<div class="ga-summary-body"><h2>' + esc(p.name) + "</h2>" +
        "<p>" + esc(search.checkIn) + " → " + esc(search.checkOut) + " · " + pr.nights + "박 · " + esc(search.guests) + "명</p>" +
        "<p class=\"ga-summary-price\"><strong>" + D.formatPrice(pr.total) + "</strong></p></div></div>";
    },

    messageItem: function (m, prop) {
      return '<article class="ga-msg"><div class="ga-msg-head"><strong>' + esc(m.subject) + "</strong><time>" + esc(m.createdAt) + "</time></div>" +
        '<p class="ga-msg-prop">' + esc(prop ? prop.name : "") + " · " + esc(m.fromName) + "</p><p>" + esc(m.body) + "</p></article>";
    },
  };

  function fixHtml(s) {  // 외부 도구가 넣은 <motion> 태그를 div로 치환
    return s.replace(/<motion/g, "<div").replace(/<\/motion>/g, "</div>");
  }

  function mountHeader(active) {  // #ga-header-mount 에 헤더 삽입
    var el = document.getElementById("ga-header-mount");
    if (el) el.innerHTML = fixHtml(V.header(active));
  }

  function showLoadError(rootId, msg) {
    var el = document.getElementById(rootId || "ga-page-root");
    if (el) el.innerHTML = '<p class="ga-empty">' + esc(msg) + "</p>";
  }

  function bindWidgetForm(p) {  // 상세 페이지 예약 위젯 — 날짜 변경 시 요금·링크 갱신
    var form = document.getElementById("ga-widget-form");
    if (!form) return;
    form.addEventListener("change", function () {
      var ci = form.checkIn.value, co = form.checkOut.value;
      var errs = validateDates(ci, co);
      if (errs.length && global.HangroNotify) {
        global.HangroNotify.error(errs[0]);
        return;
      }
      var D = P();
      var g = parseInt(form.guests.value, 10) || 2;
      var nights = daysBetween(ci, co);
      var pr = calcPrice(p, nights);
      var el = document.getElementById("ga-line-sub"); if (el) el.textContent = D.formatPrice(pr.subtotal);
      el = document.getElementById("ga-line-svc"); if (el) el.textContent = D.formatPrice(pr.service);
      el = document.getElementById("ga-total"); if (el) el.textContent = D.formatPrice(pr.total);
      el = document.getElementById("ga-reserve-btn");
      if (el) el.href = "checkout.html?property=" + encodeURIComponent(p.id) + "&checkIn=" + encodeURIComponent(ci) + "&checkOut=" + encodeURIComponent(co) + "&guests=" + encodeURIComponent(g);
    });
  }

  /* ── 페이지 렌더러 ── */
  function renderExplore() {  // 숙소 목록 + 검색바
    var D = P();
    bindSearchFromQuery();
    var search = getSearch();
    var mount = document.getElementById("ga-search-mount");
    if (mount) {
      mount.innerHTML = V.searchBar("index.html");
      var sform = mount.querySelector(".ga-search");
      if (sform) {
        sform.addEventListener("submit", function (e) {
          var fd = new FormData(sform);
          var ci = String(fd.get("checkIn") || "");
          var co = String(fd.get("checkOut") || "");
          var errs = validateDates(ci, co);
          if (errs.length) {
            e.preventDefault();
            if (global.HangroNotify) global.HangroNotify.error(errs[0]);
          }
        });
      }
    }
    var grid = document.getElementById("ga-listings");
    if (!grid) return;
    var list = filterProperties(D.listBrowsable ? D.listBrowsable() : D.listBookable(), search);
    grid.innerHTML = list.length
      ? list.map(function (p) { return fixHtml(V.propertyCard(p, search)); }).join("")
      : '<p class="ga-empty">조건에 맞는 숙소가 없습니다.</p>';
  }

  function renderListing() {  // 숙소 상세 + 예약 위젯
    var D = P();
    var id = qp("id") || "home-1";
    var p = D.getProperty(id);
    var root = document.getElementById("ga-listing-root") || document.getElementById("ga-page-root");
    if (!root) return;
    if (!p) { root.innerHTML = '<p class="ga-empty">숙소를 찾을 수 없습니다.</p>'; return; }
    var search = {
      checkIn: qp("checkIn") || getSearch().checkIn,
      checkOut: qp("checkOut") || getSearch().checkOut,
      guests: parseInt(qp("guests") || String(getSearch().guests), 10) || 2,
    };
    saveSearch(Object.assign(getSearch(), search));
    root.innerHTML = fixHtml(
      V.breadcrumb([{ href: "./", label: "숙소 찾기" }, { label: p.name }]) +
      V.photoMosaic(p) +
      '<div class="ga-listing-layout"><div class="ga-listing-main">' +
      "<h1>" + esc(p.name) + propertyStatusBadge(p) + "</h1>" +
      '<p class="ga-listing-sub"><span class="ga-rating">★ ' + esc(p.rating) + "</span> · " + esc(p.reviewCount) + "개 후기 · " + esc(p.locationLabel) +
      (p.address ? " · " + esc(p.address) : "") + "</p>" +
      V.propertyFacts(p) + '<hr class="ga-rule" />' + V.hostBlock(p) + '<hr class="ga-rule" />' +
      "<p>" + esc(p.description || p.summary) + "</p>" + V.highlights(p) + V.amenities(p) + V.nearbyTips(p) + V.reviewsBlock(p.id, p) +
      "</div>" + V.bookingWidget(p, search) + "</div>" +
      V.relatedCards(p.id, search, 4)
    );
    bindWidgetForm(p);
  }

  function renderCheckout() {  // 예약 확인 — 결제(알림만) 후 API/local 예약 생성
    var D = P();
    var id = qp("property") || "home-1";
    var p = D.getProperty(id);
    var root = document.getElementById("ga-checkout-root") || document.getElementById("ga-page-root");
    if (!root) return;
    if (!p || p.status !== "active") { root.innerHTML = '<p class="ga-empty">예약할 수 없습니다.</p>'; return; }
    var search = {
      checkIn: qp("checkIn") || getSearch().checkIn,
      checkOut: qp("checkOut") || getSearch().checkOut,
      guests: parseInt(qp("guests") || "2", 10) || 2,
    };
    var dateErrs = validateDates(search.checkIn, search.checkOut);
    if (dateErrs.length) {
      root.innerHTML = '<p class="ga-empty">' + esc(dateErrs[0]) + ' <a href="' + listingUrl(p, search) + '">날짜 다시 선택</a></p>';
      return;
    }
    var pr = calcPrice(p, daysBetween(search.checkIn, search.checkOut));
    root.innerHTML = fixHtml(
      V.breadcrumb([{ href: "./", label: "숙소 찾기" }, { href: listingUrl(p, search), label: p.name }, { label: "예약" }]) +
      '<div class="ga-checkout-grid"><section class="ga-panel"><h1>예약 확인</h1>' +
      '<form id="ga-checkout-form" class="ga-form"><h2>연락처</h2>' +
      '<label>이름<input name="name" value="김여행" required /></label>' +
      '<label>휴대폰<input name="phone" value="010-0000-0000" required /></label>' +
      '<h2>요청 사항</h2><label><textarea name="note" placeholder="선택 사항"></textarea></label>' +
      '<h2 class="ga-h2">결제</h2>' +
      '<p class="ga-muted">데모: 실제 결제 없이 「결제하기」를 누르면 완료 알림만 표시됩니다.</p>' +
      '<button type="button" id="ga-pay-btn" class="ga-btn ga-btn--primary ga-btn--block">결제하기 · ' + D.formatPrice(pr.total) + '</button>' +
      '<p id="ga-pay-status" class="ga-muted" hidden>결제 완료 — 예약 요청을 진행할 수 있습니다.</p>' +
      '<button type="submit" id="ga-reserve-submit" class="ga-btn ga-btn--ghost ga-btn--block" disabled>예약 요청 보내기</button></form></section>' +
      "<aside>" + V.summaryCard(p, search, pr) + V.priceLines(p, pr) + "</aside></div>"
    );
    var paid = false;
    var payBtn = document.getElementById("ga-pay-btn");
    var submitBtn = document.getElementById("ga-reserve-submit");
    var payStatus = document.getElementById("ga-pay-status");
    if (payBtn) {
      payBtn.addEventListener("click", function () {
        paid = true;
        if (global.HangroNotify) {
          global.HangroNotify.success(
            "결제가 완료되었습니다. (데모 · 실제 청구 없음) 예약 요청을 보내 주세요.",
            "결제 완료"
          );
        }
        if (payStatus) payStatus.hidden = false;
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.classList.remove("ga-btn--ghost");
          submitBtn.classList.add("ga-btn--primary");
        }
      });
    }
    var form = document.getElementById("ga-checkout-form");
    if (form) form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!paid) {
        if (global.HangroNotify) global.HangroNotify.info("먼저 「결제하기」를 눌러 주세요.", "결제 필요");
        return;
      }
      var fd = new FormData(form);
      var payload = {
        propertyId: p.id,
        guestId: D.demoGuestId,
        guestName: String(fd.get("name") || "게스트"),
        phone: String(fd.get("phone") || ""),
        checkIn: search.checkIn,
        checkOut: search.checkOut,
        guests: search.guests,
        note: String(fd.get("note") || ""),
      };
      function done(booking) {
        var tripId = booking.id;
        addTrip({
          id: tripId,
          propertyId: p.id,
          checkIn: search.checkIn,
          checkOut: search.checkOut,
          guests: search.guests,
          status: booking.status || "pending",
          note: payload.note,
        });
        if (global.HangroNotify) {
          global.HangroNotify.success("예약 요청이 접수되었습니다. 집주인 승인을 기다려 주세요.", "예약 접수");
        }
        global.location.href = "booking.html?id=" + encodeURIComponent(tripId) + "&new=1";
      }
      if (global.PortalAPI && global.PortalAPI.createBooking) {
        global.PortalAPI.createBooking(payload).then(done).catch(function () {
          done({ id: "trip-" + Date.now(), status: "pending" });
        });
      } else {
        done({ id: "trip-" + Date.now(), status: "pending" });
      }
    });
  }

  function renderTrips() {  // 내 여행 목록
    var D = P();
    var el = document.getElementById("ga-trips-list") || document.getElementById("ga-page-root");
    if (!el) return;
    var trips = allTrips();
    if (!trips.length) {
      el.innerHTML = '<div class="ga-empty-box"><p>예약한 여행이 없습니다.</p><a class="ga-btn ga-btn--primary" href="./">숙소 찾기</a></div>';
      el.innerHTML = fixHtml(el.innerHTML);
      return;
    }
    el.innerHTML = fixHtml('<div class="ga-trips-grid">' + trips.map(function (t) {
      return V.tripCard(t, D.getProperty(t.propertyId));
    }).join("") + "</div>");
  }

  function renderTripDetail() {  // 여행 상세 + 숙소 안내
    var D = P();
    var id = qp("id") || "b1";
    var trip = resolveTrip(id);
    var root = document.getElementById("ga-trip-root") || document.getElementById("ga-page-root");
    if (!root) return;
    if (!trip) { root.innerHTML = '<p class="ga-empty">여행을 찾을 수 없습니다.</p>'; return; }
    var p = D.getProperty(trip.propertyId);
    var pr = p ? calcPrice(p, daysBetween(trip.checkIn, trip.checkOut)) : null;
    var banner = qp("new") === "1" ? '<p class="ga-banner">예약 요청이 접수되었습니다 (데모).</p>' : "";
    root.innerHTML = fixHtml(
      banner +
      V.breadcrumb([{ href: "bookings.html", label: "여행" }, { label: p ? p.name : "예약 상세" }]) +
      '<div class="ga-trip-detail">' + renderPhotoBox(p || {}, 'ga-trip-hero') +
      "<h1>" + esc(p ? p.name : trip.propertyId) + "</h1>" +
      "<p>" + esc(trip.checkIn) + " → " + esc(trip.checkOut) + " · " + statusBadge(trip.status) + "</p>" +
      (p ? '<p class="ga-muted">' + esc(p.locationLabel) + " · " + esc(p.address || "") + "</p>" : "") +
      (trip.note ? '<p><strong>메모</strong> ' + esc(trip.note) + "</p>" : "") +
      (pr && p ? V.priceLines(p, pr) : "") +
      V.stayGuide(trip.propertyId) +
      '<div class="ga-trip-actions"><a class="ga-btn ga-btn--ghost" href="messages.html">문의</a>' +
      (p ? '<a class="ga-btn ga-btn--ghost" href="' + listingUrl(p, getSearch()) + '">숙소 보기</a>' : "") +
      "</div></div>"
    );
  }

  function renderMessages() {  // 호스트 문의 목록
    var D = P();
    var el = document.getElementById("ga-messages-list") || document.getElementById("ga-page-root");
    if (!el) return;
    var list = guestMessages();
    el.innerHTML = list.length
      ? fixHtml(list.map(function (m) { return V.messageItem(m, D.getProperty(m.propertyId)); }).join(""))
      : '<p class="ga-empty">문의 내역이 없습니다.</p>';
    var U = UI();
    if (U && U.initMessageForm) U.initMessageForm("guest-message-form", "guest");
  }


  var GUEST_THEME_KEY = "hangro_guest_theme";

  function applyGuestFlowTheme() {  // body에 ga-theme-ready, 숙소 id 세션 저장
    document.documentElement.classList.add("ga-theme-ready");
    if (document.body) document.body.classList.add("ga-theme-ready");
    var id = qp("id") || qp("property");
    if (id && P()) {
      try { global.sessionStorage.setItem(GUEST_THEME_KEY, id); } catch (e) {}
    }
  }

  function bootPage(opts) {  // DOMContentLoaded 후 데이터 확인 → 헤더+페이지 렌더
    opts = opts || {};
    function boot() {
      if (!P() || !global.GuestApp) {
        showLoadError(opts.rootId, "데이터를 불러오지 못했습니다. 강력 새로고침(Cmd+Shift+R) 후 다시 시도해 주세요.");
        return;
      }
      applyGuestFlowTheme();
      mountHeader(opts.nav || "explore");
      var fn = opts.render || PAGE_RENDERERS[opts.page];
      if (fn) fn();
      else showLoadError(opts.rootId, "페이지를 표시할 수 없습니다.");
    }
    function start() {
      var ready = global.PortalAPI && global.PortalAPI.hydratePortalData
        ? global.PortalAPI.hydratePortalData().catch(function () {})
        : Promise.resolve();
      ready.then(boot);
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
    else start();
  }

  function autoBoot() {  // 각 guest/*.html 하단에서 호출 — 수정 금지 패턴
    var page = (document.body && document.body.getAttribute("data-ga-page")) || "explore";
    var nav = page === "listing" || page === "checkout" ? "explore" : page === "trip" ? "trips" : page;
    bootPage({ page: page, nav: nav });
  }

  global.GuestApp = {
    bootPage: bootPage,
    autoBoot: autoBoot,
    mountHeader: mountHeader,
    renderExplore: renderExplore,
    renderListing: renderListing,
    renderCheckout: renderCheckout,
    renderTrips: renderTrips,
    renderTripDetail: renderTripDetail,
    renderMessages: renderMessages,
    views: V,
  };
})(typeof window !== "undefined" ? window : global);
