/*
  휴대전화번호.

  한 사람이 계정을 여러 개 만들지 못하게 막는 열쇠로 쓴다. 이메일은 얼마든지 새로
  만들 수 있지만 휴대전화번호는 그렇지 않아, 본인확인 서비스를 쓰지 않고 세울 수 있는
  가장 높은 문턱이다. 번호의 주인인지까지 확인하지는 못한다(그건 유료 본인확인의 몫).

  일반전화는 받지 않는다. 사무실 대표번호는 한 회사 사람들이 같이 쓰므로, 그것으로
  중복을 막으면 같은 회사의 두 번째 담당자가 가입하지 못한다.

  적는 방식이 사람마다 달라(010-1234-5678 / 01012345678 / +82 10 1234 5678)
  숫자만 남긴 꼴로 맞춘 뒤에 비교하고 저장한다. 모양이 다르다고 다른 번호로
  세면 중복을 막는 뜻이 없어진다.
*/

/** 숫자만 남긴다. 국가번호(82)로 적은 번호는 0 으로 시작하는 국내 표기로 바꾼다. */
export function normalizePhone(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("82")) {
    digits = digits.slice(2);
    /* +82 10-… 은 국가번호 뒤의 0 을 뺀 표기다. 도로 붙인다. */
    if (!digits.startsWith("0")) digits = `0${digits}`;
  }
  return digits;
}

/**
 * 국내 휴대전화번호인가.
 * 010 은 열한 자리로 굳었고, 옛 식별번호(011·016~019)는 열 자리도 있다.
 */
export function isMobilePhone(digits: string): boolean {
  return /^010\d{8}$/.test(digits) || /^01[16789]\d{7,8}$/.test(digits);
}

/** '01012345678' → '010-1234-5678'. 보기 좋으라고 넣는 줄표라, 길이가 다르면 그대로 둔다. */
export function formatPhone(digits: string): string {
  if (digits.length === 11) return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  if (digits.length === 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  return digits;
}
