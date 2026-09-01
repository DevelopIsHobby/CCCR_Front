import "server-only";
import { ready } from "./migrate";
import type {
  AboutCard,
  CardSection,
  Department,
  HistoryEntry,
  PageTexts,
} from "@/lib/about-content-types";

/** 소개 페이지 문구를 한 번에 읽는다. 없는 키는 빈 값이다. */
export async function getPageTexts(): Promise<PageTexts> {
  const db = await ready();
  const rows = await db.all<{ key: string; value: string }>("SELECT key, value FROM page_texts");

  const texts: PageTexts = {};
  for (const row of rows) texts[row.key] = row.value;
  return texts;
}

type RawCard = { id: number; section: string; title: string; body: string; sort_order: number };

export async function listAboutCards(section: CardSection): Promise<AboutCard[]> {
  const db = await ready();
  const rows = await db.all<RawCard>(
    `SELECT id, section, title, body, sort_order FROM about_cards
     WHERE section = ? ORDER BY sort_order, id`,
    [section],
  );
  return rows.map((r) => ({
    id: Number(r.id),
    section: r.section as CardSection,
    title: r.title,
    body: r.body,
    sortOrder: Number(r.sort_order),
  }));
}

type RawDepartment = { id: number; name: string; tel: string; email: string; sort_order: number };

export async function listDepartments(): Promise<Department[]> {
  const db = await ready();
  const rows = await db.all<RawDepartment>(
    "SELECT id, name, tel, email, sort_order FROM departments ORDER BY sort_order, id",
  );
  return rows.map((r) => ({
    id: Number(r.id),
    name: r.name,
    tel: r.tel,
    email: r.email,
    sortOrder: Number(r.sort_order),
  }));
}

type RawHistory = {
  id: number;
  year: string;
  month: string;
  title: string;
  place: string;
  sort_order: number;
};

const toHistory = (r: RawHistory): HistoryEntry => ({
  id: Number(r.id),
  year: r.year,
  month: r.month,
  title: r.title,
  place: r.place,
  sortOrder: Number(r.sort_order),
});

export async function listHistory(year?: string): Promise<HistoryEntry[]> {
  const db = await ready();
  const rows = await db.all<RawHistory>(
    `SELECT id, year, month, title, place, sort_order FROM history_entries
     ${year ? "WHERE year = ?" : ""} ORDER BY sort_order, id`,
    year ? [year] : [],
  );
  return rows.map(toHistory);
}

/** 연혁 관리 화면의 연도 목록. 나온 차례를 지킨다. */
export async function listHistoryYears(): Promise<{ year: string; count: number }[]> {
  const db = await ready();
  const rows = await db.all<{ year: string; n: number; first: number }>(
    `SELECT year, COUNT(*) AS n, MIN(sort_order) AS first FROM history_entries
     GROUP BY year ORDER BY first`,
  );
  return rows.map((r) => ({ year: r.year, count: Number(r.n) }));
}
