"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyleKit } from "@tiptap/extension-text-style";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import { uploadImage } from "@/lib/db/image-actions";

/*
  게시글 본문 편집기.

  저장은 HTML 문자열로 하고, 서버에서 허용 태그만 남기도록 한 번 더 거른다
  (src/lib/html.ts). 편집기 화면과 실제 글 화면이 같은 .rich-text 스타일을
  쓰기 때문에 보이는 대로 저장된다.
*/

/*
  글자체는 보는 사람 컴퓨터에 그 글꼴이 있어야 그대로 보인다.
  윈도우·맥에 기본으로 깔린 것 위주로 고르고, 뒤에 대체 글꼴을 함께 적는다.
*/
const FONTS = [
  { label: "글자체", value: "" },
  { label: "맑은 고딕", value: "'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif" },
  { label: "돋움", value: "Dotum, 'Apple SD Gothic Neo', sans-serif" },
  { label: "굴림", value: "Gulim, 'Apple SD Gothic Neo', sans-serif" },
  { label: "바탕", value: "Batang, 'Apple Myungjo', serif" },
  { label: "궁서", value: "Gungsuh, 'Apple Myungjo', serif" },
  { label: "나눔고딕", value: "'Nanum Gothic', 'Malgun Gothic', sans-serif" },
  { label: "나눔명조", value: "'Nanum Myeongjo', Batang, serif" },
  { label: "본고딕", value: "'Noto Sans KR', 'Malgun Gothic', sans-serif" },
  { label: "본명조", value: "'Noto Serif KR', Batang, serif" },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Georgia", value: "Georgia, 'Times New Roman', serif" },
  { label: "Times New Roman", value: "'Times New Roman', Times, serif" },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { label: "Courier New", value: "'Courier New', Courier, monospace" },
];

const SIZES = [
  { label: "크기", value: "" },
  ...[10, 11, 12, 13, 14, 15, 16, 18, 20, 22, 24, 28, 32, 36, 48, 72].map((n) => ({
    label: String(n),
    value: `${n}px`,
  })),
];

const LINE_HEIGHTS = [
  { label: "줄간격", value: "" },
  { label: "좁게", value: "1.4" },
  { label: "보통", value: "1.9" },
  { label: "넓게", value: "2.4" },
];

/* 8칸씩 4줄. 무채색 → 따뜻한 색 → 초록 계열 → 파랑·보라 순 */
const COLORS = [
  "#000000", "#14202E", "#334155", "#64748B", "#94A3B8", "#CBD5E1", "#E2E8F0", "#FFFFFF",
  "#7F1D1D", "#B91C1C", "#D92D20", "#F05A28", "#FB923C", "#FDBA74", "#B45309", "#854D0E",
  "#CA8A04", "#EAB308", "#65A30D", "#15803D", "#12805C", "#10B981", "#0E9AA7", "#0891B2",
  "#062A55", "#1257A5", "#2563EB", "#0EA5E9", "#4F46E5", "#7C3AED", "#A855F7", "#DB2777",
];

/* 배경색은 글자가 읽히도록 옅은 색 위주로 둔다. */
const HIGHLIGHTS = [
  "#FEF9C3", "#FEF3C7", "#FDE68A", "#FACC15", "#FFEDD5", "#FED7AA", "#FECACA", "#FEE2E2",
  "#FCE7F3", "#FBCFE8", "#EDE9FE", "#DDD6FE", "#DBEAFE", "#BFDBFE", "#E0F2FE", "#BAE6FD",
  "#DCFCE7", "#BBF7D0", "#CCFBF1", "#A7F3D0", "#F1F5F9", "#E2E8F0", "#CBD5E1", "#FFFFFF",
];

const btn =
  "rounded px-2.5 py-1.5 text-base font-semibold text-ink-600 transition-colors hover:bg-white hover:text-brand-600 disabled:opacity-40 disabled:hover:bg-transparent";
const btnOn = "rounded px-2.5 py-1.5 text-base font-semibold bg-navy-900 text-white";
const select =
  "rounded border border-line bg-white px-2 py-1.5 text-base text-ink-700 outline-none focus:border-brand-500";

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()} /* 선택 영역을 잃지 않도록 */
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      title={title}
      className={active ? btnOn : btn}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-line" aria-hidden />;
}

/** 색 선택. 팔레트에서 고르거나 색상표에서 직접 고를 수 있다. */
function ColorPicker({
  title,
  swatches,
  current,
  onPick,
  onClear,
}: {
  title: string;
  swatches: string[];
  current?: string;
  onPick: (value: string) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative">
      <ToolbarButton title={title} onClick={() => setOpen((v) => !v)} active={open}>
        <span className="flex items-center gap-1.5">
          {title}
          <span
            className="inline-block size-3 rounded-sm ring-1 ring-line"
            style={{ background: current || "transparent" }}
            aria-hidden
          />
        </span>
      </ToolbarButton>

      {open && (
        <span className="absolute left-0 top-full z-20 mt-1 w-max rounded-md border border-line bg-white p-2 shadow-[0_10px_24px_-12px_rgba(6,42,85,0.4)]">
          <span className="grid grid-cols-8 gap-1">
            {swatches.map((color) => (
              <button
                key={color}
                type="button"
                title={color}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onPick(color);
                  setOpen(false);
                }}
                className="size-6 rounded ring-1 ring-line transition-transform hover:scale-110"
                style={{ background: color }}
              />
            ))}
          </span>

          <span className="mt-2 flex items-center gap-2 border-t border-line pt-2">
            <label className="flex cursor-pointer items-center gap-1.5 text-sm text-ink-600">
              직접 고르기
              <input
                type="color"
                defaultValue={current ?? "#1257A5"}
                onChange={(e) => onPick(e.target.value)}
                className="size-7 cursor-pointer rounded border border-line bg-white p-0.5"
              />
            </label>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onClear();
                setOpen(false);
              }}
              className="ml-auto rounded px-2 py-1 text-sm text-ink-600 ring-1 ring-line hover:bg-surface"
            >
              색 지우기
            </button>
          </span>
        </span>
      )}
    </span>
  );
}

function Toolbar({
  editor,
  htmlMode,
  onToggleHtml,
}: {
  editor: Editor;
  htmlMode: boolean;
  onToggleHtml: () => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addLink = useCallback(() => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("링크 주소를 입력하세요", previous ?? "https://");
    if (url === null) return;

    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    /* javascript: 같은 주소를 막는다 */
    if (!/^(https?:\/\/|mailto:|\/)/i.test(url)) {
      window.alert("http://, https://, mailto: 로 시작하는 주소만 넣을 수 있습니다.");
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const upload = async (file: File) => {
    setBusy(true);
    setError(null);

    const formData = new FormData();
    formData.append("image", file);
    const result = await uploadImage(formData);

    setBusy(false);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    editor.chain().focus().setImage({ src: result.url, alt: file.name }).run();
  };

  const inTable = editor.isActive("table");

  return (
    <div className="rounded-t-md border border-line bg-surface px-3 py-2">
      {/* 1줄: 글자 모양 */}
      <div className="flex flex-wrap items-center gap-1">
        <ToolbarButton
          title="되돌리기"
          disabled={htmlMode || !editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          ↶
        </ToolbarButton>
        <ToolbarButton
          title="다시 실행"
          disabled={htmlMode || !editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          ↷
        </ToolbarButton>

        <Divider />

        <select
          aria-label="글자체"
          className={select}
          value={(editor.getAttributes("textStyle").fontFamily as string) ?? ""}
          onChange={(e) =>
            e.target.value
              ? editor.chain().focus().setFontFamily(e.target.value).run()
              : editor.chain().focus().unsetFontFamily().run()
          }
        >
          {FONTS.map((f) => (
            <option key={f.label} value={f.value} style={f.value ? { fontFamily: f.value } : undefined}>
              {f.label}
            </option>
          ))}
        </select>

        <select
          aria-label="글자 크기"
          className={select}
          value={(editor.getAttributes("textStyle").fontSize as string) ?? ""}
          onChange={(e) =>
            e.target.value
              ? editor.chain().focus().setFontSize(e.target.value).run()
              : editor.chain().focus().unsetFontSize().run()
          }
        >
          {SIZES.map((s) => (
            <option key={s.label} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <ColorPicker
          title="글자색"
          swatches={COLORS}
          current={editor.getAttributes("textStyle").color as string | undefined}
          onPick={(v) => editor.chain().focus().setColor(v).run()}
          onClear={() => editor.chain().focus().unsetColor().run()}
        />
        <ColorPicker
          title="배경색"
          swatches={HIGHLIGHTS}
          current={editor.getAttributes("textStyle").backgroundColor as string | undefined}
          onPick={(v) => editor.chain().focus().setBackgroundColor(v).run()}
          onClear={() => editor.chain().focus().unsetBackgroundColor().run()}
        />

        <Divider />

        <ToolbarButton
          title="굵게"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <b>가</b>
        </ToolbarButton>
        <ToolbarButton
          title="기울임"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <i>가</i>
        </ToolbarButton>
        <ToolbarButton
          title="밑줄"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <u>가</u>
        </ToolbarButton>
        <ToolbarButton
          title="취소선"
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <s>가</s>
        </ToolbarButton>
        <ToolbarButton
          title="글자 코드"
          active={editor.isActive("code")}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          {"</>"}
        </ToolbarButton>
        <ToolbarButton
          title="서식 지우기"
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
        >
          서식 지우기
        </ToolbarButton>
      </div>

      {/* 2줄: 문단 모양과 넣기 */}
      <div className="mt-1.5 flex flex-wrap items-center gap-1 border-t border-line pt-1.5">
        <select
          aria-label="문단 종류"
          className={select}
          value={
            editor.isActive("heading", { level: 2 })
              ? "2"
              : editor.isActive("heading", { level: 3 })
                ? "3"
                : editor.isActive("heading", { level: 4 })
                  ? "4"
                  : ""
          }
          onChange={(e) => {
            const level = Number(e.target.value);
            if (!level) editor.chain().focus().setParagraph().run();
            else editor.chain().focus().setHeading({ level: level as 2 | 3 | 4 }).run();
          }}
        >
          <option value="">본문</option>
          <option value="2">큰 제목</option>
          <option value="3">중간 제목</option>
          <option value="4">작은 제목</option>
        </select>

        <select
          aria-label="줄간격"
          className={select}
          value={(editor.getAttributes("paragraph").lineHeight as string) ?? ""}
          onChange={(e) =>
            e.target.value
              ? editor.chain().focus().setLineHeight(e.target.value).run()
              : editor.chain().focus().unsetLineHeight().run()
          }
        >
          {LINE_HEIGHTS.map((l) => (
            <option key={l.label} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>

        <Divider />

        <ToolbarButton
          title="글머리표 목록"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          목록
        </ToolbarButton>
        <ToolbarButton
          title="번호 목록"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          번호
        </ToolbarButton>
        <ToolbarButton
          title="인용"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          인용
        </ToolbarButton>
        <ToolbarButton
          title="코드 블록"
          active={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          코드
        </ToolbarButton>

        <Divider />

        {(["left", "center", "right", "justify"] as const).map((align) => (
          <ToolbarButton
            key={align}
            title={
              { left: "왼쪽 정렬", center: "가운데 정렬", right: "오른쪽 정렬", justify: "양쪽 정렬" }[
                align
              ]
            }
            active={editor.isActive({ textAlign: align })}
            onClick={() => editor.chain().focus().setTextAlign(align).run()}
          >
            {{ left: "◧", center: "▣", right: "◨", justify: "▤" }[align]}
          </ToolbarButton>
        ))}

        <Divider />

        <ToolbarButton title="링크" active={editor.isActive("link")} onClick={addLink}>
          링크
        </ToolbarButton>
        <ToolbarButton
          title="링크 해제"
          disabled={!editor.isActive("link")}
          onClick={() => editor.chain().focus().unsetLink().run()}
        >
          링크 해제
        </ToolbarButton>
        <ToolbarButton title="이미지 넣기" onClick={() => fileInput.current?.click()}>
          {busy ? "올리는 중…" : "이미지"}
        </ToolbarButton>
        <ToolbarButton
          title="표 넣기 (3×3)"
          onClick={() =>
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
          }
        >
          표
        </ToolbarButton>
        <ToolbarButton
          title="구분선"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          구분선
        </ToolbarButton>

        <Divider />

        <ToolbarButton title="HTML 직접 편집" active={htmlMode} onClick={onToggleHtml}>
          HTML
        </ToolbarButton>

        <input
          ref={fileInput}
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) void upload(file);
          }}
        />
      </div>

      {/* 3줄: 표 안에 있을 때만 */}
      {inTable && !htmlMode && (
        <div className="mt-1.5 flex flex-wrap items-center gap-1 border-t border-line pt-1.5">
          <span className="px-1 text-sm font-semibold text-ink-400">표</span>
          <ToolbarButton title="위에 행 추가" onClick={() => editor.chain().focus().addRowBefore().run()}>
            행 위
          </ToolbarButton>
          <ToolbarButton title="아래에 행 추가" onClick={() => editor.chain().focus().addRowAfter().run()}>
            행 아래
          </ToolbarButton>
          <ToolbarButton title="행 삭제" onClick={() => editor.chain().focus().deleteRow().run()}>
            행 삭제
          </ToolbarButton>
          <ToolbarButton title="왼쪽에 열 추가" onClick={() => editor.chain().focus().addColumnBefore().run()}>
            열 왼쪽
          </ToolbarButton>
          <ToolbarButton title="오른쪽에 열 추가" onClick={() => editor.chain().focus().addColumnAfter().run()}>
            열 오른쪽
          </ToolbarButton>
          <ToolbarButton title="열 삭제" onClick={() => editor.chain().focus().deleteColumn().run()}>
            열 삭제
          </ToolbarButton>
          <ToolbarButton title="셀 합치기·나누기" onClick={() => editor.chain().focus().mergeOrSplit().run()}>
            셀 합치기
          </ToolbarButton>
          <ToolbarButton title="표 삭제" onClick={() => editor.chain().focus().deleteTable().run()}>
            표 삭제
          </ToolbarButton>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-2 text-base font-medium text-flame-700">
          {error}
        </p>
      )}
    </div>
  );
}

export default function RichTextEditor({
  name,
  defaultValue = "",
}: {
  /** 폼으로 함께 넘어갈 hidden input 이름 */
  name: string;
  defaultValue?: string;
}) {
  const [html, setHtml] = useState(defaultValue);
  const [htmlMode, setHtmlMode] = useState(false);
  const [draft, setDraft] = useState(defaultValue);

  /*
    Tiptap 3 은 상태가 바뀌어도 이 컴포넌트를 다시 그리지 않는다.
    커서만 옮겼을 때(선택 변경)도 툴바의 활성 표시와 표 도구가 따라오도록
    트랜잭션마다 다시 그린다.
  */
  const [, rerender] = useReducer((n: number) => n + 1, 0);

  const editor = useEditor({
    immediatelyRender: false, // 서버 렌더와 어긋나지 않도록
    extensions: [
      StarterKit.configure({
        link: { openOnClick: false, HTMLAttributes: { rel: "noreferrer noopener" } },
      }),
      TextStyleKit,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Image.configure({ HTMLAttributes: { class: "rich-image" } }),
      TableKit.configure({ table: { resizable: true } }),
    ],
    content: defaultValue,
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "rich-text min-h-[360px] rounded-b-md border border-t-0 border-line bg-white px-5 py-4 outline-none focus:border-brand-500",
      },
      /* 이미지를 붙여넣거나 끌어다 놓으면 바로 올린다 */
      handlePaste: (_view, event) => {
        const file = [...(event.clipboardData?.files ?? [])][0];
        if (!file?.type.startsWith("image/")) return false;
        event.preventDefault();
        void uploadPasted(file);
        return true;
      },
      handleDrop: (_view, event) => {
        const file = [...((event as DragEvent).dataTransfer?.files ?? [])][0];
        if (!file?.type.startsWith("image/")) return false;
        event.preventDefault();
        void uploadPasted(file);
        return true;
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.on("transaction", rerender);
    return () => {
      editor.off("transaction", rerender);
    };
  }, [editor]);

  async function uploadPasted(file: File) {
    const formData = new FormData();
    formData.append("image", file);
    const result = await uploadImage(formData);
    if ("url" in result) {
      editor?.chain().focus().setImage({ src: result.url, alt: file.name }).run();
    }
  }

  /* HTML 모드에서 돌아올 때 편집기에 반영한다. */
  const toggleHtmlMode = () => {
    if (htmlMode) {
      editor?.commands.setContent(draft, { emitUpdate: true });
      setHtml(draft);
      setHtmlMode(false);
    } else {
      setDraft(html);
      setHtmlMode(true);
    }
  };

  return (
    <div>
      {editor && <Toolbar editor={editor} htmlMode={htmlMode} onToggleHtml={toggleHtmlMode} />}

      {/* 편집기는 계속 살려 두고 HTML 모드일 때만 가린다 (내용을 잃지 않도록) */}
      <div className={htmlMode ? "hidden" : undefined}>
        <EditorContent editor={editor} />
      </div>

      {htmlMode && (
        <div>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            spellCheck={false}
            className="label-mono min-h-[360px] w-full rounded-b-md border border-t-0 border-line bg-navy-950 px-5 py-4 text-sm leading-relaxed text-brand-100 outline-none focus:border-brand-500"
          />
          <p className="mt-2 text-sm text-ink-400">
            HTML을 직접 고칠 수 있습니다. 다시 <b className="font-semibold">HTML</b> 버튼을 누르면
            편집 화면에 반영됩니다. 저장할 때 허용되지 않는 태그는 자동으로 제거됩니다.
          </p>
        </div>
      )}

      {/* 서버 액션은 폼 데이터로 받으므로 HTML 을 숨은 입력으로 함께 보낸다 */}
      <input type="hidden" name={name} value={htmlMode ? draft : html} />
    </div>
  );
}
