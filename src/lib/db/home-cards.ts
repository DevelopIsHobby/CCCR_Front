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
  isVisible: Number(r.is_visible) === 1,
});

const SELECT = `SELECT id, kind, sort_order, label, title, body, caption, date_text, href, is_visible
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
