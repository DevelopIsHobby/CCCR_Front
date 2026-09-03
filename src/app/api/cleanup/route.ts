import { runCleanup } from "@/lib/db/cleanup";

/*
  보관 기간이 지난 자료를 지운다. 하루 한 번 cron 이 부른다.

  누구나 부를 수 있으면 안 되므로 CLEANUP_SECRET 을 맞춰 본다.
  값을 정하지 않으면 아예 열지 않는다. 실수로 열려 있는 것보다 안 도는 편이 낫다.

  예) 0 4 * * * curl -s -H "Authorization: Bearer <비밀값>" https://cccr.or.kr/api/cleanup
*/
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CLEANUP_SECRET;
  if (!secret) {
    return Response.json(
      { ok: false, error: "CLEANUP_SECRET 을 정하지 않아 실행하지 않습니다." },
      { status: 503 },
    );
  }

  const auth = request.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${secret}`) {
    return new Response("권한이 없습니다.", { status: 401 });
  }

  try {
    const report = await runCleanup();
    const total = Object.values(report).reduce((sum, n) => sum + n, 0);
    return Response.json({ ok: true, total, report });
  } catch (err) {
    return Response.json(
      { ok: false, error: err instanceof Error ? err.message : "정리에 실패했습니다." },
      { status: 500 },
    );
  }
}
