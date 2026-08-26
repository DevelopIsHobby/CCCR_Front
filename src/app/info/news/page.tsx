import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/sub/PageShell";
import { BoardSearch } from "@/components/sub/Ui";
import { INDUSTRY_NEWS } from "@/lib/page-data";

export const metadata: Metadata = { title: "산업뉴스" };

export default function Page() {
  return (
    <PageShell
      href="/info/news"
      desc="클라우드컴퓨팅 산업의 정책·시장·기술 소식을 정리해 전합니다."
    >
      <BoardSearch total={INDUSTRY_NEWS.length} action="/info/news" />

      <ul className="mt-8 grid gap-4 lg:grid-cols-2">
        {INDUSTRY_NEWS.map((n) => (
          <li key={n.title}>
            <Link
              href="#"
              className="group flex h-full flex-col rounded-xl border border-line bg-white p-7 transition-all hover:-translate-y-1 hover:border-brand-500 hover:shadow-[0_16px_32px_-18px_rgba(6,42,85,0.35)]"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex rounded bg-brand-50 px-2.5 py-1 text-2xs font-bold text-brand-700">
                  {n.category}
                </span>
                <span className="label-mono tabular-nums text-ink-400">{n.date}</span>
              </div>

              <p className="mt-4 text-lg font-bold leading-snug text-navy-900 transition-colors group-hover:text-brand-600">
                {n.title}
              </p>
              <p className="mt-3 flex-1 text-md leading-relaxed text-ink-600">{n.summary}</p>

              <p className="label-mono mt-6 border-t border-line pt-4 text-ink-400">{n.source}</p>
            </Link>
          </li>
        ))}
      </ul>

    </PageShell>
  );
}
