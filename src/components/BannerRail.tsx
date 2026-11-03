"use client";

import { useRef } from "react";
import CardIcon from "./CardIcon";
import SmartLink from "./SmartLink";
import type { HomeCard } from "@/lib/db/home-cards";
import { IconArrow, IconChevron } from "./Icons";

export default function BannerRail({
  banners,
  updatedAt,
}: {
  banners: HomeCard[];
  /** 카드를 마지막으로 손본 날. 'YYYY.MM.DD' */
  updatedAt: string | null;
}) {
  const rail = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    const el = rail.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    /*
      흰 띠. 위의 아카데미(연회색)와 번갈아 읽히게 무늬·번짐 없이 평평하게 두고,
      경계는 가는 선 하나로 잡는다(메인 띠 색 차례는 EduSection.tsx 주석 참고).
    */
    <section className="relative overflow-hidden border-t border-line bg-white py-12 lg:py-14">

      <div className="relative mx-auto max-w-[1280px] px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="data-line text-flame-600">
              자료 {banners.length}건{updatedAt && ` · 최근 갱신 ${updatedAt}`}
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

        {/* 가로 스크롤을 켜면 세로도 함께 잘린다. 카드가 떠오르고 그림자가 번질 자리를 안쪽 여백으로 비워 둔다 */}
        <div
          ref={rail}
          className="-mx-1 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-4 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {banners.map((b) => (
            <SmartLink
              key={b.id}
              href={b.href}
              className="group flex min-h-[218px] w-[248px] shrink-0 snap-start flex-col rounded-xl border border-line bg-white p-6 transition-all hover:-translate-y-1 hover:border-brand-500 hover:shadow-[0_16px_32px_-18px_rgba(6,42,85,0.4)] sm:w-[280px]"
            >
              <div className="flex items-start justify-between gap-3">
                {/* 자료 종류를 한눈에 알리는 그림 */}
                <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-flame-100 group-hover:text-flame-600">
                  <CardIcon name={b.icon} className="size-7" />
                </span>
                {b.label && (
                  <span className="mt-1 inline-flex shrink-0 rounded bg-surface px-2.5 py-1 text-2xs font-bold text-ink-600 transition-colors group-hover:bg-brand-50 group-hover:text-brand-700">
                    {b.label}
                  </span>
                )}
              </div>

              <p className="mt-5 text-lg font-bold leading-snug text-navy-900">{b.title}</p>

              <div className="mt-auto flex items-end justify-between gap-3 pt-4">
                <p className="min-w-0 text-sm text-ink-400">{b.body}</p>
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-surface text-ink-400 transition-colors group-hover:bg-flame-500 group-hover:text-white">
                  <IconArrow className="size-4" />
                </span>
              </div>
            </SmartLink>
          ))}
        </div>
      </div>
    </section>
  );
}
