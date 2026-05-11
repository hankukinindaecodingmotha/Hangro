/**
 * 장소 데이터(JSON) 로드, 지도/상세 페이지 공통 로직
 * 의존: 지도 페이지는 Leaflet(L) 로드 후 initMapPage 호출
 */
(function (global) {
  "use strict";

  var DATA_URL = "data/places.json";
  var CACHE = null;

  var PIN_HEX = "#6b9b7a";

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
      '" stroke="rgba(15,20,18,0.95)" stroke-width="1.2"' +
      ' d="M18 2C11.5 2 7 6.95 7 13.1c0 8.95 11 26.65 11 26.65S29 21.76 29 13.1C29 6.95 24.5 2 18 2z"/>' +
      '<circle cx="18" cy="13" r="5" fill="#0f1412" opacity="0.92"/>' +
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

          marker.on("click", function () {
            global.location.href =
              "place-detail.html?id=" + encodeURIComponent(s.id);
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
        '<p style="margin:0 0 1rem;color:var(--text-muted)">지도에서 핀을 골라 다시 들어와 주세요.</p>' +
        '<a href="map-demo.html">지도 데모로 이동</a>' +
        "</div>";
    }
  }

  function renderPlaceDetail(root, main, place) {
    document.title = place.title + " — 행로";

    var tagsHtml = place.tags
      .map(function (t) {
        return "<li>" + escapeHtml(t) + "</li>";
      })
      .join("");

    root.innerHTML =
      "<h1>" +
      escapeHtml(place.title) +
      "</h1>" +
      "<p class=\"lead\">" +
      escapeHtml(place.lead) +
      "</p>" +
      "<ul class=\"tags\">" +
      tagsHtml +
      "</ul>";

    main.innerHTML =
      '<section class="ba-section" aria-labelledby="ba-heading">' +
      '<h2 id="ba-heading">공간 변화</h2>' +
      '<p class="hint">실제 서비스에서는 촬영한 사진·3D 워크스루 영상 등으로 교체하면 됩니다. 아래는 레이아웃용 데모 그래픽입니다.</p>' +
      '<div class="ba-grid">' +
      '<figure class="ba-card">' +
      "<figcaption>" +
      escapeHtml(place.beforeCaption) +
      "</figcaption>" +
      '<div class="facade facade--before">' +
      winGrid() +
      "</div>" +
      "<p>" +
      escapeHtml(place.beforeText) +
      "</p>" +
      "</figure>" +
      '<figure class="ba-card">' +
      "<figcaption>" +
      escapeHtml(place.afterCaption) +
      "</figcaption>" +
      '<div class="facade facade--after">' +
      winGrid() +
      "</div>" +
      "<p>" +
      escapeHtml(place.afterText) +
      "</p>" +
      "</figure>" +
      "</div>" +
      "</section>" +
      '<section class="detail-story" aria-labelledby="story-heading">' +
      '<h2 id="story-heading">프로그램 · 운영 포인트</h2>' +
      "<ul>" +
      place.bullets
        .map(function (b) {
          return "<li>" + escapeHtml(b) + "</li>";
        })
        .join("") +
      "</ul>" +
      "</section>" +
      '<p style="margin-top:2rem;font-size:0.88rem;color:var(--text-muted)">' +
      '<a href="booking.html">이런 프로젝트 상담 예약</a> · ' +
      '<a href="map-demo.html">다른 핀 보기</a>' +
      "</p>";
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
          '<p style="margin:0 0 1rem;color:var(--text-muted)">HTTP 서버로 사이트를 연 뒤 다시 시도해 주세요.</p>' +
          '<a href="map-demo.html">지도 데모로 이동</a>' +
          "</div>";
      });
  }

  global.HAENG_RUNTIME = {
    loadPlaces: loadPlaces,
    initMapPage: initMapPage,
    initDetailPage: initDetailPage,
  };
})(typeof window !== "undefined" ? window : this);
