import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/sub/PageShell";
import { BoardSearch, Pagination } from "@/components/sub/Ui";
import { NOTICES } from "@/lib/page-data";

export const metadata: Metadata = { title: "공지사항" };

export default function Page() {
  return (
    <PageShell
      href="/board/notice"
      desc="조합 운영과 정부·유관기관 공고를 안내합니다."
    >
      <BoardSearch total={NOTICES.length} />

      {/* 데스크톱: 표 */}
      <div className="mt-6 hidden overflow-x-auto lg:block">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-y-2 border-navy-900 bg-surface">
              <th className="w-20 px-5 py-4 text-center text-base font-bold text-navy-900">
                번호
              </th>
              <th className="w-28 px-5 py-4 text-base font-bold text-navy-900">분류</th>
              <th className="px-5 py-4 text-base font-bold text-navy-900">제목</th>
              <th className="w-36 px-5 py-4 text-center text-base font-bold text-navy-900">
                등록일
              </th>
              <th className="w-24 px-5 py-4 text-center text-base font-bold text-navy-900">
                조회
              </th>
            </tr>
          </thead>
          <tbody>
            {NOTICES.map((n) => (
              <tr key={n.no} className="group border-b border-line hover:bg-brand-50/60">
                <td className="label-mono px-5 py-4 text-center tabular-nums text-ink-400">
                  {n.no}
                </td>
                <td className="px-5 py-4">
                  <span className="inline-flex rounded bg-brand-50 px-2.5 py-1 text-2xs font-bold text-brand-700">
                    {n.category}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <Link href="#" className="flex items-center gap-2">
                    <span className="text-md text-ink-900 transition-colors group-hover:text-brand-600">
                      <span className="text-ink-400">[{n.agency}]</span> {n.title}
                    </span>
                    {n.isNew && <span className="label-mono shrink-0 text-flame-500">new</span>}
                  </Link>
                </td>
                <td className="label-mono px-5 py-4 text-center tabular-nums text-ink-400">
                  {n.date}
                </td>
                <td className="label-mono px-5 py-4 text-center tabular-nums text-ink-400">
                  {n.views}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 모바일: 카드 */}
      <ul className="mt-6 border-t-2 border-navy-900 lg:hidden">
        {NOTICES.map((n) => (
          <li key={n.no} className="border-b border-line">
            <Link href="#" className="block py-5">
              <div className="flex items-center gap-2">
                <span className="inline-flex rounded bg-brand-50 px-2.5 py-1 text-2xs font-bold text-brand-700">
                  {n.category}
                </span>
                {n.isNew && <span className="label-mono text-flame-500">new</span>}
              </div>
              <p className="mt-3 text-md font-medium leading-relaxed text-ink-900">
                <span className="text-ink-400">[{n.agency}]</span> {n.title}
              </p>
              <p className="label-mono mt-3 tabular-nums text-ink-400">
                {n.date} · 조회 {n.views}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      <Pagination />
    </PageShell>
  );
}
