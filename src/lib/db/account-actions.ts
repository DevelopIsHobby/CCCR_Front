"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createHash } from "node:crypto";
import { ready } from "@/lib/db/migrate";
import { getSession, requireAdmin } from "@/lib/auth/session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

export type AccountState = { error?: string; ok?: string };

/** 지금 쓰고 있는 세션. 다른 기기만 로그아웃할 때 남겨 둔다. */
async function currentTokenHash(): Promise<string | null> {
  const token = (await cookies()).get("c3r_session")?.value;
  return token ? createHash("sha256").update(token).digest("hex") : null;
}

export async function changeMyPassword(
  _prev: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const session = await requireAdmin();

  const current = String(formData.get("currentPassword") ?? "");
  const next = String(formData.get("newPassword") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (!current || !next) return { error: "현재 비밀번호와 새 비밀번호를 입력해 주세요." };
  if (next.length < 8) return { error: "새 비밀번호는 8자 이상으로 정해 주세요." };
  if (next !== confirm) return { error: "새 비밀번호가 서로 다릅니다." };
  if (next === current) return { error: "지금 쓰는 비밀번호와 다르게 정해 주세요." };

  const db = await ready();
  const row = await db.get<{ password_hash: string }>(
    "SELECT password_hash FROM users WHERE id = ?",
    [session.userId],
  );
  if (!row || !(await verifyPassword(current, row.password_hash))) {
    return { error: "현재 비밀번호가 맞지 않습니다." };
  }

  await db.run("UPDATE users SET password_hash = ? WHERE id = ?", [
    await hashPassword(next),
    session.userId,
  ]);

  /* 비밀번호를 바꿨으면 다른 기기의 로그인은 끊는다 */
  const keep = await currentTokenHash();
  await db.run(
    `DELETE FROM sessions WHERE user_id = ?${keep ? " AND token_hash <> ?" : ""}`,
    keep ? [session.userId, keep] : [session.userId],
  );

  revalidatePath("/admin/account");
  return { ok: "비밀번호를 바꿨습니다. 다른 기기의 로그인은 모두 끊었습니다." };
}

export async function changeMyName(
  _prev: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const session = await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "이름을 입력해 주세요." };

  const db = await ready();
  await db.run("UPDATE users SET name = ? WHERE id = ?", [name, session.userId]);

  revalidatePath("/", "layout");
  return { ok: "이름을 바꿨습니다." };
}

/** 지금 기기만 남기고 다른 기기의 로그인을 끊는다. */
export async function signOutOtherDevices(): Promise<void> {
  const session = await getSession();
  if (!session) return;

  const keep = await currentTokenHash();
  const db = await ready();
  await db.run(
    `DELETE FROM sessions WHERE user_id = ?${keep ? " AND token_hash <> ?" : ""}`,
    keep ? [session.userId, keep] : [session.userId],
  );

  revalidatePath("/admin/account");
}

/** 로그인 중인 기기 수. 지금 기기 포함. */
export async function countMySessions(): Promise<number> {
  const session = await getSession();
  if (!session) return 0;

  const db = await ready();
  const row = await db.get<{ n: number }>(
    "SELECT COUNT(*) AS n FROM sessions WHERE user_id = ? AND expires_at > ?",
    [session.userId, new Date().toISOString()],
  );
  return Number(row?.n ?? 0);
}
