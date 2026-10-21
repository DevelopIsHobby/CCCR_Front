import { test, expect } from "@playwright/test";
import { ADMIN, MARK, login } from "./fixtures";

/*
  메인 히어로 슬라이드의 홍보 그림.

  행사 포스터처럼 글자가 든 그림을 통째로 걸고 싶다는 요청으로 생겼다.
  그림을 건 슬라이드는 그림만 보이고 제목은 그림 설명이 된다.
  같은 그림 저장소를 쓰므로 '안 쓰는 그림' 정리에서 지워지지 않아야 한다.
*/

/* 1×1 PNG */
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

test("메인 슬라이드에 홍보 그림을 걸면 메인에 그림이 나오고, 그림은 '쓰는 그림'으로 남는다", async ({
  page,
}) => {
  const title = `${MARK} 세미나 포스터 ${Date.now()}`;
  await login(page, ADMIN);
  await page.goto("/admin/home");

  const slides = page.locator("section").filter({ hasText: "히어로 슬라이드" });
  await slides.getByRole("button", { name: "+ 카드 추가" }).click();
  const form = slides.locator("form").filter({ has: page.locator('input[name="imageUrl"]') });
  await form.locator('textarea[name="title"]').fill(title);
  await form.locator('input[name="href"]').fill("/board/events");
  await form.locator('input[type="file"]').setInputFiles({
    name: "poster.png",
    mimeType: "image/png",
    buffer: PNG,
  });
  /* 올라가면 숨은 칸에 우리 그림 주소가 들어간다 */
  await expect(form.locator('input[name="imageUrl"]')).toHaveValue(/^\/api\/images\/\d+$/);
  const src = await form.locator('input[name="imageUrl"]').inputValue();
  await form.getByRole("button", { name: "추가" }).click();

  /* 목록에 작은 그림과 함께 보인다 */
  await expect(slides.getByText(title)).toBeVisible();
  await expect(slides.locator(`img[src="${src}"]`)).toBeVisible();

  /* 메인: 새 슬라이드로 넘기면 그림이 제목을 설명으로 달고 나오고, 누르면 링크로 간다 */
  await page.goto("/");
  const dots = page.getByRole("button", { name: /번 슬라이드로 이동/ });
  await dots.last().click();
  const image = page.getByRole("img", { name: title });
  await expect(image).toBeVisible();
  await expect(image).toHaveAttribute("src", src);
  await expect(page.locator(`a[href="/board/events"]`).filter({ has: image })).toHaveCount(1);

  /* 파일 관리에서 '메인 슬라이드' 에 쓰는 그림으로 보인다(안 쓰는 그림으로 지워지면 안 된다) */
  await page.goto("/admin/files");
  await expect(page.getByText(`메인 슬라이드 · ${title}`)).toBeVisible();
});
