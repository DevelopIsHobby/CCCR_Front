import "server-only";
import { ready } from "./migrate";
import { listCalendarPosts } from "./posts";
import { listVisibleCourses } from "./edu-courses";
import { BOARDS, postHref } from "@/lib/boards";
import { EDUCATION_SCHEDULE_URL } from "@/lib/site-data";
import { isCalendarKind, type CalendarEntry, type CalendarKind } from "@/lib/calendar";

/*
  메인 '일정 달력'에 실을 일정 모으기. 메인과 관리자 화면(달력 일정)이 함께 쓴다.

  세 곳에서 온다.
    행사      행사정보 글의 여는 날~끝나는 날
    공고 마감 사업공고 글의 접수 마감일
    교육      교육 과정(관리자 → 교육 과정)의 교육 기간. 숨긴 과정은 빠진다
  항목 이름(key)은 '게시판-글번호' · 'course-번호'. 하나씩 숨길 때 이 이름을 적는다.
  (직접 넣던 '조합 일정'은 뺐다. calendar_events 표는 비어 있고 더 읽지 않는다)
*/

export type CalendarSettings = {
  /** 하나씩 숨긴 항목 이름 */
  hidden: Set<string>;
  /** 꺼 둔 종류 */
  off: Set<CalendarKind>;
};

/** site_settings 에 둔 '꺼 둔 종류' 이름 */
export const OFF_KINDS_KEY = "calendar_off_kinds";

export async function getCalendarSettings(): Promise<CalendarSettings> {
  const db = await ready();
  const [hiddenRows, offRow] = await Promise.all([
    db.all<{ item_key: string }>("SELECT item_key FROM calendar_hidden"),
    db.get<{ value: string }>("SELECT value FROM site_settings WHERE key = ?", [OFF_KINDS_KEY]),
  ]);
  const off = new Set<CalendarKind>(
    (offRow?.value ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(isCalendarKind),
  );
  return { hidden: new Set(hiddenRows.map((r) => r.item_key)), off };
}

/**
 * from~to('YYYY-MM-DD') 안에 걸친 일정을 모두 모은다. 관리자 설정(숨김·끈 종류)은 걸지 않는다 —
 * 메인은 applyCalendarSettings 로 거르고, 관리자 화면은 숨긴 것까지 보여 준다.
 */
export async function collectCalendar(from: string, to: string): Promise<CalendarEntry[]> {
  const [posts, courses] = await Promise.all([listCalendarPosts(from, to), listVisibleCourses()]);

  const fromPosts = posts.flatMap((post): CalendarEntry[] => {
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
  });

  const fromCourses = courses
    .filter((c) => c.endsOn >= from && c.startsOn < to)
    .map(
      (c): CalendarEntry => ({
        key: `course-${c.id}`,
        kind: "교육",
        title: c.title,
        /* 신청 주소가 없는 과정은 아카데미 일정으로 */
        href: c.href || EDUCATION_SCHEDULE_URL,
        start: c.startsOn,
        end: c.endsOn || c.startsOn,
      }),
    );

  return [...fromPosts, ...fromCourses].sort((a, b) =>
    a.start === b.start ? a.key.localeCompare(b.key) : a.start < b.start ? -1 : 1,
  );
}
