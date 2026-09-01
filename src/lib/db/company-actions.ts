"use server";

import { revalidatePath } from "next/cache";
import { ready } from "@/lib/db/migrate";
import { now } from "@/lib/db/driver";
import { requireAdmin } from "@/lib/auth/session";
import { COMPANY_GRADES } from "@/lib/company-types";

export type CompanyFormState = { error?: string; ok?: boolean };

const GRADES = COMPANY_GRADES.map((g) => g.grade);

function refresh() {
  revalidatePath("/members/list");
  revalidatePath("/admin/companies");
}

export async function saveCompany(
  _prev: CompanyFormState,
  formData: FormData,
): Promise<CompanyFormState> {
  await requireAdmin();

  const id = Number(formData.get("id")) || 0;
  const grade = String(formData.get("grade") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  /* 주소는 프로토콜 없이 저장한다. 화면에서 https:// 를 붙인다. */
  const site = String(formData.get("site") ?? "")
    .trim()
    .replace(/^https?:\/\//i, "");

  /* 로고는 우리가 저장한 주소만 받는다 */
  const rawLogo = String(formData.get("logoUrl") ?? "").trim();
  const logoUrl = /^\/api\/images\/\d+$/.test(rawLogo) ? rawLogo : "";

  if (!GRADES.includes(grade)) return { error: "등급을 다시 선택해 주세요." };
  if (!name) return { error: "회사명을 입력해 주세요." };
  if (site && /[\s<>]/.test(site)) return { error: "홈페이지 주소를 다시 확인해 주세요." };

  const db = await ready();
  const stamp = now();

  if (id) {
    await db.run(
      "UPDATE companies SET grade = ?, name = ?, site = ?, logo_url = ?, updated_at = ? WHERE id = ?",
      [grade, name, site, logoUrl, stamp, id],
    );
  } else {
    const last = await db.get<{ max_order: number | null }>(
      "SELECT MAX(sort_order) AS max_order FROM companies WHERE grade = ?",
      [grade],
    );
    await db.run(
      `INSERT INTO companies (grade, name, site, logo_url, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [grade, name, site, logoUrl, Number(last?.max_order ?? 0) + 1, stamp, stamp],
    );
  }

  refresh();
  return { ok: true };
}

export async function deleteCompany(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!id) return;

  const db = await ready();
  await db.run("DELETE FROM companies WHERE id = ?", [id]);
  refresh();
}

export async function toggleCompany(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!id) return;

  const db = await ready();
  const row = await db.get<{ is_visible: number }>(
    "SELECT is_visible FROM companies WHERE id = ?",
    [id],
  );
  if (!row) return;

  await db.run("UPDATE companies SET is_visible = ?, updated_at = ? WHERE id = ?", [
    Number(row.is_visible) === 1 ? 0 : 1,
    now(),
    id,
  ]);
  refresh();
}

/** 끌어다 놓은 결과를 저장한다. 같은 등급 안에서만 순서를 바꾼다. */
export async function reorderCompanies(grade: string, ids: number[]): Promise<void> {
  await requireAdmin();
  if (!GRADES.includes(grade) || ids.length === 0) return;

  const db = await ready();
  const rows = await db.all<{ id: number }>("SELECT id FROM companies WHERE grade = ?", [grade]);
  const owned = new Set(rows.map((r) => Number(r.id)));
  if (ids.length !== owned.size || ids.some((id) => !owned.has(id))) return;

  const stamp = now();
  await db.transaction(async () => {
    for (const [i, id] of ids.entries()) {
      await db.run("UPDATE companies SET sort_order = ?, updated_at = ? WHERE id = ?", [
        i + 1,
        stamp,
        id,
      ]);
    }
  });

  refresh();
}

/** 등급을 옮긴다. 옮긴 등급의 맨 뒤로 붙인다. */
export async function moveCompanyGrade(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = Number(formData.get("id"));
  const grade = String(formData.get("grade") ?? "");
  if (!id || !GRADES.includes(grade)) return;

  const db = await ready();
  const last = await db.get<{ max_order: number | null }>(
    "SELECT MAX(sort_order) AS max_order FROM companies WHERE grade = ?",
    [grade],
  );
  await db.run("UPDATE companies SET grade = ?, sort_order = ?, updated_at = ? WHERE id = ?", [
    grade,
    Number(last?.max_order ?? 0) + 1,
    now(),
    id,
  ]);
  refresh();
}
