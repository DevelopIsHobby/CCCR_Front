"use client";

import { useActionState, useState, useTransition } from "react";
import {
  deleteHistoryEntry,
  reorderHistoryEntries,
  saveHistoryEntry,
  type AboutState,
} from "@/lib/db/about-actions";
import type { HistoryEntry } from "@/lib/about-content-types";

const input =
  "w-full rounded-md border border-line px-4 py-3 text-md outline-none transition-colors focus:border-brand-500";
const smallBtn =
  "rounded px-2.5 py-1.5 text-sm font-semibold text-ink-600 ring-1 ring-line transition-colors hover:bg-surface";

function EntryForm({
  year,
  entry,
  onDone,
}: {
  year: string;
  entry?: HistoryEntry;
  onDone?: () => void;
}) {
  const [state, action, pending] = useActionState<AboutState, FormData>(async (prev, formData) => {
    const result = await saveHistoryEntry(prev, formData);
    if (result.ok) onDone?.();
    return result;
  }, {});

  return (
    <form action={action} className="space-y-4 rounded-xl bg-surface p-5">
      {entry && <input type="hidden" name="id" value={entry.id} />}

      <div className="grid gap-4 sm:grid-cols-[160px_120px_1fr]">
        <label className="block">
          <span className="mb-1.5 block text-base font-bold text-navy-900">연도</span>
          <input name="year" defaultValue={entry?.year ?? year} required className={input} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-base font-bold text-navy-900">월</span>
          <input
            name="month"
            defaultValue={entry?.month ?? ""}
            placeholder="03"
            required
            className={input}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-base font-bold text-navy-900">장소 (없으면 빈칸)</span>
          <input name="place" defaultValue={entry?.place ?? ""} className={input} />
        </label>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-base font-bold text-navy-900">내용</span>
        <textarea
          name="title"
          rows={2}
          defaultValue={entry?.title ?? ""}
          required
          className={`${input} leading-relaxed`}
        />
      </label>

      {state.error && (
        <p role="alert" className="rounded-md bg-flame-100 px-4 py-3 text-base font-medium text-flame-700">
          {state.error}
        </p>
      )}

      <div className="flex justify-end gap-2">
        {onDone && (
          <button type="button" onClick={onDone} className={smallBtn}>
            취소
          </button>
        )}
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-navy-900 px-6 py-2.5 text-base font-bold text-white transition-colors hover:bg-brand-600 disabled:opacity-60"
        >
          {pending ? "저장 중…" : entry ? "수정" : "추가"}
        </button>
      </div>
    </form>
  );
}

function EntryRow({
  entry,
  dragging,
  onDragStart,
  onDragEnter,
  onDragEnd,
}: {
  entry: HistoryEntry;
  dragging: boolean;
  onDragStart: () => void;
  onDragEnter: () => void;
  onDragEnd: () => void;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <li className="border-b border-line py-3">
        <EntryForm year={entry.year} entry={entry} onDone={() => setEditing(false)} />
      </li>
    );
  }

  return (
    <li
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", String(entry.id));
        onDragStart();
      }}
      onDragEnter={onDragEnter}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        onDragEnd();
      }}
      onDragEnd={onDragEnd}
      className={`flex cursor-grab gap-3 border-b border-line py-3 transition-colors active:cursor-grabbing ${
        dragging ? "opacity-40" : ""
      }`}
    >
      <span aria-hidden className="shrink-0 select-none px-1 pt-0.5 text-ink-400">
        ⠿
      </span>
      <span className="label-mono w-16 shrink-0 pt-0.5 tabular-nums text-brand-600">
        {entry.month}
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-md leading-relaxed text-ink-900">{entry.title}</p>
        {entry.place && <p className="mt-1 text-sm text-ink-400">{entry.place}</p>}
      </div>

      <span className="flex shrink-0 items-start gap-1.5">
        <button type="button" onClick={() => setEditing(true)} className={smallBtn}>
          수정
        </button>
        <form
          action={deleteHistoryEntry}
          onSubmit={(e) => {
            if (!confirm("이 연혁을 지울까요?")) e.preventDefault();
          }}
        >
          <input type="hidden" name="id" value={entry.id} />
          <button
            type="submit"
            className="rounded px-2.5 py-1.5 text-sm font-semibold text-flame-700 ring-1 ring-flame-500/40 transition-colors hover:bg-flame-100"
          >
            삭제
          </button>
        </form>
      </span>
    </li>
  );
}

export default function HistoryEditor({
  year,
  entries,
}: {
  year: string;
  entries: HistoryEntry[];
}) {
  const [adding, setAdding] = useState(false);
  const [order, setOrder] = useState(entries);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [, startSaving] = useTransition();

  const [lastEntries, setLastEntries] = useState(entries);
  if (lastEntries !== entries) {
    setLastEntries(entries);
    setOrder(entries);
  }

  const moveTo = (targetId: number) => {
    if (draggingId === null || draggingId === targetId) return;

    setOrder((prev) => {
      const from = prev.findIndex((e) => e.id === draggingId);
      const to = prev.findIndex((e) => e.id === targetId);
      if (from < 0 || to < 0) return prev;

      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const commit = () => {
    if (draggingId === null) return;
    setDraggingId(null);

    const ids = order.map((e) => e.id);
    if (entries.every((e, i) => e.id === ids[i])) return;

    startSaving(async () => {
      await reorderHistoryEntries(ids);
    });
  };

  return (
    <section className="mt-6 rounded-xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(6,42,85,0.04)] lg:p-6">
      <div className="-mx-5 -mt-5 mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-line px-5 pb-4 pt-5 lg:-mx-6 lg:-mt-6 lg:px-6 lg:pt-6">
        <h2 className="text-xl font-bold text-navy-900">{year}</h2>
        <span className="data-line text-ink-400">{entries.length}건 · 끌어서 순서 변경</span>
      </div>

      <ul>
        {order.length === 0 && (
          <li className="border-b border-line py-10 text-center text-md text-ink-400">
            이 연도에 등록된 연혁이 없습니다.
          </li>
        )}
        {order.map((entry) => (
          <EntryRow
            key={entry.id}
            entry={entry}
            dragging={draggingId === entry.id}
            onDragStart={() => setDraggingId(entry.id)}
            onDragEnter={() => moveTo(entry.id)}
            onDragEnd={commit}
          />
        ))}
      </ul>

      {adding ? (
        <div className="mt-5">
          <EntryForm year={year} onDone={() => setAdding(false)} />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-5 rounded-full px-5 py-2.5 text-base font-bold text-navy-900 ring-1 ring-line transition-colors hover:bg-surface"
        >
          + {year} 연혁 추가
        </button>
      )}
    </section>
  );
}
