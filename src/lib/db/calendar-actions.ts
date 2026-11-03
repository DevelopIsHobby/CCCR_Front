"use server";

import { revalidatePath } from "next/cache";
import { ready } from "@/lib/db/migrate";
import { now } from "@/lib/db/driver";
import { requireAdmin } from "@/lib/auth/session";
import { isDate } from "@/lib/edu-course";
import { CALENDAR_KINDS, isCalendarKind } from "@/lib/calendar";
import { OFF_KINDS_KEY } from "@/lib/db/calendar";

/*
  관리자 → 달력 일정. 직접 넣는 일정(조합 일정)·하나씩 숨기기·종류별 켜고 끄기.
  어느 것이든 바뀌면 메인 달력에 바로 보이도록 메인과 이 화면을 새로 그린다.
*/

export type CalendarFormState = { error?: string; ok?: boolean };

function refresh() {
  revalidatePath("/");
  revalidatePath("/admin/calendar");
}

/** 링크는 사이트 안 경로(/…) 또는 http(s) 주소만 받는다 */
function checkHref(href: string): string | null {
  if (!href) return null;
  if (href.startsWith("/") && !href.startsWith("//")) return null;
  if (/^https?:\/\//i.test(href)) return null;
  return "링크는 / 로 시작하는 사이트 안 주소이거나 http:// · https:// 주소여야 합니다.";
}

export async function saveCalendarEvent(
  _prev: CalendarFormState,
  formData: FormData,
): Promise<CalendarFormState> {
  await requireAdmin();

  const value = (key: string) => String(formData.get(key) ?? "").trim();
  const id = Number(formData.get("id")) || 0;
  const title = value("title");
  const startsOn = value("startsOn");
  /* 끝나는 날을 비우면 하루짜리 */
  const endsOn = value("endsOn") || startsOn;
  const href = value("href");

  if (!title) return { error: "일정 이름을 입력해 주세요." };
  if (title.length > 100) return { error: "일정 이름은 100자 이내로 적어 주세요." };
  if (!isDate(startsOn)) return { error: "시작일을 골라 주세요." };
  if (!isDate(endsOn)) return { error: "종료일이 올바르지 않습니다." };
  if (startsOn > endsOn) return { error: "종료일이 시작일보다 빠릅니다." };
  const hrefError = checkHref(href);
  if (hrefError) return { error: hrefError };

  const db = await ready();
  const stamp = now();
  if (id) {
    await db.run(
      `UPDATE calendar_events SET title = ?, starts_on = ?, ends_on = ?, href = ?, updated_at = ?
        WHERE id = ?`,
      [title, startsOn, endsOn, href, stamp, id],
    );
  } else {
    await db.run(
      `INSERT INTO calendar_events (title, starts_on, ends_on, href, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, startsOn, endsOn, href, stamp, stamp],
    );
  }
  refresh();
  return { ok: true };
}

export async function deleteCalendarEvent(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!id) return;
  const db = await ready();
  await db.run("DELETE FROM calendar_events WHERE id = ?", [id]);
  /* 지운 일정의 숨김 표시도 남기지 않는다 */
  await db.run("DELETE FROM calendar_hidden WHERE item_key = ?", [`custom-${id}`]);
  refresh();
}

/** 일정 하나를 달력에서 숨기거나 다시 보인다. 글·과정은 그대로 둔다 */
export async function toggleCalendarHidden(formData: FormData): Promise<void> {
  await requireAdmin();
  const key = String(formData.get("key") ?? "");
  /* 항목 이름 꼴만 받는다(lib/db/calendar.ts) */
  if (!/^(events|announce|course|custom)-\d+$/.test(key)) return;

  const db = await ready();
  const row = await db.get<{ item_key: string }>(
    "SELECT item_key FROM calendar_hidden WHERE item_key = ?",
    [key],
  );
  if (row) await db.run("DELETE FROM calendar_hidden WHERE item_key = ?", [key]);
  else await db.run("INSERT INTO calendar_hidden (item_key, created_at) VALUES (?, ?)", [key, now()]);
  refresh();
}

/** 종류별 보이기. 체크한 종류만 보이고 나머지는 꺼 둔다 */
export async function saveCalendarKinds(formData: FormData): Promise<void> {
  await requireAdmin();
  const on = new Set(formData.getAll("kind").map(String).filter(isCalendarKind));
  const off = CALENDAR_KINDS.filter((k) => !on.has(k)).join(",");

  const db = await ready();
  await db.run(
    `INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, ?)
     ON CONFLICT (key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    [OFF_KINDS_KEY, off, now()],
  );
  refresh();
}
