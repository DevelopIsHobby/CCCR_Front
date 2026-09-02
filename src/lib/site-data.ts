export type NavItem = {
  label: string;
  href: string;
  children: { label: string; href: string }[];
};

export const NAV: NavItem[] = [
  {
    label: "조합소개",
    href: "/about",
    children: [
      { label: "인사말", href: "/about/greeting" },
      { label: "설립목적 및 연혁", href: "/about/history" },
      { label: "조직도", href: "/about/organization" },
      { label: "찾아오시는 길", href: "/about/location" },
    ],
  },
  {
    label: "회원사안내",
    href: "/members",
    children: [
      { label: "회원사 현황", href: "/members/list" },
      { label: "회원사 가입안내", href: "/members/join" },
    ],
  },
  {
    label: "사업안내",
    href: "/business",
    children: [
      { label: "사업의 필요성", href: "/business/why" },
      { label: "주요사업", href: "/business/programs" },
    ],
  },
  {
    label: "게시판",
    href: "/board",
    children: [
      { label: "공지사항", href: "/board/notice" },
      { label: "행사정보", href: "/board/events" },
    ],
  },
  {
    label: "정보서비스",
    href: "/info",
    children: [
      { label: "산업뉴스", href: "/info/news" },
      { label: "기술동향", href: "/info/trends" },
      { label: "자료실", href: "/info/archive" },
      { label: "뉴스레터", href: "/info/newsletter" },
    ],
  },
];

/** 교육은 조합이 별도 사이트로 운영한다. 사이트 안에 교육 페이지를 두지 않는다. */
export const EDUCATION_URL = "https://www.cccr-edu.or.kr/main/index.jsp";

export type QuickLink = {
  label: string;
  desc: string;
  href: string;
  icon: "member" | "archive" | "class" | "business" | "calendar" | "mail";
};

export const QUICK_LINKS: QuickLink[] = [
  { label: "회원사 가입", desc: "가입 절차·서식", href: "/members/join", icon: "member" },
  { label: "자료실", desc: "연구·발간 자료", href: "/info/archive", icon: "archive" },
  { label: "교육 신청", desc: "전문기술 교육", href: EDUCATION_URL, icon: "class" },
  { label: "주요사업", desc: "사업 분야 안내", href: "/business/programs", icon: "business" },
  { label: "행사 일정", desc: "세미나·컨퍼런스", href: "/board/events", icon: "calendar" },
  { label: "뉴스레터", desc: "정기 소식 구독", href: "/info/newsletter", icon: "mail" },
];



/*
  메인 하단에 흐르는 유관기관 로고 띠.
  그림은 public/partners/ 에 있고, width·height 는 원본 크기다.
  실제 표시 크기는 화면에서 정하고 이 값은 가로세로 비율을 알려 주는 용도로만 쓴다.
*/
export type Partner = { name: string; src: string; width: number; height: number };

export const PARTNERS: Partner[] = [
  { name: "한국산업기술기획평가원", src: "/partners/keit.png", width: 1428, height: 175 },
  { name: "정보통신산업진흥원", src: "/partners/nipa.png", width: 326, height: 63 },
  { name: "한국클라우드산업협회", src: "/partners/kcloud.png", width: 753, height: 331 },
  { name: "한국지능정보사회진흥원", src: "/partners/nia.png", width: 510, height: 113 },
  { name: "정보통신기획평가원", src: "/partners/iitp.png", width: 621, height: 90 },
  { name: "한국컴퓨팅산업협회", src: "/partners/kcia.png", width: 415, height: 74 },
  { name: "과학기술정보통신부", src: "/partners/msit.png", width: 501, height: 114 },
  { name: "산업통상부", src: "/partners/motie.png", width: 499, height: 92 },
  { name: "한국컴퓨팅사업협동조합", src: "/partners/kbiz-coop.png", width: 188, height: 35 },
  { name: "공공클라우드지원센터", src: "/partners/pcsc.png", width: 300, height: 63 },
  { name: "한국산업기술진흥원", src: "/partners/kiat.png", width: 975, height: 256 },
  { name: "중소기업기술정보진흥원", src: "/partners/tipa.png", width: 451, height: 133 },
  { name: "한국인터넷진흥원", src: "/partners/kisa.png", width: 1135, height: 220 },
  { name: "한국전자통신연구원", src: "/partners/etri.png", width: 704, height: 82 },
  { name: "한국오픈소스협회", src: "/partners/koss.png", width: 307, height: 40 },
  { name: "한국네트워크산업협회", src: "/partners/knia.png", width: 842, height: 220 },
  { name: "한국IT서비스산업협회", src: "/partners/itsa.png", width: 338, height: 52 },
  { name: "SW중심사회", src: "/partners/sw-society.png", width: 196, height: 63 },
  { name: "한국전자기술연구원", src: "/partners/keti.png", width: 983, height: 254 },
  { name: "OpenMCP", src: "/partners/openmcp.png", width: 151, height: 44 },
  { name: "CCCR 아카데미", src: "/partners/cccr-academy.png", width: 210, height: 48 },
];
