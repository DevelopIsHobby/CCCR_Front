"use client";

import { useState } from "react";
import Link from "next/link";
import { IconPlus } from "./Icons";

export type NewsItem = {
  id: number;
  board: string;
  boardName: string;
  /** 게시판마다 주소가 달라 서버에서 만들어 넘긴다. */
  href: string;
  title: string;
  createdAt: string;
  isNew: boolean;
};

const BADGE_STYLE: Record<string, string> = {
  notice: "bg-brand-100 text-brand-700",
  events: "bg-flame-100 text-flame-700",
  news: "bg-navy-900/8 text-navy-800",
};

const PER_TAB = 6;

/*
  메인 새소식 목록. 탭 전환만 클라이언트에서 하고 데이터는 서버에서 받는다.
  게시판이 늘어나면 tabs 를 넘겨 주기만 하면 된다.
*/
export default function NewsTabs({
  items,
  tabs,
}: {
  items: NewsItem[];
  tabs: { slug: string; name: string }[];
}) {
  const [tab, setTab] = useState("전체");

  const list = (tab === "전체" ? items : items.filter((i) => i.boardName === tab)).slice(
    0,
    PER_TAB,
  );

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-2xl font-bold text-navy-900 lg:text-3xl">
          C3R <span className="text-brand-600">새소식</span>
        </h2>

        <div className="flex items-center gap-2">
          <div className="flex gap-1 rounded-full bg-surface p-1">
            {["전체", ...tabs.map((t) => t.name)].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                aria-pressed={tab === t}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  tab === t ? "bg-navy-900 text-white" : "text-ink-600 hover:text-brand-600"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <Link
            href="/board/notice"
            aria-label="전체 목록 보기"
            className="grid size-9 shrink-0 place-items-center rounded-full text-ink-400 ring-1 ring-line transition-colors hover:bg-flame-500 hover:text-white hover:ring-flame-500"
          >
            <IconPlus className="size-4" />
          </Link>
        </div>
      </div>

      <ul className="mt-7 border-t-2 border-navy-900">
        {list.length === 0 && (
          <li className="border-b border-line py-11 text-center text-md text-ink-400">
            등록된 소식이 없습니다.
          </li>
        )}

        {list.map((post) => (
          <li key={`${post.board}-${post.id}`} className="border-b border-line">
            <Link
              href={post.href}
              className="group flex flex-col gap-2 py-5 sm:flex-row sm:items-center sm:gap-5"
            >
              <span
                className={`inline-flex w-fit shrink-0 rounded px-2.5 py-1 text-2xs font-bold ${
                  BADGE_STYLE[post.board] ?? "bg-navy-900/8 text-navy-800"
                }`}
              >
                {post.boardName}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  {/* 모바일은 줄바꿈, sm 이상에서만 한 줄 말줄임 */}
                  <span className="min-w-0 text-md font-medium leading-relaxed text-ink-900 transition-colors group-hover:text-brand-600 sm:truncate sm:leading-normal">
                    {post.title}
                  </span>
                  {post.isNew && <span className="label-mono shrink-0 text-flame-500">new</span>}
                </span>
              </span>
              <span className="label-mono shrink-0 tabular-nums text-ink-400">
                {post.createdAt}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
