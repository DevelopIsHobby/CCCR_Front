"use client";

import { useRef, useState } from "react";
import { uploadImage } from "@/lib/db/image-actions";

/*
  이미지 한 장을 올리고 그 주소(/api/images/N)를 폼에 함께 넘긴다.
  본문 편집기가 쓰는 것과 같은 저장소를 쓰므로 파일 관리 화면에도 함께 나온다.
*/
export default function ImagePicker({
  name,
  defaultValue = "",
  alt,
  ratio = "aspect-[4/5]",
  width = "w-56",
}: {
  name: string;
  defaultValue?: string;
  /** 미리보기의 대체 문구 */
  alt: string;
  /** 미리보기 비율. 로고처럼 가로로 넓은 그림은 바꿔 쓴다. */
  ratio?: string;
  width?: string;
}) {
  const [url, setUrl] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const pick = async (file: File) => {
    setBusy(true);
    setError("");

    const body = new FormData();
    body.append("image", file);
    const result = await uploadImage(body);

    if ("error" in result) setError(result.error);
    else setUrl(result.url);

    setBusy(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div>
      <input type="hidden" name={name} value={url} />

      <div className="flex flex-wrap items-start gap-5">
        <div
          className={`${width} ${ratio} grid shrink-0 place-items-center overflow-hidden rounded-xl border border-line bg-white`}
        >
          {url ? (
            /* 크기를 미리 알 수 없는 그림이라 next/image 대신 img 를 쓴다 */
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt={alt} className="size-full object-contain" />
          ) : (
            <span className="label-mono text-ink-400">{alt}</span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void pick(file);
            }}
            className="hidden"
            id={`${name}-file`}
          />

          <label
            htmlFor={`${name}-file`}
            className="cursor-pointer rounded-full bg-navy-900 px-5 py-2.5 text-center text-base font-bold text-white transition-colors hover:bg-brand-600"
          >
            {busy ? "올리는 중…" : url ? "다른 그림으로 바꾸기" : "그림 올리기"}
          </label>

          {/* 올린 그림이 없으면 지울 것도 없다 */}
          {url && (
            <button
              type="button"
              onClick={() => setUrl("")}
              className="rounded-full px-5 py-2.5 text-base font-semibold text-flame-700 ring-1 ring-flame-500/40 transition-colors hover:bg-flame-100"
            >
              그림 빼기
            </button>
          )}

          <p className="text-sm leading-relaxed text-ink-400">
            JPG · PNG · GIF · WEBP, 5MB 이하
          </p>

          {error && (
            <p role="alert" className="text-base font-medium text-flame-700">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
