/*
  너무 뻔한 비밀번호 거르기.

  영문·숫자·특수문자를 섞으라는 조합 규칙은 두지 않는다. 외우기 어려워져 적어 두게
  되고, 사람들은 'Password1!' 같은 뻔한 꼴로 규칙만 맞춘다. 회원 계정으로 할 수 있는
  일이 회원 전용 글 열람 정도여서 문턱만 높이고 얻는 것이 적다.

  대신 실제로 먼저 뚫리는 값만 막는다. 공격자는 흔한 비밀번호 목록부터 넣어 본다.
  본인 이메일·이름과 같은 값도 함께 막는다. 아는 사람이 가장 먼저 넣어 보는 값이다.
*/

/* 유출 목록 상위에 늘 올라오는 것들. 길이 제한(8자)을 이미 넘는 것만 적으면 된다. */
const COMMON = new Set([
  "password",
  "password1",
  "password123",
  "passw0rd",
  "12345678",
  "123456789",
  "1234567890",
  "qwertyui",
  "qwerty123",
  "asdfasdf",
  "abcd1234",
  "a1234567",
  "11111111",
  "00000000",
  "iloveyou",
  "princess",
  "sunshine",
  "football",
  "baseball",
  "dragon123",
  "admin123",
  "administrator",
  "letmein1",
  "welcome1",
  "welcome123",
  "qwer1234",
  "zxcvbnm1",
  "1q2w3e4r",
  "1q2w3e4r5t",
  "asdf1234",
]);

/**
 * 쓰면 안 되는 비밀번호면 까닭을, 괜찮으면 null 을 준다.
 * 길이 검사는 부르는 쪽에서 이미 한다.
 */
export function weakPasswordReason(
  password: string,
  who: { email?: string; name?: string } = {},
): string | null {
  const lower = password.toLowerCase();

  if (COMMON.has(lower)) {
    return "너무 흔한 비밀번호입니다. 다른 것으로 정해 주세요.";
  }

  /* 한 글자만 되풀이한 것(aaaaaaaa). 위 목록으로는 다 담을 수 없다. */
  if (/^(.)\1+$/.test(password)) {
    return "같은 글자만 되풀이한 비밀번호는 쓸 수 없습니다.";
  }

  const email = who.email?.trim().toLowerCase() ?? "";
  if (email) {
    const local = email.split("@")[0];
    /* 아이디 부분이 짧으면(a@… ) 우연히 들어 있을 수 있어 그때는 보지 않는다 */
    if (lower === email || (local.length >= 4 && lower.includes(local))) {
      return "이메일 주소가 들어간 비밀번호는 쓸 수 없습니다.";
    }
  }

  const name = who.name?.trim().toLowerCase() ?? "";
  if (name.length >= 2 && lower.includes(name)) {
    return "이름이 들어간 비밀번호는 쓸 수 없습니다.";
  }

  return null;
}
