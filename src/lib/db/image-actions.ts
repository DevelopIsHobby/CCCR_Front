"use server";

import { ready } from "@/lib/db/migrate";
import { now } from "@/lib/db/driver";
import { requireAdmin } from "@/lib/auth/session";
import { saveUpload } from "@/lib/uploads";

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"]);
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export type ImageUploadResult = { url: string } | { error: string };

/** 본문 편집기에서 이미지를 넣을 때 호출한다. 관리자만 올릴 수 있다. */
export async function uploadImage(formData: FormData): Promise<ImageUploadResult> {
  const session = await requireAdmin();

  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "이미지를 찾을 수 없습니다." };
  }

  /*
    SVG 는 스크립트를 품을 수 있어 받지 않는다.
    관리자만 올리더라도 브라우저에서 그대로 실행되는 형식은 피한다.
  */
  if (!IMAGE_TYPES.has(file.type) || file.type === "image/svg+xml") {
    return { error: "JPG, PNG, GIF, WEBP 형식만 넣을 수 있습니다." };
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return { error: `이미지는 ${MAX_IMAGE_BYTES / 1024 / 1024}MB 이하만 넣을 수 있습니다.` };
  }

  try {
    const saved = await saveUpload(file);
    const db = await ready();
    const row = await db.get<{ id: number }>(
      `INSERT INTO images (filename, stored_name, byte_size, mime_type, width, height, uploaded_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
      [
        saved.filename,
        saved.storedName,
        saved.byteSize,
        saved.mimeType,
        saved.width,
        saved.height,
        session.userId,
        now(),
      ],
    );
    return { url: `/api/images/${Number(row?.id)}` };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "이미지 저장에 실패했습니다." };
  }
}
