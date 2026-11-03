import type { Metadata } from "next";
import Link from "next/link";
import { IconExternal } from "@/components/admin/AdminIcons";
import { Note, PageHead } from "@/components/admin/AdminUi";
import HomeCardEditor from "@/components/admin/HomeCardEditor";
import { HOME_CARD_KINDS, listAllHomeCards } from "@/lib/db/home-cards";

export const metadata: Metadata = { title: "메인 화면 관리" };

export default async function Page() {
  const groups = await Promise.all(
    HOME_CARD_KINDS.map(async (group) => ({
      ...group,
      cards: await listAllHomeCards(group.kind),
    })),
  );

  return (
    <div className="space-y-6">
      <PageHead
        title="메인 화면"
        desc="메인 화면의 슬라이드·배너를 직접 고칠 수 있습니다."
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
        저장하면 메인 화면에 바로 반영됩니다. 숨기기를 누르면 목록에는 남고 화면에서만 빠집니다.
        게시글은 각 게시판에서 직접 등록하세요.
        <br />
        메인의 &lsquo;CCCR 아카데미&rsquo; 과정(포스터·접수 기간·재직자/미취업자)은{" "}
        <Link href="/admin/education" className="font-semibold text-brand-600 underline underline-offset-2">
          교육 과정
        </Link>{" "}
        화면에서 넣고 고칩니다.
      </Note>

      <div>
        {groups.map((group) => (
          <HomeCardEditor
            key={group.kind}
            kind={group.kind}
            name={group.name}
            desc={group.desc}
            cards={group.cards}
          />
        ))}
      </div>
    </div>
  );
}
