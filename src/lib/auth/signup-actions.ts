"use server";

import { ready } from "@/lib/db/migrate";
import { now } from "@/lib/db/driver";
import { hashPassword } from "@/lib/auth/password";
import { addSubscriberFromSignup } from "@/lib/db/newsletter-actions";

export type SignUpState = { error?: string; ok?: boolean };

/*
  홈페이지 회원가입.
  가입하면 바로 쓰는 것이 아니라 '승인 대기' 상태로 들어가고, 사무국이
  관리자 화면에서 승인해야 로그인할 수 있다. 조합 회원사 가입과는 별개다.
*/
export async function signUp(_prev: SignUpState, formData: FormData): Promise<SignUpState> {
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

  return { ok: true };
}
