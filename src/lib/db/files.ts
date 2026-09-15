import "server-only";
import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import { ready } from "./migrate";
import { UPLOAD_DIR } from "@/lib/uploads";
import { BOARDS } from "@/lib/boards";
import { mapImageUses, type ImageUse } from "@/lib/image-uses";

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

type RawImageRef = {
  company: string | null;
  page_key: string | null;
};

/** 이미지가 어디에 걸려 있는지 한 곳만 골라 알려 준다. 글 본문이 먼저다. */
function imageUsedIn(
  post: ImageUse | undefined,
  ref: RawImageRef,
  basePath: Record<string, string>,
): { title: string; href: string } | null {
  if (post) {
    return {
      title: post.title || "(제목 없음)",
      href: `${basePath[post.board] ?? "/board"}/${post.postId}`,
    };
  }
  if (ref.company) return { title: `회원사 로고 · ${ref.company}`, href: "/admin/companies" };
  if (ref.page_key) return { title: "소개 페이지", href: "/admin/pages" };
  return null;
}

export async function getFileReport(): Promise<FileReport> {
  const db = await ready();
  const basePath = Object.fromEntries(BOARDS.map((b) => [b.slug, b.basePath]));

  /* 서로 기다릴 일이 없다. 줄 세우면 그만큼 왕복이 늘어난다. */
  const [sizes, attachments, images, postBodies] = await Promise.all([
    diskFiles(),
    db.all<{
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
    ),
    /* 회원사 로고·소개 페이지 사진은 주소가 통째로 같아 등호로 찾는다(표도 작다) */
    db.all<{
      id: number;
      filename: string;
      stored_name: string;
      byte_size: number;
      created_at: string;
      company: string | null;
      page_key: string | null;
    }>(
      `SELECT i.id, i.filename, i.stored_name, i.byte_size, i.created_at,
              (SELECT c.name FROM companies c WHERE c.logo_url = '/api/images/' || i.id LIMIT 1) AS company,
              (SELECT t.key FROM page_texts t WHERE t.value = '/api/images/' || i.id LIMIT 1) AS page_key
         FROM images i
        ORDER BY i.id DESC`,
    ),
    /*
      글 본문은 그림 주소가 들어 있는 글만 한 번 읽는다. 그림마다 모든 본문을 훑으면
      글이 쌓일수록 느려지고, 1번 그림이 11번 주소에 걸리는 문제도 있었다(image-uses.ts).
    */
    db.all<{ id: number; title: string; board: string; body: string | null }>(
      "SELECT id, title, board, body FROM posts WHERE body LIKE '%/api/images/%'",
    ),
  ]);
  const uses = mapImageUses(postBodies.map((p) => ({ ...p, id: Number(p.id) })));

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
      /* 글 본문 말고 회원사 로고·소개 페이지 사진으로도 쓰인다 */
      usedIn: imageUsedIn(uses.get(Number(i.id)), i, basePath),
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
