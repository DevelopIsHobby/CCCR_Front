import { test, expect } from "@playwright/test";
import { ADMIN, MARK, login } from "./fixtures";

/*
  사업공고 게시판.

  공고는 오즈메일러로 구독자에게 보내지만, 메일을 받지 않는 분도 사이트에서 볼 수 있어야 한다.
  다른 게시판과 다른 점은 접수 마감일이 있고, 그 날짜로 접수중·마감이 갈린다는 것뿐이다.
  그래서 마감일이 목록·상세까지 제대로 오가는지, 날짜 경계가 맞는지를 확인한다.

  날짜는 오늘을 기준으로 만든다. 고정된 날짜를 적으면 그날이 지나는 순간 시험이 깨진다.
*/

/** 오늘로부터 며칠 뒤(음수면 며칠 전)를 YYYY-MM-DD 로 준다 */
function dayFromToday(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

test.beforeEach(async ({ page }) => {
  await login(page, ADMIN);
});

/** 사업공고를 한 건 올리고 제목을 돌려준다. applyBy 가 없으면 상시 접수 공고가 된다. */
async function write(
  page: import("@playwright/test").Page,
  what: string,
  applyBy: string | null,
): Promise<string> {
  const title = `${MARK} ${what} ${Date.now()}`;

  await page.goto("/board/announce/write");
  await page.locator("#post-title").fill(title);
  await page.locator('[contenteditable="true"]').first().fill("공고 본문입니다.");
  await page.locator("#announce-host").fill("정보통신산업진흥원");
  if (applyBy) await page.locator("#announce-apply").fill(applyBy);
  await page.getByRole("button", { name: "등록" }).click();
  await expect(page.getByRole("heading", { name: title })).toBeVisible();

  return title;
}

test("마감일이 남은 공고는 접수중으로, 지난 공고는 마감으로 보인다", async ({ page }) => {
  const open = await write(page, "접수중 공고", dayFromToday(30));
  const closed = await write(page, "마감된 공고", dayFromToday(-30));

  await page.goto("/board/announce");

  const openRow = page.locator("tr", { hasText: open });
  await expect(openRow).toContainText("접수중");
  await expect(openRow).toContainText("정보통신산업진흥원");

  const closedRow = page.locator("tr", { hasText: closed });
  await expect(closedRow).toContainText("마감");
});

test("마감일 당일까지는 접수중이다", async ({ page }) => {
  /* 경계값. 하루만 어긋나도 마감 당일에 신청하려는 분이 마감으로 보게 된다. */
  const title = await write(page, "오늘 마감 공고", dayFromToday(0));

  await page.goto("/board/announce");
  await expect(page.locator("tr", { hasText: title })).toContainText("접수중");
});

test("마감일을 비우면 상시 접수로 보인다", async ({ page }) => {
  const title = await write(page, "상시 공고", null);

  await page.goto("/board/announce");
  const row = page.locator("tr", { hasText: title });
  await expect(row).toContainText("상시");
  /* 마감일이 없으면 접수중·마감 어느 쪽도 아니다 */
  await expect(row).not.toContainText("접수중");

  await page.getByRole("link", { name: new RegExp(title.slice(-12)) }).click();
  await expect(page.getByText("상시 접수")).toBeVisible();
});

test("상세 화면에 주관기관과 접수 마감이 나온다", async ({ page }) => {
  const applyBy = dayFromToday(30);
  const title = await write(page, "상세 확인 공고", applyBy);

  await page.goto("/board/announce");
  await page.getByRole("link", { name: new RegExp(title.slice(-12)) }).click();

  await expect(page.getByText("주관기관")).toBeVisible();
  await expect(page.getByText("정보통신산업진흥원")).toBeVisible();
  await expect(page.getByText("접수 마감")).toBeVisible();
  await expect(page.getByText(applyBy.replaceAll("-", "."))).toBeVisible();
});

test("고쳐도 마감일이 그대로 남는다", async ({ page }) => {
  /* 고치기 화면이 공고 칸을 그리지 않으면 저장할 때 마감일이 조용히 지워진다 */
  const applyBy = dayFromToday(30);
  const title = await write(page, "고칠 공고", applyBy);

  await page.getByRole("link", { name: "수정" }).click();
  await expect(page.locator("#announce-apply")).toHaveValue(applyBy);
  await page.locator("#post-title").fill(`${title} (수정)`);
  await page.getByRole("button", { name: "수정", exact: true }).click();

  await page.goto("/board/announce");
  await expect(page.locator("tr", { hasText: title })).toContainText("접수중");
});

test("알림마당 차림표에 사업공고가 들어 있다", async ({ page }) => {
  /* 차림표에 없으면 주소를 아는 사람만 볼 수 있다 */
  await page.goto("/");
  await page.getByRole("link", { name: "알림마당" }).first().hover();

  const entry = page.getByRole("link", { name: "사업공고", exact: true }).first();
  await expect(entry).toBeVisible();
  await entry.click();

  await expect(page).toHaveURL(/\/board\/announce/);
  await expect(page.getByRole("heading", { name: "사업공고" })).toBeVisible();
});
