# 배포 · 운영 안내 (국내 VPS)

우분투 계열 국내 VPS 한 대에 **Next.js 앱 + PostgreSQL + Nginx**를 올리는 방법입니다.
서버를 처음 받았을 때 한 번만 하는 설치와, 이후 반복하는 배포·백업·복구를 나눠서 적었습니다.

권장 사양: **RAM 2GB / SSD 40GB 이상**, Ubuntu 24.04 LTS (22.04 도 됩니다).
2026-09-23 계약한 서버: **카페24 가상서버호스팅 비즈니스**(RAM 2GB · SSD 40GB · 트래픽 500GB/월,
Ubuntu 24.04). 주소는 **`cccr.kr`** 입니다. 옛 홈페이지는 `cccr.or.kr` 에 그대로 두고
이 서버로 넘기지 않습니다. **메일은 계속 `@cccr.or.kr`** 이므로 SPF·DKIM·DMARC 는
`cccr.kr` 이 아니라 `cccr.or.kr` 쪽 DNS 에 넣습니다(6장).
카페24 구매 화면에서 설치사항은 **OS 만** 고릅니다. APM(Apache·PHP·MariaDB)을 함께 깔면
Apache 가 80 번 포트를 먼저 잡아 Nginx 가 뜨지 못하고, 쓰지도 않는 프로그램이 메모리를 축냅니다.

평소에는 앱·DB·Nginx 를 합쳐 600MB 안팎을 씁니다(2026-09 측정: 앱 약 120MB).
서버에서 빌드하는 동안에만 1.5GB 넘게 더 필요하므로 **1-1a 의 스왑을 꼭 켜 둡니다.**
빌드가 메모리 부족으로 실패해도 `scripts/deploy.sh` 가 이전 판으로 되돌리므로 사이트는 멈추지 않습니다.
RAM 1GB 요금제는 서버에서 빌드할 수 없습니다.

---

## 1. 서버 최초 설치 (한 번만)

### 1-1. 기본 패키지

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git nginx ufw
```

### 1-1a. 스왑 (RAM 2GB 서버에서 빌드하려면 필요)

스왑은 디스크 일부를 비상 메모리로 쓰게 하는 우분투 설정입니다. 호스팅 요금표에는 없고 서버에서 직접 켭니다.

```bash
# 2GB 스왑 파일을 만들어 켠다
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 재부팅 뒤에도 켜지게 한다
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# 평소에는 스왑을 되도록 쓰지 않게 한다(빌드처럼 모자랄 때만)
echo 'vm.swappiness=10' | sudo tee /etc/sysctl.d/99-swappiness.conf
sudo sysctl --system

# 확인: Swap 줄에 2.0Gi 가 보여야 한다
free -h
```

`swapon` 에서 "Operation not permitted" 같은 오류가 나면 이 가상서버는 스왑을 쓸 수 없는 방식입니다.
그때는 서버에서 빌드하지 말고 깃허브에서 빌드해 결과만 보내는 방식으로 바꿔야 합니다(작업기록 남은 일 참고).

### 1-2. Node.js 22 LTS 이상

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node -v    # v22 이상인지 확인
```

### 1-2a. 서버 시간대를 한국으로

```bash
sudo timedatectl set-timezone Asia/Seoul
date    # KST 로 나오는지 확인
```

우분투는 처음에 UTC 입니다. 그대로 두면 **cron 의 '새벽 4시'가 한국 시각 오후 1시**가
되고(2026-09-24 실제로 그러고 있었습니다), 로그 시각도 모두 아홉 시간 어긋나 보여
사고를 쫓을 때마다 더하기를 해야 합니다.

자료에는 영향이 없습니다. DB 에 넣는 시각은 앱이 `toISOString()` 으로 만들어 늘 UTC 이고
(`lib/db/driver.ts` 의 `now()`), 한국 날짜가 필요한 곳은 따로 아홉 시간을 더합니다
(`lib/format.ts` 의 `kstDate`). 칸도 TEXT 라 DB 가 스스로 시각을 넣는 곳이 없습니다.
시간대를 바꾼 뒤에도 `now()` 가 UTC 를 내는 것을 확인했습니다.

### 1-3. 방화벽

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

앱은 127.0.0.1:3000 에서만 듣고 외부에는 Nginx만 노출합니다. 3000 포트는 열지 않습니다.

### 1-4. 실행 계정과 디렉터리

```bash
sudo adduser --system --group --home /srv/c3r c3r
sudo mkdir -p /srv/c3r/{app,data/uploads,backup}
sudo chown -R c3r:c3r /srv/c3r

# Nginx(www-data)가 /srv/c3r 안으로 들어갈 수 있게 한다.
# adduser 가 만든 /srv/c3r 은 750 이라 그냥 두면 www-data 가 못 들어간다.
# 그러면 CSS·JS(.next/static)와 점검 안내 화면이 통째로 404 가 되어,
# 사이트가 글씨만 나온 맨몸으로 뜬다. 그룹으로만 열고 남에게는 닫아 둔다.
sudo usermod -aG c3r www-data
sudo systemctl restart nginx      # 그룹은 다시 켜야 반영된다
```

### 1-5. PostgreSQL 설치와 준비

지금 쓰는 DB 를 옮겨 오므로(1-11) **새 서버의 PostgreSQL 판이 옛 DB 판보다 낮으면 안 됩니다.**
낮으면 옛 DB 덤프를 되살리지 못합니다. 우분투 기본 저장소의 판(22.04 는 14, 24.04 는 16)은
옛 DB 보다 낮을 수 있어 PostgreSQL 공식 저장소에서 설치합니다.

먼저 옛 DB 판을 확인합니다. 접속 주소는 Vercel 프로젝트 Settings > Environment Variables 의 `DATABASE_URL` 입니다.

```bash
sudo apt install -y postgresql-common
sudo /usr/share/postgresql-common/pgdg/apt.postgresql.org.sh    # 묻는 말에 Enter
sudo apt install -y postgresql-client-17
psql "옛_DATABASE_URL" -c 'SHOW server_version;'
```

나온 판의 앞 숫자(예: 17)와 같은 판을 설치합니다. 아래는 17 일 때입니다.

```bash
sudo apt install -y postgresql-17
psql --version
```

```bash
sudo -u postgres psql <<'SQL'
CREATE USER c3r WITH PASSWORD '여기에_긴_비밀번호';
CREATE DATABASE c3r OWNER c3r;
SQL
```

### 1-6. 코드 배치와 환경변수

```bash
sudo -u c3r git clone <저장소 주소> /srv/c3r/app
cd /srv/c3r/app
sudo -u c3r tee .env.production >/dev/null <<'ENV'
NODE_ENV=production
DB_DRIVER=postgres
DATABASE_URL=postgres://c3r:여기에_긴_비밀번호@127.0.0.1:5432/c3r
UPLOAD_DIR=/srv/c3r/data/uploads
SITE_URL=https://cccr.kr
# 정식 공개 전까지 검색에 잡히지 않게 막는다. 공개하는 날 이 줄을 지우고 재시작한다.
SITE_NOINDEX=1

# 메일 (6장) — 지금 Vercel 에 넣어 둔 값을 그대로 옮긴다
SMTP_HOST=smtp.cafe24.com
SMTP_PORT=587
SMTP_USER=rnd@cccr.or.kr
SMTP_PASS=메일_비밀번호
SMTP_LEGACY_TLS=1
MAIL_FROM=rnd@cccr.or.kr
MAIL_OFFICE=새_신청_알림을_받을_주소

# 보관 기간 지난 자료 자동 파기 (7장) — openssl rand -hex 24 로 만든 값
CLEANUP_SECRET=긴_임의값

# 소셜 로그인 (8장) — 비워 둔 서비스는 단추가 나오지 않는다
KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=
NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
ENV
sudo chmod 600 .env.production
```

값을 바꾼 뒤에는 `sudo systemctl restart c3r` 로 다시 시작해야 반영됩니다.
값을 다 적었으면 빠진 것이 없는지 먼저 봅니다.

```bash
cd /srv/c3r/app && node scripts/check-env.mjs
```

빠진 값이 있으면 무엇이 어떻게 잘못되는지 알려 주고 멈춥니다(배포할 때도 자동으로 돕니다).

다 올린 뒤 관리자로 로그인해 `https://cccr.kr/api/health` 를 열면 설정과 첨부 폴더 쓰기 권한을 한눈에 볼 수 있습니다.

`.env.production`에는 DB 비밀번호가 들어갑니다. 절대 git에 올리지 마세요(`.gitignore`에 이미 있습니다).

### 1-7. 첫 빌드와 관리자 계정

```bash
cd /srv/c3r/app
sudo -u c3r npm ci
sudo -u c3r npm run build

# 스키마 생성 + 관리자 계정 (환경변수 파일을 함께 읽힙니다)
# 비밀번호는 흘려 넣습니다. 명령줄에 적으면 셸 기록(~/.bash_history)과
# 실행하는 동안 프로세스 목록(ps aux)에 그대로 남습니다.
printf '%s' '실제_비밀번호' | sudo -u c3r node --env-file=.env.production \
  scripts/create-admin.mjs admin@cccr.or.kr
```

이름까지 정하려면 예전처럼 인자로 줍니다(`… create-admin.mjs admin@cccr.or.kr '비밀번호' '최고관리자'`).
그때는 위 주의가 그대로 적용되니, 명령 앞에 빈칸을 하나 두어 셸 기록에서 빼세요.

### 1-8. 서비스 등록

```bash
sudo cp deploy/c3r.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now c3r
sudo systemctl status c3r        # active (running) 확인
```

### 1-9. Nginx와 HTTPS

```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/c3r
# 요청량 제한(한 곳에서 쉬지 않고 두드리는 것을 막는 그물). 없으면 위 설정이 뜨지 않는다
sudo cp deploy/nginx-limits.conf /etc/nginx/conf.d/c3r-limits.conf
# 접속 기록(IP 등)을 90일만 둔다. 개인정보 처리방침에 '서버 접속 기록 3개월'이라고 적었다
sudo cp deploy/logrotate-nginx /etc/logrotate.d/nginx
sudo ln -s /etc/nginx/sites-available/c3r /etc/nginx/sites-enabled/c3r
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# 도메인이 서버 IP를 가리키게 한 뒤 인증서 발급
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d cccr.kr -d www.cccr.kr
```

인증서는 certbot이 자동 갱신합니다(`systemctl status certbot.timer`로 확인).

**인증서를 받은 뒤에** `www` 를 대표 주소로 넘깁니다. 순서가 중요합니다 —
넘김을 먼저 넣으면 certbot 이 `www.cccr.kr` 을 확인하러 보내는 요청까지 넘겨 버려
인증서 발급이 실패합니다.

두 주소가 같은 내용을 그대로 내주면 **로그인 쿠키가 주소마다 따로 생깁니다.**
`www.cccr.kr` 에서 로그인한 분이 `cccr.kr` 로 들어오면 로그아웃 상태로 보입니다.
(소셜 로그인은 앱이 스스로 대표 주소로 옮겨 시작하므로 이미 막혀 있습니다.)

`/etc/nginx/sites-available/c3r` 에서 certbot 이 만든 **443 블록의 `server_name` 에서
`www.cccr.kr` 만 빼고**, 아래 블록을 파일 끝에 더합니다.

```nginx
server {
    listen 443 ssl;
    server_name www.cccr.kr;
    # 인증서는 certbot 이 위에 만들어 둔 것을 그대로 가리킵니다
    ssl_certificate     /etc/letsencrypt/live/cccr.kr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cccr.kr/privkey.pem;
    return 301 https://cccr.kr$request_uri;
}
```

```bash
sudo nginx -t && sudo systemctl reload nginx
curl -sI https://www.cccr.kr/ | head -2    # 301 과 location: https://cccr.kr/ 이 보이면 됩니다
```

### 1-10a. 사이트 감시

멈추면 사무국 메일로 알립니다. systemd 가 앱을 다시 띄우지만 **5분에 5번을 넘겨 죽으면
그만 시도합니다.** 그때부터 사이트는 내려가 있는데, 감시가 없으면 누가 전화할 때까지
아무도 모릅니다.

```bash
sudo crontab -e
# 아래 한 줄 추가 — 5분마다
*/5 * * * * /srv/c3r/app/scripts/watch.sh >> /var/log/c3r-watch.log 2>&1
```

무엇을 보는지

| | 언제 알리나 |
| --- | --- |
| 사이트가 사는가 | `/api/health/live` 가 **두 번 연속** 응답 없을 때. 한 번 끊긴 것으로 새벽에 사람을 깨우지 않는다 |
| 디스크 | 85% 이상 찼을 때 |
| 인증서 | 14일 남았을 때. 보통 certbot 이 알아서 갱신하므로, 이 알림이 오면 갱신이 안 되고 있다는 뜻이다 |

**멈춘 그때 한 번, 돌아온 그때 한 번만** 보냅니다. 계속 멈춰 있다고 5분마다 보내면
사람이 메일을 무시하게 되고, 그러면 감시가 없는 것과 같습니다.

알림에는 무엇을 봐야 하는지와 되살리는 명령이 함께 적혀 옵니다.

로그가 무한정 커지지 않게 함께 걸어 둡니다.

```bash
sudo tee /etc/logrotate.d/c3r >/dev/null <<'CONF'
/var/log/c3r-backup.log /var/log/c3r-cleanup.log /var/log/c3r-watch.log {
    su root syslog
    weekly
    rotate 12
    compress
    missingok
    notifempty
    copytruncate
}
CONF
```

> `su root syslog` 가 없으면 logrotate 가 "`/var/log` 권한이 헐겁다"며 건너뜁니다.

> **이것만으로는 모자랍니다.** 서버 자체가 멈추면 감시도 같이 멈춥니다.
> 밖에서 보는 감시(UptimeRobot 등 무료로 됩니다)도 함께 걸어 두세요.

### 1-10. 자동 백업 등록

```bash
sudo crontab -e
# 아래 한 줄 추가 — 매일 새벽 4시 (서버 시간대가 KST 여야 한다. 1-2a)
0 4 * * * /srv/c3r/app/scripts/backup.sh >> /var/log/c3r-backup.log 2>&1
```

`.env.production` 의 `UPLOAD_DIR` 을 기본값(`/srv/c3r/data/uploads`)과 다르게 적었다면
cron 줄 앞에도 같이 적어야 합니다(`0 4 * * * UPLOAD_DIR=/다른/경로 /srv/c3r/app/scripts/backup.sh ...`).
`node scripts/check-env.mjs` 가 어긋나면 알려 줍니다.

`sudo crontab -e` 는 root 의 crontab 입니다. 백업 스크립트는 root 로 돌아야 합니다
(DB 는 postgres 계정으로 덤프하고, 파일은 root 가 백업 폴더에 씁니다).

백업이 실패하면 사무국 메일로 알립니다(`scripts/notify.mjs`, 메일 설정은 앱과 같은 값을 씁니다).
**알림이 진짜 오는지 한 번 확인해 두세요.** 아래는 일부러 실패시키는 명령입니다.

```bash
sudo MIN_FREE_MB=99999999 /srv/c3r/app/scripts/backup.sh
```

「남은 자리가 모자라 백업하지 않습니다」가 뜨고 메일이 와야 정상입니다. DB 는 건드리지 않습니다.

첨부파일은 날마다 `backup/uploads/<날짜>/` 폴더로 남습니다. 바뀌지 않은 파일은 어제 것과
이어 붙여(하드링크) 두므로, 30일치를 두어도 자리는 늘어난 만큼만 먹습니다.

### 1-11. 지금 쓰던 DB 옮겨 오기 (한 번만)

그동안은 Vercel 에 연결된 PostgreSQL 을 써 왔습니다. 회원사 주소·소개 문구·관리자 계정·
신청 기록이 거기 들어 있으므로 새 서버를 열기 전에 한 번 옮깁니다.
첨부·이미지는 Vercel 에서 올릴 수 없었으므로 옮길 파일이 없습니다.

1) 옛 DB 를 덤프합니다. 접속 주소는 Vercel 프로젝트 **Settings > Environment Variables** 의
   `DATABASE_URL` 입니다. 이 주소에는 비밀번호가 들어 있으니 명령 기록에 남지 않게 조심하세요.

```bash
pg_dump "옛_DATABASE_URL" -Fc --no-owner --no-privileges -f c3r-from-vercel.dump
```

2) 새 서버에서 되살립니다. `1-7` 을 마친 뒤(표가 만들어진 뒤)에 합니다.

```bash
sudo systemctl stop c3r
sudo cat c3r-from-vercel.dump | sudo -u postgres pg_restore --no-owner --role=c3r -d c3r --clean --if-exists
sudo systemctl start c3r
```

3) **닫은 창구의 시연용 개인정보를 지웁니다.** 회의실 예약·홍보 서비스 신청은 2026-09-14 에
   걷어냈지만, 되살릴 여지를 두려고 표는 남겼습니다. 그래서 그때 들어온 시연용 신청이
   덤프에 따라옵니다. 이 자료는 **개인정보 처리방침에 적혀 있지 않고**, 코드가 이 표를
   건드리지 않아 **보관기간 파기에서도 빠집니다.** 방침에 없는 개인정보를 갖고 있게 되므로
   옮긴 직후에 비웁니다. 표 자체는 남겨 두어 나중에 기능을 되살릴 수 있게 합니다.

```bash
# 먼저 몇 건인지 봅니다
sudo -u postgres psql -d c3r -c "SELECT 'room' AS t, count(*) FROM room_reservations
  UNION ALL SELECT 'promo', count(*) FROM promo_requests
  UNION ALL SELECT 'block', count(*) FROM room_blocks;"

# 비웁니다
sudo -u postgres psql -d c3r -c "DELETE FROM room_reservations; DELETE FROM room_blocks; DELETE FROM promo_requests;"
```

   홍보 신청에 딸려 있던 그림·첨부가 있으면 파일은 남습니다. 관리자 화면 → 파일 관리의
   **'기록 없는 파일'** 에 뜨니 거기서 함께 지웁니다.

4) 관리자로 로그인해 회원사 현황·소개 문구·신청 목록이 그대로인지 봅니다.

- `pg_dump` 판이 옛 DB 판보다 낮으면 거절됩니다. 1-5 에서 옛 DB 와 같은 판을 설치했는지 확인하세요.
- `schema_migrations` 표도 함께 옮겨지므로, 앱이 켜질 때 이미 적용한 마이그레이션을 다시 돌리지 않습니다.
- 옮긴 뒤 관리자 비밀번호는 `1-7` 의 명령으로 새로 정해 두세요.

---

## 2. 평소 배포 (코드가 바뀔 때마다)

```bash
cd /srv/c3r/app
./scripts/deploy.sh
```

설정 점검 → 코드 받기 → 설치 → 빌드 → 재시작 → `/api/health/live` 응답 확인까지 한 번에 합니다.

어느 단계에서든 어긋나면 **스스로 배포 전으로 되돌립니다.** 코드는 직전 커밋으로,
화면은 직전 빌드(`.next.prev`)로 돌리고 서비스를 다시 띄웁니다. 빌드가 깨져도 사이트는 계속 돌아갑니다.

배포는 됐는데 그 뒤에 문제가 보이면 직접 되돌립니다. 빌드를 다시 하지 않으므로 1분이면 끝납니다.

```bash
cd /srv/c3r/app
./scripts/rollback.sh
```

---

## 3. 자주 쓰는 명령

| 하고 싶은 일 | 명령 |
| --- | --- |
| 사이트 재시작 | `sudo systemctl restart c3r` |
| 로그 실시간 보기 | `sudo journalctl -u c3r -f` |
| 최근 오류만 보기 | `sudo journalctl -u c3r -p err -n 50` |
| 관리자 비밀번호 변경 | `1-7`의 create-admin 명령을 같은 이메일로 다시 실행 |
| 수동 백업 | `/srv/c3r/app/scripts/backup.sh` |
| 직전 판으로 되돌리기 | `/srv/c3r/app/scripts/rollback.sh` |
| 백업 알림이 오는지 확인 | `sudo MIN_FREE_MB=99999999 /srv/c3r/app/scripts/backup.sh` |
| 사이트가 살아 있는지 | `curl -s localhost:3000/api/health/live` (ok 가 나와야 함) |
| 설정을 한눈에 보기 | 관리자로 로그인한 브라우저에서 `/api/health` |
| 설정에 빠진 값이 없는지 | `cd /srv/c3r/app && node scripts/check-env.mjs` |
| 디스크 여유 확인 | `df -h /srv` |

---

## 3-1. 복구 훈련하는 법 (운영을 건드리지 않고)

백업이 진짜인지 보려면 되살려 봐야 합니다. 운영 DB 와 따로 노는 곳에 세워 보므로
사이트에 아무 영향이 없습니다. 반년에 한 번쯤 해 보시면 좋습니다.

```bash
# 1) 가장 최근 백업을 빈 DB 에 되살린다
D=$(ls -t /srv/c3r/backup/db-*.dump | head -1)
sudo -u postgres createdb -O c3r c3r_restore
sudo cat "$D" | sudo -u postgres pg_restore --no-owner --role=c3r -d c3r_restore

# 2) 운영과 견준다 (숫자가 같아야 한다)
for t in posts users companies history_entries attachments; do
  echo "$t  운영 $(sudo -u postgres psql -d c3r -tAc "SELECT count(*) FROM $t")"        " 되살림 $(sudo -u postgres psql -d c3r_restore -tAc "SELECT count(*) FROM $t")"
done

# 3) 되살린 DB 로 사이트를 띄워 눈으로 본다 (3200 포트, 첨부는 빈 폴더로)
mkdir -p /tmp/drill/uploads && chown -R c3r:c3r /tmp/drill
sed -e "s|^DATABASE_URL=.*|DATABASE_URL=postgres://c3r:$(cat /root/.c3r-db-pass)@127.0.0.1:5432/c3r_restore|"     -e "s|^UPLOAD_DIR=.*|UPLOAD_DIR=/tmp/drill/uploads|" /srv/c3r/app/.env.production > /tmp/drill/.env
chown c3r:c3r /tmp/drill/.env && chmod 600 /tmp/drill/.env
cd /srv/c3r/app && sudo -u c3r env $(grep -v '^#' /tmp/drill/.env | grep . | xargs -d '
')   node node_modules/next/dist/bin/next start -p 3200 &
curl -s http://127.0.0.1:3200/members/list | grep -o '전체 [0-9]*'   # 회원사 수가 나오면 성공

# 4) 치운다
kill $(ss -lntpH | grep :3200 | grep -oE 'pid=[0-9]+' | cut -d= -f2)
sudo -u postgres dropdb c3r_restore && rm -rf /tmp/drill
```

> 치울 때 `pkill -f "next start -p 3200"` 를 쓰지 마세요. 그 명령을 담은 셸 자신이
> 그 글자를 갖고 있어 **스스로를 죽입니다.** 실제로 두 번 겪었습니다.

## 4. 복구

### DB 되돌리기

```bash
sudo systemctl stop c3r
# 백업 파일은 root 만 읽습니다(개인정보). root 가 읽어 postgres 로 흘려 넣습니다.
sudo cat /srv/c3r/backup/db-20260826-0400.dump | sudo -u postgres pg_restore -c -d c3r
sudo systemctl start c3r
```

### 첨부파일 되돌리기

```bash
# 어느 날짜가 있는지 본다
ls /srv/c3r/backup/uploads/

# 그날 것으로 되돌린다 (끝의 / 를 빠뜨리지 마세요)
sudo rsync -a --delete /srv/c3r/backup/uploads/20260826-0400/ /srv/c3r/data/uploads/
sudo chown -R c3r:c3r /srv/c3r/data/uploads
```

rsync 가 없는 서버에서는 백업이 `uploads-<날짜>.tar.gz` 로 남습니다. 그때는 이렇게 풉니다.

```bash
sudo tar -xzf /srv/c3r/backup/uploads-20260826-0400.tar.gz -C /srv/c3r/data/
sudo chown -R c3r:c3r /srv/c3r/data/uploads
```

백업 파일은 서버에만 두지 말고 **주기적으로 다른 곳(사무국 PC, 외장 디스크, 클라우드 드라이브)에도 내려받아 두세요.** 서버가 통째로 날아가면 서버 안의 백업도 함께 사라집니다.

---

## 5. 점검 항목

- [ ] `.env.production` 권한이 600이고 git에 없는지
- [ ] DB 비밀번호가 추측 불가능한 긴 문자열인지
- [ ] 관리자 계정 비밀번호를 기본값에서 바꿨는지
- [ ] **정식 공개일**: 임시 주소에서 넘기는 절차와 시험 자료 정리를 마쳤는지 (6장 끝)
- [ ] 닫은 창구(회의실·홍보)의 시연용 신청을 비웠는지 (`1-11` 의 3단계).
      방침에 없는 개인정보이고 자동 파기 대상도 아닙니다
- [ ] `sudo ufw status`에서 3000 포트가 열려 있지 않은지
- [ ] `free -h` 에서 스왑 2GB 가 켜져 있는지 (재부팅 뒤에도)
- [ ] 백업 파일이 실제로 쌓이는지 (`ls -lh /srv/c3r/backup`)
- [ ] 백업을 서버 밖으로도 복사하고 있는지
- [ ] 백업 알림 메일이 실제로 오는지 한 번 확인했는지
- [x] 백업으로 되살리기를 한 번 해 봤는지 (백업은 복구해 봐야 백업입니다)
      — 2026-09-24 훈련함. 아래 '복구 훈련하는 법' 참고. **첨부파일이 아직 없어 그쪽은
      확인하지 못했다. 글과 첨부가 쌓인 뒤 한 번 더 해 볼 것**
- [x] 서버 안에서 지켜보는 감시 — `scripts/watch.sh` 를 5분마다(1-10a). 멈추면 사무국 메일로 알린다
- [ ] **밖에서도** 지켜보는 감시(UptimeRobot 등)에 `https://cccr.kr/api/health/live` 를 걸 것.
      서버 안 감시는 서버 자체가 멈추면 같이 멈춘다. 둘 다 있어야 한다
      (`/api/health` 는 관리자만 볼 수 있어 감시가 404 를 받는다)
- [ ] `/etc/nginx/conf.d/c3r-limits.conf` 가 있는지 (없으면 nginx 가 뜨지 않습니다)
- [ ] `/etc/logrotate.d/nginx` 에 `rotate 90` 이 들어 있는지 (개인정보 처리방침의 서버 접속 기록 3개월)
- [ ] **매달** 관리자 화면 → 사이트 운영 → 관리자 접속 기록을 살펴보고 '점검 완료'를 눌렀는지
      (「개인정보의 안전성 확보조치 기준」 제8조 — 월 1회 이상. 31일이 지나면 사이드바에 표시가 뜹니다)
- [ ] `sudo apt update && sudo apt upgrade`를 주기적으로 하는지

---

## 6. 메일 환경변수

`.env.production` 에 아래를 넣습니다. 값은 조합 메일 계정 기준입니다.

| 변수 | 뜻 | 예 |
| --- | --- | --- |
| `SMTP_HOST` | 발송 서버 | `smtp.cafe24.com` (받는 주소 webmail.cccr.or.kr 와 다릅니다) |
| `SMTP_PORT` | 포트 | `587` |
| `SMTP_USER` | 로그인 계정 | `rnd@cccr.or.kr` |
| `SMTP_PASS` | 비밀번호 | |
| `MAIL_FROM` | 보내는 주소 | `rnd@cccr.or.kr` |
| `MAIL_OFFICE` | **새 신청 알림을 받을 주소** | 비우면 `MAIL_FROM` 으로 갑니다. 쉼표로 여럿 가능 |
| `SITE_URL` | 메일 안의 링크 주소 | `https://cccr.kr` |
| `SMTP_LEGACY_TLS` | 낡은 TLS 를 받아들일지 | 카페24처럼 TLS 1.0 까지만 하는 서버에 `1`. 인증서 검증은 그대로 합니다 |
| `DKIM_SELECTOR` | DKIM 선택자 | `c3r` (아래 'Gmail 스팸함' 참고. 없으면 서명하지 않음) |
| `DKIM_PRIVATE_KEY` | DKIM 비밀키(한 줄) | 아래 명령으로 넣습니다 |

`MAIL_OFFICE` 는 담당자가 바뀌거나 여럿이 함께 받아야 할 때 이 값만 바꾸면 됩니다.

### Gmail 스팸함으로 가지 않게 (DMARC · DKIM)

2026-09 확인: `cccr.or.kr` 에는 SPF 만 있고 DKIM · DMARC 가 없어 Gmail 이 회원가입 승인 메일을 스팸함으로 보냈습니다.
이 도메인에는 모든 하위 이름을 `cccr.or.kr` 로 돌리는 와일드카드(`*`)가 걸려 있어 조회하면 SPF 값이 대신 나옵니다.
아래 이름으로 TXT 를 직접 넣으면 와일드카드보다 먼저 쓰입니다. DNS 는 카페24 도메인 관리에서 바꿉니다.

**1) DMARC** — 메일을 막지 않고(`p=none`) 인증 결과만 보고받는 설정이라 기존 조합 메일에 영향이 없습니다.

| 이름 | 종류 | 값 |
| --- | --- | --- |
| `_dmarc` | TXT | `v=DMARC1; p=none; rua=mailto:admin@cccr.or.kr` |

**2) DKIM** — 카페24 메일 관리 화면에서 DKIM 을 켤 수 있으면 그것을 씁니다. 그 경우 아래는 하지 않습니다.
안 되면 홈페이지가 보내는 메일에 직접 서명합니다. 서버에서:

```bash
cd /srv/c3r && sudo openssl genrsa -out dkim.pem 2048
# DNS 에 넣을 공개키
sudo openssl rsa -in dkim.pem -pubout -outform der 2>/dev/null | openssl base64 -A; echo
```

| 이름 | 종류 | 값 |
| --- | --- | --- |
| `c3r._domainkey` | TXT | `v=DKIM1; k=rsa; p=위에서_나온_공개키` |

DNS 에 퍼질 때까지(길면 하루) 기다린 뒤 비밀키를 한 줄로 바꿔 넣고 다시 시작합니다.

```bash
cd /srv/c3r
echo "DKIM_SELECTOR=c3r" | sudo -u c3r tee -a app/.env.production >/dev/null
echo "DKIM_PRIVATE_KEY='$(sudo awk 'NF{printf "%s\\n",$0}' dkim.pem)'" | sudo -u c3r tee -a app/.env.production >/dev/null
sudo shred -u dkim.pem          # 비밀키 원본은 남기지 않는다
sudo systemctl restart c3r
```

Gmail 에서 받은 메일의 ⋮ > **원본 보기** 맨 위에 `DKIM: 'PASS'` 가 나오면 됩니다.
공개키를 DNS 에 넣기 전에 비밀키부터 넣으면 서명이 맞지 않아 오히려 실패로 찍히니 순서를 지킵니다.

**3) 링크 주소** — 보내는 도메인과 다른 주소(`*.vercel.app`)의 링크가 들어 있으면 점수가 깎입니다.
`SITE_URL` 을 정식 주소로 바꾸면 저절로 풀립니다.

---

### 정식 공개 전 미리보기

사이트 주소(`SITE_URL`)가 `*.vercel.app` 이면 따로 정하지 않아도 검색에 잡히지 않게
막습니다. 검색엔진이 임시 주소를 색인하면 나중에 진짜 주소와 내용이 겹쳐 검색 순위에
손해이기 때문입니다. `SITE_URL` 을 정식 도메인으로 바꾸면 저절로 풀립니다.
주소와 상관없이 막으려면 `SITE_NOINDEX=1`, 열려면 `SITE_NOINDEX=0` 을 넣으세요.
관리자 화면은 이 값과 상관없이 늘 색인에서 빠집니다.

### 임시 주소에서 정식 주소로 넘길 때

임시 주소(`stage.cccr.kr` 등)로 한동안 써 보고 정식으로 여는 흐름입니다.
**다시 빌드할 필요는 없습니다.** 환경변수를 고치고 서비스를 다시 켜면 됩니다
(`robots.txt`·정식주소(canonical)·사이트맵·noindex 가 모두 요청마다 새로 만들어집니다).

1) `.env.production` 에서 두 줄을 고칩니다.

```
SITE_URL=https://cccr.kr        # 임시 주소에서 정식 주소로
# SITE_NOINDEX=1                 ← 이 줄을 지웁니다
```

2) Nginx 의 `server_name` 을 정식 주소로 바꾸고 인증서를 다시 받습니다.
3) DNS 의 A레코드를 정식 주소로 옮기고, **임시 주소의 A레코드는 지웁니다.**
   남겨 두면 같은 내용이 두 주소에 떠서 검색에서 깎입니다.
4) 소셜 로그인 콜백 주소를 각 콘솔(카카오·네이버·구글)에서 정식 주소로 바꿉니다.
5) `sudo systemctl restart c3r` 후 `curl -s https://cccr.kr/robots.txt` 로
   `Disallow: /admin` 과 사이트맵 줄이 보이는지 확인합니다. 보이면 공개 상태입니다.

> **`cccr.or.kr` 을 시험 삼아 이 서버로 돌리지 마세요. 되돌릴 수 없습니다.**
>
> 운영 모드에서 `Strict-Transport-Security` 를 1년으로 보냅니다. 한 번 받은 브라우저는
> 그 뒤 1년 동안 `cccr.or.kr` 을 **https 로만** 열려 합니다. 그런데 옛 홈페이지가 443 에
> 내미는 인증서는 Apache 견본 인증서입니다(2026-09 확인).
>
>     subject = O = My Company Ltd, L = Newbury, ST = Berkshire, GB
>     issuer  = 자기 자신 (self-signed) · 2017 ~ 2117
>
> 이름도 다르고 자기가 자기를 보증하는 것이라 브라우저가 믿지 않습니다. **HSTS 가 걸린
> 주소는 '무시하고 진행' 단추조차 나오지 않으므로**, 되돌려도 그 사이 들어온 분들은
> 1년 동안 옛 홈페이지를 열지 못합니다. 서버에서 풀 방법이 없습니다.
>
> **되돌아오지 않는 한 번의 이사라면 괜찮습니다.** 옮긴 뒤로 계속 https 이기 때문입니다.
> 아래 '옛 주소로 이사할 때' 를 따르세요. 하위 주소(`stage.cccr.kr` 등)는 안전합니다.

### 옛 주소(`cccr.or.kr`)로 이사할 때

**2026-09-24 정함: 옛 홈페이지를 닫고 `cccr.or.kr` 로 옮긴다. 시기는 한 달 시험을
마친 뒤.** 자료는 전부 옮기지 않고 사무국이 필요한 것만 직접 옮긴다.

> **옮기는 날이 곧 공개일입니다.** `cccr.or.kr` 이 이 서버를 가리키는 순간부터 조합
> 홈페이지를 찾는 모든 분이 새 사이트를 봅니다. `SITE_NOINDEX=1` 은 **검색 엔진만**
> 막지 방문자는 막지 않습니다. 그러니 이사와 공개는 같은 날 한 번에 합니다.

> **옮기기 전에 옛 자료를 먼저 복사하세요.** 옛 호스팅은 **이름으로만 열립니다**
> (IP 로 직접 열면 403, 2026-09 확인). A 레코드를 옮기는 순간 `www.cccr.or.kr/home/`
> 은 새 사이트가 되고, 옛 화면은 브라우저에서 볼 수 없게 됩니다. 파일과 DB 는 옛
> 호스팅에 그대로 남아 있지만(만료 2028-01-05) 눈으로 보려면 아래 방법이 필요합니다.
>
> 옮긴 뒤에 빠뜨린 것을 발견했다면, **내 PC 에서만** 옛 홈페이지를 다시 볼 수 있습니다.
> `C:\Windows\System32\drivers\etc\hosts` 를 관리자 권한으로 열어 한 줄 넣습니다.
> 다 보고 나면 그 줄을 지웁니다. 다른 사람에게는 영향이 없습니다.
>
>     183.111.182.207  cccr.or.kr www.cccr.or.kr

옮기는 날 이 순서로 합니다.

1. 가져올 옛 자료를 미리 복사해 둡니다(위 상자 참고). 카페24 옛 호스팅에서
   파일과 DB 백업도 받아 둡니다 — 나중에 '그 글 하나만 더' 할 때 필요합니다
2. 옛 홈페이지를 닫습니다
3. `cccr.or.kr`·`www.cccr.or.kr` 의 **A 레코드만** `1.234.80.127` 로 바꿉니다.
   **MX 는 건드리지 않습니다** — 메일은 `spam.cafe24.com` 으로 따로 가므로 그대로 둡니다
4. `sudo certbot --nginx -d cccr.or.kr -d www.cccr.or.kr` 로 인증서를 받습니다
5. `.env.production` 의 `SITE_URL` 을 `https://cccr.or.kr` 로 바꾸고,
   **`SITE_NOINDEX=1` 줄을 지운 뒤** `systemctl restart c3r` (이사 = 공개)
6. **`cccr.kr` 은 버리지 않고 새 주소로 넘깁니다.** 그동안 쌓인 링크와 검색 결과가 있습니다
7. 소셜 로그인 — 카카오·구글은 돌아올 주소를 둘 다 등록해 두었으면 손댈 것이 없습니다.
   **네이버만 서비스 URL 을 바꿔야 하고, 검수를 다시 받아야 할 수 있습니다**

### 공개일에 시험하며 쌓인 자료 정리

한 달쯤 써 보면 시험 자료가 쌓입니다. 공개 첫날 그것이 그대로 보이면 곤란합니다.

**지워도 되는 것** — 운영 기록이라 사람이 볼 것이 없습니다.

```bash
sudo -u postgres psql -d c3r -c "DELETE FROM visits; DELETE FROM mail_log; DELETE FROM rate_events; DELETE FROM sessions;"
sudo systemctl restart c3r
```

- `visits` — 시험하며 드나든 기록이 '인기 게시물'과 30일 그래프를 흐립니다
- `mail_log` — 시험 발송 기록
- `rate_events` — 어차피 하루 지나면 지워집니다
- `sessions` — 모두 로그아웃됩니다. 공개일에 한 번 끊고 가는 편이 깔끔합니다

**사람이 보고 골라야 하는 것** — 시험 자료와 진짜가 섞여 있습니다.
관리자 화면에서 눈으로 확인하고 지우세요.

| 무엇 | 어디서 |
|---|---|
| 시험 계정 | 관리자 → 회원 |
| 시험 글·첨부 | 관리자 → 게시글, 파일 관리 |
| 시험 신청 | 관리자 → 사업공고 수신자, 교육사업 제안 |
| 시험 구독 | 관리자 → 뉴스레터 |

진짜 가입자나 진짜 신청이 섞여 있을 수 있으므로 한꺼번에 지우지 마세요.

**지우면 안 되는 것**

- `admin_access_log` — 「개인정보의 안전성 확보조치 기준」이 1년 이상 보관을 요구합니다.
  개인정보 처리방침에도 '기록일부터 2년'이라고 적었습니다.
- 회원사·연혁·소개 문구·홈 카드·사이트 정보 — 시험하는 동안 넣은 **진짜 내용**입니다.

---

## 7. 보관 기간 지난 자료 자동 파기

개인정보처리방침 제4조에 적은 기간이 지난 자료를 지웁니다.
적어 놓고 지키지 않으면 그 자체가 문제가 되므로 반드시 걸어 두세요.

`.env.production` 에 아무나 못 부르게 할 비밀값을 넣습니다(1-6 에서 넣었다면 건너뜁니다).

```bash
CLEANUP_SECRET=$(openssl rand -hex 24)
```

cron 에 하루 한 번 등록합니다.

```bash
sudo crontab -e
# 매일 새벽 4시 30분 — 백업(4시) 다음에 돈다 (서버 시간대가 KST 여야 한다. 1-2a)
30 4 * * * curl -fsS -H "Authorization: Bearer 비밀값" https://cccr.kr/api/cleanup >> /var/log/c3r-cleanup.log 2>&1
```

지운 개수가 로그에 남습니다. 기간을 바꾸려면 `src/lib/retention.ts` 와
개인정보처리방침 제4조를 **함께** 고쳐야 합니다.

Vercel 에 올린 경우에는 `vercel.json` 의 `crons` 가 대신 부릅니다.
환경변수에 `CRON_SECRET` 을 정해 두면 Vercel 이 그 값을 헤더에 붙여 보냅니다.
`CLEANUP_SECRET` 과 `CRON_SECRET` 중 하나만 맞으면 실행됩니다.

---

## 8. 소셜 로그인 (카카오·네이버·구글)

각 서비스에 앱을 등록하고 `KAKAO_CLIENT_ID`·`KAKAO_CLIENT_SECRET`·`NAVER_CLIENT_ID`·`NAVER_CLIENT_SECRET`·
`GOOGLE_CLIENT_ID`·`GOOGLE_CLIENT_SECRET` 을 `.env.production` 에 넣으면 로그인 단추가 나타납니다.
등록 방법과 돌아올 주소는 [social-login.md](social-login.md) 에 있습니다.
