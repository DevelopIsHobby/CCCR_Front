import { getSession } from "@/lib/auth/session";
import { listReservations } from "@/lib/db/rooms";
import { csvResponse, toCsv } from "@/lib/csv";
import {
  RESERVATION_STATUS_LABEL,
  ROOM_LABEL,
  type ReservationStatus,
} from "@/lib/room-types";

/*
  회의실 예약 내려받기(CSV).

  결재를 올리거나 실적을 정리할 때 표가 필요하다. 화면을 보고 손으로 옮겨
  적지 않게 한다. 화면에서 고른 갈래와 기간을 그대로 담는다.
*/
export async function GET(request: Request) {
  const session = await getSession();
  if (session?.role !== "admin") {
    return new Response("관리자만 내려받을 수 있습니다.", { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("status");
  const status = (["requested", "confirmed", "cancelled"] as ReservationStatus[]).includes(
    raw as ReservationStatus,
  )
    ? (raw as ReservationStatus)
    : "all";

  const rows = await listReservations({
    status,
    upcomingOnly: searchParams.get("range") !== "all",
  });

  const csv = toCsv(
    ["상태", "회의실", "이용일", "시작", "종료", "인원", "단체·회사명", "신청자", "이메일", "연락처", "사용 목적", "접수번호", "신청일"],
    rows.map((r) => [
      RESERVATION_STATUS_LABEL[r.status],
      ROOM_LABEL[r.room],
      r.useDate,
      r.startTime,
      r.endTime,
      r.headcount > 0 ? r.headcount : "",
      r.org,
      r.name,
      r.email,
      r.tel,
      r.purpose,
      r.ref,
      r.createdAt.slice(0, 10),
    ]),
  );

  return csvResponse("room-reservations", csv);
}
