import { test, expect } from "@playwright/test";
import { ADMIN, MARK, login } from "./fixtures";

/*
  게시판 이동.

  글을 잘못된 게시판에 올렸을 때 지웠다 다시 쓰지 않아도 되게 하는 기능이다.
  게시판마다 목록을 그리는 방식이 달라, 옮기고 나면 빈 칸이 생길 수 있다.
  막지는 않고 무엇이 비었는지 알려 주기로 했으므로 그 안내까지 확인한다.
*/

test.beforeEach(async ({ page }) => {
  await login(page, ADMIN);
});

/** 관리자 글 목록에서 제목으로 한 줄을 골라 체크한다 */
async function pick(page: import("@playwright/test").Page, title: string) {
  await page.goto("/admin/posts");
  const row = page.locator("tr", { hasText: title });
  await expect(row).toBeVisible();
  await row.getByRole("checkbox").check();
}

test("공지를 자료실로 옮기면 그 게시판에 나타난다", async ({ page }) => {
  const title = `${MARK} 옮길 공지 ${Date.now()}`;

  await page.goto("/board/notice/write");
  await page.locator("#post-title").fill(title);
  await page.locator('[contenteditable="true"]').first().fill("옮겨도 본문은 그대로입니다.");
  await page.getByRole("button", { name: "등록" }).click();
  await expect(page.getByRole("heading", { name: title })).toBeVisible();

  await pick(page, title);
  await page.locator("select[name=toBoard]").selectOption({ label: "자료실" });
  await page.getByRole("button", { name: "옮기기" }).click();

  /* 조사가 받침에 맞아야 한다 — '자료실로'(ㄹ받침), '자료실으로'가 아니다 */
  await expect(page.getByText(/1건을 자료실로 옮겼습니다/)).toBeVisible();

  /* 옮긴 게시판에 보이고, 본문도 살아 있다 */
  await page.goto("/info/archive");
  await page.getByRole("link", { name: new RegExp(title.slice(-12)) }).click();
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
  await expect(page.getByText("옮겨도 본문은 그대로입니다.")).toBeVisible();

  /* 떠나온 게시판에는 더 없다 */
  await page.goto("/board/notice");
  await expect(page.getByRole("link", { name: new RegExp(title.slice(-12)) })).toHaveCount(0);
});

test("빈 칸이 생기는 곳으로 옮기면 무엇이 비었는지 알려 준다", async ({ page }) => {
  const title = `${MARK} 행사로 옮길 공지 ${Date.now()}`;

  await page.goto("/board/notice/write");
  await page.locator("#post-title").fill(title);
  await page.locator('[contenteditable="true"]').first().fill("행사일이 없는 글입니다.");
  await page.getByRole("button", { name: "등록" }).click();
  await expect(page.getByRole("heading", { name: title })).toBeVisible();

  await pick(page, title);
  await page.locator("select[name=toBoard]").selectOption({ label: "행사정보" });
  await page.getByRole("button", { name: "옮기기" }).click();

  /* 행사정보는 카드에 행사일을 보여 주는데 이 글에는 없다 */
  await expect(page.getByText(/행사일이 비어 있어/)).toBeVisible();
});

test("이미 그 게시판에 있는 글은 옮기지 않고 알려 준다", async ({ page }) => {
  const title = `${MARK} 제자리 공지 ${Date.now()}`;

  await page.goto("/board/notice/write");
  await page.locator("#post-title").fill(title);
  await page.locator('[contenteditable="true"]').first().fill("그대로 둘 글입니다.");
  await page.getByRole("button", { name: "등록" }).click();
  await expect(page.getByRole("heading", { name: title })).toBeVisible();

  await pick(page, title);
  await page.locator("select[name=toBoard]").selectOption({ label: "공지사항" });
  await page.getByRole("button", { name: "옮기기" }).click();

  await expect(page.getByText(/이미 공지사항에 있습니다/)).toBeVisible();
});
