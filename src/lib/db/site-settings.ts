import "server-only";
import { ready } from "./migrate";
import { SITE_DEFAULTS, type SiteSettings, type SiteSettingKey } from "@/lib/site-settings-types";

/** 사이트 기본 정보를 한 번에 읽는다. 없는 항목은 빈 값으로 채운다. */
export async function getSiteSettings(): Promise<SiteSettings> {
  const db = await ready();
  const rows = await db.all<{ key: string; value: string }>(
    "SELECT key, value FROM site_settings",
  );

  const settings = { ...SITE_DEFAULTS };
  for (const row of rows) {
    if (row.key in settings) settings[row.key as SiteSettingKey] = row.value;
  }
  return settings;
}
