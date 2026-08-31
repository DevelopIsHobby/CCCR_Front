import { createReadStream, statSync } from "node:fs";
import { join } from "node:path";
import { Readable } from "node:stream";
import { ready } from "@/lib/db/migrate";
import { UPLOAD_DIR, safeStoredName } from "@/lib/uploads";

/*
  본문 이미지. 첨부파일과 달리 화면에 바로 그려져야 하므로
  Content-Disposition 없이 내보낸다. 대신 이미지 형식만 허용한다.
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
      /* 본문 이미지는 주소가 바뀌지 않으므로 오래 캐시해도 된다. */
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
