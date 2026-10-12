/*
  가입 신청서의 회원 정보 읽기.

  이메일 가입과 소셜 가입이 같은 기준을 쓴다. 한쪽만 느슨하면 그쪽이 빠져나가는 길이
  되므로(중복 계정, 너무 긴 값) 규칙을 여기 한 곳에만 둔다. 이메일·비밀번호는 두 경로가
  받는 방식이 달라(소셜은 서비스가 이메일을 준다) 부르는 쪽에서 따로 본다.

  회원 구분에 따라 받는 칸이 다르다.
    개인 — 이름·휴대전화번호. 소속은 적고 싶으면 적는다
    기업 — 기관·회사명·담당자 이름·휴대전화번호. 부서·직위와 사업자등록번호는 선택
  개인이 보낸 부서·사업자번호는 버린다. 화면에 없는 칸이 요청에 실려 오면 받지 않는다.

  DB·서버 전용 코드를 부르지 않아 단위 시험에서 바로 불러 쓸 수 있다.
*/
/* 단위 시험(node --test)이 '@/' 별칭을 읽지 못해 상대 경로로 부른다(password-rule.ts 와 같다) */
import { isBizNumber, normalizeBizNumber } from "../biz-number.ts";
import { isMobilePhone, normalizePhone } from "../phone.ts";
import { isMemberType, type MemberType } from "../user-types.ts";
import { checkSignupLengths } from "./signup-limits.ts";

export type SignupProfile = {
  memberType: MemberType;
  name: string;
  company: string | null;
  department: string | null;
  /** 숫자만 남긴 휴대전화번호(lib/phone.ts) */
  phone: string;
  bizNumber: string | null;
};

export function readSignupProfile(
  get: (key: string) => string,
): { error: string } | { profile: SignupProfile } {
  const value = (key: string) => get(key).trim();

  const memberType = value("memberType");
  if (!isMemberType(memberType)) {
    return { error: "회원 유형(개인회원·기업회원)을 골라 주세요." };
  }
  const isCompany = memberType === "기업";

  const name = value("name");
  const company = value("company");
  /* 개인에게는 없는 칸이다 */
  const department = isCompany ? value("department") : "";
  const bizNumber = isCompany ? normalizeBizNumber(value("bizNumber")) : "";
  const phone = normalizePhone(value("phone"));

  if (isCompany && !company) {
    return { error: "기관·회사명을 입력해 주세요." };
  }
  if (!name) {
    return { error: isCompany ? "담당자 이름을 입력해 주세요." : "이름을 입력해 주세요." };
  }
  /*
    휴대전화번호로 한 사람이 계정을 여러 개 만드는 것을 막는다(migrations/037).
    일반전화를 받으면 사무실 대표번호를 적게 되어, 같은 회사의 두 번째 담당자가 막힌다.
  */
  if (!phone) {
    return { error: "휴대전화번호를 입력해 주세요." };
  }
  if (!isMobilePhone(phone)) {
    return { error: "휴대전화번호를 다시 확인해 주세요. 일반전화는 쓸 수 없습니다." };
  }
  if (bizNumber && !isBizNumber(bizNumber)) {
    return { error: "사업자등록번호를 다시 확인해 주세요." };
  }
  const tooLong = checkSignupLengths({ name, company, department, phone, bizNumber });
  if (tooLong) {
    return { error: tooLong };
  }

  return {
    profile: {
      memberType,
      name,
      company: company || null,
      department: department || null,
      phone,
      bizNumber: bizNumber || null,
    },
  };
}
