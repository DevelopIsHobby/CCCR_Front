/*
  옛 홈페이지(그누보드) — 지난 자료 보관 주소와 옛 주소 넘겨주기.

  옛 사이트는 문을 닫지 않고 지난 자료 보관용으로 남긴다(2026-09-15 결정).
  지금은 www.cccr.or.kr/home/ 에 있지만, 새 사이트가 그 도메인을 가져가면 옛 사이트는
  하위 주소(예: archive.cccr.or.kr)로 옮긴다. 옮긴 주소를 OLD_SITE_ORIGIN 으로 알려 준다.

  - 정하지 않았을 때: 지금처럼 옛 주소를 새 화면·새 게시판으로 넘긴다.
  - 정했을 때: 옛 소개 화면만 새 화면으로, 나머지(게시판·글·첨부)는 보관 주소의 같은 자리로.
    새 사이트에는 옛 글이 없으므로, 옛 글 링크를 살리려면 보관 주소로 보내야 한다.

  next.config.ts 와 푸터가 함께 쓰므로 server-only 로 두지 않는다.
  넘겨주기 규칙은 빌드할 때 굳으므로, OLD_SITE_ORIGIN 을 바꾸면 다시 빌드해야 한다.
*/

const CURRENT_ORIGIN = "http://www.cccr.or.kr";

const trimSlash = (url: string) => url.replace(/\/+$/, "");

/** 보관 주소로 정한 값. 없으면 빈 문자열. */
function configuredArchive(): string {
  return trimSlash(process.env.OLD_SITE_ORIGIN?.trim() ?? "");
}

/** 옛 사이트가 사는 곳(끝의 / 없이). 보관 주소를 정하지 않았으면 지금 주소. */
export function oldSiteOrigin(): string {
  return configuredArchive() || CURRENT_ORIGIN;
}

/** 푸터 '지난 자료 보기'가 가리키는 곳 */
export function oldSiteHomeUrl(): string {
  return `${oldSiteOrigin()}/home/`;
}

/* 옛 소개 화면 → 새 화면. 같은 내용을 새로 썼으므로 옛 화면보다 새 화면이 낫다. */
const OLD_PAGES: [string, string][] = [
  ["/home", "/"],
  ["/home/index.php", "/"],
  ["/home/sub01/sub01_greeting.php", "/about/greeting"],
  ["/home/sub01/sub01_history.php", "/about/history"],
  ["/home/sub01/sub01_organization.php", "/about/organization"],
  ["/home/sub01/sub01_location.php", "/about/location"],
  ["/home/sub02/sub02_member.php", "/members/list"],
  ["/home/sub02/sub02_register.php", "/members/join"],
  ["/home/sub03/sub03_business.php", "/business/why"],
  ["/home/sub03/sub03_mainjob.php", "/business/programs"],
  ["/home/member/login.php", "/login"],
  ["/home/member/join.php", "/signup"],
];

/*
  보관 주소가 없을 때 쓰는 게시판 짝. 옛 글은 옮기지 않았으므로 글 상세도 그 게시판 목록으로 보낸다.
  포토갤러리(sub12)는 새 사이트에 없어 가장 가까운 행사정보로 보낸다.
*/
const OLD_BOARDS: Record<string, string> = {
  sub10: "/board/notice",
  sub11: "/board/events",
  sub12: "/board/events",
  sub13: "/info/news",
  sub14: "/info/trends",
  sub15: "/info/archive",
  sub16: "/info/newsletter",
};

export type OldSiteRedirect = {
  source: string;
  destination: string;
  permanent: boolean;
  has?: { type: "query"; key: string; value: string }[];
};

export function buildOldSiteRedirects(archiveOrigin: string = configuredArchive()): OldSiteRedirect[] {
  const pages = OLD_PAGES.map(([source, destination]) => ({ source, destination, permanent: true }));
  const archive = trimSlash(archiveOrigin.trim());

  if (archive) {
    return [
      ...pages,
      /*
        나머지 옛 주소(게시판·글·첨부·그림)는 보관 주소의 같은 자리로. 쿼리(bo_table, wr_id)도
        따라가므로 옛 글 링크가 그대로 열린다. 보관 주소는 나중에 바뀔 수 있어 영구(308)가
        아니라 임시(307)로 넘긴다. 영구로 넘기면 브라우저가 오래 기억해 되돌리기 어렵다.
      */
      { source: "/home/:path*", destination: `${archive}/home/:path*`, permanent: false },
    ];
  }

  return [
    ...pages,
    ...Object.entries(OLD_BOARDS).flatMap(([table, destination]) =>
      ["/home/board/board.php", "/home/board/detailview.php"].map((source) => ({
        source,
        has: [{ type: "query" as const, key: "bo_table", value: table }],
        destination,
        permanent: true,
      })),
    ),
    /* 모르는 게시판 코드는 첫 화면으로 */
    { source: "/home/board/:file(board|detailview).php", destination: "/", permanent: true },
  ];
}
