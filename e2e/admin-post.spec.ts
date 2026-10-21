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

/* 1×1 PNG. 붙여 넣은 HTML 의 그림 대신 쓴다(시험 환경에서는 바깥 사이트를 열지 않는다) */
const PIXEL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

test("붙여 넣은 HTML 의 그림은 우리 서버로 옮기고, 그림만 담은 표는 푼다", async ({ page }) => {
  const title = `${MARK} 소식지 붙여넣기 ${Date.now()}`;
  await page.goto("/board/notice/write");
  await page.locator("#post-title").fill(title);

  /* 메일 소식지처럼 그림 조각을 테두리 없는 표에 한 칸씩 넣은 HTML */
  await page.getByRole("button", { name: "HTML", exact: true }).click();
  await page.locator("textarea").fill(
    `<p>사전등록 안내</p><table border="0"><tbody>` +
      `<tr><td><img src="${PIXEL}" alt="조각1"></td></tr>` +
      `<tr><td><a href="mailto:rnd@example.com"><img src="${PIXEL}" alt="조각2"></a></td></tr>` +
      `</tbody></table>`,
  );
  await page.getByRole("button", { name: "HTML", exact: true }).click();

  const editor = page.locator('[contenteditable="true"]').first();
  /* 그림만 담은 표는 풀려 그림만 남는다 */
  await expect(editor.locator("table")).toHaveCount(0);
  /* 그림 주소가 우리 서버 주소로 바뀐다(같은 그림이라 한 번만 올라간다) */
  await expect(editor.locator("img")).toHaveCount(2);
  await expect(editor.locator('img[src^="data:"]')).toHaveCount(0);
  await expect(editor.locator('img[src^="/api/images/"]')).toHaveCount(2);
  await expect(page.getByText("우리 서버로 옮기는 중")).toHaveCount(0);

  await page.getByRole("button", { name: "등록" }).click();
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
  /* 저장된 글에서도 그림이 빠지지 않는다 */
  const images = page.locator('article img.rich-image[src^="/api/images/"]');
  await expect(images).toHaveCount(2);
  /* 조각 그림은 틈 없이 붙는다(한 장을 잘라 놓은 것이다). 다 받은 뒤에 잰다 */
  for (const i of [0, 1]) {
    await expect
      .poll(() => images.nth(i).evaluate((e) => (e as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(0);
  }
  /* 두 그림을 한 번에 잰다. 따로 재면 그사이 화면이 밀려 값이 어긋난다 */
  const gap = await page.evaluate(() => {
    const [a, b] = [...document.querySelectorAll("article img.rich-image")].map((e) =>
      e.getBoundingClientRect(),
    );
    return Math.round(b.top - a.bottom);
  });
  expect(gap).toBe(0);
});

test("표 칸에 배경색을 칠할 수 있다", async ({ page }) => {
  const title = `${MARK} 표 칸 색 ${Date.now()}`;
  await page.goto("/board/notice/write");
  await page.locator("#post-title").fill(title);

  const editor = page.locator('[contenteditable="true"]').first();
  await editor.click();
  await page.getByRole("button", { name: "표", exact: true }).click();
  /* 첫 칸(머리 칸)에 글을 넣고 색을 칠한다 */
  await editor.locator("th").first().click();
  await page.keyboard.type("구분");
  await page.getByRole("button", { name: /칸 색/ }).click();
  await page.getByTitle("#DBEAFE").click();
  await expect(editor.locator("th").first()).toHaveAttribute("style", /background-color/);

  await page.getByRole("button", { name: "등록" }).click();
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
  /* 저장된 글에도 칸 색이 남는다(본문 정리에서 빠지지 않는다) */
  await expect(page.locator("article th").first()).toHaveCSS(
    "background-color",
    "rgb(219, 234, 254)",
  );
});
