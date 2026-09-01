import "server-only";
import { ready } from "./migrate";
import { deleteUpload } from "@/lib/uploads";
import { isImageUsed } from "./image-usage";

/*
  글과 딸린 파일을 함께 지운다.
  게시판 상세 화면과 관리자 화면이 같은 정리 절차를 쓰도록 여기 모아 둔다.
  ("use server" 파일에 두면 이 함수까지 외부에서 호출 가능한 서버 액션이 된다)
*/
export async function deletePostsWithFiles(ids: number[]): Promise<number> {
  const targets = ids.filter((id) => Number.isInteger(id) && id > 0);
  if (targets.length === 0) return 0;

  const db = await ready();
  let removed = 0;

  for (const id of targets) {
    const attachments = await db.all<{ stored_name: string }>(
      "SELECT stored_name FROM attachments WHERE post_id = ?",
      [id],
    );
    const post = await db.get<{ body: string }>("SELECT body FROM posts WHERE id = ?", [id]);
    if (!post) continue;

    await db.run("DELETE FROM posts WHERE id = ?", [id]);
    removed += 1;

    for (const file of attachments) await deleteUpload(file.stored_name);
    await deleteOrphanImages(post.body);
  }

  return removed;
}

/*
  본문에 넣었던 이미지 정리.
  글을 지워도 이미지 파일은 남으므로, 다른 글이 쓰고 있지 않은 것만 함께 지운다.
*/
async function deleteOrphanImages(body: string): Promise<void> {
  const ids = [...body.matchAll(/\/api\/images\/(\d+)/g)].map((m) => Number(m[1]));
  if (ids.length === 0) return;

  const db = await ready();
  for (const imageId of new Set(ids)) {
    if (await isImageUsed(db, imageId)) continue;

    const image = await db.get<{ stored_name: string }>(
      "SELECT stored_name FROM images WHERE id = ?",
      [imageId],
    );
    if (!image) continue;

    await db.run("DELETE FROM images WHERE id = ?", [imageId]);
    await deleteUpload(image.stored_name);
  }
}
