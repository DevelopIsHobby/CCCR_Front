"use client";

import type { RelatedSite } from "@/lib/site-content-types";

/*
  관련기관 바로가기.
  전에는 고르기만 하고 아무 일도 일어나지 않는 목록이었다. 고르면 새 창으로 연다.
*/
export default function RelatedSiteSelect({ sites }: { sites: RelatedSite[] }) {
  if (sites.length === 0) return null;

  return (
    <>
      <label htmlFor="related-sites" className="sr-only">
        관련기관 바로가기
      </label>
      <select
        id="related-sites"
        defaultValue=""
        onChange={(e) => {
          const url = e.target.value;
          e.target.value = "";
          if (url) window.open(url, "_blank", "noopener,noreferrer");
        }}
        className="w-full min-w-[260px] appearance-none rounded-md border border-white/20 bg-navy-950 px-4 py-3 text-base text-white outline-none transition-colors focus:border-flame-500 lg:w-auto"
      >
        <option value="" disabled>
          관련기관 바로가기
        </option>
        {sites.map((site) => (
          <option key={site.id} value={site.url}>
            {site.name}
          </option>
        ))}
      </select>
    </>
  );
}
