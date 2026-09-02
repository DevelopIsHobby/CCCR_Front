"use server";

import { revalidatePath } from "next/cache";
import { ready } from "@/lib/db/migrate";
import { now } from "@/lib/db/driver";
import { requireAdmin } from "@/lib/auth/session";
import type { HomeCardKind } from "@/lib/db/home-cards";

export type HomeCardFormState = { error?: string; ok?: boolean };

const KINDS: HomeCardKind[] = ["slide", "banner", "promo"];

function readForm(formData: FormData) {
  const kind = String(formData.get("kind") ?? "") as HomeCardKind;
  if (!KINDS.includes(kind)) throw new Error(`알 수 없는 종류: ${kind}`);

  const value = (key: string) => String(formData.get(key) ?? "").trim();
  return {
    kind,
    label: value("label"),
    title: value("title"),
    body: value("body"),
    caption: value("caption") || null,
    dateText: value("dateText") || null,
    icon: value("icon"),
    href: value("href"),
  };
}

/** 링크는 사이트 안 경로(/로 시작) 또는 http(s) 주소만 받는다. */
function checkHref(href: string): string | null {
  if (!href) return null;
  if (href.startsWith("/") && !href.startsWith("//")) return null;
  if (/^https?:\/\//i.test(href)) return null;
  return "링크는 / 로 시작하는 사이트 안 주소이거나 http:// · https:// 주소여야 합니다.";
}

export async function saveHomeCard(
  _prev: HomeCardFormState,
  formData: FormData,
): Promise<HomeCardFormState> {
  await requireAdmin();

  const id = Number(formData.get("id")) || 0;
  const card = readForm(formData);

  if (!card.title) return { error: "제목을 입력해 주세요." };
  const hrefError = checkHref(card.href);
  if (hrefError) return { error: hrefError };

  const db = await ready();
  const stamp = now();

  if (id) {
    await db.run(
      `UPDATE home_cards
          SET label = ?, title = ?, body = ?, caption = ?, date_text = ?, href = ?, icon = ?, updated_at = ?
        WHERE id = ? AND kind = ?`,
      [card.label, card.title, card.body, card.caption, card.dateText, card.href, card.icon, stamp, id, card.kind],
    );
  } else {
    /* 새 카드는 맨 뒤에 붙인다 */
    const last = await db.get<{ max_order: number | null }>(
      "SELECT MAX(sort_order) AS max_order FROM home_cards WHERE kind = ?",
      [card.kind],
    );
    await db.run(
      `INSERT INTO home_cards (kind, sort_order, label, title, body, caption, date_text, href, icon, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        card.kind,
        Number(last?.max_order ?? 0) + 1,
        card.label,
        card.title,
        card.body,
        card.caption,
        card.dateText,
        card.href,
        card.icon,
        stamp,
        stamp,
      ],
    );
  }

  refresh();
  return { ok: true };
}

export async function deleteHomeCard(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!id) return;

  const db = await ready();
  await db.run("DELETE FROM home_cards WHERE id = ?", [id]);
  refresh();
}

export async function toggleHomeCard(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!id) return;

  const db = await ready();
  const row = await db.get<{ is_visible: number }>(
    "SELECT is_visible FROM home_cards WHERE id = ?",
    [id],
  );
  if (!row) return;

  await db.run("UPDATE home_cards SET is_visible = ?, updated_at = ? WHERE id = ?", [
    Number(row.is_visible) === 1 ? 0 : 1,
    now(),
    id,
  ]);
  refresh();
}

/**
 * 끌어다 놓은 결과를 그대로 저장한다.
 * 화면에서 보이는 차례대로 id 를 받아 1번부터 다시 매긴다.
 */
export async function reorderHomeCards(kind: HomeCardKind, ids: number[]): Promise<void> {
  await requireAdmin();
  if (!KINDS.includes(kind) || ids.length === 0) return;

  const db = await ready();

  /* 넘어온 id 가 정말 이 종류의 카드인지 확인한다. */
  const rows = await db.all<{ id: number }>("SELECT id FROM home_cards WHERE kind = ?", [kind]);
  const owned = new Set(rows.map((r) => Number(r.id)));
  if (ids.length !== owned.size || ids.some((id) => !owned.has(id))) return;

  const stamp = now();
  await db.transaction(async () => {
    for (const [i, id] of ids.entries()) {
      await db.run("UPDATE home_cards SET sort_order = ?, updated_at = ? WHERE id = ?", [
        i + 1,
        stamp,
        id,
      ]);
    }
  });

  refresh();
}

/** 끌기를 쓸 수 없을 때를 위한 위·아래 이동. */
export async function moveHomeCard(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = Number(formData.get("id"));
  const direction = String(formData.get("direction"));
  if (!id || (direction !== "up" && direction !== "down")) return;

  const db = await ready();
  const card = await db.get<{ kind: string; sort_order: number }>(
    "SELECT kind, sort_order FROM home_cards WHERE id = ?",
    [id],
  );
  if (!card) return;

  const neighbor = await db.get<{ id: number; sort_order: number }>(
    direction === "up"
      ? `SELECT id, sort_order FROM home_cards
          WHERE kind = ? AND (sort_order < ? OR (sort_order = ? AND id < ?))
          ORDER BY sort_order DESC, id DESC LIMIT 1`
      : `SELECT id, sort_order FROM home_cards
          WHERE kind = ? AND (sort_order > ? OR (sort_order = ? AND id > ?))
          ORDER BY sort_order ASC, id ASC LIMIT 1`,
    [card.kind, card.sort_order, card.sort_order, id],
  );
  if (!neighbor) return;

  const stamp = now();
  await db.run("UPDATE home_cards SET sort_order = ?, updated_at = ? WHERE id = ?", [
    Number(neighbor.sort_order),
    stamp,
    id,
  ]);
  await db.run("UPDATE home_cards SET sort_order = ?, updated_at = ? WHERE id = ?", [
    Number(card.sort_order),
    stamp,
    neighbor.id,
  ]);

  /* 순서 값이 같아 뒤바뀌지 않는 경우를 막기 위해 전체를 다시 매긴다 */
  const all = await db.all<{ id: number }>(
    "SELECT id FROM home_cards WHERE kind = ? ORDER BY sort_order, id",
    [card.kind],
  );
  for (const [i, row] of all.entries()) {
    await db.run("UPDATE home_cards SET sort_order = ? WHERE id = ?", [i + 1, row.id]);
  }

  refresh();
}

function refresh() {
  revalidatePath("/");
  revalidatePath("/admin");
}
