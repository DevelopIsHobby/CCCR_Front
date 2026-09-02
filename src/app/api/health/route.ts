import { ready } from "@/lib/db/migrate";

/*
  배포 점검용. 화면이 500 일 때 원인이 DB 설정인지 코드인지 가른다.

  비밀은 내보내지 않는다. 접속 문자열은 있는지 없는지(true/false)만 알리고,
  오류 메시지에 주소나 비밀번호가 섞여 나올 수 있으므로 지운 뒤 내보낸다.
*/
export const dynamic = "force-dynamic";

/** 오류 문구에 섞여 나올 수 있는 접속 정보를 지운다. */
function scrub(message: string): string {
  return message
    .replace(/postgres(ql)?:\/\/[^\s"']*/gi, "postgres://***")
    .replace(/:[^:@/\s]{6,}@/g, ":***@");
}

export async function GET() {
  const env = {
    DB_DRIVER: process.env.DB_DRIVER ?? "(없음 — DATABASE_URL 을 보고 정함)",
    DATABASE_URL: process.env.DATABASE_URL ? "설정됨" : "(없음)",
    DATABASE_SSL: process.env.DATABASE_SSL ?? "(없음)",
    DATABASE_POOL_MAX: process.env.DATABASE_POOL_MAX ?? "(없음)",
    SITE_NOINDEX: process.env.SITE_NOINDEX ?? "(없음)",
    VERCEL_REGION: process.env.VERCEL_REGION ?? "(없음)",
  };

  try {
    const db = await ready();
    const row = await db.get<{ n: number }>("SELECT COUNT(*) AS n FROM companies");

    return Response.json({
      ok: true,
      dialect: db.dialect,
      companies: Number(row?.n ?? 0),
      env,
    });
  } catch (err) {
    const e = err as Error & { code?: string };
    return Response.json(
      {
        ok: false,
        code: e.code ?? null,
        error: scrub(e.message ?? String(err)),
        env,
      },
      { status: 500 },
    );
  }
}
