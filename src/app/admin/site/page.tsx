import type { Metadata } from "next";
import SiteSettingsForm from "@/components/admin/SiteSettingsForm";
import { OfficeEditor, RelatedSiteEditor } from "@/components/admin/SiteContentEditor";
import { getSiteSettings } from "@/lib/db/site-settings";
import { listOffices, listRelatedSites } from "@/lib/db/site-content";

export const metadata: Metadata = { title: "사이트 정보 관리" };

export default async function Page() {
  const [settings, sites, offices] = await Promise.all([
    getSiteSettings(),
    listRelatedSites(true),
    listOffices(true),
  ]);

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-navy-900">사이트 정보</h1>
        <p className="mt-2 text-md text-ink-600">
          모든 화면 아래쪽(푸터)에 나오는 조합 정보입니다. 저장하면 사이트 전체에 바로 반영됩니다.
        </p>
      </div>

      <SiteSettingsForm settings={settings} />

      <RelatedSiteEditor sites={sites} />
      <OfficeEditor offices={offices} />
    </>
  );
}
