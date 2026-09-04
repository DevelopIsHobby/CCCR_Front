"use server";

import { redirect } from "next/navigation";
import { ready } from "@/lib/db/migrate";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import { clear, clientKey, LOGIN, record, tooMany } from "@/lib/db/rate-limit";

export type LoginState = { error?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/");

  if (!email || !password) {
    return { error: "이메일과 비밀번호를 모두 입력해 주세요." };
  }

  /*
    비밀번호를 기계로 계속 넣어보는 것을 막는다.
    계정과 접속한 곳을 함께 센다. 계정만 세면 한 사람이 여러 계정을 훑을 수 있고,
    접속한 곳만 세면 사무실처럼 여럿이 같은 주소를 쓰는 곳에서 서로 막힌다.
  */
  const from = await clientKey();
  for (const key of [`email:${email}`, `ip:${from}`]) {
    if (await tooMany("login", key, LOGIN.limit, LOGIN.windowSec)) {
      return {
        error: "로그인 시도가 너무 잦습니다. 10분쯤 뒤에 다시 해 주세요.",
      };
    }
  }

  const db = await ready();
  const user = await db.get<{ id: number; password_hash: string; status: string }>(
    "SELECT id, password_hash, status FROM users WHERE email = ?",
    [email],
  );

  /* 계정이 없을 때도 같은 문구를 돌려준다. 어떤 이메일이 있는지 알려주지 않는다. */
  const ok = user ? await verifyPassword(password, user.password_hash) : false;
  if (!user || !ok) {
    await record("login", `email:${email}`);
    await record("login", `ip:${from}`);
    return { error: "이메일 또는 비밀번호가 올바르지 않습니다." };
  }

  if (user.status !== "active") {
    return { error: "가입 승인 대기 중인 계정입니다. 사무국으로 문의해 주세요." };
  }

  /* 옳게 들어왔으면 세던 것을 지운다. 다음에 한 번 틀렸다고 막히면 안 된다. */
  await clear("login", `email:${email}`);
  await clear("login", `ip:${from}`);

  /* 개인 기기에서 본인이 고른 경우만 오래 유지한다. 관리자는 고르든 말든 짧다. */
  await createSession(user.id, formData.get("remember") === "1");
  /* 열린 리다이렉트를 막기 위해 사이트 내부 경로만 허용한다. */
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/");
}
