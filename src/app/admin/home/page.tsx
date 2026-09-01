import type { Metadata } from "next";
import Link from "next/link";
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
    <>
      <div>
        <h1 className="text-2xl font-bold text-navy-900">메인 화면</h1>
        <p className="mt-2 text-md text-ink-600">
          메인 화면의 슬라이드·배너·알림판을 직접 고칠 수 있습니다.
        </p>
      </div>

      <p className="mt-8 rounded-lg bg-surface px-6 py-5 text-base leading-relaxed text-ink-600">
        저장하면 메인 화면에 바로 반영됩니다. 숨기기를 누르면 목록에는 남고 화면에서만 빠집니다.
        게시글은 각 게시판에서 직접 등록하세요.
        <Link href="/" className="ml-2 font-bold text-brand-600 hover:underline">
          메인 화면 보기 →
        </Link>
      </p>

      <div className="mt-12">
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
    </>
  );
}
