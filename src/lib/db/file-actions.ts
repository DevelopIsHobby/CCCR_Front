"use server";

import { readdir, stat, unlink } from "node:fs/promises";
import { join } from "node:path";
import { revalidatePath } from "next/cache";
import { ready } from "@/lib/db/migrate";
import { requireAdmin } from "@/lib/auth/session";
import { deleteUpload, safeStoredName, UPLOAD_DIR } from "@/lib/uploads";
import { imageUsedSql, isImageUsed } from "@/lib/db/image-usage";

export type FileActionState = { error?: string; ok?: string };

function refresh() {
  revalidatePath("/admin/files");
}

/** 첨부파일 한 건 삭제. 글에서도 목록이 사라진다. */
export async function deleteAttachmentFile(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = Number(formData.get("id"));
  if (!id) return;

  const db = await ready();
  const row = await db.get<{ stored_name: string }>(
    "SELECT stored_name FROM attachments WHERE id = ?",
    [id],
  );
  if (!row) return;

  await db.run("DELETE FROM attachments WHERE id = ?", [id]);
  await deleteUpload(row.stored_name);
  revalidatePath("/", "layout");
  refresh();
}

/** 본문 이미지 한 건 삭제. 쓰고 있는 글이 있으면 막는다. */
export async function deleteImageFile(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = Number(formData.get("id"));
  if (!id) return;

  const db = await ready();
  if (await isImageUsed(db, id)) return;

  const row = await db.get<{ stored_name: string }>(
    "SELECT stored_name FROM images WHERE id = ?",
    [id],
  );
  if (!row) return;

  await db.run("DELETE FROM images WHERE id = ?", [id]);
  await deleteUpload(row.stored_name);
  refresh();
}

/** 어느 글도 쓰지 않는 이미지를 한꺼번에 지운다. */
export async function deleteUnusedImages(
  _prev: FileActionState,
  _formData: FormData,
): Promise<FileActionState> {
  await requireAdmin();

  const db = await ready();
  const rows = await db.all<{ id: number; stored_name: string }>(
    `SELECT id, stored_name FROM images i WHERE NOT ${imageUsedSql("i.id")}`,
  );

  for (const row of rows) {
    await db.run("DELETE FROM images WHERE id = ?", [row.id]);
    await deleteUpload(row.stored_name);
  }

  refresh();
  return { ok: rows.length ? `이미지 ${rows.length}건을 지웠습니다.` : "지울 이미지가 없습니다." };
}

/*
  기록이 없는 파일 정리.
  DB 에 없는 파일만 지우므로 화면에 나오는 파일은 건드리지 않는다.
*/
export async function deleteOrphanFiles(
  _prev: FileActionState,
  _formData: FormData,
): Promise<FileActionState> {
  await requireAdmin();

  const db = await ready();
  const attachments = await db.all<{ stored_name: string }>(
    "SELECT stored_name FROM attachments",
  );
  const images = await db.all<{ stored_name: string }>("SELECT stored_name FROM images");
  const known = new Set([...attachments, ...images].map((r) => r.stored_name));

  let removed = 0;
  let names: string[] = [];
  try {
    names = await readdir(UPLOAD_DIR);
  } catch {
    return { ok: "업로드 폴더가 비어 있습니다." };
  }

  for (const name of names) {
    if (known.has(name)) continue;
    try {
      /* 이름 형식이 다른 파일은 우리가 만든 것이 아니므로 두고 본다 */
      safeStoredName(name);
      await stat(join(UPLOAD_DIR, name));
      await unlink(join(UPLOAD_DIR, name));
      removed += 1;
    } catch {
      /* 지울 수 없는 파일은 넘어간다 */
    }
  }

  refresh();
  return { ok: removed ? `파일 ${removed}개를 지웠습니다.` : "지울 파일이 없습니다." };
}
