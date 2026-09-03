import "server-only";

/*
  알림 메일을 보내고 받는 주소.

  한 군데서만 정한다. 발신 주소와 본문의 '문의' 주소가 다르면 받는 사람이
  회신했을 때 아무도 없는 사서함으로 간다.

  MAIL_FROM 으로 바꿀 수 있고, 없으면 SMTP 로그인 계정을 쓴다.
  둘 다 없는 개발 환경에서는 아래 기본값으로 보인다.
*/
const DEFAULT = "rnd@cccr.or.kr";

/** 주소만. 화면에 적거나 mailto 에 쓴다. */
export function mailFrom(): string {
  return process.env.MAIL_FROM || process.env.SMTP_USER || DEFAULT;
}

/** 메일 헤더용. 표시 이름을 붙여야 받는 쪽에서 누가 보냈는지 바로 보인다. */
export function fromHeader(): string {
  return `한국클라우드컴퓨팅연구조합 <${mailFrom()}>`;
}
