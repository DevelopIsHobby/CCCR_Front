import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { extname, join, resolve } from "node:path";

/*
  첨부파일은 public/ 이 아니라 서버 디렉터리에 둔다.
  잠금글 첨부를 URL 만으로 내려받지 못하게 하려면 권한 검사를 거쳐야 하기 때문이다.
*/
export const UPLOAD_DIR = resolve(process.env.UPLOAD_DIR ?? "data/uploads");

export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024; // 20MB

/* 실행 가능한 확장자는 받지 않는다. */
const BLOCKED_EXT = new Set([
  ".exe", ".bat", ".cmd", ".com", ".cpl", ".dll", ".js", ".jse", ".msi", ".ps1",
  ".scr", ".sh", ".vb", ".vbs", ".wsf", ".jar", ".php", ".asp", ".aspx", ".jsp",
]);

export async function saveUpload(file: File) {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`첨부파일은 ${MAX_UPLOAD_BYTES / 1024 / 1024}MB 이하만 올릴 수 있습니다.`);
  }

  const ext = extname(file.name).toLowerCase();
  if (BLOCKED_EXT.has(ext)) {
    throw new Error(`${ext} 형식은 첨부할 수 없습니다.`);
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  /* 저장 이름은 서버가 정한다. 원본 이름은 DB 에만 남긴다. */
  const storedName = `${randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(join(UPLOAD_DIR, storedName), buffer);

  return {
    filename: file.name,
    storedName,
    byteSize: file.size,
    mimeType: file.type || "application/octet-stream",
  };
}

export async function deleteUpload(storedName: string): Promise<void> {
  try {
    await unlink(join(UPLOAD_DIR, safeStoredName(storedName)));
  } catch {
    /* 파일이 이미 없으면 넘어간다. */
  }
}

export function openUpload(storedName: string) {
  return createReadStream(join(UPLOAD_DIR, safeStoredName(storedName)));
}

/** 경로 조작(../)을 막는다. stored_name 은 UUID + 확장자 형태만 허용한다. */
export function safeStoredName(storedName: string): string {
  if (!/^[0-9a-f-]{36}(\.[A-Za-z0-9]{1,10})?$/.test(storedName)) {
    throw new Error("잘못된 파일 이름입니다.");
  }
  return storedName;
}
