"use server";

import { revalidatePath } from "next/cache";
import { ready } from "@/lib/db/migrate";
import { now } from "@/lib/db/driver";
import { requireAdmin } from "@/lib/auth/session";
import { findConflict, listDaySlots } from "@/lib/db/rooms";
import {
  ROOM_LABEL,
  type ReservationStatus,
  type RoomSlug,
} from "@/lib/room-types";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^\d{2}:\d{2}$/;

const trimmed = (formData: FormData, key: string, max: number) =>
  String(formData.get(key) ?? "")
    .trim()
    .slice(0, max);

const today = () => new Date().toISOString().slice(0, 10);

export type ReservationState = { error?: string; ok?: string };

/** 신청 화면에서 그 날 잡힌 시간을 보여 준다. */
export async function getDaySlots(room: RoomSlug, useDate: string) {
  if (!DATE.test(useDate) || (room !== "large" && room !== "small")) return [];
  return listDaySlots(room, useDate);
}

export async function requestReservation(
  _prev: ReservationState,
  formData: FormData,
): Promise<ReservationState> {
  /* 사람이 채우지 않는 칸. 채워져 있으면 자동 입력이다. */
  if (String(formData.get("website") ?? "")) return { ok: "신청을 받았습니다." };

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

  const clash = await findConflict(room, useDate, startTime, endTime);
  if (clash) {
    return {
      error: `그 시간에는 이미 신청이 있습니다. (${ROOM_LABEL[room]} ${clash.startTime}~${clash.endTime}) 다른 시간을 골라 주세요.`,
    };
  }

  const db = await ready();
  const stamp = now();

  await db.run(
    `INSERT INTO room_reservations
       (room, use_date, start_time, end_time, headcount, org, name, email, tel, purpose,
        created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [room, useDate, startTime, endTime, headcount, org, name, email, tel, purpose, stamp, stamp],
  );

  revalidatePath("/admin/rooms");
  return {
    ok: "신청을 받았습니다. 사무국에서 확인한 뒤 확정 여부를 연락드립니다.",
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
}

export async function deleteReservation(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = Number(formData.get("id"));
  if (!id) return;

  const db = await ready();
  await db.run("DELETE FROM room_reservations WHERE id = ?", [id]);
  revalidatePath("/admin/rooms");
}
