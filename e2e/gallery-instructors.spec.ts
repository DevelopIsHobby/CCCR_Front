import { test, expect } from "@playwright/test";
import { ADMIN, MARK, login } from "./fixtures";

/*
  포토갤러리(알림마당)와 강사 모집(참여하기).

  강사 모집은 사업공고와 같은 표·상태를 쓰되 말이 '모집'이고, 제목은 글 화면으로 간다
  (지원서 양식을 첨부하고 지원 방법을 본문에 적는다).
  포토갤러리는 사진 카드로 늘어놓고, 글 화면에서 사진을 눌러 크게 넘겨 본다.
*/

const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

function dayFromToday(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

test.beforeEach(async ({ page }) => {
  await login(page, ADMIN);
});

test("강사 모집 글은 모집중·분야·모집 기간으로 보이고, 제목은 글 화면으로 간다", async ({ page }) => {
  const title = `${MARK} 클라우드 보안 교육 강사 모집 ${Date.now()}`;
  const from = dayFromToday(-2);
  const by = dayFromToday(20);

  await page.goto("/participate/instructors/write");
  /* 사업공고와 달리 주관·전문기관 칸이 없고 본문·첨부를 쓴다 */
  await expect(page.locator("#announce-host")).toHaveCount(0);
  await expect(page.getByText("모집 정보")).toBeVisible();
  await page.locator("#post-title").fill(title);
  await page.locator("#post-category").selectOption("교육");
  await page.locator('[contenteditable="true"]').first().fill("지원서를 사무국 메일로 보내 주세요.");
  await page.locator("#announce-from").fill(from);
  await page.locator("#announce-apply").fill(by);
  await page.getByRole("button", { name: "등록" }).click();
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
  /* 글 화면: 분야와 모집 기간 */
  await expect(page.getByText("모집 기간")).toBeVisible();
  await expect(page.getByText(`${from.replaceAll("-", ".")} ~ ${by.replaceAll("-", ".")}`)).toBeVisible();

  await page.goto("/participate/instructors");
  await expect(page.getByRole("columnheader", { name: "모집 기간" })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "분야" })).toBeVisible();
  const row = page.locator("tr", { hasText: title });
  await expect(row).toContainText("모집중");
  await expect(row).toContainText("교육");
  await expect(row.getByRole("link", { name: new RegExp("클라우드 보안 교육 강사 모집") })).toHaveAttribute(
    "href",
    /^\/participate\/instructors\/\d+$/,
  );

  /* 탭도 '모집' 말로 */
  const tabs = page.getByRole("navigation", { name: "모집 상태" });
  await expect(tabs.getByRole("link", { name: "모집중" })).toBeVisible();

  /* 메인 참여하기: 강사 모집 칸에 모집중 건수가 나온다 */
  await page.goto("/");
  const join = page.locator("section", { has: page.getByRole("heading", { name: "참여하기" }) });
  await expect(join.getByText("조합 교육의 강사가 되어 주세요")).toBeVisible();
  await expect(join.getByText(/모집중 \d+건/)).toBeVisible();
  await expect(join.getByRole("link", { name: /모집 공고 보기|강사 모집 보기/ })).toHaveAttribute(
    "href",
    /^\/participate\/instructors(\/\d+)?$/,
  );
});

test("참여하기·알림마당 차림표에 강사 모집·포토갤러리가 있다", async ({ page }) => {
  await page.goto("/participate");
  await expect(page.getByRole("link", { name: "강사 모집", exact: true }).first()).toHaveAttribute(
    "href",
    "/participate/instructors",
  );
  await page.goto("/board/notice");
  await expect(page.getByRole("link", { name: "포토갤러리", exact: true }).first()).toHaveAttribute(
    "href",
    "/board/gallery",
  );
});

test("포토갤러리: 사진을 여러 장 한 번에 올리고, 글 화면에서 눌러 크게 넘겨 본다", async ({ page }) => {
  const title = `${MARK} 정기총회 현장 ${Date.now()}`;
  await page.goto("/board/gallery/write");
  await page.locator("#post-title").fill(title);
  await page.locator('[contenteditable="true"]').first().click();
  /* 이미지 단추가 여는 칸. 여러 장을 한 번에 고른다 */
  await page.locator('input[type="file"][multiple][accept^="image/"]').setInputFiles([
    { name: "a.png", mimeType: "image/png", buffer: PNG },
    { name: "b.png", mimeType: "image/png", buffer: PNG },
  ]);
  const editor = page.locator('[contenteditable="true"]').first();
  await expect(editor.locator('img[src^="/api/images/"]')).toHaveCount(2);
  await page.getByRole("button", { name: "등록" }).click();
  await expect(page.getByRole("heading", { name: title })).toBeVisible();

  /* 글 화면: 사진을 누르면 크게, 다음으로 넘기고, Esc 로 닫는다 */
  /* 시험 사진은 1×1 이라 누르기 어렵다. 사진은 키보드로도 열린다(Tab·Enter) */
  await page.getByRole("button", { name: "사진 1 크게 보기" }).press("Enter");
  const viewer = page.getByRole("dialog", { name: "사진 크게 보기" });
  await expect(viewer).toBeVisible();
  await expect(viewer).toContainText("1 / 2");
  await viewer.getByRole("button", { name: "다음 사진" }).click();
  await expect(viewer).toContainText("2 / 2");
  await page.keyboard.press("Escape");
  await expect(viewer).toHaveCount(0);

  /* 목록: 첫 사진이 카드로 보인다 */
  await page.goto("/board/gallery");
  const card = page.getByRole("link", { name: new RegExp("정기총회 현장") }).first();
  await expect(card.locator('img[src^="/api/images/"]')).toHaveCount(1);

  /* 메인: 포토갤러리 띠에 최근 사진 글로 보인다 */
  await page.goto("/");
  const band = page.locator("section", { has: page.getByRole("heading", { name: "포토갤러리" }) });
  await expect(band.getByRole("link", { name: "사진 더 보기" })).toHaveAttribute("href", "/board/gallery");
  await expect(band.getByRole("link", { name: new RegExp("정기총회 현장") }).first()).toHaveAttribute(
    "href",
    /^\/board\/gallery\/\d+$/,
  );
});
