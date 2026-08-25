import { PARTNERS } from "@/lib/site-data";

/**
 * 유관기관 로고 띠.
 * 실제 로고 이미지가 준비되면 각 항목을 <Image />로 교체하면 된다.
 */
export default function Partners() {
  const loop = [...PARTNERS, ...PARTNERS];

  return (
    <section className="overflow-hidden bg-white py-12">
      <div className="mx-auto max-w-[1280px] px-6">
        <p className="data-line text-center text-ink-400">유관기관 {PARTNERS.length}곳</p>
      </div>

      <div className="relative mt-8">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-white to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-white to-transparent"
          aria-hidden
        />
        <div className="flex w-max animate-marquee gap-3 hover:[animation-play-state:paused]">
          {loop.map((name, i) => (
            <span
              key={`${name}-${i}`}
              className="flex h-16 items-center whitespace-nowrap rounded-lg border border-line bg-surface px-8 text-md font-semibold text-ink-600 transition-colors hover:border-brand-200 hover:text-brand-600"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
