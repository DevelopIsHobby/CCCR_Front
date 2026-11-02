import { test } from "node:test";
import assert from "node:assert/strict";
import {
  courseStatus,
  daysBetween,
  formatRange,
  homeCourses,
  isDate,
  type EduCourse,
} from "../src/lib/edu-course.ts";

/*
  교육 과정 상태와 메인 차례.
  '오늘'을 넘겨 검사한다. 실제 오늘에 기대면 날이 지나면 깨지는 검사가 된다.
*/

const course = (id: number, applyFrom: string, applyUntil: string, extra: Partial<EduCourse> = {}): EduCourse => ({
  id,
  title: `과정 ${id}`,
  summary: "",
  href: "",
  posterUrl: "",
  applyFrom,
  applyUntil,
  startsOn: applyUntil,
  endsOn: applyUntil,
  isVisible: true,
  ...extra,
});

test("접수 시작 전·중·후를 가른다", () => {
  const c = course(1, "2026-09-21", "2026-11-13");
  assert.equal(courseStatus(c, "2026-09-20"), "접수예정");
  assert.equal(courseStatus(c, "2026-09-21"), "접수중");
  assert.equal(courseStatus(c, "2026-11-02"), "접수중");
  assert.equal(courseStatus(c, "2026-11-14"), "마감");
});

test("마감일 당일까지는 접수중이다", () => {
  /* 하루만 어긋나도 마감 당일에 신청하려는 분이 마감으로 보게 된다 */
  assert.equal(courseStatus(course(1, "2026-11-01", "2026-11-13"), "2026-11-13"), "접수중");
});

test("남은 날 수를 센다", () => {
  assert.equal(daysBetween("2026-11-02", "2026-11-13"), 11);
  assert.equal(daysBetween("2026-11-13", "2026-11-13"), 0);
  /* 달·해를 넘어도 맞아야 한다 */
  assert.equal(daysBetween("2026-12-30", "2027-01-02"), 3);
  assert.equal(daysBetween("2026-02-27", "2026-03-01"), 2);
});

test("메인에는 접수중을 마감 가까운 순서로, 그다음 접수예정을 보인다", () => {
  const today = "2026-11-02";
  const list = [
    course(1, "2026-07-02", "2026-07-24"), // 마감
    course(8, "2026-10-06", "2026-11-27"), // 접수중, 마감 늦음
    course(6, "2026-09-21", "2026-11-13"), // 접수중, 마감 가까움
    course(9, "2026-12-01", "2026-12-20"), // 접수예정
    course(7, "2026-09-28", "2026-11-20"), // 접수중
  ];
  assert.deepEqual(
    homeCourses(list, today).map((c) => c.id),
    [6, 7, 8, 9],
  );
});

test("숨긴 과정과 마감된 과정은 메인에 두지 않는다", () => {
  const today = "2026-11-02";
  const list = [
    course(1, "2026-07-02", "2026-07-24"),
    course(2, "2026-10-01", "2026-11-30", { isVisible: false }),
  ];
  assert.deepEqual(homeCourses(list, today), []);
});

test("메인에 보일 개수를 넘지 않는다", () => {
  const list = [1, 2, 3, 4, 5, 6].map((i) => course(i, "2026-10-01", `2026-11-${10 + i}`));
  assert.equal(homeCourses(list, "2026-11-02", 4).length, 4);
});

test("기간을 짧게 적는다", () => {
  assert.equal(formatRange("2026-11-16", "2026-11-19"), "11.16 ~ 11.19");
  assert.equal(formatRange("2026-11-30", "2026-12-09"), "11.30 ~ 12.9");
  assert.equal(formatRange("2026-12-28", "2027-01-03"), "2026.12.28 ~ 2027.01.03");
  assert.equal(formatRange("2026-11-20", "2026-11-20"), "11.20");
});

test("날짜 꼴과 없는 날을 걸러낸다", () => {
  assert.equal(isDate("2026-11-13"), true);
  assert.equal(isDate("2026-02-30"), false);
  assert.equal(isDate("2026-1-3"), false);
  assert.equal(isDate(""), false);
});
