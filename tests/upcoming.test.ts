import { test } from "node:test";
import assert from "node:assert/strict";
import { pickUpcoming, type UpcomingEntry } from "../src/lib/upcoming.ts";

/* 메인 '다가오는 일정' — 행사·교육·사업공고 마감을 날짜 순으로 섞는다 */

const entry = (key: string, date: string, kind: UpcomingEntry["kind"]): UpcomingEntry => ({
  key,
  date,
  kind,
  title: key,
  href: "/",
});

test("행사·교육·공고 마감을 가까운 날짜부터 섞어 n 건만 둔다", () => {
  const picked = pickUpcoming(
    [
      entry("events-1", "2026-11-20", "행사"),
      entry("course-1", "2026-11-10", "교육"),
      entry("announce-1", "2026-11-15", "공고 마감"),
      entry("course-2", "2026-12-01", "교육"),
    ],
    "2026-11-03",
    3,
  );
  assert.deepEqual(
    picked.map((e) => e.key),
    ["course-1", "announce-1", "events-1"],
  );
});

test("오늘 일정은 넣고, 지난 일정은 뺀다", () => {
  const picked = pickUpcoming(
    [entry("events-old", "2026-11-02", "행사"), entry("course-today", "2026-11-03", "교육")],
    "2026-11-03",
    3,
  );
  assert.deepEqual(
    picked.map((e) => e.key),
    ["course-today"],
  );
});

test("같은 날은 차례가 흔들리지 않게 이름 순으로 둔다", () => {
  const picked = pickUpcoming(
    [entry("events-2", "2026-11-10", "행사"), entry("announce-9", "2026-11-10", "공고 마감")],
    "2026-11-03",
    3,
  );
  assert.deepEqual(
    picked.map((e) => e.key),
    ["announce-9", "events-2"],
  );
});
