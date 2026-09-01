import "server-only";
import { ready } from "./migrate";
import type { Office, RelatedSite } from "@/lib/site-content-types";

type RawOffice = {
  id: number;
  name: string;
  address: string;
  tel: string;
  fax: string;
  note: string;
  transit: string;
  map_lat: string;
  map_lng: string;
  sort_order: number;
  is_visible: number;
};

const toOffice = (r: RawOffice): Office => ({
  id: r.id,
  name: r.name,
  address: r.address,
  tel: r.tel,
  fax: r.fax,
  note: r.note,
  transit: r.transit,
  mapLat: r.map_lat,
  mapLng: r.map_lng,
  sortOrder: Number(r.sort_order),
  isVisible: Number(r.is_visible) === 1,
});

const OFFICE_SELECT = `SELECT id, name, address, tel, fax, note, transit,
                              map_lat, map_lng, sort_order, is_visible
                       FROM offices`;

export async function listOffices(includeHidden = false): Promise<Office[]> {
  const db = await ready();
  const rows = await db.all<RawOffice>(
    `${OFFICE_SELECT}${includeHidden ? "" : " WHERE is_visible = 1"} ORDER BY sort_order, id`,
  );
  return rows.map(toOffice);
}

type RawSite = {
  id: number;
  name: string;
  url: string;
  sort_order: number;
  is_visible: number;
};

const toSite = (r: RawSite): RelatedSite => ({
  id: r.id,
  name: r.name,
  url: r.url,
  sortOrder: Number(r.sort_order),
  isVisible: Number(r.is_visible) === 1,
});

/** 푸터 목록. 주소가 없는 기관은 눌러도 갈 곳이 없으므로 뺀다. */
export async function listRelatedSites(includeHidden = false): Promise<RelatedSite[]> {
  const db = await ready();
  const rows = await db.all<RawSite>(
    `SELECT id, name, url, sort_order, is_visible FROM related_sites
     ${includeHidden ? "" : "WHERE is_visible = 1 AND url <> ''"}
     ORDER BY sort_order, id`,
  );
  return rows.map(toSite);
}
