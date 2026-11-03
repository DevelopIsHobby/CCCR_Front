"use client";

import { useActionState, useState } from "react";
import {
  deleteCalendarEvent,
  saveCalendarEvent,
  type CalendarFormState,
} from "@/lib/db/calendar-actions";
import type { CustomEvent } from "@/lib/db/calendar";

/*
  직접 넣는 일정(조합 일정) 편집기. 게시글이 없는 일정 — 정기총회·이사회·휴무 같은 것.
  하루짜리는 종료일을 비우면 된다.
*/

const input =
  "w-full rounded-md border border-line bg-white px-4 py-3 text-md outline-none transition-colors placeholder:text-ink-400 focus:border-brand-500";
const smallBtn =
  "rounded px-2.5 py-1.5 text-sm font-semibold text-ink-600 ring-1 ring-line transition-colors hover:bg-surface";

const range = (e: CustomEvent) =>
  e.startsOn === e.endsOn
    ? e.startsOn.replace(/-/g, ".")
    : `${e.startsOn.replace(/-/g, ".")} ~ ${e.endsOn.replace(/-/g, ".")}`;

function EventForm({
  event,
  onDone,
  onCancel,
}: {
  event?: CustomEvent;
  /** 저장이 끝났을 때 */
  onDone?: () => void;
  /** 고치다 그만둘 때(고치기 칸에만 있다) */
  onCancel?: () => void;
}) {
  const [state, action, pending] = useActionState<CalendarFormState, FormData>(
    async (prev, formData) => {
      const result = await saveCalendarEvent(prev, formData);
      if (result.ok) onDone?.();
      return result;
    },
    {},
  );

  return (
    <form action={action} className="space-y-4 rounded-xl bg-surface p-5">
      {event && <input type="hidden" name="id" value={event.id} />}
      <label className="block">
        <span className="mb-1.5 block text-base font-bold text-navy-900">일정 이름</span>
        <input
          name="title"
          required
          maxLength={100}
          defaultValue={event?.title ?? ""}
          placeholder="예: 2026년 정기총회"
          className={input}
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-base font-bold text-navy-900">시작일</span>
          <input
            type="date"
            name="startsOn"
            required
            defaultValue={event?.startsOn ?? ""}
            className={input}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-base font-bold text-navy-900">
            종료일{" "}
            <span className="text-sm font-normal text-ink-400">(하루짜리는 비워 두세요)</span>
          </span>
          <input
            type="date"
            name="endsOn"
            defaultValue={event && event.endsOn !== event.startsOn ? event.endsOn : ""}
            className={input}
          />
        </label>
      </div>
      <label className="block">
        <span className="mb-1.5 block text-base font-bold text-navy-900">
          링크 <span className="text-sm font-normal text-ink-400">(선택)</span>
        </span>
        <input
          name="href"
          defaultValue={event?.href ?? ""}
          placeholder="/board/notice/12 또는 https://..."
          className={input}
        />
        <span className="mt-1.5 block text-sm text-ink-400">
          달력에서 이 일정을 누르면 가는 곳입니다. 비우면 행사정보 게시판으로 갑니다.
        </span>
      </label>

      {state.error && (
        <p
          role="alert"
          className="rounded-md bg-flame-100 px-4 py-3 text-base font-medium text-flame-700"
        >
          {state.error}
        </p>
      )}

      <div className="flex justify-end gap-2">
        {onCancel && (
          <button type="button" onClick={onCancel} className={smallBtn}>
            취소
          </button>
        )}
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-navy-900 px-6 py-2.5 text-base font-bold text-white transition-colors hover:bg-brand-600 disabled:opacity-60"
        >
          {pending ? "저장 중…" : event ? "수정" : "일정 추가"}
        </button>
      </div>
    </form>
  );
}

function EventRow({ event }: { event: CustomEvent }) {
  const [editing, setEditing] = useState(false);
  if (editing) {
    return (
      <li className="border-b border-line py-4">
        <EventForm
          event={event}
          onDone={() => setEditing(false)}
          onCancel={() => setEditing(false)}
        />
      </li>
    );
  }
  return (
    <li className="flex flex-wrap items-center gap-3 border-b border-line py-4">
      <span className="label-mono w-48 shrink-0 tabular-nums text-ink-600">{range(event)}</span>
      <span className="min-w-0 flex-1 text-md font-semibold text-navy-900">{event.title}</span>
      <div className="flex shrink-0 gap-1.5">
        <button type="button" onClick={() => setEditing(true)} className={smallBtn}>
          수정
        </button>
        <form
          action={deleteCalendarEvent}
          onSubmit={(e) => {
            if (!confirm(`'${event.title}' 일정을 지울까요?`)) e.preventDefault();
          }}
        >
          <input type="hidden" name="id" value={event.id} />
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

export default function CalendarEventEditor({ events }: { events: CustomEvent[] }) {
  /* 저장이 끝나면 새 칸을 비우도록 매번 새로 그린다 */
  const [formKey, setFormKey] = useState(0);
  return (
    <div>
      <ul>
        {events.length === 0 && (
          <li className="border-b border-line py-8 text-center text-md text-ink-400">
            직접 넣은 일정이 없습니다.
          </li>
        )}
        {events.map((e) => (
          <EventRow key={e.id} event={e} />
        ))}
      </ul>
      <div className="mt-5">
        <EventForm key={formKey} onDone={() => setFormKey((k) => k + 1)} />
      </div>
    </div>
  );
}
