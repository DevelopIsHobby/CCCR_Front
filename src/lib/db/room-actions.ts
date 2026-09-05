"use server";

import { revalidatePath } from "next/cache";
import { ready } from "@/lib/db/migrate";
import { softDelete } from "@/lib/db/trash";
import { clientKey, record, SUBMIT, tooMany } from "@/lib/db/rate-limit";
import { now } from "@/lib/db/driver";
import { getSession, requireAdmin } from "@/lib/auth/session";
import { findBlock, findConflict, listBusySlots } from "@/lib/db/rooms";
import {
  ROOM_LABEL,
  type ReservationStatus,
  type RoomSlug,
} from "@/lib/room-types";
import { makeRef, newLookupToken } from "@/lib/db/refs";
import { sendMail } from "@/lib/mail/send";
import { officeTo } from "@/lib/mail/address";
import {
  officeNotice,
  roomCancelled,
  roomConfirmed,
  roomReceived,
} from "@/lib/mail/templates";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^\d{2}:\d{2}$/;

const trimmed = (formData: FormData, key: string, max: number) =>
  String(formData.get(key) ?? "")
    .trim()
    .slice(0, max);

const today = () => new Date().toISOString().slice(0, 10);

export type ReservationState = { error?: string; ok?: string; ref?: string; mailed?: boolean };

/** 신청 화면에서 그 날 쓸 수 없는 시간을 보여 준다. */
export async function getBusySlots(room: RoomSlug, useDate: string) {
  if (!DATE.test(useDate) || (room !== "large" && room !== "small")) return [];
  return listBusySlots(room, useDate);
}

export async function requestReservation(
  _prev: ReservationState,
  formData: FormData,
): Promise<ReservationState> {
  /* 사람이 채우지 않는 칸. 채워져 있으면 자동 입력이다. */
  if (String(formData.get("website") ?? "")) return { ok: "신청을 받았습니다." };
  /* 브라우저 검사만 믿지 않는다. 동의 없이 들어온 신청은 받지 않는다. */
  if (!formData.get("agreePrivacy")) {
    return { error: "개인정보 수집·이용에 동의해 주셔야 신청할 수 있습니다." };
  }

  /* 스크립트로 쏟아붓는 것을 막는다. 빈 칸 덫만으로는 사람 흉내를 거르지 못한다. */
  const from = await clientKey();
  if (await tooMany("submit", from, SUBMIT.limit, SUBMIT.windowSec)) {
    return { error: "신청이 너무 잦습니다. 잠시 뒤에 다시 해 주세요." };
  }


  const room = trimmed(formData, "room", 10) as RoomSlug;
  const useDate = trimmed(formData, "useDate", 10);
  const startTime = trimmed(formData, "startTime", 5);
  const endTime = trimmed(formData, "endTime", 5);
  const headcount = Number(formData.get("headcount")) || 0;
  const org = trimmed(formData, "org", 100);
  const name = trimmed(formData, "name", 50);
  const email = trimmed(formData, "email", 200).toLowerCase();
  const tel = trimmed(formData, "tel", 50);
  const purpose = trimmed(formData, "purpose", 1000);

  if (room !== "large" && room !== "small") return { error: "회의실을 선택해 주세요." };
  if (!DATE.test(useDate)) return { error: "이용일을 선택해 주세요." };
  if (useDate < today()) return { error: "지난 날짜는 신청할 수 없습니다." };
  if (!TIME.test(startTime) || !TIME.test(endTime)) return { error: "이용 시간을 정해 주세요." };
  if (endTime <= startTime) return { error: "종료 시간이 시작 시간보다 빨라요." };
  if (!org) return { error: "단체·회사명을 입력해 주세요." };
  if (!name) return { error: "신청자 이름을 입력해 주세요." };
  if (!EMAIL.test(email)) return { error: "이메일 주소를 다시 확인해 주세요." };

  /* 조합이 직접 쓰는 시간은 예약이 없어도 빌려줄 수 없다 */
  const block = await findBlock(room, useDate, startTime, endTime);
  if (block) {
    return {
      error: `그 시간은 조합에서 사용합니다. (${block.startTime}~${block.endTime}${
        block.memo ? ` · ${block.memo}` : ""
      }) 다른 시간을 골라 주세요.`,
    };
  }

  const clash = await findConflict(room, useDate, startTime, endTime);
  if (clash) {
    return {
      error: `그 시간에는 이미 신청이 있습니다. (${ROOM_LABEL[room]} ${clash.startTime}~${clash.endTime}) 다른 시간을 골라 주세요.`,
    };
  }

  const db = await ready();
  const stamp = now();

  const token = newLookupToken();
  const userId = (await getSession())?.userId ?? null;
  const created = await db.get<{ id: number }>(
    `INSERT INTO room_reservations
       (room, use_date, start_time, end_time, headcount, org, name, email, tel, purpose,
        lookup_token, user_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
    [room, useDate, startTime, endTime, headcount, org, name, email, tel, purpose, token, userId, stamp, stamp],
  );

  const ref = makeRef("room", Number(created?.id ?? 0), stamp);
  await db.run("UPDATE room_reservations SET ref = ? WHERE id = ?", [ref, created?.id ?? 0]);

  await record("submit", from);
  revalidatePath("/admin/rooms");

  const mailed =
    (await sendMail({
    kind: "room.received",
    to: email,
    ref,
    ...roomReceived({
      name,
      ref,
      token,
      room: ROOM_LABEL[room],
      useDate,
      startTime,
      endTime,
    }),
    })) === "sent";

  /* 사무국도 알아야 한다. 밤이나 주말에 들어온 신청을 다음 날에야 알면 늦다. */
  await sendMail({
    kind: "room.office",
    to: officeTo(),
    ref,
    ...officeNotice({
      channel: "회의실 예약",
      ref,
      adminPath: "/admin/rooms",
      org,
      name,
      email,
      lines: [`회의실  ${ROOM_LABEL[room]}`, `일시  ${useDate} ${startTime}~${endTime}`],
    }),
  });

  return {
    ok: "신청을 받았습니다. 사무국에서 확인한 뒤 확정 여부를 연락드립니다.",
    ref,
    mailed,
  };
}

export async function setReservationStatus(
  id: number,
  status: ReservationStatus,
): Promise<{ error?: string } | void> {
  await requireAdmin();
  if (!id) return;

  const db = await ready();

  /* 확정할 때만 다시 한 번 겹치는지 본다. 신청 사이에 다른 건이 확정됐을 수 있다. */
  if (status === "confirmed") {
    const row = await db.get<{
      room: string;
      use_date: string;
      start_time: string;
      end_time: string;
    }>(
      "SELECT room, use_date, start_time, end_time FROM room_reservations WHERE id = ?",
      [id],
    );
    if (!row) return;

    const block = await findBlock(row.room as RoomSlug, row.use_date, row.start_time, row.end_time);
    if (block) {
      return { error: `조합 내부 사용과 겹칩니다. (${block.startTime}~${block.endTime})` };
    }

    const clash = await findConflict(
      row.room as RoomSlug,
      row.use_date,
      row.start_time,
      row.end_time,
      id,
    );
    if (clash && clash.status === "confirmed") {
      return { error: `이미 확정된 예약과 겹칩니다. (${clash.startTime}~${clash.endTime})` };
    }
  }

  await db.run("UPDATE room_reservations SET status = ?, updated_at = ? WHERE id = ?", [
    status,
    now(),
    id,
  ]);
  revalidatePath("/admin/rooms");

  /* 신청자가 기다리는 것은 확정과 취소다. '신청' 으로 되돌리는 경우는 알리지 않는다. */
  if (status !== "confirmed" && status !== "cancelled") return;

  const row = await db.get<{
    name: string;
    email: string;
    ref: string;
    lookup_token: string;
    room: string;
    use_date: string;
    start_time: string;
    end_time: string;
  }>(
    `SELECT name, email, ref, lookup_token, room, use_date, start_time, end_time
       FROM room_reservations WHERE id = ?`,
    [id],
  );
  if (!row) return;

  const info = {
    name: row.name,
    ref: row.ref,
    token: row.lookup_token,
    room: ROOM_LABEL[row.room as RoomSlug] ?? row.room,
    useDate: row.use_date,
    startTime: row.start_time,
    endTime: row.end_time,
  };

  await sendMail({
    kind: status === "confirmed" ? "room.confirmed" : "room.cancelled",
    to: row.email,
    ref: row.ref,
    ...(status === "confirmed" ? roomConfirmed(info) : roomCancelled(info)),
  });
}

/* ── 조합 내부 사용 시간 ──────────────────────────── */

export async function saveBlock(
  _prev: ReservationState,
  formData: FormData,
): Promise<ReservationState> {
  await requireAdmin();

  const room = trimmed(formData, "room", 10) as RoomSlug;
  const useDate = trimmed(formData, "useDate", 10);
  const startTime = trimmed(formData, "startTime", 5);
  const endTime = trimmed(formData, "endTime", 5);
  const memo = trimmed(formData, "memo", 200);

  if (room !== "large" && room !== "small") return { error: "회의실을 선택해 주세요." };
  if (!DATE.test(useDate)) return { error: "날짜를 골라 주세요." };
  if (!TIME.test(startTime) || !TIME.test(endTime)) return { error: "시간을 정해 주세요." };
  if (endTime <= startTime) return { error: "종료 시간이 시작 시간보다 빨라요." };

  const db = await ready();
  await db.run(
    `INSERT INTO room_blocks (room, use_date, start_time, end_time, memo, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [room, useDate, startTime, endTime, memo, now()],
  );

  revalidatePath("/admin/rooms");
  return { ok: "내부 사용 시간을 잡았습니다." };
}

export async function deleteBlock(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = Number(formData.get("id"));
  if (!id) return;

  const db = await ready();
  await db.run("DELETE FROM room_blocks WHERE id = ?", [id]);
  revalidatePath("/admin/rooms");
}

export async function deleteReservation(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = Number(formData.get("id"));
  if (!id) return;

  await softDelete("room", id);
  revalidatePath("/admin/rooms");
}
