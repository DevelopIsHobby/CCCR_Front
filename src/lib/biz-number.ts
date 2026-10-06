/*
  사업자등록번호.

  회원사를 식별하는 값으로 쓴다. 회사명은 적는 사람마다 달라지지만
  ('(주)아무개' / '아무개(주)' / '아무개 주식회사') 이 번호는 하나로 정해진다.

  국세청이 쓰는 검증식이 있어 엉터리 번호를 걸러낼 수 있다. 다만 검증식을 통과한다고
  실제로 있는 사업자라는 뜻은 아니다. 실제 존재 여부는 국세청 조회 API 를 붙여야
  알 수 있고, 여기서는 거기까지 하지 않는다.
*/

/** 숫자만 남긴다. '123-45-67890' 처럼 줄표를 넣어 적는 사람이 많다. */
export function normalizeBizNumber(raw: string): string {
  return raw.replace(/\D/g, "");
}

/*
  국세청 검증식.
  앞 아홉 자리에 가중치를 곱해 더하고, 아홉째 자리는 곱한 값의 십의 자리도 함께 더한다.
  10 에서 나머지를 뺀 값이 마지막 자리와 같아야 한다.
*/
const WEIGHTS = [1, 3, 7, 1, 3, 7, 1, 3, 5];

/** 사업자등록번호 열 자리로 올바른가 */
export function isBizNumber(digits: string): boolean {
  if (!/^\d{10}$/.test(digits)) return false;

  const n = digits.split("").map(Number);
  let sum = 0;
  for (let i = 0; i < 9; i += 1) sum += n[i] * WEIGHTS[i];
  /* 아홉째 자리는 곱한 결과가 두 자리가 될 수 있어 십의 자리를 더 더한다 */
  sum += Math.floor((n[8] * 5) / 10);

  return (10 - (sum % 10)) % 10 === n[9];
}

/** '1234567890' → '123-45-67890'. 길이가 다르면 그대로 둔다. */
export function formatBizNumber(digits: string): string {
  if (digits.length !== 10) return digits;
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
}
