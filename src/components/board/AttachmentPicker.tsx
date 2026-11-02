"use client";

import { useRef, useState, type DragEvent } from "react";
import { formatBytes } from "@/lib/format";
import { checkAttachmentSizes } from "@/lib/upload-limits";

/*
  새로 올릴 첨부파일 고르기.

  브라우저 기본 파일칸은 다시 고르면 앞에 고른 것을 지우고 바꾼다. 하나를 고르고 또 하나를
  고르면 마지막 하나만 남아 '첨부파일을 하나밖에 못 올린다'고 여겨졌다(선택 창에서 Ctrl 로
  한꺼번에 고르면 됐지만 그걸 아는 사람은 드물다).

  고른 파일을 여기서 들고 있다가 고를 때마다 덧붙이고, 그 목록을 파일칸에 다시 채워 넣는다.
  서버는 지금처럼 같은 칸(name="files")에서 여러 개를 받는다(post-actions.ts).
  끌어다 놓아도 덧붙는다.

  크기 한도는 전과 같다(upload-limits.ts). 넘으면 바로 알리고 저장을 막는다.
*/
export default function AttachmentPicker() {
  const input = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [problem, setProblem] = useState("");
  const [dragging, setDragging] = useState(false);

  /* 들고 있는 목록을 파일칸에 채워 넣는다. 저장할 때 보내는 것은 파일칸의 내용이다. */
  const keep = (next: File[]) => {
    const box = input.current;
    if (box) {
      const transfer = new DataTransfer();
      next.forEach((f) => transfer.items.add(f));
      box.files = transfer.files;
      const message = checkAttachmentSizes(next);
      box.setCustomValidity(message);
      setProblem(message);
    }
    setFiles(next);
  };

  /*
    같은 파일을 두 번 고르면 한 번만 둔다. 이름과 크기로 가린다. 한 글에 이름·크기가 같은
    다른 파일을 붙일 일은 없고, 붙였다면 읽는 사람도 구분할 수 없다.
  */
  const add = (picked: File[]) => {
    const same = (a: File, b: File) => a.name === b.name && a.size === b.size;
    keep([...files, ...picked.filter((p) => !files.some((f) => same(f, p)))]);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    add(Array.from(e.dataTransfer.files));
  };

  const total = files.reduce((sum, f) => sum + f.size, 0);

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`flex flex-wrap items-center gap-3 rounded-md border border-dashed px-4 py-3 transition-colors ${
          dragging ? "border-brand-500 bg-brand-50" : "border-line"
        }`}
      >
        <label
          htmlFor="post-files"
          className="cursor-pointer rounded bg-surface px-4 py-2 text-base font-semibold text-navy-900 transition-colors hover:bg-brand-50 hover:text-brand-700"
        >
          파일 추가
        </label>
        <span className="text-sm text-ink-400">
          여러 번 골라도 쌓입니다. 여기에 끌어다 놓아도 됩니다.
        </span>
        <input
          ref={input}
          id="post-files"
          name="files"
          type="file"
          multiple
          /* 다시 고르면 바뀌는 대신 덧붙인다(위 설명) */
          onChange={(e) => add(Array.from(e.currentTarget.files ?? []))}
          className="sr-only"
        />
      </div>

      {files.length > 0 && (
        <ul className="mt-2 divide-y divide-line rounded-md border border-line">
          {files.map((f, i) => (
            <li key={`${f.name}-${f.size}`} className="flex items-center gap-3 px-4 py-2.5">
              <span className="min-w-0 flex-1 truncate text-base text-navy-900">{f.name}</span>
              <span className="label-mono shrink-0 text-sm text-ink-400">{formatBytes(f.size)}</span>
              <button
                type="button"
                onClick={() => keep(files.filter((_, j) => j !== i))}
                aria-label={`${f.name} 빼기`}
                className="shrink-0 rounded px-2 py-1 text-sm font-semibold text-ink-400 transition-colors hover:bg-flame-100 hover:text-flame-700"
              >
                빼기
              </button>
            </li>
          ))}
          <li className="px-4 py-2 text-sm text-ink-400">
            {files.length}개 · 합계 {formatBytes(total)}
          </li>
        </ul>
      )}

      {problem && (
        <p role="alert" className="mt-2 rounded-md bg-flame-100 px-4 py-2.5 text-sm font-medium text-flame-700">
          {problem}
        </p>
      )}

      <p className="mt-2 text-sm text-ink-400">
        한 개당 20MB, 한 번에 합쳐 24MB까지 올릴 수 있습니다. 더 많이 저장하기 위해선 나눠서
        올려주세요.
      </p>
    </div>
  );
}
