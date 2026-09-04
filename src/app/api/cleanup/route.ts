import { runCleanup } from "@/lib/db/cleanup";

/*
  보관 기간이 지난 자료를 지운다. 하루 한 번 부른다.

  개인정보처리방침에 "며칠 뒤 파기"라고 적어 두었으므로 실제로 지워져야 한다.
  부르는 쪽이 없으면 방침만 있고 아무것도 지워지지 않는다.

  Vercel  vercel.json 의 crons 가 부른다. CRON_SECRET 을 정해 두면 Vercel 이
          그 값을 헤더에 붙여 보낸다.
  서버    crontab 에 한 줄 둔다.
          0 4 * * * curl -s -H "Authorization: Bearer <CLEANUP_SECRET>" https://cccr.or.kr/api/cleanup
*/
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  /*
    두 가지 열쇠를 받는다.
      CLEANUP_SECRET  서버에서 crontab 으로 부를 때 우리가 정한 값
      CRON_SECRET     Vercel cron 이 스스로 붙여 보내는 값
    둘 다 없으면 열지 않는다. 실수로 열려 있는 것보다 안 도는 편이 낫다.
  */
  const secrets = [process.env.CLEANUP_SECRET, process.env.CRON_SECRET].filter(Boolean);
  if (secrets.length === 0) {
    return Response.json(
      { ok: false, error: "CLEANUP_SECRET 또는 CRON_SECRET 을 정하지 않아 실행하지 않습니다." },
      { status: 503 },
    );
  }

  const auth = request.headers.get("authorization") ?? "";
  if (!secrets.some((s) => auth === `Bearer ${s}`)) {
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
