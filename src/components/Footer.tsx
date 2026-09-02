import Logo from "./Logo";
import NewsletterBand from "./NewsletterBand";
import FooterPolicyLinks from "./FooterPolicyLinks";
import { getSiteSettings } from "@/lib/db/site-settings";
import { listRelatedSites } from "@/lib/db/site-content";
import RelatedSiteSelect from "./RelatedSiteSelect";


export default async function Footer() {
  /* 주소·연락처는 관리자 화면(/admin/site)에서 고친다 */
  const [site, relatedSites] = await Promise.all([getSiteSettings(), listRelatedSites()]);

  return (
    <footer className="bg-navy-950 text-brand-100/70">
      <NewsletterBand />

      {/* 전체 메뉴는 헤더의 메가 메뉴·모바일 서랍에 있으므로 푸터에서는 되풀이하지 않는다 */}
      <div className="mx-auto max-w-[1280px] px-6 py-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
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
              {/* 이사장 이름은 인사말·조직도에서만 밝힌다 */}
              {site.businessNo && (
                <p className="text-brand-100/50">고유번호 {site.businessNo}</p>
              )}
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
    </footer>
  );
}
