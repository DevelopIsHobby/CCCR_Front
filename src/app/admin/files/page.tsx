import type { Metadata } from "next";
import FileManager from "@/components/admin/FileManager";
import { getFileReport } from "@/lib/db/files";

export const metadata: Metadata = { title: "파일 관리" };

export default async function Page() {
  const report = await getFileReport();

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-navy-900">파일 관리</h1>
        <p className="mt-2 text-md text-ink-600">
          게시글 첨부파일과 본문에 넣은 이미지를 모아 봅니다. 서버 용량이 부족할 때 안 쓰는 파일부터
          정리하세요.
        </p>
      </div>

      <FileManager report={report} />
    </>
  );
}
