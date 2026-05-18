/**
 * 게스트 숙소 예약 UI (에어비앤비형)
 */
(function (global) {
  "use strict";
  var TRIPS_KEY = "hangro_guest_trips";
  var SEARCH_KEY = "hangro_guest_search";

  function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function queryParam(name) { return new URLSearchParams(global.location.search).get(name); }
  function daysBetween(a, b) {
    var d1 = new Date(a + "T12:00:00"), d2 = new Date(b + "T12:00:00");
    return Math.max(1, Math.round((d2 - d1) / 86400000));
  }
  function todayISO() { return new Date().toISOString().slice(0, 10); }
  function defaultCheckOut(checkIn) {
    var d = new Date(checkIn + "T12:00:00"); d.setDate(d.getDate() + 2);
    return d.toISOString().slice(0, 10);
  }
  function getSearch() {
    try { var raw = global.sessionStorage.getItem(SEARCH_KEY); if (raw) return JSON.parse(raw); } catch (e) {}
    var ci = todayISO();
    return { where: "", checkIn: ci, checkOut: defaultCheckOut(ci), guests: 2 };
  }
  function saveSearch(s) { try { global.sessionStorage.setItem(SEARCH_KEY, JSON.stringify(s)); } catch (e) {} }
  function getExtraTrips() { try { return JSON.parse(global.localStorage.getItem(TRIPS_KEY) || "[]"); } catch (e) { return []; } }
  function addTrip(trip) {
    var list = getExtraTrips(); list.unshift(trip);
    global.localStorage.setItem(TRIPS_KEY, JSON.stringify(list.slice(0, 30)));
  }
  function allGuestTrips() {
    var P = global.PORTAL_DATA;
    if (!P) return getExtraTrips();
    var base = P.bookingsForGuest(P.demoGuestId).map(function (b) {
      return { id: b.id, propertyId: b.propertyId, checkIn: b.checkIn, checkOut: b.checkOut, status: b.status, guests: 2 };
    });
    return getExtraTrips().concat(base);
  }
  function photoStyle(p) {
    if (p.photos && p.photos.length) {
      return "background-image:url('" + escapeHtml(p.photos[0]) + "');background-size:cover;background-position:center";
    }
    var themes = {
      forest: "linear-gradient(135deg,#2d5a4a 0%,#7cb88a 100%)",
      hanok: "linear-gradient(135deg,#8b6914 0%,#c4a35a 100%)",
      ocean: "linear-gradient(135deg,#1a5f7a 0%,#57c5d4 100%)",
      mountain: "linear-gradient(135deg,#4a5568 0%,#a0aec0 100%)",
      sunset: "linear-gradient(135deg,#c05621 0%,#f6ad55 100%)",
      lavender: "linear-gradient(135deg,#6b46c1 0%,#b794f4 100%)",
      rural: "linear-gradient(135deg,#744210 0%,#d69e2e 100%)",
      studio: "linear-gradient(135deg,#2d3748 0%,#718096 100%)",
    };
    return "background:" + (themes[p.photoTheme] || "linear-gradient(135deg,#5a6358 0%,#9aa89a 100%)");
  }
  function renderHeader(active) {
    var items = [
      { id: "explore", href: "./", label: "숙소 찾기" },
      { id: "trips", href: "bookings.html", label: "여행" },
      { id: "messages", href: "messages.html", label: "메시지" }
    ];
    var nav = items.map(function (it) {
      var ac = it.id === active ? ' aria-current="page"' : "";
      return '<a href="' + it.href + '"' + ac + ">" + escapeHtml(it.label) + "</a>";
    }).join("");
    return '<header class="ga-header"><div class="ga-wrap ga-nav">' +
      '<a href="./" class="ga-logo"><span class="ga-logo-mark" aria-hidden="true"></span>머무름</a>' +
      '<nav class="ga-nav-links" aria-label="게스트">' + nav + '</nav>' +
      '<a href="bookings.html" class="ga-avatar" title="내 여행">게</a></div></header>';
  }
  function mountHeader(active) {
    var el = document.getElementById("ga-header-mount");
    if (el) el.innerHTML = renderHeader(active);
  }
  function renderSearchBar(action) {
    var s = getSearch();
    return '<form class="ga-search" method="get" action="' + escapeHtml(action || "index.html") + '">' +
      '<label class="ga-search-field"><span class="ga-search-label">지역</span><input type="text" name="where" placeholder="어디로?" value="' + escapeHtml(s.where) + '" /></label>' +
      '<label class="ga-search-field"><span class="ga-search-label">체크인</span><input type="date" name="checkIn" value="' + escapeHtml(s.checkIn) + '" required /></label>' +
      '<label class="ga-search-field"><span class="ga-search-label">체크아웃</span><input type="date" name="checkOut" value="' + escapeHtml(s.checkOut) + '" required /></label>' +
      '<label class="ga-search-field"><span class="ga-search-label">인원</span><select name="guests">' +
      [1,2,3,4,5,6].map(function (n) { return '<option value="' + n + '"' + (n === s.guests ? ' selected' : '') + '>' + n + '명</option>'; }).join('') +
      '</select></label><button type="submit" class="ga-search-btn">검색</button></form>';
  }
  function bindSearchFromQuery() {
    var q = new URLSearchParams(global.location.search);
    if (!q.has("checkIn") && !q.has("where")) return getSearch();
    var s = { where: q.get("where") || "", checkIn: q.get("checkIn") || todayISO(), checkOut: q.get("checkOut") || defaultCheckOut(q.get("checkIn") || todayISO()), guests: parseInt(q.get("guests") || "2", 10) || 2 };
    saveSearch(s); return s;
  }
  function filterProperties(list, search) {
    return list.filter(function (p) {
      if (p.guests < search.guests) return false;
      if (!search.where.trim()) return true;
      var w = search.where.trim().toLowerCase();
      return (p.region && p.region.toLowerCase().indexOf(w) !== -1) || (p.locationLabel && p.locationLabel.toLowerCase().indexOf(w) !== -1) || (p.name && p.name.toLowerCase().indexOf(w) !== -1);
    });
  }
  function listingCard(p, search) {
    var P = global.PORTAL_DATA;
    var href = "listing.html?id=" + encodeURIComponent(p.id) + "&checkIn=" + encodeURIComponent(search.checkIn) + "&checkOut=" + encodeURIComponent(search.checkOut) + "&guests=" + encodeURIComponent(search.guests);
    var nights = daysBetween(search.checkIn, search.checkOut);
    return '<a class="ga-card" href="' + href + '"><div class="ga-card-photo" style="' + photoStyle(p) + '"></div><div class="ga-card-body"><div class="ga-card-top"><h2>' + escapeHtml(p.name) + '</h2><span class="ga-rating">★ ' + escapeHtml(p.rating) + ' (' + escapeHtml(p.reviewCount) + ')</span></div><p class="ga-card-loc">' + escapeHtml(p.locationLabel) + '</p><p class="ga-card-meta">' + escapeHtml(p.propertyType) + ' · ' + escapeHtml(p.guests) + '명</p><p class="ga-card-price"><strong>' + P.formatPrice(p.pricePerNight * nights) + '</strong> <span>(' + nights + '박)</span></p></div></a>';
  }
  function renderExplore() {
    var P = global.PORTAL_DATA;
    bindSearchFromQuery();
    var search = getSearch();
    var mount = document.getElementById("ga-search-mount");
    if (mount) mount.innerHTML = renderSearchBar("index.html");
    var grid = document.getElementById("ga-listings");
    if (!grid) return;
    var list = filterProperties(P.listBookable(), search);
    grid.innerHTML = list.length ? list.map(function (p) { return listingCard(p, search); }).join("") : '<p class="ga-empty">조건에 맞는 숙소가 없습니다.</p>';
  }
  function renderListing() {
    var P = global.PORTAL_DATA, id = queryParam("id") || "home-1", p = P.getProperty(id), root = document.getElementById("ga-listing-root");
    if (!p || !root) { if (root) root.innerHTML = '<p class="ga-empty">숙소를 찾을 수 없습니다.</p>'; return; }
    var search = { checkIn: queryParam("checkIn") || getSearch().checkIn, checkOut: queryParam("checkOut") || getSearch().checkOut, guests: parseInt(queryParam("guests") || String(getSearch().guests), 10) || 2 };
    saveSearch(Object.assign(getSearch(), search));
    var nights = daysBetween(search.checkIn, search.checkOut), cleaning = 15000, subtotal = p.pricePerNight * nights, service = Math.round(subtotal * 0.08), total = subtotal + cleaning + service;
    var photos = (p.photos && p.photos.length ? p.photos.slice() : [null]); while (photos.length < 5) photos.push(photos[0]);
    var mosaic = photos.slice(0, 5).map(function (src, i) {
      var style = src ? "background-image:url('" + escapeHtml(src) + "');background-size:cover;background-position:center" : photoStyle(p);
      return '<div class="ga-mosaic-item ga-mosaic-item--' + i + '" style="' + style + '"></div>';
    }).join("");
    var checkoutHref = "checkout.html?property=" + encodeURIComponent(p.id) + "&checkIn=" + encodeURIComponent(search.checkIn) + "&checkOut=" + encodeURIComponent(search.checkOut) + "&guests=" + encodeURIComponent(search.guests);
    root.innerHTML = '<div class="ga-mosaic">' + mosaic + '</div><div class="ga-listing-layout"><div class="ga-listing-main"><h1>' + escapeHtml(p.name) + '</h1><p class="ga-listing-sub"><span class="ga-rating">★ ' + escapeHtml(p.rating) + '</span> · ' + escapeHtml(p.reviewCount) + '개 후기 · ' + escapeHtml(p.locationLabel) + '</p><ul class="ga-stats"><li>' + escapeHtml(p.guests) + '명</li><li>침실 ' + escapeHtml(p.bedrooms) + '</li><li>침대 ' + escapeHtml(p.beds) + '</li><li>욕실 ' + escapeHtml(p.baths) + '</li></ul><hr class="ga-rule" /><div class="ga-host-row"><div class="ga-host-avatar">' + escapeHtml((p.hostName||"H")[0]) + '</div><div><strong>호스트 ' + escapeHtml(p.hostName) + '</strong><br><span>' + escapeHtml(p.hostBio||"") + '</span></div></div><hr class="ga-rule" /><p>' + escapeHtml(p.description||p.summary) + '</p><h2 class="ga-h2">편의시설</h2><ul class="ga-amenities">' + (p.amenities||[]).map(function(a){return "<li>"+escapeHtml(a)+"</li>";}).join("") + '</ul></div><aside class="ga-widget"><p class="ga-widget-price">' + P.formatPrice(p.pricePerNight) + ' <span>/ 박</span></p><form class="ga-widget-form" id="ga-widget-form"><div class="ga-widget-dates"><label>체크인<input type="date" name="checkIn" value="' + escapeHtml(search.checkIn) + '" required /></label><label>체크아웃<input type="date" name="checkOut" value="' + escapeHtml(search.checkOut) + '" required /></label></div><label>인원<select name="guests">' + [1,2,3,4,5,6].map(function(n){return '<option value="'+n+'"'+(n===search.guests?' selected':'')+'>'+n+'명</option>';}).join("") + '</select></label><ul class="ga-price-lines"><li><span>' + P.formatPrice(p.pricePerNight) + ' × ' + nights + '박</span><span id="ga-line-sub">' + P.formatPrice(subtotal) + '</span></li><li><span>청소비</span><span>' + P.formatPrice(cleaning) + '</span></li><li><span>수수료</span><span id="ga-line-svc">' + P.formatPrice(service) + '</span></li><li class="ga-price-total"><span>합계</span><span id="ga-total">' + P.formatPrice(total) + '</span></li></ul>' + (p.status==="active"?'<a class="ga-btn ga-btn--primary ga-btn--block" href="'+checkoutHref+'" id="ga-reserve-btn">예약하기</a>':'<button type="button" class="ga-btn ga-btn--disabled ga-btn--block" disabled>예약 불가</button>') + '<p class="ga-widget-note">데모: 확정 전 요금 미청구</p></form></aside></div>';
    var form = document.getElementById("ga-widget-form");
    if (form) form.addEventListener("change", function () {
      var fd = new FormData(form), ci = String(fd.get("checkIn")), co = String(fd.get("checkOut")), g = String(fd.get("guests"));
      var n = daysBetween(ci, co), sub = p.pricePerNight * n, svc = Math.round(sub * 0.08), tot = sub + cleaning + svc;
      var el = document.getElementById("ga-line-sub"); if (el) el.textContent = P.formatPrice(sub);
      el = document.getElementById("ga-line-svc"); if (el) el.textContent = P.formatPrice(svc);
      el = document.getElementById("ga-total"); if (el) el.textContent = P.formatPrice(tot);
      el = document.getElementById("ga-reserve-btn"); if (el) el.href = "checkout.html?property=" + encodeURIComponent(p.id) + "&checkIn=" + encodeURIComponent(ci) + "&checkOut=" + encodeURIComponent(co) + "&guests=" + encodeURIComponent(g);
    });
  }
  function renderCheckout() {
    var P = global.PORTAL_DATA, id = queryParam("property") || "home-1", p = P.getProperty(id), root = document.getElementById("ga-checkout-root");
    if (!root) return;
    if (!p || p.status !== "active") { root.innerHTML = '<p class="ga-empty">예약할 수 없습니다.</p>'; return; }
    var checkIn = queryParam("checkIn") || getSearch().checkIn, checkOut = queryParam("checkOut") || getSearch().checkOut, guests = parseInt(queryParam("guests") || "2", 10);
    var nights = daysBetween(checkIn, checkOut), total = p.pricePerNight * nights + 15000 + Math.round(p.pricePerNight * nights * 0.08);
    root.innerHTML = '<div class="ga-checkout-grid"><section><h1>예약 확인</h1><form id="ga-checkout-form" class="ga-form"><h2>연락처</h2><label>이름<input name="name" value="김여행" required /></label><label>휴대폰<input name="phone" value="010-0000-0000" required /></label><h2>요청</h2><label><textarea name="note" placeholder="선택"></textarea></label><button type="submit" class="ga-btn ga-btn--primary ga-btn--block">예약 요청</button></form></section><aside class="ga-checkout-summary"><div class="ga-checkout-card"><div class="ga-checkout-photo" style="'+photoStyle(p)+'"></div><h2>'+escapeHtml(p.name)+'</h2><p>'+escapeHtml(checkIn)+' → '+escapeHtml(checkOut)+' · '+nights+'박</p><p class="ga-checkout-total"><strong>'+P.formatPrice(total)+'</strong></p></div></aside></div>';
    document.getElementById("ga-checkout-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var tripId = "trip-" + Date.now();
      addTrip({ id: tripId, propertyId: p.id, checkIn: checkIn, checkOut: checkOut, guests: guests, status: "pending" });
      global.location.href = "booking.html?id=" + encodeURIComponent(tripId) + "&new=1";
    });
  }
  function renderTrips() {
    var P = global.PORTAL_DATA, el = document.getElementById("ga-trips-list");
    if (!el) return;
    var trips = allGuestTrips();
    if (!trips.length) { el.innerHTML = '<div class="ga-empty-box"><p>예약한 여행이 없습니다.</p><a class="ga-btn ga-btn--primary" href="./">숙소 찾기</a></div>'; return; }
    el.innerHTML = trips.map(function (t) {
      var p = P.getProperty(t.propertyId), st = t.status === "confirmed" ? "확정" : t.status === "pending" ? "대기" : "완료";
      return '<a class="ga-trip-card" href="booking.html?id='+encodeURIComponent(t.id)+'"><div class="ga-trip-photo" style="'+photoStyle(p||{})+'"></div><div class="ga-trip-body"><h2>'+escapeHtml(p?p.name:t.propertyId)+'</h2><p>'+escapeHtml(t.checkIn)+' – '+escapeHtml(t.checkOut)+'</p><span class="ga-trip-status">'+escapeHtml(st)+'</span></div></a>';
    }).join("");
  }
  function renderTripDetail() {
    var P = global.PORTAL_DATA, U = global.PortalUI, id = queryParam("id") || "b1";
    var b = P.getBooking(id), extra = getExtraTrips().find(function (t) { return t.id === id; });
    var trip = b ? { id: b.id, propertyId: b.propertyId, checkIn: b.checkIn, checkOut: b.checkOut, status: b.status } : extra;
    var root = document.getElementById("ga-trip-root");
    if (!root) return;
    if (!trip) { root.innerHTML = '<p class="ga-empty">여행을 찾을 수 없습니다.</p>'; return; }
    var p = P.getProperty(trip.propertyId), g = P.stayGuide[trip.propertyId], guide = "";
    if (g) guide = '<h2 class="ga-h2">숙소 안내</h2><dl class="ga-guide">' + [["checkIn","체크인"],["checkOut","체크아웃"],["wifi","Wi-Fi"],["parking","주차"],["rules","규칙"],["contact","연락"]].map(function (pair) { return "<dt>"+pair[1]+"</dt><dd>"+escapeHtml(g[pair[0]])+"</dd>"; }).join("") + "</dl>";
    root.innerHTML = (queryParam("new")==="1"?'<p class="ga-banner">예약 요청이 접수되었습니다 (데모).</p>':"") + '<div class="ga-trip-detail"><div class="ga-trip-hero" style="'+photoStyle(p||{})+'"></div><h1>'+escapeHtml(p?p.name:trip.propertyId)+'</h1><p>'+escapeHtml(trip.checkIn)+' → '+escapeHtml(trip.checkOut)+(U?(" · "+U.statusBadge(trip.status)):"")+'</p>'+guide+'<div class="ga-trip-actions"><a class="ga-btn ga-btn--ghost" href="messages.html">문의</a>'+(p?'<a class="ga-btn ga-btn--ghost" href="listing.html?id='+encodeURIComponent(p.id)+'">숙소 보기</a>':"")+'</div></div>';
  }
  function renderMessages() {
    var P = global.PORTAL_DATA, U = global.PortalUI, el = document.getElementById("ga-messages-list");
    if (!el) return;
    el.innerHTML = P.messages.filter(function (m) { return m.fromRole === "guest" || m.bookingId === "b1"; }).map(function (m) {
      var p = P.getProperty(m.propertyId);
      return '<article class="ga-msg"><div class="ga-msg-head"><strong>'+escapeHtml(m.subject)+'</strong><time>'+escapeHtml(m.createdAt)+'</time></div><p class="ga-msg-prop">'+escapeHtml(p?p.name:"")+'</p><p>'+escapeHtml(m.body)+'</p></article>';
    }).join("");
    if (U) U.initMessageForm("guest-message-form", "guest");
  }
  global.GuestApp = { mountHeader: mountHeader, renderExplore: renderExplore, renderListing: renderListing, renderCheckout: renderCheckout, renderTrips: renderTrips, renderTripDetail: renderTripDetail, renderMessages: renderMessages };
})(typeof window !== "undefined" ? window : global);
