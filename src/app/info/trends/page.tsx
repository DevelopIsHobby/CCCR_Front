import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/sub/PageShell";
import { BoardSearch } from "@/components/sub/Ui";
import { IconArrow } from "@/components/Icons";
import { TECH_TRENDS } from "@/lib/page-data";

export const metadata: Metadata = { title: "기술동향" };

export default function Page() {
  return (
    <PageShell
      href="/info/trends"
      desc="조합이 정기 발간하는 기술동향 리포트의 주요 내용을 공개합니다."
    >
      <BoardSearch total={TECH_TRENDS.length} action="/info/trends" />

      <ul className="mt-8 border-t-2 border-navy-900">
        {TECH_TRENDS.map((t) => (
          <li key={t.title} className="border-b border-line">
            <Link
              href="#"
              className="group grid gap-4 py-7 lg:grid-cols-[160px_1fr_auto] lg:items-center lg:gap-10"
            >
              <div className="flex items-center gap-3 lg:flex-col lg:items-start lg:gap-2">
                <span className="inline-flex rounded bg-flame-100 px-2.5 py-1 text-2xs font-bold text-flame-700">
                  {t.category}
                </span>
                <span className="label-mono tabular-nums text-ink-400">{t.date}</span>
              </div>

              <div>
                <p className="text-lg font-bold leading-snug text-navy-900 transition-colors group-hover:text-brand-600">
                  {t.title}
                </p>
                <p className="mt-2 text-md leading-relaxed text-ink-600">{t.summary}</p>
                <p className="label-mono mt-3 text-brand-600">{t.source}</p>
              </div>

              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-surface text-ink-400 transition-colors group-hover:bg-flame-500 group-hover:text-white">
                <IconArrow className="size-4" />
              </span>
            </Link>
          </li>
        ))}
      </ul>

    </PageShell>
  );
}
