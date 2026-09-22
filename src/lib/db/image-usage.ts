import "server-only";
import type { Driver } from "./driver";

/*
  이미지가 어딘가에 쓰이고 있는지 보는 기준을 한곳에 모은다.
  본문 이미지 말고도 이사장 사진(page_texts)과 회원사 로고(companies)가
  같은 저장소를 쓰므로, 이 셋을 모두 보지 않으면 "안 쓰는 이미지"를 정리할 때
  화면에 걸려 있는 그림이 지워진다.
*/

/*
  SQL 안에서 쓰는 조건. idExpr 은 이미지 id 를 가리키는 식이다.

  여기는 일부러 경계(따옴표)를 두지 않는다. 아래 imageIsMembersOnly 와 다른 점인데,
  두 검사가 틀렸을 때 가는 방향이 반대이기 때문이다.
    - 여기(쓰이는지)  : 틀리면 안 쓰는 그림을 남긴다 — 파일이 남을 뿐 해가 없다
    - 회원 전용 판정  : 틀리면 막아야 할 그림을 열어 준다 — 그래서 경계를 둔다
  본문에 그림이 아니라 글자로 주소를 적어 둔 경우까지 '쓰인다'고 보려면 느슨한 편이 낫다.
  합치지 말 것.
*/
export const imageUsedSql = (idExpr: string) => `(
  EXISTS (SELECT 1 FROM posts p WHERE p.deleted_at = '' AND p.body LIKE '%/api/images/' || ${idExpr} || '%')
  OR EXISTS (SELECT 1 FROM page_texts t WHERE t.value = '/api/images/' || ${idExpr})
  OR EXISTS (SELECT 1 FROM companies c WHERE c.logo_url = '/api/images/' || ${idExpr})
  OR EXISTS (SELECT 1 FROM popups pu WHERE pu.image_url = '/api/images/' || ${idExpr})
)`;

/*
  회원 전용 글에서만 쓰이는 그림인지.

  본문 그림은 주소(/api/images/숫자)만 알면 누구나 받을 수 있다. 번호가 1씩 늘어나므로
  훑어 가며 받아 볼 수도 있다. 공개 글의 그림이나 회원사 로고는 그래도 되지만,
  회원 전용 글에 넣은 그림은 본문을 막아 놓고 그림만 새어 나가는 꼴이 된다.

  공개된 자리(공개 글·소개 화면·회원사 로고·팝업)에 한 번이라도 쓰이면 공개로 본다.
  그런 자리가 하나도 없고 잠근 글에만 있으면 로그인한 사람에게만 내보낸다.

  본문 훑기(LIKE '%…%')는 PostgreSQL 에서 034 의 trigram 색인을 탄다(찾는 글자가
  세 자를 넘는다). SQLite 는 개발용이라 글이 얼마 없다.
*/
export async function imageIsMembersOnly(db: Driver, id: number): Promise<boolean> {
  const url = `/api/images/${id}`;
  /*
    본문에서는 끝의 따옴표까지 붙여 찾는다. 저장된 모양이 늘 src="/api/images/5" 라
    따옴표가 경계가 된다. 이것을 빼면 5 를 찾을 때 55·512 까지 걸려, 55 가 공개 글에
    있다는 이유로 5 가 공개로 잘못 판정된다. 막아야 할 것을 열어 주는 쪽으로 틀리므로
    여기서는 반드시 경계를 둔다.
  */
  const like = `%${url}\"%`;

  const row = await db.get<{ locked: number; open: number }>(
    `SELECT
       (SELECT COUNT(*) FROM posts
          WHERE deleted_at = '' AND is_locked = 1 AND LOWER(body) LIKE ?) AS locked,
       (SELECT COUNT(*) FROM posts
          WHERE deleted_at = '' AND is_locked = 0 AND LOWER(body) LIKE ?)
       + (SELECT COUNT(*) FROM page_texts WHERE value = ?)
       + (SELECT COUNT(*) FROM companies WHERE logo_url = ?)
       + (SELECT COUNT(*) FROM popups WHERE image_url = ?) AS open`,
    [like, like, url, url, url],
  );

  return Number(row?.locked ?? 0) > 0 && Number(row?.open ?? 0) === 0;
}

/** 지우기 전에 확인할 때 쓴다. */
export async function isImageUsed(db: Driver, id: number): Promise<boolean> {
  const url = `/api/images/${id}`;
  const row = await db.get<{ n: number }>(
    `SELECT
       (SELECT COUNT(*) FROM posts WHERE body LIKE ?)
       + (SELECT COUNT(*) FROM page_texts WHERE value = ?)
       + (SELECT COUNT(*) FROM companies WHERE logo_url = ?)
       + (SELECT COUNT(*) FROM popups WHERE image_url = ?) AS n`,
    [`%${url}%`, url, url, url],
  );
  return Number(row?.n ?? 0) > 0;
}
