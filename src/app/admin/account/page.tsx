import type { Metadata } from "next";
import Link from "next/link";
import { NameForm, OtherDevicesForm, PasswordForm } from "@/components/admin/AccountForms";
import { countMySessions } from "@/lib/db/account-actions";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "계정 보안" };

export default async function Page() {
  const [session, sessionCount] = await Promise.all([getSession(), countMySessions()]);

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-navy-900">계정 보안</h1>
        <p className="mt-2 text-md text-ink-600">
          지금 로그인한 계정({session?.email})의 비밀번호와 이름을 바꿉니다.
        </p>
      </div>

      <section className="mt-10">
        <h2 className="border-b-2 border-navy-900 pb-4 text-xl font-bold text-navy-900">
          비밀번호 변경
        </h2>
        <p className="mt-4 text-base leading-relaxed text-ink-600">
          바꾸면 지금 기기를 뺀 다른 기기의 로그인은 모두 끊어집니다. 비밀번호를 잊었을 때는 서버에서
          <code className="mx-1.5 rounded bg-surface px-1.5 py-0.5 text-sm">
            node scripts/create-admin.mjs
          </code>
          로 다시 정할 수 있습니다.
        </p>
        <PasswordForm />
      </section>

      <section className="mt-14">
        <h2 className="border-b-2 border-navy-900 pb-4 text-xl font-bold text-navy-900">
          로그인한 기기
        </h2>
        <OtherDevicesForm count={sessionCount} />
      </section>

      <section className="mt-14">
        <h2 className="border-b-2 border-navy-900 pb-4 text-xl font-bold text-navy-900">
          표시 이름
        </h2>
        <NameForm name={session?.name ?? ""} />
      </section>

      <p className="mt-12 rounded-lg bg-surface px-6 py-5 text-base leading-relaxed text-ink-600">
        다른 사람에게 관리자 권한을 주거나 새 관리자 계정을 만들려면{" "}
        <Link href="/admin/members" className="font-bold text-brand-600 hover:underline">
          회원 관리
        </Link>
        에서 하세요.
      </p>
    </>
  );
}
