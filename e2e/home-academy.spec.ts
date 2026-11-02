import { test, expect } from "@playwright/test";
import { ADMIN, MARK, db, login, now } from "./fixtures";

/*
  메인 개편 — CCCR 아카데미 영역, 바로가기 한 줄, 휴대폰 가로 넘침.

  아카데미 영역에 무엇이 어떤 차례로 나오는지는 날짜가 정한다(lib/edu-course.ts).
  처음 넣어 둔 2026년 과정은 날이 지나면 마감되므로 시험은 그것에 기대지 않는다.
  시험마다 다른 과정을 숨기고 오늘을 기준으로 만든 과정만 둔다.
*/

/** 한국 시각 기준 오늘에서 며칠 뒤(음수면 앞)를 YYYY-MM-DD 로. 서버의 today() 와 같은 기준이다 */
function kstDay(offset: number): string {
  return new Date(Date.now() + 9 * 3_600_000 + offset * 86_400_000).toISOString().slice(0, 10);
}

/** 다른 과정을 모두 숨기고 시험용 과정만 넣는다 */
function onlyThese(courses: { title: string; from: number; until: number }[]) {
  const conn = db();
  conn.prepare(`DELETE FROM edu_courses WHERE title LIKE ?`).run(`${MARK}%`);
  conn.prepare("UPDATE edu_courses SET is_visible = 0").run();
  const insert = conn.prepare(
    `INSERT INTO edu_courses (title, summary, href, apply_from, apply_until, starts_on, ends_on, created_at, updated_at)
     VALUES (?, '집체 · 3일', 'https://example.com/course', ?, ?, ?, ?, ?, ?)`,
  );
  for (const c of courses) {
    insert.run(c.title, kstDay(c.from), kstDay(c.until), kstDay(c.until + 3), kstDay(c.until + 5), now(), now());
  }
  conn.close();
}

test("마감이 가장 가까운 과정을 크게, 마감된 과정은 빼고 보인다", async ({ page }) => {
  const soon = `${MARK} 마감 임박 과정`;
  const later = `${MARK} 여유 있는 과정`;
  const closed = `${MARK} 마감된 과정`;
  const upcoming = `${MARK} 곧 열릴 과정`;
  onlyThese([
    { title: later, from: -10, until: 20 },
    { title: soon, from: -10, until: 3 },
    { title: closed, from: -30, until: -1 },
    { title: upcoming, from: 5, until: 30 },
  ]);

  await page.goto("/");
  const section = page.locator("section[aria-labelledby=edu-heading]");
  const featured = section.locator("article");

  /* 큰 자리에는 마감이 가장 가까운 과정 */
  await expect(featured).toContainText(soon);
  await expect(featured).toContainText("마감 D-3");

  /* 목록: 접수중을 마감 순서로, 그다음 접수예정. 마감된 과정은 없다 */
  const list = section.locator("button[aria-pressed]");
  await expect(list).toHaveCount(3);
  await expect(list.nth(0)).toContainText(soon);
  await expect(list.nth(1)).toContainText(later);
  await expect(list.nth(2)).toContainText(upcoming);
  await expect(section).not.toContainText(closed);

  /* 목록을 누르면 큰 자리가 그 과정으로 바뀐다 */
  await list.nth(1).click();
  await expect(featured).toContainText(later);
  await expect(featured).toContainText("마감 D-20");
});

test("접수 중인 과정이 없으면 아카데미 일정으로만 이어 준다", async ({ page }) => {
  onlyThese([{ title: `${MARK} 지난 과정`, from: -30, until: -2 }]);
  await page.goto("/");
  const section = page.locator("section[aria-labelledby=edu-heading]");
  await expect(section).toContainText("지금 접수 중인 과정이 없습니다.");
  await expect(section.getByRole("link", { name: /아카데미 교육 일정 보기/ })).toBeVisible();
});

test("관리자가 과정을 추가하면 메인에 나온다", async ({ page }) => {
  onlyThese([]);
  const title = `${MARK} 관리자가 넣은 과정 ${Date.now()}`;

  await login(page, ADMIN);
  await page.goto("/admin/education");
  await page.getByRole("button", { name: "과정 추가" }).click();
  const form = page.locator("form").filter({ has: page.locator('input[name="title"]') }).first();
  await form.locator('input[name="title"]').fill(title);
  await form.locator('input[name="summary"]').fill("집체 · 2일 · 16시간");
  await form.locator('input[name="href"]').fill("https://example.com/apply");
  await form.locator('input[name="applyFrom"]').fill(kstDay(-1));
  await form.locator('input[name="applyUntil"]').fill(kstDay(6));
  await form.locator('input[name="startsOn"]').fill(kstDay(10));
  await form.locator('input[name="endsOn"]').fill(kstDay(11));
  await form.getByRole("button", { name: "저장" }).click();
  /* 목록 줄의 작은 자동 포스터에도 과정명이 들어 있어 줄 하나로 찾는다 */
  await expect(page.locator("li").filter({ hasText: title })).toHaveCount(1);

  await page.goto("/");
  await expect(page.locator("section[aria-labelledby=edu-heading] article")).toContainText(title);
});

test("관리자 화면은 날짜 순서가 거꾸로면 저장하지 않는다", async ({ page }) => {
  await login(page, ADMIN);
  await page.goto("/admin/education");
  await page.getByRole("button", { name: "과정 추가" }).click();
  const form = page.locator("form").filter({ has: page.locator('input[name="title"]') }).first();
  await form.locator('input[name="title"]').fill(`${MARK} 날짜 거꾸로`);
  await form.locator('input[name="applyFrom"]').fill(kstDay(5));
  await form.locator('input[name="applyUntil"]').fill(kstDay(1));
  await form.locator('input[name="startsOn"]').fill(kstDay(10));
  await form.locator('input[name="endsOn"]').fill(kstDay(11));
  await form.getByRole("button", { name: "저장" }).click();
  await expect(form.getByRole("alert")).toHaveText("접수 마감일이 접수 시작일보다 빠릅니다.");
});

test("바로가기는 슬라이드 아래 한 줄에 여섯 개", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("navigation", { name: "바로가기" }).getByRole("link")).toHaveCount(6);
  /* KOSA 와 같던 문구는 없다 */
  await expect(page.getByText("자주 찾는 서비스를 안내해드립니다")).toHaveCount(0);
});

test("휴대폰 너비에서 쪽이 옆으로 넘치지 않는다", async ({ page }) => {
  /*
    닫힌 메뉴 서랍과 바닥글 연락처 줄이 화면 밖으로 나가 390px 화면에서 쪽이 473px 이 됐다.
    운영에서도 그랬는데 아무도 몰랐다. 손가락으로 옆으로 밀면 화면 전체가 흔들린다.
  */
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ["/", "/board/notice", "/members/join"]) {
    await page.goto(path);
    await page.waitForTimeout(500);
    const width = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(width, `${path} 쪽 너비`).toBeLessThanOrEqual(390);
  }
});
