import type { MetadataRoute } from "next";
import { isNoindex, siteUrl } from "@/lib/site-url";

/*
  검색 로봇 안내.

  미리보기 주소(vercel.app, 또는 SITE_NOINDEX=1)에서는 검색에 잡히지 않게 한다.
  정식 주소가 생기기 전에 색인되면 나중에 같은 내용이 두 주소에 있게 되어 검색 순위에 손해다.

  이때도 robots.txt 로 통째로 막지는 않는다. 로봇이 화면을 못 읽으면 화면에 달린
  noindex 도 못 봐서, 이미 색인된 주소가 검색 결과에서 빠지지 않는다.
  읽는 것은 두고 화면마다 noindex 로 막으며, 사이트맵은 알리지 않는다.

  관리자 화면과 개인 화면은 늘 막는다. 로그인해야 열리지만, 주소가 검색에
  뜨는 것 자체가 좋지 않다. 조회 링크(참여 현황)는 접수번호가 주소에 들어가
  있어 더더욱 막아야 한다.
*/
/*
  요청마다 새로 만든다.

  이 파일은 기본적으로 빌드할 때 한 번 만들어져 굳는다. 그러면 공개일에
  SITE_NOINDEX 를 지워도 robots.txt 는 빌드 당시 상태로 남아, 사이트맵을 알리지 않고
  관리자 화면도 막지 않는다. 하루에 몇 번 불리는 파일이라 그때그때 만들어도 부담이 없다.
*/
export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();

  if (isNoindex()) {
    return { rules: [{ userAgent: "*", allow: "/" }] };
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
