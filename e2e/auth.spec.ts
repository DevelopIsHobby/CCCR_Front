import { test, expect } from "@playwright/test";
import { ADMIN, MEMBER, db, login } from "./fixtures";

/* 가입 신청 · 로그인 · 권한 */

test("가입 신청을 넣으면 접수 안내가 보이고 승인 대기 상태가 된다", async ({ page }) => {
  const email = `e2e-signup-${Date.now()}@example.test`;

  await page.goto("/signup");
  await page.locator('input[name="agreeTerms"]').first().check();
  await page.locator('input[name="agreePrivacy"]').first().check();
  await page.locator("#signup-company").fill("확인용회사");
  await page.locator("#signup-name").fill("확인용담당자");
  await page.locator("#signup-email").fill(email);
  await page.locator("#signup-password").fill("e2e-Test-Passw0rd");
  await page.locator("#signup-password-confirm").fill("e2e-Test-Passw0rd");
  await page.getByRole("button", { name: "가입 신청" }).click();

  await expect(page.getByText("가입 신청이 접수되었습니다")).toBeVisible();

  const conn = db();
  const row = conn.prepare("SELECT status, role FROM users WHERE email = ?").get(email) as
    | { status: string; role: string }
    | undefined;
  conn.close();

  /* 사무국이 승인하기 전까지는 대기 상태여야 한다 */
  expect(row?.status).toBe("pending");
  expect(row?.role).toBe("member");
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
