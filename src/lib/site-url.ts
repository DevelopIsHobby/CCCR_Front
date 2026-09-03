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
