"use client";

import PrefilledNote from "./PrefilledNote";
import ConsentCheck from "./ConsentCheck";

import Link from "next/link";

import { EMPTY_APPLICANT, type Applicant } from "@/lib/applicant-types";

import { useActionState, useEffect, useRef, useState } from "react";
import { IconClose } from "./Icons";
import {
  getBusySlots,
  requestReservation,
  type ReservationState,
} from "@/lib/db/room-actions";
import {
  isEndBlocked,
  isStartBlocked,
  ROOMS,
  timeOptions,
  type BusySlot,
  type RoomSlug,
} from "@/lib/room-types";

const input =
  "w-full rounded-md border border-line bg-white px-4 py-3 text-md outline-none transition-colors placeholder:text-ink-400 focus:border-brand-500";

const SLOTS = timeOptions();

/*
  회의실 대여 예약 팝업.
  메뉴를 따로 두지 않고 메인에서 바로 연다.

  회의실과 날짜를 고르면 쓸 수 없는 시간을 목록에서 아예 빼 버린다.
  고를 수 없는 시간을 남겨 두면 눌러 보고 나서야 안 된다는 것을 알게 된다.
  다른 사람의 예약뿐 아니라 조합이 직접 쓰는 시간도 함께 뺀다.
  그래도 서버에서 한 번 더 막는다.
*/
export default function RoomBookingDialog({ me = EMPTY_APPLICANT }: { me?: Applicant }) {
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
  const [loaded, setLoaded] = useState<{ key: string; rows: BusySlot[] } | null>(null);
  const key = `${room}|${useDate}`;

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

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
    getBusySlots(room, useDate).then((rows) => {
      if (!cancelled) setLoaded({ key: `${room}|${useDate}`, rows });
    });

    return () => {
      cancelled = true;
    };
  }, [open, room, useDate]);

  /* 지금 고른 회의실·날짜의 일정. 아직 못 가져왔으면 null 이다. */
  const busy = loaded?.key === key ? loaded.rows : null;
  const today = new Date().toISOString().slice(0, 10);

  /* 고를 수 있는 시각만 남긴다. 마지막 칸은 시작이 될 수 없다. */
  const startChoices = SLOTS.slice(0, -1).filter((t) => !busy || !isStartBlocked(t, busy));
  const endChoices = startTime
    ? SLOTS.filter((t) => t > startTime && (!busy || !isEndBlocked(startTime, t, busy)))
    : [];

  /* 회의실·날짜를 바꾸면 못 쓰게 된 시간이 남아 있을 수 있다 */
  if (startTime && busy && !startChoices.includes(startTime)) {
    setStartTime("");
    setEndTime("");
  } else if (endTime && startTime && busy && !endChoices.includes(endTime)) {
    setEndTime("");
  }

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
              {state.ref && (
                <div className="mt-5 rounded-lg border border-line bg-surface px-4 py-3 text-left">
                  <p className="text-sm text-ink-400">접수번호</p>
                  <p className="label-mono mt-0.5 text-lg font-bold text-navy-900">{state.ref}</p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-600">
                    {state.mailed && "확인 메일을 보내드렸습니다. "}이 번호로{" "}
                    <Link href="/participate/status" className="font-bold text-brand-600 underline underline-offset-2">
                      신청 현황
                    </Link>
                    을 확인하실 수 있습니다.
                  </p>
                </div>
              )}
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

              {/* 고른 날에 쓸 수 없는 시간 */}
              {useDate && (
                <div className="rounded-lg bg-surface px-5 py-4">
                  {busy === null ? (
                    <p className="text-base text-ink-400">잡힌 일정을 확인하는 중…</p>
                  ) : busy.length === 0 ? (
                    <p className="text-base font-medium text-brand-700">
                      이 날은 하루 종일 비어 있습니다.
                    </p>
                  ) : (
                    <>
                      <p className="text-base font-bold text-navy-900">쓸 수 없는 시간</p>
                      <ul className="mt-2 flex flex-wrap gap-2">
                        {busy.map((s) => (
                          <li
                            key={`${s.kind}-${s.startTime}-${s.endTime}`}
                            className={`label-mono rounded px-2.5 py-1 text-sm tabular-nums ring-1 ${
                              s.kind === "internal"
                                ? "bg-navy-900 text-white ring-navy-900"
                                : "bg-white text-ink-600 ring-line"
                            }`}
                          >
                            {s.startTime}~{s.endTime}
                            <span
                              className={`ml-1.5 ${
                                s.kind === "internal" ? "text-brand-200" : "text-ink-400"
                              }`}
                            >
                              {s.kind === "internal" ? `조합 사용 · ${s.label}` : s.label}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-2.5 text-sm text-ink-400">
                        아래 시간 목록에서는 이 시간대가 빠져 있습니다.
                      </p>
                    </>
                  )}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-3">
                <label className="block">
                  <span className="mb-1.5 block text-base font-bold text-navy-900">시작</span>
                  <select
                    name="startTime"
                    required
                    value={startTime}
                    onChange={(e) => {
                      setStartTime(e.target.value);
                      setEndTime("");
                    }}
                    disabled={!useDate}
                    className={`${input} disabled:bg-surface disabled:text-ink-400`}
                  >
                    <option value="">{useDate ? "고르기" : "날짜 먼저"}</option>
                    {startChoices.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-base font-bold text-navy-900">종료</span>
                  <select
                    name="endTime"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    disabled={!startTime}
                    className={`${input} disabled:bg-surface disabled:text-ink-400`}
                  >
                    <option value="">{startTime ? "고르기" : "시작 먼저"}</option>
                    {endChoices.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
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

              <PrefilledNote me={me} />

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-base font-bold text-navy-900">
                    단체 · 회사명
                  </span>
                  <input name="org" required defaultValue={me.org} className={input} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-base font-bold text-navy-900">신청자</span>
                  <input name="name" required defaultValue={me.name} className={input} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-base font-bold text-navy-900">이메일</span>
                  <input name="email" type="email" required defaultValue={me.email} className={input} />
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

              <ConsentCheck
                items="단체·회사명, 신청자 성명, 이메일주소, 이용일시 (선택: 연락처, 이용 인원, 사용 목적)"
                purpose="회의실 예약 접수와 확정 안내, 이용 당일 연락"
                keep="이용일부터 1년"
              />

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
