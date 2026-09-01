/*
  사이트 기본 정보(푸터 표기) 항목 정의.
  관리자 화면(클라이언트)에서도 쓰므로 server-only 모듈과 분리한다.
*/
export type SiteSettingKey =
  | "address"
  | "tel"
  | "fax"
  | "email"
  | "businessNo"
  | "chairman"
  | "joinBank"
  | "joinHolder"
  | "joinTeam"
  | "joinAddress"
  | "joinTel"
  | "joinFax"
  | "joinEmail";

export type SiteSettings = Record<SiteSettingKey, string>;

export const SITE_FIELDS: {
  key: SiteSettingKey;
  label: string;
  placeholder: string;
  help?: string;
  wide?: boolean;
}[] = [
  {
    key: "address",
    label: "주소",
    placeholder: "서울특별시 강남구 …",
    wide: true,
    help: "푸터 하단에 그대로 표시됩니다.",
  },
  { key: "tel", label: "전화", placeholder: "02-0000-0000" },
  { key: "fax", label: "팩스", placeholder: "02-0000-0000" },
  { key: "email", label: "이메일", placeholder: "admin@cccr.or.kr" },
  {
    key: "businessNo",
    label: "고유번호",
    placeholder: "000-00-00000",
    help: "아직 실제 번호를 받지 못해 자리표시자가 들어 있습니다.",
  },
  { key: "chairman", label: "이사장", placeholder: "이동기" },
];

/** 회원사 가입안내 화면의 입금계좌·문의처 */
export const JOIN_CONTACT_FIELDS: {
  key: SiteSettingKey;
  label: string;
  placeholder: string;
  wide?: boolean;
}[] = [
  { key: "joinBank", label: "입금계좌", placeholder: "우리은행 0000-000-000000", wide: true },
  { key: "joinHolder", label: "예금주", placeholder: "한국클라우드컴퓨팅연구조합" },
  { key: "joinTeam", label: "담당", placeholder: "조합회원 입회 담당자" },
  { key: "joinAddress", label: "주소", placeholder: "서울특별시 강남구 …", wide: true },
  { key: "joinTel", label: "전화", placeholder: "02-0000-0000" },
  { key: "joinFax", label: "팩스", placeholder: "02-0000-0000" },
  { key: "joinEmail", label: "이메일", placeholder: "admin@cccr.or.kr" },
];

/** DB 에 값이 없을 때 쓰는 기본값. */
export const SITE_DEFAULTS: SiteSettings = {
  address: "",
  tel: "",
  fax: "",
  email: "",
  businessNo: "",
  chairman: "",
  joinBank: "",
  joinHolder: "",
  joinTeam: "",
  joinAddress: "",
  joinTel: "",
  joinFax: "",
  joinEmail: "",
};
