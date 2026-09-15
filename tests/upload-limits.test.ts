import { test } from "node:test";
import assert from "node:assert/strict";
import { checkAttachmentSizes, MAX_FILE_BYTES, MAX_FILES_TOTAL_BYTES } from "../src/lib/upload-limits.ts";

/*
  게시글 첨부 크기 미리 알려 주기.
  틀리면 저장을 눌렀을 때 서버가 요청을 잘라 까닭 모를 오류가 나거나,
  올릴 수 있는 파일까지 막게 된다.
*/

const MB = 1024 * 1024;
const file = (name: string, mb: number) => ({ name, size: mb * MB });

test("한도 안이면 빈 문자열(통과)", () => {
  assert.equal(checkAttachmentSizes([]), "");
  assert.equal(checkAttachmentSizes([file("a.pdf", 3)]), "");
  assert.equal(checkAttachmentSizes([file("a.pdf", 12), file("b.pdf", 12)]), "");
});

test("파일 하나가 20MB 를 넘으면 그 파일 이름을 알려 준다", () => {
  assert.equal(checkAttachmentSizes([file("big.pdf", 21)]), "'big.pdf' 은(는) 20MB 를 넘어 올릴 수 없습니다.");
  /* 딱 20MB 는 된다 */
  assert.equal(checkAttachmentSizes([{ name: "edge.pdf", size: MAX_FILE_BYTES }]), "");
});

test("합쳐서 24MB 를 넘으면 나눠 올리라고 알려 준다", () => {
  assert.match(checkAttachmentSizes([file("a.bin", 13), file("b.bin", 12)]), /합쳐서 24MB/);
  /* 딱 24MB 는 된다 */
  assert.equal(
    checkAttachmentSizes([
      { name: "a.bin", size: MAX_FILES_TOTAL_BYTES / 2 },
      { name: "b.bin", size: MAX_FILES_TOTAL_BYTES / 2 },
    ]),
    "",
  );
});
