"use server";

import { revalidatePath } from "next/cache";
import { ready } from "@/lib/db/migrate";
import { now } from "@/lib/db/driver";
import { requireAdmin } from "@/lib/auth/session";
import type { ProposalStatus } from "@/lib/outreach-types";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** 입력 칸마다 길이를 제한한다. 바깥에서 아무나 넣을 수 있는 창구이기 때문이다. */
const trimmed = (formData: FormData, key: string, max: number) =>
  String(formData.get(key) ?? "")
    .trim()
    .slice(0, max);

/* ── 사업공고 수신 신청 ───────────────────────────── */

export type NoticeSignupState = { error?: string; ok?: string };

export async function signUpForNotices(
  _prev: NoticeSignupState,
  formData: FormData,
): Promise<NoticeSignupState> {
  /* 사람이 채우지 않는 칸. 채워져 있으면 자동 입력이다. */
  if (String(formData.get("website") ?? "")) return { ok: "신청을 받았습니다." };

  const company = trimmed(formData, "company", 100);
  const name = trimmed(formData, "name", 50);
  const email = trimmed(formData, "email", 200).toLowerCase();
  const tel = trimmed(formData, "tel", 50);

  if (!company) return { error: "회사명을 입력해 주세요." };
  if (!name) return { error: "담당자 이름을 입력해 주세요." };
  if (!EMAIL.test(email)) return { error: "이메일 주소를 다시 확인해 주세요." };

  const db = await ready();
  const stamp = now();

  const exists = await db.get<{ id: number; status: string }>(
    "SELECT id, status FROM notice_subscribers WHERE email = ?",
    [email],
  );

  if (exists) {
    await db.run(
      `UPDATE notice_subscribers
          SET company = ?, name = ?, tel = ?, status = 'active', updated_at = ?
        WHERE id = ?`,
      [company, name, tel, stamp, exists.id],
    );
    return {
      ok:
        exists.status === "unsubscribed"
          ? "다시 신청되었습니다. 이번 주 공고부터 보내드립니다."
          : "이미 신청된 주소라 담당자 정보만 새로 고쳤습니다.",
    };
  }

  await db.run(
    `INSERT INTO notice_subscribers (company, name, email, tel, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [company, name, email, tel, stamp, stamp],
  );

  revalidatePath("/admin/newsletter");
  return { ok: "신청되었습니다. 이번 주 공고부터 보내드립니다." };
}

export async function setNoticeSubscriberStatus(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = Number(formData.get("id"));
  const status = String(formData.get("status"));
  if (!id || (status !== "active" && status !== "unsubscribed")) return;

  const db = await ready();
  await db.run("UPDATE notice_subscribers SET status = ?, updated_at = ? WHERE id = ?", [
    status,
    now(),
    id,
  ]);
  revalidatePath("/admin/newsletter");
}

export async function deleteNoticeSubscriber(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = Number(formData.get("id"));
  if (!id) return;

  const db = await ready();
  await db.run("DELETE FROM notice_subscribers WHERE id = ?", [id]);
  revalidatePath("/admin/newsletter");
}

/* ── 교육사업 제안 ────────────────────────────────── */

export type ProposalState = { error?: string; ok?: string };

export async function submitProposal(
  _prev: ProposalState,
  formData: FormData,
): Promise<ProposalState> {
  if (String(formData.get("website") ?? "")) return { ok: "제안을 접수했습니다." };

  const org = trimmed(formData, "org", 100);
  const name = trimmed(formData, "name", 50);
  const email = trimmed(formData, "email", 200).toLowerCase();
  const tel = trimmed(formData, "tel", 50);
  const subject = trimmed(formData, "subject", 200);
  const body = trimmed(formData, "body", 4000);

  if (!org) return { error: "기관·기업명을 입력해 주세요." };
  if (!name) return { error: "담당자 이름을 입력해 주세요." };
  if (!EMAIL.test(email)) return { error: "이메일 주소를 다시 확인해 주세요." };
  if (!subject) return { error: "제안 제목을 입력해 주세요." };
  if (body.length < 10) return { error: "제안 내용을 조금 더 자세히 적어 주세요." };

  const db = await ready();
  const stamp = now();

  await db.run(
    `INSERT INTO education_proposals (org, name, email, tel, subject, body, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [org, name, email, tel, subject, body, stamp, stamp],
  );

  revalidatePath("/admin/proposals");
  return { ok: "제안을 접수했습니다. 사무국에서 검토 후 연락드리겠습니다." };
}

export async function setProposalStatus(id: number, status: ProposalStatus): Promise<void> {
  await requireAdmin();
  if (!id) return;

  const db = await ready();
  await db.run("UPDATE education_proposals SET status = ?, updated_at = ? WHERE id = ?", [
    status,
    now(),
    id,
  ]);
  revalidatePath("/admin/proposals");
}

export async function deleteProposal(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = Number(formData.get("id"));
  if (!id) return;

  const db = await ready();
  await db.run("DELETE FROM education_proposals WHERE id = ?", [id]);
  revalidatePath("/admin/proposals");
}
