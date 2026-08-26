import { createReadStream, statSync } from "node:fs";
import { join } from "node:path";
import { Readable } from "node:stream";
import { ready } from "@/lib/db/migrate";
import { getSession } from "@/lib/auth/session";
import { UPLOAD_DIR, safeStoredName } from "@/lib/uploads";

/*
  첨부파일 내려받기.
  파일이 public/ 밖에 있으므로 여기서 잠금글 권한을 확인한 뒤에 흘려보낸다.
*/
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const db = await ready();
  const row = await db.get<{
    filename: string;
    stored_name: string;
    mime_type: string;
    is_locked: number;
  }>(
    `SELECT a.filename, a.stored_name, a.mime_type, p.is_locked
       FROM attachments a JOIN posts p ON p.id = a.post_id
      WHERE a.id = ?`,
    [Number(id)],
  );

  if (!row) {
    return new Response("파일을 찾을 수 없습니다.", { status: 404 });
  }

  if (Number(row.is_locked) === 1 && !(await getSession())) {
    return new Response("회원 전용 게시물의 첨부파일입니다.", { status: 403 });
  }

  let stored: string;
  let size: number;
  try {
    stored = safeStoredName(row.stored_name);
    size = statSync(join(UPLOAD_DIR, stored)).size;
  } catch {
    return new Response("파일을 찾을 수 없습니다.", { status: 404 });
  }

  const stream = Readable.toWeb(
    createReadStream(join(UPLOAD_DIR, stored)),
  ) as ReadableStream<Uint8Array>;

  /* 한글 파일명을 위해 filename* (RFC 5987) 로 넘긴다. */
  const encoded = encodeURIComponent(row.filename);

  return new Response(stream, {
    headers: {
      "Content-Type": row.mime_type,
      "Content-Length": String(size),
      "Content-Disposition": `attachment; filename="${encoded}"; filename*=UTF-8''${encoded}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
