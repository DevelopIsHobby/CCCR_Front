import "server-only";
import { mailFrom } from "./address";

/*
  알림 메일 문안.

  받는 사람은 조합 회원사 담당자다. 사무적이되 딱딱하지 않게,
  무엇이 어떻게 됐고 다음에 무엇을 하면 되는지만 적는다.
  본문은 평문 한 벌만 쓴다(send.ts 가 HTML 로 감싼다). 두 벌을 관리하면 한쪽만 고치게 된다.
*/

const OFFICE = "한국클라우드컴퓨팅연구조합 사무국";

export type MailBody = { subject: string; text: string };

/* ── 계정 ────────────────────────────────────────── */

/** 비밀번호 재설정 링크. */
export function passwordReset({ name, url }: { name: string; url: string }): MailBody {
  return {
    subject: "[조합] 비밀번호 재설정 안내",
    text:
      `${name}님, 안녕하세요.\n\n` +
      "비밀번호를 다시 정하실 수 있는 링크를 보내드립니다.\n\n" +
      `${url}\n\n` +
      "이 링크는 세 시간 동안만 쓸 수 있고, 한 번 쓰면 만료됩니다.\n" +
      "비밀번호를 바꾸시면 열려 있던 로그인은 모두 끊깁니다.\n\n" +
      "요청하신 적이 없다면 이 메일은 그냥 두셔도 됩니다. 비밀번호는 그대로입니다.\n" +
      "\n" +
      "─────────────────────\n" +
      `문의: ${mailFrom()}\n` +
      OFFICE,
  };
}
