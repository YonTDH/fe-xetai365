const BLOCKED_TAGS = /<(script|style|iframe|object|embed|link|meta)\b[\s\S]*?>[\s\S]*?<\/\1>/gi;
const BLOCKED_SELF_CLOSING_TAGS = /<(script|style|iframe|object|embed|link|meta)\b[^>]*\/?>/gi;
const INLINE_EVENT_HANDLERS = /\son[a-z]+\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi;
const JS_PROTOCOL_ATTRS = /\s(href|src)\s*=\s*("javascript:[^"]*"|'javascript:[^']*'|javascript:[^\s>]+)/gi;

export function sanitizeHtml(html: string) {
  if (!html) {
    return '';
  }

  return html
    .replace(BLOCKED_TAGS, '')
    .replace(BLOCKED_SELF_CLOSING_TAGS, '')
    .replace(INLINE_EVENT_HANDLERS, '')
    .replace(JS_PROTOCOL_ATTRS, ' $1="#"');
}

