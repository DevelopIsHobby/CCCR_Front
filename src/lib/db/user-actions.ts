"use server";

import { revalidatePath } from "next/cache";
import { ready } from "@/lib/db/migrate";
import { now } from "@/lib/db/driver";
import { requireAdmin } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";
import type { UserStatus } from "@/lib/user-types";

const STATUSES: UserStatus[] = ["pending", "active", "blocked"];

/** 회원 상태 변경(승인·차단·대기). */
export async function setUserStatus(formData: FormData): Promise<void> {
  const admin = await requireAdmin();

  const id = Number(formData.get("id"));
  const status = String(formData.get("status")) as UserStatus;
  if (!id || !STATUSES.includes(status)) return;

  /* 자기 계정을 잠가 관리자가 모두 사라지는 것을 막는다 */
  if (id === admin.userId && status !== "active") return;

  const db = await ready();
  await db.run("UPDATE users SET status = ? WHERE id = ?", [status, id]);

  /* 이용을 막으면 로그인 상태도 함께 끊는다 */
  if (status !== "active") {
    await db.run("DELETE FROM sessions WHERE user_id = ?", [id]);
  }

  revalidatePath("/admin/members");
}

/** 관리자 지정·해제. */
export async function setUserRole(formData: FormData): Promise<void> {
  const admin = await requireAdmin();

  const id = Number(formData.get("id"));
  const role = String(formData.get("role"));
  if (!id || (role !== "admin" && role !== "member")) return;

  /* 마지막 관리자가 스스로 권한을 내려놓으면 아무도 관리할 수 없게 된다 */
  if (id === admin.userId && role === "member") return;

  const db = await ready();
  await db.run("UPDATE users SET role = ? WHERE id = ?", [role, id]);
  revalidatePath("/admin/members");
}

/** 탈퇴 처리(계정 삭제). 글쓴이 이름은 게시글에 남는다. */
export async function deleteUser(formData: FormData): Promise<void> {
  const admin = await requireAdmin();

  const id = Number(formData.get("id"));
  if (!id || id === admin.userId) return;

  const db = await ready();
  await db.run("DELETE FROM users WHERE id = ?", [id]);
  revalidatePath("/admin/members");
}

export type NewAdminState = { error?: string; ok?: string };

/** 관리자가 다른 관리자 계정을 만든다. */
export async function createAdminAccount(
  _prev: NewAdminState,
  formData: FormData,
): Promise<NewAdminState> {
  await requireAdmin();

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (!email || !name || !password) return { error: "이메일·이름·비밀번호를 모두 입력해 주세요." };
  if (password.length < 8) return { error: "비밀번호는 8자 이상으로 정해 주세요." };
  if (password !== confirm) return { error: "비밀번호가 서로 다릅니다." };

  const db = await ready();
  const exists = await db.get<{ id: number }>("SELECT id FROM users WHERE email = ?", [email]);
  if (exists) return { error: "이미 등록된 이메일입니다." };

  await db.run(
    `INSERT INTO users (email, password_hash, name, role, status, created_at)
     VALUES (?, ?, ?, 'admin', 'active', ?)`,
    [email, await hashPassword(password), name, now()],
  );

  revalidatePath("/admin/members");
  return { ok: `${email} 관리자 계정을 만들었습니다.` };
}
