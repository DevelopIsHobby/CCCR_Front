"use server";

import { revalidatePath } from "next/cache";
import { ready } from "@/lib/db/migrate";
import { now } from "@/lib/db/driver";
import { requireAdmin } from "@/lib/auth/session";
import { isAudience, isDate } from "@/lib/edu-course";

export type CourseFormState = { error?: string; ok?: boolean };

/*
  교육 과정 저장·숨기기·지우기(관리자).
  홈 카드(home-card-actions.ts)와 같은 짜임새다.
*/

/** 링크는 http(s) 주소만 받는다. 아카데미는 다른 사이트다 */
function checkHref(href: string): string | null {
  if (!href) return null;
  if (/^https?:\/\//i.test(href)) return null;
  return "신청 링크는 http:// 또는 https:// 로 시작하는 주소여야 합니다.";
}

export async function saveCourse(_prev: CourseFormState, formData: FormData): Promise<CourseFormState> {
  await requireAdmin();

  const value = (key: string) => String(formData.get(key) ?? "").trim();
  const id = Number(formData.get("id")) || 0;
  const course = {
    title: value("title"),
    audience: value("audience"),
    summary: value("summary"),
    href: value("href"),
    /* 우리 서버에 올린 그림만 받는다 */
    posterUrl: /^\/api\/images\/\d+$/.test(value("posterUrl")) ? value("posterUrl") : "",
    applyFrom: value("applyFrom"),
    applyUntil: value("applyUntil"),
    startsOn: value("startsOn"),
    endsOn: value("endsOn"),
  };

  if (!course.title) return { error: "과정명을 입력해 주세요." };
  if (!isAudience(course.audience)) return { error: "과정 구분(재직자·미취업자)을 골라 주세요." };
  if (course.title.length > 120) return { error: "과정명은 120자 이내로 적어 주세요." };
  if (course.summary.length > 60) return { error: "요약은 60자 이내로 적어 주세요." };
  const hrefError = checkHref(course.href);
  if (hrefError) return { error: hrefError };
  for (const [key, label] of [
    ["applyFrom", "접수 시작일"],
    ["applyUntil", "접수 마감일"],
    ["startsOn", "교육 시작일"],
    ["endsOn", "교육 종료일"],
  ] as const) {
    if (!isDate(course[key])) return { error: `${label}을 골라 주세요.` };
  }
  if (course.applyFrom > course.applyUntil) {
    return { error: "접수 마감일이 접수 시작일보다 빠릅니다." };
  }
  if (course.startsOn > course.endsOn) {
    return { error: "교육 종료일이 교육 시작일보다 빠릅니다." };
  }

  const db = await ready();
  const stamp = now();
  const values = [
    course.title,
    course.audience,
    course.summary,
    course.href,
    course.posterUrl,
    course.applyFrom,
    course.applyUntil,
    course.startsOn,
    course.endsOn,
  ];

  if (id) {
    await db.run(
      `UPDATE edu_courses
          SET title = ?, audience = ?, summary = ?, href = ?, poster_url = ?, apply_from = ?, apply_until = ?,
              starts_on = ?, ends_on = ?, updated_at = ?
        WHERE id = ?`,
      [...values, stamp, id],
    );
  } else {
    await db.run(
      `INSERT INTO edu_courses
         (title, audience, summary, href, poster_url, apply_from, apply_until, starts_on, ends_on,
          created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [...values, stamp, stamp],
    );
  }

  refresh();
  return { ok: true };
}

export async function toggleCourse(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!id) return;
  const db = await ready();
  const row = await db.get<{ is_visible: number }>("SELECT is_visible FROM edu_courses WHERE id = ?", [id]);
  if (!row) return;
  await db.run("UPDATE edu_courses SET is_visible = ?, updated_at = ? WHERE id = ?", [
    Number(row.is_visible) === 1 ? 0 : 1,
    now(),
    id,
  ]);
  refresh();
}

export async function deleteCourse(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!id) return;
  const db = await ready();
  await db.run("DELETE FROM edu_courses WHERE id = ?", [id]);
  refresh();
}

function refresh() {
  revalidatePath("/");
  revalidatePath("/admin/education");
}
