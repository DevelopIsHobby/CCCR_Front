import { test, expect, type Page } from "@playwright/test";
import { ADMIN, MARK, login } from "./fixtures";

/*
  관리자 → 달력 일정. 직접 넣은 일정이 메인 달력에 나오고, 종류를 끄거나 하나만 숨기면 빠진다.
  종류 켜고 끄기는 사이트 전체 설정이라, 끈 것은 이 시험 안에서 다시 켜 둔다.
*/

test.describe.configure({ mode: "serial" });

function dayFromToday(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

/** 메인 달력을 그 날이 있는 달로 넘기고 그 날을 누른다. 그날 일정 목록을 돌려준다 */
async function openDay(page: Page, date: string) {
  await page.goto("/");
  const [y, m, d] = date.split("-").map(Number);
  const header = page.getByText(/^\d{4}년 \d{1,2}월$/);
  for (let i = 0; i < 6; i++) {
    const [hy, hm] = ((await header.innerText()).match(/\d+/g) ?? []).map(Number);
    if (hy === y && hm === m) break;
    const later = hy < y || (hy === y && hm < m);
    await page.getByRole("button", { name: later ? "다음 달" : "이전 달" }).click();
  }
  await page.getByRole("button", { name: new RegExp(`^${m}월 ${d}일(,|$)`) }).click();
  return page.locator("body");
}

test("직접 넣은 일정이 메인 달력에 나오고, 종류를 끄거나 하나만 숨기면 빠진다", async ({ page }) => {
  /* 다른 시험 일정과 겹치지 않게 멀리 잡는다(달력이 싣는 범위 안) */
  const date = dayFromToday(75);
  const unique = `정기총회 ${Date.now()}`;
  const title = `${MARK} ${unique}`;
  await login(page, ADMIN);

  /* 1. 일정 넣기 */
  await page.goto("/admin/calendar");
  const custom = page.locator("#custom");
  await custom.locator('input[name="title"]').last().fill(title);
  await custom.locator('input[name="startsOn"]').last().fill(date);
  await custom.getByRole("button", { name: "일정 추가" }).click();
  await expect(custom.getByText(title)).toBeVisible();
  const listed = page.getByRole("list", { name: "달력에 걸린 일정" });
  await expect(listed.getByText(title)).toBeVisible();

  /* 2. 메인 달력에 '조합 일정'으로 나온다 */
  await openDay(page, date);
  const day = page.getByRole("list", { name: "고른 날의 일정" });
  await expect(day.getByRole("link", { name: new RegExp(unique) })).toBeVisible();
  await expect(day).toContainText("조합 일정");

  /* 3. 종류를 끄면 빠진다 → 다시 켜 둔다 */
  await page.goto("/admin/calendar");
  await page.getByRole("checkbox", { name: /조합 일정/ }).uncheck();
  await page.getByRole("button", { name: "저장", exact: true }).click();
  await expect(listed.getByText("종류가 꺼져 있음").first()).toBeVisible();
  await openDay(page, date);
  await expect(page.getByRole("link", { name: new RegExp(unique) })).toHaveCount(0);

  await page.goto("/admin/calendar");
  await page.getByRole("checkbox", { name: /조합 일정/ }).check();
  await page.getByRole("button", { name: "저장", exact: true }).click();
  await expect(listed.getByRole("button", { name: `${title} 숨기기` })).toBeVisible();

  /* 4. 하나만 숨기면 빠진다(일정은 그대로 남는다) */
  await listed.getByRole("button", { name: `${title} 숨기기` }).click();
  await expect(listed.getByRole("button", { name: `${title} 다시 보이기` })).toBeVisible();
  await openDay(page, date);
  await expect(page.getByRole("link", { name: new RegExp(unique) })).toHaveCount(0);

  /* 5. 지우면 목록에서도 사라진다 */
  await page.goto("/admin/calendar");
  page.once("dialog", (d) => void d.accept());
  await custom.locator("li", { hasText: title }).getByRole("button", { name: "삭제" }).click();
  await expect(custom.getByText(title)).toHaveCount(0);
});
