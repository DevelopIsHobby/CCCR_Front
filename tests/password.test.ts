import { test } from "node:test";
import assert from "node:assert/strict";
import { burnPasswordTime, hashPassword, verifyPassword } from "../src/lib/auth/password.ts";

/*
  비밀번호 보관과 대조.

  여기가 틀리면 아무나 들어오거나, 옳은 비밀번호를 넣은 사람이 못 들어온다.
  둘 다 조용히 일어나므로 검사로 잡아 둔다.
*/

test("넣은 비밀번호로 다시 들어올 수 있다", async () => {
  const stored = await hashPassword("바른-비밀번호-1234");
  assert.equal(await verifyPassword("바른-비밀번호-1234", stored), true);
  assert.equal(await verifyPassword("바른-비밀번호-1235", stored), false);
});

test("같은 비밀번호라도 저장값은 매번 다르다", async () => {
  /* 소금(salt)이 매번 달라야 한다. 같으면 같은 비밀번호를 쓴 계정이 한눈에 드러난다 */
  const a = await hashPassword("같은비밀번호");
  const b = await hashPassword("같은비밀번호");
  assert.notEqual(a, b);
  assert.equal(await verifyPassword("같은비밀번호", a), true);
  assert.equal(await verifyPassword("같은비밀번호", b), true);
});

test("한글은 자판·기기가 달라도 같은 비밀번호로 친다", async () => {
  /*
    '한글'을 한 글자로 담은 것과 자모를 이어 담은 것은 보기에 같아도 바이트가 다르다.
    맥에서 정한 비밀번호를 윈도에서 넣으면 못 들어가는 일이 생긴다. NFKC 로 맞춘다.
  */
  const 모아쓴것 = "한글비밀번호";
  const 풀어쓴것 = 모아쓴것.normalize("NFD");
  assert.notEqual(모아쓴것, 풀어쓴것);
  const stored = await hashPassword(모아쓴것);
  assert.equal(await verifyPassword(풀어쓴것, stored), true);
});

test("저장값이 망가져 있으면 통과시키지 않는다", async () => {
  for (const broken of ["", "scrypt$", "scrypt$abcd", "bcrypt$aa$bb", "그냥글자"]) {
    assert.equal(await verifyPassword("아무거나", broken), false, broken);
  }
});

test("없는 계정으로 시도해도 있는 계정만큼 시간을 쓴다", async () => {
  /*
    문구를 똑같이 맞춰도, 곧바로 돌려보내면 가입된 주소일 때만 scrypt 만큼 늦어진다.
    그 차이만으로 어떤 주소가 가입돼 있는지 알아낼 수 있다(auth/actions.ts).
    기계마다 빠르기가 다르므로 '실제로 scrypt 를 돌았는가' 만 넉넉히 본다.
  */
  const started = performance.now();
  await burnPasswordTime("아무거나");
  const spent = performance.now() - started;
  assert.ok(spent > 5, `헛걸음이 ${spent.toFixed(1)}ms 밖에 안 걸렸다 — scrypt 를 건너뛴 것이다`);
});
