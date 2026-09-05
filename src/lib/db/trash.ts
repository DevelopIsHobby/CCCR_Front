import "server-only";
import { ready } from "./migrate";
import { now } from "./driver";
import { requireAdmin } from "@/lib/auth/session";
import { deleteUpload } from "@/lib/uploads";
import { TRASH_KEEP_DAYS, type TrashKind, type TrashRow } from "@/lib/trash-types";

/*
  휴지통.

  삭제를 누르면 진짜로 지우지 않고 deleted_at 에 시각만 적는다. 목록에서는
  사라지지만 30일 동안은 되돌릴 수 있다. 사무국 직원이 한 줄 잘못 눌러 지웠을 때
  백업을 하루치 되돌리는 것 말고 다른 길이 있어야 하기 때문이다.

  표마다 '무엇이었는지' 알아볼 이름이 다르므로 여기 한곳에 모아 둔다.
  표를 늘릴 때는 TABLES 에 한 줄 더하고 마이그레이션으로 deleted_at 을 붙인다.
*/

type Spec = {
  table: string;
  /** 목록에 보여줄 이름을 만드는 SQL 조각 */
  titleSql: string;
  /** 어디에 있던 것인지 (게시판 이름처럼 행마다 다르면 SQL 조각으로) */
  whereSql: string;
};

const TABLES: Record<TrashKind, Spec> = {
  post: { table: "posts", titleSql: "title", whereSql: "board" },
  company: { table: "companies", titleSql: "name", whereSql: "grade" },
  notice: {
    table: "notice_subscribers",
    titleSql: "company || ' · ' || name",
    whereSql: "'사업공고 수신자'",
  },
  proposal: {
    table: "education_proposals",
    titleSql: "subject",
    whereSql: "org",
  },
  promo: { table: "promo_requests", titleSql: "subject", whereSql: "org" },
  room: {
    table: "room_reservations",
    titleSql: "org || ' · ' || use_date || ' ' || start_time",
    whereSql: "'회의실 예약'",
  },
  aboutCard: { table: "about_cards", titleSql: "title", whereSql: "section" },
  department: { table: "departments", titleSql: "name", whereSql: "'부서별 연락처'" },
  history: {
    table: "history_entries",
    titleSql: "year || ' ' || month || ' · ' || title",
    whereSql: "'연혁'",
  },
};

const KINDS = Object.keys(TABLES) as TrashKind[];

function spec(kind: TrashKind): Spec {
  const found = TABLES[kind];
  if (!found) throw new Error(`알 수 없는 휴지통 갈래: ${kind}`);
  return found;
}

/** 지운 것으로 표시한다. 목록에서는 사라지고 휴지통에 남는다. */
export async function softDelete(kind: TrashKind, id: number): Promise<void> {
  const { table } = spec(kind);
  const db = await ready();
  await db.run(`UPDATE ${table} SET deleted_at = ? WHERE id = ? AND deleted_at = ''`, [now(), id]);
}

/** 되돌린다. */
export async function restore(kind: TrashKind, id: number): Promise<void> {
  const { table } = spec(kind);
  const db = await ready();
  await db.run(`UPDATE ${table} SET deleted_at = '' WHERE id = ?`, [id]);
}

/** 휴지통 목록. 최근에 지운 것부터. */
export async function listTrash(): Promise<TrashRow[]> {
  const db = await ready();
  const rows: TrashRow[] = [];

  for (const kind of KINDS) {
    const { table, titleSql, whereSql } = spec(kind);
    const found = await db.all<{ id: number; title: string; where_label: string; deleted_at: string }>(
      `SELECT id, ${titleSql} AS title, ${whereSql} AS where_label, deleted_at
         FROM ${table} WHERE deleted_at <> '' ORDER BY deleted_at DESC`,
    );
    rows.push(
      ...found.map((r) => ({
        kind,
        id: Number(r.id),
        title: r.title ?? "(제목 없음)",
        where: r.where_label ?? "",
        deletedAt: r.deleted_at,
      })),
    );
  }

  return rows.sort((a, b) => b.deletedAt.localeCompare(a.deletedAt));
}

export async function countTrash(): Promise<number> {
  const db = await ready();
  let total = 0;

  for (const kind of KINDS) {
    const row = await db.get<{ n: number }>(
      `SELECT COUNT(*) AS n FROM ${spec(kind).table} WHERE deleted_at <> ''`,
    );
    total += Number(row?.n ?? 0);
  }
  return total;
}

/*
  진짜로 지운다.

  글과 홍보 신청은 딸린 파일이 있어 표만 지우면 디스크에 남는다.
  파일 관리 화면의 '기록 없는 파일'로 흘러가긴 하지만, 여기서 함께 치우는 편이 낫다.
*/
async function purgeOne(kind: TrashKind, id: number): Promise<void> {
  const db = await ready();

  if (kind === "post") {
    const files = await db.all<{ stored_name: string }>(
      "SELECT stored_name FROM attachments WHERE post_id = ?",
      [id],
    );
    await db.run("DELETE FROM attachments WHERE post_id = ?", [id]);
    for (const f of files) await deleteUpload(f.stored_name);
  }

  if (kind === "promo") {
    const row = await db.get<{ image_id: number | null; file_stored: string }>(
      "SELECT image_id, file_stored FROM promo_requests WHERE id = ?",
      [id],
    );
    if (row?.image_id) {
      const image = await db.get<{ stored_name: string }>(
        "SELECT stored_name FROM images WHERE id = ?",
        [row.image_id],
      );
      if (image) {
        await db.run("DELETE FROM images WHERE id = ?", [row.image_id]);
        await deleteUpload(image.stored_name);
      }
    }
    if (row?.file_stored) await deleteUpload(row.file_stored);
  }

  await db.run(`DELETE FROM ${spec(kind).table} WHERE id = ?`, [id]);
}

/** 관리자가 휴지통에서 바로 비울 때. */
export async function purge(kind: TrashKind, id: number): Promise<void> {
  await requireAdmin();
  await purgeOne(kind, id);
}

/** 야간 정리 — 30일이 지난 것을 진짜로 지운다. 지운 개수를 돌려준다. */
export async function purgeExpired(): Promise<number> {
  const db = await ready();
  const cut = new Date(Date.now() - TRASH_KEEP_DAYS * 86_400_000)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");

  let removed = 0;
  for (const kind of KINDS) {
    const rows = await db.all<{ id: number }>(
      `SELECT id FROM ${spec(kind).table} WHERE deleted_at <> '' AND deleted_at < ?`,
      [cut],
    );
    for (const row of rows) {
      await purgeOne(kind, Number(row.id));
      removed += 1;
    }
  }
  return removed;
}
