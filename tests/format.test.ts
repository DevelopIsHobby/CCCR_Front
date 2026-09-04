import { test } from "node:test";
import assert from "node:assert/strict";
import {
  eventStatus,
  formatBytes,
  formatDate,
  formatDateTime,
  formatEventPeriod,
} from "../src/lib/format.ts";

/*
  표시용 변환.
  날짜를 잘못 자르면 행사 상태가 뒤집히고, 그러면 끝난 행사에 신청을 받게 된다.
  '오늘'을 넘겨 검사한다. 실제 오늘에 기대면 내일 깨지는 검사가 된다.
*/

test("DB 시각을 화면용 날짜로 자른다", () => {
  assert.equal(formatDate("2026-09-03 05:15:00"), "2026.09.03");
  assert.equal(formatDateTime("2026-09-03 05:15:00"), "2026.09.03 05:15");
});

test("용량은 단위를 바꿔 가며 읽기 좋게", () => {
  assert.equal(formatBytes(512), "512B");
  assert.equal(formatBytes(2048), "2KB");
  assert.equal(formatBytes(5 * 1024 * 1024), "5.0MB");
});

test("접수 마감이 남았으면 접수중", () => {
  const event = { startsOn: "2026-09-20", endsOn: "2026-09-22", applyBy: "2026-09-15" };
  assert.equal(eventStatus(event, "2026-09-03"), "접수중");
});

test("접수 마감일 당일도 접수중", () => {
  /* 여기서 한 칸 틀리면 마감일에 신청을 못 받는다 */
  const event = { startsOn: "2026-09-20", endsOn: "2026-09-22", applyBy: "2026-09-15" };
  assert.equal(eventStatus(event, "2026-09-15"), "접수중");
});

test("접수는 끝났고 행사는 남았으면 예정", () => {
  const event = { startsOn: "2026-09-20", endsOn: "2026-09-22", applyBy: "2026-09-15" };
  assert.equal(eventStatus(event, "2026-09-16"), "예정");
});

test("행사 마지막 날까지는 끝난 것이 아니다", () => {
  const event = { startsOn: "2026-09-20", endsOn: "2026-09-22", applyBy: null };
  assert.equal(eventStatus(event, "2026-09-22"), "예정");
  assert.equal(eventStatus(event, "2026-09-23"), "종료");
});

test("끝나는 날이 없으면 시작일을 기준으로 본다", () => {
  const event = { startsOn: "2026-09-20", endsOn: null, applyBy: null };
  assert.equal(eventStatus(event, "2026-09-20"), "예정");
  assert.equal(eventStatus(event, "2026-09-21"), "종료");
});

test("날짜가 하나도 없으면 상태를 매기지 않는다", () => {
  assert.equal(eventStatus({ startsOn: null, endsOn: null, applyBy: null }), null);
});

test("행사 기간은 같은 해면 뒷부분만 적는다", () => {
  assert.equal(formatEventPeriod("2026-09-09", "2026-09-11"), "2026.09.09 – 09.11");
  assert.equal(formatEventPeriod("2026-12-30", "2027-01-02"), "2026.12.30 – 2027.01.02");
  assert.equal(formatEventPeriod("2026-09-09", "2026-09-09"), "2026.09.09");
  assert.equal(formatEventPeriod("2026-09-09", null), "2026.09.09");
  assert.equal(formatEventPeriod(null, null), "");
});
