"use server";

import { revalidatePath } from "next/cache";
import { ready } from "@/lib/db/migrate";
import { now } from "@/lib/db/driver";
import { requireAdmin } from "@/lib/auth/session";
import { JOIN_CONTACT_FIELDS, SITE_FIELDS } from "@/lib/site-settings-types";

export type SiteSettingsState = { error?: string; ok?: string };

export async function saveSiteSettings(
  _prev: SiteSettingsState,
  formData: FormData,
): Promise<SiteSettingsState> {
  await requireAdmin();

  const values = [...SITE_FIELDS, ...JOIN_CONTACT_FIELDS].map((field) => ({
    key: field.key,
    value: String(formData.get(field.key) ?? "").trim(),
  }));

  for (const key of ["email", "joinEmail"] as const) {
    const email = values.find((v) => v.key === key)?.value ?? "";
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { error: "이메일 주소를 다시 확인해 주세요." };
    }
  }

  const db = await ready();
  const stamp = now();

  await db.transaction(async () => {
    for (const { key, value } of values) {
      /* 있으면 고치고 없으면 넣는다. 두 방언에서 같게 동작하도록 나눠 쓴다. */
      const exists = await db.get<{ key: string }>(
        "SELECT key FROM site_settings WHERE key = ?",
        [key],
      );
      if (exists) {
        await db.run("UPDATE site_settings SET value = ?, updated_at = ? WHERE key = ?", [
          value,
          stamp,
          key,
        ]);
      } else {
        await db.run("INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, ?)", [
          key,
          value,
          stamp,
        ]);
      }
    }
  });

  /* 푸터는 모든 화면에 있으므로 전체를 새로 고친다 */
  revalidatePath("/", "layout");
  return { ok: "저장했습니다. 화면에 바로 반영됩니다." };
}
