"use server";

import { revalidatePath } from "next/cache";
import { ready } from "@/lib/db/migrate";
import { now } from "@/lib/db/driver";
import { requireAdmin } from "@/lib/auth/session";

export type SubscribeState = { error?: string; ok?: string };

/*
  뉴스레터 구독 신청. 로그인 없이 누구나 할 수 있어서
  이메일 형식만 확인하고 같은 주소는 한 번만 담는다.
*/
export async function subscribeNewsletter(
  _prev: SubscribeState,
  formData: FormData,
): Promise<SubscribeState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const source = String(formData.get("source") ?? "").trim().slice(0, 40);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "이메일 주소를 다시 확인해 주세요." };
  }

  const db = await ready();
  const stamp = now();
  const existing = await db.get<{ id: number; status: string }>(
    "SELECT id, status FROM newsletter_subscribers WHERE email = ?",
    [email],
  );

  if (existing) {
    if (existing.status === "active") {
      return { ok: "이미 구독 중인 주소입니다." };
    }
    /* 해지했던 주소는 다시 살린다 */
    await db.run(
      "UPDATE newsletter_subscribers SET status = 'active', updated_at = ? WHERE id = ?",
      [stamp, existing.id],
    );
  } else {
    await db.run(
      `INSERT INTO newsletter_subscribers (email, status, source, created_at, updated_at)
       VALUES (?, 'active', ?, ?, ?)`,
      [email, source, stamp, stamp],
    );
  }

  revalidatePath("/admin/newsletter");
  return { ok: "구독 신청이 접수되었습니다." };
}

/** 회원가입에서 수신 동의를 함께 받은 경우. */
export async function addSubscriberFromSignup(email: string): Promise<void> {
  const db = await ready();
  const stamp = now();
  const existing = await db.get<{ id: number }>(
    "SELECT id FROM newsletter_subscribers WHERE email = ?",
    [email],
  );
  if (existing) return;

  await db.run(
    `INSERT INTO newsletter_subscribers (email, status, source, created_at, updated_at)
     VALUES (?, 'active', '회원가입', ?, ?)`,
    [email, stamp, stamp],
  );
}

/* ── 관리자 ───────────────────────────────────────── */

export async function setSubscriberStatus(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = Number(formData.get("id"));
  const status = String(formData.get("status"));
  if (!id || (status !== "active" && status !== "unsubscribed")) return;

  const db = await ready();
  await db.run("UPDATE newsletter_subscribers SET status = ?, updated_at = ? WHERE id = ?", [
    status,
    now(),
    id,
  ]);
  revalidatePath("/admin/newsletter");
}

export async function deleteSubscriber(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = Number(formData.get("id"));
  if (!id) return;

  const db = await ready();
  await db.run("DELETE FROM newsletter_subscribers WHERE id = ?", [id]);
  revalidatePath("/admin/newsletter");
}
