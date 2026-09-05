import "server-only";
import { ready } from "./migrate";
import type {
  BusySlot,
  ReservationStatus,
  RoomBlock,
  RoomReservation,
  RoomSlug,
} from "@/lib/room-types";
import { RESERVATION_STATUS_LABEL } from "@/lib/room-types";

type RawReservation = {
  id: number;
  room: string;
  use_date: string;
  start_time: string;
  end_time: string;
  headcount: number;
  org: string;
  name: string;
  email: string;
  tel: string;
  purpose: string;
  status: string;
  created_at: string;
};

const STATUSES = new Set(["requested", "confirmed", "cancelled"]);

const toReservation = (r: RawReservation): RoomReservation => ({
  id: Number(r.id),
  room: (r.room === "small" ? "small" : "large") as RoomSlug,
  useDate: r.use_date,
  startTime: r.start_time,
  endTime: r.end_time,
  headcount: Number(r.headcount),
  org: r.org,
  name: r.name,
  email: r.email,
  tel: r.tel,
  purpose: r.purpose,
  status: (STATUSES.has(r.status) ? r.status : "requested") as ReservationStatus,
  createdAt: r.created_at,
});

const SELECT = `SELECT id, room, use_date, start_time, end_time, headcount,
                       org, name, email, tel, purpose, status, created_at
                  FROM room_reservations`;

export async function listReservations(
  opts: { status?: ReservationStatus | "all"; upcomingOnly?: boolean } = {},
): Promise<RoomReservation[]> {
  const db = await ready();
  const status = opts.status ?? "all";

  /* 휴지통에 있는 것은 목록에 내지 않는다 */
  const where: string[] = ["deleted_at = ''"];
  const params: string[] = [];

  if (status !== "all") {
    where.push("status = ?");
    params.push(status);
  }
  if (opts.upcomingOnly) {
    where.push("use_date >= ?");
    params.push(new Date().toISOString().slice(0, 10));
  }

  const rows = await db.all<RawReservation>(
    `${SELECT} WHERE ${where.join(" AND ")}
      ORDER BY use_date DESC, start_time DESC, id DESC`,
    params,
  );
  return rows.map(toReservation);
}

/** 사이드바 배지와 대시보드에 쓴다. */
export async function countRequestedReservations(): Promise<number> {
  const db = await ready();
  const row = await db.get<{ n: number }>(
    "SELECT COUNT(*) AS n FROM room_reservations WHERE deleted_at = '' AND status = 'requested'",
  );
  return Number(row?.n ?? 0);
}

/* ── 조합 내부 사용 시간 ──────────────────────────── */

type RawBlock = {
  id: number;
  room: string;
  use_date: string;
  start_time: string;
  end_time: string;
  memo: string;
};

const toBlock = (r: RawBlock): RoomBlock => ({
  id: Number(r.id),
  room: (r.room === "small" ? "small" : "large") as RoomSlug,
  useDate: r.use_date,
  startTime: r.start_time,
  endTime: r.end_time,
  memo: r.memo,
});

export async function listBlocks(opts: { upcomingOnly?: boolean } = {}): Promise<RoomBlock[]> {
  const db = await ready();
  const rows = await db.all<RawBlock>(
    `SELECT id, room, use_date, start_time, end_time, memo FROM room_blocks
     ${opts.upcomingOnly ? "WHERE use_date >= ?" : ""}
     ORDER BY use_date DESC, start_time`,
    opts.upcomingOnly ? [new Date().toISOString().slice(0, 10)] : [],
  );
  return rows.map(toBlock);
}

/** 같은 회의실·같은 날에 겹치는 내부 사용을 찾는다. */
export async function findBlock(
  room: RoomSlug,
  useDate: string,
  startTime: string,
  endTime: string,
): Promise<RoomBlock | null> {
  const db = await ready();
  const row = await db.get<RawBlock>(
    `SELECT id, room, use_date, start_time, end_time, memo FROM room_blocks
      WHERE room = ? AND use_date = ? AND start_time < ? AND end_time > ?
      ORDER BY start_time LIMIT 1`,
    [room, useDate, endTime, startTime],
  );
  return row ? toBlock(row) : null;
}

/**
 * 같은 회의실·같은 날에 겹치는 예약을 찾는다.
 * 취소한 건 비켜 준다. 시간이 맞닿는 것(앞 예약 끝 = 뒤 예약 시작)은 겹침이 아니다.
 */
export async function findConflict(
  room: RoomSlug,
  useDate: string,
  startTime: string,
  endTime: string,
  exceptId = 0,
): Promise<RoomReservation | null> {
  const db = await ready();
  const row = await db.get<RawReservation>(
    `${SELECT}
      WHERE deleted_at = '' AND room = ? AND use_date = ? AND status <> 'cancelled'
        AND start_time < ? AND end_time > ?
        AND id <> ?
      ORDER BY start_time LIMIT 1`,
    [room, useDate, endTime, startTime, exceptId],
  );
  return row ? toReservation(row) : null;
}

/**
 * 신청 화면에서 그 날 쓸 수 없는 시간을 보여줄 때 쓴다.
 * 다른 사람의 예약과 조합 내부 사용을 한 묶음으로 돌려준다.
 */
export async function listBusySlots(room: RoomSlug, useDate: string): Promise<BusySlot[]> {
  const db = await ready();

  const [reserved, blocked] = await Promise.all([
    db.all<{ start_time: string; end_time: string; status: string }>(
      `SELECT start_time, end_time, status FROM room_reservations
        WHERE deleted_at = '' AND room = ? AND use_date = ? AND status <> 'cancelled'
        ORDER BY start_time`,
      [room, useDate],
    ),
    db.all<{ start_time: string; end_time: string; memo: string }>(
      `SELECT start_time, end_time, memo FROM room_blocks
        WHERE room = ? AND use_date = ? ORDER BY start_time`,
      [room, useDate],
    ),
  ]);

  const slots: BusySlot[] = [
    ...reserved.map((r) => ({
      startTime: r.start_time,
      endTime: r.end_time,
      kind: "reserved" as const,
      label:
        RESERVATION_STATUS_LABEL[
          (STATUSES.has(r.status) ? r.status : "requested") as ReservationStatus
        ],
    })),
    ...blocked.map((b) => ({
      startTime: b.start_time,
      endTime: b.end_time,
      kind: "internal" as const,
      label: b.memo || "조합 내부 사용",
    })),
  ];

  return slots.sort((a, b) => a.startTime.localeCompare(b.startTime));
}
