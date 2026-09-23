"use server";

import { redirect } from "next/navigation";
import { ready } from "@/lib/db/migrate";
import { burnPasswordTime, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import { clear, clientKey, keyOf, LOGIN, record, tooMany } from "@/lib/db/rate-limit";

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
  for (const key of [`email:${keyOf(email)}`, `ip:${from}`]) {
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

  /*
    계정이 없을 때도 같은 문구를 돌려준다. 어떤 이메일이 있는지 알려주지 않는다.
    문구뿐 아니라 걸리는 시간도 맞춘다. 곧바로 돌려보내면 가입된 주소일 때만
    scrypt 만큼 늦어져, 시간을 재는 것만으로 가입 여부가 드러난다.
  */
  const ok = user ? await verifyPassword(password, user.password_hash) : false;
  if (!user) await burnPasswordTime(password);
  if (!user || !ok) {
    await record("login", `email:${keyOf(email)}`);
    await record("login", `ip:${from}`);
    return { error: "이메일 또는 비밀번호가 올바르지 않습니다." };
  }

  /* 차단된 계정에 '승인 대기'라고 하면 기다리기만 하게 된다. 소셜 로그인과 같은 문구로 가른다. */
  if (user.status === "blocked") {
    return { error: "이용이 제한된 계정입니다. 사무국으로 문의해 주세요." };
  }
  if (user.status !== "active") {
    return { error: "가입 승인 대기 중인 계정입니다. 사무국 승인 후 이용하실 수 있습니다." };
  }

  /* 옳게 들어왔으면 세던 것을 지운다. 다음에 한 번 틀렸다고 막히면 안 된다. */
  await clear("login", `email:${keyOf(email)}`);
  await clear("login", `ip:${from}`);

  await createSession(user.id);
  /* 열린 리다이렉트를 막기 위해 사이트 내부 경로만 허용한다. */
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/");
}
