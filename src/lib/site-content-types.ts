/*
  사무실·관련기관 정보 타입과 교통편 줄글 규칙.
  관리자 화면(클라이언트)에서도 쓰므로 server-only 모듈과 분리한다.
*/
export type RelatedSite = {
  id: number;
  name: string;
  url: string;
  sortOrder: number;
  isVisible: boolean;
};

export type TransitItem = { badges: string[]; text: string };
export type TransitGroup = { group: string; items: TransitItem[] };

export type Office = {
  id: number;
  name: string;
  address: string;
  tel: string;
  fax: string;
  note: string;
  /** 원본 줄글. 관리자 화면에서 그대로 고친다. */
  transit: string;
  /** 지도 좌표. 카카오맵 키와 함께 있어야 지도가 나온다. */
  mapLat: string;
  mapLng: string;
  sortOrder: number;
  isVisible: boolean;
};

export const TRANSIT_HELP =
  '그룹 이름은 한 줄로, 항목은 "배지 | 내용" 형식으로 씁니다. 배지는 쉼표로 여러 개를 넣을 수 있고(1,2,3,4,7 호선 / B 파랑버스 / G 초록버스), 빈 줄은 그룹을 나눕니다.';

/*
  교통편 줄글을 화면용 구조로 바꾼다.

    시내버스
    B | 파랑(간선) 360번
    G | 초록(지선) 3411번

  → [{ group: "시내버스", items: [{ badges: ["B"], text: "파랑(간선) 360번" }, …] }]
*/
export function parseTransit(text: string): TransitGroup[] {
  const groups: TransitGroup[] = [];

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    const divider = line.indexOf("|");
    if (divider === -1) {
      groups.push({ group: line, items: [] });
      continue;
    }

    /* 그룹 없이 항목이 먼저 나오면 이름 없는 그룹에 담는다 */
    if (groups.length === 0) groups.push({ group: "", items: [] });

    const badges = line
      .slice(0, divider)
      .split(",")
      .map((b) => b.trim())
      .filter(Boolean);

    groups[groups.length - 1].items.push({ badges, text: line.slice(divider + 1).trim() });
  }

  return groups.filter((g) => g.group || g.items.length > 0);
}
