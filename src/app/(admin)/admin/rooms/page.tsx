import type { Metadata } from "next";
import Link from "next/link";
import ReservationList from "@/components/admin/ReservationList";
import { listReservations } from "@/lib/db/rooms";
import { RESERVATION_STATUS_LABEL, type ReservationStatus } from "@/lib/room-types";

export const metadata: Metadata = { title: "회의실 예약" };

const FILTERS: { value: ReservationStatus | "all"; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "requested", label: RESERVATION_STATUS_LABEL.requested },
  { value: "confirmed", label: RESERVATION_STATUS_LABEL.confirmed },
  { value: "cancelled", label: RESERVATION_STATUS_LABEL.cancelled },
];

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; range?: string }>;
}) {
  const sp = await searchParams;
  const status = (FILTERS.find((f) => f.value === sp.status)?.value ?? "all") as
    | ReservationStatus
    | "all";
  /* 기본은 앞으로의 예약만. 지난 것까지 보려면 range=all */
  const upcomingOnly = sp.range !== "all";

  const [reservations, all] = await Promise.all([
    listReservations({ status, upcomingOnly }),
    listReservations({ upcomingOnly }),
  ]);

  const counts = {
    all: all.length,
    requested: all.filter((r) => r.status === "requested").length,
    confirmed: all.filter((r) => r.status === "confirmed").length,
    cancelled: all.filter((r) => r.status === "cancelled").length,
  };

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-navy-900">회의실 예약</h1>
        <p className="mt-2 text-md text-ink-600">
          메인 화면에서 들어온 대회의실·소회의실 대여 신청입니다. 확정을 누르면 같은 시간에 다른
          신청이 들어오지 않습니다.
        </p>
      </div>

      <form method="get" className="mt-8 flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-full bg-surface p-1">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="submit"
              name="status"
              value={f.value}
              aria-pressed={status === f.value}
              className={`rounded-full px-4 py-2 text-base font-semibold transition-colors ${
                status === f.value ? "bg-navy-900 text-white" : "text-ink-600 hover:text-brand-600"
              }`}
            >
              {f.label}
              <span className="ml-1.5 tabular-nums opacity-70">{counts[f.value]}</span>
            </button>
          ))}
        </div>

      </form>

      {/* 지난 예약은 평소에 볼 일이 없어 기본으로 감춘다.
          갈래 단추와 같은 폼에 두면 status 가 두 번 실려 가므로 링크로 둔다. */}
      <Link
        href={`/admin/rooms?status=${status}${upcomingOnly ? "&range=all" : ""}`}
        className="mt-3 inline-block rounded-full px-4 py-2 text-base font-semibold text-ink-600 ring-1 ring-line transition-colors hover:bg-surface"
      >
        {upcomingOnly ? "지난 예약도 보기" : "앞으로의 예약만 보기"}
      </Link>

      <ReservationList reservations={reservations} />
    </>
  );
}
