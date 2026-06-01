#!/usr/bin/env python3
"""
Hangro 로컬 데모 서버: 저장소 루트 정적 파일 + /api/* (예약·상담·숙소 편집).

  python3 demo/server.py
  python3 demo/server.py 9090

브라우저: http://127.0.0.1:9090/
"""
import json
import os
import sys
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from typing import Any, Optional
from urllib.parse import parse_qs, urlparse

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
STATE_PATH = os.path.join(os.path.dirname(__file__), "api-state.json")

DEFAULT_STATE: dict = {
    "messages": [],
    "counters": {"guest": 0, "host": 0, "company": 0},
    "inquiries": [],
    "bookings": [],
    "property_edits": {},
}


def _json_bytes(obj: object) -> bytes:
    return json.dumps(obj, ensure_ascii=False).encode("utf-8")


def load_state() -> dict:
    if not os.path.isfile(STATE_PATH):
        return json.loads(json.dumps(DEFAULT_STATE))
    try:
        with open(STATE_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        if not isinstance(data, dict):
            return json.loads(json.dumps(DEFAULT_STATE))
        for key, val in DEFAULT_STATE.items():
            if key not in data:
                data[key] = val
        return data
    except (json.JSONDecodeError, OSError):
        return json.loads(json.dumps(DEFAULT_STATE))


def save_state(state: dict) -> None:
    try:
        with open(STATE_PATH, "w", encoding="utf-8") as f:
            json.dump(state, f, ensure_ascii=False, indent=2)
    except OSError as e:
        print("[state] save failed:", e)


class HangroDemoHandler(SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=REPO_ROOT, **kwargs)

    def log_message(self, fmt: str, *args) -> None:
        print("[%s] %s" % (self.log_date_time_string(), fmt % args))

    def end_headers(self) -> None:
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS, DELETE")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()

    def do_OPTIONS(self) -> None:
        self.send_response(HTTPStatus.NO_CONTENT)
        self.end_headers()

    def _send_json(self, obj: object, status: int = HTTPStatus.OK) -> None:
        body = _json_bytes(obj)
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _read_json_body(self) -> Optional[dict]:
        try:
            n = int(self.headers.get("Content-Length") or 0)
        except ValueError:
            n = 0
        if n <= 0:
            return {}
        raw = self.rfile.read(n)
        try:
            out = json.loads(raw.decode("utf-8"))
        except json.JSONDecodeError:
            return None
        return out if isinstance(out, dict) else None

    def _state(self) -> dict:
        if not hasattr(self.server, "hangro_state"):
            self.server.hangro_state = load_state()  # type: ignore[attr-defined]
        return self.server.hangro_state  # type: ignore[attr-defined]

    def _persist(self) -> None:
        save_state(self._state())

    def handle_api(self, method: str, path: str, qs: dict) -> None:
        state = self._state()

        if path == "/api/health" and method == "GET":
            self._send_json({"ok": True, "service": "hangro-demo"})
            return

        if path == "/api/places-json" and method == "GET":
            p = os.path.join(REPO_ROOT, "data", "places.json")
            if not os.path.isfile(p):
                self._send_json({"ok": False, "error": "missing data/places.json"}, HTTPStatus.NOT_FOUND)
                return
            st = os.stat(p)
            self._send_json({"ok": True, "path": "data/places.json", "bytes": st.st_size})
            return

        # ── 상담 ──
        if path == "/api/inquiries" and method == "GET":
            self._send_json({"ok": True, "inquiries": state.get("inquiries", [])[-100:]})
            return

        if path == "/api/inquiries" and method == "POST":
            data = self._read_json_body()
            if data is None:
                self._send_json({"ok": False, "error": "invalid json"}, HTTPStatus.BAD_REQUEST)
                return
            name = (data.get("name") or "").strip()
            if not name:
                self._send_json({"ok": False, "error": "name required"}, HTTPStatus.BAD_REQUEST)
                return
            inq = {
                "id": "inq-" + str(len(state.get("inquiries", [])) + 1) + "-" + str(os.getpid()),
                "name": name,
                "phone": (data.get("phone") or "").strip(),
                "email": (data.get("email") or "").strip(),
                "date": (data.get("date") or "").strip(),
                "time": (data.get("time") or "").strip(),
                "type": (data.get("type") or "general").strip(),
                "message": (data.get("message") or "").strip(),
                "status": "new",
                "createdAt": data.get("createdAt") or __import__("datetime").datetime.utcnow().isoformat() + "Z",
            }
            state.setdefault("inquiries", []).append(inq)
            self._persist()
            self._send_json({"ok": True, "inquiry": inq})
            return

        # ── 예약 ──
        if path == "/api/bookings" and method == "GET":
            bookings = list(state.get("bookings", []))
            guest_id = (qs.get("guestId") or [""])[0]
            host_id = (qs.get("hostId") or [""])[0]
            if guest_id:
                bookings = [b for b in bookings if b.get("guestId") == guest_id]
            if host_id:
                bookings = [
                    b
                    for b in bookings
                    if b.get("hostId") == host_id or host_id in (b.get("hostIds") or [])
                ]
            self._send_json({"ok": True, "bookings": bookings})
            return

        if path == "/api/bookings" and method == "POST":
            data = self._read_json_body()
            if data is None:
                self._send_json({"ok": False, "error": "invalid json"}, HTTPStatus.BAD_REQUEST)
                return
            prop = (data.get("propertyId") or "").strip()
            if not prop:
                self._send_json({"ok": False, "error": "propertyId required"}, HTTPStatus.BAD_REQUEST)
                return
            booking = {
                "id": "trip-" + str(int(__import__("time").time() * 1000)),
                "propertyId": prop,
                "guestId": (data.get("guestId") or "guest-demo").strip(),
                "guestName": (data.get("guestName") or "게스트").strip(),
                "checkIn": (data.get("checkIn") or "").strip(),
                "checkOut": (data.get("checkOut") or "").strip(),
                "guests": int(data.get("guests") or 2),
                "status": "pending",
                "note": (data.get("note") or "").strip(),
                "phone": (data.get("phone") or "").strip(),
                "createdAt": __import__("datetime").datetime.utcnow().isoformat() + "Z",
            }
            state.setdefault("bookings", []).insert(0, booking)
            self._persist()
            self._send_json({"ok": True, "booking": booking})
            return

        if path.startswith("/api/bookings/") and method == "PATCH":
            bid = path.split("/")[-1]
            data = self._read_json_body()
            if data is None:
                self._send_json({"ok": False, "error": "invalid json"}, HTTPStatus.BAD_REQUEST)
                return
            bookings = state.get("bookings", [])
            found: Optional[dict] = None
            for i, b in enumerate(bookings):
                if b.get("id") == bid:
                    bookings[i] = {**b, **{k: v for k, v in data.items() if k != "id"}}
                    found = bookings[i]
                    break
            if not found:
                self._send_json({"ok": False, "error": "booking not found"}, HTTPStatus.NOT_FOUND)
                return
            self._persist()
            self._send_json({"ok": True, "booking": found})
            return

        # ── 숙소 편집 ──
        if path.startswith("/api/properties/") and path.endswith("/edits") and method == "GET":
            pid = path.split("/")[3]
            patch = state.get("property_edits", {}).get(pid, {})
            self._send_json({"ok": True, "propertyId": pid, "patch": patch})
            return

        if path.startswith("/api/properties/") and method == "PATCH":
            parts = path.strip("/").split("/")
            if len(parts) < 3:
                self._send_json({"ok": False, "error": "bad path"}, HTTPStatus.BAD_REQUEST)
                return
            pid = parts[2]
            data = self._read_json_body()
            if data is None:
                self._send_json({"ok": False, "error": "invalid json"}, HTTPStatus.BAD_REQUEST)
                return
            edits = state.setdefault("property_edits", {})
            edits[pid] = {**edits.get(pid, {}), **data}
            self._persist()
            self._send_json({"ok": True, "propertyId": pid, "patch": edits[pid]})
            return

        if path == "/api/inbox" and method == "GET":
            role = (qs.get("role") or [""])[0]
            msgs = state["messages"]
            if role:
                msgs = [m for m in msgs if m.get("role") == role]
            self._send_json({"ok": True, "messages": msgs[-50:]})
            return

        if path == "/api/inbox" and method == "POST":
            data = self._read_json_body()
            if data is None:
                self._send_json({"ok": False, "error": "invalid json"}, HTTPStatus.BAD_REQUEST)
                return
            text = (data.get("text") or "").strip()
            role = (data.get("role") or "guest").strip()
            if role not in ("guest", "host", "company"):
                role = "guest"
            if not text:
                self._send_json({"ok": False, "error": "text required"}, HTTPStatus.BAD_REQUEST)
                return
            msg = {"id": len(state["messages"]) + 1, "role": role, "text": text}
            state["messages"].append(msg)
            self._persist()
            self._send_json({"ok": True, "message": msg})
            return

        if path == "/api/inbox" and method == "DELETE":
            state["messages"].clear()
            self._persist()
            self._send_json({"ok": True})
            return

        if path.startswith("/api/counter/") and method == "POST":
            role = path.rstrip("/").split("/")[-1]
            if role not in state["counters"]:
                self._send_json({"ok": False, "error": "unknown role"}, HTTPStatus.BAD_REQUEST)
                return
            state["counters"][role] += 1
            self._persist()
            self._send_json({"ok": True, "role": role, "count": state["counters"][role]})
            return

        if path == "/api/counters" and method == "GET":
            self._send_json({"ok": True, "counters": dict(state["counters"])})
            return

        self._send_json({"ok": False, "error": "not found", "path": path}, HTTPStatus.NOT_FOUND)

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path.startswith("/api/"):
            self.handle_api("GET", parsed.path, parse_qs(parsed.query))
        else:
            super().do_GET()

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path.startswith("/api/"):
            self.handle_api("POST", parsed.path, parse_qs(parsed.query))
        else:
            self.send_error(HTTPStatus.NOT_FOUND)

    def do_PATCH(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path.startswith("/api/"):
            self.handle_api("PATCH", parsed.path, parse_qs(parsed.query))
        else:
            self.send_error(HTTPStatus.NOT_FOUND)

    def do_DELETE(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path.startswith("/api/"):
            self.handle_api("DELETE", parsed.path, parse_qs(parsed.query))
        else:
            self.send_error(HTTPStatus.NOT_FOUND)


def main() -> None:
    port = 9090
    if len(sys.argv) > 1:
        port = int(sys.argv[1])
    os.chdir(REPO_ROOT)
    addr = ("127.0.0.1", port)
    httpd = ThreadingHTTPServer(addr, HangroDemoHandler)
    httpd.hangro_state = load_state()  # type: ignore[attr-defined]
    print("Hangro demo — http://%s:%s/" % (addr[0], addr[1]))
    print("  예: /guest/ /host/ /company/")
    print("  API: GET /api/health  POST /api/bookings  POST /api/inquiries  …")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n종료.")


if __name__ == "__main__":
    main()
