import PromoSlot from "./PromoSlot";
import NewsTabs, { type NewsItem } from "./NewsTabs";
import { listHomeCards } from "@/lib/db/home-cards";
import { BOARDS, postHref } from "@/lib/boards";
import { listRecentByBoard } from "@/lib/db/posts";
import { formatDate } from "@/lib/format";

/** 등록 7일 이내면 새 글로 표시한다. 게시판 목록과 같은 기준이다. */
const isNew = (iso: string) =>
  Date.now() - new Date(`${iso.replace(" ", "T")}Z`).getTime() < 7 * 24 * 60 * 60 * 1000;

export default async function NewsSection() {
  /* 메인에는 showOnHome 인 게시판만 모은다. */
  const homeBoards = BOARDS.filter((b) => b.showOnHome);
  /* 서로 기다릴 일이 없는 조회다. 줄 세우면 왕복이 두 번이 된다. */
  const [posts, promos] = await Promise.all([
    listRecentByBoard(homeBoards.map((b) => b.slug)),
    listHomeCards("promo"),
  ]);

  const items: NewsItem[] = posts.map((p) => {
    const board = BOARDS.find((b) => b.slug === p.board);
    return {
      id: p.id,
      board: p.board,
      boardName: board?.name ?? p.board,
      /* 산업뉴스는 원문 기사로 바로 보낸다(목록·검색과 같다) */
      href: board ? postHref(board, p.id, p.link?.url) : `/board/${p.id}`,
      title: p.title,
      createdAt: formatDate(p.createdAt),
      isNew: isNew(p.createdAt),
    };
  });

  return (
    <section className="mx-auto max-w-[1280px] px-6 py-10 lg:py-12">
      {/*
        격자 칸은 기본이 min-width:auto 라 속 내용보다 좁아지기를 거부한다.
        탭 이름이 길어지면 칸이 화면 밖으로 밀려 나가고, 넘친 만큼 화면 전체가
        가로로 흔들린다. min-w-0 을 주어 칸이 먼저 줄고, 줄지 못하는 것(탭 줄)은
        제 안에서 가로로 밀리게 한다.
      */}
      <div className="grid gap-12 lg:grid-cols-[1.7fr_1fr] lg:gap-14">
        {/* 새소식 */}
        <div className="min-w-0">
          <NewsTabs items={items} tabs={homeBoards.map((b) => ({ slug: b.slug, name: b.name }))} />
        </div>

        {/* 지금 모집 중 — 짙은 칸 하나. 좌측 목록 높이에 맞춰 늘어난다 */}
        {promos.length > 0 && (
          <div className="flex min-w-0 flex-col">
            <h2 className="text-2xl font-bold text-navy-900 lg:text-3xl">
              지금 <span className="text-flame-500">모집 중</span>
            </h2>
            <div className="mt-7 flex flex-1 flex-col">
              <PromoSlot promos={promos} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
