import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

/*
  바깥 그림 가져오기.

  다른 사이트(메일 소식지 등)에서 HTML 을 붙여 넣으면 그림이 그쪽 서버 주소로 들어온다.
  본문에는 우리 서버 그림만 남기므로(html.ts), 편집기가 그 주소를 서버에 넘기면
  서버가 내려받아 우리 그림으로 저장한다. 그쪽에서 그림을 지워도 글이 깨지지 않는다.

  서버가 남의 주소를 대신 여는 일이라 안쪽 주소(127.0.0.1, 사설망, 클라우드 메타데이터 등)는
  열지 않는다. 넘겨받는 매 단계(넘겨주기 포함)마다 이름을 풀어 공인 주소인지 본다.
  관리자만 부를 수 있지만, 계정이 털렸을 때 서버 안쪽을 들여다보는 길이 되면 안 된다.
*/

const MAX_BYTES = 5 * 1024 * 1024;
const MAX_REDIRECTS = 3;
const TIMEOUT_MS = 10_000;

const TYPE_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
};

/** 공인 주소인지. 사설·루프백·링크로컬·예약 대역이면 false */
export function isPublicAddress(ip: string): boolean {
  const kind = isIP(ip);
  if (kind === 4) {
    const [a, b] = ip.split(".").map(Number);
    if (a === 0 || a === 10 || a === 127) return false;
    if (a === 100 && b >= 64 && b <= 127) return false; // 통신사 공유 주소
    if (a === 169 && b === 254) return false; // 링크로컬(클라우드 메타데이터 포함)
    if (a === 172 && b >= 16 && b <= 31) return false;
    if (a === 192 && b === 168) return false;
    if (a === 192 && b === 0) return false;
    if (a === 198 && (b === 18 || b === 19)) return false;
    if (a >= 224) return false; // 멀티캐스트·예약
    return true;
  }
  if (kind === 6) {
    const v6 = ip.toLowerCase();
    if (v6 === "::" || v6 === "::1") return false;
    /* IPv4 를 품은 IPv6(::ffff:10.0.0.1)는 안의 IPv4 로 본다 */
    const mapped = v6.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isPublicAddress(mapped[1]);
    if (/^f[cd]/.test(v6)) return false; // 고유 로컬
    if (/^fe[89ab]/.test(v6)) return false; // 링크로컬
    if (v6.startsWith("ff")) return false; // 멀티캐스트
    return true;
  }
  return false;
}

/** 주소의 호스트가 공인 주소로만 풀리는지 */
async function assertPublicHost(url: URL): Promise<void> {
  const host = url.hostname.replace(/^\[|\]$/g, "");
  const addresses = isIP(host) ? [host] : (await lookup(host, { all: true })).map((r) => r.address);
  if (addresses.length === 0 || !addresses.every(isPublicAddress)) {
    throw new Error("열 수 없는 주소입니다.");
  }
}

/** 주소 끝의 파일 이름. 없으면 image */
function nameFrom(url: URL, type: string): string {
  let base = "";
  try {
    base = decodeURIComponent(url.pathname.split("/").pop() ?? "");
  } catch {
    base = "";
  }
  base = base.replace(/[^\p{L}\p{N}._-]/gu, "_").slice(0, 80) || "image";
  const ext = TYPE_EXT[type];
  return base.toLowerCase().endsWith(ext) || (ext === ".jpg" && /\.jpe?g$/i.test(base))
    ? base
    : `${base.replace(/\.[^.]*$/, "")}${ext}`;
}

/**
 * 바깥 그림을 내려받아 File 로 돌려준다. 그림이 아니거나 크면 Error.
 * 그림인지는 saveUpload 가 앞머리를 보고 한 번 더 확인한다.
 */
export async function fetchRemoteImage(raw: string): Promise<File> {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("그림 주소가 올바르지 않습니다.");
  }

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("http·https 그림만 가져올 수 있습니다.");
    }
    await assertPublicHost(url);

    const res = await fetch(url, {
      redirect: "manual",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { accept: "image/*" },
    });

    /* 넘겨주기는 직접 따라가며 다음 주소도 다시 확인한다 */
    if (res.status >= 300 && res.status < 400) {
      const next = res.headers.get("location");
      if (!next) throw new Error("그림 주소가 다른 곳으로 넘어가다 끊겼습니다.");
      url = new URL(next, url);
      continue;
    }
    if (!res.ok) throw new Error(`그림을 받지 못했습니다(${res.status}).`);

    const type = (res.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
    if (!TYPE_EXT[type]) throw new Error("JPG·PNG·GIF·WEBP 그림만 가져올 수 있습니다.");

    const declared = Number(res.headers.get("content-length") ?? 0);
    if (declared > MAX_BYTES) throw new Error("5MB 를 넘는 그림은 가져올 수 없습니다.");

    /* 크기를 속이는 서버도 있으므로 받으면서 센다 */
    const chunks: Uint8Array[] = [];
    let total = 0;
    const reader = res.body?.getReader();
    if (!reader) throw new Error("그림을 받지 못했습니다.");
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_BYTES) {
        await reader.cancel();
        throw new Error("5MB 를 넘는 그림은 가져올 수 없습니다.");
      }
      chunks.push(value);
    }

    return new File([Buffer.concat(chunks)], nameFrom(url, type), { type });
  }
  throw new Error("그림 주소가 너무 여러 번 넘어갑니다.");
}
