/**
 * 게스트·집주인·회사 포털에서 데모 API 동작 확인 (demo/server.py 와 함께 사용).
 * 같은 origin(통합 데모 서버)으로 /api/* 호출.
 */
(function () {
  "use strict";

  var statusEl = document.getElementById("demo-api-status");
  var counterEl = document.getElementById("demo-counter-display");
  var messagesEl = document.getElementById("demo-messages");
  var form = document.getElementById("demo-inbox-form");
  var clearBtn = document.getElementById("demo-inbox-clear");
  var counterBtn = document.getElementById("demo-counter-btn");

  if (!statusEl) return;

  var role = "guest";
  if (location.pathname.indexOf("/host") !== -1) role = "host";
  if (location.pathname.indexOf("/company") !== -1) role = "company";

  function apiJson(path, options) {
    options = options || {};
    return fetch(path, options).then(function (res) {
      return res.json().then(function (body) {
        if (!res.ok) {
          var err = new Error(body.error || res.statusText);
          err.body = body;
          err.status = res.status;
          throw err;
        }
        return body;
      });
    });
  }

  function setStatus(ok, text) {
    statusEl.textContent = text;
    statusEl.className = "demo-api-status " + (ok ? "demo-api-status--ok" : "demo-api-status--err");
  }

  function refreshCounters() {
    if (!counterEl) return;
    return apiJson("/api/counters")
      .then(function (d) {
        counterEl.textContent = JSON.stringify(d.counters);
      })
      .catch(function () {
        counterEl.textContent = "—";
      });
  }

  function refreshMessages() {
    if (!messagesEl) return;
    return apiJson("/api/inbox")
      .then(function (d) {
        var lines = (d.messages || []).map(function (m) {
          return "#" + m.id + " [" + m.role + "] " + m.text;
        });
        messagesEl.textContent = lines.length ? lines.join("\n") : "(메시지 없음)";
      })
      .catch(function () {
        messagesEl.textContent = "(목록을 불러오지 못했습니다)";
      });
  }

  function ping() {
    return apiJson("/api/health")
      .then(function (d) {
        setStatus(true, "API 연결됨 — " + JSON.stringify(d));
        return apiJson("/api/places-json");
      })
      .then(function (d) {
        setStatus(true, statusEl.textContent + " · places.json " + d.bytes + " bytes");
        return refreshCounters();
      })
      .then(function () {
        return refreshMessages();
      })
      .catch(function (e) {
        setStatus(
          false,
          "데모 API에 연결되지 않았습니다. 터미널에서 python3 demo/server.py 실행 후 " +
            "http://127.0.0.1:9090 으로 이 사이트를 여세요. (정적 서버만 켠 경우 /api 가 없습니다.)"
        );
        if (counterEl) counterEl.textContent = "—";
        if (messagesEl) messagesEl.textContent = "—";
      });
  }

  if (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var ta = form.querySelector('[name="text"]');
      var text = ta && ta.value ? String(ta.value).trim() : "";
      if (!text) return;
      apiJson("/api/inbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: role, text: text }),
      })
        .then(function () {
          ta.value = "";
          return refreshMessages();
        })
        .catch(function () {
          setStatus(false, "메시지 전송 실패 — 데모 서버가 켜져 있는지 확인하세요.");
        });
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      apiJson("/api/inbox", { method: "DELETE" })
        .then(function () {
          return refreshMessages();
        })
        .catch(function () {});
    });
  }

  if (counterBtn) {
    counterBtn.addEventListener("click", function () {
      apiJson("/api/counter/" + role, { method: "POST" })
        .then(function () {
          return refreshCounters();
        })
        .catch(function () {});
    });
  }

  ping();
})();
