import type { Metadata } from "next";
import { PageHead } from "@/components/admin/AdminUi";
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
    <div>
      <PageHead
        title="사이트 정보"
        desc="모든 화면 아래쪽(푸터)에 나오는 조합 정보입니다. 저장하면 사이트 전체에 바로 반영됩니다."
      />

      <SiteSettingsForm settings={settings} />
      <RelatedSiteEditor sites={sites} />
      <OfficeEditor offices={offices} />
    </div>
  );
}
