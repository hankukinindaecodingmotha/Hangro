/**
 * 집주인 포털 앱 (HostApp)
 * ─────────────────────────────────────────────────────────────
 * 의존: portal-data.js, portal-ui.js
 * HTML: data-host-page="dashboard|bookings|properties|messages|property-edit"
 * localStorage: hangro_host_booking_status (승인/거절), hangro_guest_trips 와 동기화
 * 진입: HostApp.autoBoot()
 */
(function (global) {
  "use strict";

  var STATUS_KEY = "hangro_host_booking_status";  // 예약 id → confirmed|rejected 등
  var GUEST_TRIPS_KEY = "hangro_guest_trips";     // 게스트가 만든 trip-* 상태 동기화
  var CAL_MONTH_KEY = "hangro_host_cal_month";    // 캘린더 UI 현재 연·월

  var PAGE_RENDERERS = {  // data-host-page → 렌더 함수
    dashboard: renderDashboard,
    bookings: renderBookings,
    properties: renderProperties,
    messages: renderMessages,
    "property-edit": renderPropertyEdit,
  };

  function D() { return global.PORTAL_DATA; }
  function U() { return global.PortalUI; }

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function qp(name) { return new URLSearchParams(global.location.search).get(name); }

  function hostId() {  // 데모 집주인 id (portal-data.demoHostId)
    var data = D();
    return (data && data.demoHostId) || "host-a";
  }

  function hostProperties() {  // 현재 집주인 소유 숙소만
    return D().properties.filter(function (p) { return p.hostId === hostId(); });
  }

  function hostPropertyIds() {
    return hostProperties().map(function (p) { return p.id; });
  }

  function statusOverrides() {
    try { return JSON.parse(global.localStorage.getItem(STATUS_KEY) || "{}"); }
    catch (e) { return {}; }
  }

  function setBookingStatus(bookingId, status) {  // 승인/거절 저장 + 게스트 trip 동기화 + API
    var o = statusOverrides();
    o[bookingId] = status;
    global.localStorage.setItem(STATUS_KEY, JSON.stringify(o));
    syncGuestTripStatus(bookingId, status);
    if (global.PortalAPI && global.PortalAPI.patchBooking) {
      global.PortalAPI.patchBooking(bookingId, { status: status });
    }
  }

  function syncGuestTripStatus(tripId, status) {
    if (tripId.indexOf("trip-") !== 0) return;
    try {
      var list = JSON.parse(global.localStorage.getItem(GUEST_TRIPS_KEY) || "[]");
      var changed = false;
      list = list.map(function (t) {
        if (t.id === tripId && t.status !== status) {
          changed = true;
          return Object.assign({}, t, { status: status });
        }
        return t;
      });
      if (changed) global.localStorage.setItem(GUEST_TRIPS_KEY, JSON.stringify(list));
    } catch (e) {}
  }

  function resolveStatus(booking) {
    var o = statusOverrides();
    if (o[booking.id]) return o[booking.id];
    return booking.status;
  }

  function guestExtraBookings() {
    var ids = hostPropertyIds();
    try {
      var list = JSON.parse(global.localStorage.getItem(GUEST_TRIPS_KEY) || "[]");
      return list.filter(function (t) { return ids.indexOf(t.propertyId) !== -1; }).map(function (t) {
        return {
          id: t.id,
          propertyId: t.propertyId,
          guestName: "게스트 (요청)",
          guestId: "guest-demo",
          checkIn: t.checkIn,
          checkOut: t.checkOut,
          status: t.status || "pending",
          note: t.note || "",
        };
      });
    } catch (e) { return []; }
  }

  function allHostBookings() {
    var data = D();
    var base = data.bookingsForHost(hostId()).map(function (b) {
      return Object.assign({}, b, { status: resolveStatus(b) });
    });
    var extras = guestExtraBookings().map(function (b) {
      return Object.assign({}, b, { status: resolveStatus(b) });
    });
    var seen = {};
    var merged = base.concat(extras).filter(function (b) {
      if (seen[b.id]) return false;
      seen[b.id] = true;
      return true;
    });
    return merged.sort(function (a, b) {
      return a.checkIn < b.checkIn ? -1 : a.checkIn > b.checkIn ? 1 : 0;
    });
  }

  function activeBookings() {
    return allHostBookings().filter(function (b) {
      return b.status === "confirmed" || b.status === "pending";
    });
  }

  function parseDate(iso) {
    return new Date(iso + "T12:00:00");
  }

  function dateISO(d) {
    return d.toISOString().slice(0, 10);
  }

  function eachNight(checkIn, checkOut, fn) {
    var d = parseDate(checkIn);
    var end = parseDate(checkOut);
    while (d < end) {
      fn(dateISO(d), d);
      d.setDate(d.getDate() + 1);
    }
  }

  function bookingsOnDay(dayISO) {
    return allHostBookings().filter(function (b) {
      if (b.status === "rejected") return false;
      var d = parseDate(dayISO);
      return d >= parseDate(b.checkIn) && d < parseDate(b.checkOut);
    });
  }

  function getCalMonth() {
    try {
      var raw = global.sessionStorage.getItem(CAL_MONTH_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    var now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  }

  function saveCalMonth(y, m) {
    try { global.sessionStorage.setItem(CAL_MONTH_KEY, JSON.stringify({ year: y, month: m })); } catch (e) {}
  }

  function badge(status) {
    var ui = U();
    return ui && ui.statusBadge ? ui.statusBadge(status) : esc(status);
  }

  function formatRange(a, b) {
    var ui = U();
    return ui && ui.formatDateRange ? ui.formatDateRange(a, b) : esc(a) + " → " + esc(b);
  }

  var V = {
    subnav: function (active) {
      var items = [
        { id: "dashboard", href: "./", label: "홈" },
        { id: "properties", href: "properties.html", label: "내 숙소" },
        { id: "bookings", href: "bookings.html", label: "예약" },
        { id: "messages", href: "messages.html", label: "문의함" },
      ];
      return '<nav class="portal-subnav wrap" aria-label="집주인 메뉴">' +
        items.map(function (it) {
          return '<a href="' + it.href + '"' + (it.id === active ? ' aria-current="page"' : "") + ">" + esc(it.label) + "</a>";
        }).join("") + "</nav>";
    },

    bookingActions: function (b) {
      if (b.status !== "pending") {
        return '<span class="ha-actions-muted">—</span>';
      }
      return '<div class="ha-actions">' +
        '<button type="button" class="btn btn-primary btn-sm ha-approve" data-id="' + esc(b.id) + '">승인</button>' +
        '<button type="button" class="btn btn-ghost btn-sm ha-reject" data-id="' + esc(b.id) + '">거절</button>' +
        "</div>";
    },

    calendar: function (year, month) {
      var props = hostProperties();
      var propMap = {};
      props.forEach(function (p, i) { propMap[p.id] = { name: p.name, color: "ha-cal-color--" + (i % 6) }; });

      var first = new Date(year, month, 1);
      var startPad = first.getDay();
      var daysInMonth = new Date(year, month + 1, 0).getDate();
      var monthLabel = year + "년 " + (month + 1) + "월";

      var prevM = month === 0 ? 11 : month - 1;
      var prevY = month === 0 ? year - 1 : year;
      var nextM = month === 11 ? 0 : month + 1;
      var nextY = month === 11 ? year + 1 : year;

      var weekdays = ["일", "월", "화", "수", "목", "금", "토"];
      var head = weekdays.map(function (w) { return "<th>" + w + "</th>"; }).join("");

      var rows = "";
      var totalCells = Math.ceil((startPad + daysInMonth) / 7) * 7;
      for (var i = 0; i < totalCells; i++) {
        if (i % 7 === 0) rows += "<tr>";
        var dayNum = i - startPad + 1;
        if (dayNum < 1 || dayNum > daysInMonth) {
          rows += '<td class="ha-cal-day ha-cal-day--empty"></td>';
        } else {
          var iso = year + "-" + String(month + 1).padStart(2, "0") + "-" + String(dayNum).padStart(2, "0");
          var today = dateISO(new Date()) === iso;
          var dayBookings = bookingsOnDay(iso);
          var bars = dayBookings.map(function (b) {
            var meta = propMap[b.propertyId] || { name: b.propertyId, color: "ha-cal-color--0" };
            var label = esc(b.guestName) + " · " + esc(meta.name);
            var st = b.status === "pending" ? " ha-cal-bar--pending" : "";
            return '<a href="bookings.html" class="ha-cal-bar ' + meta.color + st + '" title="' + label + '">' + esc(b.guestName) + "</a>";
          }).join("");
          rows += '<td class="ha-cal-day' + (today ? " ha-cal-day--today" : "") + '" data-day="' + iso + '">' +
            '<button type="button" class="ha-cal-day-btn" data-day="' + iso + '">' + dayNum + "</button>" +
            '<div class="ha-cal-bars">' + bars + "</div></td>";
        }
        if (i % 7 === 6) rows += "</tr>";
      }

      var legend = props.map(function (p, i) {
        return '<span class="ha-cal-legend-item"><span class="ha-cal-swatch ha-cal-color--' + (i % 6) + '"></span>' + esc(p.name) + "</span>";
      }).join("");

      return '<section class="ha-calendar portal-card">' +
        '<div class="ha-cal-head">' +
        '<button type="button" class="btn btn-ghost btn-sm ha-cal-prev" data-y="' + prevY + '" data-m="' + prevM + '">‹</button>' +
        "<h2>" + esc(monthLabel) + "</h2>" +
        '<button type="button" class="btn btn-ghost btn-sm ha-cal-next" data-y="' + nextY + '" data-m="' + nextM + '">›</button>' +
        '<button type="button" class="btn btn-ghost btn-sm ha-cal-today">오늘</button>' +
        "</div>" +
        '<p class="ha-cal-hint">확정·대기 예약만 표시됩니다. 날짜를 누르면 예약 목록으로 이동합니다.</p>' +
        '<div class="ha-cal-legend">' + legend + "</div>" +
        '<table class="ha-cal-table"><thead><tr>' + head + "</tr></thead><tbody>" + rows + "</tbody></table>" +
        "</section>";
    },
  };

  function fixHtml(s) {
    return s.replace(/<motion/g, "<div").replace(/<\/motion>/g, "</div>");
  }


  function renderPropertyEdit() {
    _currentPage = "property-edit";
    var root = document.getElementById("ha-property-edit-root");
    if (!root) return;
    var id = qp("id") || "";
    var data = D();
    if (!data) { root.innerHTML = '<p class="portal-empty">데이터를 불러오지 못했습니다.</p>'; return; }
    var p = data.getProperty(id);
    if (!id) {
      var mine = hostProperties();
      if (mine.length === 1) id = mine[0].id;
      else if (mine.length) id = mine[0].id;
      else { root.innerHTML = '<p class="portal-empty">수정할 숙소가 없습니다.</p>'; return; }
      p = data.getProperty(id);
    }
    if (!p || p.hostId !== hostId()) {
      root.innerHTML = '<p class="portal-empty">수정할 수 없는 숙소입니다. <a href="properties.html">내 숙소</a>에서 선택해 주세요.</p>';
      return;
    }
    var g = data.getStayGuide(id) || {};
    var photos = (p.photos && p.photos.length) ? p.photos.join("\n") : "";
    var amenities = (p.amenities || []).join(", ");

    root.innerHTML =
      '<form class="portal-form ha-edit-form" id="ha-property-form" data-id="' + esc(id) + '">' +
      '<section class="portal-card ha-edit-section"><h2>기본 정보</h2>' +
      '<label>숙소 이름<input name="name" value="' + esc(p.name) + '" required /></label>' +
      '<label>한 줄 소개<input name="summary" value="' + esc(p.summary || "") + '" /></label>' +
      '<label>상세 설명<textarea name="description" rows="4">' + esc(p.description || "") + '</textarea></label>' +
      '<label>주소<input name="address" value="' + esc(p.address || "") + '" /></label>' +
      '<label>지역 표시<input name="locationLabel" value="' + esc(p.locationLabel || "") + '" /></label>' +
      '<label>유형<input name="propertyType" value="' + esc(p.propertyType || "") + '" /></label>' +
      '<label>운영 상태<select name="status"><option value="active"' + (p.status === "active" ? " selected" : "") + '>운영 중</option><option value="paused"' + (p.status === "paused" ? " selected" : "") + '>일시 중단</option></select></label>' +
      '<label>1박 요금 (원)<input name="pricePerNight" type="number" min="0" step="1000" value="' + esc(p.pricePerNight) + '" /></label>' +
      '</section>' +
      '<section class="portal-card ha-edit-section"><h2>수용 정보</h2>' +
      '<div class="ha-edit-grid">' +
      '<label>최대 인원<input name="guests" type="number" min="1" value="' + esc(p.guests) + '" /></label>' +
      '<label>침실<input name="bedrooms" type="number" min="0" value="' + esc(p.bedrooms) + '" /></label>' +
      '<label>침대<input name="beds" type="number" min="0" value="' + esc(p.beds) + '" /></label>' +
      '<label>욕실<input name="baths" type="number" min="0" value="' + esc(p.baths) + '" /></label>' +
      '</div></section>' +
      '<section class="portal-card ha-edit-section"><h2>사진</h2>' +
      '<p class="ha-edit-hint">이미지 URL을 한 줄에 하나씩 입력하세요. 저장 후 게스트 상세에 반영됩니다.</p>' +
      '<textarea name="photos" rows="5" placeholder="https://...">' + esc(photos) + '</textarea>' +
      '<div id="ha-photo-preview" class="ha-photo-preview"></div></section>' +
      '<section class="portal-card ha-edit-section"><h2>편의시설</h2>' +
      '<label>쉼표로 구분<input name="amenities" value="' + esc(amenities) + '" placeholder="와이파이, 주차, 주방" /></label>' +
      '</section>' +
      '<section class="portal-card ha-edit-section ha-guest-preview"><h2>게스트 미리보기</h2><iframe class="ha-preview-frame" title="게스트 상세" src="../guest/listing.html?id=" + encodeURIComponent(id) + ""></iframe></section>' +
      '<section class="portal-card ha-edit-section"><h2>숙소 안내 (게스트용)</h2>' +
      '<label>체크인<textarea name="guide_checkIn" rows="2">' + esc(g.checkIn || "") + '</textarea></label>' +
      '<label>체크아웃<textarea name="guide_checkOut" rows="2">' + esc(g.checkOut || "") + '</textarea></label>' +
      '<label>Wi-Fi<input name="guide_wifi" value="' + esc(g.wifi || "") + '" /></label>' +
      '<label>주차<input name="guide_parking" value="' + esc(g.parking || "") + '" /></label>' +
      '<label>이용 규칙<textarea name="guide_rules" rows="2">' + esc(g.rules || "") + '</textarea></label>' +
      '<label>연락처<input name="guide_contact" value="' + esc(g.contact || "") + '" /></label>' +
      '</section>' +
      '<div class="ha-edit-actions">' +
      '<button type="submit" class="btn btn-primary">저장</button>' +
      '<a class="btn btn-ghost" href="properties.html">취소</a>' +
      '<a class="btn btn-ghost" href="../guest/listing.html?id=' + encodeURIComponent(id) + '" target="_blank" rel="noopener">게스트 화면 미리보기</a>' +
      '</div>' +
      '<p id="ha-save-note" class="ha-save-note" hidden></p></form>';

    root.innerHTML = root.innerHTML.replace(/<\/?motion[^>]*>/g, function (x) {
      return x.indexOf("/") === 1 ? "</div>" : x.replace("motion", "motion").replace("motion", "div");
    });
    root.innerHTML = root.innerHTML.replace("<div", "<div").replace("</div>", "</div>");

    updatePhotoPreview(root.querySelector('[name="photos"]').value);
    root.querySelector('[name="photos"]').addEventListener("input", function (e) {
      updatePhotoPreview(e.target.value);
    });

    var form = document.getElementById("ha-property-form");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var fd = new FormData(form);
      var photoLines = String(fd.get("photos") || "").split(/\n/).map(function (s) { return s.trim(); }).filter(Boolean);
      var amenityList = String(fd.get("amenities") || "").split(/,/).map(function (s) { return s.trim(); }).filter(Boolean);
      var patch = {
        name: String(fd.get("name")),
        summary: String(fd.get("summary")),
        description: String(fd.get("description")),
        address: String(fd.get("address")),
        locationLabel: String(fd.get("locationLabel")),
        propertyType: String(fd.get("propertyType")),
        status: String(fd.get("status")),
        pricePerNight: parseInt(String(fd.get("pricePerNight")), 10) || p.pricePerNight,
        guests: parseInt(String(fd.get("guests")), 10) || p.guests,
        bedrooms: parseInt(String(fd.get("bedrooms")), 10) || p.bedrooms,
        beds: parseInt(String(fd.get("beds")), 10) || p.beds,
        baths: parseInt(String(fd.get("baths")), 10) || p.baths,
        photos: photoLines,
        amenities: amenityList,
        stayGuide: {
          checkIn: String(fd.get("guide_checkIn")),
          checkOut: String(fd.get("guide_checkOut")),
          wifi: String(fd.get("guide_wifi")),
          parking: String(fd.get("guide_parking")),
          rules: String(fd.get("guide_rules")),
          contact: String(fd.get("guide_contact")),
        },
      };
      data.savePropertyEdit(id, patch);
      var saveDone = function () {
        var note = document.getElementById("ha-save-note");
        note.textContent = "저장되었습니다. 게스트 페이지에서 확인해 보세요.";
        note.hidden = false;
        if (global.HangroNotify) global.HangroNotify.success("숙소 정보가 저장되었습니다.", "저장 완료");
      };
      if (global.PortalAPI && global.PortalAPI.patchProperty) {
        global.PortalAPI.patchProperty(id, patch).then(saveDone).catch(saveDone);
      } else {
        saveDone();
      }
      var frame = root.querySelector(".ha-preview-frame");
      if (frame) frame.src = "../guest/listing.html?id=" + encodeURIComponent(id) + "&_=" + Date.now();
    });
    document.title = (p.name || "숙소") + " 수정 — 행로";
  }

  function updatePhotoPreview(text) {
    var box = document.getElementById("ha-photo-preview");
    if (!box) return;
    var urls = String(text || "").split(/\n/).map(function (s) { return s.trim(); }).filter(Boolean);
    if (!urls.length) {
      box.innerHTML = '<p class="ha-edit-hint">등록된 사진이 없습니다. 그라데이션 플레이스홀더가 표시됩니다.</p>';
      return;
    }
    box.innerHTML = urls.map(function (u, i) {
      return '<div class="ha-photo-thumb" style="background-image:url(\'' + esc(u).replace(/'/g, "%27") + '\')" title="사진 ' + (i + 1) + '"></div>';
    }).join("");
  }


  function bindBookingActions(root) {
    if (!root) return;
    root.querySelectorAll(".ha-approve").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-id");
        if (!global.confirm("이 예약을 승인하시겠습니까?")) return;
        setBookingStatus(id, "confirmed");
        if (global.HangroNotify) {
          global.HangroNotify.success("예약이 승인되었습니다. 게스트에게 알림이 전달됩니다. (데모)", "승인 완료");
        }
        refreshCurrentPage();
      });
    });
    root.querySelectorAll(".ha-reject").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (!global.confirm("이 예약 요청을 거절하시겠습니까?")) return;
        setBookingStatus(btn.getAttribute("data-id"), "rejected");
        if (global.HangroNotify) global.HangroNotify.info("예약이 거절되었습니다. (데모)", "거절");
        refreshCurrentPage();
      });
    });
  }

  function bindCalendar(root) {
    if (!root) return;
    root.querySelectorAll(".ha-cal-day-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var day = btn.getAttribute("data-day");
        try {
          global.sessionStorage.setItem("hangro_host_filter_day", day);
        } catch (e) {}
        global.location.href = "bookings.html?day=" + encodeURIComponent(day);
      });
    });
    root.querySelectorAll(".ha-cal-prev, .ha-cal-next").forEach(function (btn) {
      btn.addEventListener("click", function () {
        saveCalMonth(parseInt(btn.getAttribute("data-y"), 10), parseInt(btn.getAttribute("data-m"), 10));
        refreshCurrentPage();
      });
    });
    var todayBtn = root.querySelector(".ha-cal-today");
    if (todayBtn) {
      todayBtn.addEventListener("click", function () {
        var n = new Date();
        saveCalMonth(n.getFullYear(), n.getMonth());
        refreshCurrentPage();
      });
    }
  }

  var _currentPage = "dashboard";  // 캘린더 이동 후 같은 페이지 다시 그리기

  function refreshCurrentPage() {
    var fn = PAGE_RENDERERS[_currentPage];
    if (fn) fn();
  }

  function renderDashboard() {
    _currentPage = "dashboard";
    var mount = document.getElementById("ha-dashboard-root");
    if (!mount) return;

    var props = hostProperties();
    var bookings = allHostBookings();
    var pending = bookings.filter(function (b) { return b.status === "pending"; });
    var thisWeek = activeBookings().filter(function (b) {
      var now = new Date();
      var week = new Date(now);
      week.setDate(week.getDate() + 7);
      var ci = parseDate(b.checkIn);
      return ci >= now && ci <= week;
    });

    var cal = getCalMonth();
    mount.innerHTML = fixHtml(
      '<div class="portal-grid portal-grid--3 ha-kpis">' +
      '<article class="portal-card portal-kpi"><strong>' + props.length + '</strong><span>내 숙소</span></article>' +
      '<article class="portal-card portal-kpi"><strong>' + pending.length + '</strong><span>승인 대기</span></article>' +
      '<article class="portal-card portal-kpi"><strong>' + thisWeek.length + '</strong><span>7일 내 체크인</span></article>' +
      "</div>" +
      '<div id="ha-calendar-wrap">' + V.calendar(cal.year, cal.month) + "</div>" +
      (pending.length
        ? '<section class="ha-pending-section"><h2 class="portal-section-title">승인 대기</h2><div class="portal-table-wrap"><table class="portal-table"><thead><tr><th>게스트</th><th>숙소</th><th>일정</th><th></th></tr></thead><tbody>' +
          pending.map(function (b) {
            var p = D().getProperty(b.propertyId);
            return "<tr><td>" + esc(b.guestName) + "</td><td>" + esc(p ? p.name : "") + "</td><td>" + formatRange(b.checkIn, b.checkOut) + "</td><td>" + V.bookingActions(b) + "</td></tr>";
          }).join("") +
          "</tbody></table></div></section>"
        : "")
    );

    bindCalendar(mount.querySelector("#ha-calendar-wrap"));
    bindBookingActions(mount);
  }

  function renderBookings() {
    _currentPage = "bookings";
    var tbody = document.getElementById("host-bookings-body");
    var calMount = document.getElementById("ha-calendar-wrap");
    var filterDay = qp("day");
    if (!filterDay) {
      try {
        filterDay = global.sessionStorage.getItem("hangro_host_filter_day");
      } catch (e) {}
    }
    var bookings = allHostBookings();
    if (filterDay) {
      bookings = bookings.filter(function (b) {
        if (b.status === "rejected") return false;
        var d = parseDate(filterDay);
        return d >= parseDate(b.checkIn) && d < parseDate(b.checkOut);
      });
    }

    if (calMount) {
      var cal = getCalMonth();
      calMount.innerHTML = V.calendar(cal.year, cal.month);
      bindCalendar(calMount);
    }

    if (!tbody) return;
    var wrap = tbody.closest(".wrap") || tbody.closest("main");
    if (filterDay && wrap) {
      var hint = document.getElementById("ha-bookings-filter-hint");
      if (!hint) {
        hint = document.createElement("p");
        hint.id = "ha-bookings-filter-hint";
        hint.className = "ha-cal-hint";
        var tableWrap = wrap.querySelector(".portal-table-wrap");
        wrap.insertBefore(hint, tableWrap || tbody);
      }
      hint.innerHTML = esc(filterDay) + ' 일정 · <a href="bookings.html">전체 보기</a>';
    }
    if (!bookings.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="portal-empty">예약이 없습니다.</td></tr>';
      return;
    }

    tbody.innerHTML = bookings.map(function (b) {
      var p = D().getProperty(b.propertyId);
      return "<tr data-booking-id=\"" + esc(b.id) + "\"><td>" + esc(b.guestName) + "</td><td>" + esc(p ? p.name : "") +
        "</td><td>" + formatRange(b.checkIn, b.checkOut) + "</td><td>" + badge(b.status) +
        "</td><td>" + V.bookingActions(b) + "</td></tr>";
    }).join("");

    bindBookingActions(tbody.closest("table") || tbody);
  }

  function renderProperties() {
    _currentPage = "properties";
    var el = document.getElementById("host-properties-list");
    if (!el) return;
    var ui = U();
    el.innerHTML = hostProperties().map(function (p) {
      return '<article class="portal-card"><h3>' + esc(p.name) + "</h3><p>" + badge(p.status) + " " + esc(p.summary) +
        '</p><div class="portal-card-actions"><a class="btn btn-primary" href="property-edit.html?id=' +
        encodeURIComponent(p.id) + '">정보 수정</a></div></article>';
    }).join("");
  }

  function renderMessages() {
    _currentPage = "messages";
    var el = document.getElementById("host-messages-list");
    if (!el) return;
    var ui = U();
    var list = D().messagesForPropertyIds(hostPropertyIds());
    el.innerHTML = list.length
      ? '<ul class="portal-list">' + list.map(function (m) {
          return "<li><strong>" + esc(m.subject) + '</strong><span class="meta">' + esc(m.fromName) + " · " + badge(m.status) + "<br>" + esc(m.body) + "</span></li>";
        }).join("") + "</ul>"
      : "<p class=\"portal-empty\">문의가 없습니다.</p>";
    if (ui && ui.initMessageForm) ui.initMessageForm("host-message-form", "host");
  }

  function bootPage(opts) {
    opts = opts || {};
    function boot() {
      if (!D()) {
        var root = document.getElementById("ha-dashboard-root") || document.getElementById("host-bookings-body");
        if (root) root.innerHTML = "<p class=\"portal-empty\">데이터를 불러오지 못했습니다.</p>";
        return;
      }
      _currentPage = opts.page || "dashboard";
      var fn = opts.render || PAGE_RENDERERS[_currentPage];
      if (fn) fn();
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

  function autoBoot() {  // host/*.html 하단에서 호출
    var page = (document.body && document.body.getAttribute("data-ha-page")) || "dashboard";
    bootPage({ page: page });
  }

  global.HostApp = {
    bootPage: bootPage,
    autoBoot: autoBoot,
    allHostBookings: allHostBookings,
    setBookingStatus: setBookingStatus,
    views: V,
  };
})(typeof window !== "undefined" ? window : global);
