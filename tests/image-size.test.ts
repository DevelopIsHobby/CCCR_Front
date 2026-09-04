import { test } from "node:test";
import assert from "node:assert/strict";
import { readImageSize } from "../src/lib/image-size.ts";

/*
  그림 크기 읽기.

  틀리면 화면이 엉뚱한 비율로 자리를 잡아 오히려 더 튄다. 형식마다 크기를
  적어 두는 자리가 달라 하나씩 확인한다. 실제 파일 앞머리를 손으로 만들어 쓴다.
*/

function png(w: number, h: number): Buffer {
  const b = Buffer.alloc(24);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(b, 0);
  b.writeUInt32BE(13, 8);
  b.write("IHDR", 12, "latin1");
  b.writeUInt32BE(w, 16);
  b.writeUInt32BE(h, 20);
  return b;
}

function gif(w: number, h: number): Buffer {
  const b = Buffer.alloc(10);
  b.write("GIF89a", 0, "latin1");
  b.writeUInt16LE(w, 6);
  b.writeUInt16LE(h, 8);
  return b;
}

/** SOF0 앞에 다른 구역(APP0)을 끼워 마커를 건너뛰는지 함께 본다. */
function jpeg(w: number, h: number): Buffer {
  const app0 = Buffer.alloc(18);
  app0.writeUInt16BE(0xffe0, 0);
  app0.writeUInt16BE(16, 2);
  app0.write("JFIF", 4, "latin1");

  const sof = Buffer.alloc(11);
  sof.writeUInt16BE(0xffc0, 0);
  sof.writeUInt16BE(9, 2);
  sof[4] = 8;
  sof.writeUInt16BE(h, 5);
  sof.writeUInt16BE(w, 7);

  return Buffer.concat([Buffer.from([0xff, 0xd8]), app0, sof, Buffer.alloc(8)]);
}

test("PNG 크기를 읽는다", () => {
  assert.deepEqual(readImageSize(png(1200, 630), "image/png"), { width: 1200, height: 630 });
});

test("GIF 크기를 읽는다", () => {
  assert.deepEqual(readImageSize(gif(320, 240), "image/gif"), { width: 320, height: 240 });
});

test("JPEG 는 앞 구역을 건너뛰고 찾는다", () => {
  /* 실제 사진은 EXIF·섬네일이 앞에 붙어 있어 한 번에 못 읽는다 */
  assert.deepEqual(readImageSize(jpeg(800, 1200), "image/jpeg"), { width: 800, height: 1200 });
});

test("세로로 긴 뉴스레터도 그대로 읽는다", () => {
  assert.deepEqual(readImageSize(png(800, 4000), "image/png"), { width: 800, height: 4000 });
});

test("못 읽으면 null 이지 엉뚱한 값이 아니다", () => {
  assert.equal(readImageSize(Buffer.alloc(4), "image/png"), null, "너무 짧은 파일");
  assert.equal(readImageSize(png(100, 100), "image/svg+xml"), null, "다루지 않는 형식");
  assert.equal(readImageSize(Buffer.from([0xff, 0xd8, 0, 0, 0, 0]), "image/jpeg"), null);
});

test("0 이나 터무니없는 값은 못 읽은 것으로 친다", () => {
  assert.equal(readImageSize(png(0, 100), "image/png"), null);
  assert.equal(readImageSize(png(200000, 100), "image/png"), null);
});
