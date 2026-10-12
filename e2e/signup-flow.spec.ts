import { test, expect } from "@playwright/test";
import { db, openSignupForm } from "./fixtures";

/*
  가입 세 단계(회원 유형 → 약관 동의 → 정보 입력).

  예전에는 모든 칸이 한 화면에 몰려 있었다. 단계를 나누면 생기는 위험은 둘이다.
  하나는 단계 사이가 끊기는 것(고른 유형·동의가 다음 단계로 안 넘어감),
  다른 하나는 주소를 고쳐 앞 단계를 건너뛰는 것이다. 둘 다 여기서 본다.

  가입은 한 시간에 다섯 번까지라 실제로 계정을 만드는 시험은 하나만 둔다.
*/

test("회원사 가입은 온라인 가입이 아니라 회원사 가입안내로 보낸다", async ({ page }) => {
  /* 기관이 조합에 새로 가입하는 것이라 온라인 절차가 없다 */
  await page.goto("/signup");
  /* 머리 메뉴에도 같은 주소 링크가 있어 본문의 카드를 집는다 */
  await page.locator('main a[href="/members/join"]').filter({ hasText: "조합에 새로 가입" }).click();
  await expect(page).toHaveURL(/\/members\/join/);
});

test("개인회원은 소속 없이 가입하고, 뉴스레터 동의가 끝까지 이어진다", async ({ page }) => {
  const email = `e2e-personal-${Date.now()}@example.test`;
  await openSignupForm(page, "개인", { newsletter: true });

  /* 기업에만 있는 칸은 개인에게 나오지 않는다 */
  await expect(page.locator("#signup-department")).toHaveCount(0);
  await expect(page.locator("#signup-bizNumber")).toHaveCount(0);

  await page.locator("#signup-name").fill("확인용개인");
  await page.locator("#signup-email").fill(email);
  await page.locator("#signup-phone").fill(`010-${String(Date.now()).slice(-8)}`);
  await page.locator("#signup-password").fill("e2e-Test-Passw0rd");
  await page.locator("#signup-password-confirm").fill("e2e-Test-Passw0rd");
  await page.getByRole("button", { name: "가입 신청" }).click();
  await expect(page.getByText("가입 신청이 접수되었습니다")).toBeVisible();

  const conn = db();
  const user = conn
    .prepare("SELECT member_type, company FROM users WHERE email = ?")
    .get(email) as { member_type: string; company: string | null } | undefined;
  const sub = conn.prepare("SELECT status FROM newsletter_subscribers WHERE email = ?").get(email) as
    | { status: string }
    | undefined;
  conn.close();

  expect(user?.member_type).toBe("개인");
  expect(user?.company).toBeNull();
  /* 둘째 단계에서 켠 뉴스레터 동의가 셋째 단계를 지나 저장까지 왔다 */
  expect(sub?.status).toBe("active");
});

test("필수 동의를 켜지 않으면 다음 단계로 넘어가지 않는다", async ({ page }) => {
  await page.goto("/signup?type=personal");
  await page.locator('form[action="/signup"]').getByRole("button", { name: "이메일로 가입하기" }).click();

  /* 브라우저가 막아 그 자리에 남는다 */
  await expect(page).toHaveURL(/\/signup\?type=personal$/);
  await expect(page.locator("#signup-phone")).toHaveCount(0);
});

test("동의 없이 정보 입력 주소로 바로 오면 약관 동의로 돌려보낸다", async ({ page }) => {
  /* 필수 동의 하나가 빠진 주소 */
  await page.goto("/signup?type=company&agreeTerms=on");
  await expect(page.locator('form[action="/signup"] input[name="agreePrivacy"]')).toBeVisible();
  await expect(page.locator("#signup-phone")).toHaveCount(0);

  /* 모르는 유형이면 첫 단계로 */
  await page.goto("/signup?type=member&agreeTerms=on&agreePrivacy=on");
  await expect(page.getByText("어떤 회원으로 가입하시나요?")).toBeVisible();
});

test("요청을 직접 만들어 동의를 빼고 보내도 서버가 막는다", async ({ page }) => {
  const email = `e2e-noagree-${Date.now()}@example.test`;
  await openSignupForm(page, "기업");

  /* 셋째 단계는 동의를 숨은 칸으로 들고 있다. 그것을 떼고 보낸다 */
  await page.locator('input[type="hidden"][name="agreePrivacy"]').evaluate((el) => el.remove());

  await page.locator("#signup-company").fill("확인용회사");
  await page.locator("#signup-name").fill("확인용담당자");
  await page.locator("#signup-email").fill(email);
  await page.locator("#signup-phone").fill(`010-${String(Date.now()).slice(-8)}`);
  await page.locator("#signup-password").fill("e2e-Test-Passw0rd");
  await page.locator("#signup-password-confirm").fill("e2e-Test-Passw0rd");
  await page.getByRole("button", { name: "가입 신청" }).click();

  await expect(page.locator('p[role="alert"]')).toHaveText("필수 약관에 동의해 주세요.");
  const conn = db();
  expect(conn.prepare("SELECT id FROM users WHERE email = ?").get(email)).toBeUndefined();
  conn.close();
});

test("기업회원은 기관·회사명이 있어야 한다", async ({ page }) => {
  const email = `e2e-nocompany-${Date.now()}@example.test`;
  await openSignupForm(page, "기업");

  /* 화면의 required 는 브라우저가 지켜 줄 뿐이다. 떼고 보내 서버가 막는지 본다 */
  await page.locator("#signup-company").evaluate((el) => el.removeAttribute("required"));
  await page.locator("#signup-name").fill("확인용담당자");
  await page.locator("#signup-email").fill(email);
  await page.locator("#signup-phone").fill(`010-${String(Date.now()).slice(-8)}`);
  await page.locator("#signup-password").fill("e2e-Test-Passw0rd");
  await page.locator("#signup-password-confirm").fill("e2e-Test-Passw0rd");
  await page.getByRole("button", { name: "가입 신청" }).click();

  await expect(page.locator('p[role="alert"]')).toHaveText("기관·회사명을 입력해 주세요.");
});

test("둘째 단계의 안내는 고른 유형이 실제로 내는 항목만 적는다", async ({ page }) => {
  /* 동의를 받을 때 알리는 수집 항목이 실제와 다르면 안 된다 */
  await page.goto("/signup?type=personal");
  await expect(page.getByText(/수집 항목 : 회원 유형, 이름, 이메일주소, 휴대전화번호, 비밀번호 \(선택: 소속\)/)).toBeVisible();
  /* 약관 전문(닫힌 팝업)에는 두 유형이 다 적혀 있으므로 화면에 보이는 안내만 본다 */
  await expect(page.locator("li:visible", { hasText: "사업자등록번호" })).toHaveCount(0);

  await page.goto("/signup?type=company");
  await expect(page.getByText(/기관·회사명, 담당자 이름/).first()).toBeVisible();
});

/*
  소셜 단추.

  처음에는 동의 폼의 제출 단추로 만들었는데, 사이트 보안 정책(CSP form-action 'self')이
  폼 제출이 바깥 사이트로 넘어가는 것을 막아 카카오로 가는 길에서 끊겼다. 눌러도 아무 반응이
  없었고, 개발 화면에는 소셜 키가 없어 단추가 안 나와 배포 전에 못 봤다.
  시험 서버에는 운영과 같은 정책이 걸리고 가짜 카카오 키가 있다(playwright.config.ts).
  카카오 주소는 가로채서 진짜 카카오에는 요청이 가지 않는다.
*/
test("동의하고 카카오를 누르면 고른 유형·동의를 들고 카카오 로그인으로 간다", async ({ page, context }) => {
  await page.route("https://kauth.kakao.com/**", (route) =>
    route.fulfill({ status: 200, contentType: "text/html", body: "<p>kakao</p>" }),
  );

  await page.goto("/signup?type=company");
  const agree = page.locator('form[action="/signup"]');
  await agree.locator('input[name="agreeTerms"]').check();
  await agree.locator('input[name="agreePrivacy"]').check();

  /* 단추 모양(링크·제출 단추)과 상관없이 글자로 찾는다. 정말 카카오까지 가는지만 본다 */
  const toKakao = page.waitForRequest(/kauth\.kakao\.com\/oauth\/authorize/, { timeout: 10_000 });
  await agree.getByText("카카오로 가입").click();
  await toKakao;

  /* 다녀온 뒤 또 묻지 않도록 고른 유형과 동의를 적어 두었다(signup-intent.ts) */
  const intent = (await context.cookies()).find((c) => c.name === "c3r_signup_intent");
  expect(intent?.value).toBe("company.0");
});

test("동의 없이 소셜 단추를 누르면 그 자리에서 동의하라고 알린다", async ({ page }) => {
  await page.goto("/signup?type=personal");
  await page.locator('form[action="/signup"]').getByText("카카오로 가입").click();

  /* 화면 밖 동의 칸에 기본 경고만 뜨면 아무 반응이 없는 것처럼 보인다 */
  await expect(page.locator('form[action="/signup"] [role="alert"]')).toContainText("필수 약관");
  await expect(page).toHaveURL(/\/signup\?type=personal$/);
  await expect(page.locator('form[action="/signup"] input[name="agreeTerms"]')).toBeInViewport();
});

test("동의 없이 이메일로 가입하기를 눌러도 같은 안내가 나온다", async ({ page }) => {
  await page.goto("/signup?type=personal");
  await page.getByRole("button", { name: "이메일로 가입하기" }).click();

  await expect(page.locator('form[action="/signup"] [role="alert"]')).toContainText("필수 약관");
  await expect(page.locator("#signup-phone")).toHaveCount(0);

  /* 동의를 켜면 안내가 사라진다 */
  const agree = page.locator('form[action="/signup"]');
  await agree.locator('input[name="agreeTerms"]').check();
  await agree.locator('input[name="agreePrivacy"]').check();
  await expect(page.locator('form[action="/signup"] [role="alert"]')).toHaveCount(0);
});
