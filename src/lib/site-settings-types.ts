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
  | "joinEmail"
  | "kakaoMapKey";

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

/** 찾아오시는 길의 지도 */
export const MAP_FIELDS: {
  key: SiteSettingKey;
  label: string;
  placeholder: string;
  help?: string;
  wide?: boolean;
}[] = [
  {
    key: "kakaoMapKey",
    label: "카카오맵 JavaScript 키",
    placeholder: "발급받은 키를 붙여 넣으세요",
    wide: true,
    help: "카카오 개발자 사이트에서 앱을 만들고 JavaScript 키를 받아 넣습니다. 키와 사무실 좌표가 모두 있어야 지도가 나옵니다.",
  },
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
  kakaoMapKey: "",
};
