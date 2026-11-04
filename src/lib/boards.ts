/*
  게시판 정의.

  라우트와 서버 액션이 모두 이 표를 기준으로 동작한다.
  게시판을 늘릴 때는 여기에 한 줄 넣고, DB 의 boards 테이블에도 같은 slug 를
  추가한다(마이그레이션). 화면은 basePath 에 얇은 라우트 파일만 두면 된다.
*/
export type BoardConfig = {
  slug: string;
  name: string;
  desc: string;
  /**
   * 게시판이 놓이는 주소. 사이트 메뉴 구조를 따르므로 게시판마다 다르다.
   * 예) 공지사항은 게시판 메뉴, 산업뉴스는 정보서비스 메뉴 아래에 있다.
   */
  basePath: string;
  /**
   * 목록 표시 방식.
   * table  — 공지처럼 제목이 정보의 전부인 게시판
   * cards  — 행사처럼 일시·장소를 함께 봐야 하는 게시판
   * issues — 뉴스레터처럼 표지가 곧 제목인 게시판. 표지를 그리드로 늘어놓는다
   * links  — 산업뉴스처럼 바깥 기사를 모으는 게시판. 제목·출처·날짜만 한 줄로 두고
   *          제목을 누르면 원문 기사가 새 창으로 열린다. 글쓰기에서 기사 주소가 필수다
   * notices — 사업공고처럼 마감이 있는 공고를 모으는 게시판. 목록에 접수중·마감과
   *          주관기관·마감일을 함께 두어, 훑으면서 아직 넣을 수 있는 것을 가려낸다.
   *          강사 모집도 이 꼴이다(recruit 참고)
   * gallery — 포토갤러리처럼 사진이 곧 글인 게시판. 첫 사진을 가로 4:3 카드로 늘어놓고,
   *          글 화면에서는 사진을 눌러 크게 넘겨 본다
   */
  layout: "table" | "cards" | "issues" | "links" | "notices" | "gallery";
  /** 주최·장소·행사일 같은 행사 전용 입력을 쓰는가 */
  hasEventFields: boolean;
  /**
   * 주관기관·접수 마감일 입력을 쓰는가(사업공고).
   * 행사와 달리 여는 날이 없고 마감만 있다. 장소·행사일 칸은 쓰지 않는다.
   */
  hasDeadlineFields?: boolean;
  /**
   * 강사 모집처럼 마감은 있지만 기관 공고가 아닌 게시판. 사업공고와 같은 목록·탭·상태를 쓰되
   * 말을 '모집'으로 바꾸고(deadlineWords), 주관·전문기관 칸 대신 분야(categories)를 보인다.
   * 본문과 첨부(지원서 양식)를 그대로 쓴다.
   */
  recruit?: boolean;
  /**
   * 원문 주소만 받는 게시판인가. 본문·첨부·회원 전용 칸이 없고, 제목을 누르면 원문이 새 창으로 열린다.
   * links 배치(산업뉴스)는 늘 그렇다. 사업공고도 공고 원문(기관 누리집)으로 바로 보낸다.
   */
  linkOnly?: boolean;
  /**
   * 메인 "새소식"에 탭으로 노출할지 여부.
   * 게시판이 여섯이라 전부 걸면 탭이 한 줄을 넘겨 읽기 어렵다.
   */
  showOnHome: boolean;
  /**
   * 목록 위에 탭으로 거를 분류. 없으면 탭을 두지 않는다.
   * 글 하나는 분류 하나를 갖고, 맨 앞 '전체' 탭에서는 모두 보인다.
   * 여기 이름을 고치면 이미 올린 글의 분류와 어긋나므로, 바꿀 때는 DB 값도 함께 고친다.
   */
  categories?: string[];
};

/** 분류 탭 맨 앞에 두는 '전체'. 주소에는 넣지 않는다(?cat 이 없으면 전체다). */
export const ALL_CATEGORY = "전체";

/** 그 게시판에서 쓸 수 있는 분류인지. 주소로 들어온 값을 그대로 믿지 않는다. */
export function isCategoryOf(board: BoardConfig, value: string): boolean {
  return Boolean(value) && (board.categories ?? []).includes(value);
}

/*
  사업공고의 접수 상태 탭. 주소에는 ?status=open|closed 로 싣고, 없으면 전체다.

  마감일이 없는 공고(상시 접수 등)는 전체에서만 보인다. 목록 배지와 같은 이유로,
  모르는 것을 접수중이라고 단정하지 않는다(format.ts noticeStatus).
*/
export type DeadlineFilter = "open" | "closed";

/*
  마감이 있는 게시판의 말. 사업공고는 '접수', 강사 모집은 '모집'.
  상태 딱지(noticeStatus 값 → 화면 글자)·탭·기간 칸 이름이 이것을 따른다.
*/
export type DeadlineWords = {
  status: Record<"접수예정" | "접수중" | "마감", string>;
  /** 탭: 전체 · 진행중 · 마감 */
  tabs: [string, string, string];
  /** 탭 줄의 이름(화면 낭독기) */
  tabsLabel: string;
  /** 목록·글 화면의 기간 칸 이름 */
  period: string;
  start: string;
  end: string;
  /** 글쓰기의 묶음 이름 */
  legend: string;
};

const ANNOUNCE_WORDS: DeadlineWords = {
  status: { 접수예정: "접수예정", 접수중: "접수중", 마감: "마감" },
  tabs: ["전체 사업", "접수중인 사업", "접수마감 사업"],
  tabsLabel: "접수 상태",
  period: "접수 기간",
  start: "접수 시작일",
  end: "접수 마감일",
  legend: "공고 정보",
};

const RECRUIT_WORDS: DeadlineWords = {
  status: { 접수예정: "모집예정", 접수중: "모집중", 마감: "모집마감" },
  tabs: ["전체", "모집중", "모집마감"],
  tabsLabel: "모집 상태",
  period: "모집 기간",
  start: "모집 시작일",
  end: "모집 마감일",
  legend: "모집 정보",
};

export function deadlineWords(board: BoardConfig): DeadlineWords {
  return board.recruit ? RECRUIT_WORDS : ANNOUNCE_WORDS;
}

/** 접수 상태 탭. 이름은 게시판 말(deadlineWords)을 따른다 */
export function deadlineTabs(board: BoardConfig): { value: DeadlineFilter | ""; label: string }[] {
  const [all, open, closed] = deadlineWords(board).tabs;
  return [
    { value: "", label: all },
    { value: "open", label: open },
    { value: "closed", label: closed },
  ];
}

/** 마감일이 있는 게시판에서 주소로 들어온 상태 값을 고른다. 아니면 빈 값(전체) */
export function deadlineFilterOf(board: BoardConfig, value: string): DeadlineFilter | "" {
  if (!board.hasDeadlineFields) return "";
  return value === "open" || value === "closed" ? value : "";
}

export const BOARDS: BoardConfig[] = [
  {
    slug: "notice",
    name: "공지사항",
    desc: "한국클라우드컴퓨팅연구조합의 운영 소식과 정부·유관기관 사업 공고를 전합니다.",
    basePath: "/board/notice",
    layout: "table",
    hasEventFields: false,
    showOnHome: true,
  },
  {
    slug: "events",
    name: "행사정보",
    desc: "조합과 회원사·유관기관이 여는 세미나, 컨퍼런스, 전시회 일정을 안내합니다.",
    basePath: "/board/events",
    layout: "cards",
    hasEventFields: true,
    showOnHome: true,
  },
  {
    slug: "announce",
    name: "사업공고",
    desc: "정부·유관기관의 사업 공고 가운데 조합 사업과 관련된 것을 사무국이 모아 정리합니다.",
    basePath: "/board/announce",
    /* 마감이 지난 공고가 섞이므로 목록에서 접수중·마감을 가려 준다 */
    layout: "notices",
    hasEventFields: false,
    hasDeadlineFields: true,
    /* 공고 내용은 옮겨 적지 않고 주관기관 공고 원문으로 보낸다 */
    linkOnly: true,
    showOnHome: true,
  },
  {
    slug: "gallery",
    name: "포토갤러리",
    desc: "조합 행사·세미나·교육 현장의 사진을 모았습니다.",
    basePath: "/board/gallery",
    /* 사진이 곧 글이라 표 대신 사진 카드로 늘어놓는다 */
    layout: "gallery",
    hasEventFields: false,
    showOnHome: false,
  },
  {
    slug: "instructors",
    name: "강사 모집",
    desc: "조합 교육·세미나에서 강의해 주실 전문가를 모집합니다.",
    basePath: "/participate/instructors",
    /* 모집 기간이 있어 사업공고와 같은 표·탭·상태를 쓰고, 말만 '모집'으로 바꾼다 */
    layout: "notices",
    hasEventFields: false,
    hasDeadlineFields: true,
    recruit: true,
    showOnHome: false,
    /* 목록의 분야 칸. 글쓰기에서 고른다 */
    categories: ["교육", "세미나"],
  },
  {
    slug: "news",
    name: "산업뉴스",
    desc: "클라우드컴퓨팅 산업의 정책, 시장, 기술 소식을 사무국이 모아 정리해 전합니다.",
    basePath: "/info/news",
    /* 기사 전문을 옮기지 않고 원문 기사로 보낸다. 일반 게시판 표(번호·글쓴이·조회)는 맞지 않았다 */
    layout: "links",
    hasEventFields: false,
    showOnHome: true,
    /* 사무국이 기사를 모을 때 쓰는 갈래. 늘리거나 이름을 바꾸면 올린 글의 분류도 함께 고친다 */
    categories: ["클라우드", "데이터센터", "AI", "통신", "양자", "자율주행", "로봇"],
  },
  {
    slug: "trends",
    name: "기술동향",
    desc: "클라우드와 AI 인프라 분야의 기술 동향 자료를 정리해 공유합니다.",
    basePath: "/info/trends",
    layout: "table",
    hasEventFields: false,
    showOnHome: false,
  },
  {
    slug: "archive",
    name: "자료실",
    desc: "조합이 펴낸 발간자료와 정책·기술 참고자료를 내려받을 수 있습니다.",
    basePath: "/info/archive",
    layout: "table",
    hasEventFields: false,
    showOnHome: false,
  },
  {
    slug: "newsletter",
    name: "뉴스레터",
    desc: "조합이 월 1회 발행하는 뉴스레터를 모아 두었습니다. 지난 호를 읽어 보실 수 있습니다.",
    basePath: "/info/newsletter",
    layout: "issues",
    hasEventFields: false,
    showOnHome: false,
  },
];

export function getBoard(slug: string): BoardConfig | null {
  return BOARDS.find((b) => b.slug === slug) ?? null;
}

/**
 * 주소에 맞는 게시판을 찾는다.
 * slug 가 같아도 basePath 가 다르면 그 주소의 게시판이 아니다.
 * 같은 글이 두 주소에서 열리는 것을 막는다.
 */
export function getBoardAt(path: string): BoardConfig | null {
  return BOARDS.find((b) => b.basePath === path) ?? null;
}

export function boardPath(slug: string): string {
  const board = getBoard(slug);
  if (!board) throw new Error(`알 수 없는 게시판: ${slug}`);
  return board.basePath;
}

/**
 * 글을 눌렀을 때 갈 곳. 목록·메인 새소식·통합검색이 함께 쓴다.
 * 원문 링크 게시판(산업뉴스·사업공고)은 원문으로 바로 보내고, 링크가 없는 글은 사이트 안 글 화면으로 보낸다.
 */
export function postHref(board: BoardConfig, id: number, linkUrl?: string | null): string {
  return isLinkOnly(board) && linkUrl ? linkUrl : `${board.basePath}/${id}`;
}

/** 원문 주소만 받는 게시판인가(산업뉴스·사업공고). 글쓰기 칸과 글을 눌렀을 때 갈 곳이 달라진다 */
export function isLinkOnly(board: BoardConfig | null | undefined): boolean {
  return Boolean(board && (board.layout === "links" || board.linkOnly));
}

/** 사이트 밖으로 나가는 주소인지. 새 창으로 열지 가를 때 쓴다. */
export function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}
