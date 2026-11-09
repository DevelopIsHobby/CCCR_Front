import { test, expect } from "@playwright/test";
import { ADMIN, MARK, db, login, now } from "./fixtures";

/*
  2026-11-09 사무국 사용 피드백 묶음.
    뉴스레터 구독 동의 · 새 글 딱지와 조회수 · 원문으로 가는 글의 조회수 · 교육사업 제안 단추 ·
    메인 슬라이드 크기 · 파일 관리에서 '안 쓰는 이미지 지우기' 뺌 · 휴지통 비우기
*/

function insertPost(board: string, title: string, extra: { link?: string; views?: number; deleted?: boolean } = {}) {
  const conn = db();
  const { lastInsertRowid } = conn
    .prepare(
      `INSERT INTO posts (board, title, body, author_name, is_pinned, is_locked, views, created_at, updated_at,
                          link_url, deleted_at)
       VALUES (?, ?, '<p>본문</p>', ?, 0, 0, ?, ?, ?, ?, ?)`,
    )
    .run(board, title, ADMIN.name, extra.views ?? 0, now(), now(), extra.link ?? null, extra.deleted ? now() : "");
  conn.close();
  return Number(lastInsertRowid);
}

function viewsOf(id: number): number {
  const conn = db();
  const row = conn.prepare("SELECT views FROM posts WHERE id = ?").get(id) as { views: number };
  conn.close();
  return Number(row.views);
}

test("뉴스레터: 개인정보 동의에 체크하면 구독 신청이 된다", async ({ page }) => {
  await page.goto("/info/newsletter");
  /* 화면 아래 공통 띠에도 같은 폼이 있으므로 뉴스레터 화면의 신청 칸으로 좁힌다 */
  const form = page.locator("section", { hasText: "조합 소식을 메일로 받아보세요" }).locator("form");
  await form.getByPlaceholder("email@example.com").fill(`e2e-news-${Date.now()}@example.com`);
  /* 동의 칸이 같은 폼 안에 있어야 서버로 간다 */
  await form.getByRole("checkbox", { name: /개인정보 수집·이용에 동의합니다/ }).check();
  await form.getByRole("button", { name: "구독 신청" }).click();
  await expect(form.getByText("동의해 주셔야")).toHaveCount(0);
  await expect(form.getByText("구독 신청이 접수되었습니다.")).toBeVisible();
  await expect(form.getByRole("alert")).toHaveCount(0);
});

test("새 글에는 NEW 딱지, 목록마다 조회수가 보이고 원문으로 가는 글도 누르면 센다", async ({ page, context }) => {
  /* 바깥 원문은 열지 않는다 */
  await context.route("https://example.com/**", (route) => route.fulfill({ body: "ok" }));
  const stamp = Date.now();
  const news = insertPost("news", `${MARK} 조회수 기사 ${stamp}`, { link: "https://example.com/news", views: 7 });
  insertPost("events", `${MARK} 새 행사 ${stamp}`, { views: 3 });

  await page.goto("/info/news");
  const item = page.locator("li", { hasText: `조회수 기사 ${stamp}` });
  await expect(item.getByText("NEW", { exact: true })).toBeVisible();
  await expect(item.getByText("조회 7")).toBeVisible();
  const popup = page.waitForEvent("popup");
  await item.getByRole("link", { name: new RegExp(`조회수 기사 ${stamp}`) }).click();
  await (await popup).close();
  await expect.poll(() => viewsOf(news)).toBe(8);

  await page.goto("/board/events");
  const card = page.getByRole("link", { name: new RegExp(`새 행사 ${stamp}`) });
  await expect(card.getByText("NEW", { exact: true })).toBeVisible();
  await expect(card.getByText("조회 3")).toBeVisible();

  /* 사업공고 표에는 조회 칸이 있다 */
  insertPost("announce", `${MARK} 조회 칸 공고 ${stamp}`, { link: "https://example.com/notice" });
  await page.goto("/board/announce");
  await expect(page.getByRole("columnheader", { name: "조회" })).toBeVisible();
});

test("교육사업 제안 단추는 남색 판 위에서 주황으로 보인다", async ({ page }) => {
  await page.goto("/participate/proposal");
  const button = page.getByRole("button", { name: "교육사업 제안하기" });
  await expect(button).toBeVisible();
  await expect(button).toHaveClass(/bg-flame-500/);
});

test("메인 슬라이드는 넘겨도 크기가 그대로다", async ({ page }) => {
  await page.setViewportSize({ width: 1340, height: 900 });
  await page.goto("/");
  /*
    다른 시험이 넣은 공지 팝업이 떠 있으면 뒤 화면이 막혀(모달) 단추를 역할로 찾지 못한다.
    팝업과 상관없이 보려고 화면 안에서 직접 눌러 가며 슬라이드 칸 높이를 잰다.
  */
  const heights = await page.evaluate(async () => {
    const dots = [...document.querySelectorAll<HTMLButtonElement>('button[aria-label$="번 슬라이드로 이동"]')];
    const box = dots[0]?.closest(".rounded-2xl");
    const out: number[] = [];
    for (const dot of dots) {
      dot.click();
      await new Promise((r) => setTimeout(r, 600));
      out.push(Math.round(box!.getBoundingClientRect().height));
    }
    return out;
  });
  expect(heights.length).toBeGreaterThan(1);
  expect(new Set(heights).size).toBe(1);
});

test("관리자: 파일 관리에 '안 쓰는 이미지 지우기'가 없고, 휴지통은 한 번에 비운다", async ({ page }) => {
  await login(page, ADMIN);
  await page.goto("/admin/files");
  await expect(page.getByRole("button", { name: /안 쓰는 이미지/ })).toHaveCount(0);

  const gone = insertPost("notice", `${MARK} 휴지통 글 ${Date.now()}`, { deleted: true });
  await page.goto("/admin/trash");
  page.once("dialog", (d) => void d.accept());
  await page.getByRole("button", { name: "휴지통 비우기" }).click();
  await expect(page.getByText("휴지통이 비어 있습니다.")).toBeVisible();
  const conn = db();
  const left = conn.prepare("SELECT COUNT(*) AS n FROM posts WHERE id = ?").get(gone) as { n: number };
  conn.close();
  expect(Number(left.n)).toBe(0);
});
