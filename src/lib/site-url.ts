/*
  사이트 주소.

  메일 본문의 링크, sitemap, 공유 카드가 모두 같은 주소를 써야 한다.
  server-only 로 두지 않는다. 메타데이터를 만들 때도 부르기 때문이다.

  SITE_URL 로 정한다. 없는 개발 환경에서는 localhost 다.
  (2026-10 Vercel 미리보기를 걷어냈다. 운영은 카페24 서버 하나뿐이다.)
*/
export function siteUrl(): string {
  const explicit = process.env.SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  return "http://localhost:3000";
}

/*
  검색에 잡히지 않게 할지.

  정식 공개 전까지는 .env.production 의 SITE_NOINDEX=1 로 막아 둔다.
  공개하는 날 그 줄을 지우면(또는 SITE_NOINDEX=0) 열린다.
*/
export function isNoindex(): boolean {
  return process.env.SITE_NOINDEX?.trim() === "1";
}
