import Logo from "./Logo";
import SmartLink from "./SmartLink";
import NewsletterBand from "./NewsletterBand";
import FooterPolicyLinks from "./FooterPolicyLinks";
import SnsLinks from "./SnsLinks";
import { getSiteSettings } from "@/lib/db/site-settings";
import { listRelatedSites } from "@/lib/db/site-content";
import RelatedSiteSelect from "./RelatedSiteSelect";
import { OLD_SITE_URL } from "@/lib/site-data";


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
            {/*
              흰 글씨판은 C 가 남색이라 짙은 푸터 바탕에 묻힌다.
              공식 색을 바꾸지 않고 살리려고 흰 판 위에 기본 로고를 올린다.
            */}
            <span className="inline-block rounded-lg bg-white px-3 py-2">
              {/* 푸터는 맨 아래 서명 자리다. 헤더(32px)보다 작게 둔다. */}
              <Logo className="h-6 w-auto sm:h-7" />
            </span>
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

            {/* 조합 SNS. 주소는 사이트 정보에서 오고, 비어 있으면 나오지 않는다. */}
            <SnsLinks site={site} className="mt-6" />
          </div>

          <div className="lg:text-right">
            <RelatedSiteSelect sites={relatedSites} />

            {/*
              옛 홈페이지로 가는 길. 새 사이트에 없는 지난 글을 찾는 분을 위한 것이다.
              사이트 이름('옛 홈페이지') 대신 거기 뭐가 있는지로 적는다.
              옛 사이트는 문을 닫지 않으므로 '옛'이라 부르면 없어진 곳처럼 읽히고,
              누르는 분이 실제로 찾는 것도 사이트가 아니라 지난 자료다.
            */}
            <p className="mt-6">
              <SmartLink
                href={OLD_SITE_URL}
                className="text-sm transition-colors hover:text-flame-500"
              >
                지난 자료 보기
              </SmartLink>
            </p>

            <p className="mt-4 text-xs text-brand-100/40">
              © {new Date().getFullYear()} Consortium of Cloud Computing Research.
              <br className="hidden lg:block" /> All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
