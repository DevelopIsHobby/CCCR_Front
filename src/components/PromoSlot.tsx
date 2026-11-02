"use client";

import { useEffect, useState } from "react";
import SmartLink from "./SmartLink";
import { IconArrow } from "./Icons";
import type { HomeCard } from "@/lib/db/home-cards";

/*
  메인 '지금 모집 중' — 짙은 칸 하나.

  전에는 '알림판'에 카드 둘(회원사 모집·교육)을 위아래로 쌓았다. 교육은 아카데미 영역이
  따로 맡게 되어 한 칸으로 줄였다. 사무국이 여러 개를 넣으면 지우지 않고 이 칸에서
  차례로 바꿔 보인다(관리자 화면에서 넣은 것이 화면에서 조용히 사라지면 안 된다).
  마우스를 올리거나 칸 안에 초점이 있으면 멈춘다.
*/
const INTERVAL = 7000;

export default function PromoSlot({ promos }: { promos: HomeCard[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = promos.length;

  useEffect(() => {
    if (count < 2 || paused) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), INTERVAL);
    return () => clearInterval(timer);
  }, [count, paused]);

  if (count === 0) return null;
  const current = index % count;

  return (
    <div
      className="relative flex flex-1 flex-col"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="relative flex flex-1">
        {promos.map((item, i) => (
          <SmartLink
            key={item.id}
            href={item.href}
            aria-hidden={i !== current}
            tabIndex={i === current ? undefined : -1}
            /*
              보이는 칸만 relative 로 자리를 차지하고, 나머지는 absolute 로 그 위에 겹친다.
              둘을 함께 붙이면 relative 가 이겨 숨은 칸이 자리를 나눠 가져, 보이는 칸이
              반 폭으로 줄었다.
            */
            className={`group flex min-h-[200px] w-full flex-col justify-center overflow-hidden rounded-xl bg-navy-900 p-7 transition-opacity duration-500 hover:bg-navy-800 ${
              i === current ? "relative opacity-100" : "pointer-events-none absolute inset-0 opacity-0"
            }`}
          >
            <span className="hex-field absolute inset-0" aria-hidden />
            <span className="relative">
              <span className="label-mono text-flame-500">{item.label}</span>
              <span className="mt-3 block text-xl font-bold leading-snug text-white">{item.title}</span>
              <span className="mt-2 block text-base leading-relaxed text-brand-100/70">{item.body}</span>
              <span className="mt-5 flex items-center gap-2 text-sm font-semibold text-white">
                바로가기
                <IconArrow className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            </span>
          </SmartLink>
        ))}
      </div>

      {count > 1 && (
        <div className="mt-3 flex justify-center gap-1.5">
          {promos.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`${i + 1}번째 소식 보기`}
              aria-current={i === current}
              className={`h-1.5 rounded-full transition-all ${
                i === current ? "w-6 bg-navy-900" : "w-1.5 bg-line hover:bg-ink-400"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
