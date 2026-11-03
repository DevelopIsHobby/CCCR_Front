import NewsTabs, { type NewsItem } from "./NewsTabs";
import { BOARDS, postHref } from "@/lib/boards";
import { listRecentByBoard } from "@/lib/db/posts";
import { formatDate, noticeStatus } from "@/lib/format";

/** 등록 7일 이내면 새 글로 표시한다. 게시판 목록과 같은 기준이다. */
const isNew = (iso: string) =>
  Date.now() - new Date(`${iso.replace(" ", "T")}Z`).getTime() < 7 * 24 * 60 * 60 * 1000;

/** '2026.10.21' → '10.21'. 메인 목록은 폭이 좁아 연도를 뺀다 */
const shortDate = (iso: string) => formatDate(iso).slice(5);

/*
  메인 '조합 소식'. 홍보 칸이 많다는 의견으로 오른쪽 '지금 모집 중' 알림판을 빼고(2026-11-03)
  소식 목록이 폭을 다 쓴다. 탭·두 줄 배치는 NewsTabs 참고.
*/
export default async function NewsSection() {
  /* 메인에는 showOnHome 인 게시판만 모은다. 탭 하나에 10건까지 보이므로 게시판마다 10건 */
  const homeBoards = BOARDS.filter((b) => b.showOnHome);
  const posts = await listRecentByBoard(
    homeBoards.map((b) => b.slug),
    10,
  );

  const items: NewsItem[] = posts.map((p) => {
    const board = BOARDS.find((b) => b.slug === p.board);
    const status = board?.hasDeadlineFields ? noticeStatus(p.event) : null;
    return {
      id: p.id,
      board: p.board,
      boardName: board?.name ?? p.board,
      /* 산업뉴스·사업공고는 원문으로 바로 보낸다(목록·검색과 같다) */
      href: board ? postHref(board, p.id, p.link?.url) : `/board/${p.id}`,
      title: p.title,
      /* 사업공고는 언제 올렸는지보다 언제까지인지가 궁금하다 */
      date:
        board?.hasDeadlineFields && p.event.applyBy
          ? `~${shortDate(p.event.applyBy)}`
          : shortDate(p.createdAt),
      createdAt: p.createdAt,
      isNew: isNew(p.createdAt),
      status,
    };
  });

  return (
    <section className="mx-auto max-w-[1280px] px-6 py-10 lg:py-12">
      <NewsTabs
        items={items}
        tabs={homeBoards.map((b) => ({ slug: b.slug, name: b.name, href: b.basePath }))}
      />
    </section>
  );
}
