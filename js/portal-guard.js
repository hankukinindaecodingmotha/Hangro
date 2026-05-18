/**
 * 게스트 ↔ 집주인 상호 접근 차단 (같은 origin, sessionStorage).
 * /company/ 및 공개 페이지는 잠금을 건드리지 않음.
 */
(function () {
  "use strict";

  var STORAGE_KEY = "hangro_portal_lock";
  var path = window.location.pathname || "";

  var isGuest = /\/guest(\/|$)/.test(path);
  var isHost = /\/host(\/|$)/.test(path);
  var isCompany = /\/company(\/|$)/.test(path);

  if (isCompany || (!isGuest && !isHost)) {
    return;
  }

  var lock = null;
  try {
    lock = sessionStorage.getItem(STORAGE_KEY);
  } catch (e) {
    return;
  }

  var base = path.replace(/\/guest(\/.*)?$/, "").replace(/\/host(\/.*)?$/, "");
  if (!base.endsWith("/")) {
    base += "/";
  }

  function guestRoot() {
    return base + "guest/";
  }

  function hostRoot() {
    return base + "host/";
  }

  if (isGuest) {
    if (lock === "host") {
      window.location.replace(hostRoot());
      return;
    }
    try {
      sessionStorage.setItem(STORAGE_KEY, "guest");
    } catch (e) {}
    return;
  }

  if (isHost) {
    if (lock === "guest") {
      window.location.replace(guestRoot());
      return;
    }
    try {
      sessionStorage.setItem(STORAGE_KEY, "host");
    } catch (e) {}
  }
})();
