/*
  글 화면과 메인 강사 모집 팝업(RecruitDialog)이 함께 쓰는 조각.
*/

/** 편집기 도입 전 글은 순수 텍스트다. */
export const isHtml = (body: string) => /<\/?[a-z][\s\S]*>/i.test(body);

/*
  첨부파일 종류 딱지. 이름 끝까지 읽지 않아도 무슨 파일인지 보이게 한다.
  긴 파일 이름은 두 줄에서 잘려 확장자가 가려질 수 있는데, 딱지가 그것을 대신한다.
*/
export function fileKind(filename: string): { label: string; tone: string } {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return { label: "PDF", tone: "bg-flame-100 text-flame-700" };
  if (ext === "hwp" || ext === "hwpx") return { label: "HWP", tone: "bg-brand-100 text-brand-700" };
  if (ext === "doc" || ext === "docx") return { label: "DOC", tone: "bg-brand-100 text-brand-700" };
  if (["xls", "xlsx", "csv"].includes(ext)) return { label: "XLS", tone: "bg-emerald-50 text-emerald-700" };
  if (ext === "ppt" || ext === "pptx") return { label: "PPT", tone: "bg-amber-50 text-amber-700" };
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
    return { label: "IMG", tone: "bg-brand-50 text-brand-600" };
  }
  if (["zip", "7z", "alz", "egg"].includes(ext)) return { label: "ZIP", tone: "bg-surface text-ink-600" };
  return { label: ext ? ext.slice(0, 4).toUpperCase() : "파일", tone: "bg-surface text-ink-600" };
}

export function IconDownload({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 4v11" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 20h14" />
    </svg>
  );
}
