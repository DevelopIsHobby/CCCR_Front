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

/** 공고 원문 주소. 제목에서 만들어, 시험마다 따로 기억해 두지 않아도 되게 한다 */
function urlOf(title: string): string {
  return `https://www.example.com/notice/${title.slice(-13)}`;
}

/**
 * 사업공고를 한 건 올리고 제목을 돌려준다. applyBy 가 없으면 상시 접수 공고가 된다.
 * 공고는 내용을 옮겨 적지 않고 원문 주소만 건다(산업뉴스와 같다). 올리면 목록으로 돌아온다.
 */
async function write(
  page: import("@playwright/test").Page,
  what: string,
  applyBy: string | null,
): Promise<string> {
  const title = `${MARK} ${what} ${Date.now()}`;

  await page.goto("/board/announce/write");
  await page.locator("#post-title").fill(title);
  await page.locator("#post-link").fill(urlOf(title));
  await page.locator("#announce-host").fill("정보통신산업진흥원");
  if (applyBy) await page.locator("#announce-apply").fill(applyBy);
  await page.getByRole("button", { name: "등록" }).click();
  await expect(page).toHaveURL(/\/board\/announce$/);
  await expect(page.locator("tr", { hasText: title })).toBeVisible();

  return title;
}

test("공고 글쓰기에는 내용·첨부 칸이 없고 원문 주소가 필수다", async ({ page }) => {
  await page.goto("/board/announce/write");
  await expect(page.getByText("공고 원문 주소")).toBeVisible();
  await expect(page.locator("#post-link")).toHaveAttribute("required", "");
  await expect(page.locator('[contenteditable="true"]')).toHaveCount(0);
  await expect(page.locator('input[type="file"]')).toHaveCount(0);
});

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
});

test("제목을 누르면 공고 원문이 새 창으로 열린다", async ({ page }) => {
  const title = await write(page, "원문 확인 공고", dayFromToday(30));

  await page.goto("/board/announce");
  const link = page
    .locator("tr", { hasText: title })
    .getByRole("link", { name: /공고 원문, 새 창/ });
  await expect(link).toHaveAttribute("href", urlOf(title));
  await expect(link).toHaveAttribute("target", "_blank");
});

test("고쳐도 마감일과 원문 주소가 그대로 남는다", async ({ page }) => {
  /* 원문 링크 게시판은 고칠 때 따로 저장한다. 공고 칸을 빠뜨리면 마감일이 조용히 지워진다 */
  const applyBy = dayFromToday(30);
  const title = await write(page, "고칠 공고", applyBy);

  /* 제목은 바깥으로 나가므로 관리자 수정 링크는 목록 줄에 있다 */
  await page
    .locator("tr", { hasText: title })
    .getByRole("link", { name: "수정", exact: true })
    .click();
  await expect(page.locator("#announce-apply")).toHaveValue(applyBy);
  await expect(page.locator("#post-link")).toHaveValue(urlOf(title));
  await page.locator("#post-title").fill(`${title} (수정)`);
  await page.getByRole("button", { name: "수정", exact: true }).click();
  await expect(page).toHaveURL(/\/board\/announce$/);

  const row = page.locator("tr", { hasText: `${title} (수정)` });
  await expect(row).toContainText("접수중");
  await expect(row).toContainText("정보통신산업진흥원");
  await expect(row.getByRole("link", { name: /공고 원문, 새 창/ })).toHaveAttribute(
    "href",
    urlOf(title),
  );
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

test("접수중·접수마감 탭으로 공고를 나눠 본다", async ({ page }) => {
  const soon = await write(page, "곧 마감 공고", dayFromToday(3));
  const later = await write(page, "넉넉한 공고", dayFromToday(40));
  const closed = await write(page, "지난 공고", dayFromToday(-3));
  const always = await write(page, "상시 탭 공고", null);

  await page.goto("/board/announce");
  const tabs = page.getByRole("navigation", { name: "접수 상태" });
  await expect(tabs.getByRole("link", { name: "전체 사업" })).toHaveAttribute(
    "aria-current",
    "page",
  );

  /* 접수중: 마감 전 공고만, 마감이 가까운 것부터. 상시 공고는 단정하지 않으므로 빠진다 */
  await tabs.getByRole("link", { name: "접수중인 사업" }).click();
  await expect(page).toHaveURL(/status=open/);
  /* 건수 줄도 탭 이름을 따른다 */
  await expect(page.getByText(/^접수중인 사업 \d+건$/)).toBeVisible();
  const body = page.locator("tbody");
  await expect(body).toContainText(soon);
  await expect(body).toContainText(later);
  await expect(body).not.toContainText(closed);
  await expect(body).not.toContainText(always);
  const titles = await body.locator("tr").allInnerTexts();
  const soonAt = titles.findIndex((t) => t.includes(soon));
  const laterAt = titles.findIndex((t) => t.includes(later));
  expect(soonAt).toBeLessThan(laterAt);

  /* 검색해도 보던 탭에 머문다 */
  await page.locator("#board-q").fill(closed.slice(-13));
  await page.getByRole("button", { name: "검색", exact: true }).click();
  await expect(page).toHaveURL(/status=open/);
  await expect(page.getByText("검색 결과가 없습니다.")).toBeVisible();

  /* 접수마감: 지난 공고만 */
  await page.goto("/board/announce");
  await page
    .getByRole("navigation", { name: "접수 상태" })
    .getByRole("link", { name: "접수마감 사업" })
    .click();
  await expect(page).toHaveURL(/status=closed/);
  await expect(body).toContainText(closed);
  await expect(body).not.toContainText(soon);
  await expect(body).not.toContainText(always);
});
