import { createReadStream, statSync } from "node:fs";
import { join } from "node:path";
import { Readable } from "node:stream";
import { getSession } from "@/lib/auth/session";
import { getPromoFile } from "@/lib/db/promos";
import { UPLOAD_DIR, safeStoredName } from "@/lib/uploads";

/*
  홍보 신청에 붙은 첨부 내려받기.
  밖에서 올린 파일이라 주소만으로는 열리지 않게 관리자만 통과시킨다.
*/
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (session?.role !== "admin") {
    return new Response("관리자만 내려받을 수 있습니다.", { status: 403 });
  }

  const { id } = await params;
  const file = await getPromoFile(Number(id));
  if (!file) return new Response("첨부를 찾을 수 없습니다.", { status: 404 });

  let stored: string;
  let size: number;
  try {
    stored = safeStoredName(file.storedName);
    size = statSync(join(UPLOAD_DIR, stored)).size;
  } catch {
    return new Response("첨부를 찾을 수 없습니다.", { status: 404 });
  }

  const stream = Readable.toWeb(
    createReadStream(join(UPLOAD_DIR, stored)),
  ) as ReadableStream<Uint8Array>;

  return new Response(stream, {
    headers: {
      "Content-Type": file.mimeType,
      "Content-Length": String(size),
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(file.filename)}`,
      "Cache-Control": "no-store",
    },
  });
}
