import "server-only";
import sanitizeHtml from "sanitize-html";

/*
  본문 HTML 정리.

  글은 관리자만 쓰지만, 서버 액션은 화면을 거치지 않고도 호출할 수 있으므로
  저장 전에 허용 목록으로 한 번 거른다. 스크립트·이벤트 핸들러·외부 폼은 남기지 않는다.
*/
const ALLOWED_STYLES = {
  "*": {
    /* 한글 글꼴 이름(맑은 고딕 등)도 통과하도록 유니코드 글자를 허용한다 */
    "font-family": [/^[\p{L}\p{N}\s'",.-]+$/u],
    /* 편집기 최대치가 72px 이라 세 자리까지 받는다 */
    "font-size": [/^\d{1,3}(\.\d+)?(px|rem|em)$/],
    color: [/^#[0-9a-fA-F]{3,8}$/, /^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$/],
    /* 편집기는 색을 rgb() 로 내보내기도 한다 */
    "background-color": [
      /^#[0-9a-fA-F]{3,8}$/,
      /^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$/,
    ],
    "text-align": [/^(left|center|right|justify)$/],
    "line-height": [/^\d(\.\d+)?$/],
  },
};

export function sanitizePostBody(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: [
      "p", "br", "hr",
      "h2", "h3", "h4",
      "strong", "b", "em", "i", "u", "s", "code", "pre",
      "ul", "ol", "li",
      "blockquote",
      "a", "img",
      "table", "thead", "tbody", "tr", "th", "td", "colgroup", "col",
      "span", "div",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "title", "width", "height", "class"],
      th: ["colspan", "rowspan", "colwidth"],
      td: ["colspan", "rowspan", "colwidth"],
      col: ["style"],
      "*": ["style"],
    },
    /* 이미지는 우리 서버에 올린 것만 남긴다. 외부 이미지는 주소가 바뀌면 깨진다. */
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: { img: [] },
    allowedStyles: ALLOWED_STYLES,
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, target: "_blank", rel: "noreferrer noopener" },
      }),
    },
    exclusiveFilter: (frame) =>
      frame.tag === "img" && !/^\/api\/images\/\d+$/.test(frame.attribs.src ?? ""),
  });
}

/** 내용이 실제로 있는지. 빈 <p></p> 만 남은 경우를 걸러낸다. */
export function isEmptyHtml(html: string): boolean {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).trim() === "" &&
    !/<img\b/i.test(html);
}
