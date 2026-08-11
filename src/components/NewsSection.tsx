"use client";

import { useState } from "react";
import Link from "next/link";
import { POSTS, NOTICE_BOARD, type Post } from "@/lib/site-data";
import { IconArrow, IconPlus } from "./Icons";

const TABS = ["전체", "공지사항", "행사정보", "산업뉴스"] as const;
type Tab = (typeof TABS)[number];

const CATEGORY_STYLE: Record<Post["category"], string> = {
  공지사항: "bg-brand-100 text-brand-700",
  행사정보: "bg-flame-100 text-flame-700",
  산업뉴스: "bg-navy-900/8 text-navy-800",
};

export default function NewsSection() {
  const [tab, setTab] = useState<Tab>("전체");
  const list = (tab === "전체" ? POSTS : POSTS.filter((p) => p.category === tab)).slice(0, 6);

  return (
    <section className="mx-auto max-w-[1280px] px-6 py-16 lg:py-24">
      <div className="grid gap-12 lg:grid-cols-[1.7fr_1fr] lg:gap-14">
        {/* 새소식 */}
        <div>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-[1.75rem] font-bold text-navy-900 lg:text-[2rem]">
              C3R <span className="text-brand-600">새소식</span>
            </h2>
            <div className="flex items-center gap-2">
              <div className="flex gap-1 rounded-full bg-surface p-1">
                {TABS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTab(t)}
                    aria-pressed={tab === t}
                    className={`rounded-full px-4 py-2 text-[0.825rem] font-semibold transition-colors ${
                      tab === t
                        ? "bg-navy-900 text-white"
                        : "text-ink-600 hover:text-brand-600"
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
            {list.map((post) => (
              <li key={post.title} className="border-b border-line">
                <Link
                  href="/board/notice"
                  className="group flex flex-col gap-2 py-5 sm:flex-row sm:items-center sm:gap-5"
                >
                  <span
                    className={`inline-flex w-fit shrink-0 rounded px-2.5 py-1 text-[0.7rem] font-bold ${
                      CATEGORY_STYLE[post.category]
                    }`}
                  >
                    {post.category}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      {/* 모바일은 줄바꿈, sm 이상에서만 한 줄 말줄임 */}
                      <span className="min-w-0 text-[0.975rem] font-medium leading-relaxed text-ink-900 transition-colors group-hover:text-brand-600 sm:truncate sm:leading-normal">
                        <span className="text-ink-400">[{post.agency}]</span> {post.title}
                      </span>
                      {post.isNew && (
                        <span className="label-mono shrink-0 text-flame-500">new</span>
                      )}
                    </span>
                  </span>
                  <span className="label-mono shrink-0 tabular-nums text-ink-400">
                    {post.date}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* 알림판 — 좌측 목록 높이에 맞춰 카드가 늘어난다 */}
        <div className="flex flex-col">
          <h2 className="text-[1.75rem] font-bold text-navy-900 lg:text-[2rem]">알림판</h2>
          <div className="mt-7 flex flex-1 flex-col gap-4">
            {NOTICE_BOARD.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group relative flex min-h-[190px] flex-1 flex-col justify-center overflow-hidden rounded-xl bg-navy-900 p-7 transition-colors hover:bg-navy-800"
              >
                <div className="hex-field absolute inset-0 opacity-60" aria-hidden />
                <div
                  className="absolute -bottom-16 -right-10 size-44 rounded-full bg-brand-500/25 blur-2xl transition-transform duration-500 group-hover:scale-125"
                  aria-hidden
                />
                <div className="relative">
                  <span className="label-mono text-flame-500">{item.tag}</span>
                  <p className="mt-3 text-[1.15rem] font-bold leading-snug text-white">
                    {item.title}
                  </p>
                  <p className="mt-2 text-[0.85rem] leading-relaxed text-brand-100/70">
                    {item.desc}
                  </p>
                  <span className="mt-6 flex items-center gap-2 text-[0.825rem] font-semibold text-white">
                    바로가기
                    <IconArrow className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
