"use server";

import { ready } from "@/lib/db/migrate";
import { now } from "@/lib/db/driver";
import { hashPassword } from "@/lib/auth/password";
import { addSubscriberFromSignup } from "@/lib/db/newsletter";
import { clientKey, record, SIGNUP, tooMany } from "@/lib/db/rate-limit";
import { after } from "next/server";
import { sendMail } from "@/lib/mail/send";
import { officeTo } from "@/lib/mail/address";
import { memberSignupOffice } from "@/lib/mail/templates";
import { checkSignupLengths } from "./signup-limits";
import { passwordProblem } from "./password-rule";
import { readSignupProfile } from "./signup-profile";

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

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");

  if (!formData.get("agreeTerms") || !formData.get("agreePrivacy")) {
    return { error: "필수 약관에 동의해 주세요." };
  }
  /* 회원 유형에 따라 받는 칸이 다르다. 소셜 가입과 같은 규칙(signup-profile.ts) */
  const read = readSignupProfile((key) => String(formData.get(key) ?? ""));
  if ("error" in read) {
    return { error: read.error };
  }
  const { memberType, name, company, department, phone, bizNumber } = read.profile;

  if (!email) {
    return { error: "이메일을 입력해 주세요." };
  }
  const tooLong = checkSignupLengths({ email });
  if (tooLong) {
    return { error: tooLong };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "이메일 주소를 다시 확인해 주세요." };
  }
  /* 8자 이상 + 영문과 숫자 + 흔한 비밀번호 거르기(password-rule.ts) */
  const weak = passwordProblem(password, { email, name });
  if (weak) {
    return { error: weak };
  }
  if (password !== passwordConfirm) {
    return { error: "비밀번호가 서로 다릅니다." };
  }

  const db = await ready();
  const exists = await db.get<{ id: number }>("SELECT id FROM users WHERE email = ?", [email]);
  if (exists) {
    return { error: "이미 가입 신청된 이메일입니다. 승인 상태는 사무국으로 문의해 주세요." };
  }
  /*
    한 번호에 한 계정. 어느 이메일로 가입했는지는 알려 주지 않는다.
    번호를 넣어 보는 것만으로 남의 가입 여부를 알아낼 수 있어서다.
  */
  const samePhone = await db.get<{ id: number }>("SELECT id FROM users WHERE phone = ?", [phone]);
  if (samePhone) {
    return { error: "이미 가입 신청된 휴대전화번호입니다. 사무국으로 문의해 주세요." };
  }

  await db.run(
    `INSERT INTO users (email, password_hash, name, company, department, phone, biz_number, member_type, role, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'member', 'pending', ?)`,
    [
      email,
      await hashPassword(password),
      name,
      company,
      department,
      phone,
      bizNumber,
      memberType,
      now(),
    ],
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
      ...memberSignupOffice({ name, company, email, method: "이메일", memberType }),
    }),
  );

  return { ok: true };
}
