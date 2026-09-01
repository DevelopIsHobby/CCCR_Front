"use server";

import { revalidatePath } from "next/cache";
import { ready } from "@/lib/db/migrate";
import { now } from "@/lib/db/driver";
import { requireAdmin } from "@/lib/auth/session";
import { deletePostsWithFiles } from "@/lib/db/post-delete";
import { BOARDS, getBoard } from "@/lib/boards";

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
