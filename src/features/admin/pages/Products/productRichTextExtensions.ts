import type { Extensions } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import TiptapImage from '@tiptap/extension-image';
import TiptapLink from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import TiptapUnderline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import TiptapSubscript from '@tiptap/extension-subscript';
import TiptapSuperscript from '@tiptap/extension-superscript';

const EXTENSIONS_CACHE_KEY = '__xetai365_productEditorExtensions';

function createProductEditorExtensions(): Extensions {
  return [
    StarterKit.configure({
      heading: {
        levels: [2, 3],
      },
      link: false,
    }),
    TiptapUnderline,
    TiptapLink.configure({
      openOnClick: false,
      autolink: true,
      defaultProtocol: 'https',
    }),
    TiptapImage.configure({
      HTMLAttributes: {
        class: 'rounded-md',
      },
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    TextStyle,
    Color,
    Highlight.configure({
      multicolor: true,
    }),
    TiptapSubscript,
    TiptapSuperscript,
  ];
}

export function getProductEditorExtensions(): Extensions {
  const cache = globalThis as typeof globalThis & {
    [EXTENSIONS_CACHE_KEY]?: Extensions;
  };

  if (!cache[EXTENSIONS_CACHE_KEY]) {
    cache[EXTENSIONS_CACHE_KEY] = createProductEditorExtensions();
  }

  return cache[EXTENSIONS_CACHE_KEY];
}
