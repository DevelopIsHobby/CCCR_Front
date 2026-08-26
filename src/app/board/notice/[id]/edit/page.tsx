import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import PageShell from "@/components/sub/PageShell";
import PostForm from "@/components/board/PostForm";
import { getPost } from "@/lib/db/posts";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "공지사항 수정" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (session?.role !== "admin") redirect(`/login?next=/board/notice/${id}/edit`);

  const post = await getPost("notice", Number(id));
  if (!post) notFound();

  return (
    <PageShell href="/board/notice" desc="등록된 공지사항을 수정합니다.">
      <PostForm
        board="notice"
        listPath="/board/notice"
        post={{
          id: post.id,
          title: post.title,
          body: post.body,
          isPinned: post.isPinned,
          isLocked: post.isLocked,
          attachments: post.attachments,
        }}
      />
    </PageShell>
  );
}
