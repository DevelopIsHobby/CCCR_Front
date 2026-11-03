import { test, expect } from "@playwright/test";
import { ADMIN, MARK, db, now } from "./fixtures";

/* 로그인하지 않은 손님이 보는 화면 */

test("메인 조합 소식은 탭으로 게시판을 고르고, 알림판은 없다", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "조합 소식" })).toBeVisible();
  /* 홍보 칸이 너무 많아 '지금 모집 중' 알림판은 뺐다 */
  await expect(page.getByRole("heading", { name: "지금 모집 중" })).toHaveCount(0);

  /* 탭을 고르면 그 게시판 글만 남고, + 단추도 그 게시판으로 간다 */
  await page.getByRole("button", { name: "산업뉴스", exact: true }).click();
  await expect(page.getByRole("button", { name: "산업뉴스", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByRole("link", { name: /원문 링크가 붙은 산업뉴스/ })).toBeVisible();
  await expect(page.getByRole("link", { name: "산업뉴스 전체 보기" })).toHaveAttribute(
    "href",
    "/info/news",
  );

  await page.getByRole("button", { name: "공지사항", exact: true }).click();
  await expect(page.getByRole("link", { name: /원문 링크가 붙은 산업뉴스/ })).toHaveCount(0);
  await expect(page.getByRole("contentinfo")).toContainText("한국클라우드컴퓨팅연구조합");
});

test("산업뉴스 목록의 제목은 원문 기사로 새 창에서 열린다", async ({ page }) => {
  await page.goto("/info/news");

  const link = page.getByRole("link", { name: /원문 링크가 붙은 산업뉴스/ });
  await expect(link).toHaveAttribute("href", "https://example.com/article");
  await expect(link).toHaveAttribute("target", "_blank");
  /* 출처는 링크 표시 이름으로 나온다 */
  await expect(page.getByText("확인용신문")).toBeVisible();
  /* 일반 게시판 표가 아니므로 번호·글쓴이·조회 칸이 없다 */
  await expect(page.getByRole("columnheader", { name: "글쓴이" })).toHaveCount(0);
});

test("공지사항 목록에서 글을 열어 본문을 본다", async ({ page }) => {
  await page.goto("/board/notice");
  await page.getByRole("link", { name: /확인용 공지사항/ }).click();
  await expect(page.getByText("확인용 공지 본문입니다.")).toBeVisible();
});

test("통합검색으로 글을 찾는다", async ({ page }) => {
  await page.goto("/search?q=확인용");
  await expect(page.getByRole("link", { name: /확인용 공지사항/ })).toBeVisible();
});

test("없는 글 주소는 안내 화면을 보여 주고 검색 엔진에 담기지 않는다", async ({ page }) => {
  await page.goto("/board/notice/99999999");
  await expect(page.getByText("요청하신 페이지를 찾을 수 없습니다")).toBeVisible();
  /*
    기다리는 뼈대(loading.tsx)가 화면 껍데기를 먼저 내보내므로 404 코드는 보낼 수 없다.
    대신 검색 엔진이 담아 가지 않도록 noindex 를 붙인다.
  */
  await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute("content", /noindex/);
  await expect(page).toHaveTitle(/찾을 수 없는 글/);
});

/*
  글 번호.

  번호는 표 방식 게시판 목록에서만 보여 준다. 그 값을 매기는 쿼리가 무거워
  번호를 쓰지 않는 자리(글 상세·홈 새소식)에서는 매기지 않도록 바꿨다.
  잘못 건드리면 번호가 0 이나 NaN 으로 조용히 바뀌므로 여기서 지켜본다.
*/
test("공지사항 목록에 글 번호가 매겨져 보인다", async ({ page }) => {
  await page.goto("/board/notice");

  const table = page.locator("table");
  await expect(table).toBeVisible();

  /* 번호 칸에 숫자가 있어야 한다. 0·NaN·빈칸이면 안 된다 */
  const first = table.locator("tbody tr").first().locator("td").first();
  const text = ((await first.innerText()) || "").trim();
  expect(text).toMatch(/^[1-9][0-9]*$|^공지$/);
});

test("휴대폰 메뉴는 큰 메뉴를 눌러야 소메뉴가 펼쳐진다", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "전체 메뉴 열기" }).click();

  const menu = page.getByRole("navigation", { name: "모바일 메뉴" });
  const about = menu.getByRole("button", { name: "조합소개" });
  const members = menu.getByRole("button", { name: "회원사안내" });

  /*
    소메뉴 칸의 높이로 펼침을 본다. 접힌 칸은 높이 0으로 잘라 숨기는데,
    Playwright 는 잘린 링크도 '보임'으로 친다.
  */
  const heightOf = async (button: typeof about) => {
    const id = await button.getAttribute("aria-controls");
    return (await page.locator(`#${id}`).boundingBox())?.height ?? 0;
  };

  /* 처음에는 모두 접혀 있다(메인은 어느 묶음에도 속하지 않는다) */
  await expect(about).toHaveAttribute("aria-expanded", "false");
  await expect.poll(() => heightOf(about)).toBeLessThan(1);

  await about.click();
  await expect(about).toHaveAttribute("aria-expanded", "true");
  await expect.poll(() => heightOf(about)).toBeGreaterThan(40);

  /* 다른 묶음을 열면 앞의 것은 닫힌다 */
  await members.click();
  await expect(about).toHaveAttribute("aria-expanded", "false");
  await expect.poll(() => heightOf(about)).toBeLessThan(1);
  await expect.poll(() => heightOf(members)).toBeGreaterThan(40);

  /* 소메뉴를 누르면 그 페이지로 가고, 다시 메뉴를 열면 그 묶음이 펼쳐져 있다 */
  await menu.getByRole("link", { name: "회원사 현황" }).click();
  await expect(page).not.toHaveURL(/\/$/);
  await page.getByRole("button", { name: "전체 메뉴 열기" }).click();
  await expect(members).toHaveAttribute("aria-expanded", "true");
  await expect(menu.getByRole("link", { name: "회원사 현황" })).toHaveAttribute(
    "aria-current",
    "page",
  );
});

test("고정 글은 첫 쪽에만 올라온다", async ({ page }) => {
  /*
    고정 글을 쪽마다 올리면, 고정 글이 많을 때 2쪽부터도 고정 글만 길게 깔린다.
    기술동향 게시판에 고정 글 17건을 넣어 2쪽을 만든다(한 쪽 15건).
  */
  const conn = db();
  const insert = conn.prepare(
    `INSERT INTO posts (board, title, body, author_name, is_pinned, is_locked, views,
                        created_at, updated_at)
     VALUES ('trends', ?, '<p>고정 글</p>', ?, 1, 0, 0, ?, ?)`,
  );
  for (let i = 1; i <= 17; i++) insert.run(`${MARK} 고정 동향 ${i}`, ADMIN.name, now(), now());
  conn.close();

  await page.goto("/info/trends");
  const pinnedRows = (p: typeof page) =>
    p.locator("table tbody tr").filter({ has: p.getByText("공지", { exact: true }) });
  await expect(pinnedRows(page)).toHaveCount(17);

  await page.goto("/info/trends?page=2");
  await expect(page.locator("table tbody tr").first()).toBeVisible();
  await expect(pinnedRows(page)).toHaveCount(0);
});

test("메인 '다가오는 일정'에 앞으로 열릴 행사와 마감 전 공고가 날짜 순으로 나온다", async ({ page }) => {
  /*
    홍보 알림판 대신 둔 칸. 행사정보의 행사일·사업공고의 마감일에서 저절로 채워진다.
    아주 먼 날짜로 넣어도 다른 일정보다 뒤로 밀려 3건 밖으로 나갈 수 있으므로, 가까운 날로 넣는다.
  */
  const day = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
  };
  const stamp = Date.now();
  const conn = db();
  conn
    .prepare(
      `INSERT INTO posts (board, title, body, author_name, is_pinned, is_locked, views,
                          created_at, updated_at, event_starts_on)
       VALUES ('events', ?, '<p>행사</p>', ?, 0, 0, 0, ?, ?, ?)`,
    )
    .run(`${MARK} 다가오는 세미나 ${stamp}`, ADMIN.name, now(), now(), day(1));
  conn
    .prepare(
      `INSERT INTO posts (board, title, body, author_name, is_pinned, is_locked, views,
                          created_at, updated_at, link_url, event_apply_by)
       VALUES ('announce', ?, '', ?, 0, 0, 0, ?, ?, 'https://example.com/n', ?)`,
    )
    .run(`${MARK} 곧 마감 공고 ${stamp}`, ADMIN.name, now(), now(), day(1));
  /* 지난 행사는 나오지 않는다 */
  conn
    .prepare(
      `INSERT INTO posts (board, title, body, author_name, is_pinned, is_locked, views,
                          created_at, updated_at, event_starts_on)
       VALUES ('events', ?, '<p>행사</p>', ?, 0, 0, 0, ?, ?, ?)`,
    )
    .run(`${MARK} 지난 세미나 ${stamp}`, ADMIN.name, now(), now(), day(-3));
  conn.close();

  /*
    칸은 3건뿐이라, 다른 시험이 먼저 넣은 가까운 일정에 밀려 위 두 건이 안 보일 수 있다.
    어떤 일정이 뽑히는지(날짜 순·교육 포함)는 단위 시험(tests/upcoming.test.ts)이 본다.
    여기서는 칸에 일정이 걸리고, 지난 행사는 빠지는 것만 본다.
  */
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "다가오는 일정" })).toBeVisible();
  const card = page.getByRole("list", { name: "다가오는 일정" });
  await expect(card.getByRole("link").first()).toBeVisible();
  await expect(card.getByRole("link", { name: new RegExp(`지난 세미나 ${stamp}`) })).toHaveCount(0);
});
