import { test } from "node:test";
import assert from "node:assert/strict";
import { isPublicAddress } from "../src/lib/remote-image.ts";

/*
  바깥 그림을 가져올 때 서버가 여는 주소.
  안쪽 주소를 열 수 있으면 관리자 계정 하나로 서버 안쪽(DB·메타데이터)을 들여다볼 수 있다.
*/
test("공인 주소만 연다", () => {
  assert.equal(isPublicAddress("211.115.106.70"), true);
  assert.equal(isPublicAddress("8.8.8.8"), true);
  assert.equal(isPublicAddress("2001:4860:4860::8888"), true);
});

test("루프백·사설망·링크로컬·예약 대역은 열지 않는다", () => {
  for (const ip of [
    "127.0.0.1",
    "10.1.2.3",
    "172.16.0.1",
    "172.31.255.255",
    "192.168.0.10",
    "169.254.169.254", // 클라우드 메타데이터
    "100.64.0.1",
    "0.0.0.0",
    "224.0.0.1",
    "::1",
    "::",
    "fc00::1",
    "fe80::1",
    "::ffff:127.0.0.1",
    "::ffff:10.0.0.1",
    "localhost",
  ]) {
    assert.equal(isPublicAddress(ip), false, ip);
  }
});
