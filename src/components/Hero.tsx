"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { QUICK_LINKS } from "@/lib/site-data";
import SmartLink from "./SmartLink";
import type { HomeCard } from "@/lib/db/home-cards";
import { QUICK_ICONS, IconArrow, IconChevron, IconPause, IconPlay } from "./Icons";

const INTERVAL = 6000;

/** 히어로 배경 네트워크 그래픽 — 클라우드/노드 연결 모티브 */
function NetworkArt() {
  const nodes = [
    [18, 26],
    [42, 14],
    [66, 30],
    [86, 18],
    [30, 54],
    [56, 48],
    [78, 62],
    [22, 80],
    [48, 84],
    [72, 92],
  ];
  const edges = [
    [0, 1],
    [1, 2],
    [2, 3],
    [0, 4],
    [1, 5],
    [2, 5],
    [2, 6],
    [4, 5],
    [4, 7],
    [5, 8],
    [6, 8],
    [7, 8],
    [8, 9],
    [6, 9],
  ];

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="absolute inset-0 size-full"
      aria-hidden
    >
      {edges.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a][0]}
          y1={nodes[a][1]}
          x2={nodes[b][0]}
          y2={nodes[b][1]}
          stroke="#5AA0F0"
          strokeOpacity="0.35"
          strokeWidth="0.18"
        />
      ))}
      {nodes.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={i % 3 === 0 ? 0.7 : 0.45}
          fill={i % 4 === 0 ? "#F05A28" : "#7CBAF5"}
          fillOpacity={i % 4 === 0 ? 0.9 : 0.55}
        />
      ))}
    </svg>
  );
}

/** 홍보 그림 한 장. 제목을 그림 설명으로 쓴다(그림 속 글자를 읽지 못하는 분을 위해) */
function SlideImage({ slide }: { slide: HomeCard }) {
  return (
    /* 크기를 미리 알 수 없는 관리자 그림이라 next/image 대신 img 를 쓴다 */
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={slide.imageUrl}
      alt={slide.title.replace(/\s+/g, " ")}
      className="size-full object-contain"
    />
  );
}

export default function Hero({ slides }: { slides: HomeCard[] }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const count = slides.length;

  const go = useCallback(
    (next: number) => {
      if (count === 0) return;
      setIndex((next + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (!playing || count < 2) return;
    timer.current = setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, INTERVAL);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [playing, count]);

  /*
    관리자가 슬라이드를 지워 개수가 줄면 index 가 범위를 벗어날 수 있다.
    상태를 고치는 대신 볼 때마다 접어서 쓴다.
  */
  const current = count > 0 ? index % count : 0;

  /* 관리자가 슬라이드를 모두 지웠을 수도 있다 */
  const slide = slides[current] ?? null;

  /*
    슬라이드 자리 크기. 그림 자리를 관리자 안내와 같은 1500:780 비율로 못 박는다.
    전에는 최소 높이만 두어서 글자 슬라이드가 길면 칸이 늘어나 넘길 때마다 크기가 바뀌었고,
    그림은 자리 비율과 달라 좌우가 비었다(2026-11-09 사무국).
    휴대폰에서는 1500:780 이면 글자 슬라이드가 들어가지 않으므로, 글자 슬라이드가 하나라도
    있을 때만 높이를 고정해 두고(그림은 가운데 맞춤) 태블릿부터 비율을 쓴다.
  */
  const stage = slides.every((s) => s.imageUrl)
    ? "aspect-[1500/780]"
    : "h-[360px] md:h-auto md:aspect-[1500/780]";

  return (
    <section className="relative overflow-hidden bg-navy-900">
      <div className="hex-field absolute inset-0" aria-hidden />
      <div
        className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-brand-700/70"
        aria-hidden
      />
      {/* 서브페이지 머리와 같은 얇은 액센트 한 줄. 흰 바탕과 만나는 경계를 잡아 준다. */}
      <span className="absolute inset-x-0 bottom-0 z-10 h-1 bg-flame-500" aria-hidden />

      {/*
        슬라이드는 화면 전체 폭, 바로가기는 그 아래 가로 한 줄.
        전에는 오른쪽에 바로가기 패널(6칸 + 회원사 가입 띠)을 두었는데, 배치와 문구까지
        KOSA 메인과 거의 같았다. 슬라이드를 넓혀 홍보 그림이 크게 보이게 하고 바로가기는
        한 줄로 모았다. 회원사 가입은 바로가기 줄이 맡는다.
      */}
      <div className="relative mx-auto max-w-[1280px] px-6 pb-10 pt-10 lg:pb-11 lg:pt-11">
        {/* 슬라이더 */}
        <div className="relative flex flex-col overflow-hidden rounded-2xl bg-navy-950/60 ring-1 ring-white/10">
          <div className="absolute inset-0 opacity-70">
            <NetworkArt />
          </div>
          <div
            className="absolute -right-24 -top-24 size-[420px] rounded-full bg-brand-500/20 blur-3xl"
            aria-hidden
          />

          <div className={`relative flex flex-col justify-center overflow-hidden px-8 py-10 lg:px-12 ${stage}`}>
            {slides.map((s, i) =>
              s.imageUrl ? (
                /*
                  홍보 그림 슬라이드. 글자 칸 대신 그림 한 장을 슬라이드 자리 가득 띄운다.
                  포스터처럼 글자가 든 그림이 많아 자르지 않고(object-contain) 남는 곳은 배경이 보인다.
                */
                <div
                  key={s.id}
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    i === current ? "opacity-100" : "pointer-events-none opacity-0"
                  }`}
                  aria-hidden={i !== current}
                  inert={i !== current}
                >
                  {s.href ? (
                    <SmartLink href={s.href} className="block size-full">
                      <SlideImage slide={s} />
                    </SmartLink>
                  ) : (
                    <SlideImage slide={s} />
                  )}
                </div>
              ) : (
              <div
                key={s.id}
                className={`transition-all duration-500 ${
                  i === current
                    ? "translate-y-0 opacity-100"
                    : "pointer-events-none absolute translate-y-3 opacity-0"
                }`}
                aria-hidden={i !== current}
                inert={i !== current}
              >
                <p className="flex items-center gap-2.5">
                  <span className="data-line text-flame-500">{s.label}</span>
                  <span className="h-3 w-px bg-white/20" aria-hidden />
                  <span className="label-mono text-brand-100/60">{s.dateText}</span>
                </p>
                {/*
                  슬라이드마다 h1 을 달면 한 화면에 페이지 제목이 셋이 된다.
                  화면 낭독기는 무엇이 이 쪽의 제목인지 알 수 없고 검색도 마찬가지다.
                  제목 자리는 홈 화면이 따로 하나 둔다(page.tsx).
                */}
                <p className="mt-4 whitespace-pre-line text-2xl font-bold leading-[1.28] text-white sm:text-4xl lg:text-4xl">
                  {s.title}
                </p>
                <p className="mt-5 max-w-xl text-md leading-relaxed text-brand-100/80 lg:text-lg">
                  {s.body}
                </p>
                {s.href && (
                  <SmartLink
                    href={s.href}
                    className="mt-8 inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-3 text-base font-semibold text-white ring-1 ring-white/25 backdrop-blur transition-colors hover:bg-flame-500 hover:ring-flame-500"
                  >
                    자세히 보기
                    <IconArrow className="size-4" />
                  </SmartLink>
                )}
              </div>
              ),
            )}
          </div>

          {/* 캡션 + 컨트롤 */}
          <div className="relative border-t border-white/10 bg-navy-950/70 px-6 py-4 backdrop-blur">
            <div className="flex items-center gap-4">
              <p className="min-w-0 flex-1 truncate text-base text-brand-100/90">
                {slide?.caption}
              </p>
              <div className="flex shrink-0 items-center gap-3">
                <span className="label-mono tabular-nums text-white/70">
                  {String(current + 1).padStart(2, "0")}
                  <span className="mx-1 text-white/30">/</span>
                  {String(slides.length).padStart(2, "0")}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => go(current - 1)}
                    aria-label="이전 슬라이드"
                    className="grid size-8 place-items-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <IconChevron className="size-4 rotate-180" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlaying((p) => !p)}
                    aria-label={playing ? "자동 재생 멈춤" : "자동 재생"}
                    className="grid size-8 place-items-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    {playing ? <IconPause className="size-4" /> : <IconPlay className="size-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => go(current + 1)}
                    aria-label="다음 슬라이드"
                    className="grid size-8 place-items-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <IconChevron className="size-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-3 flex gap-1.5">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`${i + 1}번 슬라이드로 이동`}
                  aria-current={i === current}
                  className={`h-[3px] flex-1 rounded-full transition-colors ${
                    i === current ? "bg-flame-500" : "bg-white/20 hover:bg-white/40"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/*
          바로가기 한 줄. 슬라이드 바로 아래에 붙여 '여기서 할 수 있는 일'을 먼저 보이게 한다.
          넓은 화면은 여섯 칸 한 줄, 태블릿은 세 칸 두 줄, 휴대폰은 두 칸 세 줄.
        */}
        <nav aria-label="바로가기" className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {QUICK_LINKS.map((link) => {
            const Icon = QUICK_ICONS[link.icon];
            return (
              <SmartLink
                key={link.label}
                href={link.href}
                className="group flex items-center gap-3 rounded-xl bg-white px-4 py-4 transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-14px_rgba(0,0,0,0.55)]"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600 transition-colors group-hover:bg-flame-500 group-hover:text-white">
                  <Icon className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-md font-bold text-navy-900">{link.label}</span>
                  <span className="mt-0.5 block truncate text-xs text-ink-400">{link.desc}</span>
                </span>
              </SmartLink>
            );
          })}
        </nav>
      </div>
    </section>
  );
}
