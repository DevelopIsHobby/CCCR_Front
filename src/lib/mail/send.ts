import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { constants as sslConstants } from "node:crypto";
import { ready } from "@/lib/db/migrate";
import { now } from "@/lib/db/driver";
import { fromHeader } from "./address";

/*
  메일 보내기.

  조합 메일은 카페24를 쓴다. 보내는 서버는 smtp.cafe24.com:587 (STARTTLS)이다.
  받는 쪽 주소(webmail.cccr.or.kr)와 다르므로 헷갈리지 않게 한다. 웹메일의
  '환경설정 > POP3/SMTP 사용설정'에 적힌 값이 기준이다.
  도메인 SPF 에 카페24가 들어 있어 이 서버로 보내야 발신 인증이 통과한다.

  설정이 없으면 보내지 않고 기록만 남긴다(skipped). 로컬 개발과 미리보기 배포에서
  실제 메일이 나가지 않도록, 그러면서도 흐름은 그대로 확인할 수 있도록 하기 위함이다.

  보내기 실패가 신청 자체를 막아서는 안 된다. 회의실 신청을 다 해 놓고 메일이 안
  나갔다고 접수가 취소되면 곤란하다. 그래서 이 파일의 함수는 예외를 던지지 않는다.
*/

export type MailResult = "sent" | "failed" | "skipped";

type SendInput = {
  /** 무슨 메일인지. 기록에 남는다. 예: notice.received, room.confirmed */
  kind: string;
  to: string;
  subject: string;
  /** 본문(평문). HTML 은 이 값을 감싸서 만든다. */
  text: string;
  /** 접수번호. 기록을 신청과 이어 붙이는 데 쓴다. */
  ref?: string;
};

let cached: Transporter | null = null;

function transport(): Transporter | null {
  if (cached) return cached;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;

  const port = Number(process.env.SMTP_PORT ?? 587);

  /*
    SMTP_INSECURE=1 이면 암호화 없이 보낸다.

    smtp.cafe24.com 은 STARTTLS 가 되므로 평소에는 쓸 일이 없다.
    (도메인 주소 smtp.cccr.or.kr 로 붙으면 그 서버에는 인증서가 없어 막힌다.
     그때 쓰려고 만들었던 갈래다.)
    켜면 메일 내용이 평문으로 지나가므로 다른 방법이 없을 때만 쓴다.
  */
  const insecure = process.env.SMTP_INSECURE === "1";

  /*
    인증 방식.

    암호화가 없을 때는 CRAM-MD5 를 먼저 쓴다. 비밀번호를 그대로 보내지 않고
    서버가 준 값으로 계산한 답만 보내기 때문이다. 다만 서버가 목록에 올려 두고도
    실제로는 못 하는 경우가 많다(비밀번호를 되돌릴 수 있는 형태로 갖고 있어야 한다).
    그때는 535 로 거절당하므로 SMTP_AUTH=login 으로 바꿔 쓴다.
    LOGIN·PLAIN 은 비밀번호가 그대로 지나간다.
  */
  const authMethod = process.env.SMTP_AUTH?.trim().toUpperCase();
  const method = authMethod || (insecure ? "CRAM-MD5" : undefined);

  /*
    SMTP_LEGACY_TLS=1 이면 낡은 TLS 도 받아들인다.

    카페24 발송 서버(smtp.cafe24.com)는 STARTTLS 를 제대로 하고 인증서도
    진짜다(*.cafe24.com, Sectigo). 다만 TLS 1.0 까지만 하고 재협상 방식도 옛것이라
    요즘 Node 가 기본값으로 연결을 끊는다.

    낮춰 주는 것은 프로토콜 판(版)뿐이고 인증서 검증은 그대로 한다.
    암호화 자체는 AES-256 으로 걸린다. 평문으로 보내는 것보다 훨씬 낫다.
  */
  const legacyTls = process.env.SMTP_LEGACY_TLS === "1";

  cached = nodemailer.createTransport({
    host,
    port,
    /* 587 은 평문으로 열고 STARTTLS 로 올린다. 465 는 처음부터 TLS 다. */
    secure: !insecure && port === 465,
    requireTLS: !insecure && port !== 465,
    /* 서버가 STARTTLS 를 못 하므로 시도조차 하지 않는다 */
    ignoreTLS: insecure,
    tls: legacyTls
      ? {
          minVersion: "TLSv1",
          ciphers: "DEFAULT:@SECLEVEL=0",
          secureOptions: sslConstants.SSL_OP_LEGACY_SERVER_CONNECT,
        }
      : undefined,
    auth: method ? { user, pass, method } : { user, pass },
    /* 서버리스에서 함수가 끝나기 전에 매달리지 않도록 짧게 끊는다. */
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
  return cached;
}

/** 메일 안의 조회 링크에 쓸 사이트 주소. */
export function siteUrl(): string {
  const explicit = process.env.SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return "http://localhost:3000";
}

async function log(
  input: SendInput,
  status: MailResult,
  error = "",
): Promise<void> {
  try {
    const db = await ready();
    await db.run(
      `INSERT INTO mail_log (kind, ref, to_email, subject, status, error, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [input.kind, input.ref ?? "", input.to, input.subject, status, error.slice(0, 500), now()],
    );
  } catch {
    /* 기록조차 실패하면 그대로 넘어간다. 이것 때문에 신청이 막히면 안 된다. */
  }
}

/** 평문을 그대로 감싼 간단한 HTML. 본문을 두 벌로 관리하지 않으려는 것이다. */
function toHtml(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  /* 주소는 눌러서 열 수 있게 한다 */
  const linked = escaped.replace(
    /(https?:\/\/[^\s<]+)/g,
    '<a href="$1" style="color:#1257a5">$1</a>',
  );

  return `<div style="font-family:'Malgun Gothic',AppleGothic,sans-serif;font-size:15px;line-height:1.8;color:#14202e;white-space:pre-wrap">${linked}</div>`;
}

/**
 * 메일 한 통을 보낸다.
 * 예외를 던지지 않는다. 결과는 돌려주는 값과 mail_log 로 확인한다.
 */
export async function sendMail(input: SendInput): Promise<MailResult> {
  const tx = transport();

  if (!tx) {
    await log(input, "skipped");
    return "skipped";
  }

  try {
    await tx.sendMail({
      from: fromHeader(),
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: toHtml(input.text),
    });
    await log(input, "sent");
    return "sent";
  } catch (err) {
    await log(input, "failed", err instanceof Error ? err.message : String(err));
    return "failed";
  }
}
