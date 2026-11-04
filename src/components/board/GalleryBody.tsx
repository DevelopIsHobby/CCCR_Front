"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { IconChevron, IconClose } from "@/components/Icons";

/*
  포토갤러리 글 본문. 본문은 다른 게시판과 똑같이 그리고, 사진을 누르면 화면 가득 크게 보여 준다.
  좌우 단추·화살표 키로 넘기고 Esc 로 닫는다. 사진 목록은 본문 안의 그림을 그대로 읽는다 —
  관리자가 편집기에 넣은 차례가 곧 넘기는 차례다.
*/
type Photo = { src: string; alt: string };

export default function GalleryBody({ html }: { html: string }) {
  const body = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [open, setOpen] = useState<number | null>(null);

  /* 본문 그림에 '누르면 크게' 를 단다 */
  useEffect(() => {
    const root = body.current;
    if (!root) return;
    const images = [...root.querySelectorAll<HTMLImageElement>("img")];
    setPhotos(images.map((img) => ({ src: img.src, alt: img.alt })));
    const handlers = images.map((img, i) => {
      img.style.cursor = "zoom-in";
      img.tabIndex = 0;
      img.setAttribute("role", "button");
      img.setAttribute("aria-label", `사진 ${i + 1} 크게 보기`);
      const show = () => setOpen(i);
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          show();
        }
      };
      img.addEventListener("click", show);
      img.addEventListener("keydown", onKey);
      return () => {
        img.removeEventListener("click", show);
        img.removeEventListener("keydown", onKey);
      };
    });
    return () => handlers.forEach((off) => off());
  }, [html]);

  const count = photos.length;
  const go = useCallback(
    (step: number) => setOpen((i) => (i === null ? i : (i + step + count) % count)),
    [count],
  );

  /* 열려 있는 동안: 키보드로 넘기고 닫기, 뒤 화면 스크롤 막기, 닫기 단추에 초점 */
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [open, go]);

  const current = open === null ? null : photos[open];

  return (
    <>
      <div ref={body} className="rich-text py-10" dangerouslySetInnerHTML={{ __html: html }} />

      {current && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="사진 크게 보기"
          className="fixed inset-0 z-[60] flex flex-col bg-navy-950/95"
          onClick={() => setOpen(null)}
        >
          <div className="flex items-center justify-between px-5 py-4 text-white">
            <span className="label-mono tabular-nums text-white/70">
              {(open ?? 0) + 1} / {count}
            </span>
            <button
              ref={closeButton}
              type="button"
              onClick={() => setOpen(null)}
              aria-label="닫기"
              className="grid size-10 place-items-center rounded-full text-white/80 ring-1 ring-white/20 hover:bg-white/10 hover:text-white"
            >
              <IconClose className="size-5" />
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-8 sm:px-16">
            {/* 사진을 누르면 닫히지 않게 한다(바탕을 눌러야 닫힌다) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.src}
              alt={current.alt}
              onClick={(e) => e.stopPropagation()}
              className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
            />
            {count > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    go(-1);
                  }}
                  aria-label="이전 사진"
                  className="absolute left-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:left-4"
                >
                  <IconChevron className="size-5 rotate-180" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    go(1);
                  }}
                  aria-label="다음 사진"
                  className="absolute right-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:right-4"
                >
                  <IconChevron className="size-5" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
