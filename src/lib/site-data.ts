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

export type Slide = {
  eyebrow: string;
  title: string;
  body: string;
  caption: string;
  date: string;
};

export const SLIDES: Slide[] = [
  {
    eyebrow: "조합 소개",
    title: "클라우드컴퓨팅산업의\n다음 단계를 함께 설계합니다",
    body: "한국클라우드컴퓨팅연구조합은 클라우드컴퓨팅산업이 4차 산업 및 지능정보사회로의 도약에 기여할 수 있도록 노력하겠습니다.",
    caption: "한국클라우드컴퓨팅연구조합 소개",
    date: "2026-08-11",
  },
  {
    eyebrow: "교육 · 접수중",
    title: "AIDC 인프라 실무 교육\n2026년 하반기 과정 개설",
    body: "AI 데이터센터 설계·운영·최적화를 다루는 HW/SW 기반 실무 과정을 조합 회원사 대상으로 운영합니다.",
    caption: "[KCIA] AIDC 인프라를 위한 HW/SW 기반 설계 운영·최적화 실무 교육 (9/9~11)",
    date: "2026-07-30",
  },
  {
    eyebrow: "정책 과제",
    title: "국산 AI반도체 기반\nK-클라우드 추진방안",
    body: "국산 AI반도체를 활용한 클라우드 서비스 실증과 공공부문 SaaS 확산을 위한 정책 과제를 공유합니다.",
    caption: "『K-클라우드』 추진방안 및 공공부문 SaaS 이용 가이드라인",
    date: "2026-06-18",
  },
];

export type QuickLink = {
  label: string;
  desc: string;
  href: string;
  icon: "member" | "archive" | "class" | "business" | "calendar" | "mail";
};

export const QUICK_LINKS: QuickLink[] = [
  { label: "회원사 가입", desc: "가입 절차·서식", href: "/members/join", icon: "member" },
  { label: "자료실", desc: "연구·발간 자료", href: "/info/archive", icon: "archive" },
  { label: "교육 신청", desc: "전문기술 교육", href: "/education", icon: "class" },
  { label: "주요사업", desc: "사업 분야 안내", href: "/business/programs", icon: "business" },
  { label: "행사 일정", desc: "세미나·컨퍼런스", href: "/board/events", icon: "calendar" },
  { label: "뉴스레터", desc: "정기 소식 구독", href: "/info/newsletter", icon: "mail" },
];

export type Post = {
  category: "공지사항" | "행사정보" | "산업뉴스";
  agency: string;
  title: string;
  date: string;
  isNew?: boolean;
};

export const POSTS: Post[] = [
  {
    category: "공지사항",
    agency: "KCIA",
    title: "AIDC 인프라를 위한 HW/SW 기반 설계 운영·최적화 실무 교육 (9/9~11)",
    date: "2026-08-07",
    isNew: true,
  },
  {
    category: "행사정보",
    agency: "NIPA/BIPA",
    title: "2026 K-ICT WEEK in BUSAN (9/9~11, 부산 벡스코)",
    date: "2026-08-05",
    isNew: true,
  },
  {
    category: "공지사항",
    agency: "CCCR/KCIA",
    title: "새싹 동대문 4기 기업연계형 AI 서비스·클라우드 실무 과정 교육생 모집",
    date: "2026-08-01",
    isNew: true,
  },
  {
    category: "행사정보",
    agency: "OCP",
    title: "OCP Korea Tech Day (8/21, 코엑스)",
    date: "2026-07-29",
  },
  {
    category: "행사정보",
    agency: "오케스트로",
    title: "OKESTRO OPUS 2026 (7/28, 코엑스)",
    date: "2026-07-15",
  },
  {
    category: "공지사항",
    agency: "과기정통부",
    title: "2026년도 소프트웨어 산업발전 유공자 포상계획 공고 (~7/24)",
    date: "2026-07-03",
  },
  {
    category: "산업뉴스",
    agency: "IITP",
    title: "(소프트웨어분야) 정보통신·방송 연구개발사업 신규과제 기술수요조사 결과",
    date: "2026-06-27",
  },
  {
    category: "공지사항",
    agency: "KEIT",
    title: "2026년도 K-온디바이스 AI반도체 기술개발사업 신규 지원대상 연구개발과제 공고",
    date: "2026-06-20",
  },
  {
    category: "산업뉴스",
    agency: "AI타임스",
    title: "피지컬 AI 컨퍼런스 2026 개최 (4.9, COEX)",
    date: "2026-06-12",
  },
];

export const NOTICE_BOARD = [
  {
    tag: "회원사 모집",
    title: "2026년 신규 회원사 가입 안내",
    desc: "클라우드·AI 인프라 기업의 공동 연구개발 참여 기회",
    href: "/members/join",
  },
  {
    tag: "교육",
    title: "클라우드컴퓨팅 전문기술 연간교육",
    desc: "회원사 임직원 대상 실무 중심 커리큘럼 운영",
    href: "/education",
  },
];

export type Banner = {
  kind: string;
  title: string;
  sub: string;
  href: string;
};

export const BANNERS: Banner[] = [
  {
    kind: "법령",
    title: "클라우드컴퓨팅법 시행 개정안",
    sub: "2023. 1. 12 시행",
    href: "/info/archive",
  },
  {
    kind: "교육",
    title: "클라우드컴퓨팅 전문기술 연간교육",
    sub: "연간 교육 과정 안내",
    href: "/education",
  },
  {
    kind: "지침",
    title: "국가연구개발사업 연구개발비 사용기준",
    sub: "IITP · 2023 개정",
    href: "/info/archive",
  },
  {
    kind: "가이드라인",
    title: "공공부문 SaaS 이용 가이드라인",
    sub: "가이드라인 배포",
    href: "/info/archive",
  },
  {
    kind: "정책",
    title: "『K-클라우드』 추진방안",
    sub: "국산 AI반도체 기반 클라우드",
    href: "/info/archive",
  },
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
