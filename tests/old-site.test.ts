import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { buildOldSiteRedirects, oldSiteHomeUrl } from "../src/lib/old-site.ts";

/*
  옛 홈페이지 넘겨주기.
  보관 주소를 정하기 전에는 새 화면·새 게시판으로, 정한 뒤에는 옛 글이 보관 주소에서 열리게.
*/

const saved = process.env.OLD_SITE_ORIGIN;
afterEach(() => {
  if (saved === undefined) delete process.env.OLD_SITE_ORIGIN;
  else process.env.OLD_SITE_ORIGIN = saved;
});

test("보관 주소를 정하지 않으면 지난 자료 링크는 지금 주소", () => {
  delete process.env.OLD_SITE_ORIGIN;
  assert.equal(oldSiteHomeUrl(), "http://www.cccr.or.kr/home/");
});

test("보관 주소를 정하면 지난 자료 링크도 그리로 (끝의 / 는 한 번만)", () => {
  process.env.OLD_SITE_ORIGIN = "http://archive.cccr.or.kr/";
  assert.equal(oldSiteHomeUrl(), "http://archive.cccr.or.kr/home/");
});

test("보관 주소가 없으면 옛 게시판을 새 게시판으로 보낸다", () => {
  const rules = buildOldSiteRedirects("");
  const notice = rules.find(
    (r) => r.source === "/home/board/detailview.php" && r.has?.[0].value === "sub10",
  );
  assert.equal(notice?.destination, "/board/notice");
  assert.ok(!rules.some((r) => r.destination.startsWith("http")));
});

test("보관 주소가 있으면 소개 화면은 새 화면, 나머지는 보관 주소의 같은 자리로", () => {
  const rules = buildOldSiteRedirects("http://archive.cccr.or.kr");
  assert.equal(rules.find((r) => r.source === "/home/sub01/sub01_greeting.php")?.destination, "/about/greeting");

  const last = rules.at(-1)!;
  assert.equal(last.source, "/home/:path*");
  assert.equal(last.destination, "http://archive.cccr.or.kr/home/:path*");
  assert.equal(last.permanent, false);

  /* 소개 화면 규칙이 보관 주소 규칙보다 앞에 있어야 먼저 걸린다 */
  const greetingIndex = rules.findIndex((r) => r.source === "/home/sub01/sub01_greeting.php");
  assert.ok(greetingIndex < rules.length - 1);
  assert.ok(!rules.some((r) => r.source === "/home/board/detailview.php"));
});
