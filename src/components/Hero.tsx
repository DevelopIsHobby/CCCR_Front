"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
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

  return (
    <section className="relative overflow-hidden bg-navy-900">
      <div className="hex-field absolute inset-0" aria-hidden />
      <div
        className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-brand-700/70"
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-[1280px] gap-6 px-6 py-10 lg:grid-cols-[1.55fr_1fr] lg:py-14">
        {/* 슬라이더 */}
        <div className="relative flex min-h-[380px] flex-col overflow-hidden rounded-2xl bg-navy-950/60 ring-1 ring-white/10 lg:min-h-[460px]">
          <div className="absolute inset-0 opacity-70">
            <NetworkArt />
          </div>
          <div
            className="absolute -right-24 -top-24 size-[420px] rounded-full bg-brand-500/20 blur-3xl"
            aria-hidden
          />

          <div className="relative flex flex-1 flex-col justify-center px-8 py-12 lg:px-12">
            {slides.map((s, i) => (
              <div
                key={s.id}
                className={`transition-all duration-500 ${
                  i === current
                    ? "translate-y-0 opacity-100"
                    : "pointer-events-none absolute translate-y-3 opacity-0"
                }`}
                aria-hidden={i !== current}
              >
                <p className="flex items-center gap-2.5">
                  <span className="data-line text-flame-500">{s.label}</span>
                  <span className="h-3 w-px bg-white/20" aria-hidden />
                  <span className="label-mono text-brand-100/60">{s.dateText}</span>
                </p>
                <h1 className="mt-4 whitespace-pre-line text-2xl font-bold leading-[1.28] text-white sm:text-4xl lg:text-4xl">
                  {s.title}
                </h1>
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
            ))}
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

        {/* 바로가기 패널 */}
        <div className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_18px_48px_-20px_rgba(4,27,56,0.55)]">
          <div className="px-7 pt-7">
            <h2 className="text-2xl font-bold text-navy-900">
              신청 · <span className="text-brand-600">바로가기</span>
            </h2>
            <p className="mt-1.5 text-base text-ink-600">자주 찾는 서비스를 안내해드립니다.</p>
          </div>

          <div className="grid flex-1 grid-cols-2 gap-px bg-line/70 p-7 sm:grid-cols-3 lg:grid-cols-2">
            {QUICK_LINKS.map((link) => {
              const Icon = QUICK_ICONS[link.icon];
              return (
                <SmartLink
                  key={link.label}
                  href={link.href}
                  className="group flex flex-col justify-between gap-3 bg-white p-4 transition-colors hover:bg-brand-50"
                >
                  <Icon className="size-6 text-brand-600 transition-colors group-hover:text-flame-500" />
                  <span>
                    <span className="block text-md font-bold text-navy-900">
                      {link.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-ink-400">{link.desc}</span>
                  </span>
                </SmartLink>
              );
            })}
          </div>

          <Link
            href="/members/join"
            className="group flex items-center justify-between gap-4 bg-brand-600 px-7 py-5 transition-colors hover:bg-navy-900"
          >
            <span className="text-md font-medium text-white">
              <b className="font-bold">C3R 회원사</b>로 가입하고 공동 연구에 참여하세요
            </span>
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/15 text-white transition-transform group-hover:translate-x-1">
              <IconArrow className="size-4" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
