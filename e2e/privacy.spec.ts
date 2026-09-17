import { test, expect } from "@playwright/test";
import { ADMIN, db, login } from "./fixtures";

/* 개인정보 처리방침과 실제 동작이 맞는지 */

test("개인정보 처리방침에 보호책임자 부서와 구제 기관이 나온다", async ({ page }) => {
  await page.goto("/privacy");
  /* 본문 조항만 본다. 같은 문구가 푸터 팝업(숨김)에도 들어 있다 */
  await expect(page.locator("#article-10").getByText("담당 부서 : 사무국")).toBeVisible();
  await expect(page.locator("#article-12").getByText(/개인정보분쟁조정위원회/)).toBeVisible();
  /* 옛 문안의 이름이 남아 있으면 안 된다 */
  await expect(page.getByText("개인정보취급방침")).toHaveCount(0);
});

test("이용약관에 제휴사 정보 공유·주민등록번호 조항이 없다", async ({ page }) => {
  await page.goto("/terms");
  await expect(page.getByRole("heading", { name: "제1조 (목적)" })).toBeVisible();
  await expect(page.getByText(/주민등록번호/)).toHaveCount(0);
  await expect(page.getByText(/제휴사/)).toHaveCount(0);
});

test("회원가입 화면에 수집 항목·목적·보유 기간·거부권 안내가 보인다", async ({ page }) => {
  await page.goto("/signup");
  await expect(page.getByText(/보유 기간 : 회원 탈퇴 시까지/)).toBeVisible();
  await expect(page.getByText("동의를 거부하실 수 있으나, 그 경우 회원가입을 할 수 없습니다.")).toBeVisible();
});

test("관리자가 화면을 열면 접속 기록에 남고, 월간 점검을 표시할 수 있다", async ({ page }) => {
  await login(page, ADMIN);
  await page.goto("/admin/members");
  await expect(page.getByRole("link", { name: "대시보드" }).first()).toBeVisible();

  await page.goto("/admin/access-log");
  /* 조금 전 회원 관리 화면을 연 기록 */
  await expect(page.getByRole("cell", { name: "/admin/members" }).first()).toBeVisible();

  const note = `확인용 점검 ${Date.now()}`;
  await page.locator("#inspection-note").fill(note);
  await page.getByRole("button", { name: "점검 완료" }).click();
  await expect(page.getByText(note).first()).toBeVisible();
});

test("명단을 내려받으면 접속 기록에 남는다", async ({ page }) => {
  await login(page, ADMIN);
  /*
    브라우저 안에서 받는다. 로그인 쿠키는 운영 설정(secure)이라, 테스트 도구의 따로 쓰는
    요청(page.request)은 http 확인용 서버에 이 쿠키를 보내지 않는다.
  */
  await page.goto("/admin/newsletter");
  const status = await page.evaluate(async () => (await fetch("/admin/newsletter/export")).status);
  expect(status).toBe(200);

  await page.goto("/admin/access-log?action=내려받기");
  await expect(page.getByRole("cell", { name: /뉴스레터 구독자 명단/ }).first()).toBeVisible();
});

test("오래된 승인 대기·이용 제한 계정은 자동 파기되고, 관리자와 최근 계정은 남는다", async ({ request }) => {
  const old = (days: number) =>
    new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 19).replace("T", " ");

  const conn = db();
  const insert = conn.prepare(
    `INSERT INTO users (email, password_hash, name, role, status, created_at, status_changed_at)
     VALUES (?, 'x', ?, ?, ?, ?, ?)`,
  );
  conn.prepare("DELETE FROM users WHERE email LIKE 'e2e-retention-%'").run();
  insert.run("e2e-retention-pending-old@example.test", "대기7개월", "member", "pending", old(210), "");
  insert.run("e2e-retention-pending-new@example.test", "대기1개월", "member", "pending", old(30), "");
  insert.run("e2e-retention-blocked-old@example.test", "제한13개월", "member", "blocked", old(800), old(400));
  insert.run("e2e-retention-blocked-new@example.test", "제한2개월", "member", "blocked", old(800), old(60));
  insert.run("e2e-retention-admin@example.test", "오래된관리자", "admin", "pending", old(900), "");
  conn.close();

  const res = await request.get("/api/cleanup", {
    headers: { Authorization: "Bearer e2e-cleanup-secret" },
  });
  expect(res.status()).toBe(200);

  const check = db();
  const left = check
    .prepare("SELECT email FROM users WHERE email LIKE 'e2e-retention-%' ORDER BY email")
    .all()
    .map((r) => (r as { email: string }).email);
  check.close();

  expect(left).toEqual([
    "e2e-retention-admin@example.test",
    "e2e-retention-blocked-new@example.test",
    "e2e-retention-pending-new@example.test",
  ]);
});
