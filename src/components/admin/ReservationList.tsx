"use client";

import { useState, useTransition } from "react";
import { deleteReservation, setReservationStatus } from "@/lib/db/room-actions";
import {
  RESERVATION_STATUS_LABEL,
  ROOM_LABEL,
  type ReservationStatus,
  type RoomReservation,
} from "@/lib/room-types";
import { formatDate } from "@/lib/format";

const STATUS_TONE: Record<ReservationStatus, string> = {
  requested: "bg-flame-500 text-white",
  confirmed: "bg-brand-600 text-white",
  cancelled: "bg-surface text-ink-400",
};

const smallBtn =
  "rounded px-2.5 py-1.5 text-sm font-semibold text-ink-600 ring-1 ring-line transition-colors hover:bg-white";

function ReservationCard({ reservation }: { reservation: RoomReservation }) {
  const [pending, startSaving] = useTransition();
  const [error, setError] = useState("");

  const move = (status: ReservationStatus) =>
    startSaving(async () => {
      const result = await setReservationStatus(reservation.id, status);
      setError(result?.error ?? "");
    });

  return (
    <li className="rounded-xl border border-line bg-white">
      <div className="flex flex-wrap items-start gap-4 p-6">
        <span
          className={`shrink-0 rounded px-2.5 py-1 text-2xs font-bold ${STATUS_TONE[reservation.status]}`}
        >
          {RESERVATION_STATUS_LABEL[reservation.status]}
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-md font-bold text-navy-900">
            {ROOM_LABEL[reservation.room]}
            <span className="label-mono ml-3 tabular-nums text-brand-600">
              {formatDate(reservation.useDate)} {reservation.startTime}~{reservation.endTime}
            </span>
            {reservation.headcount > 0 && (
              <span className="ml-3 text-base font-medium text-ink-400">
                {reservation.headcount}명
              </span>
            )}
          </p>

          <p className="mt-1.5 text-base text-ink-600">
            {reservation.org} · {reservation.name}
            <span className="label-mono ml-3 text-ink-400">{reservation.email}</span>
            {reservation.tel && (
              <span className="label-mono ml-3 tabular-nums text-ink-400">{reservation.tel}</span>
            )}
          </p>

          {reservation.purpose && (
            <p className="mt-3 whitespace-pre-wrap rounded-lg bg-surface px-4 py-3 text-base leading-relaxed text-ink-700">
              {reservation.purpose}
            </p>
          )}

          {error && (
            <p role="alert" className="mt-3 text-base font-medium text-flame-700">
              {error}
            </p>
          )}
        </div>

        <span className="label-mono shrink-0 tabular-nums text-ink-400">
          신청 {formatDate(reservation.createdAt)}
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line bg-surface px-6 py-3">
        <a
          href={`mailto:${reservation.email}?subject=${encodeURIComponent(
            `[한국클라우드컴퓨팅연구조합] ${ROOM_LABEL[reservation.room]} 예약 안내`,
          )}`}
          className="rounded px-2.5 py-1.5 text-sm font-semibold text-brand-700 ring-1 ring-brand-500/40 transition-colors hover:bg-brand-50"
        >
          메일 회신
        </a>

        {/* 이미 그 상태인 단추는 내놓지 않는다 */}
        {reservation.status !== "confirmed" && (
          <button
            type="button"
            disabled={pending}
            onClick={() => move("confirmed")}
            className={smallBtn}
          >
            예약 확정
          </button>
        )}
        {reservation.status !== "cancelled" && (
          <button
            type="button"
            disabled={pending}
            onClick={() => move("cancelled")}
            className={smallBtn}
          >
            취소 처리
          </button>
        )}
        {reservation.status !== "requested" && (
          <button
            type="button"
            disabled={pending}
            onClick={() => move("requested")}
            className={smallBtn}
          >
            신청 상태로
          </button>
        )}

        <form
          action={deleteReservation}
          onSubmit={(e) => {
            if (!confirm("이 예약 기록을 지울까요?")) e.preventDefault();
          }}
        >
          <input type="hidden" name="id" value={reservation.id} />
          <button
            type="submit"
            className="rounded px-2.5 py-1.5 text-sm font-semibold text-flame-700 ring-1 ring-flame-500/40 transition-colors hover:bg-flame-100"
          >
            삭제
          </button>
        </form>
      </div>
    </li>
  );
}

export default function ReservationList({
  reservations,
}: {
  reservations: RoomReservation[];
}) {
  if (reservations.length === 0) {
    return (
      <p className="mt-8 rounded-xl border border-line bg-surface px-6 py-20 text-center text-md text-ink-400">
        해당하는 예약이 없습니다.
      </p>
    );
  }

  return (
    <ul className="mt-8 space-y-4">
      {reservations.map((r) => (
        <ReservationCard key={r.id} reservation={r} />
      ))}
    </ul>
  );
}
