#!/usr/bin/env bash
# 보관 기간이 지난 개인정보를 지운다(개인정보 처리방침 제3조·제4조).
# cron 등록 예시 (매일 새벽 4시 30분 — 백업 다음):
#   sudo crontab -e
#   30 4 * * * /srv/c3r/app/scripts/cleanup-cron.sh >> /var/log/c3r-cleanup.log 2>&1
#
# 비밀값을 crontab 에 적지 않는다. .env.production 에서 읽어 쓴다.
# 앱에 직접(127.0.0.1:3000) 부르므로 Nginx 의 요청량 제한에 걸리지 않는다.
set -uo pipefail

APP_DIR="${APP_DIR:-/srv/c3r/app}"
PORT="${PORT:-3000}"

say() { echo "[$(date '+%F %T')] $*"; }

notify() {
  if [ -x "$(command -v node || true)" ] && [ -f "$APP_DIR/scripts/notify.mjs" ]; then
    node "$APP_DIR/scripts/notify.mjs" "$1" "$2" || say "알림을 보내지 못했습니다"
  fi
}

SECRET="$(grep -m1 '^CLEANUP_SECRET=' "$APP_DIR/.env.production" 2>/dev/null | cut -d= -f2- | tr -d '"'"'"'')"
if [ -z "$SECRET" ]; then
  say "CLEANUP_SECRET 을 찾지 못했습니다 (.env.production)"
  exit 1
fi

OUT="$(curl -fsS -m 120 -H "Authorization: Bearer $SECRET" "http://127.0.0.1:$PORT/api/cleanup" 2>&1)"
CODE=$?

if [ $CODE -ne 0 ]; then
  say "자동 파기에 실패했습니다: $OUT"
  notify "보관기간 자동 파기 실패" "서버에서 /api/cleanup 을 부르지 못했습니다.

$OUT"
  exit 1
fi

say "$OUT"
