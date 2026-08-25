import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/sub/PageShell";
import { SectionHeading } from "@/components/sub/Ui";
import { IconArrow } from "@/components/Icons";
import { NEWSLETTERS } from "@/lib/page-data";

export const metadata: Metadata = { title: "뉴스레터" };

export default function Page() {
  return (
    <PageShell
      href="/info/newsletter"
      desc="공지·행사·기술동향을 월 1회 정리해 보내드립니다."
    >
      {/* 구독 신청 */}
      <section className="relative overflow-hidden rounded-2xl bg-navy-900 px-8 py-12 lg:px-14">
        <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-16">
          <div>
            <p className="data-line text-flame-500">월 1회 발행 · 구독 무료</p>
            <p className="mt-4 text-xl font-bold leading-snug text-white lg:text-2xl">
              매달 첫째 주, 산업의 흐름을 정리해 보내드립니다
            </p>
            <p className="mt-3 text-md leading-relaxed text-brand-100/70">
              구독은 언제든 해지할 수 있으며, 수집한 이메일은 뉴스레터 발송 외의 목적으로 사용하지
              않습니다.
            </p>
          </div>

          <form className="flex w-full shrink-0 flex-col gap-2 sm:flex-row lg:w-auto">
            <label htmlFor="subscribe-email" className="sr-only">
              이메일 주소
            </label>
            <input
              id="subscribe-email"
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
      </section>

      {/* 지난 호 */}
      <section className="mt-20">
        <SectionHeading eyebrow={`${NEWSLETTERS[NEWSLETTERS.length - 1].vol} – ${NEWSLETTERS[0].vol}`} title="지난 호 보기" />

        <ul className="mt-10 grid gap-4 lg:grid-cols-2">
          {NEWSLETTERS.map((n) => (
            <li key={n.vol}>
              <Link
                href="#"
                className="group flex h-full flex-col rounded-xl border border-line bg-white p-7 transition-all hover:-translate-y-1 hover:border-brand-500 hover:shadow-[0_16px_32px_-18px_rgba(6,42,85,0.35)]"
              >
                <div className="flex items-center justify-between">
                  <span className="label-mono text-lg font-bold tabular-nums text-brand-600">
                    {n.vol}
                  </span>
                  <span className="label-mono tabular-nums text-ink-400">{n.date}</span>
                </div>

                <p className="mt-4 text-lg font-bold leading-snug text-navy-900 transition-colors group-hover:text-brand-600">
                  {n.title}
                </p>

                <ul className="mt-5 flex flex-wrap gap-2">
                  {n.topics.map((t) => (
                    <li
                      key={t}
                      className="rounded-full bg-surface px-3 py-1.5 text-xs text-ink-600"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </PageShell>
  );
}
