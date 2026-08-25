"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "./Logo";
import { IconClose, IconMenu, IconSearch, IconChevron } from "./Icons";
import { NAV } from "@/lib/site-data";

const UTILITY = [
  { label: "교육 홈페이지", href: "/education" },
  { label: "뉴스레터 신청", href: "/info/newsletter" },
  { label: "로그인", href: "/login" },
  { label: "회원가입", href: "/signup" },
  { label: "ENGLISH", href: "/en" },
];

export default function Header() {
  const [megaOpen, setMegaOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMegaOpen(false);
        setDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  return (
    <header className="sticky top-0 z-50">
      {/* 유틸리티 바 */}
      <div className="hidden border-b border-line bg-surface lg:block">
        <div className="mx-auto flex h-9 max-w-[1280px] items-center justify-end gap-5 px-6">
          {UTILITY.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-xs text-ink-600 transition-colors hover:text-brand-600"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {/* 메인 헤더 */}
      <div
        className={`relative bg-white transition-shadow ${
          scrolled && !megaOpen ? "shadow-[0_2px_16px_rgba(6,42,85,0.08)]" : ""
        }`}
        onMouseLeave={() => setMegaOpen(false)}
      >
        <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between gap-6 px-6 lg:h-20">
          <Link href="/" aria-label="한국클라우드컴퓨팅연구조합 홈">
            <Logo />
          </Link>

          <nav className="hidden h-full lg:block" aria-label="주 메뉴">
            <ul className="flex h-full items-stretch">
              {NAV.map((item) => (
                <li key={item.label} className="flex">
                  <Link
                    href={item.href}
                    onMouseEnter={() => setMegaOpen(true)}
                    onFocus={() => setMegaOpen(true)}
                    className="group relative flex items-center px-6 text-md font-semibold text-ink-900 transition-colors hover:text-brand-600"
                  >
                    {item.label}
                    <span className="absolute inset-x-4 bottom-0 h-[3px] origin-left scale-x-0 bg-flame-500 transition-transform duration-200 group-hover:scale-x-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="통합검색"
              className="grid size-10 place-items-center rounded-full text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-600"
            >
              <IconSearch className="size-[22px]" />
            </button>
            <button
              type="button"
              aria-label="전체 메뉴 열기"
              aria-expanded={drawerOpen}
              onClick={() => setDrawerOpen(true)}
              className="grid size-10 place-items-center rounded-full text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-600 lg:hidden"
            >
              <IconMenu className="size-[22px]" />
            </button>
          </div>
        </div>

        {/* 메가 메뉴 — 5개 컬럼을 한 번에 펼친다 */}
        <div
          className={`absolute inset-x-0 top-full hidden overflow-hidden border-t border-line bg-white shadow-[0_20px_40px_-16px_rgba(6,42,85,0.22)] transition-[max-height,opacity] duration-300 lg:block ${
            megaOpen ? "max-h-96 opacity-100" : "pointer-events-none max-h-0 opacity-0"
          }`}
          onMouseEnter={() => setMegaOpen(true)}
        >
          <div className="mx-auto grid max-w-[1280px] grid-cols-[1.1fr_repeat(5,1fr)] gap-8 px-6 py-9">
            <div>
              <p className="data-line text-flame-600">전체 메뉴</p>
              <p className="mt-3 text-xl font-bold leading-snug text-navy-900">
                조합의 모든
                <br />
                정보를 한 눈에
              </p>
            </div>
            {NAV.map((item) => (
              <div key={item.label}>
                <p className="border-b-2 border-navy-900 pb-3 text-md font-bold text-navy-900">
                  {item.label}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {item.children.map((child) => (
                    <li key={child.label}>
                      <Link
                        href={child.href}
                        className="text-md text-ink-600 transition-colors hover:text-flame-600"
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 모바일 드로어 */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${drawerOpen ? "" : "pointer-events-none"}`}
        aria-hidden={!drawerOpen}
      >
        <div
          className={`absolute inset-0 bg-navy-950/50 transition-opacity ${
            drawerOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setDrawerOpen(false)}
        />
        <div
          className={`absolute inset-y-0 right-0 flex w-[86%] max-w-sm flex-col bg-white transition-transform duration-300 ${
            drawerOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex h-[72px] items-center justify-between border-b border-line px-5">
            <Logo />
            <button
              type="button"
              aria-label="전체 메뉴 닫기"
              onClick={() => setDrawerOpen(false)}
              className="grid size-10 place-items-center rounded-full text-ink-700 hover:bg-surface"
            >
              <IconClose className="size-[22px]" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-5 py-6" aria-label="모바일 메뉴">
            {NAV.map((item) => (
              <div key={item.label} className="border-b border-line py-5 first:pt-0">
                <p className="text-lg font-bold text-navy-900">{item.label}</p>
                <ul className="mt-3 space-y-2.5">
                  {item.children.map((child) => (
                    <li key={child.label}>
                      <Link
                        href={child.href}
                        onClick={() => setDrawerOpen(false)}
                        className="flex items-center gap-1 text-md text-ink-600"
                      >
                        {child.label}
                        <IconChevron className="size-3.5 text-ink-400" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <div className="grid grid-cols-2 gap-2 border-t border-line bg-surface p-5">
            {UTILITY.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setDrawerOpen(false)}
                className="rounded-md bg-white px-3 py-2.5 text-center text-sm font-medium text-ink-700 ring-1 ring-line"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
