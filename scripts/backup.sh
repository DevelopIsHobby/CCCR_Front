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
DB_USER="${DB_USER:-c3r}"
KEEP_DAYS="${KEEP_DAYS:-30}"

STAMP="$(date +%Y%m%d-%H%M)"
mkdir -p "$BACKUP_DIR"

echo "[$(date '+%F %T')] 백업 시작"

pg_dump -U "$DB_USER" -d "$DB_NAME" -Fc -f "$BACKUP_DIR/db-$STAMP.dump"
echo "  DB 덤프: db-$STAMP.dump"

if [ -d "$UPLOAD_DIR" ]; then
  tar -czf "$BACKUP_DIR/uploads-$STAMP.tar.gz" -C "$(dirname "$UPLOAD_DIR")" "$(basename "$UPLOAD_DIR")"
  echo "  첨부파일: uploads-$STAMP.tar.gz"
fi

# 오래된 백업 정리
find "$BACKUP_DIR" -name 'db-*.dump' -mtime +"$KEEP_DAYS" -delete
find "$BACKUP_DIR" -name 'uploads-*.tar.gz' -mtime +"$KEEP_DAYS" -delete

echo "[$(date '+%F %T')] 백업 완료 — $(du -sh "$BACKUP_DIR" | cut -f1) 사용 중"
