"use server";

import { revalidatePath } from "next/cache";
import { ready } from "@/lib/db/migrate";
import { now } from "@/lib/db/driver";
import { requireAdmin } from "@/lib/auth/session";

export type PopupState = { error?: string; ok?: string };

const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** 팝업 폭. 너무 작으면 글씨가 안 보이고 너무 크면 화면을 덮는다. */
const MIN_WIDTH = 240;
const MAX_WIDTH = 800;

function refresh() {
  revalidatePath("/");
  revalidatePath("/admin/popups");
}

export async function savePopup(_prev: PopupState, formData: FormData): Promise<PopupState> {
  await requireAdmin();

  const id = Number(formData.get("id")) || 0;
  const value = (key: string) => String(formData.get(key) ?? "").trim();

  const title = value("title").slice(0, 100);
  const imageUrl = value("imageUrl");
  const href = value("href").slice(0, 500);
  const startsOn = value("startsOn");
  const endsOn = value("endsOn");
  const width = Number(formData.get("width")) || 420;

  if (!title) return { error: "관리용 이름을 입력해 주세요." };
  if (!imageUrl) return { error: "띄울 그림을 올려 주세요." };

  /* 링크는 사이트 안 경로이거나 http(s) 주소만 받는다 */
  if (href && !href.startsWith("/")) {
    const scheme = href.slice(0, 8).toLowerCase();
    if (!scheme.startsWith("http://") && !scheme.startsWith("https://")) {
      return { error: "링크는 / 로 시작하는 사이트 안 주소이거나 http(s) 주소여야 합니다." };
    }
  }
  if (href.startsWith("//")) return { error: "링크 주소를 다시 확인해 주세요." };

  for (const [label, day] of [["시작일", startsOn], ["종료일", endsOn]] as const) {
    if (day && !DATE.test(day)) return { error: `${label}을 날짜 형식으로 골라 주세요.` };
  }
  if (startsOn && endsOn && startsOn > endsOn) {
    return { error: "종료일이 시작일보다 빠릅니다." };
  }
  if (width < MIN_WIDTH || width > MAX_WIDTH) {
    return { error: `너비는 ${MIN_WIDTH}~${MAX_WIDTH}px 사이로 정해 주세요.` };
  }

  const db = await ready();
  const stamp = now();

  if (id) {
    await db.run(
      `UPDATE popups
          SET title = ?, image_url = ?, href = ?, starts_on = ?, ends_on = ?, width = ?, updated_at = ?
        WHERE id = ?`,
      [title, imageUrl, href, startsOn, endsOn, width, stamp, id],
    );
  } else {
    const last = await db.get<{ max_order: number | null }>(
      "SELECT MAX(sort_order) AS max_order FROM popups",
    );
    await db.run(
      `INSERT INTO popups (title, image_url, href, starts_on, ends_on, width, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, imageUrl, href, startsOn, endsOn, width, Number(last?.max_order ?? 0) + 1, stamp, stamp],
    );
  }

  refresh();
  return { ok: id ? "팝업을 고쳤습니다." : "팝업을 추가했습니다." };
}

export async function togglePopup(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!id) return;

  const db = await ready();
  const row = await db.get<{ is_visible: number }>(
    "SELECT is_visible FROM popups WHERE id = ?",
    [id],
  );
  if (!row) return;

  await db.run("UPDATE popups SET is_visible = ?, updated_at = ? WHERE id = ?", [
    Number(row.is_visible) === 1 ? 0 : 1,
    now(),
    id,
  ]);
  refresh();
}

export async function deletePopup(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!id) return;

  const db = await ready();
  await db.run("DELETE FROM popups WHERE id = ?", [id]);
  refresh();
}
