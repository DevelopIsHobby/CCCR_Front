import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { verifyPassword } from "../src/lib/auth/password.ts";

/*
  설치할 때 만드는 관리자 계정으로 실제 로그인이 되는지.

  비밀번호를 만드는 쪽(scripts/create-admin.mjs)과 맞춰 보는 쪽(lib/auth/password.ts)이
  따로 짜여 있다. 한쪽에서 해시 방식이나 저장 형식을 바꾸고 다른 쪽을 안 고치면,
  새 서버를 세운 첫날 관리자가 로그인하지 못한다. 그때는 손쓸 방법도 마땅치 않다.
  스크립트를 실제로 돌려 나온 값을 앱 함수에 넣어 본다.
*/
test("설치 스크립트가 만든 비밀번호로 앱이 로그인시킨다", async () => {
  const dir = mkdtempSync(join(tmpdir(), "c3r-admin-"));
  const dbPath = join(dir, "t.db");
  const password = "설치비밀번호!2026";

  try {
    execFileSync(process.execPath, ["scripts/create-admin.mjs", "install-check@cccr.or.kr"], {
      input: password,
      env: { ...process.env, DB_DRIVER: "sqlite", DATABASE_PATH: dbPath },
      stdio: ["pipe", "ignore", "pipe"],
    });

    const db = new DatabaseSync(dbPath);
    const row = db
      .prepare("SELECT password_hash, role, status FROM users WHERE email = ?")
      .get("install-check@cccr.or.kr") as
      | { password_hash: string; role: string; status: string }
      | undefined;

    assert.ok(row, "관리자 계정이 만들어져야 한다");
    assert.equal(row.role, "admin", "권한이 admin 이어야 한다");
    assert.equal(row.status, "active", "바로 쓸 수 있는 상태여야 한다");
    assert.equal(await verifyPassword(password, row.password_hash), true, "맞는 비밀번호는 통과");
    assert.equal(await verifyPassword("다른비밀번호", row.password_hash), false, "틀린 비밀번호는 거절");
    db.close();
  } finally {
    /* 치우다 실패해도 검사를 실패로 만들지 않는다. 임시 폴더가 남을 뿐이다
       (윈도는 방금 닫은 파일을 잠깐 붙잡고 있을 때가 있다). */
    try {
      rmSync(dir, { recursive: true, force: true });
    } catch {
      /* 넘어간다 */
    }
  }
});
