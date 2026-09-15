import "server-only";
import { cache } from "react";
import { ready } from "./migrate";
import { SITE_DEFAULTS, type SiteSettings, type SiteSettingKey } from "@/lib/site-settings-types";

/** 사이트 기본 정보를 한 번에 읽는다. 없는 항목은 빈 값으로 채운다. */
async function readSiteSettings(): Promise<SiteSettings> {
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

/*
  공통 틀(주소·SNS)과 푸터(연락처)가 같은 요청에서 따로 읽었다.
  React.cache 로 한 요청 안에서는 한 번만 읽는다. 관리자 화면에서 고치면 다음 요청부터 바로 보인다.
*/
export const getSiteSettings = cache(readSiteSettings);
