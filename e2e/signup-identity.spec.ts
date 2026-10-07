import { test, expect } from "@playwright/test";
import { ADMIN, db, hashPassword, login, now } from "./fixtures";

/*
  한 사람이 계정을 여러 개 만들지 못하게 막는 장치.

  이메일은 얼마든지 새로 만들 수 있어 중복을 막는 열쇠가 되지 못한다. 휴대전화번호를
  필수로 받고 한 번호에 한 계정만 둔다. 번호의 주인인지까지는 확인하지 못하므로
  (그건 문자 인증의 몫) 승인 화면의 중복 의심 표시가 함께 받친다.

  가입은 한 시간에 다섯 번까지라, 실제로 계정이 만들어지는 시험은 아껴 쓴다.
  막히는 것을 보는 시험은 계정이 생기지 않으므로 횟수에 들지 않는다.
*/

/** 가입 폼을 채운다. 비우고 싶은 칸은 빈 문자열로 준다. */
async function fill(
  page: import("@playwright/test").Page,
  v: { email: string; phone: string; biz?: string; password?: string; name?: string },
) {
  const password = v.password ?? "e2e-Test-Passw0rd";

  await page.goto("/signup");
  await page.locator('input[name="agreeTerms"]').first().check();
  await page.locator('input[name="agreePrivacy"]').first().check();
  /* 회원 구분은 필수다(2026-10) */
  await page.locator('input[name="memberType"][value="비회원사"]').check();
  await page.locator("#signup-company").fill("확인용회사");
  await page.locator("#signup-name").fill(v.name ?? "확인용담당자");
  await page.locator("#signup-email").fill(v.email);
  if (v.phone) await page.locator("#signup-phone").fill(v.phone);
  if (v.biz) await page.locator("#signup-bizNumber").fill(v.biz);
  await page.locator("#signup-password").fill(password);
  await page.locator("#signup-password-confirm").fill(password);
}

/** 계정이 만들어졌는지 DB 로 본다. 화면 문구만 보면 실제 저장 여부를 알 수 없다. */
function userOf(email: string) {
  const conn = db();
  const row = conn.prepare("SELECT phone, biz_number FROM users WHERE email = ?").get(email) as
    | { phone: string | null; biz_number: string | null }
    | undefined;
  conn.close();
  return row;
}

test("휴대전화번호를 적지 않으면 가입되지 않는다", async ({ page }) => {
  const email = `e2e-nophone-${Date.now()}@example.test`;
  await fill(page, { email, phone: "" });

  /*
    화면의 required 는 브라우저가 지켜 줄 뿐이라 요청을 직접 보내면 넘는다.
    서버가 막는지를 봐야 하므로 그 속성을 떼고 보낸다.
  */
  await page.locator("#signup-phone").evaluate((el) => el.removeAttribute("required"));
  await page.getByRole("button", { name: "가입 신청" }).click();

  await expect(page.getByText("휴대전화번호를 입력해 주세요.")).toBeVisible();
  expect(userOf(email)).toBeUndefined();
});

test("일반전화는 받지 않는다", async ({ page }) => {
  /* 사무실 대표번호를 받으면 같은 회사의 두 번째 담당자가 막힌다 */
  const email = `e2e-landline-${Date.now()}@example.test`;
  await fill(page, { email, phone: "02-2052-0156" });
  await page.getByRole("button", { name: "가입 신청" }).click();

  await expect(page.getByText(/일반전화는 쓸 수 없습니다/)).toBeVisible();
  expect(userOf(email)).toBeUndefined();
});

test("이미 쓴 번호로는 다른 이메일로도 가입되지 않는다", async ({ page }) => {
  const phone = `010${String(Date.now()).slice(-8)}`;

  /* 먼저 그 번호를 쓰는 계정을 넣어 둔다(가입 횟수 제한을 아끼려고 DB 에 바로 넣는다) */
  const conn = db();
  conn
    .prepare(
      `INSERT INTO users (email, password_hash, name, company, phone, role, status, created_at)
       VALUES (?, ?, '먼저가입', '확인용회사', ?, 'member', 'active', ?)`,
    )
    .run(`e2e-first-${Date.now()}@example.test`, hashPassword("e2e-Test-Passw0rd"), phone, now());
  conn.close();

  const email = `e2e-second-${Date.now()}@example.test`;
  /* 같은 번호를 모양만 다르게 적는다. 모양이 다르다고 다른 번호로 보면 막는 뜻이 없다. */
  await fill(page, { email, phone: `+82 10 ${phone.slice(3, 7)} ${phone.slice(7)}` });
  await page.getByRole("button", { name: "가입 신청" }).click();

  await expect(page.getByText(/이미 가입 신청된 휴대전화번호/)).toBeVisible();
  expect(userOf(email)).toBeUndefined();
});

test("어느 이메일로 가입했는지는 알려 주지 않는다", async ({ page }) => {
  /* 번호를 넣어 보는 것만으로 남의 가입 여부와 이메일을 알아낼 수 있으면 안 된다 */
  const phone = `010${String(Date.now()).slice(-8)}`;
  const taken = `e2e-secret-${Date.now()}@example.test`;

  const conn = db();
  conn
    .prepare(
      `INSERT INTO users (email, password_hash, name, company, phone, role, status, created_at)
       VALUES (?, ?, '비밀회원', '확인용회사', ?, 'member', 'active', ?)`,
    )
    .run(taken, hashPassword("e2e-Test-Passw0rd"), phone, now());
  conn.close();

  await fill(page, { email: `e2e-probe-${Date.now()}@example.test`, phone });
  await page.getByRole("button", { name: "가입 신청" }).click();

  await expect(page.getByText(/이미 가입 신청된 휴대전화번호/)).toBeVisible();
  await expect(page.getByText(taken)).toHaveCount(0);
});

test("검증식에 맞지 않는 사업자등록번호는 받지 않는다", async ({ page }) => {
  const email = `e2e-badbiz-${Date.now()}@example.test`;
  /* 120-81-47521 이 올바른 번호다. 끝자리만 바꾸면 검증식에 걸려야 한다. */
  await fill(page, { email, phone: `010${String(Date.now()).slice(-8)}`, biz: "120-81-47522" });
  await page.getByRole("button", { name: "가입 신청" }).click();

  await expect(page.getByText(/사업자등록번호를 다시 확인/)).toBeVisible();
  expect(userOf(email)).toBeUndefined();
});

test("너무 흔한 비밀번호는 받지 않는다", async ({ page }) => {
  const email = `e2e-weakpw-${Date.now()}@example.test`;
  await fill(page, {
    email,
    phone: `010${String(Date.now()).slice(-8)}`,
    password: "password123",
  });
  await page.getByRole("button", { name: "가입 신청" }).click();

  await expect(page.getByText(/너무 흔한 비밀번호/)).toBeVisible();
  expect(userOf(email)).toBeUndefined();
});

test("승인 화면이 이름이 겹치는 계정을 알려 준다", async ({ page }) => {
  /*
    번호가 같은 계정은 가입 때 막으므로 여기 오지 않는다.
    번호를 바꿔 가며 또 만드는 경우를 사람이 보고 판단하게 하는 것이 이 표시의 몫이다.
  */
  const stamp = Date.now();
  const conn = db();
  const insert = conn.prepare(
    `INSERT INTO users (email, password_hash, name, company, phone, role, status, created_at)
     VALUES (?, ?, ?, '확인용회사', ?, 'member', ?, ?)`,
  );
  const hash = hashPassword("e2e-Test-Passw0rd");
  insert.run(`e2e-dupe-old-${stamp}@example.test`, hash, "겹치는이름", `010${String(stamp).slice(-8)}`, "active", now());
  insert.run(`e2e-dupe-new-${stamp}@example.test`, hash, "겹치는이름", `011${String(stamp).slice(-7)}`, "pending", now());
  conn.close();

  await login(page, ADMIN);
  await page.goto("/admin/members");

  /*
    메일 주소는 본 줄에도 나오므로 안내 영역 안에서 찾는다.
    안내가 여럿 떠 있을 수 있어(다른 시험이 남긴 계정) 이 시험이 넣은 것만 집는다.
  */
  const notice = page
    .locator("tr")
    .filter({ hasText: "이미 있는 계정과 겹칩니다" })
    .filter({ hasText: `e2e-dupe-old-${stamp}@example.test` });
  await expect(notice).toBeVisible();
  await expect(notice.getByText("이름이 같음")).toBeVisible();
  await expect(notice.getByText(`e2e-dupe-old-${stamp}@example.test`)).toBeVisible();

  /* 승인 대기 쪽에만 붙는다. 이미 승인한 계정 옆에 띄워 봐야 할 일이 없다. */
  await expect(notice.getByText(`e2e-dupe-new-${stamp}@example.test`)).toHaveCount(0);
});

test("가입하면 번호가 한 가지 꼴로 저장된다", async ({ page }) => {
  /* 저장 모양이 섞이면 중복 검사가 통째로 무너진다 */
  const email = `e2e-normal-${Date.now()}@example.test`;
  const tail = String(Date.now()).slice(-8);

  await fill(page, { email, phone: `010-${tail.slice(0, 4)}-${tail.slice(4)}` });
  await page.getByRole("button", { name: "가입 신청" }).click();
  await expect(page.getByText("가입 신청이 접수되었습니다")).toBeVisible();

  expect(userOf(email)?.phone).toBe(`010${tail}`);
});
