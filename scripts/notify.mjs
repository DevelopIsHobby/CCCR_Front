#!/usr/bin/env node
/*
  서버에서 벌어진 일을 사무국 메일로 알린다(백업 실패 같은 것).

  쓰는 법:
    node scripts/notify.mjs "제목" "본문"
    echo "본문" | node scripts/notify.mjs "제목"

  메일 설정은 앱과 같은 값을 쓴다(.env.production 의 SMTP_*).
  cron 에는 환경변수가 없으므로 이 파일이 직접 읽는다.

  메일을 못 보내도 1 로 끝내지 않는다. 알림이 실패했다고 백업까지 실패로 남기면
  진짜 문제가 무엇이었는지 가려진다. 대신 까닭을 화면(=cron 로그)에 남긴다.
*/
import { readFileSync } from "node:fs";

const ENV_FILE = process.env.C3R_ENV_FILE ?? "/srv/c3r/app/.env.production";

/** .env 형식(KEY=VALUE)을 읽어 없는 값만 채운다. 이미 있는 환경변수가 우선이다. */
function loadEnv(path) {
  let text = "";
  try {
    text = readFileSync(path, "utf8");
  } catch {
    return; // 파일이 없으면 환경변수만 쓴다
  }

  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const at = line.indexOf("=");
    if (at === -1) continue;
    const key = line.slice(0, at).trim();
    let value = line.slice(at + 1).trim();
    /* 따옴표로 감싼 값은 벗긴다 */
    const quoted = value.length > 1 && ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")));
    if (quoted) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

async function readStdin() {
  if (process.stdin.isTTY) return "";
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

const subject = process.argv[2];
if (!subject) {
  console.error("쓰는 법: node scripts/notify.mjs \"제목\" [\"본문\"]");
  process.exit(2);
}

loadEnv(ENV_FILE);

const host = process.env.SMTP_HOST;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
if (!host || !user || !pass) {
  console.error("메일 설정(SMTP_HOST·SMTP_USER·SMTP_PASS)이 없어 알림을 보내지 못했습니다.");
  process.exit(0);
}

const body = (process.argv[3] ?? (await readStdin())).trim() || "(내용 없음)";
const from = process.env.MAIL_FROM || user;
const to = process.env.MAIL_OFFICE || from;
const port = Number(process.env.SMTP_PORT ?? 587);

try {
  /*
    nodemailer 는 앱의 node_modules 에 있다. 이 파일을 앱 폴더 밖에서 부르면 못 찾는데,
    그때 오류 덩어리를 쏟아 내면 정작 무엇이 실패했는지(백업 등) 묻힌다.
  */
  const { createTransport } = await import("nodemailer").catch(() => ({}));
  if (!createTransport) {
    console.error("nodemailer 를 찾지 못했습니다. /srv/c3r/app 에서 실행하세요.");
    process.exit(0);
  }

  const transport = createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    connectionTimeout: 20_000,
  });

  await transport.sendMail({
    from,
    to,
    subject: `[C3R 서버] ${subject}`,
    text: body,
  });
  console.log(`알림 메일을 보냈습니다 → ${to}`);
} catch (err) {
  console.error("알림 메일을 보내지 못했습니다:", err?.message ?? err);
}
