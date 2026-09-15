"use server";

import { ready } from "@/lib/db/migrate";
import { now } from "@/lib/db/driver";
import { hashPassword } from "@/lib/auth/password";
import { addSubscriberFromSignup } from "@/lib/db/newsletter-actions";
import { clientKey, record, SIGNUP, tooMany } from "@/lib/db/rate-limit";
import { after } from "next/server";
import { sendMail } from "@/lib/mail/send";
import { officeTo } from "@/lib/mail/address";
import { memberSignupOffice } from "@/lib/mail/templates";

export type SignUpState = { error?: string; ok?: boolean };

/*
  홈페이지 회원가입.
  가입하면 바로 쓰는 것이 아니라 '승인 대기' 상태로 들어가고, 사무국이
  관리자 화면에서 승인해야 로그인할 수 있다. 조합 회원사 가입과는 별개다.
*/
export async function signUp(_prev: SignUpState, formData: FormData): Promise<SignUpState> {
  /*
    승인 대기로 들어가므로 뚫리는 길은 아니지만, 계정을 무더기로 만들어
    사무국의 '가입 승인' 화면을 덮을 수는 있다.
  */
  const from = await clientKey();
  if (await tooMany("signup", from, SIGNUP.limit, SIGNUP.windowSec)) {
    return { error: "가입 시도가 너무 잦습니다. 잠시 뒤에 다시 시도해 주세요." };
  }

  const value = (key: string) => String(formData.get(key) ?? "").trim();

  const email = value("email").toLowerCase();
  const name = value("name");
  const company = value("company");
  const department = value("department");
  const phone = value("phone");
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");

  if (!formData.get("agreeTerms") || !formData.get("agreePrivacy")) {
    return { error: "필수 약관에 동의해 주세요." };
  }
  if (!email || !name || !company) {
    return { error: "기관·회사명, 담당자 이름, 이메일은 반드시 입력해 주세요." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "이메일 주소를 다시 확인해 주세요." };
  }
  if (password.length < 8) {
    return { error: "비밀번호는 8자 이상으로 정해 주세요." };
  }
  if (password !== passwordConfirm) {
    return { error: "비밀번호가 서로 다릅니다." };
  }

  const db = await ready();
  const exists = await db.get<{ id: number }>("SELECT id FROM users WHERE email = ?", [email]);
  if (exists) {
    return { error: "이미 가입 신청된 이메일입니다. 승인 상태는 사무국으로 문의해 주세요." };
  }

  await db.run(
    `INSERT INTO users (email, password_hash, name, company, department, phone, role, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 'member', 'pending', ?)`,
    [email, await hashPassword(password), name, company, department || null, phone || null, now()],
  );

  /* 뉴스레터 수신에 동의했으면 구독자 명단에도 담는다 */
  if (formData.get("agreeNewsletter")) {
    await addSubscriberFromSignup(email);
  }

  /* 다른 창구와 마찬가지로 실제로 만들어졌을 때만 센다 */
  await record("signup", from);

  /* 사무국이 승인해야 쓸 수 있으므로 새 신청이 들어왔다고 바로 알린다. 신청자를 기다리게 하지 않게 응답 뒤에 보낸다. */
  after(() =>
    sendMail({
      kind: "member.office",
      to: officeTo(),
      ...memberSignupOffice({ name, company, email, method: "이메일" }),
    }),
  );

  return { ok: true };
}
