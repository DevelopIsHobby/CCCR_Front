import Link from "next/link";
import Logo from "./Logo";
import NewsletterBand from "./NewsletterBand";
import FooterPolicyLinks from "./FooterPolicyLinks";
import { NAV } from "@/lib/site-data";
import { getSiteSettings } from "@/lib/db/site-settings";
import { listRelatedSites } from "@/lib/db/site-content";
import RelatedSiteSelect from "./RelatedSiteSelect";


export default async function Footer() {
  /* 주소·연락처는 관리자 화면(/admin/site)에서 고친다 */
  const [site, relatedSites] = await Promise.all([getSiteSettings(), listRelatedSites()]);

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
                {site.address && <p>{site.address}</p>}
                <p>
                  {site.tel && <>TEL. {site.tel}</>}
                  {site.tel && site.fax && <span className="mx-2 text-white/20">|</span>}
                  {site.fax && <>FAX. {site.fax}</>}
                  {(site.tel || site.fax) && site.email && (
                    <span className="mx-2 text-white/20">|</span>
                  )}
                  {site.email && <>E-MAIL. {site.email}</>}
                </p>
                <p className="text-brand-100/50">
                  {site.businessNo && <>고유번호 {site.businessNo}</>}
                  {site.businessNo && site.chairman && (
                    <span className="mx-2 text-white/20">|</span>
                  )}
                  {site.chairman && <>이사장 {site.chairman}</>}
                </p>
              </address>

              <FooterPolicyLinks />
            </div>

            <div className="lg:text-right">
              <RelatedSiteSelect sites={relatedSites} />
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
