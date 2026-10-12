import { test } from "node:test";
import assert from "node:assert/strict";
import { readSignupProfile } from "../src/lib/auth/signup-profile.ts";

/*
  가입 신청서 읽기.
  회원 유형에 따라 받는 칸이 다르다. 개인에게 회사명을 요구하면 가입을 못 하고,
  기업에게 받지 않으면 사무국이 누구인지 알 수 없다.
*/

function read(fields: Record<string, string>) {
  return readSignupProfile((k) => fields[k] ?? "");
}

const PERSON = { memberType: "개인", name: "홍길동", phone: "010-1234-5678" };
const COMPANY = {
  memberType: "기업",
  company: "가나다정보기술",
  name: "홍길동",
  department: "기술영업팀",
  phone: "010-1234-5678",
  bizNumber: "120-81-47521",
};

test("개인은 소속 없이 가입할 수 있다", () => {
  const r = read(PERSON);
  assert.ok("profile" in r, JSON.stringify(r));
  assert.equal(r.profile.memberType, "개인");
  assert.equal(r.profile.company, null);
  assert.equal(r.profile.phone, "01012345678");
});

test("개인이 적은 소속은 받는다", () => {
  const r = read({ ...PERSON, company: "한국대학교" });
  assert.ok("profile" in r);
  assert.equal(r.profile.company, "한국대학교");
});

test("개인에게 없는 칸이 실려 와도 받지 않는다", () => {
  /* 화면에 없는 칸이다. 요청을 직접 만들어 보내도 저장되면 안 된다 */
  const r = read({ ...PERSON, department: "몰래", bizNumber: "120-81-47521" });
  assert.ok("profile" in r);
  assert.equal(r.profile.department, null);
  assert.equal(r.profile.bizNumber, null);
});

test("기업은 기관·회사명이 있어야 한다", () => {
  const r = read({ ...COMPANY, company: "" });
  assert.deepEqual(r, { error: "기관·회사명을 입력해 주세요." });
});

test("기업의 선택 칸을 모두 받는다", () => {
  const r = read(COMPANY);
  assert.ok("profile" in r, JSON.stringify(r));
  assert.equal(r.profile.company, "가나다정보기술");
  assert.equal(r.profile.department, "기술영업팀");
  assert.equal(r.profile.bizNumber, "1208147521");
});

test("회원 유형이 없거나 모르는 값이면 받지 않는다", () => {
  assert.ok("error" in read({ ...PERSON, memberType: "" }));
  /* 예전 구분 이름. 이제는 고를 수 없다 */
  assert.ok("error" in read({ ...PERSON, memberType: "회원사" }));
});

test("이름이 없으면 유형에 맞는 말로 알려 준다", () => {
  assert.deepEqual(read({ ...PERSON, name: "" }), { error: "이름을 입력해 주세요." });
  assert.deepEqual(read({ ...COMPANY, name: "" }), { error: "담당자 이름을 입력해 주세요." });
});

test("휴대전화번호 규칙은 두 유형 모두 같다", () => {
  for (const base of [PERSON, COMPANY]) {
    assert.deepEqual(read({ ...base, phone: "" }), { error: "휴대전화번호를 입력해 주세요." });
    assert.match((read({ ...base, phone: "02-2052-0156" }) as { error: string }).error, /일반전화/);
  }
});

test("기업의 사업자등록번호는 검증식을 본다", () => {
  assert.deepEqual(read({ ...COMPANY, bizNumber: "120-81-47522" }), {
    error: "사업자등록번호를 다시 확인해 주세요.",
  });
});
