"use server";

import { revalidatePath } from "next/cache";
import { ready } from "@/lib/db/migrate";
import { now } from "@/lib/db/driver";
import { requireAdmin } from "@/lib/auth/session";
import { deleteUpload, saveUpload } from "@/lib/uploads";
import { MIN_PROMO_BODY, type PromoStatus } from "@/lib/promo-types";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_FILE_BYTES = 10 * 1024 * 1024;

const trimmed = (formData: FormData, key: string, max: number) =>
  String(formData.get(key) ?? "")
    .trim()
    .slice(0, max);

export type PromoState = { error?: string; ok?: string };

/*
  홍보 신청.

  그림·첨부는 따로 올리지 않고 이 액션이 한 번에 받는다.
  로그인 없이 쓰는 창구라 아무 때나 파일을 받는 자리를 열어 두면
  저장소를 낭비시키기 쉽다. 나머지 칸이 모두 옳을 때만 파일을 남긴다.
*/
export async function submitPromo(_prev: PromoState, formData: FormData): Promise<PromoState> {
  /* 사람이 채우지 않는 칸. 채워져 있으면 자동 입력이다. */
  if (String(formData.get("website") ?? "")) return { ok: "신청을 받았습니다." };

  const org = trimmed(formData, "org", 100);
  const name = trimmed(formData, "name", 50);
  const position = trimmed(formData, "position", 50);
  const email = trimmed(formData, "email", 200).toLowerCase();
  const tel = trimmed(formData, "tel", 50);
  const subject = trimmed(formData, "subject", 200);
  const body = trimmed(formData, "body", 4000);
  const tagline = trimmed(formData, "tagline", 200);
  const startOn = trimmed(formData, "startOn", 10);
  const cadence = trimmed(formData, "cadence", 10);

  if (!org) return { error: "기관·회사명을 입력해 주세요." };
  if (!name) return { error: "신청자 이름을 입력해 주세요." };
  if (!EMAIL.test(email)) return { error: "이메일 주소를 다시 확인해 주세요." };
  if (!subject) return { error: "홍보 제목을 입력해 주세요." };
  if (body.length < MIN_PROMO_BODY) {
    return { error: `홍보 내용을 ${MIN_PROMO_BODY}자 이상 적어 주세요. (지금 ${body.length}자)` };
  }
  if (!DATE.test(startOn)) return { error: "홍보 희망일을 골라 주세요." };
  if (startOn < new Date().toISOString().slice(0, 10)) {
    return { error: "지난 날짜로는 신청할 수 없습니다." };
  }
  if (!["once", "weekly", "biweekly", "monthly"].includes(cadence)) {
    return { error: "홍보 주기를 골라 주세요." };
  }

  const image = formData.get("image");
  const file = formData.get("file");

  if (image instanceof File && image.size > 0) {
    if (!IMAGE_TYPES.has(image.type)) {
      return { error: "홍보 이미지는 JPG · PNG · GIF · WEBP 만 올릴 수 있습니다." };
    }
    if (image.size > MAX_IMAGE_BYTES) {
      return { error: `홍보 이미지는 ${MAX_IMAGE_BYTES / 1024 / 1024}MB 이하만 올릴 수 있습니다.` };
    }
  }
  if (file instanceof File && file.size > MAX_FILE_BYTES) {
    return { error: `첨부파일은 ${MAX_FILE_BYTES / 1024 / 1024}MB 이하만 올릴 수 있습니다.` };
  }

  const db = await ready();
  const stamp = now();

  /* 파일부터 남긴다. 여기서 막히면 글도 넣지 않는다. */
  let imageId: number | null = null;
  let saved: Awaited<ReturnType<typeof saveUpload>> | null = null;

  try {
    if (image instanceof File && image.size > 0) {
      const up = await saveUpload(image);
      const row = await db.get<{ id: number }>(
        `INSERT INTO images (filename, stored_name, byte_size, mime_type, created_at)
         VALUES (?, ?, ?, ?, ?) RETURNING id`,
        [up.filename, up.storedName, up.byteSize, up.mimeType, stamp],
      );
      imageId = Number(row?.id) || null;
    }
    if (file instanceof File && file.size > 0) {
      saved = await saveUpload(file);
    }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "파일을 저장하지 못했습니다." };
  }

  await db.run(
    `INSERT INTO promo_requests
       (org, name, position, email, tel, subject, body, tagline, start_on, cadence,
        image_id, file_name, file_stored, file_bytes, file_mime, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      org,
      name,
      position,
      email,
      tel,
      subject,
      body,
      tagline,
      startOn,
      cadence,
      imageId,
      saved?.filename ?? "",
      saved?.storedName ?? "",
      saved?.byteSize ?? 0,
      saved?.mimeType ?? "",
      stamp,
      stamp,
    ],
  );

  revalidatePath("/admin/promos");
  return { ok: "신청을 받았습니다. 사무국에서 검토한 뒤 연락드리겠습니다." };
}

export async function setPromoStatus(id: number, status: PromoStatus): Promise<void> {
  await requireAdmin();
  if (!id) return;

  const db = await ready();
  await db.run("UPDATE promo_requests SET status = ?, updated_at = ? WHERE id = ?", [
    status,
    now(),
    id,
  ]);
  revalidatePath("/admin/promos");
}

export async function deletePromo(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = Number(formData.get("id"));
  if (!id) return;

  const db = await ready();

  /* 이 신청만 쓰던 그림과 첨부는 함께 지운다 */
  const row = await db.get<{ image_id: number | null; file_stored: string }>(
    "SELECT image_id, file_stored FROM promo_requests WHERE id = ?",
    [id],
  );
  if (!row) return;

  await db.run("DELETE FROM promo_requests WHERE id = ?", [id]);

  if (row.image_id) {
    const image = await db.get<{ stored_name: string }>(
      "SELECT stored_name FROM images WHERE id = ?",
      [row.image_id],
    );
    if (image) {
      await db.run("DELETE FROM images WHERE id = ?", [row.image_id]);
      await deleteUpload(image.stored_name);
    }
  }
  if (row.file_stored) await deleteUpload(row.file_stored);

  revalidatePath("/admin/promos");
}
