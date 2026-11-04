import { test, expect } from "@playwright/test";
import { ADMIN, MARK, login } from "./fixtures";

/*
  포토갤러리(알림마당)와 메인 참여하기의 강사 모집 팝업.

  포토갤러리는 사진 카드로 늘어놓고, 글 화면에서 사진을 눌러 크게 넘겨 본다.
  강사 모집은 게시판 없이 상시 모집 안내만 — 메인 팝업과 참여하기 → 강사 모집 화면.
*/

const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

test.beforeEach(async ({ page }) => {
  await login(page, ADMIN);
});

test("메인 참여하기: 강사 모집 단추를 누르면 상시 모집과 이력서 보낼 메일을 팝업으로 알린다", async ({ page }) => {
  await page.goto("/");
  const join = page.locator("section", { has: page.getByRole("heading", { name: "참여하기" }) });
  /* 팝업도 같은 제목을 쓰므로 첫째(카드)만 본다 */
  await expect(join.getByText("조합 교육의 강사가 되어 주세요").first()).toBeVisible();
  await expect(join.getByText("상시 모집").first()).toBeVisible();
  await join.getByRole("button", { name: "지원 안내" }).click();
  const popup = page.getByRole("dialog", { name: "강사 모집" });
  await expect(popup).toBeVisible();
  await expect(popup).toContainText("상시 모집");
  await expect(popup).toContainText("mskim@cccr.or.kr");
  await expect(popup.getByRole("link", { name: "메일 보내기" })).toHaveAttribute(
    "href",
    /^mailto:mskim@cccr\.or\.kr/,
  );
  await page.keyboard.press("Escape");
  await expect(popup).toBeHidden();
});

test("참여하기 → 강사 모집 화면에 같은 안내가 있고, 알림마당 차림표에 포토갤러리가 있다", async ({ page }) => {
  await page.goto("/participate");
  await expect(page.getByRole("link", { name: "강사 모집", exact: true }).first()).toHaveAttribute(
    "href",
    "/participate/instructors",
  );
  await page.goto("/participate/instructors");
  const main = page.locator("main");
  await expect(main.getByText("상시 모집").first()).toBeVisible();
  await expect(main.getByRole("link", { name: "메일 보내기" })).toHaveAttribute("href", /^mailto:mskim@cccr\.or\.kr/);
  /* 옛 게시판 글 주소는 없다 */
  const old = await page.goto("/participate/instructors/1");
  expect(old?.status()).toBe(404);

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
  /* 편집기·첨부 없이 사진 칸만 있다 */
  await expect(page.locator('[contenteditable="true"]')).toHaveCount(0);
  await expect(page.locator("#post-files")).toHaveCount(0);
  /* 사진 칸. 여러 장을 한 번에 고른다 */
  await page.locator("#post-photos").setInputFiles([
    { name: "a.png", mimeType: "image/png", buffer: PNG },
    { name: "b.png", mimeType: "image/png", buffer: PNG },
  ]);
  await expect(page.getByRole("button", { name: /^사진 \d 빼기$/ })).toHaveCount(2);
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
});
