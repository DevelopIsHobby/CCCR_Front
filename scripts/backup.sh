#!/usr/bin/env bash
# 매일 새벽 백업. cron 등록 예시:
#   sudo crontab -e
#   0 4 * * * /srv/c3r/app/scripts/backup.sh >> /var/log/c3r-backup.log 2>&1
#
# 남기는 것: PostgreSQL 덤프 + 첨부파일 묶음. 기본 30일치 보관.
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/srv/c3r/backup}"
UPLOAD_DIR="${UPLOAD_DIR:-/srv/c3r/data/uploads}"
DB_NAME="${DB_NAME:-c3r}"
KEEP_DAYS="${KEEP_DAYS:-30}"

if [ "$(id -u)" -ne 0 ]; then
  echo "root 로 실행하세요 (sudo 또는 root crontab)" >&2
  exit 1
fi

STAMP="$(date +%Y%m%d-%H%M)"
mkdir -p "$BACKUP_DIR"

echo "[$(date '+%F %T')] 백업 시작"

# root 로 -U c3r 을 주면 PostgreSQL 기본 설정(peer 인증)에서 거절된다.
# postgres 계정으로 덤프하고, 파일은 root 쉘이 받아 적는다(postgres 계정은 백업 폴더에 못 쓴다).
runuser -u postgres -- pg_dump -d "$DB_NAME" -Fc > "$BACKUP_DIR/db-$STAMP.dump"
echo "  DB 덤프: db-$STAMP.dump"

if [ -d "$UPLOAD_DIR" ]; then
  tar -czf "$BACKUP_DIR/uploads-$STAMP.tar.gz" -C "$(dirname "$UPLOAD_DIR")" "$(basename "$UPLOAD_DIR")"
  echo "  첨부파일: uploads-$STAMP.tar.gz"
fi

# 오래된 백업 정리
find "$BACKUP_DIR" -name 'db-*.dump' -mtime +"$KEEP_DAYS" -delete
find "$BACKUP_DIR" -name 'uploads-*.tar.gz' -mtime +"$KEEP_DAYS" -delete

echo "[$(date '+%F %T')] 백업 완료 — $(du -sh "$BACKUP_DIR" | cut -f1) 사용 중"
