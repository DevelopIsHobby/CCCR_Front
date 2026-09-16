import { test as setup, expect } from "@playwright/test";
import { ADMIN, MARK, MEMBER, db, hashPassword, now } from "./fixtures";

/*
  확인용 자료를 넣는다.

  표를 만드는 일(마이그레이션)은 서버가 첫 요청을 받을 때 하므로,
  화면을 한 번 열어 그것이 끝나기를 기다린 뒤에 자료를 넣는다.
*/
setup("확인용 계정과 글을 넣는다", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("banner")).toBeVisible();

  const conn = db();

  /* 지난번에 넣은 확인용 자료를 지운다. 매번 같은 상태에서 시작하기 위해서다. */
  conn.prepare("DELETE FROM users WHERE email LIKE 'e2e-%'").run();
  conn.prepare("DELETE FROM posts WHERE title LIKE ?").run(`${MARK}%`);

  const insertUser = conn.prepare(
    `INSERT INTO users (email, password_hash, name, company, role, status, created_at)
     VALUES (?, ?, ?, ?, ?, 'active', ?)`,
  );
  insertUser.run(ADMIN.email, hashPassword(ADMIN.password), ADMIN.name, "연구조합", "admin", now());
  insertUser.run(MEMBER.email, hashPassword(MEMBER.password), MEMBER.name, "확인용회사", "member", now());

  /* 승인 대기 계정 — 승인 전에는 로그인할 수 없어야 한다 */
  conn
    .prepare(
      `INSERT INTO users (email, password_hash, name, role, status, created_at)
       VALUES (?, ?, ?, 'member', 'pending', ?)`,
    )
    .run("e2e-pending@example.test", hashPassword(MEMBER.password), "대기회원", now());

  /* 산업뉴스 글 하나 — 제목이 원문 기사로 이어지는지 확인하는 데 쓴다 */
  conn
    .prepare(
      `INSERT INTO posts (board, title, body, author_name, is_pinned, is_locked, views,
                          created_at, updated_at, link_url, link_label)
       VALUES ('news', ?, '', ?, 0, 0, 0, ?, ?, 'https://example.com/article', '확인용신문')`,
    )
    .run(`${MARK} 원문 링크가 붙은 산업뉴스`, ADMIN.name, now(), now());

  /* 공지사항 글 하나 — 목록·검색에서 찾는 데 쓴다 */
  conn
    .prepare(
      `INSERT INTO posts (board, title, body, author_name, is_pinned, is_locked, views,
                          created_at, updated_at)
       VALUES ('notice', ?, '<p>확인용 공지 본문입니다.</p>', ?, 0, 0, 0, ?, ?)`,
    )
    .run(`${MARK} 확인용 공지사항`, ADMIN.name, now(), now());

  conn.close();
});
