import { createReadStream, statSync } from "node:fs";
import { join } from "node:path";
import { Readable } from "node:stream";
import { ready } from "@/lib/db/migrate";
import { getSession } from "@/lib/auth/session";
import { imageIsMembersOnly } from "@/lib/db/image-usage";
import { UPLOAD_DIR, safeStoredName } from "@/lib/uploads";

/*
  본문 이미지. 첨부파일과 달리 화면에 바로 그려져야 하므로
  Content-Disposition 없이 내보낸다. 대신 이미지 형식만 허용한다.

  회원 전용 글에만 들어 있는 그림은 로그인해야 받을 수 있다. 첨부파일은 이미 그렇게
  막고 있는데 본문 그림은 열려 있어서, 본문을 막아 놓고 그림만 새어 나갔다.
  주소가 /api/images/숫자 라 번호를 훑으면 다 받아 갈 수도 있었다.
*/
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const db = await ready();
  const row = await db.get<{ stored_name: string; mime_type: string }>(
    "SELECT stored_name, mime_type FROM images WHERE id = ?",
    [Number(id)],
  );

  if (!row || !row.mime_type.startsWith("image/")) {
    return new Response("이미지를 찾을 수 없습니다.", { status: 404 });
  }

  /* 회원 전용 글에만 들어 있는 그림인지 */
  const membersOnly = await imageIsMembersOnly(db, Number(id));
  if (membersOnly && !(await getSession())) {
    return new Response("회원 전용 게시물의 이미지입니다.", { status: 403 });
  }

  let stored: string;
  let size: number;
  try {
    stored = safeStoredName(row.stored_name);
    size = statSync(join(UPLOAD_DIR, stored)).size;
  } catch {
    return new Response("이미지를 찾을 수 없습니다.", { status: 404 });
  }

  const stream = Readable.toWeb(
    createReadStream(join(UPLOAD_DIR, stored)),
  ) as ReadableStream<Uint8Array>;

  return new Response(stream, {
    headers: {
      "Content-Type": row.mime_type,
      "Content-Length": String(size),
      /*
        본문 이미지는 주소가 바뀌지 않으므로 오래 캐시해도 된다.
        다만 회원 전용 그림은 중간의 캐시(프록시 등)가 남에게 건네면 안 되므로
        저장하지 말라고 한다.
      */
      "Cache-Control": membersOnly
        ? "private, no-store"
        : "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
