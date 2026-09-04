import Link from "next/link";
import PageShell from "@/components/sub/PageShell";
import { BoardSearch, Pagination } from "@/components/sub/Ui";
import BoardTable from "@/components/board/BoardTable";
import EventCards from "@/components/board/EventCards";
import NewsletterIssues from "@/components/board/NewsletterIssues";
import { listPosts } from "@/lib/db/posts";
import { getSession } from "@/lib/auth/session";
import type { BoardConfig } from "@/lib/boards";

/*
  게시판 목록 화면.

  게시판마다 주소가 달라(게시판 메뉴 / 정보서비스 메뉴) 라우트 파일은 각자
  두지만, 화면은 이 컴포넌트 하나를 함께 쓴다.
*/
export default async function BoardListView({
  board,
  searchParams,
  intro,
}: {
  board: BoardConfig;
  searchParams: Promise<{ page?: string; q?: string }>;
  /** 목록 위에 얹을 내용. 뉴스레터 구독 신청처럼 게시판마다 다른 부분에 쓴다. */
  intro?: React.ReactNode;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const { pinned, rows, total, page, totalPages } = await listPosts({
    board: board.slug,
    page: Number(sp.page) || 1,
    q,
  });
  const session = await getSession();
  const isAdmin = session?.role === "admin";

  const base = board.basePath;

  /* 게시판 이름은 NAV 가 아니라 게시판 설정에서 가져온다.
     메뉴에서 자리를 옮겨도 제목이 흔들리지 않아야 한다. */
  return (
    <PageShell href={base} title={board.name} desc={board.desc}>
      {intro}

      <BoardSearch total={total} action={base} q={q} />

      {q && (
        <p className="mt-4 text-base text-ink-600">
          <b className="font-bold text-navy-900">{q}</b> 검색 결과 {total}건
        </p>
      )}

      {board.layout === "cards" ? (
        <EventCards base={base} pinned={pinned} rows={rows} searching={Boolean(q)} />
      ) : board.layout === "issues" ? (
        <NewsletterIssues base={base} pinned={pinned} rows={rows} searching={Boolean(q)} />
      ) : (
        <BoardTable base={base} pinned={pinned} rows={rows} searching={Boolean(q)} />
      )}

      {isAdmin && (
        <div className="mt-8 flex justify-end">
          <Link
            href={`${base}/write`}
            className="inline-flex items-center gap-2 rounded-full bg-navy-900 px-6 py-3 text-base font-bold text-white transition-colors hover:bg-brand-600"
          >
            글쓰기
          </Link>
        </div>
      )}

      <Pagination basePath={base} page={page} totalPages={totalPages} q={q} />
    </PageShell>
  );
}
