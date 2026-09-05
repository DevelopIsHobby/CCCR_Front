"use server";

import { revalidatePath } from "next/cache";
import { ready } from "@/lib/db/migrate";
import { softDelete } from "@/lib/db/trash";
import { now } from "@/lib/db/driver";
import { requireAdmin } from "@/lib/auth/session";
import { sanitizePostBody } from "@/lib/html";
import { TEXT_FIELDS, type CardSection } from "@/lib/about-content-types";

export type AboutState = { error?: string; ok?: boolean };

function refresh() {
  revalidatePath("/about/greeting");
  revalidatePath("/about/history");
  revalidatePath("/about/organization");
  revalidatePath("/admin/pages");
}

/* ── 문구 ─────────────────────────────────────────── */

/** 한 묶음(인사말·연혁·조직도)의 문구를 통째로 저장한다. */
export async function savePageTexts(_prev: AboutState, formData: FormData): Promise<AboutState> {
  await requireAdmin();

  const db = await ready();
  const stamp = now();

  await db.transaction(async () => {
    for (const field of TEXT_FIELDS) {
      const raw = formData.get(field.key);
      if (raw === null) continue; /* 이 묶음에 없는 칸 */

      let value = field.kind === "rich" ? sanitizePostBody(String(raw)) : String(raw).trim();

      /* 그림은 우리가 저장한 주소만 받는다 */
      if (field.kind === "image" && !/^\/api\/images\/\d+$/.test(value)) value = "";

      /* 있으면 고치고 없으면 넣는다. 두 방언에서 같게 동작하도록 나눠 쓴다. */
      const exists = await db.get<{ key: string }>("SELECT key FROM page_texts WHERE key = ?", [
        field.key,
      ]);
      if (exists) {
        await db.run("UPDATE page_texts SET value = ?, updated_at = ? WHERE key = ?", [
          value,
          stamp,
          field.key,
        ]);
      } else {
        await db.run("INSERT INTO page_texts (key, value, updated_at) VALUES (?, ?, ?)", [
          field.key,
          value,
          stamp,
        ]);
      }
    }
  });

  refresh();
  return { ok: true };
}

/* ── 설립목적 · 기구별 역할 ───────────────────────── */

export async function saveAboutCard(_prev: AboutState, formData: FormData): Promise<AboutState> {
  await requireAdmin();

  const id = Number(formData.get("id")) || 0;
  const section = String(formData.get("section") ?? "") as CardSection;
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (section !== "purpose" && section !== "role") return { error: "잘못된 요청입니다." };
  if (!title) return { error: "제목을 입력해 주세요." };

  const db = await ready();

  if (id) {
    await db.run("UPDATE about_cards SET title = ?, body = ? WHERE id = ?", [title, body, id]);
  } else {
    const last = await db.get<{ max_order: number | null }>(
      "SELECT MAX(sort_order) AS max_order FROM about_cards WHERE section = ?",
      [section],
    );
    await db.run(
      "INSERT INTO about_cards (section, title, body, sort_order) VALUES (?, ?, ?, ?)",
      [section, title, body, Number(last?.max_order ?? 0) + 1],
    );
  }

  refresh();
  return { ok: true };
}

export async function deleteAboutCard(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!id) return;

  await softDelete("aboutCard", id);
  refresh();
}

/** 드래그로 바꾼 차례를 저장한다. */
export async function reorderAboutCards(section: CardSection, ids: number[]): Promise<void> {
  await requireAdmin();
  if (section !== "purpose" && section !== "role") return;

  const db = await ready();
  await db.transaction(async () => {
    for (const [index, id] of ids.entries()) {
      await db.run("UPDATE about_cards SET sort_order = ? WHERE id = ? AND section = ?", [
        index + 1,
        id,
        section,
      ]);
    }
  });

  refresh();
}

/* ── 부서별 연락처 ────────────────────────────────── */

export async function saveDepartment(_prev: AboutState, formData: FormData): Promise<AboutState> {
  await requireAdmin();

  const id = Number(formData.get("id")) || 0;
  const name = String(formData.get("name") ?? "").trim();
  const tel = String(formData.get("tel") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  if (!name) return { error: "부서 이름을 입력해 주세요." };
  if (email && !email.includes("@")) return { error: "메일 주소를 다시 확인해 주세요." };

  const db = await ready();

  if (id) {
    await db.run("UPDATE departments SET name = ?, tel = ?, email = ? WHERE id = ?", [
      name,
      tel,
      email,
      id,
    ]);
  } else {
    const last = await db.get<{ max_order: number | null }>(
      "SELECT MAX(sort_order) AS max_order FROM departments",
    );
    await db.run("INSERT INTO departments (name, tel, email, sort_order) VALUES (?, ?, ?, ?)", [
      name,
      tel,
      email,
      Number(last?.max_order ?? 0) + 1,
    ]);
  }

  refresh();
  return { ok: true };
}

export async function deleteDepartment(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!id) return;

  await softDelete("department", id);
  refresh();
}

export async function reorderDepartments(ids: number[]): Promise<void> {
  await requireAdmin();

  const db = await ready();
  await db.transaction(async () => {
    for (const [index, id] of ids.entries()) {
      await db.run("UPDATE departments SET sort_order = ? WHERE id = ?", [index + 1, id]);
    }
  });

  refresh();
}

/* ── 연혁 ─────────────────────────────────────────── */

export async function saveHistoryEntry(_prev: AboutState, formData: FormData): Promise<AboutState> {
  await requireAdmin();

  const id = Number(formData.get("id")) || 0;
  const year = String(formData.get("year") ?? "").trim();
  const month = String(formData.get("month") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const place = String(formData.get("place") ?? "").trim();

  if (!year) return { error: "연도를 입력해 주세요." };
  if (!month) return { error: "월을 입력해 주세요." };
  if (!title) return { error: "내용을 입력해 주세요." };

  const db = await ready();

  if (id) {
    await db.run(
      "UPDATE history_entries SET year = ?, month = ?, title = ?, place = ? WHERE id = ?",
      [year, month, title, place, id],
    );
  } else {
    /* 새 항목은 같은 연도의 맨 앞에 둔다. 연혁은 최근 것이 위로 오기 때문이다. */
    const first = await db.get<{ min_order: number | null }>(
      "SELECT MIN(sort_order) AS min_order FROM history_entries WHERE year = ?",
      [year],
    );
    const order = first?.min_order === null || first?.min_order === undefined
      ? 0
      : Number(first.min_order);

    await db.run(
      "UPDATE history_entries SET sort_order = sort_order + 1 WHERE sort_order >= ?",
      [order],
    );
    await db.run(
      "INSERT INTO history_entries (year, month, title, place, sort_order) VALUES (?, ?, ?, ?, ?)",
      [year, month, title, place, order],
    );
  }

  refresh();
  return { ok: true };
}

export async function deleteHistoryEntry(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!id) return;

  await softDelete("history", id);
  refresh();
}

export async function reorderHistoryEntries(ids: number[]): Promise<void> {
  await requireAdmin();
  if (ids.length === 0) return;

  const db = await ready();

  /* 옮기는 것은 한 연도 안이므로 그 연도가 쓰던 차례 값을 그대로 다시 나눠 준다 */
  const rows = await db.all<{ sort_order: number }>(
    `SELECT sort_order FROM history_entries
     WHERE id IN (${ids.map(() => "?").join(", ")}) ORDER BY sort_order, id`,
    ids,
  );
  const slots = rows.map((r) => Number(r.sort_order));
  if (slots.length !== ids.length) return;

  await db.transaction(async () => {
    for (const [index, id] of ids.entries()) {
      await db.run("UPDATE history_entries SET sort_order = ? WHERE id = ?", [slots[index], id]);
    }
  });

  refresh();
}
