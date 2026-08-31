"use client";

import { useRef } from "react";
import SmartLink from "./SmartLink";
import type { HomeCard } from "@/lib/db/home-cards";
import { IconArrow, IconChevron } from "./Icons";

export default function BannerRail({ banners }: { banners: HomeCard[] }) {
  const rail = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    const el = rail.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <section className="border-y border-line bg-surface py-16 lg:py-20">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="data-line text-flame-600">
            자료 {banners.length}건 · 최근 갱신 2026.07.30
          </p>
            <h2 className="mt-3 text-2xl font-bold text-navy-900 lg:text-3xl">
              주요 정책 · 자료 안내
            </h2>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              aria-label="이전 자료 보기"
              className="grid size-10 place-items-center rounded-full bg-white text-ink-600 ring-1 ring-line transition-colors hover:bg-navy-900 hover:text-white hover:ring-navy-900"
            >
              <IconChevron className="size-4 rotate-180" />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              aria-label="다음 자료 보기"
              className="grid size-10 place-items-center rounded-full bg-white text-ink-600 ring-1 ring-line transition-colors hover:bg-navy-900 hover:text-white hover:ring-navy-900"
            >
              <IconChevron className="size-4" />
            </button>
          </div>
        </div>

        <div
          ref={rail}
          className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {banners.map((b) => (
            <SmartLink
              key={b.id}
              href={b.href}
              className="group flex min-h-[190px] w-[248px] shrink-0 snap-start flex-col justify-between rounded-xl border border-line bg-white p-6 transition-all hover:-translate-y-1 hover:border-brand-500 hover:shadow-[0_16px_32px_-18px_rgba(6,42,85,0.4)] sm:w-[280px]"
            >
              <div className="flex items-start justify-between">
                <span className="inline-flex rounded bg-brand-50 px-2.5 py-1 text-2xs font-bold text-brand-700 transition-colors group-hover:bg-flame-100 group-hover:text-flame-700">
                  {b.label}
                </span>
                <span className="grid size-8 place-items-center rounded-full bg-surface text-ink-400 transition-colors group-hover:bg-flame-500 group-hover:text-white">
                  <IconArrow className="size-4" />
                </span>
              </div>
              <div>
                <p className="text-lg font-bold leading-snug text-navy-900">{b.title}</p>
                <p className="mt-2 text-sm text-ink-400">{b.body}</p>
              </div>
            </SmartLink>
          ))}
        </div>
      </div>
    </section>
  );
}
