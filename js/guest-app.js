/**
 * 게스트 앱 — 공통 뷰 컴포넌트 + 페이지 렌더 (portal-data)
 * HTML: data-ga-page="explore|listing|checkout|trips|trip|messages"
 */
(function (global) {
  "use strict";

  var TRIPS_KEY = "hangro_guest_trips";
  var SEARCH_KEY = "hangro_guest_search";
  var CLEANING_FEE = 15000;

  var PHOTO_THEMES = {
    forest: "linear-gradient(135deg,#2d5a4a 0%,#7cb88a 100%)",
    hanok: "linear-gradient(135deg,#8b6914 0%,#c4a35a 100%)",
    ocean: "linear-gradient(135deg,#1a5f7a 0%,#57c5d4 100%)",
    mountain: "linear-gradient(135deg,#4a5568 0%,#a0aec0 100%)",
    sunset: "linear-gradient(135deg,#c05621 0%,#f6ad55 100%)",
    lavender: "linear-gradient(135deg,#6b46c1 0%,#b794f4 100%)",
    rural: "linear-gradient(135deg,#744210 0%,#d69e2e 100%)",
    studio: "linear-gradient(135deg,#2d3748 0%,#718096 100%)",
  };

  var PAGE_RENDERERS = {
    explore: function () { renderExplore(); },
    listing: function () { renderListing(); },
    checkout: function () { renderCheckout(); },
    trips: function () { renderTrips(); },
    trip: function () { renderTripDetail(); },
    messages: function () { renderMessages(); },
  };

  function P() { return global.PORTAL_DATA; }
  function UI() { return global.PortalUI; }

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function qp(name) { return new URLSearchParams(global.location.search).get(name); }

  function daysBetween(a, b) {
    var d1 = new Date(a + "T12:00:00"), d2 = new Date(b + "T12:00:00");
    return Math.max(1, Math.round((d2 - d1) / 86400000));
  }

  function todayISO() { return new Date().toISOString().slice(0, 10); }

  function defaultCheckOut(ci) {
    var d = new Date(ci + "T12:00:00");
    d.setDate(d.getDate() + 2);
    return d.toISOString().slice(0, 10);
  }

  function getSearch() {
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
      return { id: b.id, propertyId: b.propertyId, checkIn: b.checkIn, checkOut: b.checkOut, status: b.status, guests: 2, note: b.note || "" };
    });
    return getExtraTrips().concat(base);
  }

  function resolveTrip(id) {
    var D = P();
    var b = D && D.getBooking(id);
    if (b) return { id: b.id, propertyId: b.propertyId, checkIn: b.checkIn, checkOut: b.checkOut, status: b.status, note: b.note || "", guests: 2 };
    return getExtraTrips().find(function (t) { return t.id === id; }) || null;
  }

  function calcPrice(property, nights) {
    var sub = property.pricePerNight * nights;
    var svc = Math.round(sub * 0.08);
    return { nights: nights, subtotal: sub, cleaning: CLEANING_FEE, service: svc, total: sub + CLEANING_FEE + svc };
  }

  function photoStyle(p) {
    if (p && p.photos && p.photos.length) {
      return "background-image:url('" + esc(p.photos[0]) + "');background-size:cover;background-position:center";
    }
    return "background:" + (PHOTO_THEMES[(p && p.photoTheme) || ""] || PHOTO_THEMES.forest);
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

  function filterProperties(list, search) {
    return list.filter(function (p) {
      if (p.guests < search.guests) return false;
      if (!search.where.trim()) return true;
      var w = search.where.trim().toLowerCase();
      return (p.region && p.region.toLowerCase().indexOf(w) !== -1) ||
        (p.locationLabel && p.locationLabel.toLowerCase().indexOf(w) !== -1) ||
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

  /* ── 재사용 뷰 ── */
  var V = {
    header: function (active) {
      var items = [
        { id: "explore", href: "./", label: "숙소 찾기" },
        { id: "trips", href: "bookings.html", label: "여행" },
        { id: "messages", href: "messages.html", label: "메시지" },
      ];
      var nav = items.map(function (it) {
        return '<a href="' + it.href + '"' + (it.id === active ? ' aria-current="page"' : "") + ">" + esc(it.label) + "</a>";
      }).join("");
      return '<header class="ga-header"><div class="ga-wrap ga-nav">' +
        '<a href="./" class="ga-logo"><span class="ga-logo-mark" aria-hidden="true"></span>머무름</a>' +
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
        '<div class="ga-card-photo" style="' + photoStyle(p) + '"></div>' +
        '<div class="ga-card-body"><div class="ga-card-top"><h2>' + esc(p.name) + '</h2><span class="ga-rating">★ ' + esc(p.rating) + " (" + esc(p.reviewCount) + ")</span></div>" +
        '<p class="ga-card-loc">' + esc(p.locationLabel) + "</p>" +
        '<p class="ga-card-meta">' + esc(p.propertyType) + " · 최대 " + esc(p.guests) + "명</p>" +
        "<p class=\"ga-card-price\"><strong>" + D.formatPrice(pr.total) + "</strong> <span>(" + pr.nights + "박)</span></p></div></a>";
    },

    photoMosaic: function (p) {
      var photos = (p.photos && p.photos.length) ? p.photos.slice(0, 5) : [null];
      while (photos.length < 5) photos.push(photos[0]);
      return '<div class="ga-mosaic">' + photos.map(function (src, i) {
        var st = src ? "background-image:url('" + esc(src) + "');background-size:cover;background-position:center" : photoStyle(p);
        return '<div class="ga-mosaic-item ga-mosaic-item--' + i + '" style="' + st + '"></div>';
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
        : '<button type="button" class="ga-btn ga-btn--disabled ga-btn--block" disabled>예약 불가</button>';
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
        '<p class="ga-reviews-verified">실제 이용 후기 · 에어비앤비형</p></div>' +
        '<ul class="ga-rev-bars">' + bars + '</ul></div>' +
        '<div class="ga-reviews-yeogi">' +
        '<h3 class="ga-reviews-subtitle">항목별 만족도</h3>' +
        '<div class="ga-rev-cats">' + cats + '</div></div>' +
        '<div class="ga-rev-cards">' + cards + '</div></section>';
    },

    relatedCards: function (currentId, search, limit) {
      var D = P();
      var list = D.listBookable().filter(function (p) { return p.id !== currentId; }).slice(0, limit || 4);
      if (!list.length) return "";
      return '<h2 class="ga-h2">비슷한 숙소</h2><div class="ga-listings ga-listings--compact">' +
        list.map(function (p) { return V.propertyCard(p, search); }).join("") + "</div>";
    },

    tripCard: function (trip, prop) {
      return '<a class="ga-trip-card" href="booking.html?id=' + encodeURIComponent(trip.id) + '">' +
        '<div class="ga-trip-photo" style="' + photoStyle(prop || {}) + '"></div>' +
        '<div class="ga-trip-body"><h2>' + esc(prop ? prop.name : trip.propertyId) + "</h2>" +
        "<p>" + esc(trip.checkIn) + " – " + esc(trip.checkOut) + "</p>" +
        statusBadge(trip.status) + "</div></a>";
    },

    summaryCard: function (p, search, pr) {
      var D = P();
      return '<div class="ga-summary-card">' +
        '<div class="ga-summary-photo" style="' + photoStyle(p) + '"></div>' +
        '<div class="ga-summary-body"><h2>' + esc(p.name) + "</h2>" +
        "<p>" + esc(search.checkIn) + " → " + esc(search.checkOut) + " · " + pr.nights + "박 · " + esc(search.guests) + "명</p>" +
        "<p class=\"ga-summary-price\"><strong>" + D.formatPrice(pr.total) + "</strong></p></div></div>";
    },

    messageItem: function (m, prop) {
      return '<article class="ga-msg"><div class="ga-msg-head"><strong>' + esc(m.subject) + "</strong><time>" + esc(m.createdAt) + "</time></div>" +
        '<p class="ga-msg-prop">' + esc(prop ? prop.name : "") + " · " + esc(m.fromName) + "</p><p>" + esc(m.body) + "</p></article>";
    },
  };

  function fixHtml(s) {
    return s.replace(/<motion/g, "<div").replace(/<\/motion>/g, "</div>");
  }

  function mountHeader(active) {
    var el = document.getElementById("ga-header-mount");
    if (el) el.innerHTML = fixHtml(V.header(active));
  }

  function showLoadError(rootId, msg) {
    var el = document.getElementById(rootId || "ga-page-root");
    if (el) el.innerHTML = '<p class="ga-empty">' + esc(msg) + "</p>";
  }

  function bindWidgetForm(p) {
    var form = document.getElementById("ga-widget-form");
    if (!form) return;
    form.addEventListener("change", function () {
      var D = P();
      var ci = form.checkIn.value, co = form.checkOut.value;
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

  function renderExplore() {
    var D = P();
    bindSearchFromQuery();
    var search = getSearch();
    var mount = document.getElementById("ga-search-mount");
    if (mount) mount.innerHTML = V.searchBar("index.html");
    var grid = document.getElementById("ga-listings");
    if (!grid) return;
    var list = filterProperties(D.listBookable(), search);
    grid.innerHTML = list.length
      ? list.map(function (p) { return fixHtml(V.propertyCard(p, search)); }).join("")
      : '<p class="ga-empty">조건에 맞는 숙소가 없습니다.</p>';
  }

  function renderListing() {
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
      "<h1>" + esc(p.name) + "</h1>" +
      '<p class="ga-listing-sub"><span class="ga-rating">★ ' + esc(p.rating) + "</span> · " + esc(p.reviewCount) + "개 후기 · " + esc(p.locationLabel) + "</p>" +
      V.propertyFacts(p) + '<hr class="ga-rule" />' + V.hostBlock(p) + '<hr class="ga-rule" />' +
      "<p>" + esc(p.description || p.summary) + "</p>" + V.highlights(p) + V.amenities(p) + V.nearbyTips(p) + V.reviewsBlock(p.id, p) +
      "</div>" + V.bookingWidget(p, search) + "</div>" +
      V.relatedCards(p.id, search, 4)
    );
    bindWidgetForm(p);
  }

  function renderCheckout() {
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
    var pr = calcPrice(p, daysBetween(search.checkIn, search.checkOut));
    root.innerHTML = fixHtml(
      V.breadcrumb([{ href: "./", label: "숙소 찾기" }, { href: listingUrl(p, search), label: p.name }, { label: "예약" }]) +
      '<div class="ga-checkout-grid"><section class="ga-panel"><h1>예약 확인</h1>' +
      '<form id="ga-checkout-form" class="ga-form"><h2>연락처</h2>' +
      '<label>이름<input name="name" value="김여행" required /></label>' +
      '<label>휴대폰<input name="phone" value="010-0000-0000" required /></label>' +
      '<h2>요청 사항</h2><label><textarea name="note" placeholder="선택 사항"></textarea></label>' +
      '<button type="submit" class="ga-btn ga-btn--primary ga-btn--block">예약 요청</button></form></section>' +
      "<aside>" + V.summaryCard(p, search, pr) + V.priceLines(p, pr) + "</aside></div>"
    );
    var form = document.getElementById("ga-checkout-form");
    if (form) form.addEventListener("submit", function (e) {
      e.preventDefault();
      var tripId = "trip-" + Date.now();
      addTrip({ id: tripId, propertyId: p.id, checkIn: search.checkIn, checkOut: search.checkOut, guests: search.guests, status: "pending" });
      global.location.href = "booking.html?id=" + encodeURIComponent(tripId) + "&new=1";
    });
  }

  function renderTrips() {
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

  function renderTripDetail() {
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
      '<div class="ga-trip-detail"><div class="ga-trip-hero" style="' + photoStyle(p || {}) + '"></div>' +
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

  function renderMessages() {
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

  function applyGuestFlowTheme() {
    var doc = document.documentElement;
    var palette = {
      bg: "#EFE9DC",
      paper: "#F6F1E5",
      paperWarm: "#FAF6EC",
      ink: "#1A2419",
      inkSoft: "#4A4F44",
      muted: "#87897D",
      green: "#3D6E2C",
    };
    doc.style.setProperty("--ga-bg", palette.bg);
    doc.style.setProperty("--ga-paper", palette.paper);
    doc.style.setProperty("--ga-paper-warm", palette.paperWarm);
    doc.style.setProperty("--ga-ink", palette.ink);
    doc.style.setProperty("--ga-ink-soft", palette.inkSoft);
    doc.style.setProperty("--ga-muted", palette.muted);
    doc.style.setProperty("--ga-green-deep", palette.green);
    doc.style.setProperty("--ga-rose", palette.ink);
    doc.classList.add("ga-theme-ready");
    if (document.body) document.body.classList.add("ga-theme-ready");

    var id = qp("id") || qp("property");
    if (id && P()) {
      try { global.sessionStorage.setItem(GUEST_THEME_KEY, id); } catch (e) {}
    }
  }

  function bootPage(opts) {
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
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
    else boot();
  }

  function autoBoot() {
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
