import SmartLink from "./SmartLink";
import NewsTabs, { type NewsItem } from "./NewsTabs";
import { listHomeCards } from "@/lib/db/home-cards";
import { BOARDS } from "@/lib/boards";
import { listRecentByBoard } from "@/lib/db/posts";
import { formatDate } from "@/lib/format";
import { IconArrow } from "./Icons";

/** 등록 7일 이내면 새 글로 표시한다. 게시판 목록과 같은 기준이다. */
const isNew = (iso: string) =>
  Date.now() - new Date(`${iso.replace(" ", "T")}Z`).getTime() < 7 * 24 * 60 * 60 * 1000;

export default async function NewsSection() {
  /* 메인에는 showOnHome 인 게시판만 모은다. */
  const homeBoards = BOARDS.filter((b) => b.showOnHome);
  const posts = await listRecentByBoard(homeBoards.map((b) => b.slug));
  const promos = await listHomeCards("promo");

  const items: NewsItem[] = posts.map((p) => ({
    id: p.id,
    board: p.board,
    boardName: BOARDS.find((b) => b.slug === p.board)?.name ?? p.board,
    href: `${BOARDS.find((b) => b.slug === p.board)?.basePath ?? "/board"}/${p.id}`,
    title: p.title,
    createdAt: formatDate(p.createdAt),
    isNew: isNew(p.createdAt),
  }));

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

        {/* 알림판 — 좌측 목록 높이에 맞춰 카드가 늘어난다 */}
        <div className="flex min-w-0 flex-col">
          <h2 className="text-2xl font-bold text-navy-900 lg:text-3xl">알림판</h2>
          <div className="mt-7 flex flex-1 flex-col gap-4">
            {promos.map((item) => (
              <SmartLink
                key={item.id}
                href={item.href}
                className="group relative flex min-h-[190px] flex-1 flex-col justify-center overflow-hidden rounded-xl bg-navy-900 p-7 transition-colors hover:bg-navy-800"
              >
                <div className="relative">
                  <span className="label-mono text-flame-500">{item.label}</span>
                  <p className="mt-3 text-lg font-bold leading-snug text-white">{item.title}</p>
                  <p className="mt-2 text-base leading-relaxed text-brand-100/70">{item.body}</p>
                  <span className="mt-6 flex items-center gap-2 text-sm font-semibold text-white">
                    바로가기
                    <IconArrow className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </SmartLink>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
