import "server-only";
import { ready } from "./migrate";
import { getSession } from "@/lib/auth/session";
import { EMPTY_APPLICANT, type Applicant } from "@/lib/applicant-types";

/*
  신청 폼을 미리 채우는 데 쓰는 값.

  로그인을 강제하지 않기로 했으므로 로그인은 '편해지는 것'일 뿐이다.
  로그인해 두면 이름·이메일·소속을 매번 적지 않아도 되게 한다.
  로그인하지 않았으면 빈 값이고 폼은 평소대로 동작한다.
*/
export { EMPTY_APPLICANT, type Applicant } from "@/lib/applicant-types";

export async function getApplicant(): Promise<Applicant> {
  const session = await getSession();
  if (!session) return EMPTY_APPLICANT;

  const db = await ready();
  const row = await db.get<{ company: string | null }>(
    "SELECT company FROM users WHERE id = ?",
    [session.userId],
  );

  return {
    name: session.name,
    email: session.email,
    org: row?.company ?? "",
  };
}
