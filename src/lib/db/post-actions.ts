"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ready } from "@/lib/db/migrate";
import { now } from "@/lib/db/driver";
import { requireAdmin, getSession } from "@/lib/auth/session";
import { saveUpload, deleteUpload } from "@/lib/uploads";
import { isEmptyHtml, sanitizePostBody } from "@/lib/html";
import { boardPath as pathOf, getBoard } from "@/lib/boards";

export type PostFormState = { error?: string };

function boardPath(board: string) {
  if (!getBoard(board)) throw new Error(`알 수 없는 게시판: ${board}`);
  return pathOf(board);
}

/*
  게시글에 함께 보여줄 링크.
  주소 형식이 아니면 저장하지 않는다. javascript: 같은 주소를 막기 위해서다.
*/
function linkFields(formData: FormData) {
  const url = String(formData.get("linkUrl") ?? "").trim();
  const label = String(formData.get("linkLabel") ?? "").trim();

  if (!url) return [null, null] as const;
  if (!/^https?:\/\//i.test(url)) return [null, null] as const;

  return [url, label || null] as const;
}

/*
  행사 관련 입력. 행사정보 게시판이 아니면 전부 null 로 저장한다.
  빈 문자열은 "값 없음"이므로 null 로 눕힌다.
*/
function eventFields(board: string, formData: FormData) {
  const empty = [null, null, null, null, null] as const;
  if (!getBoard(board)?.hasEventFields) return empty;

  const value = (key: string) => {
    const raw = String(formData.get(key) ?? "").trim();
    return raw === "" ? null : raw;
  };

  return [
    value("eventHost"),
    value("eventPlace"),
    value("eventStartsOn"),
    value("eventEndsOn"),
    value("eventApplyBy"),
  ] as const;
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
  /* 편집기가 보낸 HTML 은 허용 태그만 남긴다 */
  const raw = String(formData.get("body") ?? "").trim();
  const body = isEmptyHtml(raw) ? "" : sanitizePostBody(raw);

  if (!title) return { error: "제목을 입력해 주세요." };
  if (title.length > 200) return { error: "제목은 200자 이내로 입력해 주세요." };

  const rawLink = String(formData.get("linkUrl") ?? "").trim();
  if (rawLink && !/^https?:\/\//i.test(rawLink)) {
    return { error: "링크는 http:// 또는 https:// 로 시작해야 합니다." };
  }

  boardPath(board); // 알 수 없는 게시판이면 여기서 걸린다

  const db = await ready();
  const stamp = now();
  const inserted = await db.get<{ id: number }>(
    `INSERT INTO posts (board, title, body, author_id, author_name, is_pinned, is_locked,
                        created_at, updated_at,
                        event_host, event_place, event_starts_on, event_ends_on, event_apply_by,
                        link_url, link_label)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
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
      ...eventFields(board, formData),
      ...linkFields(formData),
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
  const raw = String(formData.get("body") ?? "").trim();
  const body = isEmptyHtml(raw) ? "" : sanitizePostBody(raw);

  if (!id) return { error: "글을 찾을 수 없습니다." };
  if (!title) return { error: "제목을 입력해 주세요." };

  const rawLink = String(formData.get("linkUrl") ?? "").trim();
  if (rawLink && !/^https?:\/\//i.test(rawLink)) {
    return { error: "링크는 http:// 또는 https:// 로 시작해야 합니다." };
  }

  boardPath(board);

  const db = await ready();
  await db.run(
    `UPDATE posts
        SET title = ?, body = ?, is_pinned = ?, is_locked = ?, updated_at = ?,
            event_host = ?, event_place = ?, event_starts_on = ?, event_ends_on = ?,
            event_apply_by = ?, link_url = ?, link_label = ?
      WHERE id = ? AND board = ?`,
    [
      title,
      body,
      formData.get("isPinned") ? 1 : 0,
      formData.get("isLocked") ? 1 : 0,
      now(),
      ...eventFields(board, formData),
      ...linkFields(formData),
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
  const post = await db.get<{ body: string }>("SELECT body FROM posts WHERE id = ?", [id]);

  await db.run("DELETE FROM posts WHERE id = ? AND board = ?", [id, board]);
  for (const f of files) await deleteUpload(f.stored_name);
  if (post) await deleteOrphanImages(post.body);

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

/*
  본문에 넣었던 이미지 정리.
  글을 지워도 이미지 파일은 남으므로, 다른 글이 쓰고 있지 않은 것만 함께 지운다.
*/
async function deleteOrphanImages(body: string): Promise<void> {
  const ids = [...body.matchAll(/\/api\/images\/(\d+)/g)].map((m) => Number(m[1]));
  if (ids.length === 0) return;

  const db = await ready();
  for (const imageId of new Set(ids)) {
    const stillUsed = await db.get<{ n: number }>(
      "SELECT COUNT(*) AS n FROM posts WHERE body LIKE ?",
      [`%/api/images/${imageId}%`],
    );
    if (Number(stillUsed?.n ?? 0) > 0) continue;

    const image = await db.get<{ stored_name: string }>(
      "SELECT stored_name FROM images WHERE id = ?",
      [imageId],
    );
    if (!image) continue;

    await db.run("DELETE FROM images WHERE id = ?", [imageId]);
    await deleteUpload(image.stored_name);
  }
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
