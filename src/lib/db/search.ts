import "server-only";
import { ready } from "./migrate";
import { BOARDS, getBoard } from "@/lib/boards";
import { NAV } from "@/lib/site-data";

/*
  통합검색.

  게시글은 DB 에서 찾고, 안내 화면(인사말·가입안내 같은 것)은 메뉴 이름에서
  찾는다. 안내 화면의 본문까지 뒤지려면 화면마다 색인을 따로 만들어야 하는데,
  화면이 스무 개 남짓이라 이름만으로도 찾아갈 수 있다.
*/

export type PostHit = {
  id: number;
  board: string;
  boardName: string;
  href: string;
  title: string;
  /** 본문에서 찾은 낱말 앞뒤를 잘라 낸 것. 제목에만 있으면 빈 값이다. */
  snippet: string;
  createdAt: string;
};

export type PageHit = { label: string; category: string; href: string };

export type SearchResult = {
  q: string;
  posts: PostHit[];
  pages: PageHit[];
  total: number;
};

const PER_PAGE = 30;

/** 본문에서 찾은 자리 앞뒤를 잘라 낸다. 태그는 지우고 글자만 남긴다. */
function snippetOf(body: string, q: string): string {
  const text = body
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();

  const at = text.toLowerCase().indexOf(q.toLowerCase());
  if (at === -1) return "";

  const from = Math.max(0, at - 30);
  const to = Math.min(text.length, at + q.length + 60);
  return `${from > 0 ? "…" : ""}${text.slice(from, to)}${to < text.length ? "…" : ""}`;
}

export async function search(q: string): Promise<SearchResult> {
  const term = q.trim();
  if (term.length < 2) return { q: term, posts: [], pages: [], total: 0 };

  const db = await ready();
  const like = `%${term}%`;

  /* 잠근 글은 목록에 보이므로 함께 찾는다. 숨김 상태는 게시판에 따로 없다. */
  const rows = await db.all<{
    id: number;
    board: string;
    title: string;
    body: string;
    created_at: string;
  }>(
    `SELECT id, board, title, body, created_at FROM posts
      WHERE deleted_at = '' AND (title LIKE ? OR body LIKE ?)
      ORDER BY id DESC LIMIT ?`,
    [like, like, PER_PAGE],
  );

  const known = new Set(BOARDS.map((b) => b.slug));

  const posts: PostHit[] = rows
    .filter((r) => known.has(r.board))
    .map((r) => {
      const board = getBoard(r.board)!;
      return {
        id: Number(r.id),
        board: r.board,
        boardName: board.name,
        href: `${board.basePath}/${r.id}`,
        title: r.title,
        snippet: snippetOf(r.body ?? "", term),
        createdAt: r.created_at,
      };
    });

  /* 안내 화면은 메뉴 이름으로 찾는다 */
  const lower = term.toLowerCase();
  const pages: PageHit[] = NAV.flatMap((section) =>
    section.children
      .filter((child) => child.label.toLowerCase().includes(lower))
      .map((child) => ({ label: child.label, category: section.label, href: child.href })),
  );

  return { q: term, posts, pages, total: posts.length + pages.length };
}
