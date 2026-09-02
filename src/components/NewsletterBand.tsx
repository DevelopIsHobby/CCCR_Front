import NewsletterForm from "./NewsletterForm";

/*
  푸터 최상단 구독 밴드 — 페이지를 떠나기 직전의 액션 자리.
  아래 푸터가 짙은 남색이라 같은 남색을 쓰면 한 덩어리로 붙어 보인다.
  히어로와 같은 파란 계열로 띄우고 육각 무늬를 얹어 따로 선다.
*/
export default function NewsletterBand() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-navy-800">
      <div className="hex-field absolute inset-0" aria-hidden />

      <div className="relative mx-auto flex max-w-[1280px] flex-col gap-6 px-6 py-12 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
        <div>
          {/* 짙은 남색 위에서 쓰던 flame-500 은 파란 바탕에서 대비가 2.5:1 로 떨어진다 */}
          <p className="data-line text-flame-100">뉴스레터 · 월 1회</p>
          <p className="mt-3 text-xl font-bold leading-snug text-white lg:text-2xl">
            조합 소식과 산업 동향을 메일로 받아보세요
          </p>
          <p className="mt-2 text-base text-brand-100/80">
            공지·행사·기술동향을 월 1회 정리해 보내드립니다.
          </p>
        </div>

        <NewsletterForm source="메인 띠" tone="dark" />
      </div>
    </div>
  );
}
