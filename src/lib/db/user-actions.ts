"use server";

import { revalidatePath } from "next/cache";
import { ready } from "@/lib/db/migrate";
import { now } from "@/lib/db/driver";
import { requireAdmin } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";
import type { UserStatus } from "@/lib/user-types";
import { after } from "next/server";
import { sendMail } from "@/lib/mail/send";
import { memberApproved } from "@/lib/mail/templates";
import { SOCIAL_LABEL, isSocialProvider } from "@/lib/auth/social-profile";

const STATUSES: UserStatus[] = ["pending", "active", "blocked"];

const STATUS_LABEL: Record<UserStatus, string> = { pending: "승인 대기", active: "이용 중", blocked: "이용 제한" };

/** 회원 상태 변경(승인·차단·대기). */
export async function setUserStatus(formData: FormData): Promise<void> {
  const id = Number(formData.get("id"));
  const status = String(formData.get("status")) as UserStatus;
  /* 관리자 접속 기록에 누구를 어떻게 바꿨는지 남긴다 */
  const admin = await requireAdmin(`회원 #${id} → ${STATUS_LABEL[status] ?? status}`);
  if (!id || !STATUSES.includes(status)) return;

  /* 자기 계정을 잠가 관리자가 모두 사라지는 것을 막는다 */
  if (id === admin.userId && status !== "active") return;

  const db = await ready();
  const before = await db.get<{ status: string; name: string; email: string }>(
    "SELECT status, name, email FROM users WHERE id = ?",
    [id],
  );
  /*
    상태가 실제로 바뀔 때만 그 때를 남긴다. 방침의 보유 기간(승인 대기 6개월·이용 제한 1년)을
    이 시각부터 센다(cleanup.ts). 같은 상태로 다시 누르면 기간이 늘어나지 않게 한다.
  */
  if (before && before.status !== status) {
    await db.run("UPDATE users SET status = ?, status_changed_at = ? WHERE id = ?", [status, now(), id]);
  }

  /*
    승인 대기에서 이용 중으로 바꾸면 신청자에게 알린다. 알리지 않으면 언제 되었는지 몰라
    로그인을 되풀이해 본다. 소셜로 가입한 사람에게는 어느 단추로 들어오면 되는지도 적는다.
    관리자 화면이 메일 서버를 기다리지 않게 응답 뒤에 보낸다.
  */
  if (before?.status === "pending" && status === "active") {
    const identities = await db.all<{ provider: string }>(
      "SELECT provider FROM user_identities WHERE user_id = ? ORDER BY id",
      [id],
    );
    const socialLabels = identities
      .map((row) => row.provider)
      .filter(isSocialProvider)
      .map((provider) => SOCIAL_LABEL[provider]);
    after(() =>
      sendMail({
        kind: "member.approved",
        to: before.email,
        ...memberApproved({ name: before.name, socialLabels }),
      }),
    );
  }

  /* 이용을 막으면 로그인 상태도 함께 끊는다 */
  if (status !== "active") {
    await db.run("DELETE FROM sessions WHERE user_id = ?", [id]);
  }

  revalidatePath("/admin/members");
}

/** 관리자 지정·해제. */
export async function setUserRole(formData: FormData): Promise<void> {
  const id = Number(formData.get("id"));
  const role = String(formData.get("role"));
  const admin = await requireAdmin(`회원 #${id} 권한 → ${role === "admin" ? "관리자" : "일반 회원"}`);
  if (!id || (role !== "admin" && role !== "member")) return;

  /* 마지막 관리자가 스스로 권한을 내려놓으면 아무도 관리할 수 없게 된다 */
  if (id === admin.userId && role === "member") return;

  const db = await ready();
  await db.run("UPDATE users SET role = ? WHERE id = ?", [role, id]);
  revalidatePath("/admin/members");
}

/** 탈퇴 처리(계정 삭제). 글쓴이 이름은 게시글에 남는다. */
export async function deleteUser(formData: FormData): Promise<void> {
  const id = Number(formData.get("id"));
  const admin = await requireAdmin(`회원 #${id} 삭제`);
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
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  await requireAdmin(`관리자 계정 만들기 (${email})`);
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
