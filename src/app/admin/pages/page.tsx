import type { Metadata } from "next";
import Link from "next/link";
import AboutCardEditor from "@/components/admin/AboutCardEditor";
import DepartmentEditor from "@/components/admin/DepartmentEditor";
import PageTextForm from "@/components/admin/PageTextForm";
import { TEXT_GROUPS } from "@/lib/about-content-types";
import { getPageTexts, listAboutCards, listDepartments } from "@/lib/db/about-content";

export const metadata: Metadata = { title: "소개 페이지" };

export default async function Page() {
  const [texts, purposes, roles, departments] = await Promise.all([
    getPageTexts(),
    listAboutCards("purpose"),
    listAboutCards("role"),
    listDepartments(),
  ]);

  const greeting = TEXT_GROUPS.find((g) => g.id === "greeting")!;
  const history = TEXT_GROUPS.find((g) => g.id === "history")!;
  const organization = TEXT_GROUPS.find((g) => g.id === "organization")!;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">소개 페이지</h1>
          <p className="mt-2 text-md text-ink-600">
            조합소개 화면(인사말·설립목적 및 연혁·조직도)의 문구를 고칩니다. 이사장 이름은{" "}
            <Link href="/admin/site" className="font-bold text-brand-600 hover:underline">
              사이트 정보
            </Link>
            에서 고칩니다.
          </p>
        </div>

        <Link
          href="/admin/pages/history"
          className="rounded-full bg-navy-900 px-5 py-2.5 text-base font-bold text-white transition-colors hover:bg-brand-600"
        >
          연혁 관리
        </Link>
      </div>

      <PageTextForm group={greeting} texts={texts} />

      <PageTextForm group={history} texts={texts} />
      <AboutCardEditor
        section="purpose"
        heading="설립목적"
        desc="설립목적 화면의 카드입니다. 두 칸씩 나란히 놓입니다."
        titleLabel="목적"
        bodyLabel="설명"
        addLabel="설립목적 추가"
        cards={purposes}
      />

      <PageTextForm group={organization} texts={texts} />
      <DepartmentEditor departments={departments} />
      <AboutCardEditor
        section="role"
        heading="기구별 역할"
        desc="조직도 화면 아래의 기구 설명입니다."
        titleLabel="기구"
        bodyLabel="역할"
        addLabel="기구 추가"
        cards={roles}
      />

      <p className="mt-14 rounded-lg bg-surface px-6 py-5 text-base leading-relaxed text-ink-600">
        조직도 그림(총회·이사장·사무국·팀 상자)은 칸 위치를 함께 그려야 해서 화면 코드에 두었습니다.
        상자 이름을 바꾸려면 알려 주세요.
      </p>
    </>
  );
}
