/* 단위 검사(node --test)가 바로 불러올 수 있게 확장자를 붙인다(csv.ts 와 같다) */
import { weakPasswordReason } from "./weak-password.ts";

/*
  비밀번호 규칙. 비밀번호를 정하는 모든 곳이 이것 하나를 쓴다.
    - 회원가입(signup-actions)
    - 비밀번호 재설정(reset-actions)
    - 내 계정에서 바꾸기(account-actions)
    - 관리자 계정 만들기(user-actions)
  한 곳만 고치면 어떤 길로는 약한 비밀번호가 들어온다.

  2026-10 사무국 결정: 8자 이상 + 영문과 숫자를 함께.
  「개인정보의 안전성 확보조치 기준」이 비밀번호 작성규칙을 정해 적용하라고 한다.
  여기에 흔한 비밀번호·본인 이메일·이름 거르기(weak-password.ts)를 함께 건다.
  특수문자는 요구하지 않는다. 문턱이 높을수록 'Password1!' 같은 뻔한 꼴로 맞춘다.

  화면(클라이언트)에서도 이 파일을 불러 입력하는 동안 맞았는지 보여 준다.
  그래서 server-only 를 붙이지 않는다.
*/

export const PASSWORD_MIN = 8;

/** 화면에 적는 규칙 한 줄 */
export const PASSWORD_RULE_TEXT = "8자 이상, 영문과 숫자를 함께";

export type PasswordChecks = {
  /** 8자 이상 */
  length: boolean;
  /** 영문 한 글자 이상 */
  letter: boolean;
  /** 숫자 한 글자 이상 */
  digit: boolean;
};

export function passwordChecks(password: string): PasswordChecks {
  return {
    length: password.length >= PASSWORD_MIN,
    letter: /[A-Za-z]/.test(password),
    digit: /[0-9]/.test(password),
  };
}

/**
 * 쓸 수 없는 비밀번호면 까닭을, 괜찮으면 null 을 준다.
 * who 를 주면 본인 이메일·이름과 같은 값도 막는다.
 */
export function passwordProblem(
  password: string,
  who: { email?: string; name?: string } = {},
): string | null {
  const c = passwordChecks(password);
  if (!c.length) return `비밀번호는 ${PASSWORD_MIN}자 이상으로 정해 주세요.`;
  if (!c.letter || !c.digit) return "비밀번호에 영문과 숫자를 함께 넣어 주세요.";
  return weakPasswordReason(password, who);
}
