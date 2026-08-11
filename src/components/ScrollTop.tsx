"use client";

import { useEffect, useState } from "react";
import { IconChevron } from "./Icons";

export default function ScrollTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="맨 위로 이동"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-6 right-6 z-40 grid size-12 place-items-center rounded-full bg-flame-500 text-white shadow-[0_10px_24px_-8px_rgba(240,90,40,0.8)] transition-all hover:bg-flame-600 ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <IconChevron className="size-5 -rotate-90" />
    </button>
  );
}
