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



export const PARTNERS = [
  "한국컴퓨팅산업협회",
  "과학기술정보통신부",
  "산업통상자원부",
  "한국산업기술평가관리원",
  "정보통신산업진흥원",
  "한국클라우드산업협회",
  "한국지능정보사회진흥원",
  "정보통신기획평가원",
];
