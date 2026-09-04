/*
  올린 그림의 가로·세로를 파일 앞머리에서 읽는다.

  라이브러리를 쓰지 않는다. 우리가 받는 형식은 네 가지뿐이고, 넷 다 앞쪽 몇십
  바이트에 크기가 적혀 있다. 그림 처리 라이브러리는 대개 네이티브 모듈을 끼고
  있어 서버를 옮길 때 골칫거리가 된다.

  크기를 아는 이유는 화면이 튀지 않게 하기 위해서다. 브라우저가 그림 크기를
  미리 모르면 자리를 못 잡아, 그림이 뜰 때마다 아래 내용이 밀린다.
  뉴스레터처럼 큰 그림을 세로로 늘어놓는 화면에서 특히 심하다.
*/

export type ImageSize = { width: number; height: number };

/** PNG — 8바이트 서명 뒤 IHDR 청크에 가로·세로가 4바이트씩 들어 있다. */
function png(b: Buffer): ImageSize | null {
  if (b.length < 24) return null;
  if (b.readUInt32BE(12) !== 0x49484452) return null; // 'IHDR'
  return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
}

/** GIF — 6바이트 서명 뒤 가로·세로가 2바이트씩, 낮은 자리 먼저. */
function gif(b: Buffer): ImageSize | null {
  if (b.length < 10) return null;
  return { width: b.readUInt16LE(6), height: b.readUInt16LE(8) };
}

/** WEBP — RIFF 컨테이너. VP8 · VP8L · VP8X 세 갈래가 크기를 다르게 적는다. */
function webp(b: Buffer): ImageSize | null {
  if (b.length < 30) return null;
  const kind = b.subarray(12, 16).toString("latin1");

  if (kind === "VP8 ") {
    /* 손실 압축. 프레임 태그 뒤 14바이트째부터 14비트씩. */
    return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff };
  }
  if (kind === "VP8L") {
    /* 무손실. 21비트에 (가로-1, 세로-1)이 눌려 들어 있다. */
    const bits = b.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (kind === "VP8X") {
    /* 확장. 3바이트씩 (크기-1). */
    const w = b[24] | (b[25] << 8) | (b[26] << 16);
    const h = b[27] | (b[28] << 8) | (b[29] << 16);
    return { width: w + 1, height: h + 1 };
  }
  return null;
}

/**
 * JPEG — 마커를 따라가며 크기가 적힌 프레임(SOFn)을 찾는다.
 * 앞쪽에 섬네일·EXIF 가 붙어 있을 수 있어 한 번에 읽을 수 없다.
 */
function jpeg(b: Buffer): ImageSize | null {
  let i = 2; // 0xFFD8 다음부터

  while (i + 9 < b.length) {
    if (b[i] !== 0xff) {
      i++; // 채움 바이트. 다음 마커를 찾는다.
      continue;
    }
    const marker = b[i + 1];

    /* SOF0~SOF15 가 크기를 담는다. DHT(C4)·JPG(C8)·DAC(CC) 는 아니다. */
    const isFrame = marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker);
    if (isFrame) {
      return { height: b.readUInt16BE(i + 5), width: b.readUInt16BE(i + 7) };
    }

    const length = b.readUInt16BE(i + 2);
    if (length < 2) return null; // 망가진 파일
    i += 2 + length;
  }
  return null;
}

/**
 * 그림의 가로·세로. 읽지 못하면 null.
 * 못 읽어도 올리기는 막지 않는다. 자리를 미리 잡지 못할 뿐이다.
 */
export function readImageSize(buffer: Buffer, mime: string): ImageSize | null {
  const size =
    mime === "image/png"
      ? png(buffer)
      : mime === "image/gif"
        ? gif(buffer)
        : mime === "image/webp"
          ? webp(buffer)
          : mime === "image/jpeg"
            ? jpeg(buffer)
            : null;

  /* 0 이나 터무니없는 값은 못 읽은 것으로 친다 */
  if (!size || size.width <= 0 || size.height <= 0) return null;
  if (size.width > 100000 || size.height > 100000) return null;
  return size;
}
