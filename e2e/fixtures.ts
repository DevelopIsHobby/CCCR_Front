import { DatabaseSync } from "node:sqlite";
import { randomBytes, scryptSync } from "node:crypto";
import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { E2E_DB } from "../playwright.config";

/*
  확인용 계정과 자료.

  여기 적힌 비밀번호는 `.e2e/c3r.db`(확인용 임시 DB)에만 들어가는 가짜 값이다.
  운영 DB 와 아무 관련이 없다.
*/
export const ADMIN = {
  email: "e2e-admin@example.test",
  password: "e2e-Test-Passw0rd",
  name: "확인용관리자",
};

export const MEMBER = {
  email: "e2e-member@example.test",
  password: "e2e-Test-Passw0rd",
  name: "확인용회원",
};

/** 확인용으로 넣은 자료를 나중에 골라내려고 붙이는 표시 */
export const MARK = "[E2E]";

export function db(): DatabaseSync {
  const conn = new DatabaseSync(E2E_DB);
  conn.exec("PRAGMA busy_timeout = 5000");
  return conn;
}

/** 저장 형식은 src/lib/auth/password.ts 와 같다: scrypt$<salt>$<hash> */
export function hashPassword(plain: string): string {
  const salt = randomBytes(16);
  const derived = scryptSync(plain.normalize("NFKC"), salt, 64);
  return `scrypt$${salt.toString("hex")}$${derived.toString("hex")}`;
}

export function now(): string {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

/** 이메일·비밀번호로 로그인한다. 소셜 로그인은 바깥 서비스라 여기서 확인하지 않는다. */
export async function login(page: Page, who: typeof ADMIN): Promise<void> {
  await page.goto("/login");
  await page.locator("#login-email").fill(who.email);
  await page.locator("#login-pw").fill(who.password);
  await page.getByRole("button", { name: "로그인" }).click();
  /* 로그인하면 원래 가려던 곳으로 보낸다. 로그인 화면을 벗어났는지로 확인한다. */
  await expect(page).not.toHaveURL(/\/login/);
}

/**
 * 가입 세 단계(회원 유형 → 약관 동의 → 정보 입력)를 화면으로 거쳐 정보 입력 칸을 연다.
 * 주소를 바로 치지 않고 단추를 눌러 간다. 그래야 단계 사이가 끊겼을 때 시험이 알아챈다.
 * 바닥의 뉴스레터 띠에도 동의 상자가 있어 가입 폼 안에서만 찾는다.
 */
export async function openSignupForm(
  page: Page,
  type: "개인" | "기업" = "기업",
  opts: { newsletter?: boolean } = {},
): Promise<void> {
  await page.goto("/signup");
  await page.locator(`a[href="/signup?type=${type === "개인" ? "personal" : "company"}"]`).click();

  const agree = page.locator('form[action="/signup"]');
  await agree.locator('input[name="agreeTerms"]').check();
  await agree.locator('input[name="agreePrivacy"]').check();
  if (opts.newsletter) await agree.locator('input[name="agreeNewsletter"]').check();
  await agree.getByRole("button", { name: "이메일로 가입하기" }).click();

  await expect(page.locator("#signup-phone")).toBeVisible();
}
