"use server";

import { ready } from "@/lib/db/migrate";
import { now } from "@/lib/db/driver";
import { requireAdmin } from "@/lib/auth/session";
import { saveUpload } from "@/lib/uploads";
import { fetchRemoteImage } from "@/lib/remote-image";

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

  return storeImage(file, session.userId);
}

/*
  붙여 넣은 HTML 의 바깥 그림(다른 사이트 주소)을 내려받아 우리 그림으로 저장한다.
  편집기가 바깥 그림을 찾을 때마다 하나씩 부른다. 까닭과 막는 주소는 remote-image.ts 참고.
*/
export async function importRemoteImage(src: string): Promise<ImageUploadResult> {
  const session = await requireAdmin();
  try {
    const file = await fetchRemoteImage(String(src));
    return storeImage(file, session.userId);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "그림을 가져오지 못했습니다." };
  }
}

/** 그림 파일을 저장하고 본문에 넣을 주소를 돌려준다 */
async function storeImage(file: File, userId: number): Promise<ImageUploadResult> {
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
        userId,
        now(),
      ],
    );
    return { url: `/api/images/${Number(row?.id)}` };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "이미지 저장에 실패했습니다." };
  }
}
