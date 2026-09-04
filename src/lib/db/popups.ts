import "server-only";
import { ready } from "./migrate";
import { today } from "@/lib/format";

/*
  공지 팝업.

  홈페이지에 들어오면 뜨는 그림 한 장이다. 기간이 지난 것은 사무국이 따로
  끄지 않아도 저절로 사라지도록 날짜로 거른다. 끄는 일을 사람에게 맡기면
  지난 안내가 몇 달씩 떠 있게 된다.
*/

export type Popup = {
  id: number;
  title: string;
  imageUrl: string;
  href: string;
  startsOn: string;
  endsOn: string;
  width: number;
  sortOrder: number;
  isVisible: boolean;
};

type Raw = {
  id: number;
  title: string;
  image_url: string;
  href: string;
  starts_on: string;
  ends_on: string;
  width: number;
  sort_order: number;
  is_visible: number;
};

const toPopup = (r: Raw): Popup => ({
  id: Number(r.id),
  title: r.title,
  imageUrl: r.image_url,
  href: r.href,
  startsOn: r.starts_on,
  endsOn: r.ends_on,
  width: Number(r.width),
  sortOrder: Number(r.sort_order),
  isVisible: Number(r.is_visible) === 1,
});

const SELECT = `SELECT id, title, image_url, href, starts_on, ends_on, width, sort_order, is_visible
                  FROM popups`;

/**
 * 지금 띄울 팝업.
 * 숨김이 아니고, 시작일이 지났고, 종료일이 남은 것만. 빈 날짜는 제한하지 않는다.
 */
export async function listLivePopups(): Promise<Popup[]> {
  const db = await ready();
  const day = today();

  const rows = await db.all<Raw>(
    `${SELECT}
      WHERE is_visible = 1
        AND (starts_on = '' OR starts_on <= ?)
        AND (ends_on = '' OR ends_on >= ?)
      ORDER BY sort_order, id`,
    [day, day],
  );
  return rows.map(toPopup);
}

/** 관리자 화면용. 기간이 지난 것과 숨긴 것까지 모두 가져온다. */
export async function listAllPopups(): Promise<Popup[]> {
  const db = await ready();
  const rows = await db.all<Raw>(`${SELECT} ORDER BY sort_order, id`);
  return rows.map(toPopup);
}

/** 목록에서 지금 상태를 한 낱말로 알려 준다. */
export function popupState(p: Popup): "노출 중" | "숨김" | "기간 전" | "기간 지남" {
  if (!p.isVisible) return "숨김";
  const day = today();
  if (p.startsOn && p.startsOn > day) return "기간 전";
  if (p.endsOn && p.endsOn < day) return "기간 지남";
  return "노출 중";
}
