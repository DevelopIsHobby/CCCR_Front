import { test, expect } from "@playwright/test";
import { ADMIN, MEMBER, db, login } from "./fixtures";

/* 가입 신청 · 로그인 · 권한 */

test("가입 신청을 넣으면 접수 안내가 보이고 승인 대기 상태가 된다", async ({ page }) => {
  const email = `e2e-signup-${Date.now()}@example.test`;

  await page.goto("/signup");
  await page.locator('input[name="agreeTerms"]').first().check();
  await page.locator('input[name="agreePrivacy"]').first().check();
  /* 회원 구분은 필수다 */
  await page.locator('input[name="memberType"][value="회원사"]').check();
  await page.locator("#signup-company").fill("확인용회사");
  await page.locator("#signup-name").fill("확인용담당자");
  await page.locator("#signup-email").fill(email);
  await page.locator("#signup-phone").fill(`010-${String(Date.now()).slice(-8)}`);
  await page.locator("#signup-password").fill("e2e-Test-Passw0rd");
  await page.locator("#signup-password-confirm").fill("e2e-Test-Passw0rd");
  await page.getByRole("button", { name: "가입 신청" }).click();

  await expect(page.getByText("가입 신청이 접수되었습니다")).toBeVisible();

  const conn = db();
  const row = conn.prepare("SELECT status, role, member_type FROM users WHERE email = ?").get(email) as
    | { status: string; role: string; member_type: string }
    | undefined;
  conn.close();

  /* 사무국이 승인하기 전까지는 대기 상태여야 한다 */
  expect(row?.status).toBe("pending");
  expect(row?.role).toBe("member");
  /* 고른 회원 구분이 그대로 남는다 */
  expect(row?.member_type).toBe("회원사");
});

test("승인 전 계정은 로그인할 수 없다", async ({ page }) => {
  await page.goto("/login");
  await page.locator("#login-email").fill("e2e-pending@example.test");
  await page.locator("#login-pw").fill(MEMBER.password);
  await page.getByRole("button", { name: "로그인" }).click();

  await expect(page.locator('p[role="alert"]')).toContainText("승인");
  await expect(page).toHaveURL(/\/login/);
});

test("비밀번호가 틀리면 로그인되지 않는다", async ({ page }) => {
  await page.goto("/login");
  await page.locator("#login-email").fill(MEMBER.email);
  await page.locator("#login-pw").fill("틀린비밀번호1234");
  await page.getByRole("button", { name: "로그인" }).click();

  await expect(page.locator('p[role="alert"]')).toContainText("올바르지 않습니다");
});

test("회원으로 로그인하면 마이페이지가 열린다", async ({ page }) => {
  await login(page, MEMBER);
  await page.goto("/mypage");
  await expect(page.getByRole("heading", { name: "마이페이지" })).toBeVisible();
  await expect(page.getByText(MEMBER.email).first()).toBeVisible();
});

test("회원은 관리자 화면에 들어갈 수 없다", async ({ page }) => {
  await login(page, MEMBER);
  await page.goto("/admin");
  await expect(page).not.toHaveURL(/\/admin$/);
});

test("로그인하지 않으면 관리자 화면에서 로그인으로 보낸다", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/login/);
});

test("관리자로 로그인하면 관리자 화면이 열린다", async ({ page }) => {
  await login(page, ADMIN);
  await page.goto("/admin");
  await expect(page.getByRole("link", { name: "대시보드" }).first()).toBeVisible();
});

test("영문만 있는 비밀번호로는 가입할 수 없다", async ({ page }) => {
  const email = `e2e-signup-weak-${Date.now()}@example.test`;

  await page.goto("/signup");
  await page.locator('input[name="agreeTerms"]').first().check();
  await page.locator('input[name="agreePrivacy"]').first().check();
  await page.locator('input[name="memberType"][value="비회원사"]').check();
  await page.locator("#signup-company").fill("확인용회사");
  await page.locator("#signup-name").fill("확인용담당자");
  await page.locator("#signup-email").fill(email);
  await page.locator("#signup-phone").fill(`010-${String(Date.now()).slice(-8)}`);

  /* 입력하는 동안 규칙을 맞췄는지 보여 준다 — 숫자 포함이 아직 안 맞는다 */
  await page.locator("#signup-password").fill("onlyletters");
  await expect(page.getByText("숫자 포함 (아직)")).toHaveCount(1);
  await page.locator("#signup-password-confirm").fill("onlyletters");
  await page.getByRole("button", { name: "가입 신청" }).click();

  await expect(page.locator('p[role="alert"]')).toContainText("영문과 숫자");
  const conn = db();
  const row = conn.prepare("SELECT id FROM users WHERE email = ?").get(email);
  conn.close();
  expect(row).toBeUndefined();
});

test("관리자가 기존 회원의 구분을 정하고, 구분별로 거를 수 있다", async ({ page }) => {
  /* 회원 구분을 받기 전에 가입한 회원처럼, 구분이 비어 있는 계정을 하나 만든다 */
  const email = `e2e-legacy-${Date.now()}@example.test`;
  const conn = db();
  conn
    .prepare(
      `INSERT INTO users (email, password_hash, name, company, role, status, created_at)
       VALUES (?, 'x', '옛회원', '옛회사', 'member', 'active', ?)`,
    )
    .run(email, new Date().toISOString().slice(0, 19).replace("T", " "));
  const { id } = conn.prepare("SELECT id FROM users WHERE email = ?").get(email) as { id: number };
  conn.close();

  await login(page, ADMIN);

  /* '구분 없음'으로 거르면 그 회원이 보이고, 안내 문구도 나온다 */
  await page.goto("/admin/members?type=none");
  await expect(page.getByText(email)).toBeVisible();

  /* 고르는 즉시 저장된다 */
  await page.locator(`#member-type-${id}`).selectOption("회원사");
  await expect
    .poll(() => {
      const c = db();
      const row = c.prepare("SELECT member_type FROM users WHERE id = ?").get(id) as { member_type: string | null };
      c.close();
      return row.member_type;
    })
    .toBe("회원사");

  /* 이제 '회원사'로 거르면 보이고, '구분 없음'에서는 빠진다 */
  await page.goto("/admin/members?type=회원사");
  await expect(page.getByText(email)).toBeVisible();
  await page.goto("/admin/members?type=none");
  await expect(page.getByText(email)).toHaveCount(0);

  /* 관리자 접속 기록에 누구를 어떻게 바꿨는지 남는다 */
  await page.goto("/admin/access-log?action=처리");
  await expect(page.getByRole("cell", { name: new RegExp(`회원 #${id} 구분 → 회원사`) }).first()).toBeVisible();
});
