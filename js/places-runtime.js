/**
 * 장소 데이터(JSON) 로드, 지도/상세 페이지 공통 로직
 * 의존: 지도 페이지는 Leaflet(L) 로드 후 initMapPage 호출
 */
(function (global) {
  "use strict";

  var DATA_URL = "data/places.json";
  var CACHE = null;

  var PIN_HEX = "#1A2419";

  var REQUIRED_DETAIL = [
    "id",
    "title",
    "lead",
    "tags",
    "beforeCaption",
    "afterCaption",
    "beforeText",
    "afterText",
    "bullets",
  ];

  var REQUIRED_MAP = ["id", "lat", "lng", "tooltip"];

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function winGrid() {
    return (
      '<div class="facade-windows" aria-hidden="true">' +
      '<span class="win"></span><span class="win"></span><span class="win"></span>' +
      '<span class="win"></span><span class="win"></span><span class="win"></span>' +
      "</div>"
    );
  }

  function isFiniteNum(n) {
    return typeof n === "number" && global.isFinite(n);
  }

  function validatePlace(p, index) {
    var label = "[places.json #" + index + "]";
    var i;

    if (!p || typeof p.id !== "string" || !p.id.length) {
      throw new Error(label + " id가 필요합니다.");
    }

    for (i = 0; i < REQUIRED_DETAIL.length; i++) {
      var k = REQUIRED_DETAIL[i];
      if (p[k] === undefined || p[k] === null) {
        throw new Error(label + ' "' + k + '" 누락 (' + p.id + ")");
      }
    }

    for (i = 0; i < REQUIRED_MAP.length; i++) {
      var km = REQUIRED_MAP[i];
      if (p[km] === undefined || p[km] === null || p[km] === "") {
        throw new Error(label + ' "' + km + '" 누락 (' + p.id + ")");
      }
    }

    if (!Array.isArray(p.tags)) {
      throw new Error(label + " tags는 배열이어야 합니다. (" + p.id + ")");
    }
    if (!Array.isArray(p.bullets)) {
      throw new Error(label + " bullets는 배열이어야 합니다. (" + p.id + ")");
    }
    if (!isFiniteNum(p.lat) || !isFiniteNum(p.lng)) {
      throw new Error(label + " lat/lng은 유효한 숫자여야 합니다. (" + p.id + ")");
    }
    if (p.lat < -90 || p.lat > 90 || p.lng < -180 || p.lng > 180) {
      throw new Error(label + " 좌표 범위가 올바르지 않습니다. (" + p.id + ")");
    }
  }

  function normalizePayload(raw) {
    if (
      !raw ||
      typeof raw !== "object" ||
      !Array.isArray(raw.places) ||
      !raw.places.length
    ) {
      throw new Error("places.json: places 배열이 비었거나 형식이 잘못되었습니다.");
    }

    var byId = {};
    var duplicates = {};

    raw.places.forEach(function (p, index) {
      validatePlace(p, index);
      if (byId[p.id]) {
        duplicates[p.id] = true;
      }
      byId[p.id] = p;
    });

    var dupKeys = Object.keys(duplicates);
    if (dupKeys.length) {
      throw new Error("places.json: 중복 id — " + dupKeys.join(", "));
    }

    return { places: raw.places.slice(), byId: byId, version: raw.version };
  }

  /**
   * @returns {Promise<{ places: Array, byId: Object }>}
   */
  function loadPlaces() {
    if (CACHE) {
      return Promise.resolve(CACHE);
    }

    return fetch(DATA_URL, { cache: "default" })
      .then(function (res) {
        if (!res.ok) {
          throw new Error(
            "장소 정보를 불러오지 못했습니다 (HTTP " + res.status + "). 로컬 서버에서 열었는지 확인해 주세요."
          );
        }
        return res.json();
      })
      .then(normalizePayload)
      .then(function (bundle) {
        CACHE = bundle;
        return bundle;
      });
  }

  function pinHtml() {
    var svg =
      '<svg class="haeng-pin-svg" viewBox="0 0 36 44" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<path fill="' +
      PIN_HEX +
      '" stroke="' + PIN_HEX + '" stroke-width="1"' +
      ' d="M18 2C11.5 2 7 6.95 7 13.1c0 8.95 11 26.65 11 26.65S29 21.76 29 13.1C29 6.95 24.5 2 18 2z"/>' +
      '<circle cx="18" cy="13" r="3.5" fill="#EFE9DC"/>' +
      "</svg>";
    return '<div class="haeng-pin haeng-pin-wrap">' + svg + "</div>";
  }

  function showMapFallback(mapEl, message) {
    if (!mapEl) return;
    mapEl.innerHTML =
      '<p class="map-legend" role="alert">' + escapeHtml(message) + "</p>";
  }

  function initMapPage(options) {
    var mapEl = document.getElementById((options && options.mapElId) || "map");
    if (!mapEl) return;

    if (typeof global.L === "undefined") {
      showMapFallback(mapEl, "지도 라이브러리를 불러오지 못했습니다. 네트워크와 CDN 접속을 확인해 주세요.");
      return;
    }

    loadPlaces()
      .then(function (bundle) {
        var L = global.L;
        var sites = bundle.places;
        var center = sites[0];
        var map = L.map(mapEl, {
          zoomControl: true,
          scrollWheelZoom: false,
        }).setView([center.lat, center.lng], 13);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
          maxZoom: 19,
        }).addTo(map);

        function makePinIcon() {
          return L.divIcon({
            className: "haeng-pin-icon",
            html: pinHtml(),
            iconSize: [36, 44],
            iconAnchor: [18, 42],
          });
        }

        var bounds = [];
        sites.forEach(function (s) {
          var marker = L.marker([s.lat, s.lng], {
            icon: makePinIcon(),
          }).addTo(map);

          marker.bindTooltip(s.tooltip, { sticky: true });

          var address = s.address
            ? escapeHtml(s.address)
            : escapeHtml("지도에서 위치를 확인할 수 있습니다.");

          var detailHref =
            "place-detail.html?id=" + encodeURIComponent(s.id);

          var popupHtml =
            '<div class="haeng-popup" style="min-width:200px;max-width:240px;font-family:inherit;line-height:1.5">' +
            '<p style="margin:0 0 0.35rem;font-size:0.78rem;letter-spacing:0.06em;text-transform:uppercase;color:#6b7570">위치 정보</p>' +
            '<h3 style="margin:0 0 0.45rem;font-family:\'Nanum Myeongjo\',serif;font-size:1rem;font-weight:700;color:#1A2419;letter-spacing:-0.02em">' +
            escapeHtml(s.title || s.tooltip || "유후공간") +
            "</h3>" +
            '<p style="margin:0 0 0.85rem;font-size:0.86rem;color:#4A4F44;line-height:1.55">' +
            address +
            "</p>" +
            '<a href="' +
            detailHref +
            '" style="display:inline-flex;align-items:center;gap:0.4rem;font-family:Helvetica,system-ui,sans-serif;font-size:0.74rem;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:#1A2419;text-decoration:none;border-bottom:1px solid #1A2419;padding-bottom:2px">자세히 보기 →</a>' +
            "</div>";

          marker.bindPopup(popupHtml, {
            offset: [0, -34],
            closeButton: true,
            autoClose: true,
            className: "haeng-popup-wrap",
          });

          bounds.push([s.lat, s.lng]);
        });

        if (bounds.length > 1) {
          map.fitBounds(bounds, { padding: [56, 56], maxZoom: 14 });
        }

        setTimeout(function () {
          map.invalidateSize();
        }, 250);
      })
      .catch(function (err) {
        console.error("[행로 지도]", err);
        showMapFallback(
          mapEl,
          err.message ||
            "장소 데이터를 불러오지 못했습니다. data/places.json 경로와 로컬 서버 실행 여부를 확인해 주세요."
        );
      });
  }

  function renderUnknown(root, main) {
    document.title = "공간을 찾을 수 없음 — 행로";
    if (root) {
      root.innerHTML =
        '<h1>알 수 없는 장소</h1><p class="lead">링크가 잘못되었거나 아직 등록되지 않은 핀입니다.</p>';
    }
    if (main) {
      main.innerHTML =
        '<div class="unknown-box">' +
        '<p style="margin:0 0 1rem;color:var(--ink-mute)">지도에서 위치를 다시 선택해 주세요.</p>' +
        '<a href="map-demo.html">지도로 돌아가기</a>' +
        "</div>";
    }
  }


  function photoSlotFromFilename(filename) {
    var m = String(filename || "").match(/_(\d+)\.(jpe?g|png)$/i);
    return m ? parseInt(m[1], 10) : null;
  }

  function padSlot(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function buildPairedBeforeAfterSection(place) {
    var bp = place.beforePhotos;
    var ap = place.afterPhotos;
    if (!bp || !Array.isArray(bp.items) || !bp.items.length) {
      return "";
    }
    if (!ap || !Array.isArray(ap.items) || !ap.items.length) {
      return buildPhotoStrip(
        bp,
        "현장 사진 — 변경 전",
        "before-" + place.id
      );
    }

    var bb = bp.basePath || "";
    var ab = ap.basePath || "";
    var beforeMap = {};
    var afterMap = {};
    var i;
    for (i = 0; i < bp.items.length; i++) {
      var sb = photoSlotFromFilename(bp.items[i]);
      if (sb !== null) beforeMap[sb] = bp.items[i];
    }
    for (i = 0; i < ap.items.length; i++) {
      var sa = photoSlotFromFilename(ap.items[i]);
      if (sa !== null) afterMap[sa] = ap.items[i];
    }

    var paired = [];
    var bk = Object.keys(beforeMap);
    for (i = 0; i < bk.length; i++) {
      var k = parseInt(bk[i], 10);
      if (afterMap[k]) paired.push(k);
    }
    paired.sort(function (a, b) { return a - b; });
    if (!paired.length) {
      return buildPhotoStrip(
        bp,
        "현장 사진 — 변경 전",
        "before-" + place.id
      );
    }

    var slotLabels = place.photoSlotLabels || {};
    var secId = "pair-" + String(place.id).replace(/[^a-zA-Z0-9_-]/g, "");
    var options = "";
    for (i = 0; i < paired.length; i++) {
      var n = paired[i];
      var bSrc = bb + beforeMap[n];
      var aSrc = ab + afterMap[n];
      var room = "";
      if (slotLabels[n] !== undefined && slotLabels[n] !== null && slotLabels[n] !== "") {
        room = String(slotLabels[n]);
      } else if (slotLabels[String(n)] !== undefined && slotLabels[String(n)] !== null) {
        room = String(slotLabels[String(n)]);
      }
      var optLabel = room ? room : padSlot(n) + "번";
      options +=
        '<option value="' +
        n +
        '" data-b-src="' +
        escapeHtml(bSrc) +
        '" data-a-src="' +
        escapeHtml(aSrc) +
        '" data-room="' +
        escapeHtml(room) +
        '">' +
        escapeHtml(optLabel) +
        "</option>";
    }

    var hint =
      "같은 장면의 변경 전·후 파일만 짝을 이루어 비교합니다.";

    return (
      '<section class="ba-section archive-pair-section" aria-labelledby="' +
      secId +
      '-heading" data-pair-gallery="' +
      escapeHtml(place.id) +
      '">' +
      '<h2 id="' +
      secId +
      '-heading">변경 전 · 변경 후</h2>' +
      '<p class="hint">' +
      escapeHtml(hint) +
      "</p>" +
      '<div class="archive-pair-toolbar">' +
      '<label for="' +
      secId +
      '-select">비교 장면</label> ' +
      '<select id="' +
      secId +
      '-select" data-pair-select class="archive-pair-select">' +
      options +
      "</select>" +
      "</div>" +
      '<div class="archive-pair-grid">' +
      "<figure>" +
      '<figcaption class="archive-pair-cap" data-pair-cap-before>변경 전</figcaption>' +
      '<img class="archive-pair-img" data-pair-before src="" alt="" loading="lazy" decoding="async" />' +
      "</figure>" +
      "<figure>" +
      '<figcaption class="archive-pair-cap" data-pair-cap-after>변경 후</figcaption>' +
      '<img class="archive-pair-img" data-pair-after src="" alt="" loading="lazy" decoding="async" />' +
      "</figure>" +
      "</div>" +
      '<p class="archive-pair-status" data-pair-status aria-live="polite"></p>' +
      "</section>"
    );
  }

  function attachPairedGalleryListeners(galleryEl) {
    var sel = galleryEl.querySelector("[data-pair-select]");
    var imgB = galleryEl.querySelector("[data-pair-before]");
    var imgA = galleryEl.querySelector("[data-pair-after]");
    var status = galleryEl.querySelector("[data-pair-status]");
    var capB = galleryEl.querySelector("[data-pair-cap-before]");
    var capA = galleryEl.querySelector("[data-pair-cap-after]");
    if (!sel || !imgB || !imgA) return;

    function applySelection() {
      var opt = sel.options[sel.selectedIndex];
      if (!opt) return;
      var n = parseInt(opt.value, 10);
      var bSrc = opt.getAttribute("data-b-src") || "";
      var aSrc = opt.getAttribute("data-a-src") || "";
      var room = (opt.getAttribute("data-room") || "").trim();
      imgB.src = bSrc;
      imgA.src = aSrc;
      if (room) {
        imgB.alt = "변경 전 " + room;
        imgA.alt = "변경 후 " + room;
        if (capB) capB.textContent = "변경 전 · " + room;
        if (capA) capA.textContent = "변경 후 · " + room;
        if (status) {
          status.textContent = room + " 전·후 비교";
        }
      } else {
        imgB.alt = "변경 전 " + padSlot(n) + "번";
        imgA.alt = "변경 후 " + padSlot(n) + "번";
        if (capB) capB.textContent = "변경 전 · " + padSlot(n) + "번";
        if (capA) capA.textContent = "변경 후 · " + padSlot(n) + "번";
        if (status) {
          status.textContent = padSlot(n) + "번 전·후 비교";
        }
      }
    }

    sel.addEventListener("change", applySelection);
    applySelection();
  }

  function buildPhotoStrip(photos, fallbackTitle, idPrefix, options) {
    if (!photos || !Array.isArray(photos.items) || !photos.items.length) {
      return "";
    }

    options = options || {};
    var useGrid = options.layout === "grid";

    var prefix = idPrefix || "photos";
    var title = photos.title || fallbackTitle || "현장 사진";
    var alt = photos.alt || title;
    var basePath = photos.basePath || "";
    var headingId = prefix + "-heading";

    var slides = photos.items
      .map(function (file, idx) {
        var src = basePath + file;
        var num = idx + 1;
        return (
          '<figure class="ba-photo" data-photo-index="' +
          idx +
          '">' +
          '<img src="' +
          escapeHtml(src) +
          '" alt="' +
          escapeHtml(alt) +
          " " +
          num +
          '" loading="lazy" decoding="async" />' +
          "</figure>"
        );
      })
      .join("");

    if (useGrid) {
      return (
        '<section class="ba-section ba-photos-section ba-photos-section--grid" data-strip="' +
        escapeHtml(prefix) +
        '" aria-labelledby="' +
        headingId +
        '">' +
        '<h2 id="' +
        headingId +
        '">' +
        escapeHtml(title) +
        "</h2>" +
        '<div class="ba-photos-grid">' +
        slides +
        "</div>" +
        "</section>"
      );
    }

    return (
      '<section class="ba-section ba-photos-section" data-strip="' +
      escapeHtml(prefix) +
      '" aria-labelledby="' +
      headingId +
      '">' +
      '<h2 id="' +
      headingId +
      '">' +
      escapeHtml(title) +
      "</h2>" +
      '<div class="ba-photos">' +
      '<div class="ba-photos-frame">' +
      '<div class="ba-photos-track" data-photos-track tabindex="0" aria-roledescription="carousel" aria-label="' +
      escapeHtml(alt) +
      '">' +
      slides +
      "</div>" +
      '<button type="button" class="ba-photos-btn ba-photos-prev" data-photos-prev aria-label="이전 사진">' +
      '<span aria-hidden="true">‹</span>' +
      "</button>" +
      '<button type="button" class="ba-photos-btn ba-photos-next" data-photos-next aria-label="다음 사진">' +
      '<span aria-hidden="true">›</span>' +
      "</button>" +
      "</div>" +
      '<p class="ba-photos-status" data-photos-status aria-live="polite"></p>' +
      "</div>" +
      "</section>"
    );
  }

  function attachPhotoStripListeners(scope) {
    var track = scope.querySelector("[data-photos-track]");
    var prev = scope.querySelector("[data-photos-prev]");
    var next = scope.querySelector("[data-photos-next]");
    var status = scope.querySelector("[data-photos-status]");
    if (!track || !prev || !next) return;

    function step(direction) {
      var slide = track.querySelector(".ba-photo");
      var w = slide ? slide.getBoundingClientRect().width : track.clientWidth;
      track.scrollBy({ left: direction * w, behavior: "smooth" });
    }

    function update() {
      var slides = track.querySelectorAll(".ba-photo");
      if (!slides.length) return;
      var center = track.scrollLeft + track.clientWidth / 2;
      var current = 0;
      for (var i = 0; i < slides.length; i++) {
        var left = slides[i].offsetLeft;
        var right = left + slides[i].offsetWidth;
        if (center >= left && center < right) {
          current = i;
          break;
        }
      }
      if (status) {
        status.textContent = (current + 1) + " / " + slides.length;
      }
      var atStart = track.scrollLeft <= 2;
      var atEnd =
        track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
      prev.disabled = atStart;
      next.disabled = atEnd;
    }

    prev.addEventListener("click", function () { step(-1); });
    next.addEventListener("click", function () { step(1); });
    track.addEventListener("scroll", update, { passive: true });
    track.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
    });

    update();
  }

  function buildFloorPlanSection(place) {
    var fp = place.floorPlan;
    if (!fp || !Array.isArray(fp.items) || !fp.items.length) {
      return "";
    }

    var vb = fp.viewBox || "0 0 420 300";
    var title = fp.title || "내부 구조";
    var hint = fp.hint || "";
    var parts = [];
    var pid = "fp-hatch-" + String(place.id).replace(/[^a-zA-Z0-9_-]/g, "");

    parts.push(
      '<section class="floor-plan-wrap ba-section" aria-labelledby="floor-plan-heading">'
    );
    parts.push('<h2 id="floor-plan-heading">' + escapeHtml(title) + "</h2>");
    if (hint) {
      parts.push('<p class="hint">' + escapeHtml(hint) + "</p>");
    }
    parts.push('<div class="floor-svg-shell">');
    parts.push(
      '<svg class="floor-svg" viewBox="' +
        escapeHtml(vb) +
        '" role="img" aria-label="내부 평면 스케매틱">'
    );
    parts.push("<defs>");
    parts.push(
      '<pattern id="' +
        pid +
        '" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">'
    );
    parts.push(
      '<rect width="8" height="8" fill="rgba(26,36,25,0.05)"/>'
    );
    parts.push(
      '<line x1="0" y1="0" x2="0" y2="8" stroke="rgba(26,36,25,0.18)" stroke-width="1.2"/>'
    );
    parts.push("</pattern></defs>");

    fp.items.forEach(function (item) {
      var fillDefault = "rgba(183, 201, 164, 0.45)";
      var stroke = "rgba(26, 36, 25, 0.45)";
      var fill = fillDefault;
      if (item.tone === "bath") {
        fill = "rgba(61, 110, 44, 0.30)";
      }
      if (item.id === "parking") {
        fill = "rgba(26, 36, 25, 0.06)";
      }

      var hatchFill = item.hatch ? "url(#" + pid + ")" : fill;
      var shape = "";

      if (Array.isArray(item.ellipse) && item.ellipse.length >= 4) {
        var ex = item.ellipse;
        shape =
          '<ellipse cx="' +
          ex[0] +
          '" cy="' +
          ex[1] +
          '" rx="' +
          ex[2] +
          '" ry="' +
          ex[3] +
          '" fill="' +
          hatchFill +
          '" stroke="' +
          stroke +
          '" stroke-width="1.5"/>';
      } else if (Array.isArray(item.rect) && item.rect.length >= 4) {
        var r = item.rect;
        shape =
          '<rect x="' +
          r[0] +
          '" y="' +
          r[1] +
          '" width="' +
          r[2] +
          '" height="' +
          r[3] +
          '" rx="2" fill="' +
          hatchFill +
          '" stroke="' +
          stroke +
          '" stroke-width="1.5"/>';
      } else {
        return;
      }

      var lx = 0;
      var ly = 0;
      if (item.ellipse) {
        lx = item.ellipse[0];
        ly = item.ellipse[1];
      } else if (item.rect) {
        lx = item.rect[0] + item.rect[2] / 2;
        ly = item.rect[1] + item.rect[3] / 2;
      }

      parts.push(
        '<g class="floor-hit" tabindex="0" role="button" data-room-id="' +
          escapeHtml(item.id) +
          '" aria-label="' +
          escapeHtml(item.label) +
          '">'
      );
      parts.push(shape);
      parts.push(
        '<text class="floor-label" x="' +
          lx +
          '" y="' +
          ly +
          '" text-anchor="middle" dominant-baseline="middle" fill="rgba(26,36,25,0.92)" font-size="11" font-family="Noto Sans KR, sans-serif" pointer-events="none">' +
          escapeHtml(item.label) +
          "</text>"
      );
      parts.push("</g>");
    });

    parts.push("</svg></div>");
    var dlgId = "floor-dialog-" + String(place.id).replace(/[^a-zA-Z0-9_-]/g, "");
    var titleId = dlgId + "-title";
    var bodyId = dlgId + "-body";
    parts.push(
      '<dialog class="floor-dialog" id="' +
        dlgId +
        '" aria-labelledby="' +
        titleId +
        '">' +
        '<form method="dialog" class="floor-dialog-form">' +
        '<h3 id="' + titleId + '" class="floor-dialog-title"></h3>' +
        '<p id="' + bodyId + '" class="floor-dialog-body"></p>' +
        '<button type="submit" class="btn btn-primary floor-dialog-close">닫기</button>' +
        "</form>" +
        "</dialog>"
    );
    parts.push("</section>");
    return parts.join("");
  }

  function attachFloorPlanListeners(main, place) {
    var fp = place.floorPlan;
    if (!fp || !Array.isArray(fp.items) || !fp.items.length) return;

    var byId = {};
    fp.items.forEach(function (it) {
      byId[it.id] = it;
    });

    var dialog = main.querySelector(".floor-dialog");
    var titleEl = main.querySelector(".floor-dialog-title");
    var bodyEl = main.querySelector(".floor-dialog-body");
    if (!dialog || !titleEl || !bodyEl) return;

    function openRoom(id) {
      var item = byId[id];
      if (!item) return;
      titleEl.textContent = item.label;
      bodyEl.textContent = item.detail;
      if (typeof dialog.showModal === "function") {
        dialog.showModal();
      } else {
        dialog.setAttribute("open", "");
      }
    }

    var nodes = main.querySelectorAll(".floor-hit[data-room-id]");
    for (var i = 0; i < nodes.length; i++) {
      (function (node) {
        function onActivate(e) {
          if (e.type === "keydown" && e.key !== "Enter" && e.key !== " ") {
            return;
          }
          if (e.type === "keydown" && e.key === " ") {
            e.preventDefault();
          }
          openRoom(node.getAttribute("data-room-id"));
        }
        node.addEventListener("click", onActivate);
        node.addEventListener("keydown", onActivate);
      })(nodes[i]);
    }
  }

  function renderPlaceDetail(root, main, place) {
    document.title = place.title + " — 행로";

    var tagsHtml = place.tags
      .map(function (t) {
        return "<li>" + escapeHtml(t) + "</li>";
      })
      .join("");

    var statusHtml = place.status
      ? '<p class="status-line"><span class="status-pill">' +
        escapeHtml(place.status) +
        "</span></p>"
      : "";

    root.innerHTML =
      statusHtml +
      "<h1>" +
      escapeHtml(place.title) +
      "</h1>" +
      '<p class="lead">' +
      escapeHtml(place.lead) +
      "</p>" +
      '<ul class="tags">' +
      tagsHtml +
      "</ul>";

    var hasAfter =
      place.afterReady === true &&
      place.afterPhotos &&
      Array.isArray(place.afterPhotos.items) &&
      place.afterPhotos.items.length;

    var archiveHref = "archive.html#" + encodeURIComponent(place.id);
    var bottomLinks =
      '<p class="detail-actions">' +
      '<a href="' +
      archiveHref +
      '">진행 과정·기록 보기</a> · ' +
      '<a href="map-demo.html">다른 위치 보기</a> · ' +
      '<a href="booking.html">상담 신청</a>' +
      "</p>";

    if (hasAfter) {
      /* 지도·핀에서 들어오는 상세: 진행 후(변경 후) 사진만 */
      var afterStrip = buildPhotoStrip(
        place.afterPhotos,
        "프로젝트 진행 후",
        "after",
        { layout: "grid" }
      );
      var afterSummaryHtml = place.afterSummary
        ? '<section class="detail-story" aria-labelledby="result-heading">' +
          '<h2 id="result-heading">결과 · 콘셉트</h2>' +
          "<p>" +
          escapeHtml(place.afterSummary) +
          "</p>" +
          "</section>"
        : "";
      main.innerHTML = afterStrip + afterSummaryHtml + bottomLinks;
      var photoSections = main.querySelectorAll(".ba-photos-section");
      for (var si = 0; si < photoSections.length; si++) {
        attachPhotoStripListeners(photoSections[si]);
      }
    } else {
      main.innerHTML =
        '<section class="detail-after-pending" aria-labelledby="pending-heading">' +
        '<h2 id="pending-heading">변경 후 모습은 곧 공개됩니다.</h2>' +
        "<p>현재 콘셉트 검토 및 현장 협의 단계의 프로젝트입니다. " +
        "진행 과정·현장 사진·평면 등 자세한 기록은 " +
        '<a href="' +
        archiveHref +
        '">기록 페이지</a>에서 확인하실 수 있습니다.</p>' +
        "</section>" +
        bottomLinks;
    }
  }

  function initDetailPage() {
    var root = document.getElementById("detail-root");
    var main = document.getElementById("detail-main");
    if (!root || !main) return;

    var params = new URLSearchParams(global.location.search);
    var id = (params.get("id") || "").trim();

    if (!id) {
      renderUnknown(root, main);
      return;
    }

    loadPlaces()
      .then(function (bundle) {
        var place = bundle.byId[id];
        if (!place) {
          renderUnknown(root, main);
          return;
        }
        renderPlaceDetail(root, main, place);
      })
      .catch(function (err) {
        console.error("[행로 상세]", err);
        document.title = "불러오기 오류 — 행로";
        root.innerHTML =
          "<h1>데이터를 불러올 수 없습니다</h1>" +
          "<p class=\"lead\">" +
          escapeHtml(err.message || "알 수 없는 오류") +
          "</p>";
        main.innerHTML =
          '<div class="unknown-box">' +
          '<p style="margin:0 0 1rem;color:var(--ink-mute)">잠시 후 다시 시도해 주세요.</p>' +
          '<a href="map-demo.html">지도로 돌아가기</a>' +
          "</div>";
      });
  }

  function archiveListCoverFromPlace(place) {
    var ap = place.afterPhotos;
    if (!ap || !Array.isArray(ap.items) || !ap.items.length) {
      return { src: "", alt: "" };
    }
    var base = ap.basePath || "";
    var altStem = ap.alt || place.title || "변경 후";
    var labels = place.photoSlotLabels || {};
    var slot = null;
    var lk;
    for (lk in labels) {
      if (Object.prototype.hasOwnProperty.call(labels, lk) && String(labels[lk]) === "침실") {
        slot = parseInt(lk, 10);
        break;
      }
    }
    if (!isFiniteNum(slot) && isFiniteNum(place.archiveListCoverSlot)) {
      slot = place.archiveListCoverSlot;
    }
    if (!isFiniteNum(slot)) {
      slot = 9;
    }
    var idx;
    for (idx = 0; idx < ap.items.length; idx++) {
      var sn = photoSlotFromFilename(ap.items[idx]);
      if (sn === slot) {
        return {
          src: base + ap.items[idx],
          alt: altStem + " — 침실 · 변경 후",
        };
      }
    }
    return {
      src: base + ap.items[0],
      alt: altStem + " — 변경 후",
    };
  }

  function buildArchiveCardSummary(place, index) {
    var caseNo = "Case " + (index + 1 < 10 ? "0" : "") + (index + 1);
    var locationTag = "";
    if (Array.isArray(place.tags) && place.tags.length) {
      locationTag = escapeHtml(place.tags[place.tags.length - 1]);
    }

    var tagsHtml = (Array.isArray(place.tags) ? place.tags : [])
      .map(function (t) {
        return "<li>" + escapeHtml(t) + "</li>";
      })
      .join("");

    var statusBit = place.status
      ? '<span>' + escapeHtml(place.status) + '</span>'
      : "";

    var cov = archiveListCoverFromPlace(place);
    var coverHtml = cov.src
      ? '<span class="case-image"><img src="' +
        escapeHtml(cov.src) +
        '" alt="' +
        escapeHtml(cov.alt) +
        '" loading="lazy" decoding="async" /></span>'
      : '<span class="case-image case-image-empty">현장 사진 준비 중</span>';

    return (
      '<a class="case" href="#' +
      escapeHtml(place.id) +
      '" data-archive-anchor="' +
      escapeHtml(place.id) +
      '">' +
      coverHtml +
      '<div class="case-meta">' +
      '<span class="case-no">' + escapeHtml(caseNo) + '</span>' +
      (locationTag ? '<span>' + locationTag + '</span>' : "") +
      statusBit +
      '</div>' +
      '<h3>' + escapeHtml(place.title) + '</h3>' +
      '<p>' + escapeHtml(place.lead) + '</p>' +
      (tagsHtml ? '<ul class="case-tags">' + tagsHtml + '</ul>' : "") +
      '<span class="case-link">기록 보기</span>' +
      '</a>'
    );
  }

  function buildArchiveDetail(place) {
    var statusHtml = place.status
      ? '<span class="status-pill">' + escapeHtml(place.status) + "</span>"
      : "";

    var photoStrip = buildPairedBeforeAfterSection(place);

    /* 내부 구조 스케매틱: buildFloorPlanSection·floorPlan·attachFloorPlanListeners 코드는 유지,
       사이트 노출만 중단. 복구 시 이 블록 주석 해제 + renderArchive 루프의 attach 주석도 해제. */
    /* var floorHtml = buildFloorPlanSection(place); */
    var floorHtml = "";

    var bulletsHtml = (Array.isArray(place.bullets) ? place.bullets : [])
      .map(function (b) {
        return "<li>" + escapeHtml(b) + "</li>";
      })
      .join("");

    var bulletsBlock = bulletsHtml
      ? '<section class="archive-bullets" aria-label="콘셉트·운영 포인트">' +
        '<h3>콘셉트 · 운영 포인트</h3>' +
        "<ul>" +
        bulletsHtml +
        "</ul>" +
        "</section>"
      : "";

    var detailHref = "place-detail.html?id=" + encodeURIComponent(place.id);

    return (
      '<article class="archive-card" id="' +
      escapeHtml(place.id) +
      '">' +
      '<header class="archive-head">' +
      statusHtml +
      "<h2>" +
      escapeHtml(place.title) +
      "</h2>" +
      "</header>" +
      photoStrip +
      floorHtml +
      bulletsBlock +
      '<p class="archive-actions">' +
      '<a href="' +
      detailHref +
      '">현재 모습 보기</a> · ' +
      '<a href="map-demo.html">지도에서 위치</a> · ' +
      '<a href="#archive-top">맨 위로</a>' +
      "</p>" +
      "</article>"
    );
  }

  function renderArchive(root, places) {
    document.title = "기록 — 행로";

    if (!places || !places.length) {
      root.innerHTML =
        '<p class="lead">아직 등록된 프로젝트가 없습니다.</p>';
      return;
    }

    var cardsHtml = places
      .map(function (place, i) {
        return buildArchiveCardSummary(place, i);
      })
      .join("");

    var detailsHtml = places.map(buildArchiveDetail).join("");

    root.innerHTML =
      '<div id="archive-top" class="cases">' + cardsHtml + '</div>' +
      '<div class="archive-details">' + detailsHtml + '</div>';

    var cards = root.querySelectorAll(".archive-card");
    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      var pairG = card.querySelector("[data-pair-gallery]");
      if (pairG) attachPairedGalleryListeners(pairG);
      var stripScope = card.querySelector('[data-strip^="before-"]');
      if (stripScope) attachPhotoStripListeners(stripScope);
      /* attachFloorPlanListeners(card, getPlaceFromCard(card, places)); */
    }

    var anchors = root.querySelectorAll("[data-archive-anchor]");
    for (var j = 0; j < anchors.length; j++) {
      (function (a) {
        a.addEventListener("click", function (e) {
          var id = a.getAttribute("data-archive-anchor");
          var target = document.getElementById(id);
          if (target && typeof target.scrollIntoView === "function") {
            e.preventDefault();
            target.scrollIntoView({ behavior: "smooth", block: "start" });
            if (global.history && global.history.replaceState) {
              global.history.replaceState(null, "", "#" + id);
            }
          }
        });
      })(anchors[j]);
    }

    if (global.location.hash) {
      var hashTarget = document.getElementById(
        decodeURIComponent(global.location.hash.slice(1))
      );
      if (hashTarget && typeof hashTarget.scrollIntoView === "function") {
        setTimeout(function () {
          hashTarget.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 60);
      }
    }
  }

  function getPlaceFromCard(card, places) {
    var id = card.getAttribute("id");
    for (var i = 0; i < places.length; i++) {
      if (places[i].id === id) return places[i];
    }
    return null;
  }

  function initArchivePage() {
    var root = document.getElementById("archive-root");
    if (!root) return;

    loadPlaces()
      .then(function (bundle) {
        renderArchive(root, bundle.places);
      })
      .catch(function (err) {
        console.error("[행로 기록]", err);
        root.innerHTML =
          '<div class="unknown-box">' +
          '<p style="margin:0 0 1rem;color:var(--ink-mute)">' +
          escapeHtml(err.message || "데이터를 불러오지 못했습니다.") +
          "</p>" +
          '<a href="map-demo.html">지도로 돌아가기</a>' +
          "</div>";
      });
  }

  global.HAENG_RUNTIME = {
    loadPlaces: loadPlaces,
    initMapPage: initMapPage,
    initDetailPage: initDetailPage,
    initArchivePage: initArchivePage,
  };
})(typeof window !== "undefined" ? window : this);
