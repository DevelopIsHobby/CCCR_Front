"use client";

import { useEffect, useRef, useState, type DragEvent } from "react";
import { uploadImage } from "@/lib/db/image-actions";
import { IconChevron, IconClose, IconPlus } from "@/components/Icons";

/*
  포토갤러리 글쓰기의 사진 칸. 본문 편집기·첨부파일 대신 이것 하나만 둔다.

  고르거나 끌어다 놓은 사진을 곧바로 하나씩 올리고(uploadImage, 편집기와 같은 길),
  다 올린 사진을 차례대로 <img> 로 이어 본문(name="body")에 담는다. 그래서 저장·목록 카드(첫 사진)·
  글 화면(눌러 크게 넘기기)은 편집기로 쓴 글과 똑같이 돈다. 여기 차례가 곧 넘기는 차례이고,
  맨 앞 사진이 목록 카드가 된다.

  휴대전화 사진은 한 장에 5MB(uploadImage 한도)를 넘기 일쑤라, 올리기 전에 긴 변 2560px 로
  줄여 JPG 로 다시 담는다. 화면에서 크게 볼 때도 이 정도면 넉넉하다. GIF 는 움직임이 깨지므로 그대로 둔다.
*/
type Photo = {
  key: string;
  /** 다 올리면 /api/images/N */
  src?: string;
  /** 올리는 동안 보여 줄 미리보기(내 컴퓨터의 파일) */
  preview?: string;
};

const ACCEPT = "image/png,image/jpeg,image/gif,image/webp";
const MAX_SIDE = 2560;
/** 이보다 크면 긴 변이 MAX_SIDE 아래여도 다시 담는다 */
const SHRINK_OVER = 3 * 1024 * 1024;

async function shrink(file: File): Promise<File> {
  if (file.type === "image/gif") return file;
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size <= SHRINK_OVER) {
    bitmap.close();
    return file;
  }
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  /* 투명한 PNG 가 JPG 로 바뀌면 검게 비치므로 흰 바탕을 깐다 */
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((done) => canvas.toBlob(done, "image/jpeg", 0.86));
  if (!blob) return file;
  return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", {
    type: "image/jpeg",
  });
}

/** 수정할 때: 저장된 본문에서 우리 서버 그림만 차례대로 꺼낸다 */
function photosFrom(html: string): Photo[] {
  return [...html.matchAll(/<img\b[^>]*\bsrc="(\/api\/images\/\d+)"/gi)].map((m, i) => ({
    key: `saved-${i}-${m[1]}`,
    src: m[1],
  }));
}

function move<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length || from === to) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export default function PhotoPicker({ defaultHtml = "" }: { defaultHtml?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<Photo[]>(() => photosFrom(defaultHtml));
  const [errors, setErrors] = useState<string[]>([]);
  const [droppingFiles, setDroppingFiles] = useState(false);
  /* 칸끼리 끌어 차례를 바꿀 때 집어 든 칸 */
  const dragFrom = useRef<number | null>(null);

  const uploading = photos.some((p) => !p.src);
  const done = photos.filter((p) => p.src);

  /*
    올리는 중이거나 사진이 없으면 저장을 막는다. 숨긴 파일칸에 사정을 걸어 두면 브라우저가
    제출 전에 멈춰 세우고 그 말을 보여 준다(AttachmentPicker 와 같은 방법).
  */
  useEffect(() => {
    input.current?.setCustomValidity(
      uploading
        ? "사진을 올리는 중입니다. 끝나면 저장해 주세요."
        : done.length === 0
          ? "사진을 한 장 이상 올려 주세요."
          : "",
    );
  }, [uploading, done.length]);

  /* 미리보기 주소는 쓰고 나면 돌려준다 */
  const previews = useRef(new Set<string>());
  useEffect(() => {
    const all = previews.current;
    return () => all.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const add = async (picked: File[]) => {
    const files = picked.filter((f) => ACCEPT.split(",").includes(f.type));
    const skipped = picked.length - files.length;
    setErrors(
      skipped > 0
        ? [`그림이 아닌 파일 ${skipped}개는 뺐습니다. JPG·PNG·GIF·WEBP 만 올릴 수 있습니다.`]
        : [],
    );
    if (files.length === 0) return;

    const stamp = Date.now();
    const items = files.map((file, i) => {
      const preview = URL.createObjectURL(file);
      previews.current.add(preview);
      return { key: `new-${stamp}-${i}`, preview, file };
    });
    setPhotos((list) => [...list, ...items.map(({ key, preview }) => ({ key, preview }))]);

    /* 고른 차례대로 하나씩 올린다. 자리는 미리 잡아 두었으니 차례는 흐트러지지 않는다 */
    for (const { key, preview, file } of items) {
      const formData = new FormData();
      formData.append("image", await shrink(file));
      const result = await uploadImage(formData).catch(() => ({
        error: "올리지 못했습니다.",
      }));
      if ("url" in result) {
        setPhotos((list) => list.map((p) => (p.key === key ? { key, src: result.url } : p)));
      } else {
        setPhotos((list) => list.filter((p) => p.key !== key));
        setErrors((list) => [...list, `${file.name}: ${result.error}`]);
      }
      URL.revokeObjectURL(preview);
      previews.current.delete(preview);
    }
  };

  const onDropFiles = (e: DragEvent<HTMLDivElement>) => {
    if (!e.dataTransfer.types.includes("Files")) return;
    e.preventDefault();
    setDroppingFiles(false);
    void add(Array.from(e.dataTransfer.files));
  };

  const body = done.map((p) => `<img src="${p.src}" alt="">`).join("");

  return (
    <div>
      <input type="hidden" name="body" value={body} />

      <div
        onDragOver={(e) => {
          if (!e.dataTransfer.types.includes("Files")) return;
          e.preventDefault();
          setDroppingFiles(true);
        }}
        onDragLeave={() => setDroppingFiles(false)}
        onDrop={onDropFiles}
        className={`rounded-xl border-2 border-dashed p-4 transition-colors sm:p-5 ${
          droppingFiles ? "border-brand-500 bg-brand-50" : "border-line bg-white"
        }`}
      >
        {photos.length === 0 ? (
          <label
            htmlFor="post-photos"
            className="flex cursor-pointer flex-col items-center justify-center gap-3 py-14 text-center"
          >
            <span className="grid size-14 place-items-center rounded-full bg-brand-50 text-brand-600">
              <IconPlus className="size-7" />
            </span>
            <span className="text-md font-bold text-navy-900">사진 고르기</span>
            <span className="text-sm text-ink-400">
              여러 장을 한꺼번에 골라도 되고, 여기에 끌어다 놓아도 됩니다.
            </span>
          </label>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {photos.map((p, i) => (
              <li
                key={p.key}
                draggable={Boolean(p.src)}
                onDragStart={(e) => {
                  dragFrom.current = i;
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragOver={(e) => {
                  if (dragFrom.current === null) return;
                  e.preventDefault();
                }}
                onDrop={(e) => {
                  if (dragFrom.current === null) return;
                  e.preventDefault();
                  e.stopPropagation();
                  const from = dragFrom.current;
                  dragFrom.current = null;
                  setPhotos((list) => move(list, from, i));
                }}
                onDragEnd={() => (dragFrom.current = null)}
                className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-surface ring-1 ring-line"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.src ?? p.preview}
                  alt={`사진 ${i + 1}`}
                  className={`size-full object-cover ${p.src ? "" : "opacity-50"}`}
                />

                {!p.src && (
                  <span className="absolute inset-0 grid place-items-center text-sm font-bold text-navy-900">
                    올리는 중…
                  </span>
                )}

                {i === 0 && p.src && (
                  <span className="absolute left-2 top-2 rounded-full bg-navy-900 px-2.5 py-1 text-xs font-bold text-white">
                    대표
                  </span>
                )}

                {p.src && (
                  <>
                    <button
                      type="button"
                      onClick={() => setPhotos((list) => list.filter((x) => x.key !== p.key))}
                      aria-label={`사진 ${i + 1} 빼기`}
                      className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-navy-950/70 text-white transition-colors hover:bg-flame-600"
                    >
                      <IconClose className="size-4" />
                    </button>
                    <div className="absolute inset-x-2 bottom-2 flex justify-between">
                      <button
                        type="button"
                        disabled={i === 0}
                        onClick={() => setPhotos((list) => move(list, i, i - 1))}
                        aria-label={`사진 ${i + 1} 앞으로`}
                        className="grid size-8 place-items-center rounded-full bg-white/90 text-navy-900 shadow transition-colors hover:bg-brand-600 hover:text-white disabled:invisible"
                      >
                        <IconChevron className="size-4 rotate-180" />
                      </button>
                      <button
                        type="button"
                        disabled={i === photos.length - 1}
                        onClick={() => setPhotos((list) => move(list, i, i + 1))}
                        aria-label={`사진 ${i + 1} 뒤로`}
                        className="grid size-8 place-items-center rounded-full bg-white/90 text-navy-900 shadow transition-colors hover:bg-brand-600 hover:text-white disabled:invisible"
                      >
                        <IconChevron className="size-4" />
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}

            <li>
              <label
                htmlFor="post-photos"
                className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-line text-ink-400 transition-colors hover:border-brand-500 hover:bg-brand-50 hover:text-brand-600"
              >
                <IconPlus className="size-6" />
                <span className="text-sm font-bold">사진 더 넣기</span>
              </label>
            </li>
          </ul>
        )}

        <input
          ref={input}
          id="post-photos"
          type="file"
          multiple
          accept={ACCEPT}
          onChange={(e) => {
            const files = Array.from(e.currentTarget.files ?? []);
            e.currentTarget.value = "";
            void add(files);
          }}
          className="sr-only"
        />
      </div>

      {errors.length > 0 && (
        <ul
          role="alert"
          className="mt-2 space-y-1 rounded-md bg-flame-100 px-4 py-2.5 text-sm font-medium text-flame-700"
        >
          {errors.map((m, i) => (
            <li key={i}>{m}</li>
          ))}
        </ul>
      )}

      <p className="mt-2 text-sm text-ink-400">
        {done.length > 0 ? `${done.length}장 · ` : ""}맨 앞 사진이 목록의 대표 사진이 됩니다. 화살표
        단추나 끌어 놓기로 차례를 바꿀 수 있고, 큰 사진은 올릴 때 알맞은 크기로 줄입니다.
      </p>
    </div>
  );
}
