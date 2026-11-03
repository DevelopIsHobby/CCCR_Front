import NewsTabs, { type NewsItem } from "./NewsTabs";
import CalendarCard from "./CalendarCard";
import { addMonths, type CalendarEntry } from "@/lib/calendar";
import { BOARDS, postHref } from "@/lib/boards";
import { listCalendarPosts, listRecentByBoard } from "@/lib/db/posts";
import { listVisibleCourses } from "@/lib/db/edu-courses";
import { formatDate, noticeStatus, today } from "@/lib/format";
import { EDUCATION_SCHEDULE_URL } from "@/lib/site-data";

/** 등록 7일 이내면 새 글로 표시한다. 게시판 목록과 같은 기준이다. */
const isNew = (iso: string) =>
  Date.now() - new Date(`${iso.replace(" ", "T")}Z`).getTime() < 7 * 24 * 60 * 60 * 1000;

/** '2026.10.21' → '10.21'. 메인 목록은 폭이 좁아 연도를 뺀다 */
const shortDate = (iso: string) => formatDate(iso).slice(5);

/*
  메인 '조합 소식'(왼쪽 탭 목록)과 '일정 달력'(오른쪽 칸).
  오른쪽은 전에 '지금 모집 중' 홍보 알림판 자리였다. 바뀐 까닭은 NewsTabs·CalendarCard 참고.
*/
export default async function NewsSection() {
  /* 메인에는 showOnHome 인 게시판만 모은다. 서로 기다릴 일이 없는 조회다 */
  const homeBoards = BOARDS.filter((b) => b.showOnHome);
  const now = today();
  /* 달력은 지난달부터 석 달 뒤까지 넘겨 볼 수 있게 그만큼 일정을 실어 보낸다 */
  const from = `${addMonths(now.slice(0, 7), -1)}-01`;
  const to = `${addMonths(now.slice(0, 7), 4)}-01`;
  const [posts, calendarPosts, courses] = await Promise.all([
    listRecentByBoard(
      homeBoards.map((b) => b.slug),
      5,
    ),
    listCalendarPosts(from, to),
    listVisibleCourses(),
  ]);

  /*
    달력에 찍을 일정 = 행사(여는 날~끝나는 날) + 사업공고(접수 마감일) + 아카데미 교육(교육 기간).
  */
  const calendar: CalendarEntry[] = [
    ...calendarPosts.flatMap((post): CalendarEntry[] => {
      const board = BOARDS.find((b) => b.slug === post.board);
      if (!board) return [];
      const href = postHref(board, post.id, post.link?.url);
      const key = `${post.board}-${post.id}`;
      if (post.board === "events" && post.event.startsOn) {
        return [
          {
            key,
            kind: "행사",
            title: post.title,
            href,
            start: post.event.startsOn,
            end: post.event.endsOn || post.event.startsOn,
          },
        ];
      }
      if (post.event.applyBy) {
        return [
          {
            key,
            kind: "공고 마감",
            title: post.title,
            href,
            start: post.event.applyBy,
            end: post.event.applyBy,
          },
        ];
      }
      return [];
    }),
    ...courses
      .filter((c) => c.endsOn >= from && c.startsOn < to)
      .map((c): CalendarEntry => ({
        key: `course-${c.id}`,
        kind: "교육",
        title: c.title,
        /* 신청 주소가 없는 과정은 아카데미 일정으로 */
        href: c.href || EDUCATION_SCHEDULE_URL,
        start: c.startsOn,
        end: c.endsOn || c.startsOn,
      })),
  ];

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

        {/*
          제목은 화면에서 빼고(달력 머리의 '2026년 11월'이 제목 노릇을 한다) 화면 낭독기에만 남긴다.
          카드는 왼쪽 '조합 소식' 제목 줄부터 목록 끝까지 높이를 함께 쓴다.
        */}
        <div className="flex min-w-0 flex-col">
          <h2 className="sr-only">일정 달력</h2>
          <CalendarCard entries={calendar} today={now} />
        </div>
      </div>
    </section>
  );
}
