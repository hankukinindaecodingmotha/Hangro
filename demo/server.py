#!/usr/bin/env python3
"""
Hangro 로컬 데모 서버: 저장소 루트 정적 파일 + /api/* 목 API (한 포트).

  python3 demo/server.py
  python3 demo/server.py 9090

브라우저: http://127.0.0.1:9090/  (기본 포트 9090)
"""
import json
import os
import sys
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from typing import Optional
from urllib.parse import parse_qs, urlparse

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

DEMO_STATE: dict = {
    "messages": [],
    "counters": {"guest": 0, "host": 0, "company": 0},
}


def _json_bytes(obj: object) -> bytes:
    return json.dumps(obj, ensure_ascii=False).encode("utf-8")


class HangroDemoHandler(SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=REPO_ROOT, **kwargs)

    def log_message(self, fmt: str, *args) -> None:
        print("[%s] %s" % (self.log_date_time_string(), fmt % args))

    def end_headers(self) -> None:
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE")
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

    def handle_api(self, method: str, path: str, qs: dict) -> None:
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

        if path == "/api/inbox" and method == "GET":
            role = (qs.get("role") or [""])[0]
            msgs = DEMO_STATE["messages"]
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
            msg = {
                "id": len(DEMO_STATE["messages"]) + 1,
                "role": role,
                "text": text,
            }
            DEMO_STATE["messages"].append(msg)
            self._send_json({"ok": True, "message": msg})
            return

        if path == "/api/inbox" and method == "DELETE":
            DEMO_STATE["messages"].clear()
            self._send_json({"ok": True})
            return

        if path.startswith("/api/counter/") and method == "POST":
            role = path.rstrip("/").split("/")[-1]
            if role not in DEMO_STATE["counters"]:
                self._send_json({"ok": False, "error": "unknown role"}, HTTPStatus.BAD_REQUEST)
                return
            DEMO_STATE["counters"][role] += 1
            self._send_json({"ok": True, "role": role, "count": DEMO_STATE["counters"][role]})
            return

        if path == "/api/counters" and method == "GET":
            self._send_json({"ok": True, "counters": dict(DEMO_STATE["counters"])})
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
    print("Hangro demo — http://%s:%s/" % (addr[0], addr[1]))
    print("  예: /guest/ /host/ /company/ /archive.html /demo/")
    print("  API: GET /api/health  POST /api/inbox  …")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n종료.")


if __name__ == "__main__":
    main()
