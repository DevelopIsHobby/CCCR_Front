import "server-only";
import { ready } from "./migrate";

/*
  메인 화면 카드(히어로 슬라이드 · 배너 띠 · 알림판).
  사무국이 관리자 화면에서 직접 고친다.
*/
export type HomeCardKind = "slide" | "banner" | "promo";

export type HomeCard = {
  id: number;
  kind: HomeCardKind;
  sortOrder: number;
  label: string;
  title: string;
  body: string;
  caption: string | null;
  dateText: string | null;
  href: string;
  icon: string;
  isVisible: boolean;
};

export const HOME_CARD_KINDS: { kind: HomeCardKind; name: string; desc: string }[] = [
  {
    kind: "slide",
    name: "히어로 슬라이드",
    desc: "메인 상단에서 차례로 넘어가는 큰 화면입니다.",
  },
  { kind: "banner", name: "배너 띠", desc: "새소식 아래 가로로 넘기는 카드입니다." },
  { kind: "promo", name: "알림판", desc: "새소식 오른쪽의 짙은 카드입니다. 2개를 권장합니다." },
];

type RawCard = {
  id: number;
  kind: string;
  sort_order: number;
  label: string;
  title: string;
  body: string;
  caption: string | null;
  date_text: string | null;
  href: string;
  icon: string;
  is_visible: number;
};

const toCard = (r: RawCard): HomeCard => ({
  id: r.id,
  kind: r.kind as HomeCardKind,
  sortOrder: Number(r.sort_order),
  label: r.label,
  title: r.title,
  body: r.body,
  caption: r.caption,
  dateText: r.date_text,
  href: r.href,
  icon: r.icon ?? "",
  isVisible: Number(r.is_visible) === 1,
});

const SELECT = `SELECT id, kind, sort_order, label, title, body, caption, date_text, href, icon, is_visible
                FROM home_cards`;

/** 화면에 보여줄 카드. 숨김 처리한 것은 뺀다. */
export async function listHomeCards(kind: HomeCardKind): Promise<HomeCard[]> {
  const db = await ready();
  const rows = await db.all<RawCard>(
    `${SELECT} WHERE kind = ? AND is_visible = 1 ORDER BY sort_order, id`,
    [kind],
  );
  return rows.map(toCard);
}

/** 관리자 화면용. 숨긴 것까지 모두 가져온다. */
export async function listAllHomeCards(kind: HomeCardKind): Promise<HomeCard[]> {
  const db = await ready();
  const rows = await db.all<RawCard>(`${SELECT} WHERE kind = ? ORDER BY sort_order, id`, [kind]);
  return rows.map(toCard);
}

/** 배너 띠 등에 적는 '최근 갱신' 날짜. 보이는 카드 기준이고, 없으면 null 이다. */
export async function getHomeCardsUpdatedAt(kind: HomeCardKind): Promise<string | null> {
  const db = await ready();
  const row = await db.get<{ latest: string | null }>(
    "SELECT MAX(updated_at) AS latest FROM home_cards WHERE kind = ? AND is_visible = 1",
    [kind],
  );
  return row?.latest ? row.latest.slice(0, 10).replace(/-/g, ".") : null;
}
