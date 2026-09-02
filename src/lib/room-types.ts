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
