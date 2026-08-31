import { IconArrow } from "./Icons";

/*
  뉴스레터 구독 신청.
  아직 폼만 있고 접수 처리는 붙어 있지 않다. (메일 발송·구독자 관리 미구현)
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

        <form className="flex w-full shrink-0 flex-col gap-2 sm:flex-row lg:w-auto">
          <label htmlFor="subscribe-email" className="sr-only">
            이메일 주소
          </label>
          <input
            id="subscribe-email"
            type="email"
            required
            placeholder="email@example.com"
            className="min-w-0 rounded-md border border-white/20 bg-white/5 px-4 py-3.5 text-md text-white outline-none transition-colors placeholder:text-brand-100/40 focus:border-flame-500 focus:bg-white/10 sm:w-72"
          />
          <button
            type="submit"
            className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-flame-500 px-6 py-3.5 text-md font-bold text-white transition-colors hover:bg-flame-600"
          >
            구독 신청
            <IconArrow className="size-4 transition-transform group-hover:translate-x-1" />
          </button>
        </form>
      </div>
    </section>
  );
}
