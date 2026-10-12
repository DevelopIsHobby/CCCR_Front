import { test, expect, type BrowserContext } from "@playwright/test";
import { createHash, randomBytes } from "node:crypto";
import { db, now } from "./fixtures";

/*
  소셜 가입 마무리 화면(/signup/social).

  카카오·네이버·구글을 다녀와 처음 온 사람이 회원 정보를 마저 적는 곳이다.
  바깥 서비스 로그인은 시험에서 할 수 없으므로, 다녀온 뒤의 상태를 콜백과 똑같이
  만든다 — DB 의 대기 줄(oauth_signups)과 쿠키 하나((api/auth/[provider]/callback).
  전에는 이 화면에 시험이 없어 고칠 때마다 눈으로만 봤다.

  가입 화면에서 출발했으면 고른 유형·동의가 쿠키(c3r_signup_intent)에 있어 또 묻지 않고,
  로그인 단추로 바로 왔으면 여기서 유형·동의를 받는다. 둘 다 본다.
*/

/** 카카오에서 막 돌아온 상태를 만든다. 서비스가 확인해 준 이메일이 있는 경우다. */
async function backFromKakao(context: BrowserContext, baseURL: string | undefined, intent?: string) {
  const token = randomBytes(24).toString("base64url");
  const stamp = Date.now();
  const email = `e2e-social-${stamp}@example.test`;

  const conn = db();
  conn
    .prepare(
      `INSERT INTO oauth_signups
         (token_hash, provider, subject, email, email_verified, name, completed, expires_at, created_at)
       VALUES (?, 'kakao', ?, ?, 1, '카카오이름', 0, ?, ?)`,
    )
    .run(
      createHash("sha256").update(token).digest("hex"),
      `e2e-kakao-${stamp}`,
      email,
      new Date(stamp + 30 * 60_000).toISOString(),
      now(),
    );
  conn.close();

  /* 시험 서버 주소에 붙인다(playwright.config.ts 의 baseURL) */
  const url = baseURL ?? "http://127.0.0.1:3100";
  const cookies = [{ name: "c3r_oauth_signup", value: token, url }];
  if (intent) cookies.push({ name: "c3r_signup_intent", value: intent, url });
  await context.addCookies(cookies);

  return { email, subject: `e2e-kakao-${stamp}` };
}

test("가입 화면에서 출발했으면 유형·동의를 또 묻지 않고, 신청하면 그대로 저장된다", async ({ page, context, baseURL }) => {
  const { email, subject } = await backFromKakao(context, baseURL, "company.1");
  await page.goto("/signup/social");

  /* 고른 것이 보이고, 동의 칸은 다시 나오지 않는다 */
  await expect(page.getByText("기업회원", { exact: true })).toBeVisible();
  await expect(page.getByText(/약관 동의 완료 · 뉴스레터 받음/)).toBeVisible();
  await expect(page.locator('#social-signup-form input[type="checkbox"][name="agreeTerms"]')).toHaveCount(0);

  /* 서비스가 확인해 준 이메일은 고칠 수 없다. 이름은 받아 온 것으로 채워 둔다 */
  await expect(page.locator("#social-email")).toHaveValue(email);
  await expect(page.locator("#social-email")).not.toBeEditable();
  await expect(page.locator("#social-name")).toHaveValue("카카오이름");

  await page.locator("#social-company").fill("확인용회사");
  await page.locator("#social-phone").fill(`010-${String(Date.now()).slice(-8)}`);
  await page.getByRole("button", { name: "가입 신청하기" }).click();
  await expect(page.getByText("가입 신청이 접수되었습니다")).toBeVisible();

  const conn = db();
  const user = conn
    .prepare("SELECT id, member_type, company, status, password_hash FROM users WHERE email = ?")
    .get(email) as
    | { id: number; member_type: string; company: string; status: string; password_hash: string }
    | undefined;
  const identity = conn
    .prepare("SELECT provider FROM user_identities WHERE subject = ?")
    .get(subject) as { provider: string } | undefined;
  const sub = conn.prepare("SELECT status FROM newsletter_subscribers WHERE email = ?").get(email) as
    | { status: string }
    | undefined;
  conn.close();

  expect(user?.member_type).toBe("기업");
  expect(user?.company).toBe("확인용회사");
  expect(user?.status).toBe("pending");
  /* 소셜 계정은 비밀번호가 없다. 비밀번호로는 들어올 수 없어야 한다 */
  expect(user?.password_hash).toBe("");
  expect(identity?.provider).toBe("kakao");
  /* 가입 화면 둘째 단계에서 켠 뉴스레터 동의가 카카오를 다녀와서도 이어졌다 */
  expect(sub?.status).toBe("active");
});

test("로그인 단추로 바로 왔으면 여기서 유형과 동의를 받고, 유형에 맞는 칸을 보여 준다", async ({ page, context, baseURL }) => {
  await backFromKakao(context, baseURL);
  await page.goto("/signup/social");

  /* 유형을 고르기 전에는 입력칸 대신 안내만 */
  await expect(page.getByText("회원 유형을 고르면 입력할 칸이 나옵니다.")).toBeVisible();
  await expect(page.locator('#social-signup-form input[type="checkbox"][name="agreeTerms"]')).toBeVisible();

  await page.getByText("개인회원", { exact: true }).click();
  await expect(page.locator("#social-name")).toBeVisible();
  await expect(page.locator("#social-department")).toHaveCount(0);
  await expect(page.locator("#social-bizNumber")).toHaveCount(0);

  await page.getByText("기업회원", { exact: true }).click();
  await expect(page.locator("#social-department")).toBeVisible();
  await expect(page.locator("#social-bizNumber")).toBeVisible();
});

test("남아 있던 동의 기억이 망가진 값이면 무시하고 여기서 다시 받는다", async ({ page, context, baseURL }) => {
  /* 쿠키는 사용자가 고칠 수 있다. 엉뚱한 값으로 동의를 건너뛰면 안 된다 */
  await backFromKakao(context, baseURL, "member.1");
  await page.goto("/signup/social");
  await expect(page.locator('#social-signup-form input[type="checkbox"][name="agreePrivacy"]')).toBeVisible();
});
