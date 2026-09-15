import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";
import { BOARDS } from "@/lib/boards";
import { NAV } from "@/lib/site-data";
import { ready } from "@/lib/db/migrate";

/*
  검색 로봇에게 알려 줄 주소 목록.

  메뉴에 있는 안내 화면과 게시판 목록, 그리고 게시글 하나하나를 담는다.
  글이 아주 많아지면 파일이 커지므로 최근 것부터 1000건까지만 싣는다.
  그보다 오래된 글은 게시판 목록을 타고 들어가면 로봇도 찾을 수 있다.

  DB 를 읽으므로 미리 만들어 두지 않고 요청할 때마다 만든다.
*/
export const dynamic = "force-dynamic";

const MAX_POSTS = 1000;

/*
  화면이 없고 첫 하위 화면으로 넘겨 보내기만 하는 묶음 주소.

  검색 로봇에게 알려 줘 봐야 넘어간 곳을 한 번 더 받을 뿐이고, 색인에는
  '넘겨 보내는 쪽'으로 남아 실린 보람이 없다.
  참여하기(/participate)는 제 화면이 있으므로 여기 넣지 않는다.
  다만 그 화면은 하위 메뉴에도 올라 있어, 그대로 두면 같은 주소가 두 번 실린다.
*/
const REDIRECT_ONLY = new Set(["/about", "/members", "/business", "/board", "/info"]);

/*
  메뉴에는 있지만 검색에 싣지 않는 화면(페이지에 noindex 를 걸어 둔 곳).
  사이트맵에 넣으면 서치콘솔이 '제출한 주소가 noindex' 라고 경고한다.
*/
const NOINDEX = new Set(["/participate/status"]);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const now = new Date();

  /* 안내 화면 — 메뉴에 있는 것 전부 */
  const pages: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "daily", priority: 1 },
    ...NAV.flatMap((section) => [
      /* 묶음 주소가 하위 메뉴에도 있으면 그쪽 한 번만 실는다 */
      ...(REDIRECT_ONLY.has(section.href) ||
      section.children.some((child) => child.href === section.href)
        ? []
        : [
            {
              url: `${base}${section.href}`,
              lastModified: now,
              changeFrequency: "monthly" as const,
              priority: 0.7,
            },
          ]),
      ...section.children
        .filter((child) => !NOINDEX.has(child.href))
        .map((child) => ({
          url: `${base}${child.href}`,
          lastModified: now,
          changeFrequency: "monthly" as const,
          priority: 0.6,
        })),
    ]),
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/email-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  /* 게시글 */
  let posts: MetadataRoute.Sitemap = [];
  try {
    const db = await ready();
    const rows = await db.all<{ id: number; board: string; updated_at: string }>(
      `SELECT id, board, updated_at FROM posts WHERE deleted_at = '' ORDER BY id DESC LIMIT ?`,
      [MAX_POSTS],
    );

    /* 산업뉴스처럼 원문 기사로 보내는 게시판의 글 화면은 싣지 않는다. 내용 없이 링크뿐인 화면이다 */
    const basePath = new Map(BOARDS.filter((b) => b.layout !== "links").map((b) => [b.slug, b.basePath]));
    posts = rows
      .filter((r) => basePath.has(r.board))
      .map((r) => ({
        url: `${base}${basePath.get(r.board)}/${r.id}`,
        lastModified: new Date(r.updated_at.replace(" ", "T")),
        changeFrequency: "weekly" as const,
        priority: 0.5,
      }));
  } catch {
    /* DB 가 아직 없거나 잘못돼도 안내 화면 목록은 내보낸다 */
  }

  /* 같은 주소가 두 번 들어가지 않게 한다 */
  const seen = new Set<string>();
  return [...pages, ...posts].filter((e) => {
    if (seen.has(e.url)) return false;
    seen.add(e.url);
    return true;
  });
}
