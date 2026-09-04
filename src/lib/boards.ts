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
   * table  — 공지·뉴스처럼 제목이 정보의 전부인 게시판
   * cards  — 행사처럼 일시·장소를 함께 봐야 하는 게시판
   * issues  — 뉴스레터처럼 그림이 곧 내용인 게시판. 자르지 않고 그대로 펼친다
   */
  layout: "table" | "cards" | "issues";
  /** 주최·장소·행사일 같은 행사 전용 입력을 쓰는가 */
  hasEventFields: boolean;
  /**
   * 메인 "새소식"에 탭으로 노출할지 여부.
   * 게시판이 여섯이라 전부 걸면 탭이 한 줄을 넘겨 읽기 어렵다.
   */
  showOnHome: boolean;
};

export const BOARDS: BoardConfig[] = [
  {
    slug: "notice",
    name: "공지사항",
    desc: "조합 운영과 정부·유관기관 공고를 안내합니다.",
    basePath: "/board/notice",
    layout: "table",
    hasEventFields: false,
    showOnHome: true,
  },
  {
    slug: "events",
    name: "행사정보",
    desc: "조합과 유관기관이 개최하는 세미나·컨퍼런스·전시 일정을 안내합니다.",
    basePath: "/board/events",
    layout: "cards",
    hasEventFields: true,
    showOnHome: true,
  },
  {
    slug: "news",
    name: "산업뉴스",
    desc: "클라우드컴퓨팅 산업의 정책·시장·기술 소식을 정리해 전합니다.",
    basePath: "/info/news",
    layout: "table",
    hasEventFields: false,
    showOnHome: true,
  },
  {
    slug: "trends",
    name: "기술동향",
    desc: "클라우드·AI 인프라 기술 동향 자료를 정리해 공유합니다.",
    basePath: "/info/trends",
    layout: "table",
    hasEventFields: false,
    showOnHome: false,
  },
  {
    slug: "archive",
    name: "자료실",
    desc: "조합 발간자료와 정책·기술 참고자료를 내려받을 수 있습니다.",
    basePath: "/info/archive",
    layout: "table",
    hasEventFields: false,
    showOnHome: false,
  },
  {
    slug: "newsletter",
    name: "뉴스레터",
    desc: "조합이 발행한 뉴스레터를 모아 두었습니다.",
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
