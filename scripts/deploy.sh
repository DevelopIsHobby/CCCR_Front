#!/usr/bin/env bash
# 서버에서 실행하는 배포 스크립트.
#   cd /srv/c3r/app && ./scripts/deploy.sh
#
# 하는 일: 지금 상태 저장 → 최신 코드 받기 → 설치 → 빌드 → 재시작 → 살아 있는지 확인
# 어느 단계에서든 어긋나면 저장해 둔 이전 상태로 되돌리고, 사이트는 계속 돌아간다.
set -euo pipefail

APP_DIR="${APP_DIR:-/srv/c3r/app}"
SERVICE="${SERVICE:-c3r}"
# 앱이 도는 계정(c3r.service 의 User=). 빌드 결과를 이 계정 것으로 넘겨줘야 한다
APP_USER="${APP_USER:-c3r}"
PORT="${PORT:-3000}"
# 재시작한 뒤 이 시간(초) 안에 /api/health/live 가 답해야 한다
HEALTH_WAIT="${HEALTH_WAIT:-40}"

cd "$APP_DIR"

PREV_SHA="$(git rev-parse HEAD)"
ROLLED_BACK=0
# 어디까지 갔는지. 되돌릴 때 무엇을 되돌려야 하는지가 여기서 갈린다
STAGE=start

restore() {
  [ "$ROLLED_BACK" -eq 1 ] && return
  ROLLED_BACK=1

  echo "↩ 되돌리는 중 — 코드 $PREV_SHA"
  # 짓다 만 새 빌드는 쓸모가 없다
  rm -rf .next.new
  sudo -u "$APP_USER" git reset --hard --quiet "$PREV_SHA" || echo "  (코드 되돌리기 실패 — 직접 확인하세요)"

  # npm ci 는 node_modules 를 지우고 새로 깔다. 그 뒤에 어깋나가 어긋나면
  # 지금 node_modules 는 되돌린 코드와 짝이 맞지 않는다. 돌고 있는 프로세스는
  # 이미 읽어 둔 것으로 버티지만, 다시 켜면 그때 못 뜼다. 짝을 다시 맞춘다.
  case "$STAGE" in
    install | build | swap | restart)
      echo "  node_modules 를 되돌린 코드에 맞춥니다"
      npm ci || echo "  (npm ci 실패 — 인터넷이 돌아오면 직접 한 번 돌리세요)"
      ;;
  esac

  # .next 는 바꿔치기(swap) 전까지는 돌고 있는 판 그대로다. 그 전에 어긋난 것이라면
  # 손대면 안 된다. 예전에는 언제든 .next.prev 를 덮어썼는데, 직전 배포가
  # 남긴 .next.prev 는 한 판 더 오래된 빌드라 돌고 있는 사이트의 CSS·JS 가 깨졌다.
  case "$STAGE" in
    swap | restart)
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
      ;;
    *)
      echo "↩ 되돌렸습니다. 돌고 있던 사이트는 건드리지 않았습니다"
      ;;
  esac
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
# 앱 계정으로 받는다. root 로 받으면 .git 안에 root 것이 섞여, 나중에 사람이
# 앱 계정으로 한 번 받으려 할 때 "권한이 없다"며 막힌다(2026-09-24 실제로 겪음).
sudo -u "$APP_USER" git pull --ff-only

STAGE=install
echo "▶ 의존성 설치"
# 빌드에 Tailwind·TypeScript(개발용 패키지)가 필요하므로 --omit=dev 로 빼지 않는다.
npm ci

echo "▶ 자리 비우기"
rm -rf .next.prev .next.new
rm -f .next.prev.sha

STAGE=build
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

STAGE=swap
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

# 빌드 결과는 이 스크립트를 돌린 사람(보통 root)의 것이 된다. 앱은 c3r 로 도므로
# 그대로 두면 Next 가 .next/cache/images 를 만들지 못한다(EACCES). 그러면 방문자가
# 그림을 볼 때마다 서버가 그림을 새로 만들고, 로그에는 unhandledRejection 이 쌓인다.
# 화면은 멀쩡히 나오므로 로그를 보지 않으면 모르고 지나간다.
chown -R "$APP_USER":"$APP_USER" .next

STAGE=restart
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
