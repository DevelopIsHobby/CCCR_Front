"use client";

/*
  화면을 그리다 잘못됐을 때.

  최상위 오류 화면이라 <html> 부터 직접 그린다(전역 레이아웃이 걷혀 있다).
  기본 화면은 영문이고, 사용자에게는 무슨 말인지 알 수 없다.

  오류 내용은 보여 주지 않는다. 어디가 어떻게 생겼는지가 드러나면 곤란하고,
  본 사람이 할 수 있는 일도 아니다. 대신 다시 해 보는 길과 연락처를 준다.
*/
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="ko">
      <body
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "5rem 1.5rem",
          background: "#ffffff",
          color: "#0b1f3a",
          fontFamily:
            "'Pretendard', -apple-system, BlinkMacSystemFont, 'Malgun Gothic', sans-serif",
          wordBreak: "keep-all",
        }}
      >
        <main style={{ width: "100%", maxWidth: "32rem", textAlign: "center" }}>
          <p style={{ fontSize: "2.5rem", lineHeight: 1, color: "#f05a28" }}>!</p>

          <h1 style={{ marginTop: "2rem", fontSize: "1.5rem", fontWeight: 700, lineHeight: 1.4 }}>
            화면을 보여드리지 못했습니다
          </h1>
          <p style={{ marginTop: "1rem", fontSize: "1rem", lineHeight: 1.8, color: "#4a5568" }}>
            잠시 뒤에 다시 시도해 주세요. 같은 일이 되풀이되면 사무국으로 알려 주시면
            고치겠습니다.
          </p>

          <div
            style={{
              marginTop: "2.5rem",
              display: "flex",
              flexWrap: "wrap",
              gap: "0.75rem",
              justifyContent: "center",
            }}
          >
            <button
              type="button"
              onClick={reset}
              style={{
                cursor: "pointer",
                borderRadius: "9999px",
                border: 0,
                background: "#062a55",
                color: "#ffffff",
                padding: "0.875rem 1.75rem",
                fontSize: "1rem",
                fontWeight: 700,
              }}
            >
              다시 시도
            </button>
            {/*
              여기서는 next/link 를 쓰지 않는다. 화면 나무가 이미 잘못된 상태라
              그 안에서 이동하면 같은 곳으로 다시 떨어진다. 새로 불러와야 한다.
            */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              style={{
                borderRadius: "9999px",
                boxShadow: "inset 0 0 0 1px #dbe3ec",
                color: "#062a55",
                padding: "0.875rem 1.75rem",
                fontSize: "1rem",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              홈으로
            </a>
          </div>

          <p
            style={{
              marginTop: "3rem",
              borderTop: "1px solid #dbe3ec",
              paddingTop: "1.5rem",
              fontSize: "0.875rem",
              color: "#8a97a8",
            }}
          >
            한국클라우드컴퓨팅연구조합 · 02-2052-0156
          </p>
        </main>
      </body>
    </html>
  );
}
