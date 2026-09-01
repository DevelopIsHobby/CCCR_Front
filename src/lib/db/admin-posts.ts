import "server-only";
import { ready } from "./migrate";
import { BOARDS } from "@/lib/boards";

/* 관리자 화면에서 전체 게시판 글을 한 번에 본다. */
export type AdminPostRow = {
  id: number;
  board: string;
  title: string;
  authorName: string;
  isPinned: boolean;
  isLocked: boolean;
  views: number;
  createdAt: string;
  attachmentCount: number;
};

export const ADMIN_POSTS_PER_PAGE = 20;

type RawRow = {
  id: number;
  board: string;
  title: string;
  author_name: string;
  is_pinned: number;
  is_locked: number;
  views: number;
  created_at: string;
  attachment_count: number;
};

const toRow = (r: RawRow): AdminPostRow => ({
  id: r.id,
  board: r.board,
  title: r.title,
  authorName: r.author_name,
  isPinned: Number(r.is_pinned) === 1,
  isLocked: Number(r.is_locked) === 1,
  views: Number(r.views),
  createdAt: r.created_at,
  attachmentCount: Number(r.attachment_count),
});

export async function listAdminPosts(opts: { board?: string; q?: string; page?: number }) {
  const db = await ready();
  const q = opts.q?.trim() ?? "";
  const board = BOARDS.some((b) => b.slug === opts.board) ? opts.board : undefined;
  const page = Math.max(1, opts.page ?? 1);

  const where: string[] = [];
  const params: (string | number)[] = [];

  if (board) {
    where.push("board = ?");
    params.push(board);
  }
  if (q) {
    where.push("(title LIKE ? OR body LIKE ?)");
    params.push(`%${q}%`, `%${q}%`);
  }
  const whereSql = where.length ? ` WHERE ${where.join(" AND ")}` : "";

  const countRow = await db.get<{ n: number }>(
    `SELECT COUNT(*) AS n FROM posts${whereSql}`,
    params,
  );
  const total = Number(countRow?.n ?? 0);
  const totalPages = Math.max(1, Math.ceil(total / ADMIN_POSTS_PER_PAGE));
  const current = Math.min(page, totalPages);

  const rows = await db.all<RawRow>(
    `SELECT p.id, p.board, p.title, p.author_name, p.is_pinned, p.is_locked, p.views, p.created_at,
            (SELECT COUNT(*) FROM attachments a WHERE a.post_id = p.id) AS attachment_count
       FROM posts p${whereSql.replace("WHERE", "WHERE")}
      ORDER BY p.id DESC
      LIMIT ? OFFSET ?`,
    [...params, ADMIN_POSTS_PER_PAGE, (current - 1) * ADMIN_POSTS_PER_PAGE],
  );

  return { rows: rows.map(toRow), total, page: current, totalPages };
}

/** 게시판별 글 수. 필터 탭에 함께 보여준다. */
export async function countPostsByBoard(): Promise<Record<string, number>> {
  const db = await ready();
  const rows = await db.all<{ board: string; n: number }>(
    "SELECT board, COUNT(*) AS n FROM posts GROUP BY board",
  );

  const counts: Record<string, number> = {};
  for (const row of rows) counts[row.board] = Number(row.n);
  return counts;
}
