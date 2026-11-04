"use server";

import { revalidatePath } from "next/cache";
import { ready } from "@/lib/db/migrate";
import { now } from "@/lib/db/driver";
import { requireAdmin } from "@/lib/auth/session";
import { CALENDAR_KINDS, isCalendarKind } from "@/lib/calendar";
import { OFF_KINDS_KEY } from "@/lib/db/calendar";

/*
  관리자 → 달력 일정. 하나씩 숨기기·종류별 켜고 끄기.
  어느 것이든 바뀌면 메인 달력에 바로 보이도록 메인과 이 화면을 새로 그린다.
*/

function refresh() {
  revalidatePath("/");
  revalidatePath("/admin/calendar");
}

/** 일정 하나를 달력에서 숨기거나 다시 보인다. 글·과정은 그대로 둔다 */
export async function toggleCalendarHidden(formData: FormData): Promise<void> {
  await requireAdmin();
  const key = String(formData.get("key") ?? "");
  /* 항목 이름 꼴만 받는다(lib/db/calendar.ts) */
  if (!/^(events|announce|course)-\d+$/.test(key)) return;

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
