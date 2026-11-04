import { test, expect, type Page } from "@playwright/test";
import { ADMIN, MARK, db, login, now } from "./fixtures";

/*
  관리자 → 달력 일정. 행사 글이 메인 달력에 '행사'로 나오고, 종류를 끄거나 하나만 숨기면 빠진다.
  종류 켜고 끄기는 사이트 전체 설정이라, 끈 것은 이 시험 안에서 다시 켜 둔다.
  (직접 넣던 '조합 일정'은 뺐다 — 조합 일정도 행사 글로 올린다)
*/

test.describe.configure({ mode: "serial" });

function dayFromToday(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

/** 메인 달력을 그 날이 있는 달로 넘기고 그 날을 누른다 */
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
}

const calendarDay = (page: Page) => page.getByRole("list", { name: "고른 날의 일정" });

test("행사 글이 메인 달력에 나오고, 종류를 끄거나 하나만 숨기면 빠진다", async ({ page }) => {
  /* 다른 시험 일정과 겹치지 않게 멀리 잡는다(달력이 싣는 범위 안) */
  const date = dayFromToday(75);
  const unique = `정기총회 ${Date.now()}`;
  const title = `${MARK} ${unique}`;
  const conn = db();
  conn
    .prepare(
      `INSERT INTO posts (board, title, body, author_name, is_pinned, is_locked, views,
                          created_at, updated_at, event_starts_on, event_ends_on)
       VALUES ('events', ?, '<p>정기총회</p>', ?, 0, 0, 0, ?, ?, ?, ?)`,
    )
    .run(title, ADMIN.name, now(), now(), date, date);
  /* 앞선 시험이 도중에 멈춰 종류가 꺼진 채 남았을 수 있다 */
  conn.prepare("UPDATE site_settings SET value = '' WHERE key = 'calendar_off_kinds'").run();
  conn.close();
  await login(page, ADMIN);

  /* 1. 관리자 화면 목록에 걸리고, 직접 넣는 칸·조합 일정 종류는 없다 */
  await page.goto("/admin/calendar");
  const listed = page.getByRole("list", { name: "달력에 걸린 일정" });
  await expect(listed.getByText(title)).toBeVisible();
  await expect(page.getByRole("checkbox", { name: /조합 일정/ })).toHaveCount(0);
  await expect(page.locator("#custom")).toHaveCount(0);

  /* 2. 메인 달력에 '행사'로 나온다. 범례에 조합 일정이 없다 */
  await openDay(page, date);
  const day = calendarDay(page);
  await expect(day.getByRole("link", { name: new RegExp(unique) })).toBeVisible();
  await expect(day).toContainText("행사");
  await expect(page.getByText("조합 일정")).toHaveCount(0);

  /* 3. 종류를 끄면 빠진다 → 다시 켜 둔다 */
  await page.goto("/admin/calendar");
  await page.getByRole("checkbox", { name: /행사/ }).uncheck();
  await page.getByRole("button", { name: "저장", exact: true }).click();
  await expect(listed.getByText("종류가 꺼져 있음").first()).toBeVisible();
  await openDay(page, date);
  /* 옆 조합 소식 목록에도 같은 글이 있으므로 달력 안에서만 본다 */
  await expect(calendarDay(page).getByRole("link", { name: new RegExp(unique) })).toHaveCount(0);

  await page.goto("/admin/calendar");
  await page.getByRole("checkbox", { name: /행사/ }).check();
  await page.getByRole("button", { name: "저장", exact: true }).click();
  await expect(listed.getByRole("button", { name: `${title} 숨기기` })).toBeVisible();

  /* 4. 하나만 숨기면 빠진다(글은 그대로 남는다) → 다시 보이게 해 둔다 */
  await listed.getByRole("button", { name: `${title} 숨기기` }).click();
  await expect(listed.getByRole("button", { name: `${title} 다시 보이기` })).toBeVisible();
  await openDay(page, date);
  /* 옆 조합 소식 목록에도 같은 글이 있으므로 달력 안에서만 본다 */
  await expect(calendarDay(page).getByRole("link", { name: new RegExp(unique) })).toHaveCount(0);
  await page.goto("/admin/calendar");
  await listed.getByRole("button", { name: `${title} 다시 보이기` }).click();
  await expect(listed.getByRole("button", { name: `${title} 숨기기` })).toBeVisible();
});
