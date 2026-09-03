import "server-only";
import { siteUrl } from "./send";
import { mailFrom } from "./address";

/*
  알림 메일 문안.

  받는 사람은 조합 회원사 담당자와 외부 기관 담당자다. 사무적이되 딱딱하지 않게,
  무엇이 어떻게 됐고 다음에 무엇을 하면 되는지만 적는다.
  본문은 평문 한 벌만 쓴다(send.ts 가 HTML 로 감싼다). 두 벌을 관리하면 한쪽만 고치게 된다.
*/

const OFFICE = "한국클라우드컴퓨팅연구조합 사무국";

/** 모든 메일 끝에 붙는 조회 안내와 서명. */
function footer(ref: string, token: string): string {
  return [
    "",
    "─────────────────────",
    `접수번호  ${ref}`,
    `진행 상황  ${siteUrl()}/participate/status/${token}`,
    "",
    "이 메일은 신청하신 분께 자동으로 보내드립니다.",
    `문의: ${mailFrom()}`,
    OFFICE,
  ].join("\n");
}

export type MailBody = { subject: string; text: string };

type Base = { name: string; ref: string; token: string };

/* ── 사업공고 수신신청 ───────────────────────────── */

export function noticeReceived({ name, ref, token }: Base): MailBody {
  return {
    subject: `[조합] 사업공고 수신신청이 접수되었습니다 (${ref})`,
    text:
      `${name}님, 안녕하세요.\n\n` +
      "사업공고 수신신청을 접수했습니다.\n\n" +
      "사업공고는 임원사 담당자께 보내드리는 자료라, 사무국에서 회원사 여부를 확인한 뒤 " +
      "승인해 드립니다. 확인이 끝나면 결과를 이 주소로 다시 알려드리겠습니다.\n" +
      footer(ref, token),
  };
}

export function noticeApproved({ name, ref, token }: Base): MailBody {
  return {
    subject: `[조합] 사업공고 수신신청이 승인되었습니다 (${ref})`,
    text:
      `${name}님, 안녕하세요.\n\n` +
      "사업공고 수신신청이 승인되었습니다. 다음 발송분부터 이 주소로 받아보실 수 있습니다.\n\n" +
      "받는 주소를 바꾸거나 수신을 그만두고 싶으시면 사무국으로 알려주세요." +
      footer(ref, token),
  };
}

export function noticeRejected({ name, ref, token, note }: Base & { note: string }): MailBody {
  return {
    subject: `[조합] 사업공고 수신신청 결과 안내 (${ref})`,
    text:
      `${name}님, 안녕하세요.\n\n` +
      "사업공고 수신신청을 검토했으나 이번에는 등록해 드리지 못했습니다.\n\n" +
      (note ? `사유\n${note}\n\n` : "") +
      "내용에 착오가 있거나 다시 확인이 필요하시면 사무국으로 회신해 주세요." +
      footer(ref, token),
  };
}

/* ── 회의실 예약 ───────────────────────────────── */

type RoomInfo = Base & { room: string; useDate: string; startTime: string; endTime: string };

function slot({ room, useDate, startTime, endTime }: RoomInfo): string {
  return `${room}\n${useDate} ${startTime} ~ ${endTime}`;
}

export function roomReceived(info: RoomInfo): MailBody {
  return {
    subject: `[조합] 회의실 예약 신청이 접수되었습니다 (${info.ref})`,
    text:
      `${info.name}님, 안녕하세요.\n\n` +
      "회의실 예약 신청을 접수했습니다.\n\n" +
      `${slot(info)}\n\n` +
      "아직 예약이 확정된 것은 아닙니다. 사무국에서 일정을 확인한 뒤 확정 여부를 " +
      "이 주소로 알려드립니다. 확정 전에는 다른 신청이 먼저 잡힐 수 있습니다." +
      footer(info.ref, info.token),
  };
}

export function roomConfirmed(info: RoomInfo): MailBody {
  return {
    subject: `[조합] 회의실 예약이 확정되었습니다 (${info.ref})`,
    text:
      `${info.name}님, 안녕하세요.\n\n` +
      "신청하신 회의실 예약이 확정되었습니다.\n\n" +
      `${slot(info)}\n\n` +
      "일정이 바뀌거나 취소가 필요하시면 이용일 전에 사무국으로 알려주세요." +
      footer(info.ref, info.token),
  };
}

export function roomCancelled(info: RoomInfo): MailBody {
  return {
    subject: `[조합] 회의실 예약이 취소되었습니다 (${info.ref})`,
    text:
      `${info.name}님, 안녕하세요.\n\n` +
      "아래 회의실 예약이 취소되었습니다.\n\n" +
      `${slot(info)}\n\n` +
      "다른 날짜로 다시 신청하시거나, 사정을 확인하고 싶으시면 사무국으로 연락 주세요." +
      footer(info.ref, info.token),
  };
}

/* ── 교육사업 제안 ─────────────────────────────── */

export function proposalReceived({ name, ref, token }: Base): MailBody {
  return {
    subject: `[조합] 교육사업 제안이 접수되었습니다 (${ref})`,
    text:
      `${name}님, 안녕하세요.\n\n` +
      "보내주신 교육사업 제안을 접수했습니다.\n\n" +
      "담당자가 내용을 살펴본 뒤 연락드리겠습니다. 검토에는 시간이 걸릴 수 있습니다." +
      footer(ref, token),
  };
}

export function proposalDone({ name, ref, token }: Base): MailBody {
  return {
    subject: `[조합] 교육사업 제안 검토가 끝났습니다 (${ref})`,
    text:
      `${name}님, 안녕하세요.\n\n` +
      "보내주신 교육사업 제안의 검토가 끝났습니다.\n\n" +
      "구체적인 내용은 담당자가 따로 연락드립니다. 관심 가져주셔서 감사합니다." +
      footer(ref, token),
  };
}

/* ── 홍보 서비스 신청 ──────────────────────────── */

export function promoReceived({ name, ref, token }: Base): MailBody {
  return {
    subject: `[조합] 홍보 서비스 신청이 접수되었습니다 (${ref})`,
    text:
      `${name}님, 안녕하세요.\n\n` +
      "홍보 서비스 신청을 접수했습니다.\n\n" +
      "사무국에서 보내주신 자료와 일정을 확인한 뒤 진행 여부를 알려드리겠습니다." +
      footer(ref, token),
  };
}

export function promoRunning({ name, ref, token }: Base): MailBody {
  return {
    subject: `[조합] 홍보 서비스가 진행됩니다 (${ref})`,
    text:
      `${name}님, 안녕하세요.\n\n` +
      "신청하신 홍보 서비스가 진행에 들어갑니다.\n\n" +
      "내용을 고쳐야 하거나 일정을 바꾸실 일이 있으면 사무국으로 알려주세요." +
      footer(ref, token),
  };
}

export function promoDone({ name, ref, token }: Base): MailBody {
  return {
    subject: `[조합] 홍보 서비스가 완료되었습니다 (${ref})`,
    text:
      `${name}님, 안녕하세요.\n\n` +
      "신청하신 홍보 서비스가 모두 마무리되었습니다.\n\n" +
      "이용해 주셔서 감사합니다." +
      footer(ref, token),
  };
}

/* ── 사무국이 받는 알림 ──────────────────────────── */

/**
 * 새 신청이 들어왔을 때 사무국에 보내는 알림.
 *
 * 신청자에게 가는 메일과 달리 조회 링크를 붙이지 않는다. 대신 바로 처리할 수
 * 있도록 관리자 화면으로 이어 준다. 밤이나 주말에 들어온 신청을 다음 날에야
 * 아는 일을 막으려는 것이다.
 */
export function officeNotice(input: {
  /** 어느 창구인가. 예) "회의실 예약" */
  channel: string;
  ref: string;
  /** 관리자 화면 주소. 예) "/admin/rooms" */
  adminPath: string;
  org: string;
  name: string;
  email: string;
  /** 한눈에 보이면 좋은 요약 몇 줄. 예) 회의실·일시 */
  lines?: string[];
}): MailBody {
  const { channel, ref, adminPath, org, name, email, lines = [] } = input;

  return {
    subject: `[신청] ${channel} · ${org}`,
    text:
      `${channel} 신청이 들어왔습니다.\n\n` +
      `신청자  ${org} ${name}\n` +
      `연락처  ${email}\n` +
      (lines.length > 0 ? `${lines.join("\n")}\n` : "") +
      "\n" +
      `처리하기  ${siteUrl()}${adminPath}\n` +
      "\n" +
      "─────────────────────\n" +
      `접수번호  ${ref}\n` +
      "\n" +
      "이 메일은 새 신청이 들어올 때 자동으로 보내드립니다.\n" +
      OFFICE,
  };
}

/* ── 계정 ────────────────────────────────────────── */

/** 비밀번호 재설정 링크. 접수번호가 없는 메일이라 조회 안내를 붙이지 않는다. */
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
