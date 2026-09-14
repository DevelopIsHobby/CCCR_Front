/*
  회원사 등급과 표시 정보.
  관리자 화면(클라이언트)에서도 쓰므로 server-only 모듈과 분리한다.
*/
export type Company = {
  id: number;
  grade: string;
  name: string;
  site: string;
  /** 로고 그림 주소(/api/images/N). 없으면 빈 값 */
  logoUrl: string;
  sortOrder: number;
  isVisible: boolean;
};

/** 조합 명단의 등급 구분. 순서가 화면에 나오는 순서다. */
export const COMPANY_GRADES = [
  { grade: "이사장사", desc: "조합 이사장을 맡고 있는 회원사입니다." },
  { grade: "임원사", desc: "이사회를 구성해 조합 운영과 사업 방향을 결정합니다." },
  { grade: "일반회원사", desc: "조합 사업과 공동 연구개발에 참여하는 회원사입니다." },
  {
    grade: "준회원사",
    desc: "조합 주도 과제에 참여하는 기업·기관은 별도 가입절차와 가입비 없이 준회원으로 자동 가입됩니다.",
  },
];

/*
  회원사 홈페이지 주소.

  주소는 대개 https 로 열리므로 앞머리 없이 저장하고 링크에서 https:// 를 붙인다.
  다만 https 가 안 되고 http 로만 열리는 곳이 있어(예: 디노아이티), 그런 곳은
  http:// 를 붙인 채로 저장해 두면 그대로 쓴다.
*/

/** 저장할 꼴로 다듬는다. https:// 와 끝의 / 는 떼고, http:// 는 남긴다. */
export function normalizeCompanySite(raw: string): string {
  return raw
    .trim()
    .replace(/^https:\/\//i, "")
    .replace(/^http:\/\//i, "http://")
    .replace(/\/$/, "");
}

/** 누르면 갈 주소 */
export function companySiteHref(site: string): string {
  return /^https?:\/\//i.test(site) ? site : `https://${site}`;
}

/** 화면에 보일 주소. 앞머리는 떼고 보여 준다. */
export function companySiteLabel(site: string): string {
  return site.replace(/^https?:\/\//i, "");
}
