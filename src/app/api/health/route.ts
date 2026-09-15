import { mkdir, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { enabledProviders } from "@/lib/auth/social";
import { getSession } from "@/lib/auth/session";
import { ready } from "@/lib/db/migrate";
import { mailFrom, officeTo } from "@/lib/mail/address";
import { isNoindex } from "@/lib/site-url";
import { UPLOAD_DIR } from "@/lib/uploads";

/*
  배포 점검용. 화면이 500 일 때 원인이 DB 설정인지 코드인지 가른다.
  새 서버에 올린 뒤 환경변수를 빠뜨리지 않았는지도 여기서 한눈에 본다.

  비밀은 내보내지 않는다. 접속 문자열·비밀값은 있는지 없는지만 알리고,
  오류 메시지에 주소나 비밀번호가 섞여 나올 수 있으므로 지운 뒤 내보낸다.

  그래도 발신 메일 계정·서버 설정 일부가 보이므로 관리자만 본다. 그 밖에는 없는 주소처럼
  404 로 답해 점검 주소가 있다는 것조차 드러내지 않는다.
  DB 가 죽어 로그인부터 안 될 때는 서버 로그(VPS: journalctl -u c3r, Vercel: 함수 로그)로 원인을 본다.
*/
export const dynamic = "force-dynamic";

/** 오류 문구에 섞여 나올 수 있는 접속 정보를 지운다. */
function scrub(message: string): string {
  return message
    .replace(/postgres(ql)?:\/\/[^\s"']*/gi, "postgres://***")
    .replace(/:[^:@/\s]{6,}@/g, ":***@");
}

/** 첨부 폴더에 실제로 쓸 수 있는지. 권한이 틀리면 올릴 때에야 알게 되므로 미리 본다. */
async function uploadDirStatus(): Promise<string> {
  const probe = join(UPLOAD_DIR, `.health-${process.pid}-${Date.now()}`);
  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
    await writeFile(probe, "");
    await unlink(probe);
    return `쓰기 가능 (${UPLOAD_DIR})`;
  } catch (err) {
    return `쓰기 불가 ${(err as NodeJS.ErrnoException).code ?? ""} (${UPLOAD_DIR})`;
  }
}

export async function GET() {
  const session = await getSession().catch(() => null);
  if (session?.role !== "admin") return new Response("Not Found", { status: 404 });

  const env = {
    DB_DRIVER: process.env.DB_DRIVER ?? "(없음 — DATABASE_URL 을 보고 정함)",
    DATABASE_URL: process.env.DATABASE_URL ? "설정됨" : "(없음)",
    DATABASE_SSL: process.env.DATABASE_SSL ?? "(없음)",
    DATABASE_POOL_MAX: process.env.DATABASE_POOL_MAX ?? "(없음)",
    SITE_NOINDEX: process.env.SITE_NOINDEX ?? "(없음)",
    검색차단: isNoindex() ? "켜짐" : "꺼짐",
    SMTP_HOST: process.env.SMTP_HOST ?? "(없음 → 메일 보내지 않음)",
    SMTP_USER: process.env.SMTP_USER ?? "(없음)",
    SMTP_PASS: process.env.SMTP_PASS ? "설정됨" : "(없음)",
    SMTP_INSECURE: process.env.SMTP_INSECURE ?? "(없음 → 암호화 요구)",
    SMTP_AUTH: process.env.SMTP_AUTH ?? "(없음 → 암호화 없을 때 CRAM-MD5)",
    SMTP_LEGACY_TLS: process.env.SMTP_LEGACY_TLS ?? "(없음 → 최신 TLS 만)",
    보내는주소: mailFrom(),
    사무국알림주소: officeTo(),
    DKIM:
      process.env.DKIM_SELECTOR && process.env.DKIM_PRIVATE_KEY
        ? `서명함 (선택자 ${process.env.DKIM_SELECTOR})`
        : "(없음 → 서명하지 않음)",
    SITE_URL: process.env.SITE_URL ?? "(없음)",
    자동파기비밀값:
      process.env.CLEANUP_SECRET || process.env.CRON_SECRET ? "설정됨" : "(없음 → 자동 파기를 부를 수 없음)",
    소셜로그인: enabledProviders().join(", ") || "(없음)",
    첨부폴더: await uploadDirStatus(),
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
