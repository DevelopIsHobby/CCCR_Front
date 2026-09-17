#!/usr/bin/env node
/*
  운영 서버 설정 점검.

  값 하나를 빠뜨려도 사이트는 그냥 뜬다. 대신 조용히 틀어진다.
    - SITE_URL 이 없으면 메일 속 링크와 사이트맵이 localhost 가 된다
    - UPLOAD_DIR 이 없으면 첨부가 앱 폴더에 쌓이고, 백업 대상에서 빠진다
    - DATABASE_URL 이 없으면 PostgreSQL 대신 파일 DB(sqlite)로 조용히 떨어진다
  그래서 배포 전에 한 번 본다(scripts/deploy.sh 가 부른다).

  쓰는 법:
    node scripts/check-env.mjs                 # .env.production 을 읽어 본다
    C3R_ENV_FILE=/경로/.env node scripts/check-env.mjs
*/
import { accessSync, constants, readFileSync, statSync } from "node:fs";
import { isAbsolute } from "node:path";

const ENV_FILE = process.env.C3R_ENV_FILE ?? ".env.production";

function loadEnv(path) {
  let text = "";
  try {
    text = readFileSync(path, "utf8");
  } catch {
    return false;
  }
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const at = line.indexOf("=");
    if (at === -1) continue;
    const key = line.slice(0, at).trim();
    let value = line.slice(at + 1).trim();
    const quoted =
      value.length > 1 &&
      ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")));
    if (quoted) value = value.slice(1, -1);
    if (process.env[key] === undefined) process.env[key] = value;
  }
  return true;
}

const problems = [];
const warnings = [];
const notes = [];

const found = loadEnv(ENV_FILE);
notes.push(found ? `설정 파일: ${ENV_FILE}` : `설정 파일이 없습니다(${ENV_FILE}). 환경변수만 봅니다`);

/* 1) 사이트 주소 */
const siteUrl = process.env.SITE_URL?.trim();
if (!siteUrl) {
  problems.push("SITE_URL 이 없습니다. 메일 속 링크와 사이트맵이 http://localhost:3000 이 됩니다");
} else if (!/^https:\/\//i.test(siteUrl)) {
  warnings.push(`SITE_URL 이 https 가 아닙니다: ${siteUrl}`);
} else if (/localhost|127\.0\.0\.1|vercel\.app/i.test(siteUrl)) {
  problems.push(`SITE_URL 이 운영 주소가 아닙니다: ${siteUrl}`);
} else {
  notes.push(`사이트 주소: ${siteUrl}`);
}

/* 2) DB */
const dbUrl = process.env.DATABASE_URL?.trim();
const dbDriver = process.env.DB_DRIVER?.trim().toLowerCase();
if (!dbUrl && dbDriver !== "sqlite") {
  problems.push("DATABASE_URL 이 없습니다. PostgreSQL 대신 파일 DB(sqlite)로 떨어집니다");
} else if (dbUrl && !/^postgres(ql)?:\/\//i.test(dbUrl)) {
  problems.push("DATABASE_URL 이 postgres:// 로 시작하지 않습니다");
} else if (dbUrl) {
  notes.push("DB: PostgreSQL");
}

/* 3) 첨부 폴더 — 있는지, 쓸 수 있는지, 백업 대상 안인지 */
const uploadDir = process.env.UPLOAD_DIR?.trim();
if (!uploadDir) {
  problems.push(
    "UPLOAD_DIR 이 없습니다. 첨부가 앱 폴더(data/uploads)에 쌓이고 백업(scripts/backup.sh)에서 빠집니다",
  );
} else if (!isAbsolute(uploadDir)) {
  problems.push(`UPLOAD_DIR 은 전체 경로로 적어야 합니다(지금: ${uploadDir})`);
} else {
  try {
    statSync(uploadDir);
    accessSync(uploadDir, constants.W_OK);
    notes.push(`첨부 폴더: ${uploadDir} (쓸 수 있음)`);
  } catch {
    warnings.push(`첨부 폴더에 지금 쓸 수 없습니다: ${uploadDir} (앱 계정 권한을 확인하세요)`);
  }
}

/* 3-1) 백업이 그 폴더를 보고 있는지. 다르면 첨부가 백업에서 빠진다 */
if (uploadDir) {
  try {
    const backup = readFileSync("scripts/backup.sh", "utf8");
    /* backup.sh 의 UPLOAD_DIR="${UPLOAD_DIR:-여기}" 에서 기본값만 떼어 낸다 */
    const mark = "UPLOAD_DIR:-";
    const at = backup.indexOf(mark);
    const backupDir = at === -1 ? "" : backup.slice(at + mark.length, backup.indexOf("}", at));
    if (backupDir && backupDir !== uploadDir) {
      warnings.push(
        `백업 스크립트는 ${backupDir} 를 봅니다. UPLOAD_DIR(${uploadDir})과 달라 첨부가 백업에서 빠집니다. ` +
          "cron 줄 앞에 UPLOAD_DIR 을 함께 적어 주세요",
      );
    }
  } catch {
    /* 스크립트를 못 읽으면 넘어간다. 점검 때문에 배포가 막히면 곤란하다 */
  }
}

/* 4) 메일 — 없으면 가입 승인·신청 알림이 나가지 않는다 */
const smtp = ["SMTP_HOST", "SMTP_USER", "SMTP_PASS"].filter((k) => !process.env[k]?.trim());
if (smtp.length > 0) {
  problems.push(`메일 설정이 빠졌습니다(${smtp.join(", ")}). 가입 승인 메일이 나가지 않습니다`);
} else {
  notes.push(`메일: ${process.env.SMTP_HOST} / ${process.env.SMTP_USER}`);
}
if (!process.env.MAIL_OFFICE?.trim()) {
  warnings.push("MAIL_OFFICE 가 없습니다. 새 신청·백업 실패 알림이 보내는 주소로만 갑니다");
}
/*
  카페24 발송 서버(smtp.cafe24.com)는 TLS 1.0 까지만 하고 재협상 방식도 옛것이라
  요즘 Node 가 연결을 끊는다. 이 값이 없으면 메일이 한 통도 나가지 않는데
  화면에는 아무 표시가 없다(기록에만 failed 로 남는다). 여기서 미리 짚어 준다.
*/
const smtpHost = process.env.SMTP_HOST?.trim().toLowerCase() ?? "";
if (smtpHost.includes("cafe24") && process.env.SMTP_LEGACY_TLS?.trim() !== "1") {
  warnings.push(
    "SMTP_LEGACY_TLS=1 이 없습니다. 카페24 발송 서버는 낡은 TLS 라 이 값이 없으면 메일이 나가지 않습니다",
  );
}

/* 5) 보관기간 자동 파기 */
if (!process.env.CLEANUP_SECRET?.trim() && !process.env.CRON_SECRET?.trim()) {
  problems.push(
    "CLEANUP_SECRET 이 없습니다. 보관기간이 지난 개인정보를 자동으로 지우지 못합니다(방침 위반)",
  );
}

/* 6) 검색 차단 — 열기 전에는 켜 두고, 연 뒤에는 꺼야 한다 */
const noindex = process.env.SITE_NOINDEX?.trim();
if (noindex === "1") {
  warnings.push("SITE_NOINDEX=1 — 검색 엔진을 막고 있습니다. 정식 공개일에 지우세요");
}

/* 7) 소셜 로그인 — 일부만 넣으면 그 갈래만 조용히 사라진다 */
for (const p of ["KAKAO", "NAVER", "GOOGLE"]) {
  const id = process.env[`${p}_CLIENT_ID`]?.trim();
  const secret = process.env[`${p}_CLIENT_SECRET`]?.trim();
  if (id && !secret) warnings.push(`${p} 로그인: ID 만 있고 SECRET 이 없습니다`);
  if (!id && secret) warnings.push(`${p} 로그인: SECRET 만 있고 ID 가 없습니다`);
}

for (const n of notes) console.log(`  · ${n}`);
for (const w of warnings) console.log(`  ⚠ ${w}`);
for (const p of problems) console.error(`  ✖ ${p}`);

if (problems.length > 0) {
  console.error(`\n설정에 문제가 ${problems.length}가지 있습니다. 고친 뒤 다시 배포하세요.`);
  process.exit(1);
}
console.log(warnings.length > 0 ? "\n설정 점검: 살펴볼 것이 있습니다(위 ⚠)" : "\n설정 점검: 이상 없음");
