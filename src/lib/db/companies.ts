import "server-only";
import { ready } from "./migrate";
import { COMPANY_GRADES, type Company } from "@/lib/company-types";

export type { Company } from "@/lib/company-types";

export type CompanyGroup = {
  grade: string;
  desc: string;
  members: Company[];
};

type RawCompany = {
  id: number;
  grade: string;
  name: string;
  site: string;
  logo_url: string;
  sort_order: number;
  is_visible: number;
};

const toCompany = (r: RawCompany): Company => ({
  id: r.id,
  grade: r.grade,
  name: r.name,
  site: r.site,
  logoUrl: r.logo_url,
  sortOrder: Number(r.sort_order),
  isVisible: Number(r.is_visible) === 1,
});

const SELECT =
  "SELECT id, grade, name, site, logo_url, sort_order, is_visible FROM companies";

/** 화면용. 숨긴 곳은 빼고 등급 순서대로 묶는다. */
export async function listCompanyGroups(): Promise<CompanyGroup[]> {
  const db = await ready();
  const rows = await db.all<RawCompany>(
    `${SELECT} WHERE is_visible = 1 ORDER BY sort_order, id`,
  );
  const companies = rows.map(toCompany);

  return COMPANY_GRADES.map((g) => ({
    grade: g.grade,
    desc: g.desc,
    members: companies.filter((c) => c.grade === g.grade),
  })).filter((g) => g.members.length > 0);
}

/** 관리자용. 숨긴 것까지 등급별로 가져온다. */
export async function listCompaniesByGrade(grade: string): Promise<Company[]> {
  const db = await ready();
  const rows = await db.all<RawCompany>(`${SELECT} WHERE grade = ? ORDER BY sort_order, id`, [
    grade,
  ]);
  return rows.map(toCompany);
}

/** 회원사 수. 회원사 현황 화면의 통계에 쓴다. */
export async function countCompanies(): Promise<{ total: number; byGrade: Record<string, number> }> {
  const db = await ready();
  const rows = await db.all<{ grade: string; n: number }>(
    "SELECT grade, COUNT(*) AS n FROM companies WHERE is_visible = 1 GROUP BY grade",
  );

  const byGrade: Record<string, number> = {};
  let total = 0;
  for (const row of rows) {
    byGrade[row.grade] = Number(row.n);
    total += Number(row.n);
  }
  return { total, byGrade };
}
