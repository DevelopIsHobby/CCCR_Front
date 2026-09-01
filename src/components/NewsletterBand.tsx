import NewsletterForm from "./NewsletterForm";

/** 푸터 최상단 구독 밴드 — 페이지를 떠나기 직전의 액션 자리 */
export default function NewsletterBand() {
  return (
    <div className="relative overflow-hidden bg-navy-950">

      <div className="relative mx-auto flex max-w-[1280px] flex-col gap-6 px-6 py-10 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
        <div>
          <p className="data-line text-flame-500">뉴스레터 · 월 1회</p>
          <p className="mt-3 text-xl font-bold leading-snug text-white lg:text-2xl">
            조합 소식과 산업 동향을 메일로 받아보세요
          </p>
          <p className="mt-2 text-base text-brand-100/60">
            공지·행사·기술동향을 월 1회 정리해 보내드립니다.
          </p>
        </div>

        <NewsletterForm source="메인 띠" tone="dark" />
      </div>
    </div>
  );
}
