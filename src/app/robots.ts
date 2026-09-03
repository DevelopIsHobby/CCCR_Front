import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

/*
  검색 로봇 안내.

  미리보기 배포(SITE_NOINDEX=1)에서는 전부 막는다. 정식 주소가 생기기 전에
  색인되면 나중에 같은 내용이 두 주소에 있게 되어 검색 순위에 손해다.

  관리자 화면과 개인 화면은 늘 막는다. 로그인해야 열리지만, 주소가 검색에
  뜨는 것 자체가 좋지 않다. 조회 링크(참여 현황)는 접수번호가 주소에 들어가
  있어 더더욱 막아야 한다.
*/
export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();

  if (process.env.SITE_NOINDEX === "1") {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/mypage", "/participate/status", "/login", "/signup", "/api"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
