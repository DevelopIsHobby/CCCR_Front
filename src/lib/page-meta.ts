import type { Metadata } from "next";

/*
  화면별 검색 정보.

  설명문을 두지 않으면 모든 화면이 사이트 기본 설명 한 줄을 같이 쓰게 되어,
  검색 결과에서 화면끼리 구분이 안 된다. 화면 머리에 이미 적어 둔 한 줄 설명을 그대로 쓴다.

  canonical 은 이 화면의 '정식 주소'다. 같은 화면이 미리보기 주소(vercel.app)나
  ?page= 같은 붙은 주소로도 열리므로, 검색엔진이 하나로 모아 세도록 알려 준다.
  경로만 적으면 metadataBase(SITE_URL) 앞에 붙어 절대 주소가 된다.
*/
const MAX = 150;

export function pageMeta(title: string, path: string, description?: string | null): Metadata {
  const desc = description?.replace(/s+/g, " ").trim();
  return {
    title,
    ...(desc ? { description: desc.length > MAX ? `${desc.slice(0, MAX - 1)}…` : desc } : {}),
    alternates: { canonical: path },
  };
}
