/**
 * 행로 API 클라이언트 (PortalAPI)
 * demo/server.py 의 /api/* 호출 · 실패 시 localStorage 폴백
 */
(function (global) {
  "use strict";

  var LS_BOOKINGS = "hangro_api_bookings";
  var LS_INQUIRIES = "hangro_api_inquiries";
  var LS_EDITS = "hangro_api_property_edits";
  var LS_API_OK = "hangro_api_server_ok";

  function readLS(key, fallback) {
    try {
      var raw = global.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function writeLS(key, val) {
    try {
      global.localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {}
  }

  function apiBase() {
    try {
      var custom = global.sessionStorage.getItem("hangro_api_base");
      if (custom) return custom.replace(/\/$/, "");
    } catch (e) {}
    return "";
  }

  function request(method, path, body) {
    var url = apiBase() + path;
    var opts = {
      method: method,
      headers: { Accept: "application/json" },
    };
    if (body != null) {
      opts.headers["Content-Type"] = "application/json";
      opts.body = JSON.stringify(body);
    }
    return fetch(url, opts).then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok) {
          var err = new Error((data && data.error) || res.statusText);
          err.status = res.status;
          err.body = data;
          throw err;
        }
        try {
          global.sessionStorage.setItem(LS_API_OK, "1");
        } catch (e) {}
        return data;
      });
    });
  }

  function listBookingsLocal() {
    return readLS(LS_BOOKINGS, []);
  }

  function saveBookingsLocal(list) {
    writeLS(LS_BOOKINGS, list);
  }

  function listInquiriesLocal() {
    return readLS(LS_INQUIRIES, []);
  }

  function saveInquiriesLocal(list) {
    writeLS(LS_INQUIRIES, list);
  }

  function mergeBookingIntoPortalData(booking) {
    var D = global.PORTAL_DATA;
    if (!D || !D.bookings || !booking || !booking.id) return;
    var i = D.bookings.findIndex(function (b) {
      return b.id === booking.id;
    });
    if (i >= 0) D.bookings[i] = Object.assign({}, D.bookings[i], booking);
    else D.bookings.push(booking);
  }

  function hydratePortalData() {
    var D = global.PORTAL_DATA;
    if (!D || !D.bookings) return Promise.resolve();

    return listBookings().then(function (list) {
      list.forEach(mergeBookingIntoPortalData);
    }).catch(function () {
      listBookingsLocal().forEach(mergeBookingIntoPortalData);
    });
  }

  function listBookings(query) {
    query = query || {};
    var qs = [];
    if (query.guestId) qs.push("guestId=" + encodeURIComponent(query.guestId));
    if (query.hostId) qs.push("hostId=" + encodeURIComponent(query.hostId));
    var path = "/api/bookings" + (qs.length ? "?" + qs.join("&") : "");

    return request("GET", path)
      .then(function (data) {
        var list = data.bookings || [];
        saveBookingsLocal(list);
        return list;
      })
      .catch(function () {
        var all = listBookingsLocal();
        var D = global.PORTAL_DATA;
        if (query.hostId && D && D.bookingsForHost) {
          var hostIds = D.bookingsForHost(query.hostId).map(function (b) {
            return b.id;
          });
          return all.concat(
            D.bookingsForHost(query.hostId).filter(function (b) {
              return all.every(function (x) {
                return x.id !== b.id;
              });
            })
          );
        }
        if (query.guestId && D && D.bookingsForGuest) {
          return all.concat(
            D.bookingsForGuest(query.guestId).filter(function (b) {
              return all.every(function (x) {
                return x.id !== b.id;
              });
            })
          );
        }
        return all;
      });
  }

  function createBooking(payload) {
    return request("POST", "/api/bookings", payload)
      .then(function (data) {
        var b = data.booking;
        var list = listBookingsLocal();
        list.unshift(b);
        saveBookingsLocal(list.slice(0, 80));
        mergeBookingIntoPortalData(b);
        return b;
      })
      .catch(function () {
        var id = "trip-" + Date.now();
        var b = {
          id: id,
          propertyId: payload.propertyId,
          guestId: payload.guestId || "guest-demo",
          guestName: payload.guestName || "게스트",
          checkIn: payload.checkIn,
          checkOut: payload.checkOut,
          status: "pending",
          note: payload.note || "",
          guests: payload.guests || 2,
          createdAt: new Date().toISOString(),
        };
        var list = listBookingsLocal();
        list.unshift(b);
        saveBookingsLocal(list.slice(0, 80));
        mergeBookingIntoPortalData(b);
        return b;
      });
  }

  function patchBooking(id, patch) {
    return request("PATCH", "/api/bookings/" + encodeURIComponent(id), patch)
      .then(function (data) {
        var b = data.booking;
        var list = listBookingsLocal().map(function (x) {
          return x.id === id ? Object.assign({}, x, b) : x;
        });
        saveBookingsLocal(list);
        mergeBookingIntoPortalData(b);
        return b;
      })
      .catch(function () {
        var list = listBookingsLocal();
        var found = null;
        list = list.map(function (x) {
          if (x.id === id) {
            found = Object.assign({}, x, patch);
            return found;
          }
          return x;
        });
        if (!found && global.PORTAL_DATA && global.PORTAL_DATA.getBooking) {
          var base = global.PORTAL_DATA.getBooking(id);
          if (base) found = Object.assign({}, base, patch);
        }
        if (found) {
          if (list.every(function (x) {
            return x.id !== id;
          })) list.unshift(found);
          saveBookingsLocal(list);
          mergeBookingIntoPortalData(found);
        }
        return found;
      });
  }

  function createInquiry(payload) {
    return request("POST", "/api/inquiries", payload)
      .then(function (data) {
        var list = listInquiriesLocal();
        list.unshift(data.inquiry);
        saveInquiriesLocal(list.slice(0, 100));
        return data.inquiry;
      })
      .catch(function () {
        var inq = Object.assign(
          { id: "inq-" + Date.now(), createdAt: new Date().toISOString(), status: "new" },
          payload
        );
        var list = listInquiriesLocal();
        list.unshift(inq);
        saveInquiriesLocal(list.slice(0, 100));
        return inq;
      });
  }

  function listInquiries() {
    return request("GET", "/api/inquiries")
      .then(function (data) {
        var list = data.inquiries || [];
        saveInquiriesLocal(list);
        return list;
      })
      .catch(function () {
        return listInquiriesLocal();
      });
  }

  function patchProperty(id, patch) {
    return request("PATCH", "/api/properties/" + encodeURIComponent(id), patch)
      .then(function (data) {
        var edits = readLS(LS_EDITS, {});
        edits[id] = Object.assign({}, edits[id] || {}, data.patch || patch);
        writeLS(LS_EDITS, edits);
        if (global.PORTAL_DATA && global.PORTAL_DATA.savePropertyEdit) {
          global.PORTAL_DATA.savePropertyEdit(id, patch);
        }
        return edits[id];
      })
      .catch(function () {
        if (global.PORTAL_DATA && global.PORTAL_DATA.savePropertyEdit) {
          global.PORTAL_DATA.savePropertyEdit(id, patch);
        }
        var edits = readLS(LS_EDITS, {});
        edits[id] = Object.assign({}, edits[id] || {}, patch);
        writeLS(LS_EDITS, edits);
        return edits[id];
      });
  }

  function ping() {
    return request("GET", "/api/health").then(function () {
      return true;
    }).catch(function () {
      return false;
    });
  }

  global.PortalAPI = {
    ping: ping,
    hydratePortalData: hydratePortalData,
    listBookings: listBookings,
    createBooking: createBooking,
    patchBooking: patchBooking,
    createInquiry: createInquiry,
    listInquiries: listInquiries,
    patchProperty: patchProperty,
    listBookingsLocal: listBookingsLocal,
    listInquiriesLocal: listInquiriesLocal,
  };

  if (global.document && global.PORTAL_DATA) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function () {
        hydratePortalData();
      });
    } else {
      hydratePortalData();
    }
  } else if (global.document) {
    document.addEventListener("DOMContentLoaded", function () {
      if (global.PORTAL_DATA) hydratePortalData();
    });
  }
})(typeof window !== "undefined" ? window : global);
