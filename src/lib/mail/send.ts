import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { ready } from "@/lib/db/migrate";
import { now } from "@/lib/db/driver";

/*
  메일 보내기.

  조합 메일은 카페24(smtp.cccr.or.kr:587 STARTTLS)를 쓴다. 도메인 SPF 에 카페24가
  들어 있어 이 서버로 보내야 발신 인증이 통과한다.

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
  cached = nodemailer.createTransport({
    host,
    port,
    /* 587 은 평문으로 열고 STARTTLS 로 올린다. 465 는 처음부터 TLS 다. */
    secure: port === 465,
    requireTLS: port !== 465,
    auth: { user, pass },
    /* 서버리스에서 함수가 끝나기 전에 매달리지 않도록 짧게 끊는다. */
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
  return cached;
}

/** 보내는 사람. 표시 이름을 붙여 스팸으로 덜 보이게 한다. */
function from(): string {
  const address = process.env.MAIL_FROM || process.env.SMTP_USER || "support@cccr.or.kr";
  return `한국클라우드컴퓨팅연구조합 <${address}>`;
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
      from: from(),
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
