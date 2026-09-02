import type { Metadata } from "next";
import Link from "next/link";
import { Empty, PageHead, Panel, StatCard } from "@/components/admin/AdminUi";
import TrendChart from "@/components/admin/TrendChart";
import { formatDate } from "@/lib/format";
import {
  getDailyVisits,
  getPopularPosts,
  getTopPaths,
  getVisitSummary,
} from "@/lib/db/visits";

export const metadata: Metadata = { title: "접속 통계" };

const shortDay = (day: string) => `${Number(day.slice(5, 7))}.${day.slice(8, 10)}`;

export default async function Page() {
  const [summary, daily, paths, posts] = await Promise.all([
    getVisitSummary(),
    getDailyVisits(),
    getTopPaths(),
    getPopularPosts(),
  ]);

  const cards = [
    { label: "오늘", count: summary.today },
    { label: "어제", count: summary.yesterday },
    { label: "최근 7일", count: summary.last7 },
    { label: "최근 30일", count: summary.last30 },
  ];

  return (
    <div className="space-y-6">
      <PageHead
        title="접속 통계"
        desc="화면이 열릴 때마다 셉니다. 누가 왔는지는 남기지 않고, 그날 하루만 쓰는 값으로 같은 사람인지만 구분합니다. 관리자 화면은 세지 않습니다."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <StatCard
            key={card.label}
            label={card.label}
            value={card.count.visitors}
            unit="명"
            note={`열어 본 화면 ${card.count.views.toLocaleString()}회`}
          />
        ))}
      </div>

      {summary.last30.views === 0 ? (
        <Empty>아직 쌓인 기록이 없습니다. 홈페이지를 열면 그날부터 기록이 쌓입니다.</Empty>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          <Panel
            title="일별 방문자"
            desc={`최근 30일 · 누적 ${summary.total.toLocaleString()}회`}
          >
            <TrendChart
              label="일별 방문자"
              unit="명"
              tone="brand"
              points={daily.map((d) => ({ day: shortDay(d.day), value: d.visitors }))}
            />
          </Panel>
          <Panel title="일별 조회수" desc="최근 30일 · 열어 본 화면 수">
            <TrendChart
              label="일별 조회수"
              unit="회"
              tone="flame"
              points={daily.map((d) => ({ day: shortDay(d.day), value: d.views }))}
            />
          </Panel>
        </div>
      )}

      {/* 많이 본 화면 */}
      <Panel title="많이 본 화면" desc="최근 30일">
        {paths.length === 0 ? (
          <p className="py-6 text-center text-md text-ink-400">아직 기록이 없습니다.</p>
        ) : (
          <ul className="-my-1">
            {paths.map((p, i) => (
              <li
                key={p.path}
                className="flex flex-wrap items-center gap-3 border-b border-line py-2.5 last:border-0"
              >
                <span className="label-mono w-6 shrink-0 tabular-nums text-ink-400">{i + 1}</span>
                <Link
                  href={p.path}
                  target="_blank"
                  className="min-w-0 flex-1 truncate text-md font-bold text-navy-900 hover:text-brand-600"
                >
                  {p.label}
                </Link>
                <span className="label-mono hidden shrink-0 truncate text-sm text-ink-400 sm:block">
                  {p.path}
                </span>
                <span className="label-mono w-20 shrink-0 text-right tabular-nums text-ink-600">
                  {p.views.toLocaleString()}회
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {/* 인기 게시물 */}
      <Panel title="인기 게시물" desc="글을 올린 뒤 지금까지의 조회수">
        {posts.length === 0 ? (
          <p className="py-6 text-center text-md text-ink-400">올라온 글이 없습니다.</p>
        ) : (
          <ul className="-my-1">
            {posts.map((post, i) => (
              <li
                key={post.id}
                className="flex flex-wrap items-center gap-3 border-b border-line py-2.5 last:border-0"
              >
                <span className="label-mono w-6 shrink-0 tabular-nums text-ink-400">{i + 1}</span>
                <span className="shrink-0 rounded bg-brand-50 px-2 py-0.5 text-2xs font-bold text-brand-700">
                  {post.boardName}
                </span>
                <Link
                  href={post.href}
                  target="_blank"
                  className="min-w-0 flex-1 truncate text-md font-bold text-navy-900 hover:text-brand-600"
                >
                  {post.title}
                </Link>
                <span className="label-mono shrink-0 text-sm text-ink-400">
                  {formatDate(post.createdAt)}
                </span>
                <span className="label-mono w-20 shrink-0 text-right tabular-nums text-ink-600">
                  {post.views.toLocaleString()}회
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
