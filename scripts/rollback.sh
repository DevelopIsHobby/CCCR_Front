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

# deploy.sh 가 '이 빌드가 어느 코드의 것인지' 적어 둔다. 그 지점으로 돌아가야
# 코드와 빌드가 맞는다. 한 배포가 커밋을 여러 개 받아 왔을 수 있으므로
# HEAD~1 로는 부족하다.
TARGET=""
if [ -f .next.prev.sha ]; then
  TARGET="$(tr -d '[:space:]' < .next.prev.sha)"
fi

if [ -n "$TARGET" ]; then
  echo "▶ 배포 전 코드로 되돌립니다 ($(git rev-parse --short "$TARGET"))"
  git reset --hard --quiet "$TARGET"
else
  echo "⚠ 되돌릴 지점 기록(.next.prev.sha)이 없습니다 — 한 커밋만 되돌립니다."
  echo "  그 배포가 커밋을 여러 개 받아 왔다면 코드와 빌드가 어긋날 수 있습니다."
  git reset --hard --quiet HEAD~1
fi

echo "▶ 직전 빌드로 바꿉니다"
rm -rf .next.rollback-tmp
mv .next .next.rollback-tmp
mv .next.prev .next
# 이 기록은 방금 쓴 것이라 더는 맞지 않는다. 다음 배포가 새로 적는다.
rm -f .next.prev.sha
# 되돌린 것을 또 되돌릴 수 있게 남겨 둔다
mv .next.rollback-tmp .next.prev

sudo systemctl restart "$SERVICE"

for _ in $(seq 1 40); do
  if curl -fsS -m 3 "http://127.0.0.1:$PORT/api/health/live" > /dev/null 2>&1; then
    echo "✅ 되돌렸습니다 — $(git rev-parse --short HEAD) / $(systemctl is-active "$SERVICE")"
    exit 0
  fi
  sleep 1
done

echo "❌ 되돌렸지만 응답이 없습니다. 로그를 확인하세요:" >&2
echo "   sudo journalctl -u $SERVICE -n 50 --no-pager" >&2
exit 1
