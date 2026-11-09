import { test, expect } from "@playwright/test";
import { ADMIN, MARK, db, login } from "./fixtures";

/*
  연혁. 2024·2025년(048 마이그레이션)이 맨 위에 오고, 관리자는 아직 연혁이 없는 해를 열어 넣을 수 있다.
  전에는 연도 단추가 이미 있는 해만 나와 새 해를 시작할 수 없었다(2026-11-09 사무국).
*/

test("설립목적 및 연혁: 2025년이 맨 앞이고 2024·2025년 활동이 보인다", async ({ page }) => {
  await page.goto("/about/history");
  await expect(page.getByRole("heading", { name: "2025년", level: 3 })).toBeVisible();
  await expect(page.getByText("제17회 정기총회 개최(사업 및 예산 승인)")).toBeVisible();
  await expect(page.getByText("CCCR Insight Series 2025 세미나 개최")).toBeVisible();

  await page.getByRole("button", { name: "2024년", exact: true }).click();
  await expect(page.getByRole("heading", { name: "2024년", level: 3 })).toBeVisible();
  await expect(page.getByText("GSMP 2024 성과보고회 개최")).toBeVisible();
});

test("관리자 연혁 관리: 새 연도를 열어 첫 항목을 넣으면 그 해가 생긴다", async ({ page }) => {
  const year = 2099;
  const title = `${MARK} 새 연도 시험 ${Date.now()}`;
  await login(page, ADMIN);
  await page.goto("/admin/pages/history");
  await page.getByLabel("새 연도").fill(String(year));
  await page.getByRole("button", { name: "연도 추가" }).click();
  await expect(page.getByRole("heading", { name: `${year}년` })).toBeVisible();
  await expect(page.getByText("이 연도에 등록된 연혁이 없습니다.")).toBeVisible();

  await page.getByRole("button", { name: `+ ${year}년 연혁 추가` }).click();
  await page.locator('input[name="month"], select[name="month"]').first().fill("01");
  await page.locator('[name="title"]').fill(title);
  await page.getByRole("button", { name: "추가", exact: true }).click();
  await expect(page.getByText(title)).toBeVisible();

  /* 다른 시험의 연혁 순서를 흐트리지 않게 지운다 */
  const conn = db();
  conn.prepare("DELETE FROM history_entries WHERE year = ?").run(`${year}년`);
  conn.close();
});
