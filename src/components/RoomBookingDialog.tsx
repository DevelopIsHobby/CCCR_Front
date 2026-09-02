"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { IconClose } from "./Icons";
import {
  getDaySlots,
  requestReservation,
  type ReservationState,
} from "@/lib/db/room-actions";
import {
  RESERVATION_STATUS_LABEL,
  ROOMS,
  type ReservationStatus,
  type RoomSlug,
} from "@/lib/room-types";

const input =
  "w-full rounded-md border border-line bg-white px-4 py-3 text-md outline-none transition-colors placeholder:text-ink-400 focus:border-brand-500";

type Slot = { startTime: string; endTime: string; status: ReservationStatus };

/*
  회의실 대여 예약 팝업.
  메뉴를 따로 두지 않고 메인에서 바로 연다.
  회의실과 날짜를 고르면 그 날 이미 잡힌 시간을 먼저 보여 준다.
  헛걸음하는 신청을 줄이려는 것이고, 겹치면 서버에서 한 번 더 막는다.
*/
export default function RoomBookingDialog() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDialogElement>(null);
  const [state, action, pending] = useActionState<ReservationState, FormData>(
    requestReservation,
    {},
  );

  const [room, setRoom] = useState<RoomSlug>("large");
  const [useDate, setUseDate] = useState("");

  /*
    가져온 일정은 어느 회의실·어느 날 것인지 함께 담아 둔다.
    회의실이나 날짜를 바꾸면 키가 어긋나 저절로 '확인 중'으로 돌아간다.
  */
  const [loaded, setLoaded] = useState<{ key: string; rows: Slot[] } | null>(null);
  const key = `${room}|${useDate}`;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  /* 회의실·날짜가 정해지면 그 날 잡힌 시간을 가져온다 */
  useEffect(() => {
    if (!open || !useDate) return;

    let cancelled = false;
    getDaySlots(room, useDate).then((rows) => {
      if (!cancelled) setLoaded({ key: `${room}|${useDate}`, rows });
    });

    return () => {
      cancelled = true;
    };
  }, [open, room, useDate]);

  /* 지금 고른 회의실·날짜의 일정. 아직 못 가져왔으면 null 이다. */
  const slots = loaded?.key === key ? loaded.rows : null;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full bg-navy-900 px-7 py-3 text-base font-bold text-white transition-colors hover:bg-brand-600"
      >
        회의실 예약하기
      </button>

      <dialog
        ref={ref}
        onClose={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === ref.current) setOpen(false);
        }}
        className="m-auto w-[min(720px,92vw)] rounded-xl p-0 backdrop:bg-navy-950/60 open:flex open:max-h-[88vh] open:flex-col"
        aria-label="회의실 예약"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-line bg-surface px-7 py-5">
          <div>
            <p className="data-line text-flame-600">회의실 대여</p>
            <p className="mt-1.5 text-lg font-bold text-navy-900">이용하실 날짜를 골라 주세요</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="닫기"
            className="grid size-10 shrink-0 place-items-center rounded-full text-ink-400 transition-colors hover:bg-white hover:text-navy-900"
          >
            <IconClose className="size-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-white px-7 py-7">
          {state.ok ? (
            <div className="py-10 text-center">
              <p className="text-lg font-bold text-navy-900">{state.ok}</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="mt-7 rounded-full bg-navy-900 px-7 py-3 text-base font-bold text-white transition-colors hover:bg-brand-600"
              >
                닫기
              </button>
            </div>
          ) : (
            <form action={action} className="space-y-4">
              {/* 사람은 보지 못하는 칸. 자동 입력을 거르는 데 쓴다. */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden
                className="hidden"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-base font-bold text-navy-900">회의실</span>
                  <select
                    name="room"
                    value={room}
                    onChange={(e) => setRoom(e.target.value as RoomSlug)}
                    className={input}
                  >
                    {ROOMS.map((r) => (
                      <option key={r.slug} value={r.slug}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-base font-bold text-navy-900">이용일</span>
                  <input
                    name="useDate"
                    type="date"
                    required
                    min={today}
                    value={useDate}
                    onChange={(e) => setUseDate(e.target.value)}
                    className={input}
                  />
                </label>
              </div>

              {/* 고른 날에 이미 잡힌 시간 */}
              {useDate && (
                <div className="rounded-lg bg-surface px-5 py-4">
                  {slots === null ? (
                    <p className="text-base text-ink-400">잡힌 일정을 확인하는 중…</p>
                  ) : slots.length === 0 ? (
                    <p className="text-base font-medium text-brand-700">
                      이 날은 아직 잡힌 일정이 없습니다.
                    </p>
                  ) : (
                    <>
                      <p className="text-base font-bold text-navy-900">이미 잡힌 시간</p>
                      <ul className="mt-2 flex flex-wrap gap-2">
                        {slots.map((s) => (
                          <li
                            key={`${s.startTime}-${s.endTime}`}
                            className="label-mono rounded bg-white px-2.5 py-1 text-sm tabular-nums text-ink-600 ring-1 ring-line"
                          >
                            {s.startTime}~{s.endTime}
                            <span className="ml-1.5 text-ink-400">
                              {RESERVATION_STATUS_LABEL[s.status]}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-3">
                <label className="block">
                  <span className="mb-1.5 block text-base font-bold text-navy-900">시작</span>
                  <input name="startTime" type="time" required step={600} className={input} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-base font-bold text-navy-900">종료</span>
                  <input name="endTime" type="time" required step={600} className={input} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-base font-bold text-navy-900">인원</span>
                  <input
                    name="headcount"
                    type="number"
                    min={1}
                    max={500}
                    placeholder="20"
                    className={input}
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-base font-bold text-navy-900">
                    단체 · 회사명
                  </span>
                  <input name="org" required className={input} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-base font-bold text-navy-900">신청자</span>
                  <input name="name" required className={input} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-base font-bold text-navy-900">이메일</span>
                  <input name="email" type="email" required className={input} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-base font-bold text-navy-900">
                    연락처 <span className="font-medium text-ink-400">(선택)</span>
                  </span>
                  <input name="tel" className={input} />
                </label>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-base font-bold text-navy-900">
                  사용 목적 <span className="font-medium text-ink-400">(선택)</span>
                </span>
                <textarea
                  name="purpose"
                  rows={3}
                  placeholder="회의 성격, 필요한 장비 등을 적어 주세요."
                  className={`${input} leading-relaxed`}
                />
              </label>

              {state.error && (
                <p role="alert" className="rounded-md bg-flame-100 px-4 py-3 text-base font-medium text-flame-700">
                  {state.error}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                <p className="text-sm leading-relaxed text-ink-400">
                  신청 후 사무국 확인을 거쳐 예약이 확정됩니다.
                </p>
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-full bg-navy-900 px-7 py-3 text-base font-bold text-white transition-colors hover:bg-brand-600 disabled:opacity-60"
                >
                  {pending ? "보내는 중…" : "예약 신청"}
                </button>
              </div>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}
