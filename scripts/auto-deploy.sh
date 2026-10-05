#!/usr/bin/env bash
# 깃허브에 새 커밋이 올라오면 서버가 스스로 받아 배포한다.
# cron 등록 예시 (5분마다):
#   sudo crontab -e
#   */5 * * * * /srv/c3r/app/scripts/auto-deploy.sh >> /var/log/c3r-auto-deploy.log 2>&1
#
# 왜 필요한가
#   Vercel 을 쓸 때는 올리기만 하면 반영됐는데, 이 서버는 사람이 들어와
#   scripts/deploy.sh 를 돌려야 한다. 사무실·집 어디서 작업하든, 또 서버에
#   들어갈 수 없는 상황에서도 올린 것이 반영되게 한다.
#
# 안전장치
#   - 깃허브 검사(CI)가 통과한 커밋만 배포한다. 빨간불인 코드는 그대로 두고 알린다
#   - 배포는 deploy.sh 가 한다. 실패하면 그쪽이 이전 판으로 되돌린다
#   - 같은 시각에 두 번 돌지 않게 잠금을 건다(빌드가 5분을 넘길 수 있다)
set -uo pipefail

APP_DIR="${APP_DIR:-/srv/c3r/app}"
BRANCH="${BRANCH:-main}"
REPO="${REPO:-DevelopIsHobby/CCCR_Front}"
LOCK="${LOCK:-/var/lock/c3r-auto-deploy.lock}"
STATE="${STATE:-/var/lib/c3r-auto-deploy.state}"

say() { echo "[$(date '+%F %T')] $*"; }

notify() {
  if [ -x "$(command -v node || true)" ] && [ -f "$APP_DIR/scripts/notify.mjs" ]; then
    node "$APP_DIR/scripts/notify.mjs" "$1" "$2" || say "알림을 보내지 못했습니다"
  fi
}

cd "$APP_DIR" || { say "앱 폴더가 없습니다: $APP_DIR"; exit 1; }

# 같은 시각에 두 번 돌지 않게 잠근다
exec 9> "$LOCK"
if ! flock -n 9; then
  say "앞의 배포가 아직 돌고 있어 건너뜁니다"
  exit 0
fi

git fetch --quiet origin "$BRANCH" || { say "깃허브에서 받지 못했습니다"; exit 1; }

LOCAL="$(git rev-parse HEAD)"
REMOTE="$(git rev-parse "origin/$BRANCH")"

if [ "$LOCAL" = "$REMOTE" ]; then
  exit 0
fi

say "새 커밋을 찾았습니다: ${LOCAL:0:7} → ${REMOTE:0:7}"

# 깃허브 검사 결과를 본다. 통과하지 않은 커밋은 배포하지 않는다.
# (검사가 아직 돌고 있으면 다음 차례에 다시 본다)
STATUS="$(curl -fsS -m 20 "https://api.github.com/repos/$REPO/commits/$REMOTE/check-runs" 2>/dev/null |
  node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{
    try {
      const runs = (JSON.parse(s).check_runs || []);
      if (runs.length === 0) return console.log("none");
      if (runs.some(r => r.status !== "completed")) return console.log("running");
      console.log(runs.every(r => ["success","neutral","skipped"].includes(r.conclusion)) ? "success" : "failure");
    } catch { console.log("unknown"); }
  });' 2>/dev/null)"

case "$STATUS" in
  success) ;;
  running)
    say "깃허브 검사가 아직 돌고 있습니다. 다음 차례에 다시 봅니다"
    exit 0
    ;;
  failure)
    # 같은 커밋으로 메일을 되풀이해 보내지 않는다
    if [ "$(cat "$STATE" 2>/dev/null)" != "fail:$REMOTE" ]; then
      echo "fail:$REMOTE" > "$STATE"
      say "깃허브 검사가 실패한 커밋이라 배포하지 않습니다: ${REMOTE:0:7}"
      notify "배포하지 않음 — 깃허브 검사 실패" "커밋 ${REMOTE:0:7} 의 검사가 통과하지 않아 서버에 반영하지 않았습니다.
https://github.com/$REPO/commits/$BRANCH"
    fi
    exit 0
    ;;
  *)
    say "깃허브 검사 결과를 읽지 못했습니다($STATUS). 다음 차례에 다시 봅니다"
    exit 0
    ;;
esac

say "배포를 시작합니다"
if OUT="$(./scripts/deploy.sh 2>&1)"; then
  echo "$OUT" | tail -5
  echo "ok:$REMOTE" > "$STATE"
  say "배포를 마쳤습니다: $(git rev-parse --short HEAD)"
else
  echo "$OUT" | tail -30
  if [ "$(cat "$STATE" 2>/dev/null)" != "deployfail:$REMOTE" ]; then
    echo "deployfail:$REMOTE" > "$STATE"
    notify "자동 배포 실패" "커밋 ${REMOTE:0:7} 을 서버에 반영하지 못했습니다. 이전 판으로 되돌렸습니다.

$(echo "$OUT" | tail -30)"
  fi
  exit 1
fi
