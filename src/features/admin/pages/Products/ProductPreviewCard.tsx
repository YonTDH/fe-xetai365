import { formatCurrencyVnd } from '@/lib/formatCurrencyVnd';
import { sanitizeHtml } from '@/lib/sanitizeHtml';
import type { FormState } from './productModalTypes';
import { hasHtml, translateProductStatus } from './productModalUtils';

export function ProductPreviewCard({
  form,
  previewImageUrl,
  compact = false,
}: {
  form: FormState;
  previewImageUrl: string;
  compact?: boolean;
}) {
  const previewHtml = hasHtml(form.content);

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {previewImageUrl ? (
        <img src={previewImageUrl} alt={form.title || 'Ảnh sản phẩm'} className={compact ? 'h-36 w-full object-cover' : 'h-44 w-full object-cover'} />
      ) : (
        <div className={['flex items-center justify-center bg-slate-100 text-sm font-medium text-slate-600', compact ? 'h-36' : 'h-44'].join(' ')}>
          Chưa có ảnh đại diện
        </div>
      )}
      <div className="space-y-3 p-4">
        <div className="space-y-1">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">{translateProductStatus(form.status)}</div>
          <h3 className="line-clamp-2 text-xl font-black leading-6 text-slate-950">{form.title || 'Tên sản phẩm'}</h3>
          <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-700">
            <span>{form.brand || 'Chưa có hãng'}</span>
            <span>-</span>
            <span>{form.location || 'Chưa có vị trí'}</span>
          </div>
        </div>
        <div className="text-lg font-bold text-[#135a91]">{formatCurrencyVnd(form.priceVnd)}</div>
        <p className="line-clamp-3 whitespace-pre-line text-sm leading-6 font-medium text-slate-700">
          {form.shortDescription || 'Mô tả ngắn sẽ hiển thị ở đây.'}
        </p>
        {!compact ? (
          previewHtml ? (
            <div
              className="rich-content prose prose-slate max-w-none text-sm leading-7 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-md [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-slate-200 [&_td]:p-2 [&_th]:border [&_th]:border-slate-200 [&_th]:bg-slate-50 [&_th]:p-2"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(form.content) }}
            />
          ) : (
            <div className="max-h-72 overflow-y-auto whitespace-pre-line rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm leading-7 font-medium text-slate-700">
              {form.content || 'Nội dung chi tiết sẽ hiển thị ở đây.'}
            </div>
          )
        ) : null}
      </div>
    </article>
  );
}

