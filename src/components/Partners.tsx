import Image from "next/image";
import { PARTNERS } from "@/lib/site-data";

/*
  유관기관 로고 띠.
  로고 폭이 제각각(가로로 긴 것부터 정사각에 가까운 것까지)이라
  칸 크기를 고정하고 그 안에서 비율을 지켜 줄인다. 그래야 줄이 고르게 흐른다.
*/
export default function Partners() {
  /* 끊김 없이 흐르도록 같은 목록을 두 번 잇는다. 뒤 묶음은 낭독기에서 숨긴다. */
  const loop = [...PARTNERS, ...PARTNERS];

  return (
    <section className="overflow-hidden bg-white py-12" aria-label="유관기관">
      <div className="relative">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-white to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-white to-transparent"
          aria-hidden
        />

        <ul className="flex w-max animate-marquee gap-3 hover:[animation-play-state:paused]">
          {loop.map((partner, i) => (
            <li
              key={`${partner.src}-${i}`}
              aria-hidden={i >= PARTNERS.length}
              className="group grid h-[88px] w-[200px] shrink-0 place-items-center rounded-lg border border-line bg-white px-6 transition-colors hover:border-brand-200 hover:bg-brand-50/50"
            >
              {/* 상자를 고정하고 그 안에 맞춘다.
                  폭·높이를 auto 로 두면 로고를 내려받기 전 크기가 0 이라 lazy 로딩이 걸리지 않는다. */}
              <Image
                src={partner.src}
                alt={partner.name}
                width={partner.width}
                height={partner.height}
                sizes="152px"
                /* 띠가 계속 흐르므로 첫 묶음은 미리 받아 둔다.
                   뒤 묶음은 같은 주소라 브라우저 캐시에서 바로 나온다. */
                loading={i < PARTNERS.length ? "eager" : "lazy"}
                className="h-11 w-[152px] object-contain"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
