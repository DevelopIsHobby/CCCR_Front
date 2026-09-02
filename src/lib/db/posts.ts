import "server-only";
import { ready } from "./migrate";

export type PostRow = {
  id: number;
  /** 화면에 보이는 게시글 번호. 등록 순서대로 1부터 매겨진다. */
  seq: number;
  board: string;
  title: string;
  authorName: string;
  isPinned: boolean;
  isLocked: boolean;
  views: number;
  createdAt: string;
  attachmentCount: number;
  /** 본문과 별개로 게시글에 걸어 두는 링크. 없으면 null. */
  link: PostLink | null;
  /** 행사정보 게시판에서만 채운다. 나머지 게시판은 전부 null 이다. */
  event: EventInfo;
  /** 본문 맨 앞의 그림. 카드형 목록의 대표 그림으로 쓴다. 없으면 null. */
  thumbUrl: string | null;
};

export type PostLink = {
  url: string;
  /** 화면에 보여줄 이름. 비우면 주소를 그대로 보여준다. */
  label: string | null;
};

export type EventInfo = {
  host: string | null;
  place: string | null;
  startsOn: string | null;
  endsOn: string | null;
  applyBy: string | null;
};

export type PostDetail = PostRow & {
  body: string;
  updatedAt: string;
  attachments: Attachment[];
};

export type Attachment = {
  id: number;
  filename: string;
  byteSize: number;
  mimeType: string;
};

export const PER_PAGE = 15;

type RawRow = {
  id: number;
  seq: number;
  board: string;
  title: string;
  author_name: string;
  is_pinned: number;
  is_locked: number;
  views: number;
  created_at: string;
  attachment_count: number;
  event_host: string | null;
  event_place: string | null;
  event_starts_on: string | null;
  event_ends_on: string | null;
  event_apply_by: string | null;
  link_url: string | null;
  link_label: string | null;
  /* NUMBERED 가 p.* 를 그대로 넘기므로 본문도 함께 온다 */
  body: string | null;
};

/** 본문에서 맨 앞 그림 주소를 뽑는다. 우리가 저장한 그림만 본다. */
function firstImage(body: string | null): string | null {
  const found = body?.match(/\/api\/images\/\d+/);
  return found ? found[0] : null;
}

function toPost(r: RawRow): PostRow {
  return {
    id: r.id,
    seq: Number(r.seq),
    board: r.board,
    title: r.title,
    authorName: r.author_name,
    isPinned: Number(r.is_pinned) === 1,
    isLocked: Number(r.is_locked) === 1,
    views: Number(r.views),
    createdAt: r.created_at,
    attachmentCount: Number(r.attachment_count),
    link: r.link_url ? { url: r.link_url, label: r.link_label ?? null } : null,
    thumbUrl: firstImage(r.body),
    event: {
      host: r.event_host ?? null,
      place: r.event_place ?? null,
      startsOn: r.event_starts_on ?? null,
      endsOn: r.event_ends_on ?? null,
      applyBy: r.event_apply_by ?? null,
    },
  };
}

/*
  번호(seq)는 등록 순서로 매기므로 목록·상세 어디서 조회하든 같은 값이 나오도록
  공통 서브쿼리 하나에서 계산한다.
*/
const NUMBERED = `
  SELECT
    p.*,
    ROW_NUMBER() OVER (PARTITION BY p.board ORDER BY p.id ASC) AS seq,
    (SELECT COUNT(*) FROM attachments a WHERE a.post_id = p.id) AS attachment_count
  FROM posts p
`;

export async function listPosts(opts: { board: string; page?: number; q?: string }) {
  const db = await ready();
  const page = Math.max(1, opts.page ?? 1);
  const q = opts.q?.trim() ?? "";
  const like = `%${q}%`;

  const countRow = await db.get<{ n: number }>(
    `SELECT COUNT(*) AS n FROM posts WHERE board = ?${q ? " AND title LIKE ?" : ""}`,
    q ? [opts.board, like] : [opts.board],
  );
  const total = Number(countRow?.n ?? 0);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const current = Math.min(page, totalPages);

  const rows = await db.all<RawRow>(
    `SELECT * FROM (${NUMBERED}) numbered WHERE board = ?${q ? " AND title LIKE ?" : ""}
     ORDER BY id DESC LIMIT ? OFFSET ?`,
    q
      ? [opts.board, like, PER_PAGE, (current - 1) * PER_PAGE]
      : [opts.board, PER_PAGE, (current - 1) * PER_PAGE],
  );

  /* 검색 중에는 고정 공지를 띄우지 않는다. 검색 결과만 보이는 편이 낫다. */
  const pinned = q
    ? []
    : await db.all<RawRow>(
        `SELECT * FROM (${NUMBERED}) numbered WHERE board = ? AND is_pinned = 1 ORDER BY id DESC`,
        [opts.board],
      );

  return {
    pinned: pinned.map(toPost),
    rows: rows.map(toPost),
    total,
    page: current,
    totalPages,
  };
}

export async function getPost(board: string, id: number): Promise<PostDetail | null> {
  if (!Number.isInteger(id)) return null;

  const db = await ready();
  const row = await db.get<RawRow & { body: string; updated_at: string }>(
    `SELECT * FROM (${NUMBERED}) numbered WHERE board = ? AND id = ?`,
    [board, id],
  );
  if (!row) return null;

  const attachments = await db.all<{
    id: number;
    filename: string;
    byte_size: number;
    mime_type: string;
  }>(
    "SELECT id, filename, byte_size, mime_type FROM attachments WHERE post_id = ? ORDER BY id",
    [id],
  );

  return {
    ...toPost(row),
    body: row.body,
    updatedAt: row.updated_at,
    attachments: attachments.map((a) => ({
      id: a.id,
      filename: a.filename,
      byteSize: Number(a.byte_size),
      mimeType: a.mime_type,
    })),
  };
}

/** 같은 게시판의 이전 글(더 최신)·다음 글(더 예전). */
export async function getNeighbors(board: string, id: number) {
  const db = await ready();
  const prev = await db.get<{ id: number; title: string }>(
    "SELECT id, title FROM posts WHERE board = ? AND id > ? ORDER BY id ASC LIMIT 1",
    [board, id],
  );
  const next = await db.get<{ id: number; title: string }>(
    "SELECT id, title FROM posts WHERE board = ? AND id < ? ORDER BY id DESC LIMIT 1",
    [board, id],
  );
  return { prev, next };
}

/*
  메인 새소식용. 게시판별로 최신 몇 건씩 가져와 하나로 합친다.
  전체 목록에서 상위 N 건만 뽑으면 글이 뜸한 게시판이 탭에서 통째로 비어
  보이므로, 게시판마다 같은 수만큼 가져온다.
*/
export async function listRecentByBoard(boards: string[], perBoard = 6): Promise<PostRow[]> {
  const db = await ready();
  const collected: RawRow[] = [];

  for (const board of boards) {
    const rows = await db.all<RawRow>(
      `SELECT * FROM (${NUMBERED}) numbered WHERE board = ? ORDER BY id DESC LIMIT ?`,
      [board, perBoard],
    );
    collected.push(...rows);
  }

  return collected
    .map(toPost)
    .sort((a, b) => (a.createdAt === b.createdAt ? b.id - a.id : a.createdAt < b.createdAt ? 1 : -1));
}
