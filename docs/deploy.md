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
sudo apt install -y curl git nginx postgresql ufw
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

### 1-5. PostgreSQL 준비

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
ENV
sudo chmod 600 .env.production
```

`.env.production`에는 DB 비밀번호가 들어갑니다. 절대 git에 올리지 마세요(`.gitignore`에 이미 있습니다).

### 1-7. 첫 빌드와 관리자 계정

```bash
cd /srv/c3r/app
sudo -u c3r npm ci
sudo -u c3r npm run build

# 스키마 생성 + 관리자 계정 (환경변수를 함께 넘겨야 합니다)
sudo -u c3r env $(grep -v '^#' .env.production | xargs) \
  node scripts/create-admin.mjs admin@cccr.or.kr '실제_비밀번호' '최고관리자'
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

---

## 2. 평소 배포 (코드가 바뀔 때마다)

```bash
cd /srv/c3r/app
./scripts/deploy.sh
```

코드 받기 → 설치 → 빌드 → 재시작 → 상태 확인까지 한 번에 합니다.
실패하면 어디서 멈췄는지 출력하고 멈춥니다.

---

## 3. 자주 쓰는 명령

| 하고 싶은 일 | 명령 |
| --- | --- |
| 사이트 재시작 | `sudo systemctl restart c3r` |
| 로그 실시간 보기 | `sudo journalctl -u c3r -f` |
| 최근 오류만 보기 | `sudo journalctl -u c3r -p err -n 50` |
| 관리자 비밀번호 변경 | `1-7`의 create-admin 명령을 같은 이메일로 다시 실행 |
| 수동 백업 | `/srv/c3r/app/scripts/backup.sh` |
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
- [ ] `sudo apt update && sudo apt upgrade`를 주기적으로 하는지

---

## 6. 메일 환경변수

`.env.production` 에 아래를 넣습니다. 값은 조합 메일 계정 기준입니다.

| 변수 | 뜻 | 예 |
| --- | --- | --- |
| `SMTP_HOST` | 발송 서버 | 메일 사업자가 알려 줍니다 |
| `SMTP_PORT` | 포트 | 465 또는 587 |
| `SMTP_USER` | 로그인 계정 | `rnd@cccr.or.kr` |
| `SMTP_PASS` | 비밀번호 | |
| `MAIL_FROM` | 보내는 주소 | `rnd@cccr.or.kr` |
| `MAIL_OFFICE` | **새 신청 알림을 받을 주소** | 비우면 `MAIL_FROM` 으로 갑니다. 쉼표로 여럿 가능 |
| `SITE_URL` | 메일 안의 링크 주소 | `https://cccr.or.kr` |
| `SMTP_LEGACY_TLS` | 낡은 TLS 를 받아들일지 | 카페24처럼 TLS 1.0 까지만 하는 서버에 `1`. 인증서 검증은 그대로 합니다 |

`MAIL_OFFICE` 는 담당자가 바뀌거나 여럿이 함께 받아야 할 때 이 값만 바꾸면 됩니다.

---

### 정식 공개 전 미리보기

아직 공개 전이라면 `SITE_NOINDEX=1` 을 넣으세요. 검색엔진이 임시 주소를
색인하면 나중에 진짜 주소와 내용이 겹쳐 검색 순위에 손해입니다.
관리자 화면은 이 값과 상관없이 늘 색인에서 빠집니다.

---

## 7. 보관 기간 지난 자료 자동 파기

개인정보처리방침 제4조에 적은 기간이 지난 자료를 지웁니다.
적어 놓고 지키지 않으면 그 자체가 문제가 되므로 반드시 걸어 두세요.

`.env.production` 에 아무나 못 부르게 할 비밀값을 넣습니다.

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
