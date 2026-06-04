import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import JoditEditor from 'jodit-react';
import type { IJodit } from 'jodit/esm/types/jodit';
import 'jodit/es2021/jodit.min.css';
import {
  Bold,
  Heading2,
  ImagePlus,
  Italic,
  Link,
  List,
  ListOrdered,
  Quote,
  Underline,
} from 'lucide-react';
import { uploadAdminImage } from '../../api/adminApi';
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
  const editorRef = useRef<IJodit | null>(null);
  const editorShellRef = useRef<HTMLDivElement | null>(null);

  const closeJoditPopups = useCallback(() => {
    editorRef.current?.e?.fire?.('closeAllPopups');
  }, []);

  useEffect(() => {
    const closePopupsOnOutsideClick = (event: MouseEvent | TouchEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }

      const targetElement = target instanceof Element ? target : target.parentElement;
      if (targetElement?.closest('.jodit-popup')) {
        return;
      }

      if (!editorShellRef.current?.contains(target)) {
        closeJoditPopups();
      }
    };

    document.addEventListener('mousedown', closePopupsOnOutsideClick, true);
    document.addEventListener('touchstart', closePopupsOnOutsideClick, true);

    return () => {
      document.removeEventListener('mousedown', closePopupsOnOutsideClick, true);
      document.removeEventListener('touchstart', closePopupsOnOutsideClick, true);
    };
  }, [closeJoditPopups]);

  const handleEditorMouseDownCapture = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const target = event.target;
      if (!(target instanceof Element) || target.closest('.jodit-popup')) {
        return;
      }

      closeJoditPopups();
    },
    [closeJoditPopups]
  );

  const config = useMemo(
    () => ({
      readonly: readOnly || disabled,
      height: 'calc(100vh - 180px)',
      minHeight: 620,
      toolbarAdaptive: false,
      toolbarSticky: true,
      toolbarStickyOffset: 0,
      toolbarDisableStickyForMobile: false,
      showCharsCounter: false,
      showWordsCounter: false,
      showXPathInStatusbar: false,
      askBeforePasteHTML: false,
      askBeforePasteFromWord: false,
      defaultActionOnPaste: 'insert_as_html' as const,
      uploader: {
        insertImageAsBase64URI: true,
      },
      buttons: [
        'source', '|', 'save', 'print', 'preview', '|',
        'cut', 'copy', 'paste', 'selectall', '|',
        'undo', 'redo', '|',
        'find', 'replace', '|',
        'bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript', 'eraser', '|',
        'ul', 'ol', 'outdent', 'indent', '|',
        'quote', 'paragraph', 'align', '|',
        'font', 'fontsize', 'brush', 'lineHeight', '|',
        'link', 'unlink', 'image', 'table', 'hr', 'symbol', 'fullsize', 'about',
      ],
      controls: {
        save: {
          exec: () => undefined,
        },
      },
      placeholder: 'Nhập nội dung sản phẩm...',
    }),
    [disabled, readOnly]
  );

  return (
    <div
      ref={editorShellRef}
      className="overflow-visible rounded-xl border border-slate-200 bg-white [&_.jodit-container]:border-0 [&_.jodit-container]:!min-h-[620px] [&_.jodit-container]:!overflow-visible [&_.jodit-toolbar__box]:sticky [&_.jodit-toolbar__box]:top-0 [&_.jodit-toolbar__box]:z-30 [&_.jodit-toolbar__box]:border-slate-200 [&_.jodit-workplace]:!min-h-[calc(100vh-300px)]"
      onMouseDownCapture={handleEditorMouseDownCapture}
    >
      <JoditEditor
        ref={editorRef}
        value={value || ''}
        config={config}
        tabIndex={1}
        onBlur={(nextContent) => onChange(nextContent)}
        onChange={() => undefined}
      />
    </div>
  );
}
