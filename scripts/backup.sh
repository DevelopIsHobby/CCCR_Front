#!/usr/bin/env bash
# 매일 새벽 백업. cron 등록 예시:
#   sudo crontab -e
#   0 4 * * * /srv/c3r/app/scripts/backup.sh >> /var/log/c3r-backup.log 2>&1
#
# 남기는 것
#   - PostgreSQL 덤프 (날마다 통째로, 기본 30일치)
#   - 첨부파일 (날마다 그날치 폴더. 바뀌지 않은 파일은 하드링크라 자리를 새로 먹지 않는다)
#
# 실패하면 사무국 메일로 알린다. 조용히 실패해서 몇 달 뒤에 아는 것이 가장 나쁘다.
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/srv/c3r/backup}"
UPLOAD_DIR="${UPLOAD_DIR:-/srv/c3r/data/uploads}"
APP_DIR="${APP_DIR:-/srv/c3r/app}"
DB_NAME="${DB_NAME:-c3r}"
KEEP_DAYS="${KEEP_DAYS:-30}"
# 이만큼(MB)은 남아 있어야 백업을 시작한다. 꽉 찬 디스크에 덤프를 쓰면 반쯤 쓰다 만 파일이 남는다
MIN_FREE_MB="${MIN_FREE_MB:-3000}"

STAMP="$(date +%Y%m%d-%H%M)"
LOG="$(mktemp)"

# 실패했을 때 사무국에 알린다
notify() {
  local subject="$1"
  if [ -x "$(command -v node || true)" ] && [ -f "$APP_DIR/scripts/notify.mjs" ]; then
    node "$APP_DIR/scripts/notify.mjs" "$subject" "$(tail -c 3000 "$LOG")" || true
  else
    echo "알림을 보낼 수 없습니다(node 또는 notify.mjs 없음)" >&2
  fi
}

say() { echo "[$(date '+%F %T')] $*" | tee -a "$LOG"; }

fail() {
  say "❌ 백업 실패 — 위 내용을 확인하세요"
  notify "백업 실패 ($STAMP)"
  rm -f "$LOG"
  exit 1
}
trap fail ERR

if [ "$(id -u)" -ne 0 ]; then
  echo "root 로 실행하세요 (sudo 또는 root crontab)" >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"
say "백업 시작"

# 1) 자리 확인
FREE_MB="$(df -Pm "$BACKUP_DIR" | awk 'NR==2 {print $4}')"
say "남은 자리: ${FREE_MB}MB"
if [ "$FREE_MB" -lt "$MIN_FREE_MB" ]; then
  say "남은 자리가 ${MIN_FREE_MB}MB 보다 적어 백업하지 않습니다. 오래된 백업이나 로그를 지우세요."
  fail
fi

# 2) DB 덤프
#    root 로 -U c3r 을 주면 PostgreSQL 기본 설정(peer 인증)에서 거절된다.
#    postgres 계정으로 덤프하고, 파일은 root 쉘이 받아 적는다(postgres 계정은 백업 폴더에 못 쓴다).
DUMP="$BACKUP_DIR/db-$STAMP.dump"
runuser -u postgres -- pg_dump -d "$DB_NAME" -Fc > "$DUMP"

# 덤프가 실제로 쓸 수 있는 것인지 확인한다. 빈 파일이나 깨진 파일을 백업이라 믿으면 안 된다
if ! runuser -u postgres -- pg_restore -l "$DUMP" > /dev/null 2>&1; then
  say "덤프 파일을 읽을 수 없습니다: $DUMP"
  fail
fi
say "DB 덤프: $(basename "$DUMP") ($(du -h "$DUMP" | cut -f1))"

# 3) 첨부파일 — 그날치 폴더를 만들되, 바뀌지 않은 파일은 어제 것과 하드링크로 잇는다.
#    날마다 통째로 압축하면 첨부가 1GB 일 때 30일치가 30GB 가 된다. 이렇게 하면 늘어난 만큼만 먹는다.
if [ -d "$UPLOAD_DIR" ]; then
  SNAP_ROOT="$BACKUP_DIR/uploads"

  if command -v rsync > /dev/null 2>&1; then
    mkdir -p "$SNAP_ROOT"

    # 어제 것(가장 최근 날짜 폴더)을 찾아 그것과 이어 붙인다.
    # 바로가기(심볼릭 링크)를 두지 않는 것은, 그것 하나 만들다 실패했다고
    # 이미 받아 둔 백업까지 실패로 만들지 않기 위해서다.
    # 오늘 폴더는 뺀다. 같은 분에 두 번 돌리면 자기 자신을 어제 것으로 삼을 수 있다
    PREV="$(find "$SNAP_ROOT" -mindepth 1 -maxdepth 1 -type d ! -name "$STAMP" | sort | tail -n 1)"
    LINK_ARG=()
    if [ -n "$PREV" ]; then
      LINK_ARG=(--link-dest="$PREV")
    fi

    rsync -a --delete "${LINK_ARG[@]}" "$UPLOAD_DIR/" "$SNAP_ROOT/$STAMP/"
    say "첨부파일: uploads/$STAMP ($(du -sh "$SNAP_ROOT/$STAMP" | cut -f1) — 어제와 같은 파일은 자리를 새로 먹지 않습니다)"
  else
    # rsync 가 없는 서버를 위한 갈래. 통째로 압축한다
    tar -czf "$BACKUP_DIR/uploads-$STAMP.tar.gz" -C "$(dirname "$UPLOAD_DIR")" "$(basename "$UPLOAD_DIR")"
    say "첨부파일: uploads-$STAMP.tar.gz (rsync 가 없어 통째로 압축했습니다)"
  fi
else
  say "첨부 폴더가 없습니다: $UPLOAD_DIR"
fi

# 4) 오래된 백업 정리
find "$BACKUP_DIR" -maxdepth 1 -name 'db-*.dump' -mtime +"$KEEP_DAYS" -delete
find "$BACKUP_DIR" -maxdepth 1 -name 'uploads-*.tar.gz' -mtime +"$KEEP_DAYS" -delete
if [ -d "$BACKUP_DIR/uploads" ]; then
  # 날짜 폴더 단위로 지운다
  find "$BACKUP_DIR/uploads" -mindepth 1 -maxdepth 1 -type d -mtime +"$KEEP_DAYS" -exec rm -rf {} +
fi

say "✅ 백업 완료 — $(du -sh "$BACKUP_DIR" | cut -f1) 사용 중, 남은 자리 $(df -Ph "$BACKUP_DIR" | awk 'NR==2 {print $4}')"
trap - ERR
rm -f "$LOG"
