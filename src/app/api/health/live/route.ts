import { ready } from "@/lib/db/migrate";

/*
  살아 있는지만 알린다.

  누가 봐도 되는 주소다. 그래서 아무것도 알려 주지 않는다 — 살아 있으면 200 에 "ok",
  DB 가 안 되면 503 뿐이다. 설정을 한눈에 보려면 관리자로 /api/health 를 연다(그쪽은
  발신 메일 계정 같은 것이 보이므로 관리자만 열 수 있고, 그 밖에는 404 로 답한다).

  부르는 곳
  - 밖에서 지켜보는 감시(UptimeRobot 등) — 사이트가 죽으면 메일이 오게 한다
  - scripts/deploy.sh — 배포한 뒤 새 판이 진짜 뜨는지 확인한다(안 뜨면 되돌린다)
*/
export const dynamic = "force-dynamic";

export async function GET() {
  const headers = { "cache-control": "no-store" };

  try {
    const db = await ready();
    /* 앱만 살아 있고 DB 가 죽은 경우를 가른다. 화면은 그때도 200 을 낼 수 있다 */
    await db.get("SELECT 1 AS ok");
    return new Response("ok", { status: 200, headers });
  } catch {
    return new Response("db", { status: 503, headers });
  }
}
