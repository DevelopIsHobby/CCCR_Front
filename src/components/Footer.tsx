import Link from "next/link";
import Logo from "./Logo";
import NewsletterBand from "./NewsletterBand";
import FooterPolicyLinks from "./FooterPolicyLinks";
import { NAV } from "@/lib/site-data";


export default function Footer() {
  return (
    <footer className="bg-navy-900 text-brand-100/70">
      <NewsletterBand />

      {/* 좁은 화면에서도 두 칸으로 둔다. 한 칸이면 푸터가 화면 두 개 분량으로 길어진다 */}
      <div className="border-b border-white/10">
        <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-x-8 gap-y-7 px-6 pb-8 pt-10 lg:grid-cols-5">
          {NAV.map((item) => (
            <div key={item.label}>
              <p className="text-md font-bold text-white">{item.label}</p>
              <ul className="mt-3 space-y-1.5">
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

      {/*
        기관 정보는 한 톤 어두운 바닥에 둔다.
        푸터 전체가 같은 파란색이면 면적이 넓어 보여서, 파란 영역은 사이트맵까지만 둔다.
      */}
      <div className="bg-navy-950">
        <div className="mx-auto max-w-[1280px] px-6 pb-10 pt-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <Logo variant="light" />
              <address className="mt-5 space-y-1 text-sm not-italic leading-relaxed">
                <p>서울특별시 강남구 삼성로86길 11, 거봉INC빌딩 5층</p>
                <p>
                  TEL. 02-2052-0156
                  <span className="mx-2 text-white/20">|</span>
                  FAX. 02-2052-0158
                  <span className="mx-2 text-white/20">|</span>
                  E-MAIL. admin@cccr.or.kr
                </p>
                <p className="text-brand-100/50">
                  고유번호 000-00-00000
                  <span className="mx-2 text-white/20">|</span>
                  이사장 이동기
                </p>
              </address>

              <FooterPolicyLinks />
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
      </div>
    </footer>
  );
}
