/*
  회의실 예약 타입.
  관리자 화면(클라이언트)에서도 쓰므로 server-only 모듈과 분리한다.
*/
export type RoomSlug = "large" | "small";

export const ROOMS: { slug: RoomSlug; label: string }[] = [
  { slug: "large", label: "대회의실" },
  { slug: "small", label: "소회의실" },
];

export const ROOM_LABEL: Record<RoomSlug, string> = {
  large: "대회의실",
  small: "소회의실",
};

export type ReservationStatus = "requested" | "confirmed" | "cancelled";

export const RESERVATION_STATUS_LABEL: Record<ReservationStatus, string> = {
  requested: "신청 접수",
  confirmed: "예약 확정",
  cancelled: "취소",
};

/** 조합이 직접 쓰는 시간. 예약이 없어도 이 시간은 빌려줄 수 없다. */
export type RoomBlock = {
  id: number;
  room: RoomSlug;
  useDate: string;
  startTime: string;
  endTime: string;
  memo: string;
};

/** 신청 화면에서 고를 수 있는 시간대. 30분 단위로 끊는다. */
export const OPEN_FROM = "09:00";
export const OPEN_TO = "21:00";

export function timeOptions(): string[] {
  const out: string[] = [];
  const [fromH] = OPEN_FROM.split(":").map(Number);
  const [toH] = OPEN_TO.split(":").map(Number);

  for (let h = fromH; h <= toH; h += 1) {
    out.push(`${String(h).padStart(2, "0")}:00`);
    if (h !== toH) out.push(`${String(h).padStart(2, "0")}:30`);
  }
  return out;
}

/** 그 날 쓸 수 없는 시간대(예약 + 내부 사용)를 한 묶음으로 본다. */
export type BusySlot = {
  startTime: string;
  endTime: string;
  /** reserved = 다른 신청, internal = 조합 내부 사용 */
  kind: "reserved" | "internal";
  label: string;
};

/** 시작 시각이 어느 바쁜 구간 안에 들어가면 고를 수 없다. */
export function isStartBlocked(time: string, busy: BusySlot[]): BusySlot | null {
  return busy.find((b) => time >= b.startTime && time < b.endTime) ?? null;
}

/** 시작을 정한 뒤, 그 사이에 바쁜 구간이 끼면 그 종료 시각은 고를 수 없다. */
export function isEndBlocked(
  start: string,
  time: string,
  busy: BusySlot[],
): BusySlot | null {
  if (time <= start) return null;
  return busy.find((b) => b.startTime < time && b.endTime > start) ?? null;
}

export type RoomReservation = {
  id: number;
  room: RoomSlug;
  useDate: string;
  startTime: string;
  endTime: string;
  headcount: number;
  org: string;
  name: string;
  email: string;
  tel: string;
  purpose: string;
  status: ReservationStatus;
  createdAt: string;
};
