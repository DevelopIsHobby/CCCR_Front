"use server";

import { revalidatePath } from "next/cache";
import { ready } from "@/lib/db/migrate";
import { now } from "@/lib/db/driver";
import { requireAdmin } from "@/lib/auth/session";
import { deletePostsWithFiles } from "@/lib/db/post-delete";
import { BOARDS, getBoard } from "@/lib/boards";
import { iga, ro } from "@/lib/format";

export type BulkState = { error?: string; ok?: string };

function refreshBoards() {
  revalidatePath("/admin/posts");
  for (const board of BOARDS) revalidatePath(board.basePath);
  revalidatePath("/");
}

/** 목록에서 고른 글을 한꺼번에 지운다. 첨부·본문 이미지도 함께 정리된다. */
export async function bulkDeletePosts(_prev: BulkState, formData: FormData): Promise<BulkState> {
  await requireAdmin();

  const ids = formData.getAll("ids").map((v) => Number(v)).filter(Number.isInteger);
  if (ids.length === 0) return { error: "삭제할 글을 선택해 주세요." };

  const removed = await deletePostsWithFiles(ids);
  refreshBoards();
  return { ok: `${removed}건을 삭제했습니다.` };
}

/*
  상단 고정 · 회원 전용 토글.

  목록 전체가 일괄 삭제 폼 안에 있어 행마다 폼을 따로 둘 수 없다(폼 중첩 불가).
  제출 버튼의 name·value 는 서버 액션에 실리지 않으므로, 어떤 글을 바꿀지는
  bind 로 미리 묶어서 넘긴다.
*/
export async function togglePostFlag(
  id: number,
  flag: "pinned" | "locked",
  _formData: FormData,
): Promise<void> {
  await requireAdmin();

  if (!Number.isInteger(id) || (flag !== "pinned" && flag !== "locked")) return;

  const column = flag === "pinned" ? "is_pinned" : "is_locked";
  const db = await ready();
  const row = await db.get<{ value: number; board: string }>(
    `SELECT ${column} AS value, board FROM posts WHERE id = ?`,
    [id],
  );
  if (!row) return;

  await db.run(`UPDATE posts SET ${column} = ?, updated_at = ? WHERE id = ?`, [
    Number(row.value) === 1 ? 0 : 1,
    now(),
    id,
  ]);

  const board = getBoard(row.board);
  if (board) revalidatePath(`${board.basePath}/${id}`);
  refreshBoards();
}

/*
  고른 글을 다른 게시판으로 옮긴다.

  글은 한 표에 다 들어 있어 옮기는 것 자체는 `board` 한 칸을 바꾸는 일이다.
  문제는 게시판마다 목록을 그리는 방식이 달라, 옮기고 나면 화면이 비어 보일 수 있다는 것이다.

    행사정보  카드에 행사일을 보여 준다        -> 행사일이 없으면 날짜 자리가 빈다
    산업뉴스  제목을 누르면 원문으로 보낸다    -> 원문 주소가 없으면 갈 곳이 없다
    뉴스레터  표지 그림을 늘어놓는다           -> 본문에 그림이 없으면 표지가 빈다
    그 밖     제목을 누르면 본문을 보여 준다   -> 본문이 없으면 빈 화면이 나온다

  막지는 않는다. 옮겨 놓고 채우는 순서로 일하는 경우가 있기 때문이다.
  대신 무엇이 비었는지 세어서 알려 준다. 모르고 지나가는 것이 가장 나쁘다.
*/
type MoveRow = {
  id: number;
  board: string;
  body: string | null;
  link_url: string | null;
  event_starts_on: string | null;
};

/** 옮긴 뒤 그 게시판에서 비어 보일 칸의 이름. 채워져 있으면 null. */
function missingFor(target: (typeof BOARDS)[number], row: MoveRow): string | null {
  if (target.hasEventFields) return row.event_starts_on ? null : "행사일";
  if (target.layout === "links") return row.link_url ? null : "원문 주소";
  if (target.layout === "issues") return /<img/i.test(row.body ?? "") ? null : "표지 그림";
  return (row.body ?? "").trim() ? null : "본문";
}

export async function movePostsToBoard(
  _prev: BulkState,
  formData: FormData,
): Promise<BulkState> {
  await requireAdmin();

  const ids = formData.getAll("ids").map((v) => Number(v)).filter(Number.isInteger);
  if (ids.length === 0) return { error: "옮길 글을 선택해 주세요." };

  const to = String(formData.get("toBoard") ?? "");
  const target = getBoard(to);
  if (!target) return { error: "옮길 게시판을 골라 주세요." };

  const db = await ready();
  const holes = ids.map(() => "?").join(",");
  const rows = await db.all<MoveRow>(
    `SELECT id, board, body, link_url, event_starts_on
       FROM posts WHERE deleted_at = '' AND id IN (${holes})`,
    ids,
  );

  const moving = rows.filter((r) => r.board !== to);
  if (moving.length === 0) {
    return { error: `고른 글이 이미 ${target.name}에 있습니다.` };
  }

  const stamp = now();
  await db.transaction(async () => {
    for (const row of moving) {
      await db.run("UPDATE posts SET board = ?, updated_at = ? WHERE id = ?", [to, stamp, row.id]);
    }
  });

  /* 옮기기 전 주소는 이제 없는 글이 된다. 양쪽 다 새로 그리게 한다. */
  for (const row of moving) {
    const from = getBoard(row.board);
    if (from) revalidatePath(`${from.basePath}/${row.id}`);
    revalidatePath(`${target.basePath}/${row.id}`);
  }
  refreshBoards();

  const blanks = moving.map((row) => missingFor(target, row)).filter((v): v is string => v !== null);
  const stayed = rows.length - moving.length;

  let ok = `${moving.length}건을 ${target.name}${ro(target.name)} 옮겼습니다.`;
  if (stayed > 0) ok += ` ${stayed}건은 이미 그 게시판에 있어 그대로 두었습니다.`;
  if (blanks.length > 0) {
    const names = [...new Set(blanks)].join("·");
    ok += ` 그중 ${blanks.length}건은 ${names}${iga(names)} 비어 있어 목록에 제대로 보이지 않습니다. 글을 열어 채워 주세요.`;
  }
  return { ok };
}
