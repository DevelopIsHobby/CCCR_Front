import NewsletterForm from "./NewsletterForm";

/*
  뉴스레터 구독 신청.
  접수한 주소는 구독자 명단에 담기고 관리자 화면(/admin/newsletter)에서 관리한다.
  발송은 명단을 내려받아 오즈메일러에서 한다.
*/
export default function NewsletterSubscribe() {
  return (
    <section className="relative mb-12 overflow-hidden rounded-2xl bg-navy-900 px-8 py-12 lg:px-14">
      <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-16">
        <div>
          <p className="data-line text-flame-500">구독 무료</p>
          <p className="mt-4 text-xl font-bold leading-snug text-white lg:text-2xl">
            조합 소식을 메일로 받아보세요
          </p>
          <p className="mt-3 text-md leading-relaxed text-brand-100/70">
            구독은 언제든 해지할 수 있으며, 수집한 이메일은 뉴스레터 발송 외의 목적으로 사용하지
            않습니다.
          </p>
        </div>

        <NewsletterForm source="뉴스레터 화면" tone="dark" />
      </div>
    </section>
  );
}
