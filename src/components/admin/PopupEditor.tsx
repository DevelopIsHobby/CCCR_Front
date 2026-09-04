"use client";

import { useActionState, useState } from "react";
import ImagePicker from "./ImagePicker";
import {
  deletePopup,
  savePopup,
  togglePopup,
  type PopupState,
} from "@/lib/db/popup-actions";
import type { Popup } from "@/lib/db/popups";

/*
  공지 팝업 편집기.
  그림 한 장을 올리고 띄울 기간만 정하면 되게 한다. 글로 쓰는 팝업은 없다.
*/

const input =
  "w-full rounded-md border border-line bg-white px-4 py-3 text-md outline-none transition-colors placeholder:text-ink-400 focus:border-brand-500";
const smallBtn =
  "rounded px-2.5 py-1.5 text-sm font-semibold text-ink-600 ring-1 ring-line transition-colors hover:bg-surface";

const STATE_TONE: Record<string, string> = {
  "노출 중": "bg-brand-50 text-brand-700",
  숨김: "bg-surface text-ink-400",
  "기간 전": "bg-flame-100 text-flame-700",
  "기간 지남": "bg-surface text-ink-400",
};

function PopupForm({ popup, onDone }: { popup?: Popup; onDone?: () => void }) {
  const [state, action, pending] = useActionState<PopupState, FormData>(
    async (prev, formData) => {
      const result = await savePopup(prev, formData);
      if (result.ok) onDone?.();
      return result;
    },
    {},
  );

  return (
    <form action={action} className="space-y-4 rounded-xl bg-surface p-6">
      {popup && <input type="hidden" name="id" value={popup.id} />}

      <label className="block">
        <span className="mb-1.5 block text-base font-bold text-navy-900">
          관리용 이름
          <span className="ml-1.5 font-medium text-ink-400">화면에는 나오지 않습니다</span>
        </span>
        <input
          name="title"
          required
          defaultValue={popup?.title ?? ""}
          placeholder="예) 2026 상반기 정기총회 안내"
          className={input}
        />
      </label>

      <div>
        <span className="mb-1.5 block text-base font-bold text-navy-900">띄울 그림</span>
        <ImagePicker
          name="imageUrl"
          defaultValue={popup?.imageUrl ?? ""}
          alt="팝업 그림"
          ratio="aspect-[3/4]"
          width="w-44"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-base font-bold text-navy-900">
            눌렀을 때 갈 곳 <span className="font-medium text-ink-400">(선택)</span>
          </span>
          <input
            name="href"
            defaultValue={popup?.href ?? ""}
            placeholder="/board/notice/12 또는 https://..."
            className={input}
          />
          <span className="mt-1.5 block text-sm text-ink-400">
            비우면 그림을 눌러도 아무 일이 없습니다.
          </span>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-base font-bold text-navy-900">너비 (px)</span>
          <input
            name="width"
            type="number"
            min={240}
            max={800}
            defaultValue={popup?.width ?? 420}
            className={input}
          />
          <span className="mt-1.5 block text-sm text-ink-400">
            240~800. 그림이 커도 이 폭에 맞춰 줄입니다.
          </span>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-base font-bold text-navy-900">
            시작일 <span className="font-medium text-ink-400">(선택)</span>
          </span>
          <input name="startsOn" type="date" defaultValue={popup?.startsOn ?? ""} className={input} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-base font-bold text-navy-900">
            종료일 <span className="font-medium text-ink-400">(선택)</span>
          </span>
          <input name="endsOn" type="date" defaultValue={popup?.endsOn ?? ""} className={input} />
          <span className="mt-1.5 block text-sm text-ink-400">
            지나면 따로 끄지 않아도 사라집니다.
          </span>
        </label>
      </div>

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
          {pending ? "저장 중…" : popup ? "수정" : "추가"}
        </button>
      </div>
    </form>
  );
}

function PopupRow({ popup, state }: { popup: Popup; state: string }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <li className="border-b border-line py-4">
        <PopupForm popup={popup} onDone={() => setEditing(false)} />
      </li>
    );
  }

  return (
    <li className="flex flex-wrap items-center gap-4 border-b border-line py-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={popup.imageUrl}
        alt=""
        className="h-20 w-16 shrink-0 rounded border border-line object-cover"
      />

      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex rounded px-2 py-0.5 text-2xs font-bold ${STATE_TONE[state] ?? ""}`}
          >
            {state}
          </span>
          <span className="text-md font-bold text-navy-900">{popup.title}</span>
        </p>
        <p className="label-mono mt-1 text-ink-400">
          {popup.startsOn || "제한 없음"} ~ {popup.endsOn || "제한 없음"} · {popup.width}px
        </p>
        {popup.href && <p className="label-mono mt-0.5 truncate text-ink-400">{popup.href}</p>}
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <button type="button" onClick={() => setEditing(true)} className={smallBtn}>
          고치기
        </button>
        <form action={togglePopup}>
          <input type="hidden" name="id" value={popup.id} />
          <button type="submit" className={smallBtn}>
            {popup.isVisible ? "숨기기" : "보이기"}
          </button>
        </form>
        <form action={deletePopup}>
          <input type="hidden" name="id" value={popup.id} />
          <button
            type="submit"
            className="rounded px-2.5 py-1.5 text-sm font-semibold text-flame-700 ring-1 ring-flame-500/30 transition-colors hover:bg-flame-100"
          >
            삭제
          </button>
        </form>
      </div>
    </li>
  );
}

export default function PopupEditor({
  popups,
}: {
  popups: { popup: Popup; state: string }[];
}) {
  const [adding, setAdding] = useState(false);

  return (
    <div>
      <ul>
        {popups.length === 0 && (
          <li className="border-b border-line py-10 text-center text-md text-ink-400">
            등록된 팝업이 없습니다. 아래에서 추가하세요.
          </li>
        )}
        {popups.map(({ popup, state }) => (
          <PopupRow key={popup.id} popup={popup} state={state} />
        ))}
      </ul>

      {adding ? (
        <div className="mt-5">
          <PopupForm onDone={() => setAdding(false)} />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-5 rounded-full px-5 py-2.5 text-base font-bold text-navy-900 ring-1 ring-line transition-colors hover:bg-surface"
        >
          + 팝업 추가
        </button>
      )}
    </div>
  );
}
