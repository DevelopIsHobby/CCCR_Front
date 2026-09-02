import type { Metadata } from "next";
import Link from "next/link";
import { IconAlert, IconCheck, IconExternal } from "@/components/admin/AdminIcons";
import { Panel, StatCard } from "@/components/admin/AdminUi";
import TrendChart from "@/components/admin/TrendChart";
import { BOARDS } from "@/lib/boards";
import { formatBytes, formatDate } from "@/lib/format";
import { listAdminPosts, countPostsByBoard } from "@/lib/db/admin-posts";
import { countCompanies } from "@/lib/db/companies";
import { getFileReport } from "@/lib/db/files";
import { countSubscribers } from "@/lib/db/newsletter";
import { countUsersByStatus } from "@/lib/db/users";
import { getDailyVisits, getVisitSummary } from "@/lib/db/visits";

export const metadata: Metadata = { title: "대시보드" };

/** 'YYYY-MM-DD' 를 그래프 축에 쓸 '9.02' 로 줄인다. */
const shortDay = (day: string) => `${Number(day.slice(5, 7))}.${day.slice(8, 10)}`;

export default async function Page() {
  const [summary, daily, users, postCounts, companies, subscribers, files, recent] =
    await Promise.all([
      getVisitSummary(),
      getDailyVisits(),
      countUsersByStatus(),
      countPostsByBoard(),
      countCompanies(),
      countSubscribers(),
      getFileReport(),
      listAdminPosts({ page: 1 }),
    ]);

  const totalPosts = Object.values(postCounts).reduce((n, v) => n + v, 0);
  const boardName = Object.fromEntries(BOARDS.map((b) => [b.slug, b.name]));
  const boardPath = Object.fromEntries(BOARDS.map((b) => [b.slug, b.basePath]));

  /* 어제와 견준 오늘 방문자. 어제가 0이면 견줄 것이 없다. */
  const diff = summary.today.visitors - summary.yesterday.visitors;

  /* 지금 손대야 할 일만 모은다. 없으면 아래에서 '없음'을 보여준다. */
  const todos = [
    {
      show: users.pending > 0,
      label: "가입 승인 대기",
      value: `${users.pending}명`,
      desc: "회원가입 신청이 승인을 기다리고 있습니다.",
      href: "/admin/members?status=pending",
      cta: "승인하러 가기",
    },
    {
      show: files.totals.missing > 0,
      label: "사라진 파일",
      value: `${files.totals.missing}개`,
      desc: "기록은 있는데 서버에 실제 파일이 없습니다. 첨부가 열리지 않습니다.",
      href: "/admin/files",
      cta: "파일 관리",
    },
    {
      show: files.totals.unusedImages > 0,
      label: "안 쓰는 이미지",
      value: `${files.totals.unusedImages}개`,
      desc: "어느 글에서도 쓰지 않는 이미지입니다. 지워서 용량을 줄일 수 있습니다.",
      href: "/admin/files",
      cta: "정리하기",
    },
  ].filter((t) => t.show);

  const contentCards = [
    { label: "전체 게시글", value: totalPosts, unit: "건", href: "/admin/posts" },
    { label: "회원사", value: companies.total, unit: "개사", href: "/admin/companies" },
    { label: "뉴스레터 구독", value: subscribers.active, unit: "명", href: "/admin/newsletter" },
    {
      label: "올린 파일",
      value: files.totals.count,
      unit: "개",
      note: formatBytes(files.totals.bytes),
      href: "/admin/files",
    },
  ];

  /* 게시판별 막대. 가장 많은 게시판을 기준으로 길이를 잡는다. */
  const boardPeak = Math.max(1, ...BOARDS.map((b) => postCounts[b.slug] ?? 0));

  return (
    <div className="space-y-8">
      {/* 인사 줄 */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-gradient-to-r from-navy-900 to-brand-700 px-6 py-6">
        <div>
          <p className="data-line text-brand-200">
            {new Date().toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "long",
            })}
          </p>
          <h1 className="mt-1.5 text-2xl font-bold text-white">대시보드</h1>
          <p className="mt-1.5 text-base text-brand-100/80">
            홈페이지에 무슨 일이 있었는지 한눈에 봅니다.
          </p>
        </div>

        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2.5 text-base font-bold text-white ring-1 ring-white/25 transition-colors hover:bg-white/20"
        >
          <IconExternal className="size-4" />
          홈페이지 보기
        </Link>
      </div>

      {/* 처리할 일 */}
      <Panel title="처리할 일" desc="지금 관리자가 손봐야 하는 항목입니다.">
        {todos.length === 0 ? (
          <p className="flex items-center gap-2 py-2 text-md text-ink-600">
            <IconCheck className="size-5 shrink-0 text-brand-600" />
            지금 처리할 일이 없습니다.
          </p>
        ) : (
          <ul className="space-y-3">
            {todos.map((todo) => (
              <li
                key={todo.label}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-flame-500/40 bg-flame-100/40 px-4 py-3.5"
              >
                <IconAlert className="size-5 shrink-0 text-flame-600" />
                <div className="min-w-0 flex-1">
                  <p className="text-md font-bold text-navy-900">
                    {todo.label}{" "}
                    <span className="tabular-nums text-flame-700">{todo.value}</span>
                  </p>
                  <p className="mt-0.5 text-base text-ink-600">{todo.desc}</p>
                </div>
                <Link
                  href={todo.href}
                  className="shrink-0 rounded-lg bg-navy-900 px-4 py-2 text-base font-semibold text-white transition-colors hover:bg-brand-600"
                >
                  {todo.cta}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {/* 방문 통계 요약 */}
      <section>
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-xl font-bold text-navy-900">방문 통계</h2>
          <Link
            href="/admin/stats"
            className="text-base font-semibold text-brand-600 hover:underline"
          >
            자세히 보기 →
          </Link>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="오늘 방문자"
            value={summary.today.visitors}
            unit="명"
            note={
              summary.yesterday.visitors === 0
                ? "어제는 기록이 없습니다"
                : `어제보다 ${diff === 0 ? "같음" : `${Math.abs(diff)}명 ${diff > 0 ? "많음" : "적음"}`}`
            }
          />
          <StatCard
            label="오늘 조회"
            value={summary.today.views}
            unit="회"
            note="열어 본 화면 수"
          />
          <StatCard
            label="최근 7일 방문자"
            value={summary.last7.visitors}
            unit="명"
            note={`조회 ${summary.last7.views.toLocaleString()}회`}
          />
          <StatCard
            label="최근 30일 방문자"
            value={summary.last30.visitors}
            unit="명"
            note={`조회 ${summary.last30.views.toLocaleString()}회`}
          />
        </div>

        {summary.last30.views === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-line bg-white px-6 py-12 text-center text-md text-ink-400">
            아직 쌓인 기록이 없습니다. 홈페이지를 열면 그날부터 기록이 쌓입니다.
          </div>
        ) : (
          <div className="mt-4 grid gap-4 xl:grid-cols-2">
            <Panel title="방문자 추이" desc="최근 30일 · 하루에 다녀간 사람 수">
              <TrendChart
                label="일별 방문자"
                unit="명"
                tone="brand"
                points={daily.map((d) => ({ day: shortDay(d.day), value: d.visitors }))}
              />
            </Panel>
            <Panel title="조회 추이" desc="최근 30일 · 열어 본 화면 수">
              <TrendChart
                label="일별 조회수"
                unit="회"
                tone="flame"
                points={daily.map((d) => ({ day: shortDay(d.day), value: d.views }))}
              />
            </Panel>
          </div>
        )}
      </section>

      {/* 콘텐츠 현황 */}
      <section>
        <h2 className="text-xl font-bold text-navy-900">콘텐츠 현황</h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {contentCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <Panel title="게시판별 글" desc={`여섯 게시판 합계 ${totalPosts}건`}>
            <ul className="space-y-3">
              {BOARDS.map((board) => {
                const n = postCounts[board.slug] ?? 0;
                return (
                  <li key={board.slug} className="flex items-center gap-3">
                    <Link
                      href={`/admin/posts?board=${board.slug}`}
                      className="w-20 shrink-0 truncate text-base font-semibold text-ink-600 hover:text-brand-600"
                    >
                      {board.name}
                    </Link>
                    <div className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-surface">
                      <div
                        className="h-full rounded-full bg-brand-500"
                        style={{ width: `${Math.max(n === 0 ? 0 : 3, (n / boardPeak) * 100)}%` }}
                      />
                    </div>
                    <span className="w-12 shrink-0 text-right text-base font-bold tabular-nums text-navy-900">
                      {n}
                    </span>
                  </li>
                );
              })}
            </ul>
          </Panel>

          <Panel
            title="최근 올라온 글"
            actions={
              <Link
                href="/admin/posts"
                className="text-base font-semibold text-brand-600 hover:underline"
              >
                전체 보기 →
              </Link>
            }
          >
            {recent.rows.length === 0 ? (
              <p className="py-6 text-center text-md text-ink-400">아직 올라온 글이 없습니다.</p>
            ) : (
              <ul className="-my-1">
                {recent.rows.slice(0, 6).map((post) => (
                  <li
                    key={post.id}
                    className="flex items-center gap-3 border-b border-line py-2.5 last:border-0"
                  >
                    <span className="shrink-0 rounded bg-brand-50 px-2 py-0.5 text-2xs font-bold text-brand-700">
                      {boardName[post.board] ?? post.board}
                    </span>
                    <Link
                      href={`${boardPath[post.board] ?? "/board"}/${post.id}`}
                      target="_blank"
                      className="min-w-0 flex-1 truncate text-base font-semibold text-navy-900 hover:text-brand-600"
                    >
                      {post.title}
                    </Link>
                    <span className="label-mono shrink-0 text-sm text-ink-400">
                      {formatDate(post.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </section>
    </div>
  );
}
