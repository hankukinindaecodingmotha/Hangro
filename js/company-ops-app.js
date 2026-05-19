/**
 * 회사 운영 포털
 */
(function (global) {
  "use strict";

  var PAGES = {
    dashboard: renderDashboard,
    guests: renderGuests,
    hosts: renderHosts,
    properties: renderProperties,
    bookings: renderBookings,
    messages: renderMessages,
  };

  function D() { return global.PORTAL_DATA; }

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function badge(status) {
    var map = {
      active: "운영 중", paused: "일시 중단", pending: "대기",
      confirmed: "확정", rejected: "거절", open: "미답", closed: "완료",
    };
    return '<span class="portal-badge portal-badge--' + esc(status) + '">' + esc(map[status] || status) + "</span>";
  }

  function allProperties() {
    var rows = [];
    if (!D() || !D().getProperty) return rows;
    for (var i = 1; i <= 18; i++) {
      var p = D().getProperty("home-" + i);
      if (p) rows.push(p);
    }
    return rows;
  }

  function allBookings() {
    if (!D() || !D().getBooking) return [];
    return ["b1", "b2", "b3", "b4", "b5"].map(function (id) {
      return D().getBooking(id);
    }).filter(Boolean);
  }

  function renderDashboard() {
    var root = document.getElementById("co-dashboard-root");
    if (!root || !D()) return;
    var props = allProperties();
    var bookings = allBookings();
    var guests = D().listGuests ? D().listGuests() : [];
    var openMsg = D().openMessagesCount
      ? D().openMessagesCount(props.map(function (p) { return p.id; }))
      : 0;

    root.innerHTML =
      '<div class="portal-grid portal-grid--4 co-kpis">' +
      '<article class="portal-card portal-kpi"><strong>' + props.length + '</strong><span>등록 숙소</span></article>' +
      '<article class="portal-card portal-kpi"><strong>' + bookings.length + '</strong><span>예약</span></article>' +
      '<article class="portal-card portal-kpi"><strong>' + guests.length + '</strong><span>게스트</span></article>' +
      '<article class="portal-card portal-kpi"><strong>' + openMsg + '</strong><span>미답 문의</span></article>' +
      '</div>' +
      '<section class="co-quick"><h2 class="portal-section-title">바로가기</h2><div class="co-quick-grid">' +
      '<a class="portal-card co-quick-card" href="guests.html"><strong>게스트 관리</strong><span>예약·프로필</span></a>' +
      '<a class="portal-card co-quick-card" href="hosts.html"><strong>집주인 관리</strong><span>숙소·운영</span></a>' +
      '<a class="portal-card co-quick-card" href="properties.html"><strong>숙소</strong><span>전체 목록</span></a>' +
      '<a class="portal-card co-quick-card" href="bookings.html"><strong>예약</strong><span>일정·상태</span></a>' +
      '</div></section>' +
      '<h2 class="portal-section-title">최근 예약</h2><div class="portal-table-wrap"><table class="portal-table"><thead><tr><th>게스트</th><th>숙소</th><th>일정</th><th>상태</th></tr></thead><tbody>' +
      bookings.slice(0, 8).map(function (b) {
        var p = D().getProperty(b.propertyId);
        return '<tr><td>' + esc(b.guestName) + '</td><td>' + esc(p ? p.name : b.propertyId) +
          '</td><td>' + esc(b.checkIn) + ' – ' + esc(b.checkOut) + '</td><td>' + badge(b.status) + '</td></tr>';
      }).join('') + '</tbody></table></div>';
    root.innerHTML = root.innerHTML.replace('</div>', '</div>');
  }

  function renderGuests() {
    var root = document.getElementById("co-guests-root");
    if (!root || !D() || !D().listGuests) return;
    var guests = D().listGuests();
    if (!guests.length) { root.innerHTML = '<p class="portal-empty">게스트가 없습니다.</p>'; return; }
    root.innerHTML = '<div class="portal-table-wrap"><table class="portal-table"><thead><tr><th>이름</th><th>ID</th><th>예약</th><th>최근 숙소</th><th></th></tr></thead><tbody>' +
      guests.map(function (g) {
        var last = g.lastTrip;
        var prop = last && D().getProperty(last.propertyId);
        return '<tr><td><strong>' + esc(g.name) + '</strong></td><td><code>' + esc(g.id) + '</code></td><td>' + g.tripCount +
          '</td><td>' + esc(prop ? prop.name : '—') + '</td><td><a class="btn btn-ghost btn-sm" href="../../guest/trips.html" target="_blank" rel="noopener">포털</a></td></tr>';
      }).join('') + '</tbody></table></div>';
    root.innerHTML = root.innerHTML.replace('<div', '<div').replace('</div>', '</div>').replace('<div class="portal-table-wrap">', '<div class="portal-table-wrap">');
  }

  function renderHosts() {
    var root = document.getElementById("co-hosts-root");
    if (!root || !D() || !D().listHosts) return;
    var hosts = D().listHosts();
    root.innerHTML = '<div class="portal-table-wrap"><table class="portal-table"><thead><tr><th>집주인</th><th>ID</th><th>숙소</th><th>운영 중</th><th>지역</th><th></th></tr></thead><tbody>' +
      hosts.map(function (h) {
        return '<tr><td><strong>' + esc(h.name) + '</strong></td><td><code>' + esc(h.id) + '</code></td><td>' + h.propertyCount +
          '</td><td>' + h.activeCount + '</td><td>' + esc(h.region || '—') +
          '</td><td><a class="btn btn-ghost btn-sm" href="../../host/properties.html" target="_blank" rel="noopener">포털</a></td></tr>';
      }).join('') + '</tbody></table></div>';
  }

  function renderProperties() {
    var root = document.getElementById("co-properties-root");
    if (!root || !D()) return;
    root.innerHTML = '<div class="portal-grid portal-grid--2">' + allProperties().map(function (p) {
      return '<article class="portal-card"><h3>' + esc(p.name) + '</h3><p>' + badge(p.status) + ' · ' + esc(p.locationLabel || '') +
        '</p><div class="portal-card-actions"><a class="btn btn-ghost" href="../../guest/listing.html?id=' + encodeURIComponent(p.id) +
        '" target="_blank" rel="noopener">게스트</a><a class="btn btn-primary" href="../../host/property-edit.html?id=' + encodeURIComponent(p.id) +
        '" target="_blank" rel="noopener">집주인 수정</a></div></article>';
    }).join('') + '</div>';
  }

  function renderBookings() {
    var root = document.getElementById("co-bookings-root");
    if (!root || !D()) return;
    root.innerHTML = '<div class="portal-table-wrap"><table class="portal-table"><thead><tr><th>ID</th><th>게스트</th><th>숙소</th><th>일정</th><th>상태</th></tr></thead><tbody>' +
      allBookings().map(function (b) {
        var p = D().getProperty(b.propertyId);
        return '<tr><td>' + esc(b.id) + '</td><td>' + esc(b.guestName) + '</td><td>' + esc(p ? p.name : '') +
          '</td><td>' + esc(b.checkIn) + ' – ' + esc(b.checkOut) + '</td><td>' + badge(b.status) + '</td></tr>';
      }).join('') + '</tbody></table></div>';
    root.innerHTML = root.innerHTML.replace('</div>', '</div>');
  }

  function renderMessages() {
    var root = document.getElementById("co-messages-root");
    if (!root || !D()) return;
    var list = D().messagesForPropertyIds(allProperties().map(function (p) { return p.id; }));
    root.innerHTML = list.length
      ? '<ul class="portal-list portal-card">' + list.map(function (m) {
          return '<li><strong>' + esc(m.subject) + '</strong><span class="meta">' + esc(m.fromName) + ' · ' + badge(m.status) + '<br>' + esc(m.body) + '</span></li>';
        }).join('') + '</ul>'
      : '<p class="portal-empty">문의가 없습니다.</p>';
  }

  function boot() {
    var page = (document.body && document.body.getAttribute("data-co-page")) || "dashboard";
    var fn = PAGES[page];
    if (fn) fn();
    var logoutBtn = document.getElementById("co-logout");
    if (logoutBtn && global.CompanyOpsGuard) {
      logoutBtn.addEventListener("click", function (e) {
        e.preventDefault();
        global.CompanyOpsGuard.logout();
        global.location.href = "index.html";
      });
    }
  }

  global.CompanyOpsApp = { boot: boot };
  if (document.body && document.body.getAttribute("data-co-app") === "auto") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
    else boot();
  }
})(typeof window !== "undefined" ? window : global);
