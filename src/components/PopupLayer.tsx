"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { IconClose } from "./Icons";
import type { Popup } from "@/lib/db/popups";

/*
  공지 팝업.

  '오늘 하루 보지 않기'는 그 사람 브라우저에만 남긴다(localStorage). 서버에
  남기면 로그인하지 않은 사람은 담을 곳이 없고, 담아 봐야 개인정보만 는다.
  팝업마다 따로 기억하므로 새 팝업은 닫아 둔 것과 상관없이 뜬다.

  서버는 브라우저에 무엇이 담겼는지 모른다. 그대로 그리면 서버가 그린 화면과
  브라우저가 아는 것이 어긋난다. useSyncExternalStore 로 서버에서는 '아무것도
  숨기지 않음'으로 그리고, 붙자마자 브라우저 값으로 한 번 다시 그린다.
*/

const PREFIX = "c3r_popup_";

/* getSnapshot 은 부를 때마다 같은 값을 돌려줘야 한다. 한 번 읽고 담아 둔다. */
let cached: string | null = null;

function hiddenIds(): string {
  if (cached !== null) return cached;
  try {
    const now = Date.now();
    const ids: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(PREFIX)) continue;
      if (Number(localStorage.getItem(key) ?? 0) > now) ids.push(key.slice(PREFIX.length));
    }
    cached = ids.join(",");
  } catch {
    /* 저장을 막아 둔 브라우저면 아무것도 숨기지 않는다 */
    cached = "";
  }
  return cached;
}

/** 오늘 자정까지. 날짜가 바뀌면 다시 뜬다. */
function hideUntilTomorrow(id: number) {
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  try {
    localStorage.setItem(`${PREFIX}${id}`, String(midnight.getTime()));
  } catch {
    /* 저장이 안 되면 이번에만 닫힌다 */
  }
  cached = null; // 다음에 들어올 때 다시 읽는다
}

const subscribe = () => () => {};

export default function PopupLayer({ popups }: { popups: Popup[] }) {
  /* 서버에서는 빈 값 → 아무것도 숨기지 않은 화면을 그린다 */
  const hidden = useSyncExternalStore(subscribe, hiddenIds, () => "");
  /* 이번에 닫은 것. 누른 순간에만 바뀌므로 그냥 상태로 둔다. */
  const [closed, setClosed] = useState<number[]>([]);

  const hiddenSet = new Set(hidden ? hidden.split(",") : []);
  const shown = popups.filter(
    (p) => !hiddenSet.has(String(p.id)) && !closed.includes(p.id),
  );

  const close = (id: number, forToday: boolean) => {
    if (forToday) hideUntilTomorrow(id);
    setClosed((list) => [...list, id]);
  };

  if (shown.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-40 flex flex-wrap items-start gap-4 overflow-y-auto p-4 lg:p-8"
      aria-label="공지 팝업"
    >
      {shown.map((p) => (
        <section
          key={p.id}
          style={{ width: p.width }}
          className="pointer-events-auto max-w-full overflow-hidden rounded-xl bg-white shadow-[0_20px_50px_-12px_rgba(6,42,85,0.45)] ring-1 ring-line"
        >
          {/* 그림 크기를 미리 알 수 없어 next/image 대신 img 를 쓴다 */}
          {p.href ? (
            <Link href={p.href} onClick={() => close(p.id, false)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.imageUrl} alt={p.title} className="block w-full" />
            </Link>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.imageUrl} alt={p.title} className="block w-full" />
          )}

          <div className="flex items-center justify-between gap-3 border-t border-line bg-surface px-3 py-2">
            <button
              type="button"
              onClick={() => close(p.id, true)}
              className="rounded px-2 py-1.5 text-base font-medium text-ink-600 underline-offset-4 transition-colors hover:text-brand-600 hover:underline"
            >
              오늘 하루 보지 않기
            </button>
            <button
              type="button"
              onClick={() => close(p.id, false)}
              aria-label="닫기"
              className="grid size-8 place-items-center rounded-full text-ink-400 transition-colors hover:bg-white hover:text-navy-900"
            >
              <IconClose className="size-5" />
            </button>
          </div>
        </section>
      ))}
    </div>
  );
}
