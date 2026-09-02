"use client";

import { useActionState, useState, useTransition } from "react";
import {
  deleteAboutCard,
  reorderAboutCards,
  saveAboutCard,
  type AboutState,
} from "@/lib/db/about-actions";
import type { AboutCard, CardSection } from "@/lib/about-content-types";

const input =
  "w-full rounded-md border border-line px-4 py-3 text-md outline-none transition-colors focus:border-brand-500";
const smallBtn =
  "rounded px-2.5 py-1.5 text-sm font-semibold text-ink-600 ring-1 ring-line transition-colors hover:bg-surface";

function CardForm({
  section,
  card,
  titleLabel,
  bodyLabel,
  onDone,
}: {
  section: CardSection;
  card?: AboutCard;
  titleLabel: string;
  bodyLabel: string;
  onDone?: () => void;
}) {
  const [state, action, pending] = useActionState<AboutState, FormData>(async (prev, formData) => {
    const result = await saveAboutCard(prev, formData);
    if (result.ok) onDone?.();
    return result;
  }, {});

  return (
    <form action={action} className="space-y-4 rounded-xl bg-surface p-5">
      <input type="hidden" name="section" value={section} />
      {card && <input type="hidden" name="id" value={card.id} />}

      <label className="block">
        <span className="mb-1.5 block text-base font-bold text-navy-900">{titleLabel}</span>
        <input name="title" defaultValue={card?.title ?? ""} required className={input} />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-base font-bold text-navy-900">{bodyLabel}</span>
        <textarea
          name="body"
          rows={3}
          defaultValue={card?.body ?? ""}
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
          {pending ? "저장 중…" : card ? "수정" : "추가"}
        </button>
      </div>
    </form>
  );
}

function CardRow({
  card,
  titleLabel,
  bodyLabel,
  dragging,
  onDragStart,
  onDragEnter,
  onDragEnd,
}: {
  card: AboutCard;
  titleLabel: string;
  bodyLabel: string;
  dragging: boolean;
  onDragStart: () => void;
  onDragEnter: () => void;
  onDragEnd: () => void;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <li className="border-b border-line py-3">
        <CardForm
          section={card.section}
          card={card}
          titleLabel={titleLabel}
          bodyLabel={bodyLabel}
          onDone={() => setEditing(false)}
        />
      </li>
    );
  }

  return (
    <li
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", String(card.id));
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

      <div className="min-w-0 flex-1">
        <p className="text-md font-bold text-navy-900">{card.title}</p>
        {card.body && <p className="mt-1 text-base leading-relaxed text-ink-600">{card.body}</p>}
      </div>

      <span className="flex shrink-0 items-start gap-1.5">
        <button type="button" onClick={() => setEditing(true)} className={smallBtn}>
          수정
        </button>
        <form
          action={deleteAboutCard}
          onSubmit={(e) => {
            if (!confirm(`${card.title}을(를) 지울까요?`)) e.preventDefault();
          }}
        >
          <input type="hidden" name="id" value={card.id} />
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

export default function AboutCardEditor({
  section,
  heading,
  desc,
  titleLabel,
  bodyLabel,
  addLabel,
  cards,
}: {
  section: CardSection;
  heading: string;
  desc: string;
  titleLabel: string;
  bodyLabel: string;
  addLabel: string;
  cards: AboutCard[];
}) {
  const [adding, setAdding] = useState(false);
  const [order, setOrder] = useState(cards);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [, startSaving] = useTransition();

  /* 서버에서 새 목록이 오면 그것으로 맞춘다 (렌더 중 조정) */
  const [lastCards, setLastCards] = useState(cards);
  if (lastCards !== cards) {
    setLastCards(cards);
    setOrder(cards);
  }

  const moveTo = (targetId: number) => {
    if (draggingId === null || draggingId === targetId) return;

    setOrder((prev) => {
      const from = prev.findIndex((c) => c.id === draggingId);
      const to = prev.findIndex((c) => c.id === targetId);
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

    const ids = order.map((c) => c.id);
    if (cards.every((c, i) => c.id === ids[i])) return;

    startSaving(async () => {
      await reorderAboutCards(section, ids);
    });
  };

  return (
    <section className="mt-6 rounded-xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(6,42,85,0.04)] lg:p-6">
      <div className="-mx-5 -mt-5 mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-line px-5 pb-4 pt-5 lg:-mx-6 lg:-mt-6 lg:px-6 lg:pt-6">
        <div>
          <h2 className="text-xl font-bold text-navy-900">{heading}</h2>
          <p className="mt-1.5 text-base text-ink-600">{desc}</p>
        </div>
        <span className="data-line text-ink-400">{cards.length}개 · 끌어서 순서 변경</span>
      </div>

      <ul>
        {order.length === 0 && (
          <li className="border-b border-line py-10 text-center text-md text-ink-400">
            등록된 항목이 없습니다.
          </li>
        )}
        {order.map((card) => (
          <CardRow
            key={card.id}
            card={card}
            titleLabel={titleLabel}
            bodyLabel={bodyLabel}
            dragging={draggingId === card.id}
            onDragStart={() => setDraggingId(card.id)}
            onDragEnter={() => moveTo(card.id)}
            onDragEnd={commit}
          />
        ))}
      </ul>

      {adding ? (
        <div className="mt-5">
          <CardForm
            section={section}
            titleLabel={titleLabel}
            bodyLabel={bodyLabel}
            onDone={() => setAdding(false)}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-5 rounded-full px-5 py-2.5 text-base font-bold text-navy-900 ring-1 ring-line transition-colors hover:bg-surface"
        >
          + {addLabel}
        </button>
      )}
    </section>
  );
}
