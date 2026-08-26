"use server";

import { redirect } from "next/navigation";
import { ready } from "@/lib/db/migrate";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";

export type LoginState = { error?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/");

  if (!email || !password) {
    return { error: "이메일과 비밀번호를 모두 입력해 주세요." };
  }

  const db = await ready();
  const user = await db.get<{ id: number; password_hash: string; status: string }>(
    "SELECT id, password_hash, status FROM users WHERE email = ?",
    [email],
  );

  /* 계정이 없을 때도 같은 문구를 돌려준다. 어떤 이메일이 있는지 알려주지 않는다. */
  const ok = user ? await verifyPassword(password, user.password_hash) : false;
  if (!user || !ok) {
    return { error: "이메일 또는 비밀번호가 올바르지 않습니다." };
  }

  if (user.status !== "active") {
    return { error: "가입 승인 대기 중인 계정입니다. 사무국으로 문의해 주세요." };
  }

  await createSession(user.id);
  /* 열린 리다이렉트를 막기 위해 사이트 내부 경로만 허용한다. */
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/");
}
