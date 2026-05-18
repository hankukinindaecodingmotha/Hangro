/**
 * 게스트 숙소 예약 UI (에어비앤비형)
 */
(function (global) {
  "use strict";

  var TRIPS_KEY = "hangro_guest_trips";
  var SEARCH_KEY = "hangro_guest_search";

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function queryParam(name) {
    return new URLSearchParams(global.location.search).get(name);
  }

  function daysBetween(a, b) {
    var d1 = new Date(a + "T12:00:00");
    var d2 = new Date(b + "T12:00:00");
    return Math.max(1, Math.round((d2 - d1) / 86400000));
  }

  function todayISO() {
    return new Date().toISOString().slice(0, 10);
  }

  function defaultCheckOut(checkIn) {
    var d = new Date(checkIn + "T12:00:00");
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

  function getExtraTrips() {
    try { return JSON.parse(global.localStorage.getItem(TRIPS_KEY) || "[]"); }
    catch (e) { return []; }
  }

  function addTrip(trip) {
    var list = getExtraTrips();
    list.unshift(trip);
    global.localStorage.setItem(TRIPS_KEY, JSON.stringify(list.slice(0, 30)));
  }

  function allGuestTrips() {
    var D = global.PORTAL_DATA;
    if (!D) return getExtraTrips();
    var base = D.bookingsForGuest(D.demoGuestId).map(function (b) {
      return {
        id: b.id, propertyId: b.propertyId,
        checkIn: b.checkIn, checkOut: b.checkOut,
        status: b.status, guests: 2, source: "demo",
      };
    });
    return getExtraTrips().concat(base);
  }

  function photoStyle(p) {
    if (p && p.photos && p.photos.length) {
      return "background-image:url('" + escapeHtml(p.photos[0]) + "');background-size:cover;background-position:center";
    }
    var themes = {
      forest: "linear-gradient(135deg,#2d5a4a,#7cb88a)",
      hanok: "linear-gradient(135deg,#8b6914,#c4a35a)",
    };
    return "background:" + (themes[(p && p.photoTheme) || ""] || "linear-gradient(135deg,#5a6358,#9aa89a)");
  }

  function renderHeader(active) {
    var items = [
      { id: "explore", href: "./", label: "숙소 찾기" },
      { id: "trips", href: "bookings.html", label: "여행" },
      { id: "messages", href: "messages.html", label: "메시지" },
    ];
    var nav = items.map(function (it) {
      var ac = it.id === active ? ' aria-current="page"' : "";
      return '<a href="' + it.href + '"' + ac + ">" + escapeHtml(it.label) + "</a>";
    }).join("");
    return (
      '<header class="ga-header"><div class="ga-wrap ga-nav">' +
      '<a href="./" class="ga-logo"><span class="ga-logo-mark" aria-hidden="true"></span>머무름</a>' +
      '<nav class="ga-nav-links" aria-label="게스트">' + nav + "</nav>" +
      '<a href="bookings.html" class="ga-avatar" title="내 여행">게</a>' +
      "</div></header>"
    );
  }

  function mountHeader(active) {
    var el = document.getElementById("ga-header-mount");
    if (el) el.innerHTML = renderHeader(active);
  }

  function renderSearchBar(action) {
    var s = getSearch();
    return (
      '<form class="ga-search" method="get" action="' + escapeHtml(action || "index.html") + '">' +
      '<label class="ga-search-field"><span class="ga-search-label">지역</span>' +
      '<input type="text" name="where" placeholder="어디로 떠나시나요?" value="' + escapeHtml(s.where) + '" /></label>' +
      '<label class="ga-search-field"><span class="ga-search-label">체크인</span>' +
      '<input type="date" name="checkIn" value="' + escapeHtml(s.checkIn) + '" required /></label>' +
      '<label class="ga-search-field"><span class="ga-search-label">체크아웃</span>' +
      '<input type="date" name="checkOut" value="' + escapeHtml(s.checkOut) + '" required /></label>' +
      '<label class="ga-search-field"><span class="ga-search-label">인원</span><select name="guests">' +
      [1,2,3,4,5,6].map(function (n) {
        return '<option value="' + n + '"' + (n === s.guests ? " selected" : "") + ">" + n + "명</option>";
      }).join("") + "</select></label>" +
      '<button type="submit" class="ga-search-btn">검색</button></form>"
    );
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

  function filterProperties(list, search) {
    return list.filter(function (p) {
      if (p.guests < search.guests) return false;
      if (!search.where.trim()) return true;
      var w = search.where.trim().toLowerCase();
      return [p.region, p.locationLabel, p.name, p.address].some(function (f) {
        return f && String(f).toLowerCase().indexOf(w) !== -1;
      });
    });
  }

  function listingCard(p, search) {
    var D = global.PORTAL_DATA;
    var href = "listing.html?id=" + encodeURIComponent(p.id) +
      "&checkIn=" + encodeURIComponent(search.checkIn) +
      "&checkOut=" + encodeURIComponent(search.checkOut) +
      "&guests=" + encodeURIComponent(search.guests);
    var nights = daysBetween(search.checkIn, search.checkOut);
    return (
      '<a class="ga-card" href="' + href + '">' +
      '<div class="ga-card-photo" style="' + photoStyle(p) + '"></div>' +
      '<div class="ga-card-body"><div class="ga-card-top"><h2>' + escapeHtml(p.name) +
      '</h2><span class="ga-rating">★ ' + escapeHtml(p.rating) + " (" + escapeHtml(p.reviewCount) + ")</span></div>" +
      '<p class="ga-card-loc">' + escapeHtml(p.locationLabel || p.region) + "</p>" +
      '<p class="ga-card-meta">' + escapeHtml(p.propertyType) + " · 최대 " + escapeHtml(p.guests) + "명</p>" +
      "<p class=\"ga-card-price\"><strong>" + D.formatPrice(p.pricePerNight * nights) + "</strong> <span>(" + nights + "박)</span></p></div></a>"
    );
  }

  function renderExplore() {
    var D = global.PORTAL_DATA;
    bindSearchFromQuery();
    var search = getSearch();
    var mount = document.getElementById("ga-search-mount");
    if (mount) mount.innerHTML = renderSearchBar("index.html");
    var grid = document.getElementById("ga-listings");
    if (!grid) return;
    var list = filterProperties(D.listBookable(), search);
    grid.innerHTML = list.length
      ? list.map(function (p) { return listingCard(p, search); }).join("")
      : '<p class="ga-empty">조건에 맞는 숙소가 없습니다.</p>';
  }

  function renderListing() {
    var D = global.PORTAL_DATA;
    var root = document.getElementById("ga-listing-root");
    var p = D.getProperty(queryParam("id") || "home-1");
    if (!root || !p) {
      if (root) root.innerHTML = '<p class="ga-empty">숙소를 찾을 수 없습니다.</p>';
      return;
    }
    var search = {
      checkIn: queryParam("checkIn") || getSearch().checkIn,
      checkOut: queryParam("checkOut") || getSearch().checkOut,
      guests: parseInt(queryParam("guests") || String(getSearch().guests), 10) || 2,
    };
    saveSearch(Object.assign(getSearch(), search));
    var nights = daysBetween(search.checkIn, search.checkOut);
    var subtotal = p.pricePerNight * nights;
    var cleaning = 15000;
    var service = Math.round(subtotal * 0.08);
    var total = subtotal + cleaning + service;
    var photos = (p.photos && p.photos.length ? p.photos.slice() : [null]);
    while (photos.length < 5) photos.push(photos[0]);
    var mosaic = photos.map(function (src, i) {
      var st = src ? "background-image:url('" + escapeHtml(src) + "');background-size:cover;background-position:center" : photoStyle(p);
      return '<div class="ga-mosaic-item ga-mosaic-item--' + i + '" style="' + st + '"></div>';
    }).join("");
    var checkoutHref = "checkout.html?property=" + encodeURIComponent(p.id) +
      "&checkIn=" + encodeURIComponent(search.checkIn) +
      "&checkOut=" + encodeURIComponent(search.checkOut) +
      "&guests=" + encodeURIComponent(search.guests);
    root.innerHTML =
      '<div class="ga-mosaic">' + mosaic + '</div>' +
      '<div class="ga-listing-layout"><div class="ga-listing-main">' +
      "<h1>" + escapeHtml(p.name) + "</h1>" +
      '<p class="ga-listing-sub">★ ' + escapeHtml(p.rating) + " · " + escapeHtml(p.reviewCount) + "개 후기 · " + escapeHtml(p.locationLabel) + "</p>" +
      '<ul class="ga-stats"><li>' + escapeHtml(p.guests) + '명</li><li>침실 ' + escapeHtml(p.bedrooms) + '</li><li>침대 ' + escapeHtml(p.beds) + '</li><li>욕실 ' + escapeHtml(p.baths) + "</li></ul>" +
      '<hr class="ga-rule" /><div class="ga-host-row"><div class="ga-host-avatar">' + escapeHtml((p.hostName || "H")[0]) + "</div><div><strong>호스트 " + escapeHtml(p.hostName) + "</strong><br><span>" + escapeHtml(p.hostBio || "") + "</span></div></div>" +
      '<hr class="ga-rule" /><p>' + escapeHtml(p.description || p.summary) + "</p>" +
      '<h2 class="ga-h2">편의시설</h2><ul class="ga-amenities">' + (p.amenities || []).map(function (a) { return "<li>" + escapeHtml(a) + "</li>"; }).join("") + "</ul></div>" +
      '<aside class="ga-widget"><p class="ga-widget-price">' + D.formatPrice(p.pricePerNight) + ' <span>/ 박</span></p>' +
      '<form class="ga-widget-form" id="ga-widget-form">' +
      '<div class="ga-widget-dates"><label>체크인<input type="date" name="checkIn" value="' + escapeHtml(search.checkIn) + '" required /></label>' +
      '<label>체크아웃<input type="date" name="checkOut" value="' + escapeHtml(search.checkOut) + '" required /></label></div>' +
      '<label>인원<select name="guests">' + [1,2,3,4,5,6].map(function (n) {
        return '<option value="' + n + '"' + (n === search.guests ? " selected" : "") + ">" + n + "명</option>";
      }).join("") + "</select></label>" +
      '<ul class="ga-price-lines"><li><span>' + D.formatPrice(p.pricePerNight) + " × " + nights + '박</span><span id="ga-line-sub">' + D.formatPrice(subtotal) + "</span></li>" +
      "<li><span>청소비</span><span>" + D.formatPrice(cleaning) + "</span></li>" +
      '<li><span>서비스 수수료</span><span id="ga-line-svc">' + D.formatPrice(service) + "</span></li>" +
      '<li class="ga-price-total"><span>합계</span><span id="ga-total">' + D.formatPrice(total) + "</span></li></ul>" +
      (p.status === "active"
        ? '<a class="ga-btn ga-btn--primary ga-btn--block" href="' + checkoutHref + '" id="ga-reserve-btn">예약하기</a>'
        : '<button type="button" class="ga-btn ga-btn--disabled ga-btn--block" disabled>예약 불가</button>') +
      '<p class="ga-widget-note">예약 확정 전에는 요금이 청구되지 않습니다 (데모).</p></form></aside></div>';
    var form = document.getElementById("ga-widget-form");
    if (!form) return;
    form.addEventListener("change", function () {
      var fd = new FormData(form);
      var ci = String(fd.get("checkIn"));
      var co = String(fd.get("checkOut"));
      var g = String(fd.get("guests"));
      var n = daysBetween(ci, co);
      var sub = p.pricePerNight * n;
      var svc = Math.round(sub * 0.08);
      var tot = sub + cleaning + svc;
      var subEl = document.getElementById("ga-line-sub");
      var svcEl = document.getElementById("ga-line-svc");
      var totEl = document.getElementById("ga-total");
      if (subEl) subEl.textContent = D.formatPrice(sub);
      if (svcEl) svcEl.textContent = D.formatPrice(svc);
      if (totEl) totEl.textContent = D.formatPrice(tot);
      var btn = document.getElementById("ga-reserve-btn");
      if (btn) btn.href = "checkout.html?property=" + encodeURIComponent(p.id) + "&checkIn=" + encodeURIComponent(ci) + "&checkOut=" + encodeURIComponent(co) + "&guests=" + encodeURIComponent(g);
    });
  }

  function renderCheckout() {
    var D = global.PORTAL_DATA;
    var root = document.getElementById("ga-checkout-root");
    var p = D.getProperty(queryParam("property") || "home-1");
    if (!root) return;
    if (!p || p.status !== "active") {
      root.innerHTML = '<p class="ga-empty">예약할 수 없는 숙소입니다.</p>';
      return;
    }
    var checkIn = queryParam("checkIn") || getSearch().checkIn;
    var checkOut = queryParam("checkOut") || getSearch().checkOut;
    var guests = parseInt(queryParam("guests") || "2", 10);
    var nights = daysBetween(checkIn, checkOut);
    var total = p.pricePerNight * nights + 15000 + Math.round(p.pricePerNight * nights * 0.08);
    root.innerHTML =
      '<div class="ga-checkout-grid"><section><h1>예약 확인 및 결제</h1>' +
      '<form id="ga-checkout-form" class="ga-form"><h2>연락처</h2>' +
      '<label>이름<input name="name" type="text" value="김여행" required /></label>' +
      '<label>휴대폰<input name="phone" type="tel" value="010-0000-0000" required /></label>' +
      '<h2>요청 사항</h2><label><textarea name="note" placeholder="늦은 체크인 등 (선택)"></textarea></label>' +
      '<button type="submit" class="ga-btn ga-btn--primary ga-btn--block">예약 요청하기</button></form></section>' +
      '<aside class="ga-checkout-summary"><div class="ga-checkout-card">' +
      '<div class="ga-checkout-photo" style="' + photoStyle(p) + '"></div>' +
      "<h2>" + escapeHtml(p.name) + "</h2><p>" + escapeHtml(checkIn) + " → " + escapeHtml(checkOut) + " · " + nights + "박 · " + guests + "명</p>" +
      '<p class="ga-checkout-total"><strong>' + D.formatPrice(total) + "</strong></p></div></aside></div>";
    document.getElementById("ga-checkout-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var tripId = "trip-" + Date.now();
      addTrip({ id: tripId, propertyId: p.id, checkIn: checkIn, checkOut: checkOut, guests: guests, status: "pending", source: "guest", total: total });
      global.location.href = "booking.html?id=" + encodeURIComponent(tripId) + "&new=1";
    });
  }

  function renderTrips() {
    var D = global.PORTAL_DATA;
    var el = document.getElementById("ga-trips-list");
    if (!el) return;
    var trips = allGuestTrips();
    if (!trips.length) {
      el.innerHTML = '<div class="ga-empty-box"><p>아직 예약한 여행이 없습니다.</p><a class="ga-btn ga-btn--primary" href="./">숙소 둘러보기</a></div>';
      return;
    }
    el.innerHTML = trips.map(function (t) {
      var p = D.getProperty(t.propertyId);
      var status = t.status === "confirmed" ? "확정" : t.status === "pending" ? "대기" : "완료";
      return '<a class="ga-trip-card" href="booking.html?id=' + encodeURIComponent(t.id) + '">' +
        '<div class="ga-trip-photo" style="' + photoStyle(p || {}) + '"></div>' +
        '<div class="ga-trip-body"><h2>' + escapeHtml(p ? p.name : t.propertyId) + "</h2><p>" +
        escapeHtml(t.checkIn) + " – " + escapeHtml(t.checkOut) + '</p><span class="ga-trip-status">' + escapeHtml(status) + "</span></div></a>";
    }).join("");
  }

  function renderTripDetail() {
    var D = global.PORTAL_DATA;
    var U = global.PortalUI;
    var id = queryParam("id") || "b1";
    var b = D.getBooking(id);
    var extra = getExtraTrips().find(function (t) { return t.id === id; });
    var trip = b ? { id: b.id, propertyId: b.propertyId, checkIn: b.checkIn, checkOut: b.checkOut, status: b.status } : extra;
    var root = document.getElementById("ga-trip-root");
    if (!root) return;
    if (!trip) { root.innerHTML = '<p class="ga-empty">여행을 찾을 수 없습니다.</p>'; return; }
    var p = D.getProperty(trip.propertyId);
    var g = D.stayGuide[trip.propertyId];
    var guideHtml = "";
    if (g) {
      guideHtml = '<h2 class="ga-h2">숙소 안내</h2><dl class="ga-guide">' +
        [["checkIn","체크인"],["checkOut","체크아웃"],["wifi","Wi‑Fi"],["parking","주차"],["rules","이용 규칙"],["contact","연락처"]]
        .map(function (pair) { return "<dt>" + pair[1] + "</dt><dd>" + escapeHtml(g[pair[0]]) + "</dd>"; }).join("") + "</dl>";
    }
    root.innerHTML =
      (queryParam("new") === "1" ? '<p class="ga-banner">예약 요청이 접수되었습니다 (데모).</p>' : "") +
      '<div class="ga-trip-detail"><div class="ga-trip-hero" style="' + photoStyle(p || {}) + '"></div>' +
      "<h1>" + escapeHtml(p ? p.name : trip.propertyId) + "</h1><p>" + escapeHtml(trip.checkIn) + " → " + escapeHtml(trip.checkOut) +
      " · " + (U ? U.statusBadge(trip.status) : escapeHtml(trip.status)) + "</p>" + guideHtml +
      '<div class="ga-trip-actions"><a class="ga-btn ga-btn--ghost" href="messages.html">호스트에게 문의</a>' +
      (p ? '<a class="ga-btn ga-btn--ghost" href="listing.html?id=' + encodeURIComponent(p.id) + '">숙소 다시 보기</a>' : "") +
      "</div></div>";
  }

  function renderMessages() {
    var D = global.PORTAL_DATA;
    var U = global.PortalUI;
    var el = document.getElementById("ga-messages-list");
    if (!el) return;
    el.innerHTML = D.messages.filter(function (m) {
      return m.fromRole === "guest" || m.bookingId === "b1";
    }).map(function (m) {
      var p = D.getProperty(m.propertyId);
      return '<article class="ga-msg"><div class="ga-msg-head"><strong>' + escapeHtml(m.subject) +
        "</strong><time>" + escapeHtml(m.createdAt) + '</time></div><p class="ga-msg-prop"> +
        escapeHtml(p ? p.name : "") + "</p><p>" + escapeHtml(m.body) + "</p></article>";
    }).join("");
    if (U) U.initMessageForm("guest-message-form", "guest");
  }

  global.GuestApp = {
    mountHeader: mountHeader,
    renderExplore: renderExplore,
    renderListing: renderListing,
    renderCheckout: renderCheckout,
    renderTrips: renderTrips,
    renderTripDetail: renderTripDetail,
    renderMessages: renderMessages,
  };
})(typeof window !== "undefined" ? window : global);
