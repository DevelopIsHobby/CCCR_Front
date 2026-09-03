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
export { siteUrl } from "@/lib/site-url";

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

const FONT = "'Malgun Gothic','맑은 고딕',AppleSDGothicNeo-Regular,sans-serif";

function escape(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** 주소는 눌러서 열 수 있게 한다. */
function linkify(html: string): string {
  return html.replace(
    /(https?:\/\/[^\s<]+)/g,
    '<a href="$1" style="color:#1257a5;word-break:break-all">$1</a>',
  );
}

/** 빈 줄로 나뉜 덩어리는 문단, 그 안의 줄바꿈은 <br> 로 만든다. */
function paragraphs(text: string, style: string): string {
  return text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => `<p style="${style}">${linkify(escape(block)).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

/*
  평문 본문을 메일용 HTML 로 바꾼다.

  white-space:pre-wrap 으로 줄바꿈을 살리려 했으나 아웃룩이 그 속성을 무시해
  본문이 한 덩어리로 뭉쳐 보였다. 문단과 <br> 로 실제 구조를 만들어야 한다.
  바깥을 표로 감싸는 것도 같은 이유다. 아웃룩은 div 의 폭·여백을 자주 흘린다.

  본문은 평문 한 벌만 관리하고(templates.ts) 여기서 모양을 입힌다.
*/
function toHtml(text: string): string {
  /* 구분선 아래는 접수번호·문의처 같은 꼬리말이라 따로 담는다 */
  const [bodyPart, footPart = ""] = text.split(/\n─+\n/);

  const body = paragraphs(bodyPart, `margin:0 0 16px;font-size:15px;line-height:1.8;color:#14202e`);
  const foot = footPart
    ? `<div style="margin-top:28px;padding-top:18px;border-top:1px solid #e2e8f0">
         ${paragraphs(footPart, "margin:0 0 10px;font-size:13px;line-height:1.7;color:#4a5768")}
       </div>`
    : "";

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f8fc;padding:24px 0">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:100%;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px">
      <tr><td style="padding:32px 32px 28px;font-family:${FONT}">
        ${body}${foot}
      </td></tr>
    </table>
  </td></tr>
</table>`;
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
