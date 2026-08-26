import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PageShell from "@/components/sub/PageShell";
import PostForm from "@/components/board/PostForm";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "공지사항 글쓰기" };

export default async function Page() {
  const session = await getSession();
  if (session?.role !== "admin") redirect("/login?next=/board/notice/write");

  return (
    <PageShell href="/board/notice" desc="새 공지사항을 등록합니다.">
      <PostForm board="notice" listPath="/board/notice" />
    </PageShell>
  );
}
