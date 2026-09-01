import "server-only";
import { ready } from "./migrate";
import { now } from "./driver";
import { BOARDS } from "@/lib/boards";
import { NAV } from "@/lib/site-data";

export type DayCount = { day: string; visitors: number; views: number };
export type PathCount = { path: string; label: string; views: number };
export type PopularPost = {
  id: number;
  title: string;
  board: string;
  boardName: string;
  href: string;
  views: number;
  createdAt: string;
};

export type VisitSummary = {
  today: DayCount;
  yesterday: DayCount;
  last7: DayCount;
  last30: DayCount;
  total: number;
};

/*
  오늘부터 거꾸로 n일치 날짜. 'YYYY-MM-DD'
  기록은 서버 시각(now())으로 남기므로 여기서도 같은 기준으로 센다.
  toISOString 은 UTC 로 돌려 한국 시간과 하루가 어긋나므로 쓰지 않는다.
*/
const ymd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function recentDays(n: number): string[] {
  const today = new Date(`${now().slice(0, 10)}T00:00:00`);
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (n - 1 - i));
    return ymd(d);
  });
}

async function countBetween(from: string, to: string): Promise<{ visitors: number; views: number }> {
  const db = await ready();
  const row = await db.get<{ visitors: number; views: number }>(
    `SELECT COUNT(DISTINCT visitor) AS visitors, COUNT(*) AS views
       FROM visits WHERE day >= ? AND day <= ?`,
    [from, to],
  );
  return { visitors: Number(row?.visitors ?? 0), views: Number(row?.views ?? 0) };
}

export async function getVisitSummary(): Promise<VisitSummary> {
  const days = recentDays(30);
  const today = days[days.length - 1];
  const yesterday = days[days.length - 2] ?? today;

  const db = await ready();
  const [t, y, w, m, all] = await Promise.all([
    countBetween(today, today),
    countBetween(yesterday, yesterday),
    countBetween(days[days.length - 7] ?? today, today),
    countBetween(days[0], today),
    db.get<{ n: number }>("SELECT COUNT(*) AS n FROM visits"),
  ]);

  return {
    today: { day: today, ...t },
    yesterday: { day: yesterday, ...y },
    last7: { day: "최근 7일", ...w },
    last30: { day: "최근 30일", ...m },
    total: Number(all?.n ?? 0),
  };
}

/** 최근 30일 일별 방문자. 기록이 없는 날도 0으로 채워 그래프가 끊기지 않게 한다. */
export async function getDailyVisits(): Promise<DayCount[]> {
  const days = recentDays(30);
  const db = await ready();
  const rows = await db.all<{ day: string; visitors: number; views: number }>(
    `SELECT day, COUNT(DISTINCT visitor) AS visitors, COUNT(*) AS views
       FROM visits WHERE day >= ? GROUP BY day`,
    [days[0]],
  );

  const byDay = new Map(rows.map((r) => [r.day, r]));
  return days.map((day) => ({
    day,
    visitors: Number(byDay.get(day)?.visitors ?? 0),
    views: Number(byDay.get(day)?.views ?? 0),
  }));
}

/* 주소를 사람이 읽는 이름으로. 메뉴에 없는 주소는 그대로 보여준다. */
const NAV_LABEL = new Map<string, string>([["/", "메인 화면"]]);
for (const section of NAV) {
  NAV_LABEL.set(section.href, section.label);
  for (const child of section.children) {
    NAV_LABEL.set(child.href, `${section.label} · ${child.label}`);
  }
}

export async function getTopPaths(limit = 10): Promise<PathCount[]> {
  const days = recentDays(30);
  const db = await ready();
  const rows = await db.all<{ path: string; views: number }>(
    `SELECT path, COUNT(*) AS views FROM visits WHERE day >= ?
      GROUP BY path ORDER BY views DESC, path LIMIT ${limit}`,
    [days[0]],
  );

  return rows.map((r) => ({
    path: r.path,
    label: NAV_LABEL.get(r.path) ?? r.path,
    views: Number(r.views),
  }));
}

/** 인기 게시물. 글 조회수는 예전부터 세고 있어 그대로 쓴다. */
export async function getPopularPosts(limit = 10): Promise<PopularPost[]> {
  const db = await ready();
  const rows = await db.all<{
    id: number;
    title: string;
    board: string;
    views: number;
    created_at: string;
  }>(
    `SELECT id, title, board, views, created_at FROM posts
      ORDER BY views DESC, id DESC LIMIT ${limit}`,
  );

  return rows.map((r) => {
    const board = BOARDS.find((b) => b.slug === r.board);
    return {
      id: Number(r.id),
      title: r.title,
      board: r.board,
      boardName: board?.name ?? r.board,
      href: `${board?.basePath ?? "/board"}/${r.id}`,
      views: Number(r.views),
      createdAt: r.created_at,
    };
  });
}
