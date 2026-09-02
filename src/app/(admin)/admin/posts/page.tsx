import type { Metadata } from "next";
import Link from "next/link";
import AdminPostTable from "@/components/admin/AdminPostTable";
import { PageHead, btnGhost, btnPrimary, inputBox } from "@/components/admin/AdminUi";
import { Pagination } from "@/components/sub/Ui";
import { countPostsByBoard, listAdminPosts } from "@/lib/db/admin-posts";
import { BOARDS } from "@/lib/boards";

export const metadata: Metadata = { title: "게시글 관리" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ board?: string; q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const board = BOARDS.find((b) => b.slug === sp.board)?.slug;

  const [{ rows, total, page, totalPages }, counts] = await Promise.all([
    listAdminPosts({ board, q, page: Number(sp.page) || 1 }),
    countPostsByBoard(),
  ]);

  const boardName = Object.fromEntries(BOARDS.map((b) => [b.slug, b.name]));
  const boardPath = Object.fromEntries(BOARDS.map((b) => [b.slug, b.basePath]));
  const totalAll = Object.values(counts).reduce((n, v) => n + v, 0);

  /* 필터를 눌러도 검색어는 유지한다 */
  const filterHref = (slug?: string) => {
    const params = new URLSearchParams();
    if (slug) params.set("board", slug);
    if (q) params.set("q", q);
    const query = params.toString();
    return query ? `/admin/posts?${query}` : "/admin/posts";
  };

  /* 게시판 알약 — 전체 + 여섯 게시판 */
  const tabs = [
    { slug: undefined as string | undefined, name: "전체", count: totalAll },
    ...BOARDS.map((b) => ({ slug: b.slug, name: b.name, count: counts[b.slug] ?? 0 })),
  ];

  return (
    <div className="space-y-6">
      <PageHead
        title="게시글 관리"
        desc="여섯 게시판의 글을 한 곳에서 보고 정리합니다. 글쓰기는 각 게시판에서 합니다."
        actions={<p className="self-center text-base text-ink-400">전체 {totalAll}건</p>}
      />

      {/* 게시판 필터 */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const active = board === tab.slug;
          return (
            <Link
              key={tab.name}
              href={filterHref(tab.slug)}
              aria-current={active ? "page" : undefined}
              className={`rounded-full px-4 py-2 text-base font-semibold transition-colors ${
                active
                  ? "bg-navy-900 text-white"
                  : "border border-line bg-white text-ink-600 hover:border-brand-500 hover:text-brand-600"
              }`}
            >
              {tab.name}{" "}
              <span className={`tabular-nums ${active ? "opacity-70" : "text-ink-400"}`}>
                {tab.count}
              </span>
            </Link>
          );
        })}
      </div>

      {/* 검색 */}
      <form method="get" className="flex flex-wrap gap-2">
        {board && <input type="hidden" name="board" value={board} />}
        <label htmlFor="post-q" className="sr-only">
          검색어
        </label>
        <input
          id="post-q"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="제목 또는 본문 검색"
          className={`w-full max-w-sm ${inputBox}`}
        />
        <button type="submit" className={btnPrimary}>
          검색
        </button>
        {q && (
          <Link href={filterHref(board)} className={btnGhost}>
            검색 해제
          </Link>
        )}
      </form>

      {q && (
        <p className="text-base text-ink-600">
          <b className="font-bold text-navy-900">{q}</b> 검색 결과 {total}건
        </p>
      )}

      <AdminPostTable posts={rows} boardName={boardName} boardPath={boardPath} />

      <Pagination
        basePath="/admin/posts"
        page={page}
        totalPages={totalPages}
        q={q}
        params={{ board }}
      />
    </div>
  );
}
