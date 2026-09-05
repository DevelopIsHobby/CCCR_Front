import "server-only";
import { ready } from "./migrate";
import { softDelete } from "./trash";

/*
  글을 휴지통으로 보낸다.

  전에는 여기서 글과 파일을 함께 진짜로 지웠다. 한 줄 잘못 눌러 지우면 되돌릴
  길이 없었다. 이제는 지운 표시만 하고 30일 뒤 야간 정리가 진짜로 지운다.
  그래서 딸린 파일도 그때까지 그대로 둔다. 되살렸는데 첨부만 없으면 안 된다.

  게시판 상세 화면과 관리자 화면이 같은 절차를 쓰도록 여기 모아 둔다.
  ("use server" 파일에 두면 이 함수까지 외부에서 호출 가능한 서버 액션이 된다)
*/
export async function deletePostsWithFiles(ids: number[]): Promise<number> {
  const targets = ids.filter((id) => Number.isInteger(id) && id > 0);
  if (targets.length === 0) return 0;

  let removed = 0;
  for (const id of targets) {
    const db = await ready();
    const post = await db.get<{ id: number }>(
      "SELECT id FROM posts WHERE id = ? AND deleted_at = ''",
      [id],
    );
    if (!post) continue;

    await softDelete("post", id);
    removed += 1;
  }

  return removed;
}
