"use client";

import { IconArrow } from "./Icons";

/** 푸터 최상단 구독 밴드 — 페이지를 떠나기 직전의 액션 자리 */
export default function NewsletterBand() {
  return (
    <div className="relative overflow-hidden bg-navy-950">

      <div className="relative mx-auto flex max-w-[1280px] flex-col gap-7 px-6 py-12 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
        <div>
          <p className="data-line text-flame-500">뉴스레터 · 월 1회</p>
          <p className="mt-3 text-xl font-bold leading-snug text-white lg:text-2xl">
            조합 소식과 산업 동향을 메일로 받아보세요
          </p>
          <p className="mt-2 text-base text-brand-100/60">
            공지·행사·기술동향을 월 1회 정리해 보내드립니다.
          </p>
        </div>

        <form
          className="flex w-full shrink-0 flex-col gap-2 sm:flex-row lg:w-auto"
          onSubmit={(e) => e.preventDefault()}
        >
          <label htmlFor="newsletter-email" className="sr-only">
            이메일 주소
          </label>
          <input
            id="newsletter-email"
            type="email"
            required
            placeholder="email@example.com"
            className="min-w-0 rounded-md border border-white/20 bg-white/5 px-4 py-3.5 text-md text-white outline-none transition-colors placeholder:text-brand-100/40 focus:border-flame-500 focus:bg-white/10 sm:w-72"
          />
          <button
            type="submit"
            className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-flame-500 px-6 py-3.5 text-md font-bold text-white transition-colors hover:bg-flame-600"
          >
            구독 신청
            <IconArrow className="size-4 transition-transform group-hover:translate-x-1" />
          </button>
        </form>
      </div>
    </div>
  );
}
