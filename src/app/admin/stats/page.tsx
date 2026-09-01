import type { Metadata } from "next";
import Link from "next/link";
import { formatDate } from "@/lib/format";
import {
  getDailyVisits,
  getPopularPosts,
  getTopPaths,
  getVisitSummary,
} from "@/lib/db/visits";

export const metadata: Metadata = { title: "접속 통계" };

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

  /* 막대 높이는 가장 많이 온 날을 기준으로 잡는다 */
  const peak = Math.max(1, ...daily.map((d) => d.visitors));

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-navy-900">접속 통계</h1>
        <p className="mt-2 text-md text-ink-600">
          화면이 열릴 때마다 셉니다. 누가 왔는지는 남기지 않고, 그날 하루만 쓰는 값으로 같은
          사람인지만 구분합니다. 관리자 화면은 세지 않습니다.
        </p>
      </div>

      {/* 요약 */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-line bg-surface p-6">
            <p className="text-base font-medium text-ink-600">{card.label}</p>
            <p className="label-mono mt-2 text-3xl font-bold tabular-nums leading-none text-navy-900">
              {card.count.visitors.toLocaleString()}
              <span className="ml-1.5 text-base font-medium text-ink-400">명</span>
            </p>
            <p className="mt-2 text-sm text-ink-400">
              열어 본 화면 {card.count.views.toLocaleString()}회
            </p>
          </div>
        ))}
      </div>

      {/* 일별 그래프 */}
      <section className="mt-14">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-navy-900 pb-4">
          <h2 className="text-xl font-bold text-navy-900">일별 방문자</h2>
          <span className="data-line text-ink-400">최근 30일 · 누적 {summary.total.toLocaleString()}회</span>
        </div>

        {summary.last30.views === 0 ? (
          <p className="mt-6 rounded-lg bg-surface px-6 py-5 text-md text-ink-600">
            아직 쌓인 기록이 없습니다. 홈페이지를 열면 그날부터 기록이 쌓입니다.
          </p>
        ) : (
          <div className="mt-8 overflow-x-auto">
            <div className="flex min-w-[720px] items-end gap-1.5" style={{ height: "180px" }}>
              {daily.map((d) => (
                <div key={d.day} className="group flex flex-1 flex-col items-center justify-end">
                  <span className="label-mono mb-1 text-2xs tabular-nums text-ink-400 opacity-0 transition-opacity group-hover:opacity-100">
                    {d.visitors}
                  </span>
                  <span
                    title={`${d.day} · 방문자 ${d.visitors}명 · ${d.views}회`}
                    className="w-full rounded-t bg-brand-200 transition-colors group-hover:bg-brand-600"
                    style={{ height: `${Math.max(2, (d.visitors / peak) * 100)}%` }}
                  />
                </div>
              ))}
            </div>

            <div className="mt-2 flex min-w-[720px] justify-between">
              <span className="label-mono text-sm text-ink-400">{daily[0]?.day}</span>
              <span className="label-mono text-sm text-ink-400">{daily.at(-1)?.day}</span>
            </div>
          </div>
        )}
      </section>

      {/* 많이 본 화면 */}
      <section className="mt-14">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-navy-900 pb-4">
          <h2 className="text-xl font-bold text-navy-900">많이 본 화면</h2>
          <span className="data-line text-ink-400">최근 30일</span>
        </div>

        <ul>
          {paths.length === 0 && (
            <li className="border-b border-line py-10 text-center text-md text-ink-400">
              아직 기록이 없습니다.
            </li>
          )}
          {paths.map((p, i) => (
            <li
              key={p.path}
              className="flex flex-wrap items-center gap-3 border-b border-line py-3"
            >
              <span className="label-mono w-6 shrink-0 tabular-nums text-ink-400">{i + 1}</span>
              <Link
                href={p.path}
                target="_blank"
                className="min-w-0 flex-1 truncate text-md font-bold text-navy-900 hover:text-brand-600"
              >
                {p.label}
              </Link>
              <span className="label-mono shrink-0 truncate text-sm text-ink-400">{p.path}</span>
              <span className="label-mono w-20 shrink-0 text-right tabular-nums text-ink-600">
                {p.views.toLocaleString()}회
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* 인기 게시물 */}
      <section className="mt-14">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-navy-900 pb-4">
          <h2 className="text-xl font-bold text-navy-900">인기 게시물</h2>
          <span className="data-line text-ink-400">글을 올린 뒤 지금까지의 조회수</span>
        </div>

        <ul>
          {posts.length === 0 && (
            <li className="border-b border-line py-10 text-center text-md text-ink-400">
              올라온 글이 없습니다.
            </li>
          )}
          {posts.map((post, i) => (
            <li
              key={post.id}
              className="flex flex-wrap items-center gap-3 border-b border-line py-3"
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
      </section>
    </>
  );
}
