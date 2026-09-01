"use server";

import { revalidatePath } from "next/cache";
import { ready } from "@/lib/db/migrate";
import { now } from "@/lib/db/driver";
import { requireAdmin } from "@/lib/auth/session";

export type SiteContentState = { error?: string; ok?: boolean };

function refresh() {
  /* 푸터는 모든 화면에 있고, 사무실은 찾아오시는 길에 나온다 */
  revalidatePath("/", "layout");
}

/* ── 관련기관 ─────────────────────────────────────── */

export async function saveRelatedSite(
  _prev: SiteContentState,
  formData: FormData,
): Promise<SiteContentState> {
  await requireAdmin();

  const id = Number(formData.get("id")) || 0;
  const name = String(formData.get("name") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();

  if (!name) return { error: "기관 이름을 입력해 주세요." };
  if (url && !/^https?:\/\//i.test(url)) {
    return { error: "주소는 http:// 또는 https:// 로 시작해야 합니다." };
  }

  const db = await ready();
  const stamp = now();

  if (id) {
    await db.run("UPDATE related_sites SET name = ?, url = ?, updated_at = ? WHERE id = ?", [
      name,
      url,
      stamp,
      id,
    ]);
  } else {
    const last = await db.get<{ max_order: number | null }>(
      "SELECT MAX(sort_order) AS max_order FROM related_sites",
    );
    await db.run(
      `INSERT INTO related_sites (name, url, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)`,
      [name, url, Number(last?.max_order ?? 0) + 1, stamp, stamp],
    );
  }

  refresh();
  return { ok: true };
}

export async function deleteRelatedSite(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!id) return;

  const db = await ready();
  await db.run("DELETE FROM related_sites WHERE id = ?", [id]);
  refresh();
}

export async function reorderRelatedSites(ids: number[]): Promise<void> {
  await requireAdmin();
  if (ids.length === 0) return;

  const db = await ready();
  const rows = await db.all<{ id: number }>("SELECT id FROM related_sites");
  const owned = new Set(rows.map((r) => Number(r.id)));
  if (ids.length !== owned.size || ids.some((id) => !owned.has(id))) return;

  const stamp = now();
  await db.transaction(async () => {
    for (const [i, id] of ids.entries()) {
      await db.run("UPDATE related_sites SET sort_order = ?, updated_at = ? WHERE id = ?", [
        i + 1,
        stamp,
        id,
      ]);
    }
  });
  refresh();
}

/* ── 사무실 ───────────────────────────────────────── */

export async function saveOffice(
  _prev: SiteContentState,
  formData: FormData,
): Promise<SiteContentState> {
  await requireAdmin();

  const id = Number(formData.get("id")) || 0;
  const value = (key: string) => String(formData.get(key) ?? "").trim();
  const name = value("name");

  if (!name) return { error: "사무실 이름을 입력해 주세요." };

  const db = await ready();
  const stamp = now();
  const fields = [
    name,
    value("address"),
    value("tel"),
    value("fax"),
    value("note"),
    String(formData.get("transit") ?? "").trim(),
    /* 좌표는 숫자만 받는다. 잘못 적으면 지도 대신 자리표시자가 나온다. */
    /^-?\d+(\.\d+)?$/.test(value("mapLat")) ? value("mapLat") : "",
    /^-?\d+(\.\d+)?$/.test(value("mapLng")) ? value("mapLng") : "",
  ];

  if (id) {
    await db.run(
      `UPDATE offices SET name = ?, address = ?, tel = ?, fax = ?, note = ?, transit = ?,
              map_lat = ?, map_lng = ?, updated_at = ?
        WHERE id = ?`,
      [...fields, stamp, id],
    );
  } else {
    const last = await db.get<{ max_order: number | null }>(
      "SELECT MAX(sort_order) AS max_order FROM offices",
    );
    await db.run(
      `INSERT INTO offices (name, address, tel, fax, note, transit, map_lat, map_lng,
                            sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [...fields, Number(last?.max_order ?? 0) + 1, stamp, stamp],
    );
  }

  refresh();
  return { ok: true };
}

export async function deleteOffice(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!id) return;

  const db = await ready();
  await db.run("DELETE FROM offices WHERE id = ?", [id]);
  refresh();
}
