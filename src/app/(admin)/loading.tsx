/*
  관리자 화면을 기다리는 동안의 뼈대.
  공개 화면과 달리 머리 띠가 없고 제목 한 줄과 표가 이어진다.
*/
export default function Loading() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true">
      <span className="sr-only">화면을 불러오는 중입니다.</span>

      <div>
        <div className="h-6 w-40 rounded bg-surface" />
        <div className="mt-3 h-4 w-80 max-w-full rounded bg-surface" />
      </div>

      <div className="rounded-xl border border-line bg-white p-6">
        <div className="space-y-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-4 rounded bg-surface" style={{ width: `${95 - i * 6}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
