import "server-only";
import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import { ready } from "./migrate";
import { UPLOAD_DIR } from "@/lib/uploads";
import { BOARDS } from "@/lib/boards";

/*
  업로드 파일 현황.

  파일은 DB(첨부·이미지)와 디스크 두 곳에 나뉘어 있어서 서로 어긋날 수 있다.
  - 디스크에만 있는 파일: 지워도 되는 찌꺼기
  - DB 에만 있는 기록: 파일이 사라진 상태(내려받기가 깨진다)
  - 어느 글도 쓰지 않는 이미지: 지워도 되는 이미지
*/
export type FileRow = {
  id: number;
  kind: "attachment" | "image";
  filename: string;
  storedName: string;
  byteSize: number;
  createdAt: string;
  /** 어디에 쓰이는지. 없으면 안 쓰이는 파일이다. */
  usedIn: { title: string; href: string } | null;
  /** 디스크에 실제 파일이 있는지 */
  onDisk: boolean;
};

export type FileReport = {
  files: FileRow[];
  /** DB 기록 없이 디스크에만 있는 파일 */
  orphanFiles: { name: string; byteSize: number }[];
  totals: { count: number; bytes: number; unusedImages: number; missing: number };
};

async function diskFiles(): Promise<Map<string, number>> {
  const sizes = new Map<string, number>();
  try {
    for (const name of await readdir(UPLOAD_DIR)) {
      try {
        sizes.set(name, (await stat(join(UPLOAD_DIR, name))).size);
      } catch {
        /* 읽는 도중 사라진 파일은 건너뛴다 */
      }
    }
  } catch {
    /* 업로드 폴더가 아직 없으면 빈 목록 */
  }
  return sizes;
}

export async function getFileReport(): Promise<FileReport> {
  const db = await ready();
  const sizes = await diskFiles();
  const basePath = Object.fromEntries(BOARDS.map((b) => [b.slug, b.basePath]));

  const attachments = await db.all<{
    id: number;
    filename: string;
    stored_name: string;
    byte_size: number;
    created_at: string;
    post_id: number;
    title: string;
    board: string;
  }>(
    `SELECT a.id, a.filename, a.stored_name, a.byte_size, a.created_at,
            p.id AS post_id, p.title, p.board
       FROM attachments a JOIN posts p ON p.id = a.post_id
      ORDER BY a.id DESC`,
  );

  const images = await db.all<{
    id: number;
    filename: string;
    stored_name: string;
    byte_size: number;
    created_at: string;
    used: number;
    post_id: number | null;
    title: string | null;
    board: string | null;
  }>(
    `SELECT i.id, i.filename, i.stored_name, i.byte_size, i.created_at,
            (SELECT COUNT(*) FROM posts p WHERE p.body LIKE '%/api/images/' || i.id || '%') AS used,
            (SELECT p.id FROM posts p WHERE p.body LIKE '%/api/images/' || i.id || '%' LIMIT 1) AS post_id,
            (SELECT p.title FROM posts p WHERE p.body LIKE '%/api/images/' || i.id || '%' LIMIT 1) AS title,
            (SELECT p.board FROM posts p WHERE p.body LIKE '%/api/images/' || i.id || '%' LIMIT 1) AS board
       FROM images i
      ORDER BY i.id DESC`,
  );

  const files: FileRow[] = [
    ...attachments.map((a) => ({
      id: a.id,
      kind: "attachment" as const,
      filename: a.filename,
      storedName: a.stored_name,
      byteSize: Number(a.byte_size),
      createdAt: a.created_at,
      usedIn: { title: a.title, href: `${basePath[a.board] ?? "/board"}/${a.post_id}` },
      onDisk: sizes.has(a.stored_name),
    })),
    ...images.map((i) => ({
      id: i.id,
      kind: "image" as const,
      filename: i.filename,
      storedName: i.stored_name,
      byteSize: Number(i.byte_size),
      createdAt: i.created_at,
      usedIn:
        Number(i.used) > 0 && i.post_id
          ? { title: i.title ?? "(제목 없음)", href: `${basePath[i.board ?? ""] ?? "/board"}/${i.post_id}` }
          : null,
      onDisk: sizes.has(i.stored_name),
    })),
  ];

  const known = new Set(files.map((f) => f.storedName));
  const orphanFiles = [...sizes.entries()]
    .filter(([name]) => !known.has(name))
    .map(([name, byteSize]) => ({ name, byteSize }));

  return {
    files,
    orphanFiles,
    totals: {
      count: files.length,
      bytes:
        files.filter((f) => f.onDisk).reduce((n, f) => n + f.byteSize, 0) +
        orphanFiles.reduce((n, f) => n + f.byteSize, 0),
      unusedImages: files.filter((f) => f.kind === "image" && !f.usedIn).length,
      missing: files.filter((f) => !f.onDisk).length,
    },
  };
}
