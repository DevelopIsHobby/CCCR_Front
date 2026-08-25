import Link from "next/link";
import Logo from "./Logo";
import NewsletterBand from "./NewsletterBand";
import { NAV } from "@/lib/site-data";

const POLICY = [
  { label: "개인정보처리방침", href: "/privacy", strong: true },
  { label: "이용약관", href: "/terms", strong: false },
  { label: "이메일무단수집거부", href: "/email-policy", strong: false },
];

export default function Footer() {
  return (
    <footer className="bg-navy-900 text-brand-100/70">
      <NewsletterBand />

      <div className="border-b border-white/10">
        <div className="mx-auto grid max-w-[1280px] gap-8 px-6 py-12 sm:grid-cols-2 lg:grid-cols-5">
          {NAV.map((item) => (
            <div key={item.label}>
              <p className="text-md font-bold text-white">{item.label}</p>
              <ul className="mt-4 space-y-2">
                {item.children.map((child) => (
                  <li key={child.label}>
                    <Link
                      href={child.href}
                      className="text-sm transition-colors hover:text-flame-500"
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

      <div className="mx-auto max-w-[1280px] px-6 py-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Logo variant="light" />
            <address className="mt-6 space-y-1.5 text-sm not-italic leading-relaxed">
              <p>서울특별시 강남구 테헤란로 000, 00빌딩 0층</p>
              <p>
                TEL. 02-000-0000
                <span className="mx-2 text-white/20">|</span>
                FAX. 02-000-0000
                <span className="mx-2 text-white/20">|</span>
                E-MAIL. info@c3r.or.kr
              </p>
              <p className="text-brand-100/50">
                고유번호 000-00-00000
                <span className="mx-2 text-white/20">|</span>
                이사장 홍길동
              </p>
            </address>

            <ul className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
              {POLICY.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className={`text-sm transition-colors hover:text-flame-500 ${
                      item.strong ? "font-bold text-white" : ""
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:text-right">
            <label htmlFor="related-sites" className="sr-only">
              관련기관 바로가기
            </label>
            <select
              id="related-sites"
              defaultValue=""
              className="w-full min-w-[260px] appearance-none rounded-md border border-white/20 bg-navy-950 px-4 py-3 text-base text-white outline-none transition-colors focus:border-flame-500 lg:w-auto"
            >
              <option value="" disabled>
                관련기관 바로가기
              </option>
              <option value="msit">과학기술정보통신부</option>
              <option value="motie">산업통상자원부</option>
              <option value="nipa">정보통신산업진흥원</option>
              <option value="keit">한국산업기술평가관리원</option>
              <option value="kaci">한국클라우드산업협회</option>
            </select>
            <p className="mt-6 text-xs text-brand-100/40">
              © {new Date().getFullYear()} Consortium of Cloud Computing Research.
              <br className="hidden lg:block" /> All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
