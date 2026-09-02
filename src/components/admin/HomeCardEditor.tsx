"use client";

import { useActionState, useState, useTransition } from "react";
import {
  deleteHomeCard,
  moveHomeCard,
  reorderHomeCards,
  saveHomeCard,
  toggleHomeCard,
  type HomeCardFormState,
} from "@/lib/db/home-card-actions";
import type { HomeCard, HomeCardKind } from "@/lib/db/home-cards";
import CardIcon from "@/components/CardIcon";
import { HOME_CARD_ICONS, normalizeIcon } from "@/lib/home-card-icons";

/*
  메인 화면 카드 편집기.
  종류마다 쓰는 칸이 달라 라벨과 노출 여부를 여기서 정한다.
*/
const FIELDS: Record<
  HomeCardKind,
  { label: string; title: string; body: string; caption?: string; dateText?: string; href: string }
> = {
  slide: {
    label: "분류 (예: 조합 소개)",
    title: "제목 — 줄바꿈하면 화면에서도 줄이 바뀝니다",
    body: "본문",
    caption: "하단 캡션",
    dateText: "날짜 표기 (예: 2026-08-11)",
    href: "‘자세히 보기’ 링크",
  },
  banner: {
    label: "분류 배지 (예: 법령)",
    title: "제목",
    body: "부제",
    href: "링크",
  },
  promo: {
    label: "태그 (예: 회원사 모집)",
    title: "제목",
    body: "설명",
    href: "링크",
  },
};

const input =
  "w-full rounded-md border border-line px-4 py-3 text-md outline-none transition-colors placeholder:text-ink-400 focus:border-brand-500";
const smallBtn =
  "rounded px-2.5 py-1.5 text-sm font-semibold text-ink-600 ring-1 ring-line transition-colors hover:bg-surface disabled:opacity-40";

/*
  카드에 붙일 그림 고르기.
  라디오 단추를 감춰 두고 그림 칸 자체를 눌러 고르게 한다. 고른 것만 파랗게 켜진다.
*/
function IconPicker({ defaultValue }: { defaultValue: string }) {
  const selected = normalizeIcon(defaultValue);

  return (
    <fieldset>
      <legend className="mb-1.5 block text-base font-bold text-navy-900">그림</legend>
      <p className="mb-3 text-sm text-ink-400">
        카드 왼쪽 위에 나옵니다. 자료 종류와 가까운 것을 고르세요.
      </p>

      <div className="flex flex-wrap gap-2">
        {HOME_CARD_ICONS.map((icon) => (
          <label key={icon.id} title={icon.label} className="cursor-pointer">
            <input
              type="radio"
              name="icon"
              value={icon.id}
              defaultChecked={icon.id === selected}
              className="peer sr-only"
            />
            {/* 색은 이 칸에서 정하고 그림은 currentColor 를 따라간다 */}
            <span className="flex w-[84px] flex-col items-center gap-1.5 rounded-lg border border-line bg-white px-2 py-3 text-center text-ink-400 transition-colors hover:border-brand-500 hover:text-brand-600 peer-checked:border-brand-500 peer-checked:bg-brand-50 peer-checked:text-brand-600 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-flame-500">
              <CardIcon name={icon.id} className="size-6" />
              <span className="text-2xs font-semibold leading-tight text-ink-600">
                {icon.label}
              </span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function CardForm({
  kind,
  card,
  onDone,
}: {
  kind: HomeCardKind;
  card?: HomeCard;
  onDone?: () => void;
}) {
  const fields = FIELDS[kind];
  const [state, action, pending] = useActionState<HomeCardFormState, FormData>(
    async (prev, formData) => {
      const result = await saveHomeCard(prev, formData);
      if (result.ok) onDone?.();
      return result;
    },
    {},
  );

  return (
    <form action={action} className="space-y-4 rounded-xl bg-surface p-6">
      <input type="hidden" name="kind" value={kind} />
      {card && <input type="hidden" name="id" value={card.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-base font-bold text-navy-900">{fields.label}</span>
          <input name="label" defaultValue={card?.label ?? ""} className={input} />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-base font-bold text-navy-900">{fields.href}</span>
          <input
            name="href"
            defaultValue={card?.href ?? ""}
            placeholder="/members/join 또는 https://..."
            className={input}
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-base font-bold text-navy-900">{fields.title}</span>
        {kind === "slide" ? (
          <textarea name="title" rows={2} defaultValue={card?.title ?? ""} className={input} />
        ) : (
          <input name="title" defaultValue={card?.title ?? ""} required className={input} />
        )}
      </label>

      <label className="block">
        <span className="mb-1.5 block text-base font-bold text-navy-900">{fields.body}</span>
        <textarea name="body" rows={kind === "slide" ? 3 : 2} defaultValue={card?.body ?? ""} className={input} />
      </label>

      {kind === "banner" && <IconPicker defaultValue={card?.icon ?? ""} />}

      {kind === "slide" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-base font-bold text-navy-900">{fields.caption}</span>
            <input name="caption" defaultValue={card?.caption ?? ""} className={input} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-base font-bold text-navy-900">{fields.dateText}</span>
            <input name="dateText" defaultValue={card?.dateText ?? ""} className={input} />
          </label>
        </div>
      )}

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
  isFirst,
  isLast,
  dragging,
  over,
  onDragStart,
  onDragEnter,
  onDragEnd,
}: {
  card: HomeCard;
  isFirst: boolean;
  isLast: boolean;
  dragging: boolean;
  over: boolean;
  onDragStart: () => void;
  onDragEnter: () => void;
  onDragEnd: () => void;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <li className="border-b border-line py-4">
        <CardForm kind={card.kind} card={card} onDone={() => setEditing(false)} />
      </li>
    );
  }

  return (
    <li
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        /* 파이어폭스는 데이터가 있어야 끌기가 시작된다 */
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
      className={`flex cursor-grab flex-wrap items-center gap-3 border-b border-line py-4 transition-colors active:cursor-grabbing ${
        dragging ? "opacity-40" : over ? "bg-brand-50/60" : ""
      }`}
    >
      <span
        aria-hidden
        title="끌어서 순서를 바꿉니다"
        className="shrink-0 select-none px-1 text-lg leading-none text-ink-400"
      >
        ⠿
      </span>

      {/* 배너 띠는 카드에 그림이 붙으므로 목록에서도 함께 보여 준다 */}
      {card.kind === "banner" && (
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
          <CardIcon name={card.icon} className="size-5" />
        </span>
      )}

      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2">
          {card.label && (
            <span className="inline-flex rounded bg-brand-50 px-2 py-0.5 text-2xs font-bold text-brand-700">
              {card.label}
            </span>
          )}
          {!card.isVisible && (
            <span className="inline-flex rounded bg-surface px-2 py-0.5 text-2xs font-bold text-ink-400">
              숨김
            </span>
          )}
          <span className="whitespace-pre-line text-md font-bold text-navy-900">{card.title}</span>
        </p>
        {card.body && <p className="mt-1 truncate text-base text-ink-600">{card.body}</p>}
        {card.href && <p className="label-mono mt-1 truncate text-ink-400">{card.href}</p>}
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <form action={moveHomeCard}>
          <input type="hidden" name="id" value={card.id} />
          <input type="hidden" name="direction" value="up" />
          <button type="submit" className={smallBtn} disabled={isFirst} title="위로">
            ↑
          </button>
        </form>
        <form action={moveHomeCard}>
          <input type="hidden" name="id" value={card.id} />
          <input type="hidden" name="direction" value="down" />
          <button type="submit" className={smallBtn} disabled={isLast} title="아래로">
            ↓
          </button>
        </form>
        <button type="button" onClick={() => setEditing(true)} className={smallBtn}>
          수정
        </button>
        <form action={toggleHomeCard}>
          <input type="hidden" name="id" value={card.id} />
          <button type="submit" className={smallBtn}>
            {card.isVisible ? "숨기기" : "보이기"}
          </button>
        </form>
        <form
          action={deleteHomeCard}
          onSubmit={(e) => {
            if (!confirm("이 카드를 삭제할까요?")) e.preventDefault();
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
      </div>
    </li>
  );
}

export default function HomeCardEditor({
  kind,
  name,
  desc,
  cards,
}: {
  kind: HomeCardKind;
  name: string;
  desc: string;
  cards: HomeCard[];
}) {
  const [adding, setAdding] = useState(false);

  /*
    끌어 옮기는 동안에는 화면에서 바로 자리가 바뀌어야 해서 순서를 따로 들고 있는다.
    저장이 끝나 서버가 새 목록을 내려주면 그걸로 맞춘다.
  */
  const [order, setOrder] = useState(cards);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [, startSaving] = useTransition();

  /* 서버에서 새 목록이 내려오면 그것으로 맞춘다 (렌더 중 조정) */
  const [lastCards, setLastCards] = useState(cards);
  if (lastCards !== cards) {
    setLastCards(cards);
    setOrder(cards);
  }

  /* 끌고 있는 카드를 지나친 카드 자리로 옮긴다. */
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
    const unchanged = cards.every((c, i) => c.id === ids[i]);
    if (unchanged) return;

    startSaving(async () => {
      await reorderHomeCards(kind, ids);
    });
  };

  return (
    <section className="mt-6 first:mt-0 rounded-xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(6,42,85,0.04)] lg:p-6">
      <div className="-mx-5 -mt-5 mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-line px-5 pb-4 pt-5 lg:-mx-6 lg:-mt-6 lg:px-6 lg:pt-6">
        <div>
          <h2 className="text-xl font-bold text-navy-900">{name}</h2>
          <p className="mt-1.5 text-base text-ink-600">{desc}</p>
        </div>
        <span className="data-line text-ink-400">
          {cards.length}개 · 끌어서 순서 변경
        </span>
      </div>

      <ul>
        {order.length === 0 && (
          <li className="border-b border-line py-10 text-center text-md text-ink-400">
            등록된 카드가 없습니다. 아래에서 추가하세요.
          </li>
        )}
        {order.map((card, i) => (
          <CardRow
            key={card.id}
            card={card}
            isFirst={i === 0}
            isLast={i === order.length - 1}
            dragging={draggingId === card.id}
            over={draggingId !== null && draggingId !== card.id}
            onDragStart={() => setDraggingId(card.id)}
            onDragEnter={() => moveTo(card.id)}
            onDragEnd={commit}
          />
        ))}
      </ul>

      {adding ? (
        <div className="mt-5">
          <CardForm kind={kind} onDone={() => setAdding(false)} />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-5 rounded-full px-5 py-2.5 text-base font-bold text-navy-900 ring-1 ring-line transition-colors hover:bg-surface"
        >
          + 카드 추가
        </button>
      )}
    </section>
  );
}
