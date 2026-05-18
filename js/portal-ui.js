/**
 * 포털 공통 UI (상태 뱃지, URL 파라미터, 폼 데모 저장)
 */
(function (global) {
  "use strict";

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

  var STATUS_LABEL = {
    confirmed: { text: "확정", className: "portal-status--confirmed" },
    pending: { text: "대기", className: "portal-status--pending" },
    done: { text: "완료", className: "portal-status--done" },
    open: { text: "미답", className: "portal-status--open" },
    replied: { text: "답변됨", className: "portal-status--done" },
    active: { text: "운영 중", className: "portal-status--confirmed" },
    paused: { text: "준비 중", className: "portal-status--pending" },
  };

  function statusBadge(status) {
    var s = STATUS_LABEL[status] || { text: status, className: "portal-status--done" };
    return (
      '<span class="portal-status ' +
      s.className +
      '">' +
      escapeHtml(s.text) +
      "</span>"
    );
  }

  function formatDateRange(checkIn, checkOut) {
    return escapeHtml(checkIn) + " → " + escapeHtml(checkOut);
  }

  function initMessageForm(formId, role) {
    var form = document.getElementById(formId);
    if (!form || !global.PORTAL_DATA) return;

    var storageKey = "portal-demo-messages-" + role;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var subject = form.querySelector('[name="subject"]');
      var body = form.querySelector('[name="body"]');
      if (!subject || !body || !body.value.trim()) return;

      var list = [];
      try {
        list = JSON.parse(global.localStorage.getItem(storageKey) || "[]");
      } catch (err) {
        list = [];
      }
      list.unshift({
        subject: subject.value.trim(),
        body: body.value.trim(),
        at: new Date().toISOString().slice(0, 10),
        role: role,
      });
      global.localStorage.setItem(storageKey, JSON.stringify(list.slice(0, 20)));
      body.value = "";
      if (subject) subject.value = "";
      var note = document.getElementById("portal-form-note");
      if (note) {
        note.textContent = "데모: 브라우저에만 저장됩니다. API 연동 시 서버로 전송됩니다.";
        note.hidden = false;
      }
      renderLocalMessages(storageKey, "portal-local-messages");
    });

    renderLocalMessages(storageKey, "portal-local-messages");
  }

  function renderLocalMessages(storageKey, containerId) {
    var el = document.getElementById(containerId);
    if (!el) return;
    var list = [];
    try {
      list = JSON.parse(global.localStorage.getItem(storageKey) || "[]");
    } catch (err) {
      list = [];
    }
    if (!list.length) {
      el.innerHTML = '<p class="portal-empty">직접 작성한 메시지가 없습니다.</p>';
      return;
    }
    el.innerHTML =
      '<ul class="portal-list">' +
      list
        .map(function (m) {
          return (
            "<li><strong>" +
            escapeHtml(m.subject) +
            '</strong><span class="meta">' +
            escapeHtml(m.at) +
            " · " +
            escapeHtml(m.role) +
            "<br>" +
            escapeHtml(m.body) +
            "</span></li>"
          );
        })
        .join("") +
      "</ul>";
  }

  global.PortalUI = {
    escapeHtml: escapeHtml,
    queryParam: queryParam,
    statusBadge: statusBadge,
    formatDateRange: formatDateRange,
    initMessageForm: initMessageForm,
  };
})(typeof window !== "undefined" ? window : global);
