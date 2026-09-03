"use server";

import { createHash, randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { ready } from "@/lib/db/migrate";
import { now } from "@/lib/db/driver";
import { hashPassword } from "@/lib/auth/password";
import { clientKey, record, RESET, tooMany } from "@/lib/db/rate-limit";
import { sendMail } from "@/lib/mail/send";
import { passwordReset } from "@/lib/mail/templates";
import { siteUrl } from "@/lib/site-url";

/*
  비밀번호 재설정.

  전에는 잊으면 사무국에 전화하는 수밖에 없었다. 관리자는 서버에서 명령을
  돌리면 되지만 일반 회원은 방법이 없었다.

  링크 토큰은 그대로 두지 않고 해시만 담는다. 표를 들여다봐도 링크를 만들 수
  없어야 한다. 한 번 쓰면 다시 못 쓰고, 한 시간이 지나면 저절로 죽는다.
*/

const VALID_SEC = 60 * 60; // 1시간

const hash = (token: string) => createHash("sha256").update(token).digest("hex");

export type ResetRequestState = { error?: string; ok?: string };

/** 재설정 링크를 메일로 보낸다. */
export async function requestReset(
  _prev: ResetRequestState,
  formData: FormData,
): Promise<ResetRequestState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return { error: "이메일 주소를 입력해 주세요." };

  const from = await clientKey();
  if (await tooMany("reset", from, RESET.limit, RESET.windowSec)) {
    return { error: "요청이 너무 잦습니다. 잠시 뒤에 다시 해 주세요." };
  }
  await record("reset", from);

  const db = await ready();
  const user = await db.get<{ id: number; name: string; status: string }>(
    "SELECT id, name, status FROM users WHERE email = ?",
    [email],
  );

  /*
    계정이 없어도 같은 문구를 돌려준다. 다르게 답하면 어떤 주소가 가입돼 있는지
    하나씩 넣어 보며 알아낼 수 있다.
  */
  if (user && user.status === "active") {
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + VALID_SEC * 1000)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    /* 앞서 받은 링크는 무효로 한다. 여러 개가 살아 있으면 관리가 어렵다. */
    await db.run("DELETE FROM password_resets WHERE user_id = ?", [user.id]);
    await db.run(
      `INSERT INTO password_resets (token_hash, user_id, expires_at, created_at)
       VALUES (?, ?, ?, ?)`,
      [hash(token), user.id, expiresAt, now()],
    );

    await sendMail({
      kind: "account.reset",
      to: email,
      ...passwordReset({ name: user.name, url: `${siteUrl()}/reset/${token}` }),
    });
  }

  return {
    ok: "가입된 주소라면 재설정 링크를 보내드렸습니다. 메일함을 확인해 주세요. 링크는 한 시간 동안만 쓸 수 있습니다.",
  };
}

export type ResetState = { error?: string };

/** 링크를 타고 들어와 새 비밀번호를 정한다. */
export async function applyReset(_prev: ResetState, formData: FormData): Promise<ResetState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("passwordConfirm") ?? "");

  if (password.length < 8) return { error: "비밀번호는 8자 이상으로 정해 주세요." };
  if (password !== confirm) return { error: "새 비밀번호가 서로 다릅니다." };

  const db = await ready();
  const row = await db.get<{ user_id: number; expires_at: string; used_at: string }>(
    "SELECT user_id, expires_at, used_at FROM password_resets WHERE token_hash = ?",
    [hash(token)],
  );

  const stamp = now();
  if (!row || row.used_at || row.expires_at < stamp) {
    return { error: "링크가 만료되었거나 이미 사용되었습니다. 다시 요청해 주세요." };
  }

  await db.run("UPDATE users SET password_hash = ? WHERE id = ?", [
    await hashPassword(password),
    row.user_id,
  ]);
  await db.run("UPDATE password_resets SET used_at = ? WHERE token_hash = ?", [stamp, hash(token)]);

  /* 비밀번호를 바꿨으면 열려 있던 로그인은 모두 끊는다. 남이 들어와 있었을 수 있다. */
  await db.run("DELETE FROM sessions WHERE user_id = ?", [row.user_id]);

  redirect("/login?reset=1");
}

/** 링크가 아직 쓸 수 있는지. 화면을 그리기 전에 본다. */
export async function isResetTokenUsable(token: string): Promise<boolean> {
  if (!/^[a-f0-9]{64}$/.test(token)) return false;

  const db = await ready();
  const row = await db.get<{ expires_at: string; used_at: string }>(
    "SELECT expires_at, used_at FROM password_resets WHERE token_hash = ?",
    [hash(token)],
  );
  return Boolean(row) && !row!.used_at && row!.expires_at >= now();
}
