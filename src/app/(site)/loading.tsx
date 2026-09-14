/*
  화면이 오는 동안 자리를 잡아 두는 뼈대.

  모든 화면을 서버에서 만들어 보내므로, 메뉴를 누르고 서버가 답할 때까지는
  이전 화면이 그대로 남는다. 망이 느리면 눌리지 않은 것처럼 보인다.
  뼈대를 먼저 내보내면 "지금 오는 중"이라는 것이 바로 보이고, 헤더·푸터는
  그대로 있으므로 화면이 통째로 깜박이지도 않는다.

  자리와 크기는 PageShell 과 맞춘다. 뼈대와 진짜 화면의 자리가 다르면
  바뀌는 순간 글이 튄다.

  움직임을 줄이도록 설정한 분에게는 globals.css 가 애니메이션을 멈춘다.
*/
export default function Loading() {
  return (
    <div aria-busy="true">
      <span className="sr-only">화면을 불러오는 중입니다.</span>

      {/* 머리 띠 */}
      <div className="relative overflow-hidden bg-navy-900">
        <div
          className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-brand-700/60"
          aria-hidden
        />
        <span className="absolute inset-x-0 bottom-0 h-1 bg-flame-500" aria-hidden />

        <div className="relative mx-auto max-w-[1280px] animate-pulse px-6 py-10 lg:py-12">
          <div className="h-3.5 w-40 rounded bg-white/15" />
          <div className="mt-7 h-8 w-64 rounded bg-white/25 lg:h-9" />
          <div className="mt-4 h-4 w-full max-w-2xl rounded bg-white/10" />
        </div>
      </div>

      {/* 형제 메뉴 탭 자리 */}
      <div className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-[1280px] animate-pulse gap-8 px-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="my-5 h-4 w-20 rounded bg-surface" />
          ))}
        </div>
      </div>

      {/* 본문 자리 */}
      <div className="mx-auto max-w-[1280px] animate-pulse px-6 py-12">
        <div className="h-6 w-48 rounded bg-surface" />
        <div className="mt-6 space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-4 rounded bg-surface" style={{ width: `${92 - i * 7}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
