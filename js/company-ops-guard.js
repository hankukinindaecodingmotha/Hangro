/**
 * 회사 운영(ops) 영역 — 데모 로그인 게이트
 * sessionStorage: hangro_company_ops = "1"
 */
(function (global) {
  "use strict";

  var KEY = "hangro_company_ops";
  var DEMO_USER = "ops";
  var DEMO_PASS = "hangro2026";

  function isAuthed() {
    try {
      return global.sessionStorage.getItem(KEY) === "1";
    } catch (e) {
      return false;
    }
  }

  function login(user, pass) {
    if (user === DEMO_USER && pass === DEMO_PASS) {
      try {
        global.sessionStorage.setItem(KEY, "1");
      } catch (e) {}
      return true;
    }
    return false;
  }

  function logout() {
    try {
      global.sessionStorage.removeItem(KEY);
    } catch (e) {}
  }

  function requireAuth() {
    var path = (global.location.pathname || "").replace(/\\/g, "/");
    var onLogin =
      path.endsWith("/company/ops/index.html") ||
      path.endsWith("/company/ops/") ||
      path.endsWith("/company/ops");
    if (isAuthed()) {
      if (onLogin) global.location.replace("dashboard.html");
      return;
    }
    if (!onLogin) {
      var next = global.location.pathname.split("/").pop() || "dashboard.html";
      global.location.replace("index.html?next=" + encodeURIComponent(next));
    }
  }

  global.CompanyOpsGuard = {
    isAuthed: isAuthed,
    login: login,
    logout: logout,
    requireAuth: requireAuth,
    demoUser: DEMO_USER,
  };

  if (document.body && document.body.getAttribute("data-ops-guard") === "auto") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", requireAuth);
    } else {
      requireAuth();
    }
  }
})(typeof window !== "undefined" ? window : global);
