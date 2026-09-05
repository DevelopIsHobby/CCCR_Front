import "server-only";
import { ready } from "./migrate";
import {
  type PromoCadence,
  type PromoRequest,
  type PromoStatus,
} from "@/lib/promo-types";

type RawPromo = {
  id: number;
  ref: string;
  org: string;
  name: string;
  position: string;
  email: string;
  tel: string;
  subject: string;
  body: string;
  tagline: string;
  start_on: string;
  cadence: string;
  image_id: number | null;
  file_name: string;
  file_bytes: number;
  status: string;
};

const CADENCES = new Set(["once", "weekly", "biweekly", "monthly"]);
const STATUSES = new Set(["new", "reading", "running", "done"]);

const toPromo = (r: RawPromo & { created_at: string }): PromoRequest => ({
  id: Number(r.id),
  ref: r.ref ?? "",
  org: r.org,
  name: r.name,
  position: r.position,
  email: r.email,
  tel: r.tel,
  subject: r.subject,
  body: r.body,
  tagline: r.tagline,
  startOn: r.start_on,
  cadence: (CADENCES.has(r.cadence) ? r.cadence : "once") as PromoCadence,
  imageUrl: r.image_id ? `/api/images/${Number(r.image_id)}` : null,
  file: r.file_name ? { name: r.file_name, byteSize: Number(r.file_bytes) } : null,
  status: (STATUSES.has(r.status) ? r.status : "new") as PromoStatus,
  createdAt: r.created_at,
});

const SELECT = `SELECT id, ref, org, name, position, email, tel, subject, body, tagline,
                       start_on, cadence, image_id, file_name, file_bytes, status, created_at
                  FROM promo_requests`;

export async function listPromos(
  opts: { status?: PromoStatus | "all" } = {},
): Promise<PromoRequest[]> {
  const db = await ready();
  const status = opts.status ?? "all";

  const rows = await db.all<RawPromo & { created_at: string }>(
    `${SELECT} WHERE deleted_at = ''${status === "all" ? "" : " AND status = ?"} ORDER BY id DESC`,
    status === "all" ? [] : [status],
  );
  return rows.map(toPromo);
}

/** 사이드바 배지에 쓴다. */
export async function countNewPromos(): Promise<number> {
  const db = await ready();
  const row = await db.get<{ n: number }>(
    "SELECT COUNT(*) AS n FROM promo_requests WHERE deleted_at = '' AND status = 'new'",
  );
  return Number(row?.n ?? 0);
}

/** 첨부 내려받기용. 관리자만 부른다. */
export async function getPromoFile(
  id: number,
): Promise<{ storedName: string; filename: string; mimeType: string } | null> {
  const db = await ready();
  const row = await db.get<{ file_stored: string; file_name: string; file_mime: string }>(
    "SELECT file_stored, file_name, file_mime FROM promo_requests WHERE id = ?",
    [id],
  );
  if (!row?.file_stored) return null;

  return {
    storedName: row.file_stored,
    filename: row.file_name,
    mimeType: row.file_mime || "application/octet-stream",
  };
}
