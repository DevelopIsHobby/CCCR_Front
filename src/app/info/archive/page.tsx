import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/sub/PageShell";
import { BoardSearch, Pagination } from "@/components/sub/Ui";
import { ARCHIVES } from "@/lib/page-data";

export const metadata: Metadata = { title: "자료실" };

const TYPE_TONE: Record<string, string> = {
  PDF: "bg-flame-100 text-flame-700",
  HWP: "bg-brand-50 text-brand-700",
  XLSX: "bg-brand-100 text-brand-700",
  ZIP: "bg-surface text-ink-600",
};

function IconDownload({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 4v11M7.5 10.5 12 15l4.5-4.5" />
      <path d="M4.5 18.5h15" />
    </svg>
  );
}

export default function Page() {
  return (
    <PageShell
      href="/info/archive"
      eng="Archive"
      desc="법령·가이드라인·리포트 등 조합이 수집하고 발간한 자료를 제공합니다."
    >
      <BoardSearch total={ARCHIVES.length} />

      <ul className="mt-8 border-t-2 border-navy-900">
        {ARCHIVES.map((a) => (
          <li key={a.title} className="border-b border-line">
            <div className="grid gap-4 py-5 sm:grid-cols-[110px_1fr_auto] sm:items-center sm:gap-6">
              <span className="inline-flex w-fit rounded bg-surface px-2.5 py-1 text-[0.7rem] font-bold text-ink-600">
                {a.category}
              </span>

              <div className="min-w-0">
                <p className="text-[0.975rem] font-medium text-ink-900">{a.title}</p>
                <p className="label-mono mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-ink-400">
                  <span
                    className={`rounded px-1.5 py-0.5 ${TYPE_TONE[a.fileType]}`}
                  >
                    {a.fileType}
                  </span>
                  <span className="tabular-nums">{a.size}</span>
                  <span className="tabular-nums">{a.date}</span>
                </p>
              </div>

              <Link
                href="#"
                className="group inline-flex w-fit shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-[0.85rem] font-semibold text-navy-900 ring-1 ring-line transition-colors hover:bg-brand-600 hover:text-white hover:ring-brand-600"
              >
                <IconDownload className="size-4" />
                내려받기
              </Link>
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-8 rounded-lg bg-surface px-5 py-4 text-[0.85rem] text-ink-600">
        일부 자료는 회원사 로그인 후 내려받을 수 있습니다.
      </p>

      <Pagination pages={4} />
    </PageShell>
  );
}
