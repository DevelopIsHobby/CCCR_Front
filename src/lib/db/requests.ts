import "server-only";
import { ready } from "./migrate";
import { normalizeRef, type RequestKind } from "./refs";
import { ROOM_LABEL, type RoomSlug } from "@/lib/room-types";

/*
  신청 현황 조회.

  창구가 넷이고 표도 넷이지만 신청자에게는 "내가 넣은 신청"일 뿐이다.
  네 표를 같은 모양으로 추려 한 화면에서 보여 준다.

  상태 이름은 사무국용과 다르게 쓴다. 관리자 화면의 '새 제안'은 사무국이
  아직 안 봤다는 뜻이지만, 신청자에게는 '접수됨'이 맞는 말이다.
*/

export type RequestTone = "wait" | "ok" | "no";

export type RequestSummary = {
  kind: RequestKind;
  kindLabel: string;
  ref: string;
  token: string;
  statusLabel: string;
  tone: RequestTone;
  name: string;
  email: string;
  /** 무엇을 신청했는지 한 줄로 */
  detail: string;
  /** 반려 사유처럼 신청자에게 그대로 보여 줄 말 */
  note: string;
  createdAt: string;
  updatedAt: string;
};

const KIND_LABEL: Record<RequestKind, string> = {
  notice: "사업공고 수신신청",
  proposal: "교육사업 제안",
  room: "회의실 예약",
  promo: "홍보 서비스 신청",
};

/* 신청자에게 보여 줄 상태 이름과 색. */
const STATUS: Record<RequestKind, Record<string, { label: string; tone: RequestTone }>> = {
  notice: {
    pending: { label: "승인 대기", tone: "wait" },
    active: { label: "수신 중", tone: "ok" },
    rejected: { label: "반려", tone: "no" },
    unsubscribed: { label: "수신 중단", tone: "no" },
  },
  proposal: {
    new: { label: "접수됨", tone: "wait" },
    reading: { label: "검토 중", tone: "wait" },
    done: { label: "검토 완료", tone: "ok" },
  },
  room: {
    requested: { label: "확정 대기", tone: "wait" },
    confirmed: { label: "예약 확정", tone: "ok" },
    cancelled: { label: "취소됨", tone: "no" },
  },
  promo: {
    new: { label: "접수됨", tone: "wait" },
    reading: { label: "검토 중", tone: "wait" },
    running: { label: "홍보 중", tone: "ok" },
    done: { label: "완료", tone: "ok" },
  },
};

function status(kind: RequestKind, raw: string) {
  return STATUS[kind][raw] ?? { label: raw, tone: "wait" as RequestTone };
}

/* 표마다 칸 이름이 달라 조회식을 따로 둔다. detail 로 쓸 값도 여기서 고른다. */
type Row = {
  ref: string;
  lookup_token: string;
  status: string;
  name: string;
  email: string;
  note?: string | null;
  created_at: string;
  updated_at: string;
  /* 창구별 요약 재료 */
  company?: string | null;
  org?: string | null;
  subject?: string | null;
  room?: string | null;
  use_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
};

const SELECT: Record<RequestKind, string> = {
  notice: `SELECT ref, lookup_token, status, name, email, note, company, created_at, updated_at
             FROM notice_subscribers`,
  proposal: `SELECT ref, lookup_token, status, name, email, org, subject, created_at, updated_at
               FROM education_proposals`,
  room: `SELECT ref, lookup_token, status, name, email, org, room, use_date, start_time, end_time,
                created_at, updated_at
           FROM room_reservations`,
  promo: `SELECT ref, lookup_token, status, name, email, org, subject, created_at, updated_at
            FROM promo_requests`,
};

function detailOf(kind: RequestKind, row: Row): string {
  switch (kind) {
    case "notice":
      return row.company ?? "";
    case "room":
      return [
        ROOM_LABEL[row.room as RoomSlug] ?? row.room ?? "",
        `${row.use_date} ${row.start_time}~${row.end_time}`,
      ]
        .filter(Boolean)
        .join(" · ");
    default:
      return row.subject ?? row.org ?? "";
  }
}

function toSummary(kind: RequestKind, row: Row): RequestSummary {
  const s = status(kind, row.status);
  return {
    kind,
    kindLabel: KIND_LABEL[kind],
    ref: row.ref,
    token: row.lookup_token,
    statusLabel: s.label,
    tone: s.tone,
    name: row.name,
    email: row.email,
    detail: detailOf(kind, row),
    note: row.note ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const KINDS: RequestKind[] = ["notice", "proposal", "room", "promo"];

/** 메일의 조회 링크로 들어온 경우. 토큰 하나로 신청 한 건을 찾는다. */
export async function findRequestByToken(token: string): Promise<RequestSummary | null> {
  if (!/^[0-9a-f]{32}$/.test(token)) return null;

  const db = await ready();
  for (const kind of KINDS) {
    const row = await db.get<Row>(`${SELECT[kind]} WHERE deleted_at = '' AND lookup_token = ?`, [token]);
    if (row) return toSummary(kind, row);
  }
  return null;
}

/**
 * 접수번호로 찾는다. 접수번호는 규칙이 뻔해 남의 신청을 들여다볼 수 있으므로
 * 이메일을 함께 받아 맞을 때만 돌려준다.
 */
export async function findRequestByRef(
  refInput: string,
  emailInput: string,
): Promise<RequestSummary | null> {
  const ref = normalizeRef(refInput);
  const email = emailInput.trim().toLowerCase();
  if (!ref || !email) return null;

  const db = await ready();
  for (const kind of KINDS) {
    const row = await db.get<Row>(`${SELECT[kind]} WHERE deleted_at = '' AND ref = ? AND email = ?`, [ref, email]);
    if (row) return toSummary(kind, row);
  }
  return null;
}

/**
  로그인한 사람의 신청 전부.

  연락받을 주소를 계정 주소와 다르게 적는 경우가 흔하다(회사 대표 주소로 받는다거나).
  그래서 두 가지를 모두 본다.
   - 로그인한 채로 넣어 user_id 가 남은 것
   - 신청서에 계정 주소를 적은 것 (로그인 전에 넣었거나 다른 기기에서 넣은 경우)
*/
export async function listMyRequests(
  userId: number,
  emailInput: string,
): Promise<RequestSummary[]> {
  const email = emailInput.trim().toLowerCase();

  const db = await ready();
  const all: RequestSummary[] = [];

  for (const kind of KINDS) {
    const rows = await db.all<Row>(
      `${SELECT[kind]} WHERE deleted_at = '' AND (user_id = ? OR email = ?)`,
      [userId, email],
    );
    all.push(...rows.map((row) => toSummary(kind, row)));
  }

  /* 최근에 넣은 것이 위로 */
  return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
