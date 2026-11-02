import type { Metadata } from "next";
import Link from "next/link";
import { IconExternal } from "@/components/admin/AdminIcons";
import { Note, PageHead } from "@/components/admin/AdminUi";
import EduCourseEditor from "@/components/admin/EduCourseEditor";
import { listAllCourses } from "@/lib/db/edu-courses";

export const metadata: Metadata = { title: "교육 과정 관리" };

export default async function Page() {
  const courses = await listAllCourses();

  return (
    <div className="space-y-6">
      <PageHead
        title="교육 과정"
        desc="메인 화면 'CCCR 아카데미' 영역에 포스터와 함께 보이는 교육 과정입니다."
        actions={
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 rounded-lg border border-line bg-white px-4 py-2.5 text-base font-semibold text-ink-600 transition-colors hover:border-brand-500 hover:text-brand-600"
          >
            <IconExternal className="size-4" />
            메인 화면 보기
          </Link>
        }
      />

      <Note>
        접수중인 과정이 마감 가까운 순서로 메인에 먼저 나오고, 그다음 접수예정 과정이 나옵니다. 마감된
        과정은 메인에서 저절로 빠지므로 지우지 않아도 됩니다. 과정은 아카데미에도 따로 올려야 합니다 —
        이 화면은 아카데미 쪽을 고치지 않습니다.
      </Note>

      <EduCourseEditor courses={courses} />
    </div>
  );
}
