import { defineConfig, devices } from "@playwright/test";

/*
  브라우저로 실제 화면을 열어 보는 자동 테스트 설정.

  - 운영과 같은 방식으로 확인하려고 `next build` 한 것을 띄운다(개발 서버가 아니다).
  - DB 와 업로드 폴더는 `.e2e/` 아래를 쓴다. 평소 쓰는 data/c3r.db 는 건드리지 않는다.
  - 메일 설정(SMTP_*)을 주지 않으므로 가입 신청을 해도 메일은 나가지 않는다.
*/
const PORT = Number(process.env.E2E_PORT ?? 3100);
const baseURL = `http://127.0.0.1:${PORT}`;

export const E2E_DB = ".e2e/c3r.db";

export default defineConfig({
  testDir: "./e2e",
  /* 같은 DB 를 함께 쓰므로 한 줄로 돌린다 */
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],

  use: {
    baseURL,
    locale: "ko-KR",
    timezoneId: "Asia/Seoul",
    /* 실패한 것만 남긴다. 성공한 것까지 남기면 용량이 커진다 */
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },

  projects: [
    /* 계정·글 같은 확인용 자료를 먼저 넣는다 */
    { name: "준비", testMatch: /prepare\.setup\.ts/ },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["준비"],
    },
  ],

  webServer: {
    command: `npm run build && npx next start -p ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
    stdout: "pipe",
    stderr: "pipe",
    env: {
      DATABASE_PATH: E2E_DB,
      UPLOAD_DIR: ".e2e/uploads",
      /* 확인용 서버가 검색에 잡히지 않게 한다 */
      SITE_NOINDEX: "1",
      SITE_URL: baseURL,
    },
  },
});
