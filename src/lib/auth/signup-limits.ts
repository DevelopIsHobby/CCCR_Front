/*
  회원가입 칸별 최대 길이.

  화면의 maxLength 는 브라우저가 지켜 줄 뿐이라 요청을 직접 보내면 넘는다.
  아주 긴 값이 들어오면 관리자 회원 목록이 깨지고, 사무국 알림 메일 제목에도 그대로 실린다.
  이메일 가입과 소셜 가입이 같은 기준을 쓰도록 한 곳에 둔다.
  DB·서버 전용 코드를 부르지 않아 화면과 테스트에서도 불러 쓸 수 있다.
*/

export const SIGNUP_MAX = {
  email: 254,
  name: 50,
  company: 100,
  department: 100,
  phone: 30,
} as const;

const MESSAGE: Record<keyof typeof SIGNUP_MAX, string> = {
  email: `이메일은 ${SIGNUP_MAX.email}자`,
  name: `담당자 이름은 ${SIGNUP_MAX.name}자`,
  company: `기관·회사명은 ${SIGNUP_MAX.company}자`,
  department: `부서·직위는 ${SIGNUP_MAX.department}자`,
  phone: `연락처는 ${SIGNUP_MAX.phone}자`,
};

/** 너무 긴 칸이 있으면 안내 문구를, 없으면 null 을 돌려준다. */
export function checkSignupLengths(values: Partial<Record<keyof typeof SIGNUP_MAX, string>>): string | null {
  for (const key of Object.keys(SIGNUP_MAX) as (keyof typeof SIGNUP_MAX)[]) {
    if ((values[key] ?? "").length > SIGNUP_MAX[key]) {
      return `${MESSAGE[key]} 이내로 적어 주세요.`;
    }
  }
  return null;
}
