import { test } from "node:test";
import assert from "node:assert/strict";
import { isStartBlocked, isEndBlocked, ROOM_LABEL, type BusySlot } from "../src/lib/room-types.ts";

/*
  회의실 시간 겹침.

  여기가 틀리면 같은 시간에 두 건이 잡힌다. 사람이 두 팀 와서 문 앞에서
  마주치는 일이라 되돌릴 수가 없다. 경계값을 특히 꼼꼼히 본다.
*/

/* 10~12시가 이미 잡혀 있는 상황 */
const busy: BusySlot[] = [
  { startTime: "10:00", endTime: "12:00", kind: "reserved", label: "다른 신청" },
];

test("바쁜 구간 안에서는 시작할 수 없다", () => {
  assert.ok(isStartBlocked("10:00", busy), "시작 시각과 같으면 막혀야 한다");
  assert.ok(isStartBlocked("11:00", busy), "한가운데면 막혀야 한다");
});

test("바쁜 구간이 끝나는 시각에는 시작할 수 있다", () => {
  /* 12시에 끝나면 12시부터는 비어 있다. 여기서 한 칸 틀리면 예약이 하나씩 밀린다. */
  assert.equal(isStartBlocked("12:00", busy), null);
});

test("바쁜 구간 밖에서는 시작할 수 있다", () => {
  assert.equal(isStartBlocked("09:00", busy), null);
  assert.equal(isStartBlocked("13:00", busy), null);
});

test("시작과 끝 사이에 바쁜 구간이 끼면 그 끝 시각은 고를 수 없다", () => {
  /* 9시에 시작해 13시에 끝내면 10~12시를 통째로 삼킨다 */
  assert.ok(isEndBlocked("09:00", "13:00", busy));
});

test("바쁜 구간에 닿지 않으면 끝낼 수 있다", () => {
  assert.equal(isEndBlocked("08:00", "10:00", busy), null, "바쁜 구간 직전에 끝나는 것은 된다");
  assert.equal(isEndBlocked("12:00", "14:00", busy), null, "바쁜 구간 직후에 시작하는 것은 된다");
});

test("끝이 시작보다 빠르면 막지 않는다 (다른 검사가 걸러낸다)", () => {
  assert.equal(isEndBlocked("13:00", "11:00", busy), null);
});

test("회의실 이름이 두 곳 모두 있다", () => {
  assert.equal(ROOM_LABEL.large, "대회의실");
  assert.equal(ROOM_LABEL.small, "소회의실");
});
