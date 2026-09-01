import type { Metadata } from "next";
import Link from "next/link";
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
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">회원사 명단</h1>
          <p className="mt-2 text-md text-ink-600">
            회원사 현황 화면에 나오는 명단입니다. 통계 숫자는 이 명단에서 자동으로 계산됩니다.
          </p>
        </div>
        <p className="data-line text-ink-400">
          공개 {counts.total}개사
          <Link href="/members/list" className="ml-3 font-bold text-brand-600 hover:underline">
            화면 보기 →
          </Link>
        </p>
      </div>

      <p className="mt-8 rounded-lg bg-surface px-6 py-5 text-base leading-relaxed text-ink-600">
        회사명을 끌어서 순서를 바꾸고, 등급이 달라졌으면 등급을 고른 뒤 이동을 누르세요. 숨기기를
        누르면 명단에서만 빠지고 기록은 남습니다.
      </p>

      <div className="mt-12">
        {groups.map((group) => (
          <CompanyEditor
            key={group.grade}
            grade={group.grade}
            desc={group.desc}
            companies={group.companies}
          />
        ))}
      </div>
    </>
  );
}
