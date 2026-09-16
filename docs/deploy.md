# 배포 · 운영 안내 (국내 VPS)

우분투 계열 국내 VPS 한 대에 **Next.js 앱 + PostgreSQL + Nginx**를 올리는 방법입니다.
서버를 처음 받았을 때 한 번만 하는 설치와, 이후 반복하는 배포·백업·복구를 나눠서 적었습니다.

권장 사양: **vCPU 2 / RAM 2GB / SSD 30GB 이상**, Ubuntu 22.04 LTS.
RAM 1GB짜리는 `next build`가 메모리 부족으로 죽을 수 있습니다(스왑을 잡으면 되지만 느립니다).

---

## 1. 서버 최초 설치 (한 번만)

### 1-1. 기본 패키지

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git nginx ufw
```

### 1-2. Node.js 22 LTS 이상

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node -v    # v22 이상인지 확인
```

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
SITE_URL=https://cccr.or.kr
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

다 올린 뒤 관리자로 로그인해 `https://cccr.or.kr/api/health` 를 열면 설정과 첨부 폴더 쓰기 권한을 한눈에 볼 수 있습니다.

`.env.production`에는 DB 비밀번호가 들어갑니다. 절대 git에 올리지 마세요(`.gitignore`에 이미 있습니다).

### 1-7. 첫 빌드와 관리자 계정

```bash
cd /srv/c3r/app
sudo -u c3r npm ci
sudo -u c3r npm run build

# 스키마 생성 + 관리자 계정 (환경변수 파일을 함께 읽힙니다)
sudo -u c3r node --env-file=.env.production \
  scripts/create-admin.mjs admin@cccr.or.kr '실제_비밀번호' '최고관리자'
```

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
sudo ln -s /etc/nginx/sites-available/c3r /etc/nginx/sites-enabled/c3r
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# 도메인이 서버 IP를 가리키게 한 뒤 인증서 발급
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d cccr.or.kr -d www.cccr.or.kr
```

인증서는 certbot이 자동 갱신합니다(`systemctl status certbot.timer`로 확인).

### 1-10. 자동 백업 등록

```bash
sudo crontab -e
# 아래 한 줄 추가 — 매일 새벽 4시
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
sudo -u postgres pg_restore --no-owner --role=c3r -d c3r --clean --if-exists c3r-from-vercel.dump
sudo systemctl start c3r
```

3) 관리자로 로그인해 회원사 현황·소개 문구·신청 목록이 그대로인지 봅니다.

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

## 4. 복구

### DB 되돌리기

```bash
sudo systemctl stop c3r
sudo -u postgres pg_restore -c -d c3r /srv/c3r/backup/db-20260826-0400.dump
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
- [ ] `sudo ufw status`에서 3000 포트가 열려 있지 않은지
- [ ] 백업 파일이 실제로 쌓이는지 (`ls -lh /srv/c3r/backup`)
- [ ] 백업을 서버 밖으로도 복사하고 있는지
- [ ] 백업 알림 메일이 실제로 오는지 한 번 확인했는지
- [ ] 백업으로 되살리기를 한 번 해 봤는지 (백업은 복구해 봐야 백업입니다)
- [ ] 밖에서 사이트를 지켜보는 감시(UptimeRobot 등)에 `https://cccr.or.kr/api/health/live` 를 걸었는지
      (`/api/health` 는 관리자만 볼 수 있어 감시가 404 를 받는다)
- [ ] `/etc/nginx/conf.d/c3r-limits.conf` 가 있는지 (없으면 nginx 가 뜨지 않습니다)
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
| `SITE_URL` | 메일 안의 링크 주소 | `https://cccr.or.kr` |
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
# 매일 새벽 4시 30분 — 백업(4시) 다음에 돈다
30 4 * * * curl -fsS -H "Authorization: Bearer 비밀값" https://cccr.or.kr/api/cleanup >> /var/log/c3r-cleanup.log 2>&1
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
