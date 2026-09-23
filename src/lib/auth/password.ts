import "server-only";
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

const KEY_LEN = 64;

/*
  비밀번호 해시. Node 내장 scrypt 를 쓴다.
  저장 형식은 `scrypt$<salt-hex>$<hash-hex>` 한 줄이다.
*/
export async function hashPassword(plain: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = (await scryptAsync(plain.normalize("NFKC"), salt, KEY_LEN)) as Buffer;
  return `scrypt$${salt.toString("hex")}$${derived.toString("hex")}`;
}

export async function verifyPassword(plain: string, stored: string): Promise<boolean> {
  const [scheme, saltHex, hashHex] = stored.split("$");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;

  const expected = Buffer.from(hashHex, "hex");
  const derived = (await scryptAsync(
    plain.normalize("NFKC"),
    Buffer.from(saltHex, "hex"),
    expected.length,
  )) as Buffer;

  return expected.length === derived.length && timingSafeEqual(expected, derived);
}

/*
  없는 계정으로 로그인을 해 봤을 때도 같은 시간을 쓰게 한다.

  안내 문구를 똑같이 맞춰도, 가입된 주소일 때만 scrypt 가 돌아 응답이 30ms 남짓
  늦어진다. 그 차이만으로 어떤 주소가 가입돼 있는지 하나씩 넣어 보며 알아낼 수 있다.
  비밀번호 재설정에서 메일을 나중에 보내는 것과 같은 까닭이다(auth/reset-actions.ts).

  아래 값은 아무 뜻이 없는 난수다. 여기에 맞는 비밀번호는 없고, 있을 필요도 없다.
  모양만 제대로면 scrypt 가 진짜 대조와 똑같이 돈다.
*/
const DUMMY =
  "scrypt$0e96b2a66e9517bcce3b2c32738c3f32$" +
  "f06b05f30c4764bc5f3ea41781d5298885dce35d3fc68455ea892f7ed27018f3" +
  "16e0b3d7c630429c5c763799237bdce268180b95c3850ef999f65f9571914f76";

/** 계정을 못 찾았을 때 부른다. 늘 false 지만 시간은 똑같이 쓴다. */
export async function burnPasswordTime(plain: string): Promise<void> {
  await verifyPassword(plain, DUMMY);
}
