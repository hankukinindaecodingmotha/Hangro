/**
 * 주변 맛집·명소 지도 (SPOTS_RUNTIME)
 * data/spots.json → Leaflet 지도 + 필터·목록
 */
(function (global) {
  "use strict";

  var CATEGORY_LABEL = {
    cafe: "카페",
    restaurant: "식당",
    attraction: "명소",
  };

  var CATEGORY_COLOR = {
    cafe: "#6B4F3A",
    restaurant: "#B54A32",
    attraction: "#2D6A4F",
  };

  var FILTER_DEFS = [
    { id: "all", label: "전체" },
    { id: "jukcheon", label: "죽천" },
    { id: "cafe", label: "카페" },
    { id: "restaurant", label: "식당" },
    { id: "attraction", label: "명소" },
  ];

  var CACHE = null;
  var mapInstance = null;
  var markerLayer = null;
  var markersById = {};
  var activeFilter = "all";

  function resolveSpotsDataUrl() {
    var nodes = document.querySelectorAll('script[src*="spots-runtime"]');
    var script = nodes.length ? nodes[nodes.length - 1] : document.currentScript;
    if (script && script.src) {
      try {
        return new URL("../data/spots.json", script.src).href;
      } catch (e) {}
    }
    if (global.location && global.location.origin && /^https?:/.test(global.location.protocol)) {
      var path = global.location.pathname || "";
      var siteRoot = "";
      if (path.indexOf("/company/") !== -1) {
        siteRoot = path.substring(0, path.indexOf("/company"));
      }
      return global.location.origin + siteRoot + "/data/spots.json";
    }
    return "/data/spots.json";
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function loadSpots() {
    if (CACHE) return Promise.resolve(CACHE);
    return fetch(resolveSpotsDataUrl(), { cache: "default" })
      .then(function (res) {
        if (!res.ok) {
          throw new Error("주변 정보를 불러오지 못했습니다 (HTTP " + res.status + ").");
        }
        return res.json();
      })
      .then(function (raw) {
        if (!raw || !Array.isArray(raw.spots) || !raw.spots.length) {
          throw new Error("spots.json: spots 배열이 비었습니다.");
        }
        raw.spots.forEach(function (s, i) {
          if (!s.id || !s.name || !s.lat || !s.lng) {
            throw new Error("[spots.json #" + i + "] id, name, lat, lng가 필요합니다.");
          }
        });
        CACHE = raw;
        return raw;
      });
  }

  function matchesFilter(spot, filterId) {
    if (filterId === "all") return true;
    if (filterId === "jukcheon") return spot.area === "jukcheon";
    return spot.category === filterId;
  }

  function pinSvg(color) {
    return (
      '<svg class="haeng-pin-svg" viewBox="0 0 36 44" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<path fill="' + color + '" stroke="' + color + '" stroke-width="1"' +
      ' d="M18 2C11.5 2 7 6.95 7 13.1c0 8.95 11 26.65 11 26.65S29 21.76 29 13.1C29 6.95 24.5 2 18 2z"/>' +
      '<circle cx="18" cy="13" r="3.5" fill="#EFE9DC"/>' +
      "</svg>"
    );
  }

  function popupHtml(spot) {
    var cat = CATEGORY_LABEL[spot.category] || spot.category;
    var desc = spot.description
      ? '<p class="spots-popup-desc">' + escapeHtml(spot.description) + "</p>"
      : "";
    var addr = spot.address
      ? '<p class="spots-popup-addr">' + escapeHtml(spot.address) + "</p>"
      : "";
    var kakao = spot.kakaoUrl
      ? '<a class="spots-popup-link" href="' +
        escapeHtml(spot.kakaoUrl) +
        '" target="_blank" rel="noopener noreferrer">카카오맵에서 보기 →</a>'
      : "";
    return (
      '<div class="spots-popup">' +
      '<p class="spots-popup-kicker">' + escapeHtml(cat) + "</p>" +
      "<h3>" + escapeHtml(spot.name) + "</h3>" +
      desc +
      addr +
      kakao +
      "</div>"
    );
  }

  function renderList(spots, listEl, onSelect) {
    if (!listEl) return;
    var filtered = spots.filter(function (s) {
      return matchesFilter(s, activeFilter);
    });
    if (!filtered.length) {
      listEl.innerHTML = '<li class="spots-list-empty">해당 조건의 장소가 없습니다.</li>';
      return;
    }
    listEl.innerHTML = filtered
      .map(function (s) {
        var cat = CATEGORY_LABEL[s.category] || "";
        var areaLabel = s.area === "jukcheon" ? "죽천" : "포항";
        return (
          '<li><button type="button" class="spots-list-item" data-spot-id="' +
          escapeHtml(s.id) +
          '">' +
          '<span class="spots-list-cat spots-list-cat--' +
          escapeHtml(s.category) +
          '">' +
          escapeHtml(cat) +
          "</span>" +
          "<strong>" +
          escapeHtml(s.name) +
          "</strong>" +
          '<span class="spots-list-meta">' +
          escapeHtml(areaLabel) +
          (s.address ? " · " + escapeHtml(s.address) : "") +
          "</span>" +
          "</button></li>"
        );
      })
      .join("");

    listEl.querySelectorAll("[data-spot-id]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-spot-id");
        if (onSelect) onSelect(id);
        listEl.querySelectorAll(".spots-list-item").forEach(function (b) {
          b.classList.toggle("is-active", b === btn);
        });
      });
    });
  }

  function renderFilters(filtersEl, onChange) {
    if (!filtersEl) return;
    filtersEl.innerHTML = FILTER_DEFS.map(function (f) {
      return (
        '<button type="button" class="spots-filter' +
        (f.id === activeFilter ? " is-active" : "") +
        '" data-filter="' +
        escapeHtml(f.id) +
        '">' +
        escapeHtml(f.label) +
        "</button>"
      );
    }).join("");

    filtersEl.querySelectorAll("[data-filter]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        activeFilter = btn.getAttribute("data-filter");
        filtersEl.querySelectorAll(".spots-filter").forEach(function (b) {
          b.classList.toggle("is-active", b === btn);
        });
        if (onChange) onChange();
      });
    });
  }

  function updateMarkers(spots, map) {
    var L = global.L;
    if (!markerLayer) {
      markerLayer = L.layerGroup().addTo(map);
    }
    markerLayer.clearLayers();
    markersById = {};

    var bounds = [];
    var filtered = spots.filter(function (s) {
      return matchesFilter(s, activeFilter);
    });

    filtered.forEach(function (s) {
      var color = CATEGORY_COLOR[s.category] || "#1A2419";
      var icon = L.divIcon({
        className: "haeng-pin-icon",
        html: '<div class="haeng-pin haeng-pin-wrap">' + pinSvg(color) + "</div>",
        iconSize: [36, 44],
        iconAnchor: [18, 42],
      });
      var marker = L.marker([s.lat, s.lng], { icon: icon }).addTo(markerLayer);
      marker.bindTooltip(s.name, { sticky: true });
      marker.bindPopup(popupHtml(s), {
        offset: [0, -34],
        closeButton: true,
        className: "haeng-popup-wrap spots-popup-wrap",
      });
      markersById[s.id] = marker;
      bounds.push([s.lat, s.lng]);
    });

    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 14 });
    } else if (bounds.length === 1) {
      map.setView(bounds[0], 14);
    }
  }

  function focusSpot(id) {
    var marker = markersById[id];
    if (!marker || !mapInstance) return;
    mapInstance.setView(marker.getLatLng(), Math.max(mapInstance.getZoom(), 15), {
      animate: true,
    });
    marker.openPopup();
  }

  function showMapFallback(mapEl, message) {
    if (!mapEl) return;
    mapEl.innerHTML = '<p class="map-legend" role="alert">' + escapeHtml(message) + "</p>";
  }

  function readInitialFilter() {
    try {
      var q = new URLSearchParams(global.location.search).get("filter");
      if (q && FILTER_DEFS.some(function (f) { return f.id === q; })) return q;
    } catch (e) {}
    return "all";
  }

  function initSpotsPage(options) {
    var mapEl = document.getElementById((options && options.mapElId) || "spots-map");
    var listEl = document.getElementById((options && options.listElId) || "spots-list");
    var filtersEl = document.getElementById((options && options.filtersElId) || "spots-filters");
    if (!mapEl) return;

    activeFilter = readInitialFilter();

    if (typeof global.L === "undefined") {
      showMapFallback(mapEl, "지도 라이브러리를 불러오지 못했습니다.");
      return;
    }

    loadSpots()
      .then(function (data) {
        var L = global.L;
        var spots = data.spots;
        var jukcheon = spots.filter(function (s) {
          return s.area === "jukcheon";
        });
        var center = jukcheon[0] || spots[0];

        mapInstance = L.map(mapEl, {
          zoomControl: true,
          scrollWheelZoom: false,
        }).setView([center.lat, center.lng], 13);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
          maxZoom: 19,
        }).addTo(mapInstance);

        function refresh() {
          updateMarkers(spots, mapInstance);
          renderList(spots, listEl, focusSpot);
        }

        renderFilters(filtersEl, refresh);
        refresh();

        setTimeout(function () {
          mapInstance.invalidateSize();
        }, 250);
      })
      .catch(function (err) {
        console.error("[행로 주변 지도]", err);
        showMapFallback(mapEl, err.message || "주변 데이터를 불러오지 못했습니다.");
      });
  }

  global.SPOTS_RUNTIME = {
    loadSpots: loadSpots,
    initSpotsPage: initSpotsPage,
    CATEGORY_LABEL: CATEGORY_LABEL,
  };
})(typeof window !== "undefined" ? window : global);
