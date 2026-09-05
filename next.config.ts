import type { NextConfig } from "next";

/*
  브라우저에 보내는 보안 머리말(헤더).

  가장 걱정되는 것은 클릭재킹이다. 남의 쪽에서 우리 관리자 화면을 투명하게
  덮어씌워 두면, 로그인한 사무국 직원이 엉뚱한 것을 누르는 사이 승인이나
  삭제가 눌릴 수 있다. frame-ancestors 와 X-Frame-Options 로 막는다.

  CSP 는 개발 중에는 걸지 않는다. 새로 고침(HMR)이 eval 을 쓰기 때문에
  개발 서버에서 걸면 화면이 뜨지 않는다.
*/
const isProd = process.env.NODE_ENV === "production";

/*
  스크립트와 스타일에 'unsafe-inline' 을 남겨 둔다.
  Next.js 가 화면을 이어 붙일 때 인라인 스크립트를 넣고, 편집기와 몇몇
  컴포넌트가 인라인 스타일을 쓴다. 난스(nonce)로 좁히려면 미들웨어에서
  매 요청마다 값을 만들어 넣어야 해서, 지금 얻는 것보다 잃는 것이 많다.

  지도는 카카오 것을 쓴다. 키를 넣지 않은 곳에서는 아예 불러오지 않지만,
  넣었을 때 막히면 안 되므로 허용 목록에 둔다. 타일 그림은 다음·카카오 CDN 에서 온다.

  본문 글꼴(Pretendard)은 globals.css 가 jsdelivr 에서 불러온다. 글꼴 파일도
  같은 곳에서 오므로 style-src 와 font-src 양쪽에 넣는다.
*/
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://dapi.kakao.com https://t1.daumcdn.net",
  "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
  "img-src 'self' data: blob: https://*.daumcdn.net https://*.kakaocdn.net",
  "font-src 'self' data: https://cdn.jsdelivr.net",
  "connect-src 'self' https://dapi.kakao.com https://*.daumcdn.net",
  "frame-src 'self'",
  /* 어디에도 우리 화면을 끼워 넣지 못하게 한다 */
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  /* 클릭재킹 — CSP 를 모르는 낡은 브라우저를 위해 함께 둔다 */
  { key: "X-Frame-Options", value: "DENY" },
  /* 내려보낸 형식을 브라우저가 제멋대로 다시 판단하지 않게 한다 */
  { key: "X-Content-Type-Options", value: "nosniff" },
  /* 다른 사이트로 옮겨갈 때 주소 전체를 넘기지 않는다. 조회 링크에는 토큰이 들어 있다 */
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  /* 쓰지 않는 장치 권한은 아예 닫아 둔다 */
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  ...(isProd ? [{ key: "Content-Security-Policy", value: csp }] : []),
];

const nextConfig: NextConfig = {
  // 상위 폴더의 package-lock.json을 루트로 오인하지 않도록 고정
  turbopack: { root: __dirname },

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
