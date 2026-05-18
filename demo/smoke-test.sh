#!/usr/bin/env sh
# 데모 서버가 떠 있는 상태에서 HTTP 응답만 빠르게 확인합니다.
# 사용법: ./demo/smoke-test.sh [PORT]
# 기본 포트: 9090

PORT="${1:-9090}"
BASE="http://127.0.0.1:${PORT}"

set -e
echo "== Hangro smoke ( ${BASE} ) =="

curl -sf "${BASE}/api/health" | head -c 200
echo ""
curl -sf "${BASE}/api/places-json" | head -c 200
echo ""
curl -sf "${BASE}/guest/" >/dev/null && echo "GET /guest/ OK"
curl -sf "${BASE}/host/" >/dev/null && echo "GET /host/ OK"
curl -sf "${BASE}/company/" >/dev/null && echo "GET /company/ OK"
curl -sf "${BASE}/demo/index.html" >/dev/null && echo "GET /demo/index.html OK"
curl -sf "${BASE}/archive.html" >/dev/null && echo "GET /archive.html OK"
curl -sf "${BASE}/data/places.json" >/dev/null && echo "GET /data/places.json OK"

echo "== done =="
