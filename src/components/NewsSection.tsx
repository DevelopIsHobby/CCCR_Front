import NewsTabs, { type NewsItem } from "./NewsTabs";
import UpcomingCard from "./UpcomingCard";
import { BOARDS, postHref } from "@/lib/boards";
import { listRecentByBoard, listUpcoming } from "@/lib/db/posts";
import { formatDate, noticeStatus, today } from "@/lib/format";

/** 등록 7일 이내면 새 글로 표시한다. 게시판 목록과 같은 기준이다. */
const isNew = (iso: string) =>
  Date.now() - new Date(`${iso.replace(" ", "T")}Z`).getTime() < 7 * 24 * 60 * 60 * 1000;

/** '2026.10.21' → '10.21'. 메인 목록은 폭이 좁아 연도를 뺀다 */
const shortDate = (iso: string) => formatDate(iso).slice(5);

/*
  메인 '조합 소식'(왼쪽 탭 목록)과 '다가오는 일정'(오른쪽 칸).
  오른쪽은 전에 '지금 모집 중' 홍보 알림판 자리였다. 바뀐 까닭은 NewsTabs·UpcomingCard 참고.
*/
export default async function NewsSection() {
  /* 메인에는 showOnHome 인 게시판만 모은다. 서로 기다릴 일이 없는 조회다 */
  const homeBoards = BOARDS.filter((b) => b.showOnHome);
  const now = today();
  const [posts, upcoming] = await Promise.all([
    listRecentByBoard(
      homeBoards.map((b) => b.slug),
      5,
    ),
    /* 왼쪽 목록 다섯 줄과 높이가 맞는 수 */
    listUpcoming(now, 3),
  ]);

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
      {/*
        격자 칸은 기본이 min-width:auto 라 속 내용보다 좁아지기를 거부한다. 탭 줄이 길어지면
        칸이 밀려 화면이 가로로 흔들리므로 min-w-0 을 준다.
      */}
      <div className="grid gap-12 lg:grid-cols-[1.7fr_1fr] lg:gap-14">
        <div className="min-w-0">
          <NewsTabs
            items={items}
            tabs={homeBoards.map((b) => ({ slug: b.slug, name: b.name, href: b.basePath }))}
          />
        </div>

        <div className="flex min-w-0 flex-col">
          <h2 className="text-2xl font-bold text-navy-900 lg:text-3xl">
            다가오는 <span className="text-flame-500">일정</span>
          </h2>
          {/* 왼쪽 목록 윗선과 높이를 맞춘다(탭 줄 높이만큼) */}
          <div className="mt-6 flex flex-1 flex-col lg:mt-[1.875rem]">
            <UpcomingCard items={upcoming} today={now} />
          </div>
        </div>
      </div>
    </section>
  );
}
