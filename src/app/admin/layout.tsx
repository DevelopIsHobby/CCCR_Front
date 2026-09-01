import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { ADMIN_SECTIONS } from "@/lib/admin-nav";
import AdminNav from "@/components/admin/AdminNav";

/* 관리자 화면 공통 틀. 모든 하위 화면이 로그인 검사를 여기서 한 번에 받는다. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (session?.role !== "admin") redirect("/login?next=/admin");

  return (
    <>
      <div className="border-b border-line bg-navy-900">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-3 px-6 py-5">
          <div>
            <p className="data-line text-flame-500">관리자</p>
            <p className="mt-1.5 text-xl font-bold text-white">홈페이지 관리</p>
          </div>
          <p className="text-base text-brand-100/70">
            <b className="font-bold text-white">{session.name}</b>님으로 로그인
            <Link href="/" className="ml-4 text-white underline underline-offset-2">
              사이트 보기
            </Link>
          </p>
        </div>
      </div>

      <AdminNav sections={ADMIN_SECTIONS} />

      <div className="mx-auto max-w-[1280px] px-6 py-12">{children}</div>
    </>
  );
}
