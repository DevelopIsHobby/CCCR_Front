import { runCleanup } from "@/lib/db/cleanup";

/*
  보관 기간이 지난 자료를 지운다. 하루 한 번 부른다.

  개인정보처리방침에 "며칠 뒤 파기"라고 적어 두었으므로 실제로 지워져야 한다.
  부르는 쪽이 없으면 방침만 있고 아무것도 지워지지 않는다.

  서버 crontab 이 scripts/cleanup-cron.sh 를 하루 한 번 부른다.
  그 스크립트가 .env.production 에서 CLEANUP_SECRET 을 읽어 앱(127.0.0.1:3000)에 직접 부른다.
*/
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  /* 열쇠(CLEANUP_SECRET)가 없으면 열지 않는다. 실수로 열려 있는 것보다 안 도는 편이 낫다. */
  const secret = process.env.CLEANUP_SECRET;
  if (!secret) {
    return Response.json(
      { ok: false, error: "CLEANUP_SECRET 을 정하지 않아 실행하지 않습니다." },
      { status: 503 },
    );
  }

  if ((request.headers.get("authorization") ?? "") !== `Bearer ${secret}`) {
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
