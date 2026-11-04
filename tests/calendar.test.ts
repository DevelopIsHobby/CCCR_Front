import { test } from "node:test";
import assert from "node:assert/strict";
import {
  addMonths,
  applyCalendarSettings,
  entriesOn,
  firstPick,
  monthGrid,
  type CalendarEntry,
} from "../src/lib/calendar.ts";

/* 메인 '일정 달력' — 칸이 하루라도 밀리면 행사·마감을 엉뚱한 날에 보여 준다 */

const entry = (key: string, start: string, end = start): CalendarEntry => ({
  key,
  kind: "행사",
  title: key,
  href: "/",
  start,
  end,
});

test("달을 넘기면 해도 바뀐다", () => {
  assert.equal(addMonths("2026-11", 1), "2026-12");
  assert.equal(addMonths("2026-12", 1), "2027-01");
  assert.equal(addMonths("2026-01", -1), "2025-12");
});

test("2026년 11월은 일요일에 시작해 30일, 5줄이다", () => {
  const cells = monthGrid("2026-11");
  assert.equal(cells[0], "2026-11-01"); // 2026-11-01 은 일요일
  assert.equal(cells.filter(Boolean).length, 30);
  assert.equal(cells.length, 35);
  assert.equal(cells[29], "2026-11-30");
});

test("앞 빈칸은 그 달 1일의 요일만큼이다", () => {
  /* 2026-10-01 은 목요일 → 일·월·화·수 네 칸이 빈다 */
  const cells = monthGrid("2026-10");
  assert.deepEqual(cells.slice(0, 5), [null, null, null, null, "2026-10-01"]);
  assert.equal(cells.length % 7, 0);
});

test("여러 날 이어지는 일정은 기간 안의 모든 날에 걸친다", () => {
  const course = entry("교육", "2026-11-16", "2026-11-19");
  assert.equal(entriesOn([course], "2026-11-15").length, 0);
  assert.equal(entriesOn([course], "2026-11-16").length, 1);
  assert.equal(entriesOn([course], "2026-11-19").length, 1);
  assert.equal(entriesOn([course], "2026-11-20").length, 0);
});

test("처음 골라 둘 날: 오늘 일정이 있으면 오늘, 없으면 가장 가까운 다음 일정", () => {
  const list = [entry("a", "2026-11-20"), entry("b", "2026-11-10"), entry("old", "2026-10-01")];
  assert.equal(firstPick(list, "2026-11-03"), "2026-11-10");
  assert.equal(firstPick([...list, entry("now", "2026-11-01", "2026-11-05")], "2026-11-03"), "2026-11-03");
  assert.equal(firstPick([entry("old", "2026-10-01")], "2026-11-03"), "2026-11-03");
});

test("관리자 설정: 하나씩 숨긴 일정과 꺼 둔 종류는 빠진다", () => {
  const list: CalendarEntry[] = [
    entry("events-1", "2026-11-10"),
    { ...entry("course-2", "2026-11-12"), kind: "교육" },
    { ...entry("announce-3", "2026-11-14"), kind: "공고 마감" },
  ];
  assert.deepEqual(
    applyCalendarSettings(list, new Set(["events-1"]), new Set()).map((e) => e.key),
    ["course-2", "announce-3"],
  );
  assert.deepEqual(
    applyCalendarSettings(list, new Set(), new Set(["교육"])).map((e) => e.key),
    ["events-1", "announce-3"],
  );
});
