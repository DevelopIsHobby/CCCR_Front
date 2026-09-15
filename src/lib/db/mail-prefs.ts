import "server-only";
import { ready } from "./migrate";

/*
  마이페이지 '메일 수신' 칸에 보여 줄 현황.

  이용약관 제12조는 회원이 회원정보수정 메뉴에서 정보수신거부를 할 수 있다고 적는다.
  뉴스레터는 이메일 주소로, 사업공고는 계정(user_id)이나 신청서에 적은 계정 주소로 묶는다.
*/
export type MailPrefs = {
  /** 계정 이메일로 뉴스레터를 받고 있는지 */
  newsletter: boolean;
  /** 사업공고: 받는 중 / 사무국 승인 대기 / 없음 */
  notice: "active" | "pending" | null;
};

export async function getMyMailPrefs(userId: number, emailInput: string): Promise<MailPrefs> {
  const email = emailInput.trim().toLowerCase();
  const db = await ready();

  const [newsletter, notices] = await Promise.all([
    db.get<{ status: string }>("SELECT status FROM newsletter_subscribers WHERE email = ?", [email]),
    db.all<{ status: string }>(
      `SELECT status FROM notice_subscribers
        WHERE deleted_at = '' AND status IN ('active', 'pending') AND (user_id = ? OR email = ?)`,
      [userId, email],
    ),
  ]);

  return {
    newsletter: newsletter?.status === "active",
    notice: notices.some((r) => r.status === "active") ? "active" : notices.length > 0 ? "pending" : null,
  };
}
