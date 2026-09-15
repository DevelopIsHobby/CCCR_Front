"use server";

import { ready } from "@/lib/db/migrate";
import { now } from "@/lib/db/driver";
import { addSubscriberFromSignup } from "@/lib/db/newsletter-actions";
import { clientKey, record, SIGNUP, tooMany } from "@/lib/db/rate-limit";
import { getPendingSocialSignup } from "./social-signup";
import { after } from "next/server";
import { sendMail } from "@/lib/mail/send";
import { officeTo } from "@/lib/mail/address";
import { memberSignupOffice } from "@/lib/mail/templates";
import { SOCIAL_LABEL } from "./social-profile";

export type SocialSignUpState = { error?: string; ok?: boolean };

/*
  소셜 계정으로 가입 신청을 마친다.

  이메일 가입과 같은 기준이다. 약관 동의·소속을 받고 '승인 대기'로 넣으며,
  사무국이 관리자 화면에서 승인해야 들어올 수 있다. 비밀번호는 받지 않는다.
*/
export async function completeSocialSignup(
  _prev: SocialSignUpState,
  formData: FormData,
): Promise<SocialSignUpState> {
  const from = await clientKey();
  if (await tooMany("signup", from, SIGNUP.limit, SIGNUP.windowSec)) {
    return { error: "가입 시도가 너무 잦습니다. 잠시 뒤에 다시 시도해 주세요." };
  }

  const pending = await getPendingSocialSignup();
  if (!pending) {
    return { error: "가입할 수 있는 시간(30분)이 지났습니다. 로그인 화면에서 다시 시작해 주세요." };
  }
  if (pending.completed) return { ok: true };

  const value = (key: string) => String(formData.get(key) ?? "").trim();

  if (!formData.get("agreeTerms") || !formData.get("agreePrivacy")) {
    return { error: "필수 약관에 동의해 주세요." };
  }

  const name = value("name");
  const company = value("company");
  const department = value("department");
  const phone = value("phone");
  /* 서비스가 확인해 준 이메일은 그대로 쓰고, 없거나 확인되지 않았으면 적어 준 주소를 쓴다 */
  const email = (pending.emailVerified && pending.email ? pending.email : value("email")).toLowerCase();

  if (!company || !name || !email) {
    return { error: "기관·회사명, 담당자 이름, 이메일은 반드시 입력해 주세요." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "이메일 주소를 다시 확인해 주세요." };
  }

  const db = await ready();

  if (await db.get("SELECT id FROM users WHERE email = ?", [email])) {
    /*
      확인되지 않은 이메일로는 기존 회원에 잇지 않는다. 남의 주소를 적어 계정을 가로챌 수 있어서다.
      그 주소의 주인이라면 이메일·비밀번호로 로그인하면 된다.
    */
    return { error: "이미 가입된 이메일입니다. 그 이메일과 비밀번호로 로그인해 주세요." };
  }
  if (
    await db.get("SELECT id FROM user_identities WHERE provider = ? AND subject = ?", [
      pending.provider,
      pending.subject,
    ])
  ) {
    return { error: "이미 가입된 계정입니다. 로그인 화면에서 다시 로그인해 주세요." };
  }

  const stamp = now();

  /*
    비밀번호 칸은 빈 값으로 둔다. 빈 값은 비밀번호 확인을 통과하지 못하므로 이 계정은
    소셜 로그인으로만 들어온다. 비밀번호가 필요하면 '비밀번호 찾기'로 새로 만든다.
  */
  const created = await db.get<{ id: number }>(
    `INSERT INTO users (email, password_hash, name, company, department, phone, role, status, created_at)
     VALUES (?, '', ?, ?, ?, ?, 'member', 'pending', ?) RETURNING id`,
    [email, name, company, department || null, phone || null, stamp],
  );
  if (!created) return { error: "가입을 마치지 못했습니다. 다시 시도해 주세요." };

  await db.run(
    "INSERT INTO user_identities (user_id, provider, subject, email, created_at) VALUES (?, ?, ?, ?, ?)",
    [Number(created.id), pending.provider, pending.subject, pending.email, stamp],
  );

  /*
    지우지 않고 '마침'으로만 표시한다. 여기서 지우거나 쿠키를 건드리면 화면을 다시 그릴 때
    대기 정보가 없어 '시간이 지났다'로 바뀐다. 기한이 지나면 야간 정리가 지운다.
  */
  await db.run("UPDATE oauth_signups SET completed = 1 WHERE token_hash = ?", [pending.tokenHash]);

  if (formData.get("agreeNewsletter")) {
    await addSubscriberFromSignup(email);
  }

  await record("signup", from);

  /* 사무국이 승인해야 들어올 수 있으므로 새 신청이 들어왔다고 바로 알린다. 응답 뒤에 보낸다. */
  after(() =>
    sendMail({
      kind: "member.office",
      to: officeTo(),
      ...memberSignupOffice({
        name,
        company,
        email,
        method: `${SOCIAL_LABEL[pending.provider]} 로그인`,
      }),
    }),
  );

  return { ok: true };
}
