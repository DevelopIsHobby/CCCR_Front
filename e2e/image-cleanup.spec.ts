import { randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test, expect } from "@playwright/test";
import { ADMIN, MARK, db, login, now } from "./fixtures";

/*
  파일 관리의 '안 쓰는 이미지 지우기'.

  교육 과정 포스터를 쓰는 곳으로 치지 않아, 정리 한 번에 메인 아카데미 포스터가 모두 사라진 일이
  있었다(2026-11-06). 먼저 받아 둔 브라우저에는 그림이 남아 있어 한동안 알아채지 못했다.
  포스터는 남고 정말 안 쓰는 그림만 지워지는지 본다. 숨긴 과정의 포스터도 지우면 안 된다.
*/

const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

function addImage(filename: string): number {
  const stored = `${randomUUID()}.png`;
  mkdirSync(".e2e/uploads", { recursive: true });
  writeFileSync(join(".e2e/uploads", stored), PNG);
  const conn = db();
  const { lastInsertRowid } = conn
    .prepare(
      `INSERT INTO images (filename, stored_name, byte_size, mime_type, created_at)
       VALUES (?, ?, ?, 'image/png', ?)`,
    )
    .run(filename, stored, PNG.length, now());
  conn.close();
  return Number(lastInsertRowid);
}

test("안 쓰는 이미지를 지워도 교육 과정 포스터는 남는다", async ({ page, request }) => {
  const title = `${MARK} 포스터 과정 ${Date.now()}`;
  const poster = addImage("poster.png");
  const unused = addImage("unused.png");
  const conn = db();
  conn
    .prepare(
      `INSERT INTO edu_courses (title, summary, href, poster_url, apply_from, apply_until, starts_on, ends_on,
                                is_visible, created_at, updated_at)
       VALUES (?, '집체', 'https://example.com/course', ?, '2030-01-01', '2030-01-02', '2030-01-03', '2030-01-04',
               0, ?, ?)`,
    )
    .run(title, `/api/images/${poster}`, now(), now());
  conn.close();

  await login(page, ADMIN);
  await page.goto("/admin/files");
  /* 어디에 쓰이는지 파일 관리에 보인다 */
  await expect(page.getByText(`교육 과정 포스터 · ${title}`)).toBeVisible();

  page.once("dialog", (d) => void d.accept());
  await page.getByRole("button", { name: /안 쓰는 이미지 \d+개 지우기/ }).click();
  await expect(page.getByText(/이미지 \d+건을 지웠습니다/)).toBeVisible();

  expect((await request.get(`/api/images/${poster}`)).status()).toBe(200);
  expect((await request.get(`/api/images/${unused}`)).status()).toBe(404);
});
