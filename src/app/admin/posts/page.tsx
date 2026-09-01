import type { Metadata } from "next";
import Link from "next/link";
import AdminPostTable from "@/components/admin/AdminPostTable";
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



  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">게시글 관리</h1>
          <p className="mt-2 text-md text-ink-600">
            여섯 게시판의 글을 한 곳에서 보고 정리합니다. 글쓰기는 각 게시판에서 합니다.
          </p>
        </div>
        <p className="data-line text-ink-400">전체 {totalAll}건</p>
      </div>

      {/* 게시판 필터 */}
      <div className="mt-8 flex flex-wrap gap-2">
        <Link
          href={filterHref()}
          aria-current={!board ? "page" : undefined}
          className={`rounded-full px-4 py-2 text-base font-semibold transition-colors ${
            !board ? "bg-navy-900 text-white" : "text-ink-600 ring-1 ring-line hover:bg-surface"
          }`}
        >
          전체 <span className="tabular-nums">{totalAll}</span>
        </Link>

        {BOARDS.map((b) => (
          <Link
            key={b.slug}
            href={filterHref(b.slug)}
            aria-current={board === b.slug ? "page" : undefined}
            className={`rounded-full px-4 py-2 text-base font-semibold transition-colors ${
              board === b.slug
                ? "bg-navy-900 text-white"
                : "text-ink-600 ring-1 ring-line hover:bg-surface"
            }`}
          >
            {b.name} <span className="tabular-nums">{counts[b.slug] ?? 0}</span>
          </Link>
        ))}
      </div>

      {/* 검색 */}
      <form method="get" className="mt-5 flex flex-wrap gap-2">
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
          className="w-full max-w-sm rounded-md border border-line px-4 py-2.5 text-base outline-none focus:border-brand-500"
        />
        <button
          type="submit"
          className="rounded-md bg-navy-900 px-5 py-2.5 text-base font-semibold text-white transition-colors hover:bg-brand-600"
        >
          검색
        </button>
        {q && (
          <Link
            href={filterHref(board)}
            className="rounded-md px-4 py-2.5 text-base font-semibold text-ink-600 ring-1 ring-line transition-colors hover:bg-surface"
          >
            검색 해제
          </Link>
        )}
      </form>

      {q && (
        <p className="mt-4 text-base text-ink-600">
          <b className="font-bold text-navy-900">{q}</b> 검색 결과 {total}건
        </p>
      )}

      <div className="mt-6">
        <AdminPostTable posts={rows} boardName={boardName} boardPath={boardPath} />
      </div>

      <Pagination
        basePath="/admin/posts"
        page={page}
        totalPages={totalPages}
        q={q}
        params={{ board }}
      />
    </>
  );
}
