import { test, expect } from "@playwright/test";
import { ADMIN, MARK, login } from "./fixtures";

/*
  첨부파일 여러 개 올리기.

  브라우저 기본 파일칸은 다시 고르면 앞에 고른 것을 지우고 바꾼다. 하나 고르고 또 하나를
  고르면 마지막 하나만 남아 '하나밖에 못 올린다'는 말을 들었다(AttachmentPicker.tsx).
  setInputFiles 를 두 번 부르면 사람이 파일 선택 창을 두 번 연 것과 같다.
*/

const file = (name: string, text: string) => ({
  name,
  mimeType: "text/plain",
  buffer: Buffer.from(text),
});

test.beforeEach(async ({ page }) => {
  await login(page, ADMIN);
});

async function startPost(page: import("@playwright/test").Page, title: string) {
  await page.goto("/board/notice/write");
  await page.locator("#post-title").fill(title);
  await page.locator('[contenteditable="true"]').first().fill("첨부파일 시험 본문");
}

test("파일을 두 번 따로 골라도 둘 다 올라간다", async ({ page }) => {
  const title = `${MARK} 첨부 둘 ${Date.now()}`;
  await startPost(page, title);

  const picker = page.locator("#post-files");
  await picker.setInputFiles(file("첫째.txt", "one"));
  await picker.setInputFiles(file("둘째.txt", "two"));

  /* 고른 것이 쌓여 보인다 */
  await expect(page.getByText("2개 · 합계")).toBeVisible();

  await page.getByRole("button", { name: "등록" }).click();
  await expect(page.getByRole("heading", { name: title })).toBeVisible();

  const attached = page.locator('section[aria-label="첨부파일"]');
  await expect(attached).toContainText("첨부파일2");
  await expect(attached).toContainText("첫째.txt");
  await expect(attached).toContainText("둘째.txt");
});

test("고른 파일을 빼면 그 파일은 올라가지 않는다", async ({ page }) => {
  const title = `${MARK} 첨부 빼기 ${Date.now()}`;
  await startPost(page, title);

  const picker = page.locator("#post-files");
  await picker.setInputFiles([file("남길것.txt", "keep"), file("뺄것.txt", "drop")]);
  await page.getByRole("button", { name: "뺄것.txt 빼기" }).click();
  await expect(page.getByText("1개 · 합계")).toBeVisible();

  await page.getByRole("button", { name: "등록" }).click();
  await expect(page.getByRole("heading", { name: title })).toBeVisible();

  const attached = page.locator('section[aria-label="첨부파일"]');
  await expect(attached).toContainText("남길것.txt");
  await expect(attached).not.toContainText("뺄것.txt");
});

test("같은 파일을 두 번 고르면 한 번만 올린다", async ({ page }) => {
  await startPost(page, `${MARK} 첨부 중복 ${Date.now()}`);

  const picker = page.locator("#post-files");
  const same = file("같은파일.txt", "same");
  await picker.setInputFiles(same);
  await picker.setInputFiles(same);

  await expect(page.getByText("1개 · 합계")).toBeVisible();
});
