import "server-only";
import type { Driver } from "./driver";

/*
  이미지가 어딘가에 쓰이고 있는지 보는 기준을 한곳에 모은다.
  본문 이미지 말고도 이사장 사진(page_texts)과 회원사 로고(companies)가
  같은 저장소를 쓰므로, 이 셋을 모두 보지 않으면 "안 쓰는 이미지"를 정리할 때
  화면에 걸려 있는 그림이 지워진다.
*/

/** SQL 안에서 쓰는 조건. idExpr 은 이미지 id 를 가리키는 식이다. */
export const imageUsedSql = (idExpr: string) => `(
  EXISTS (SELECT 1 FROM posts p WHERE p.deleted_at = '' AND p.body LIKE '%/api/images/' || ${idExpr} || '%')
  OR EXISTS (SELECT 1 FROM page_texts t WHERE t.value = '/api/images/' || ${idExpr})
  OR EXISTS (SELECT 1 FROM companies c WHERE c.logo_url = '/api/images/' || ${idExpr})
  OR EXISTS (SELECT 1 FROM promo_requests r WHERE r.deleted_at = '' AND r.image_id = ${idExpr})
  OR EXISTS (SELECT 1 FROM popups pu WHERE pu.image_url = '/api/images/' || ${idExpr})
)`;

/** 지우기 전에 확인할 때 쓴다. */
export async function isImageUsed(db: Driver, id: number): Promise<boolean> {
  const url = `/api/images/${id}`;
  const row = await db.get<{ n: number }>(
    `SELECT
       (SELECT COUNT(*) FROM posts WHERE body LIKE ?)
       + (SELECT COUNT(*) FROM page_texts WHERE value = ?)
       + (SELECT COUNT(*) FROM companies WHERE logo_url = ?)
       + (SELECT COUNT(*) FROM promo_requests WHERE image_id = ?)
       + (SELECT COUNT(*) FROM popups WHERE image_url = ?) AS n`,
    [`%${url}%`, url, url, id, url],
  );
  return Number(row?.n ?? 0) > 0;
}
