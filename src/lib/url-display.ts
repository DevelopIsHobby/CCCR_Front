/*
  링크 주소를 사람이 읽기 좋게 줄여 보여 주기.

  글에 붙는 링크는 주소가 그대로 화면에 나온다. 법령 검색처럼 한글이 들어간 주소는
  '%ED%81%B4…' 처럼 인코딩되어 한 줄을 다 채우고도 무슨 주소인지 알 수 없었다.
    - 인코딩을 풀어 한글로 보여 준다
    - 사이트 이름(호스트)을 앞에 따로 둔다. 어디로 가는지가 가장 궁금한 것이다
    - 나머지 경로는 정한 길이에서 자르고 … 를 붙인다. 화면 폭에 맡기면 넓은 화면에서
      거의 끝까지 늘어나 '…' 가 너무 늦게 나왔다
  화면에 보여 주는 글자만 바꾼다. 실제로 가는 주소(href)는 손대지 않는다.
*/

export type ShortUrl = {
  /** 'law.go.kr' — 앞의 www. 는 뗀다 */
  host: string;
  /** '/lsSc.do?menuId=1&query=클라우드…' — 없으면 빈 문자열 */
  rest: string;
};

/** 깨진 인코딩이 섞여 있어도 던지지 않는다. 풀 수 없으면 원래 글자를 둔다. */
function decode(text: string): string {
  try {
    return decodeURIComponent(text);
  } catch {
    return text;
  }
}

export function shortUrl(raw: string, max = 40): ShortUrl {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    /* 주소 꼴이 아니면 통째로 잘라 보여 준다 */
    const text = decode(raw);
    return { host: "", rest: text.length > max ? `${text.slice(0, max)}…` : text };
  }

  const host = url.hostname.replace(/^www\./, "");
  const path = url.pathname === "/" ? "" : url.pathname;
  let rest = decode(path + url.search + url.hash);
  /* 글자 수로 자른다. 한글 한 글자도 한 글자로 센다(Array.from 은 서로게이트 쌍을 가르지 않는다) */
  const chars = Array.from(rest);
  if (chars.length > max) rest = `${chars.slice(0, max).join("")}…`;
  return { host, rest };
}
