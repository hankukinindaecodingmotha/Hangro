/**
 * 행로 토스트 알림 (HangroNotify)
 * 결제·예약·승인 등 사용자 피드백 — 실제 푸시/결제 연동 없음
 */
(function (global) {
  "use strict";

  var rootEl = null;
  var DEFAULT_MS = 4200;

  function ensureRoot() {
    if (rootEl && rootEl.parentNode) return rootEl;
    rootEl = document.createElement("div");
    rootEl.className = "hangro-notify-root";
    rootEl.setAttribute("aria-live", "polite");
    rootEl.setAttribute("aria-atomic", "true");
    document.body.appendChild(rootEl);
    return rootEl;
  }

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function show(opts) {
    opts = opts || {};
    var title = opts.title || "";
    var message = opts.message || opts.text || "";
    var type = opts.type || "info";
    var ms = opts.duration != null ? opts.duration : DEFAULT_MS;

    if (!global.document || !document.body) return;

    var root = ensureRoot();
    var el = document.createElement("div");
    el.className = "hangro-notify hangro-notify--" + type;
    el.innerHTML =
      (title ? "<strong>" + esc(title) + "</strong>" : "") +
      (message ? "<span>" + esc(message) + "</span>" : "");
    root.appendChild(el);

    function remove() {
      el.classList.add("hangro-notify--out");
      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 220);
    }

    if (ms > 0) setTimeout(remove, ms);
    return { dismiss: remove };
  }

  function success(message, title) {
    return show({ type: "success", title: title || "완료", message: message });
  }

  function error(message, title) {
    return show({ type: "error", title: title || "알림", message: message });
  }

  function info(message, title) {
    return show({ type: "info", title: title, message: message });
  }

  global.HangroNotify = {
    show: show,
    success: success,
    error: error,
    info: info,
  };
})(typeof window !== "undefined" ? window : global);
