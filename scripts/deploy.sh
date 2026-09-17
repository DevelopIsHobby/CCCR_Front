#!/usr/bin/env bash
# 서버에서 실행하는 배포 스크립트.
#   cd /srv/c3r/app && ./scripts/deploy.sh
#
# 하는 일: 지금 상태 저장 → 최신 코드 받기 → 설치 → 빌드 → 재시작 → 살아 있는지 확인
# 어느 단계에서든 어긋나면 저장해 둔 이전 상태로 되돌리고, 사이트는 계속 돌아간다.
set -euo pipefail

APP_DIR="${APP_DIR:-/srv/c3r/app}"
SERVICE="${SERVICE:-c3r}"
PORT="${PORT:-3000}"
# 재시작한 뒤 이 시간(초) 안에 /api/health/live 가 답해야 한다
HEALTH_WAIT="${HEALTH_WAIT:-40}"

cd "$APP_DIR"

PREV_SHA="$(git rev-parse HEAD)"
ROLLED_BACK=0

restore() {
  [ "$ROLLED_BACK" -eq 1 ] && return
  ROLLED_BACK=1

  echo "↩ 되돌리는 중 — 코드 $PREV_SHA, 이전 빌드"
  # 짓다 만 새 빌드는 쓸모가 없다
  rm -rf .next.new
  git reset --hard --quiet "$PREV_SHA" || echo "  (코드 되돌리기 실패 — 직접 확인하세요)"

  if [ -d .next.prev ]; then
    rm -rf .next
    mv .next.prev .next
    rm -f .next.prev.sha
    echo "  이전 빌드를 되살렸습니다"
  else
    echo "  이전 빌드가 없습니다(첫 배포)"
  fi

  sudo systemctl restart "$SERVICE" || true
  echo "↩ 되돌렸습니다. 사이트는 배포 전 상태입니다"
}

fail() {
  echo "❌ 배포 실패"
  restore
  echo "   로그: sudo journalctl -u $SERVICE -n 50 --no-pager"
  exit 1
}
trap fail ERR

# 값 하나가 빠져도 사이트는 그냥 뜨고 조용히 틀어진다. 아무것도 건드리기 전에 본다
echo "▶ 설정 점검"
node scripts/check-env.mjs

echo "▶ 코드 받는 중 (지금: $PREV_SHA)"
git pull --ff-only

echo "▶ 의존성 설치"
# 빌드에 Tailwind·TypeScript(개발용 패키지)가 필요하므로 --omit=dev 로 빼지 않는다.
npm ci

echo "▶ 자리 비우기"
rm -rf .next.prev .next.new
rm -f .next.prev.sha

echo "▶ 빌드"
# .next 는 건드리지 않고 새 폴더(.next.new)에 짓는다.
#
# 전에는 짓기 전에 .next 를 옮겨 두었다. 그러면 빌드가 도는 1분 남짓 동안 돌고 있는
# 옛 판이 자기 빌드를 잃어버려, 화면(HTML)은 나오는데 CSS·JS 와 /api/health/live 가
# 500 을 냈다. 방문자에게는 깨진 화면이 보이고 밖에서 지켜보는 감시는 장애로 오인했다.
# 새 폴더에 지으면 옛 판이 제 빌드를 그대로 쥐고 있으므로, 멈추는 시간은 아래에서
# 바꿔치기하고 재시작하는 몇 초뿐이다. (폴더는 next.config.ts 의 distDir 이 정한다)
#
# 메모리가 작은 서버에서 빌드가 죽는 것을 막는다 (2GB 기준)
NEXT_DIST_DIR=.next.new NODE_OPTIONS="--max-old-space-size=1536" npm run build

echo "▶ 새 빌드로 바꾸기"
# set -e 아래에서 [ ... ] && ... 를 쓰면 조건이 거짓일 때 배포가 실패로 끝난다. if 로 쓴다
if [ -d .next ]; then
  mv .next .next.prev
  # 이 빌드가 어느 코드의 것인지 함께 남긴다.
  # git pull 은 커밋을 여러 개 한꺼번에 받아 오므로, 나중에 rollback.sh 가
  # 'HEAD~1' 로 되돌리면 코드와 빌드가 어긋난다. 정확한 지점을 적어 둔다.
  echo "$PREV_SHA" > .next.prev.sha
fi
mv .next.new .next

echo "▶ 재시작"
sudo systemctl restart "$SERVICE"

echo "▶ 살아 있는지 확인 (최대 ${HEALTH_WAIT}초)"
OK=0
for _ in $(seq 1 "$HEALTH_WAIT"); do
  if curl -fsS -m 3 "http://127.0.0.1:$PORT/api/health/live" > /dev/null 2>&1; then
    OK=1
    break
  fi
  sleep 1
done

if [ "$OK" -ne 1 ]; then
  echo "새 판이 응답하지 않습니다"
  fail
fi

trap - ERR
echo "✅ 배포 완료 — $(git rev-parse --short HEAD) / $(systemctl is-active "$SERVICE")"
echo "   되돌리려면: ./scripts/rollback.sh"
