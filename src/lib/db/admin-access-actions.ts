"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { logAdminAccess } from "@/lib/db/admin-access";

/*
  관리자 접속 기록을 남기는 서버 액션.
  바깥에서 부를 수 있는 자리이므로 둘 다 관리자인지 먼저 확인한다.
  requireAdmin 을 쓰지 않는 것은, 그 안에서 '처리' 기록이 한 줄 더 남기 때문이다.
*/

/** 관리자 화면을 열었을 때(AdminAccessLogger 가 부른다). */
export async function recordAdminView(path: string): Promise<void> {
  const session = await getSession();
  if (session?.role !== "admin") return;

  const clean = String(path ?? "");
  if (!clean.startsWith("/admin")) return;

  await logAdminAccess(session, "조회", clean);
}

/** 월간 점검을 마쳤다고 남긴다. */
export async function markInspected(formData: FormData): Promise<void> {
  const session = await getSession();
  if (session?.role !== "admin") return;

  const note = String(formData.get("note") ?? "").trim().slice(0, 200);
  await logAdminAccess(session, "점검", note ? `월간 점검 — ${note}` : "월간 점검");

  revalidatePath("/admin", "layout");
}
