#!/usr/bin/env bash
# 사이트가 살아 있는지 몇 분마다 보고, 멈추면 사무국 메일로 알린다.
# cron 등록 예시 (5분마다):
#   sudo crontab -e
#   */5 * * * * /srv/c3r/app/scripts/watch.sh >> /var/log/c3r-watch.log 2>&1
#
# 왜 필요한가
#   systemd 가 앱이 죽으면 다시 띄우지만, 5분에 5번을 넘겨 죽으면 그만 시도한다.
#   그때부터 사이트는 내려가 있는데 아무도 모른다. 누가 전화할 때까지.
#
# 시끄럽지 않게
#   멈춘 그때 한 번, 돌아온 그때 한 번만 보낸다. 계속 멈춰 있다고 5분마다
#   보내면 사람이 메일을 무시하게 되고, 그러면 감시가 없는 것과 같다.
set -uo pipefail

URL="${WATCH_URL:-https://cccr.kr/api/health/live}"
APP_DIR="${APP_DIR:-/srv/c3r/app}"
STATE="${WATCH_STATE:-/var/lib/c3r-watch.state}"
# 이만큼 연속으로 실패해야 알린다. 한 번 끊긴 것으로 새벽에 사람을 깨우지 않는다
FAILS_BEFORE_ALERT="${FAILS_BEFORE_ALERT:-2}"
# 디스크가 이만큼(%) 차면 알린다
DISK_WARN="${DISK_WARN:-85}"
# 인증서가 이만큼(일) 남으면 알린다. certbot 이 30일 전부터 갱신을 시도한다
CERT_WARN_DAYS="${CERT_WARN_DAYS:-14}"

say() { echo "[$(date '+%F %T')] $*"; }

notify() {
  if [ -x "$(command -v node || true)" ] && [ -f "$APP_DIR/scripts/notify.mjs" ]; then
    node "$APP_DIR/scripts/notify.mjs" "$1" "$2" || say "알림을 보내지 못했습니다"
  else
    say "알림을 보낼 수 없습니다(node 또는 notify.mjs 없음)"
  fi
}

mkdir -p "$(dirname "$STATE")"
[ -f "$STATE" ] || echo "ok 0" > "$STATE"
read -r LAST COUNT < "$STATE"
COUNT="${COUNT:-0}"

# ── 살아 있는가 ────────────────────────────────────────────
CODE="$(curl -s -o /dev/null -m 12 -w '%{http_code}' "$URL" 2>/dev/null || echo 000)"

if [ "$CODE" = "200" ]; then
  if [ "$LAST" = "down" ]; then
    say "✅ 사이트가 돌아왔습니다 ($URL)"
    notify "사이트가 돌아왔습니다" "$(date '+%F %T') 부터 다시 정상입니다.
주소: $URL

멈춰 있는 동안 무슨 일이 있었는지는 아래로 볼 수 있습니다.
  sudo journalctl -u c3r -n 100 --no-pager"
  fi
  echo "ok 0" > "$STATE"
else
  COUNT=$((COUNT + 1))
  say "응답 없음 (HTTP $CODE) — 연속 ${COUNT}회"
  if [ "$COUNT" -ge "$FAILS_BEFORE_ALERT" ] && [ "$LAST" != "down" ]; then
    notify "사이트가 응답하지 않습니다" "$(date '+%F %T') 확인했을 때 응답이 없습니다.
주소: $URL
응답: HTTP $CODE
연속 실패: ${COUNT}회

서버에 들어가 아래를 보세요.
  systemctl status c3r
  journalctl -u c3r -n 100 --no-pager
  systemctl status postgresql

systemd 가 다시 띄우기를 그만둔 상태라면 이렇게 되살립니다.
  sudo systemctl reset-failed c3r && sudo systemctl start c3r"
    echo "down $COUNT" > "$STATE"
  else
    echo "${LAST} ${COUNT}" > "$STATE"
  fi
fi

# ── 디스크 ─────────────────────────────────────────────────
USED="$(df -P / | awk 'NR==2 {gsub(/%/,"",$5); print $5}')"
DISK_FLAG="/var/lib/c3r-watch.disk"
if [ "${USED:-0}" -ge "$DISK_WARN" ]; then
  if [ ! -f "$DISK_FLAG" ]; then
    say "디스크 ${USED}% — 알립니다"
    notify "디스크가 거의 찼습니다 (${USED}%)" "서버 디스크가 ${USED}% 찼습니다.

  df -h /
  du -sh /srv/c3r/backup /srv/c3r/data/uploads /var/log

백업은 30일치를 두고 지웁니다. 그보다 빨리 찬다면 올린 파일이나 로그를 보세요."
    : > "$DISK_FLAG"
  fi
else
  rm -f "$DISK_FLAG"
fi

# ── 인증서 ─────────────────────────────────────────────────
CERT="/etc/letsencrypt/live/cccr.kr/fullchain.pem"
CERT_FLAG="/var/lib/c3r-watch.cert"
if [ -f "$CERT" ]; then
  END="$(openssl x509 -enddate -noout -in "$CERT" 2>/dev/null | cut -d= -f2)"
  if [ -n "$END" ]; then
    LEFT=$(( ( $(date -d "$END" +%s) - $(date +%s) ) / 86400 ))
    if [ "$LEFT" -le "$CERT_WARN_DAYS" ]; then
      if [ ! -f "$CERT_FLAG" ]; then
        say "인증서 ${LEFT}일 남음 — 알립니다"
        notify "인증서가 ${LEFT}일 남았습니다" "HTTPS 인증서가 ${LEFT}일 뒤 만료됩니다.

보통은 certbot 이 알아서 갱신합니다. 이 알림이 왔다는 것은 갱신이 안 되고
있다는 뜻일 수 있습니다.

  sudo systemctl status certbot.timer
  sudo certbot renew --dry-run"
        : > "$CERT_FLAG"
      fi
    else
      rm -f "$CERT_FLAG"
    fi
  fi
fi
