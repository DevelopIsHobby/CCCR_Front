"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ready } from "@/lib/db/migrate";
import { now } from "@/lib/db/driver";
import { requireAdmin, getSession } from "@/lib/auth/session";
import { saveUpload, deleteUpload } from "@/lib/uploads";

export type PostFormState = { error?: string };

const BOARD_PATH: Record<string, string> = {
  notice: "/board/notice",
  events: "/board/events",
};

function boardPath(board: string) {
  const path = BOARD_PATH[board];
  if (!path) throw new Error(`알 수 없는 게시판: ${board}`);
  return path;
}

/** 목록·상세 어디서 글이 바뀌든 관련 경로를 함께 새로 고친다. */
function refreshBoard(board: string, id?: number) {
  const base = boardPath(board);
  revalidatePath(base);
  if (id) revalidatePath(`${base}/${id}`);
}

export async function createPost(
  _prev: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  const session = await requireAdmin();

  const board = String(formData.get("board") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (!title) return { error: "제목을 입력해 주세요." };
  if (title.length > 200) return { error: "제목은 200자 이내로 입력해 주세요." };
  boardPath(board); // 알 수 없는 게시판이면 여기서 걸린다

  const db = await ready();
  const stamp = now();
  const inserted = await db.get<{ id: number }>(
    `INSERT INTO posts (board, title, body, author_id, author_name, is_pinned, is_locked, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
    [
      board,
      title,
      body,
      session.userId,
      session.name,
      formData.get("isPinned") ? 1 : 0,
      formData.get("isLocked") ? 1 : 0,
      stamp,
      stamp,
    ],
  );

  const postId = Number(inserted?.id);

  try {
    await attachFiles(postId, formData.getAll("files"));
  } catch (err) {
    return { error: err instanceof Error ? err.message : "첨부파일 저장에 실패했습니다." };
  }

  refreshBoard(board, postId);
  redirect(`${boardPath(board)}/${postId}`);
}

export async function updatePost(
  _prev: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  await requireAdmin();

  const id = Number(formData.get("id"));
  const board = String(formData.get("board") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (!id) return { error: "글을 찾을 수 없습니다." };
  if (!title) return { error: "제목을 입력해 주세요." };
  boardPath(board);

  const db = await ready();
  await db.run(
    `UPDATE posts
        SET title = ?, body = ?, is_pinned = ?, is_locked = ?, updated_at = ?
      WHERE id = ? AND board = ?`,
    [
      title,
      body,
      formData.get("isPinned") ? 1 : 0,
      formData.get("isLocked") ? 1 : 0,
      now(),
      id,
      board,
    ],
  );

  /* 체크가 풀린 기존 첨부는 지운다. */
  const keep = new Set(formData.getAll("keepAttachment").map((v) => Number(v)));
  const current = await db.all<{ id: number; stored_name: string }>(
    "SELECT id, stored_name FROM attachments WHERE post_id = ?",
    [id],
  );

  for (const a of current) {
    if (keep.has(a.id)) continue;
    await db.run("DELETE FROM attachments WHERE id = ?", [a.id]);
    await deleteUpload(a.stored_name);
  }

  try {
    await attachFiles(id, formData.getAll("files"));
  } catch (err) {
    return { error: err instanceof Error ? err.message : "첨부파일 저장에 실패했습니다." };
  }

  refreshBoard(board, id);
  redirect(`${boardPath(board)}/${id}`);
}

export async function deletePost(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = Number(formData.get("id"));
  const board = String(formData.get("board") ?? "");
  if (!id) return;
  boardPath(board);

  const db = await ready();
  const files = await db.all<{ stored_name: string }>(
    "SELECT stored_name FROM attachments WHERE post_id = ?",
    [id],
  );

  await db.run("DELETE FROM posts WHERE id = ? AND board = ?", [id, board]);
  for (const f of files) await deleteUpload(f.stored_name);

  refreshBoard(board, id);
  redirect(boardPath(board));
}

/** 상세 페이지에서 한 번만 호출한다. 목록 프리페치로 조회수가 늘지 않도록 클라이언트에서 부른다. */
export async function recordView(id: number): Promise<void> {
  if (!Number.isInteger(id)) return;
  const db = await ready();
  await db.run("UPDATE posts SET views = views + 1 WHERE id = ?", [id]);
}

/** 잠금글 본문을 볼 수 있는지 확인한다. */
export async function canReadLocked(): Promise<boolean> {
  return (await getSession()) !== null;
}

async function attachFiles(postId: number, files: FormDataEntryValue[]) {
  const db = await ready();

  for (const entry of files) {
    if (!(entry instanceof File) || entry.size === 0) continue;

    const saved = await saveUpload(entry);
    await db.run(
      `INSERT INTO attachments (post_id, filename, stored_name, byte_size, mime_type, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [postId, saved.filename, saved.storedName, saved.byteSize, saved.mimeType, now()],
    );
  }
}
