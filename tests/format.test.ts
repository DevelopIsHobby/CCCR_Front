import { test } from "node:test";
import assert from "node:assert/strict";
import {
  eventStatus,
  formatBytes,
  formatDate,
  formatDateTime,
  formatEventPeriod,
  kstDate,
  iga,
  ro,
  toKst,
} from "../src/lib/format.ts";

/*
  표시용 변환.
  날짜를 잘못 자르면 행사 상태가 뒤집히고, 그러면 끝난 행사에 신청을 받게 된다.
  '오늘'을 넘겨 검사한다. 실제 오늘에 기대면 내일 깨지는 검사가 된다.
*/

test("DB 시각(UTC)을 한국 시간 날짜·시각으로 보여 준다", () => {
  assert.equal(formatDate("2026-09-03 05:15:00"), "2026.09.03");
  assert.equal(formatDateTime("2026-09-03 05:15:00"), "2026.09.03 14:15");
});

test("한국 새벽에 쓴 글은 UTC 로는 전날이지만 한국 날짜로 보인다", () => {
  /* 한국 9월 4일 오전 7시 = UTC 9월 3일 22시. 예전에는 9월 3일로 찍혔다 */
  assert.equal(formatDate("2026-09-03 22:00:00"), "2026.09.04");
  assert.equal(formatDateTime("2026-09-03 22:00:00"), "2026.09.04 07:00");
});

test("날짜만 있는 값(행사 날짜)은 한국 날짜 그대로 둔다", () => {
  assert.equal(formatDate("2026-09-15"), "2026.09.15");
  assert.equal(toKst("2026-09-15"), "2026-09-15");
});

test("오늘 날짜는 한국 기준이다", () => {
  /* UTC 9월 14일 20시 = 한국 9월 15일 오전 5시 */
  assert.equal(kstDate(Date.parse("2026-09-14T20:00:00Z")), "2026-09-15");
  /* UTC 14:59:59 = 한국 23:59:59, 아직 같은 날 */
  assert.equal(kstDate(Date.parse("2026-09-14T14:59:59Z")), "2026-09-14");
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

/*
  한글 조사 고르기.

  게시판 이름은 관리자가 정하는 값이라 문구에 미리 적어 둘 수 없다.
  "산업뉴스(으)로" 처럼 괄호로 얼버무리면 읽는 사람이 한 번 걸린다.
*/
test("받침이 없거나 ㄹ 이면 '로', 있으면 '으로'", () => {
  assert.equal("산업뉴스" + ro("산업뉴스"), "산업뉴스로");   /* 받침 없음 */
  assert.equal("뉴스레터" + ro("뉴스레터"), "뉴스레터로");
  assert.equal("행사정보" + ro("행사정보"), "행사정보로");
  assert.equal("자료실" + ro("자료실"), "자료실로");         /* ㄹ 받침도 '로' */
  assert.equal("공지사항" + ro("공지사항"), "공지사항으로"); /* ㅇ 받침 */
  assert.equal("기술동향" + ro("기술동향"), "기술동향으로");
});

test("받침이 있으면 '이', 없으면 '가'", () => {
  assert.equal("본문" + iga("본문"), "본문이");
  assert.equal("행사일" + iga("행사일"), "행사일이");
  assert.equal("원문 주소" + iga("원문 주소"), "원문 주소가");
  assert.equal("표지 그림" + iga("표지 그림"), "표지 그림이");
});

test("한글이 아니면 괄호 형태로 물러선다", () => {
  /* 게시판 이름을 영문이나 숫자로 지을 수도 있다. 틀린 조사를 붙이는 것보다 낫다 */
  assert.equal(ro("Archive"), "(으)로");
  assert.equal(iga("2026"), "이(가)");
  assert.equal(ro(""), "(으)로");
});
