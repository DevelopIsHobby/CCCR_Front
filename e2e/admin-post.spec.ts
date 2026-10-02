import { test, expect } from "@playwright/test";
import { ADMIN, MARK, login } from "./fixtures";

/* 관리자 글쓰기 — 공지사항(본문 있는 게시판)과 산업뉴스(원문 링크 게시판) */

test.beforeEach(async ({ page }) => {
  await login(page, ADMIN);
});

test("공지사항 글을 올리면 목록과 본문에 보인다", async ({ page }) => {
  const title = `${MARK} 새로 올린 공지 ${Date.now()}`;

  await page.goto("/board/notice/write");
  await page.locator("#post-title").fill(title);
  await page.locator('[contenteditable="true"]').first().fill("본문도 함께 넣어 봅니다.");
  await page.getByRole("button", { name: "등록" }).click();

  /* 저장하면 방금 올린 글 화면으로 간다 */
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
  await expect(page.getByText("본문도 함께 넣어 봅니다.")).toBeVisible();

  await page.goto("/board/notice");
  await expect(page.getByRole("link", { name: new RegExp(title.slice(-12)) })).toBeVisible();
});

test("산업뉴스는 원문 기사 주소 없이 저장되지 않는다", async ({ page }) => {
  await page.goto("/info/news/write");

  /* 내용·첨부파일·회원 전용 칸은 없어야 한다 */
  await expect(page.locator('[contenteditable="true"]')).toHaveCount(0);
  await expect(page.locator('input[name="files"]')).toHaveCount(0);
  await expect(page.locator('input[name="isLocked"]')).toHaveCount(0);

  await page.locator("#post-title").fill(`${MARK} 주소 없는 기사`);
  /* 화면에서 막히는지 본다. 브라우저가 필수 칸이라고 알려 주므로 저장으로 넘어가지 않는다 */
  await page.getByRole("button", { name: "등록" }).click();
  await expect(page).toHaveURL(/\/info\/news\/write/);
});

test("산업뉴스 글을 올리면 목록에서 원문 기사로 이어진다", async ({ page }) => {
  const title = `${MARK} 새로 올린 기사 ${Date.now()}`;

  await page.goto("/info/news/write");
  await page.locator("#post-title").fill(title);
  /* 산업뉴스는 분류가 필수다(목록 위 탭에서 이 값으로 묶인다) */
  await page.locator("#post-category").selectOption("클라우드");
  await page.locator("#post-link").fill("https://example.org/news/1");
  await page.locator('input[name="linkLabel"]').fill("확인용경제신문");
  await page.getByRole("button", { name: "등록" }).click();

  /* 산업뉴스는 글 화면이 따로 없으므로 목록으로 돌아온다 */
  await expect(page).toHaveURL(/\/info\/news$/);

  const link = page.getByRole("link", { name: new RegExp(title.slice(-12)) });
  await expect(link).toHaveAttribute("href", "https://example.org/news/1");
  await expect(link).toHaveAttribute("target", "_blank");
  await expect(page.getByText("확인용경제신문")).toBeVisible();
});

test("산업뉴스는 분류를 골라 올리고, 탭으로 거를 수 있다", async ({ page }) => {
  const stamp = Date.now();
  const cloud = `${MARK} 공공 클라우드 전환 ${stamp}`;
  const ai = `${MARK} AI 반도체 투자 ${stamp}`;

  /* 분류를 골라 기사 두 개를 올린다 */
  for (const [title, category] of [
    [cloud, "클라우드"],
    [ai, "AI"],
  ]) {
    await page.goto("/info/news/write");
    await page.locator("#post-title").fill(title);
    await page.locator("#post-category").selectOption(category);
    await page.locator("#post-link").fill(`https://example.org/${category}/${stamp}`);
    await page.getByRole("button", { name: "등록" }).click();
    await expect(page).toHaveURL(/\/info\/news$/);
  }

  /* 맨 앞 '전체' 탭에는 둘 다 있고, 분류가 함께 보인다 */
  const cloudLink = page.getByRole("link", { name: /공공 클라우드 전환/ });
  const aiLink = page.getByRole("link", { name: /AI 반도체 투자/ });

  await page.goto("/info/news");
  await expect(cloudLink).toBeVisible();
  await expect(aiLink).toBeVisible();

  /* 분류 탭을 누르면 그 분류만 남는다 */
  await page.getByRole("link", { name: "클라우드", exact: true }).first().click();
  await expect(page).toHaveURL(/cat=/);
  await expect(cloudLink).toBeVisible();
  await expect(aiLink).toHaveCount(0);

  /* '전체' 로 돌아오면 다시 둘 다 보인다 */
  await page.getByRole("link", { name: "전체", exact: true }).click();
  await expect(aiLink).toBeVisible();
});
