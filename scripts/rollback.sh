#!/usr/bin/env bash
# 배포한 뒤에 문제가 보일 때 직전 판으로 되돌린다.
#   cd /srv/c3r/app && ./scripts/rollback.sh
#
# deploy.sh 가 남겨 둔 .next.prev(직전 빌드)와 한 단계 앞 커밋으로 돌아간다.
# 빌드를 다시 하지 않으므로 1분 안에 끝난다.
set -euo pipefail

APP_DIR="${APP_DIR:-/srv/c3r/app}"
SERVICE="${SERVICE:-c3r}"
PORT="${PORT:-3000}"

cd "$APP_DIR"

if [ ! -d .next.prev ]; then
  echo "되돌릴 이전 빌드(.next.prev)가 없습니다." >&2
  echo "한 단계 앞 코드로 다시 빌드하려면:" >&2
  echo "  git reset --hard HEAD~1 && ./scripts/deploy.sh" >&2
  exit 1
fi

echo "지금: $(git rev-parse --short HEAD)"
echo "▶ 한 단계 앞 코드로 되돌립니다"
git reset --hard --quiet HEAD~1

echo "▶ 직전 빌드로 바꿉니다"
rm -rf .next.rollback-tmp
mv .next .next.rollback-tmp
mv .next.prev .next
# 되돌린 것을 또 되돌릴 수 있게 남겨 둔다
mv .next.rollback-tmp .next.prev

sudo systemctl restart "$SERVICE"

for _ in $(seq 1 40); do
  if curl -fsS -m 3 "http://127.0.0.1:$PORT/api/health" > /dev/null 2>&1; then
    echo "✅ 되돌렸습니다 — $(git rev-parse --short HEAD) / $(systemctl is-active "$SERVICE")"
    exit 0
  fi
  sleep 1
done

echo "❌ 되돌렸지만 응답이 없습니다. 로그를 확인하세요:" >&2
echo "   sudo journalctl -u $SERVICE -n 50 --no-pager" >&2
exit 1
