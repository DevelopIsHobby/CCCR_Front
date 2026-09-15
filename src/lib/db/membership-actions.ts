"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ready } from "@/lib/db/migrate";
import { now } from "@/lib/db/driver";
import { destroySession, requireUser } from "@/lib/auth/session";

/*
  회원이 스스로 하는 메일 수신 설정과 탈퇴.

  이용약관 제5조(탈퇴를 요청하면 즉시 말소)·제12조(회원정보수정 메뉴에서 정보수신거부)와 달리
  예전에는 관리자만 처리할 수 있었다. 모두 로그인한 본인의 것만 바꾼다.
*/

export type MembershipState = { error?: string; ok?: string };

/** 뉴스레터 켜기·끄기. 켤 때는 뉴스레터 신청 칸과 같게 개인정보 수집 동의를 받는다. */
export async function setMyNewsletter(
  _prev: MembershipState,
  formData: FormData,
): Promise<MembershipState> {
  const session = await requireUser();
  const email = session.email.trim().toLowerCase();
  const intent = String(formData.get("intent") ?? "");

  const db = await ready();
  const stamp = now();

  if (intent === "subscribe") {
    if (!formData.get("agreePrivacy")) {
      return { error: "개인정보 수집·이용에 동의해 주셔야 뉴스레터를 받으실 수 있습니다." };
    }
    const existing = await db.get<{ id: number }>(
      "SELECT id FROM newsletter_subscribers WHERE email = ?",
      [email],
    );
    if (existing) {
      await db.run("UPDATE newsletter_subscribers SET status = 'active', updated_at = ? WHERE id = ?", [
        stamp,
        existing.id,
      ]);
    } else {
      await db.run(
        `INSERT INTO newsletter_subscribers (email, status, source, created_at, updated_at)
         VALUES (?, 'active', '마이페이지', ?, ?)`,
        [email, stamp, stamp],
      );
    }
    revalidatePath("/mypage");
    revalidatePath("/admin/newsletter");
    return { ok: "뉴스레터를 받도록 했습니다." };
  }

  if (intent === "unsubscribe") {
    await db.run(
      "UPDATE newsletter_subscribers SET status = 'unsubscribed', updated_at = ? WHERE email = ? AND status = 'active'",
      [stamp, email],
    );
    revalidatePath("/mypage");
    revalidatePath("/admin/newsletter");
    return { ok: "뉴스레터 수신을 껐습니다." };
  }

  return { error: "요청을 알아듣지 못했습니다. 화면을 새로 고친 뒤 다시 해 주세요." };
}

/*
  사업공고 수신 중단(승인 대기 중인 신청은 취소).
  사업공고는 사무국이 임원사 담당자인지 확인해 승인하므로 여기서 켜지는 않는다. 다시 받으려면 신청 화면에서 새로 신청한다.
*/
export async function stopMyNotice(
  _prev: MembershipState,
  _formData: FormData,
): Promise<MembershipState> {
  const session = await requireUser();
  const email = session.email.trim().toLowerCase();

  const db = await ready();
  await db.run(
    `UPDATE notice_subscribers SET status = 'unsubscribed'
      WHERE deleted_at = '' AND status IN ('active', 'pending') AND (user_id = ? OR email = ?)`,
    [session.userId, email],
  );

  revalidatePath("/mypage");
  revalidatePath("/admin/notices");
  return { ok: "사업공고 수신을 멈췄습니다." };
}

/*
  회원 탈퇴.

  - 실수로 누르지 않게 계정 이메일을 다시 적어야 한다.
  - 관리자 계정은 막는다. 마지막 관리자가 빠지면 아무도 홈페이지를 관리할 수 없다.
  - 계정을 지우면 로그인 기록·소셜 연결·비밀번호 재설정 기록은 DB 규칙으로 함께 지워지고,
    신청 기록과 게시글은 계정과의 연결만 풀린다(관리자 '탈퇴 처리'와 같다).
    신청 기록은 개인정보처리방침에 적은 기간이 지나면 자동 파기로 지워진다.
  - 계정 주소로 받던 뉴스레터는 지우고, 사업공고 수신은 멈춘다.
*/
export async function withdrawMe(
  _prev: MembershipState,
  formData: FormData,
): Promise<MembershipState> {
  const session = await requireUser();
  if (session.role === "admin") {
    return { error: "관리자 계정은 여기서 탈퇴할 수 없습니다. 다른 관리자에게 관리자 화면에서 처리를 요청해 주세요." };
  }

  const email = session.email.trim().toLowerCase();
  const typed = String(formData.get("confirmEmail") ?? "").trim().toLowerCase();
  if (typed !== email) {
    return { error: "계정 이메일이 맞지 않습니다. 위에 보이는 이메일을 그대로 적어 주세요." };
  }

  const db = await ready();
  /* 계정을 먼저 지우면 어떤 주소로 받던 것인지 다시 찾기 번거로우므로 메일부터 정리한다 */
  await db.run("DELETE FROM newsletter_subscribers WHERE email = ?", [email]);
  await db.run(
    `UPDATE notice_subscribers SET status = 'unsubscribed'
      WHERE deleted_at = '' AND status IN ('active', 'pending') AND (user_id = ? OR email = ?)`,
    [session.userId, email],
  );
  await db.run("DELETE FROM users WHERE id = ?", [session.userId]);

  await destroySession();
  revalidatePath("/", "layout");
  revalidatePath("/admin/members");
  redirect("/login?social=withdrawn");
}
