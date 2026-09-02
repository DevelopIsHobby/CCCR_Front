import type { Metadata } from "next";
import Link from "next/link";
import { IconExternal } from "@/components/admin/AdminIcons";
import { Note, PageHead } from "@/components/admin/AdminUi";
import CompanyEditor from "@/components/admin/CompanyEditor";
import { countCompanies, listCompaniesByGrade } from "@/lib/db/companies";
import { COMPANY_GRADES } from "@/lib/company-types";

export const metadata: Metadata = { title: "회원사 명단 관리" };

export default async function Page() {
  const [groups, counts] = await Promise.all([
    Promise.all(
      COMPANY_GRADES.map(async (g) => ({
        ...g,
        companies: await listCompaniesByGrade(g.grade),
      })),
    ),
    countCompanies(),
  ]);

  return (
    <div className="space-y-6">
      <PageHead
        title="회원사 명단"
        desc="회원사 현황 화면에 나오는 명단입니다. 통계 숫자는 이 명단에서 자동으로 계산됩니다."
        actions={
          <>
            <p className="self-center text-base text-ink-400">공개 {counts.total}개사</p>
            <Link
              href="/members/list"
              target="_blank"
              className="flex items-center gap-2 rounded-lg border border-line bg-white px-4 py-2.5 text-base font-semibold text-ink-600 transition-colors hover:border-brand-500 hover:text-brand-600"
            >
              <IconExternal className="size-4" />
              화면 보기
            </Link>
          </>
        }
      />

      <Note>
        회사명을 끌어서 순서를 바꾸고, 등급이 달라졌으면 등급을 고른 뒤 이동을 누르세요. 숨기기를
        누르면 명단에서만 빠지고 기록은 남습니다.
      </Note>

      <div>
        {groups.map((group) => (
          <CompanyEditor
            key={group.grade}
            grade={group.grade}
            desc={group.desc}
            companies={group.companies}
          />
        ))}
      </div>
    </div>
  );
}
