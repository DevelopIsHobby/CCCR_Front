"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  deleteAttachmentFile,
  deleteImageFile,
  deleteOrphanFiles,
  deleteUnusedImages,
  type FileActionState,
} from "@/lib/db/file-actions";
import type { FileReport } from "@/lib/db/files";
import { formatBytes, formatDate } from "@/lib/format";

const deleteBtn =
  "rounded px-2.5 py-1.5 text-sm font-semibold text-flame-700 ring-1 ring-flame-500/40 transition-colors hover:bg-flame-100";

function CleanupButton({
  action,
  label,
  confirmText,
}: {
  action: (prev: FileActionState, formData: FormData) => Promise<FileActionState>;
  label: string;
  confirmText: string;
}) {
  const [state, formAction, pending] = useActionState<FileActionState, FormData>(action, {});

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-3">
      <button
        type="submit"
        disabled={pending}
        onClick={(e) => {
          if (!confirm(confirmText)) e.preventDefault();
        }}
        className="rounded-full px-5 py-2.5 text-base font-bold text-flame-700 ring-1 ring-flame-500/40 transition-colors hover:bg-flame-100 disabled:opacity-60"
      >
        {pending ? "정리 중…" : label}
      </button>
      {state.ok && <span className="text-base font-medium text-brand-700">{state.ok}</span>}
      {state.error && (
        <span role="alert" className="text-base font-medium text-flame-700">
          {state.error}
        </span>
      )}
    </form>
  );
}

export default function FileManager({ report }: { report: FileReport }) {
  const { files, orphanFiles, totals } = report;

  return (
    <>
      {/* 요약 */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "전체 파일", value: `${totals.count}개` },
          { label: "차지하는 용량", value: formatBytes(totals.bytes) },
          {
            label: "쓰이지 않는 이미지",
            value: `${totals.unusedImages}개`,
            accent: totals.unusedImages > 0,
          },
          { label: "파일이 사라진 기록", value: `${totals.missing}개`, accent: totals.missing > 0 },
        ].map((card) => (
          <div
            key={card.label}
            className={`rounded-xl border p-6 ${
              card.accent ? "border-flame-500 bg-flame-100/40" : "border-line bg-white"
            }`}
          >
            <p className="text-base font-medium text-ink-600">{card.label}</p>
            <p className="label-mono mt-2 text-2xl font-bold tabular-nums leading-none text-navy-900">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* 정리 */}
      <section className="mt-6 rounded-xl border border-line bg-white shadow-[0_1px_2px_rgba(6,42,85,0.04)] p-5 lg:p-6">
        <h2 className="text-lg font-bold text-navy-900">정리</h2>
        <p className="mt-1.5 text-base leading-relaxed text-ink-600">
          어느 글도 쓰지 않는 이미지와, 기록 없이 디스크에만 남은 파일을 지웁니다. 글에 붙어 있는
          첨부파일은 지워지지 않습니다.
        </p>

        {/* 지울 것이 있을 때만 단추를 내놓는다 */}
        {totals.unusedImages === 0 && orphanFiles.length === 0 ? (
          <p className="mt-5 text-base font-medium text-brand-700">정리할 파일이 없습니다.</p>
        ) : (
          <div className="mt-5 flex flex-wrap gap-6">
            {totals.unusedImages > 0 && (
              <CleanupButton
                action={deleteUnusedImages}
                label={`안 쓰는 이미지 ${totals.unusedImages}개 지우기`}
                confirmText="어느 글도 쓰지 않는 이미지를 모두 지울까요?"
              />
            )}
            {orphanFiles.length > 0 && (
              <CleanupButton
                action={deleteOrphanFiles}
                label={`기록 없는 파일 ${orphanFiles.length}개 지우기`}
                confirmText="기록이 없는 파일을 모두 지울까요?"
              />
            )}
          </div>
        )}

        {orphanFiles.length > 0 && (
          <ul className="mt-5 space-y-1 border-t border-line pt-4">
            {orphanFiles.slice(0, 10).map((file) => (
              <li key={file.name} className="label-mono flex justify-between text-ink-400">
                <span className="truncate">{file.name}</span>
                <span className="shrink-0 tabular-nums">{formatBytes(file.byteSize)}</span>
              </li>
            ))}
            {orphanFiles.length > 10 && (
              <li className="text-base text-ink-400">외 {orphanFiles.length - 10}개</li>
            )}
          </ul>
        )}
      </section>

      {/* 파일 목록 */}
      <div className="mt-6 overflow-x-auto rounded-xl border border-line bg-white shadow-[0_1px_2px_rgba(6,42,85,0.04)]">
        <table className="w-full min-w-[860px] border-collapse text-left">
          <thead>
            <tr className="border-b border-line bg-white">
              <th className="w-24 px-3 py-4 text-base font-bold text-navy-900">종류</th>
              <th className="px-3 py-4 text-base font-bold text-navy-900">파일명</th>
              <th className="px-3 py-4 text-base font-bold text-navy-900">쓰인 곳</th>
              <th className="w-24 px-3 py-4 text-right text-base font-bold text-navy-900">크기</th>
              <th className="w-28 px-3 py-4 text-center text-base font-bold text-navy-900">
                올린 날
              </th>
              <th className="w-24 px-3 py-4 text-base font-bold text-navy-900">처리</th>
            </tr>
          </thead>
          <tbody>
            {files.length === 0 && (
              <tr className="border-b border-line">
                <td colSpan={6} className="px-3 py-16 text-center text-md text-ink-400">
                  올라온 파일이 없습니다.
                </td>
              </tr>
            )}

            {files.map((file) => (
              <tr key={`${file.kind}-${file.id}`} className="border-b border-line">
                <td className="px-3 py-3">
                  <span
                    className={`inline-flex rounded px-2 py-0.5 text-2xs font-bold ${
                      file.kind === "attachment"
                        ? "bg-brand-50 text-brand-700"
                        : "bg-navy-900/8 text-navy-800"
                    }`}
                  >
                    {file.kind === "attachment" ? "첨부" : "본문 이미지"}
                  </span>
                </td>

                <td className="px-3 py-3">
                  <p className="truncate text-md text-ink-900">{file.filename}</p>
                  {!file.onDisk && (
                    <p className="mt-1 text-sm font-bold text-flame-700">
                      디스크에 파일이 없습니다
                    </p>
                  )}
                </td>

                <td className="px-3 py-3">
                  {file.usedIn ? (
                    <Link
                      href={file.usedIn.href}
                      className="truncate text-base text-ink-600 hover:text-brand-600"
                    >
                      {file.usedIn.title}
                    </Link>
                  ) : (
                    <span className="text-base text-flame-700">쓰이지 않음</span>
                  )}
                </td>

                <td className="label-mono px-3 py-3 text-right tabular-nums text-ink-400">
                  {formatBytes(file.byteSize)}
                </td>
                <td className="label-mono px-3 py-3 text-center tabular-nums text-ink-400">
                  {formatDate(file.createdAt)}
                </td>

                <td className="px-3 py-3">
                  {/* 본문이 쓰고 있는 이미지는 지우면 글이 깨지므로 아예 내놓지 않는다 */}
                  {file.kind === "image" && file.usedIn ? (
                    <span className="text-sm text-ink-400">글에서 사용 중</span>
                  ) : (
                    <form
                      action={file.kind === "attachment" ? deleteAttachmentFile : deleteImageFile}
                      onSubmit={(e) => {
                        const message =
                          file.kind === "attachment"
                            ? `${file.filename}을(를) 지울까요? 글에서도 첨부가 사라집니다.`
                            : `${file.filename}을(를) 지울까요?`;
                        if (!confirm(message)) e.preventDefault();
                      }}
                    >
                      <input type="hidden" name="id" value={file.id} />
                      <button type="submit" className={deleteBtn}>
                        삭제
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
