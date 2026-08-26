#!/usr/bin/env bash
# 서버에서 실행하는 배포 스크립트.
#   cd /srv/c3r/app && ./scripts/deploy.sh
#
# 하는 일: 최신 코드 받기 → 의존성 설치 → 빌드 → 재시작 → 상태 확인
set -euo pipefail

APP_DIR="${APP_DIR:-/srv/c3r/app}"
SERVICE="${SERVICE:-c3r}"

cd "$APP_DIR"

echo "▶ 코드 받는 중"
git pull --ff-only

echo "▶ 의존성 설치"
npm ci --omit=dev --ignore-scripts=false

echo "▶ 빌드"
# 메모리가 작은 서버에서 빌드가 죽는 것을 막는다 (2GB 기준)
NODE_OPTIONS="--max-old-space-size=1536" npm run build

echo "▶ 재시작"
sudo systemctl restart "$SERVICE"

sleep 3
if systemctl is-active --quiet "$SERVICE"; then
  echo "✅ 배포 완료 — $(systemctl is-active "$SERVICE")"
else
  echo "❌ 서비스가 뜨지 않았습니다. 로그를 확인하세요:"
  echo "   sudo journalctl -u $SERVICE -n 50 --no-pager"
  exit 1
fi
