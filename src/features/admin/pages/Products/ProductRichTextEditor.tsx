import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Eraser,
  Heading2,
  Heading3,
  Highlighter,
  ImagePlus,
  Italic,
  Link,
  List,
  ListOrdered,
  Minus,
  Pilcrow,
  Quote,
  Redo2,
  Strikethrough,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Underline,
  Undo2,
} from 'lucide-react';
import { EditorContent, useEditor } from '@tiptap/react';
import { uploadAdminImage } from '../../api/adminApi';
import { getProductEditorExtensions } from './productRichTextExtensions';
import { escapeAttribute } from './productModalUtils';

export function LegacyRichTextEditor({
  value,
  readOnly,
  disabled,
  onChange,
}: {
  value: string;
  readOnly: boolean;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const isComposingRef = useRef(false);
  const [isUploadingInlineImage, setIsUploadingInlineImage] = useState(false);
  const [inlineImageError, setInlineImageError] = useState('');

  const saveSelection = useCallback(() => {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection || selection.rangeCount === 0) {
      return;
    }

    const range = selection.getRangeAt(0);
    if (editor.contains(range.commonAncestorContainer)) {
      savedRangeRef.current = range.cloneRange();
    }
  }, []);

  const restoreSelection = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }

    editor.focus();
    const selection = window.getSelection();
    if (!selection) {
      return;
    }

    selection.removeAllRanges();
    if (savedRangeRef.current) {
      selection.addRange(savedRangeRef.current);
      return;
    }

    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    selection.addRange(range);
  }, []);

  const emitChange = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }
    if (isComposingRef.current) {
      return;
    }
    onChange(editor.innerHTML);
    saveSelection();
  }, [onChange, saveSelection]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }
    if (document.activeElement !== editor && editor.innerHTML !== value) {
      editor.innerHTML = value || '';
    }
  }, [value]);

  const runCommand = useCallback(
    (command: string, commandValue?: string) => {
      if (readOnly || disabled) {
        return;
      }
      restoreSelection();
      document.execCommand(command, false, commandValue);
      emitChange();
    },
    [disabled, emitChange, readOnly, restoreSelection]
  );

  const insertHtml = useCallback(
    (html: string) => {
      restoreSelection();
      document.execCommand('insertHTML', false, html);
      emitChange();
    },
    [emitChange, restoreSelection]
  );

  const uploadInlineImage = useCallback(
    async (file: File) => {
      if (readOnly || disabled) {
        return;
      }

      try {
        setIsUploadingInlineImage(true);
        setInlineImageError('');
        const uploaded = await uploadAdminImage(file, 'products');
        const alt = escapeAttribute(file.name.replace(/\.[^.]+$/, '') || 'Ảnh sản phẩm');
        insertHtml(
          `<figure><img src="${escapeAttribute(uploaded.imageUrl)}" alt="${alt}" /><figcaption>${alt}</figcaption></figure><p><br></p>`
        );
      } catch (err) {
        setInlineImageError(err instanceof Error ? err.message : 'Không thể upload ảnh vào nội dung.');
      } finally {
        setIsUploadingInlineImage(false);
      }
    },
    [disabled, insertHtml, readOnly]
  );

  const handlePaste = useCallback(
    (event: React.ClipboardEvent<HTMLDivElement>) => {
      const imageFile = Array.from(event.clipboardData.files).find((file) => file.type.startsWith('image/'));
      if (!imageFile) {
        saveSelection();
        return;
      }

      event.preventDefault();
      void uploadInlineImage(imageFile);
    },
    [saveSelection, uploadInlineImage]
  );

  const handleLink = () => {
    if (readOnly || disabled) {
      return;
    }
    saveSelection();
    const url = window.prompt('Nhập liên kết');
    if (!url) {
      return;
    }
    runCommand('createLink', url);
  };

  const toolbarButtonClass =
    'inline-flex h-8 min-w-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-2 text-sm font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-slate-100 disabled:pointer-events-none disabled:opacity-50';

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      {!readOnly ? (
        <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 px-2 py-2">
          <button type="button" className={toolbarButtonClass} onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand('bold')} disabled={disabled} title="In đậm">
            <Bold className="h-4 w-4" />
          </button>
          <button type="button" className={toolbarButtonClass} onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand('italic')} disabled={disabled} title="In nghiêng">
            <Italic className="h-4 w-4" />
          </button>
          <button type="button" className={toolbarButtonClass} onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand('underline')} disabled={disabled} title="Gạch chân">
            <Underline className="h-4 w-4" />
          </button>
          <button type="button" className={toolbarButtonClass} onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand('formatBlock', 'h2')} disabled={disabled} title="Tiêu đề">
            <Heading2 className="h-4 w-4" />
          </button>
          <button type="button" className={toolbarButtonClass} onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand('formatBlock', 'blockquote')} disabled={disabled} title="Trích dẫn">
            <Quote className="h-4 w-4" />
          </button>
          <button type="button" className={toolbarButtonClass} onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand('insertUnorderedList')} disabled={disabled} title="Danh sách">
            <List className="h-4 w-4" />
          </button>
          <button type="button" className={toolbarButtonClass} onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand('insertOrderedList')} disabled={disabled} title="Danh sách số">
            <ListOrdered className="h-4 w-4" />
          </button>
          <button type="button" className={toolbarButtonClass} onMouseDown={(event) => event.preventDefault()} onClick={handleLink} disabled={disabled} title="Chèn link">
            <Link className="h-4 w-4" />
          </button>
          <label
            className={[
              toolbarButtonClass,
              disabled || isUploadingInlineImage ? 'pointer-events-none opacity-50' : 'cursor-pointer',
            ].join(' ')}
            title="Upload ảnh vào nội dung"
            onMouseDown={() => saveSelection()}
          >
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={disabled || isUploadingInlineImage}
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = '';
                if (file) {
                  void uploadInlineImage(file);
                }
              }}
            />
            <ImagePlus className="h-4 w-4" />
          </label>
          <button type="button" className={toolbarButtonClass} onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand('removeFormat')} disabled={disabled} title="Xóa định dạng">
            Tx
          </button>
          {isUploadingInlineImage ? <span className="px-2 text-xs font-medium text-slate-700">Đang upload ảnh...</span> : null}
        </div>
      ) : null}
      <div
        ref={editorRef}
        contentEditable={!readOnly && !disabled}
        suppressContentEditableWarning
        className="rich-content h-[420px] overflow-y-auto px-3 py-2 text-sm leading-7 text-slate-900 outline-none empty:before:text-slate-500 focus:ring-4 focus:ring-sky-100 [&_blockquote]:border-l-4 [&_blockquote]:border-sky-200 [&_blockquote]:pl-3 [&_blockquote]:text-slate-700 [&_figure]:my-4 [&_figcaption]:mt-2 [&_figcaption]:text-center [&_figcaption]:text-xs [&_figcaption]:font-medium [&_figcaption]:text-slate-600 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-md [&_li]:ml-5"
        onInput={emitChange}
        onFocus={saveSelection}
        onBlur={saveSelection}
        onClick={saveSelection}
        onKeyUp={saveSelection}
        onMouseUp={saveSelection}
        onPaste={handlePaste}
        onCompositionStart={() => {
          isComposingRef.current = true;
        }}
        onCompositionEnd={() => {
          isComposingRef.current = false;
          emitChange();
        }}
      />
      {inlineImageError ? <div className="border-t border-red-100 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{inlineImageError}</div> : null}
    </div>
  );
}

export function RichTextEditor({
  value,
  readOnly,
  disabled,
  onChange,
}: {
  value: string;
  readOnly: boolean;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  const [isUploadingInlineImage, setIsUploadingInlineImage] = useState(false);
  const [inlineImageError, setInlineImageError] = useState('');

  const editor = useEditor({
    extensions: getProductEditorExtensions(),
    content: value || '',
    editable: !readOnly && !disabled,
    immediatelyRender: false,
    onUpdate: ({ editor: nextEditor }) => {
      onChange(nextEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    editor.setEditable(!readOnly && !disabled);
  }, [disabled, editor, readOnly]);

  useEffect(() => {
    if (!editor || editor.isFocused || editor.getHTML() === value) {
      return;
    }

    editor.commands.setContent(value || '', { emitUpdate: false });
  }, [editor, value]);

  const runEditorAction = (action: () => void) => {
    if (!editor || readOnly || disabled) {
      return;
    }

    action();
  };

  const uploadInlineImage = useCallback(
    async (file: File) => {
      if (!editor || readOnly || disabled) {
        return;
      }

      try {
        setIsUploadingInlineImage(true);
        setInlineImageError('');
        const uploaded = await uploadAdminImage(file, 'products');
        const alt = file.name.replace(/\.[^.]+$/, '') || 'Ảnh sản phẩm';
        editor.chain().focus().setImage({ src: uploaded.imageUrl, alt }).createParagraphNear().run();
      } catch (err) {
        setInlineImageError(err instanceof Error ? err.message : 'Không thể upload ảnh vào nội dung.');
      } finally {
        setIsUploadingInlineImage(false);
      }
    },
    [disabled, editor, readOnly]
  );

  const handlePaste = useCallback(
    (event: React.ClipboardEvent<HTMLDivElement>) => {
      const imageFile = Array.from(event.clipboardData.files).find((file) => file.type.startsWith('image/'));
      if (!imageFile) {
        return;
      }

      event.preventDefault();
      void uploadInlineImage(imageFile);
    },
    [uploadInlineImage]
  );

  const handleLink = () => {
    if (!editor || readOnly || disabled) {
      return;
    }

    const previousUrl = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Nhập liên kết', previousUrl || '');
    if (!url) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const toolbarButtonClass =
    'inline-flex h-8 min-w-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-2 text-sm font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-slate-100 disabled:pointer-events-none disabled:opacity-50';
  const toolbarSelectClass =
    'h-8 rounded-lg border border-slate-200 bg-white px-2 text-sm font-semibold text-slate-800 outline-none transition hover:border-slate-300 disabled:pointer-events-none disabled:opacity-50';
  const isToolbarDisabled = disabled || !editor;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      {!readOnly ? (
        <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 px-2 py-2">
          <select
            className={toolbarSelectClass}
            disabled={isToolbarDisabled}
            value={editor?.isActive('heading', { level: 2 }) ? 'h2' : editor?.isActive('heading', { level: 3 }) ? 'h3' : 'paragraph'}
            aria-label="Kiểu đoạn"
            title="Kiểu đoạn"
            onChange={(event) => {
              runEditorAction(() => {
                if (event.target.value === 'h2') {
                  editor?.chain().focus().toggleHeading({ level: 2 }).run();
                } else if (event.target.value === 'h3') {
                  editor?.chain().focus().toggleHeading({ level: 3 }).run();
                } else {
                  editor?.chain().focus().setParagraph().run();
                }
              });
            }}
          >
            <option value="paragraph">Đoạn</option>
            <option value="h2">Tiêu đề 2</option>
            <option value="h3">Tiêu đề 3</option>
          </select>

          <button type="button" className={toolbarButtonClass} onClick={() => runEditorAction(() => editor?.chain().focus().undo().run())} disabled={isToolbarDisabled} title="Hoàn tác">
            <Undo2 className="h-4 w-4" />
          </button>
          <button type="button" className={toolbarButtonClass} onClick={() => runEditorAction(() => editor?.chain().focus().redo().run())} disabled={isToolbarDisabled} title="Làm lại">
            <Redo2 className="h-4 w-4" />
          </button>
          <button type="button" className={toolbarButtonClass} onClick={() => runEditorAction(() => editor?.chain().focus().toggleBold().run())} disabled={isToolbarDisabled} title="In đậm">
            <Bold className="h-4 w-4" />
          </button>
          <button type="button" className={toolbarButtonClass} onClick={() => runEditorAction(() => editor?.chain().focus().toggleItalic().run())} disabled={isToolbarDisabled} title="In nghiêng">
            <Italic className="h-4 w-4" />
          </button>
          <button type="button" className={toolbarButtonClass} onClick={() => runEditorAction(() => editor?.chain().focus().toggleUnderline().run())} disabled={isToolbarDisabled} title="Gạch chân">
            <Underline className="h-4 w-4" />
          </button>
          <button type="button" className={toolbarButtonClass} onClick={() => runEditorAction(() => editor?.chain().focus().toggleStrike().run())} disabled={isToolbarDisabled} title="Gạch ngang">
            <Strikethrough className="h-4 w-4" />
          </button>
          <button type="button" className={toolbarButtonClass} onClick={() => runEditorAction(() => editor?.chain().focus().toggleSubscript().run())} disabled={isToolbarDisabled} title="Chỉ số dưới">
            <SubscriptIcon className="h-4 w-4" />
          </button>
          <button type="button" className={toolbarButtonClass} onClick={() => runEditorAction(() => editor?.chain().focus().toggleSuperscript().run())} disabled={isToolbarDisabled} title="Chỉ số trên">
            <SuperscriptIcon className="h-4 w-4" />
          </button>
          <button type="button" className={toolbarButtonClass} onClick={() => runEditorAction(() => editor?.chain().focus().toggleHeading({ level: 2 }).run())} disabled={isToolbarDisabled} title="Tiêu đề 2">
            <Heading2 className="h-4 w-4" />
          </button>
          <button type="button" className={toolbarButtonClass} onClick={() => runEditorAction(() => editor?.chain().focus().toggleHeading({ level: 3 }).run())} disabled={isToolbarDisabled} title="Tiêu đề 3">
            <Heading3 className="h-4 w-4" />
          </button>
          <button type="button" className={toolbarButtonClass} onClick={() => runEditorAction(() => editor?.chain().focus().setParagraph().run())} disabled={isToolbarDisabled} title="Đoạn văn">
            <Pilcrow className="h-4 w-4" />
          </button>
          <button type="button" className={toolbarButtonClass} onClick={() => runEditorAction(() => editor?.chain().focus().toggleBlockquote().run())} disabled={isToolbarDisabled} title="Trích dẫn">
            <Quote className="h-4 w-4" />
          </button>
          <button type="button" className={toolbarButtonClass} onClick={() => runEditorAction(() => editor?.chain().focus().toggleBulletList().run())} disabled={isToolbarDisabled} title="Danh sách">
            <List className="h-4 w-4" />
          </button>
          <button type="button" className={toolbarButtonClass} onClick={() => runEditorAction(() => editor?.chain().focus().toggleOrderedList().run())} disabled={isToolbarDisabled} title="Danh sách số">
            <ListOrdered className="h-4 w-4" />
          </button>
          <button type="button" className={toolbarButtonClass} onClick={() => runEditorAction(() => editor?.chain().focus().setTextAlign('left').run())} disabled={isToolbarDisabled} title="Căn trái">
            <AlignLeft className="h-4 w-4" />
          </button>
          <button type="button" className={toolbarButtonClass} onClick={() => runEditorAction(() => editor?.chain().focus().setTextAlign('center').run())} disabled={isToolbarDisabled} title="Căn giữa">
            <AlignCenter className="h-4 w-4" />
          </button>
          <button type="button" className={toolbarButtonClass} onClick={() => runEditorAction(() => editor?.chain().focus().setTextAlign('right').run())} disabled={isToolbarDisabled} title="Căn phải">
            <AlignRight className="h-4 w-4" />
          </button>
          <button type="button" className={toolbarButtonClass} onClick={() => runEditorAction(() => editor?.chain().focus().setTextAlign('justify').run())} disabled={isToolbarDisabled} title="Căn đều">
            <AlignJustify className="h-4 w-4" />
          </button>
          <label className="inline-flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white px-2 text-sm font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-slate-100" title="Màu chữ">
            <span className="sr-only">Màu chữ</span>
            <input
              type="color"
              className="h-5 w-5 cursor-pointer border-0 bg-transparent p-0"
              disabled={isToolbarDisabled}
              onInput={(event) => runEditorAction(() => editor?.chain().focus().setColor(event.currentTarget.value).run())}
            />
          </label>
          <label className="inline-flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white px-2 text-sm font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-slate-100" title="Màu nền">
            <Highlighter className="mr-1 h-4 w-4" />
            <input
              type="color"
              className="h-5 w-5 cursor-pointer border-0 bg-transparent p-0"
              disabled={isToolbarDisabled}
              onInput={(event) => runEditorAction(() => editor?.chain().focus().toggleHighlight({ color: event.currentTarget.value }).run())}
            />
          </label>
          <button type="button" className={toolbarButtonClass} onClick={handleLink} disabled={isToolbarDisabled} title="Chèn link">
            <Link className="h-4 w-4" />
          </button>
          <label
            className={[
              toolbarButtonClass,
              isToolbarDisabled || isUploadingInlineImage ? 'pointer-events-none opacity-50' : 'cursor-pointer',
            ].join(' ')}
            title="Upload ảnh vào nội dung"
          >
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={isToolbarDisabled || isUploadingInlineImage}
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = '';
                if (file) {
                  void uploadInlineImage(file);
                }
              }}
            />
            <ImagePlus className="h-4 w-4" />
          </label>
          <button type="button" className={toolbarButtonClass} onClick={() => runEditorAction(() => editor?.chain().focus().setHorizontalRule().run())} disabled={isToolbarDisabled} title="Đường kẻ ngang">
            <Minus className="h-4 w-4" />
          </button>
          <button
            type="button"
            className={toolbarButtonClass}
            onClick={() => runEditorAction(() => editor?.chain().focus().unsetAllMarks().clearNodes().run())}
            disabled={isToolbarDisabled}
            title="Xóa định dạng"
          >
            <Eraser className="h-4 w-4" />
          </button>
          {isUploadingInlineImage ? <span className="px-2 text-xs font-medium text-slate-700">Đang upload ảnh...</span> : null}
        </div>
      ) : null}
      <EditorContent
        editor={editor}
        className="rich-content h-[420px] overflow-y-auto px-3 py-2 text-sm leading-7 text-slate-900 outline-none focus-within:ring-4 focus-within:ring-sky-100 [&_.ProseMirror]:min-h-full [&_.ProseMirror]:outline-none [&_blockquote]:border-l-4 [&_blockquote]:border-sky-200 [&_blockquote]:pl-3 [&_blockquote]:text-slate-700 [&_hr]:my-4 [&_hr]:border-slate-200 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-md [&_li]:ml-5"
        onPaste={handlePaste}
      />
      {inlineImageError ? <div className="border-t border-red-100 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{inlineImageError}</div> : null}
    </div>
  );
}

