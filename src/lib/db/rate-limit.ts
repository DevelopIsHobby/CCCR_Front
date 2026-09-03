import "server-only";
import { headers } from "next/headers";
import { ready } from "./migrate";
import { now } from "./driver";

/*
  횟수 제한.

  로그인 비밀번호를 기계로 계속 넣어보는 것과, 신청 폼을 스크립트로 쏟아붓는
  것을 막는다. 봇 잡는 빈 칸(honeypot)은 아무 생각 없는 자동입력만 걸러낼 뿐이다.

  세는 곳은 DB 다. 메모리에 두면 서버가 여럿이거나 다시 뜰 때 셈이 사라진다.
*/

/** 요청을 보낸 곳. 프록시 뒤에 있으므로 X-Forwarded-For 를 먼저 본다. */
export async function clientKey(): Promise<string> {
  const head = await headers();
  const forwarded = head.get("x-forwarded-for") ?? "";
  const ip = forwarded.split(",")[0].trim() || head.get("x-real-ip") || "unknown";
  return ip.slice(0, 60);
}

/** 창(window) 안에 남은 기록 수를 센다. */
async function countRecent(scope: string, key: string, windowSec: number): Promise<number> {
  const db = await ready();
  const since = new Date(Date.now() - windowSec * 1000).toISOString().slice(0, 19).replace("T", " ");

  const row = await db.get<{ n: number }>(
    "SELECT COUNT(*) AS n FROM rate_events WHERE scope = ? AND key = ? AND created_at > ?",
    [scope, key, since],
  );
  return Number(row?.n ?? 0);
}

export async function record(scope: string, key: string): Promise<void> {
  const db = await ready();
  await db.run("INSERT INTO rate_events (scope, key, created_at) VALUES (?, ?, ?)", [
    scope,
    key,
    now(),
  ]);
}

/** 너무 잦으면 true. 넘었을 때는 기록을 더 남기지 않는다. */
export async function tooMany(
  scope: string,
  key: string,
  limit: number,
  windowSec: number,
): Promise<boolean> {
  return (await countRecent(scope, key, windowSec)) >= limit;
}

/** 성공했을 때 그 열쇠의 기록을 지운다. 옳게 들어온 사람을 계속 세지 않는다. */
export async function clear(scope: string, key: string): Promise<void> {
  const db = await ready();
  await db.run("DELETE FROM rate_events WHERE scope = ? AND key = ?", [scope, key]);
}

/* ── 곳곳에서 쓰는 기준 ───────────────────────────── */

/** 로그인: 한 계정에 10분 동안 5번까지. */
export const LOGIN = { limit: 5, windowSec: 600 };

/** 신청 접수: 한 곳에서 10분 동안 5건까지. */
export const SUBMIT = { limit: 5, windowSec: 600 };

/** 비밀번호 재설정 요청: 한 곳에서 1시간 동안 5번까지. */
export const RESET = { limit: 5, windowSec: 3600 };
