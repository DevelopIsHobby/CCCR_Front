import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/sub/PageShell";
import { BoardSearch, Pagination } from "@/components/sub/Ui";
import { IconArrow } from "@/components/Icons";
import { EVENTS } from "@/lib/page-data";

export const metadata: Metadata = { title: "행사정보" };

const STATUS_TONE: Record<string, string> = {
  접수중: "bg-flame-500 text-white",
  예정: "bg-brand-600 text-white",
  종료: "bg-surface text-ink-400",
};

export default function Page() {
  return (
    <PageShell
      href="/board/events"
      desc="조합과 유관기관이 개최하는 세미나·컨퍼런스·전시 일정을 안내합니다."
    >
      <BoardSearch total={EVENTS.length} />

      <ul className="mt-8 space-y-4">
        {EVENTS.map((e) => (
          <li key={e.title}>
            <Link
              href="#"
              className={`group grid gap-6 rounded-xl border border-line bg-white p-7 transition-all lg:grid-cols-[1fr_auto] lg:items-center ${
                e.status === "종료"
                  ? "opacity-70 hover:opacity-100"
                  : "hover:-translate-y-1 hover:border-brand-500 hover:shadow-[0_16px_32px_-18px_rgba(6,42,85,0.35)]"
              }`}
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex rounded px-2.5 py-1 text-2xs font-bold ${
                      STATUS_TONE[e.status]
                    }`}
                  >
                    {e.status}
                  </span>
                  <span className="text-sm text-ink-400">주최 · {e.host}</span>
                </div>

                <p className="mt-3 text-lg font-bold leading-snug text-navy-900 transition-colors group-hover:text-brand-600">
                  {e.title}
                </p>

                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                  <span className="label-mono tabular-nums text-brand-600">{e.period}</span>
                  <span className="text-base text-ink-600">{e.place}</span>
                </div>
              </div>

              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-surface text-ink-400 transition-colors group-hover:bg-flame-500 group-hover:text-white">
                <IconArrow className="size-4" />
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <Pagination pages={3} />
    </PageShell>
  );
}
