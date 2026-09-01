"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { ready } from "@/lib/db/migrate";
import { now } from "@/lib/db/driver";

/* 관리자 화면과 내부 요청은 세지 않는다. */
const SKIP = ["/admin", "/api", "/login", "/signup"];

/*
  방문 기록. 화면이 실제로 열렸을 때 브라우저가 부른다.
  누가 왔는지는 남기지 않는다. IP·브라우저 정보는 날짜와 함께 해시로만 만들고
  원본은 저장하지 않으므로 날짜가 바뀌면 같은 사람도 다른 값이 된다.
*/
export async function recordVisit(rawPath: string): Promise<void> {
  const path = rawPath.split("?")[0].slice(0, 300);
  if (!path.startsWith("/") || SKIP.some((p) => path === p || path.startsWith(`${p}/`))) return;

  const stamp = now();
  const day = stamp.slice(0, 10);

  const head = await headers();
  const ip =
    head.get("x-forwarded-for")?.split(",")[0].trim() ?? head.get("x-real-ip") ?? "unknown";
  const agent = head.get("user-agent") ?? "";
  const visitor = createHash("sha256").update(`${day}|${ip}|${agent}`).digest("hex").slice(0, 32);

  try {
    const db = await ready();
    await db.run("INSERT INTO visits (day, path, visitor, created_at) VALUES (?, ?, ?, ?)", [
      day,
      path,
      visitor,
      stamp,
    ]);
  } catch {
    /* 통계 때문에 화면이 깨지면 안 된다 */
  }
}
