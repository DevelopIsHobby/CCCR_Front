"use client";

import { useActionState, useState } from "react";
import { deleteBlock, saveBlock, type ReservationState } from "@/lib/db/room-actions";
import { ROOMS, ROOM_LABEL, timeOptions, type RoomBlock } from "@/lib/room-types";
import { formatDate } from "@/lib/format";

const input =
  "w-full rounded-md border border-line bg-white px-4 py-3 text-md outline-none transition-colors focus:border-brand-500";

const SLOTS = timeOptions();

/*
  조합이 회의실을 직접 쓰는 시간.
  여기에 잡아 두면 예약이 없어도 신청 화면의 시간 목록에서 빠지고,
  그래도 밀어 넣으면 서버가 막는다.
*/
export default function RoomBlockEditor({ blocks }: { blocks: RoomBlock[] }) {
  const [adding, setAdding] = useState(false);
  const [state, action, pending] = useActionState<ReservationState, FormData>(
    async (prev, formData) => {
      const result = await saveBlock(prev, formData);
      if (result.ok) setAdding(false);
      return result;
    },
    {},
  );

  const today = new Date().toISOString().slice(0, 10);

  return (
    <section className="mt-14">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-navy-900 pb-4">
        <div>
          <h2 className="text-xl font-bold text-navy-900">조합 내부 사용</h2>
          <p className="mt-1.5 text-base text-ink-600">
            조합이 직접 쓰는 시간입니다. 잡아 두면 신청 화면에서 그 시간을 아예 고를 수 없습니다.
          </p>
        </div>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="rounded-full px-5 py-2.5 text-base font-bold text-navy-900 ring-1 ring-line transition-colors hover:bg-surface"
          >
            + 시간 잡기
          </button>
        )}
      </div>

      {adding && (
        <form action={action} className="mt-6 space-y-4 rounded-xl bg-surface p-6">
          <div className="grid gap-4 sm:grid-cols-4">
            <label className="block">
              <span className="mb-1.5 block text-base font-bold text-navy-900">회의실</span>
              <select name="room" defaultValue="large" className={input}>
                {ROOMS.map((r) => (
                  <option key={r.slug} value={r.slug}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-base font-bold text-navy-900">날짜</span>
              <input name="useDate" type="date" required min={today} className={input} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-base font-bold text-navy-900">시작</span>
              <select name="startTime" required defaultValue="" className={input}>
                <option value="">고르기</option>
                {SLOTS.slice(0, -1).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-base font-bold text-navy-900">종료</span>
              <select name="endTime" required defaultValue="" className={input}>
                <option value="">고르기</option>
                {SLOTS.slice(1).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-base font-bold text-navy-900">
              메모 <span className="font-medium text-ink-400">(선택)</span>
            </span>
            <input name="memo" placeholder="이사회, 내부 교육 등" className={input} />
            <span className="mt-1.5 block text-sm text-ink-400">
              신청 화면에도 이 메모가 보입니다. 비워 두면 &ldquo;조합 내부 사용&rdquo;으로 나옵니다.
            </span>
          </label>

          {state.error && (
            <p role="alert" className="rounded-md bg-flame-100 px-4 py-3 text-base font-medium text-flame-700">
              {state.error}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="rounded px-2.5 py-1.5 text-sm font-semibold text-ink-600 ring-1 ring-line transition-colors hover:bg-white"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-full bg-navy-900 px-6 py-2.5 text-base font-bold text-white transition-colors hover:bg-brand-600 disabled:opacity-60"
            >
              {pending ? "저장 중…" : "시간 잡기"}
            </button>
          </div>
        </form>
      )}

      <ul className="mt-6">
        {blocks.length === 0 && (
          <li className="border-b border-line py-10 text-center text-md text-ink-400">
            잡아 둔 내부 사용 시간이 없습니다.
          </li>
        )}
        {blocks.map((b) => (
          <li
            key={b.id}
            className="flex flex-wrap items-center gap-3 border-b border-line py-3"
          >
            <span className="w-20 shrink-0 text-md font-bold text-navy-900">
              {ROOM_LABEL[b.room]}
            </span>
            <span className="label-mono tabular-nums text-brand-600">
              {formatDate(b.useDate)} {b.startTime}~{b.endTime}
            </span>
            <span className="min-w-0 flex-1 text-base text-ink-600">{b.memo}</span>

            <form
              action={deleteBlock}
              onSubmit={(e) => {
                if (!confirm("이 시간을 풀까요? 그 시간에 예약을 받을 수 있게 됩니다.")) {
                  e.preventDefault();
                }
              }}
            >
              <input type="hidden" name="id" value={b.id} />
              <button
                type="submit"
                className="rounded px-2.5 py-1.5 text-sm font-semibold text-flame-700 ring-1 ring-flame-500/40 transition-colors hover:bg-flame-100"
              >
                풀기
              </button>
            </form>
          </li>
        ))}
      </ul>
    </section>
  );
}
