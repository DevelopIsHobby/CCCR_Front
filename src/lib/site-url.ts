/*
  사이트 주소.

  메일 본문의 링크, sitemap, 공유 카드가 모두 같은 주소를 써야 한다.
  server-only 로 두지 않는다. 메타데이터를 만들 때도 부르기 때문이다.

  SITE_URL 로 정하고, 없으면 Vercel 이 알려 주는 주소를 쓴다.
  둘 다 없는 개발 환경에서는 localhost 다.
*/
export function siteUrl(): string {
  const explicit = process.env.SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return "http://localhost:3000";
}

/*
  검색에 잡히지 않게 할지.

  미리보기 주소(*.vercel.app)는 정식 주소가 아니다. 색인되면 나중에 진짜 주소와 내용이
  겹쳐 검색 순위에 손해이므로, 사이트 주소가 vercel.app 이면 따로 정하지 않아도 막는다.
  SITE_URL 을 정식 도메인으로 바꾸면 저절로 풀린다.

  SITE_NOINDEX=1 이면 주소와 상관없이 막고, SITE_NOINDEX=0 이면 주소와 상관없이 연다.
*/
export function isNoindex(): boolean {
  const flag = process.env.SITE_NOINDEX?.trim();
  if (flag === "1") return true;
  if (flag === "0") return false;
  try {
    return new URL(siteUrl()).hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
}
