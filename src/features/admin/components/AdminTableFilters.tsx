import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

type AdminTableFiltersProps = {
  keyword: string;
  onKeywordChange: (value: string) => void;
  keywordPlaceholder?: string;
  status: string;
  onStatusChange: (value: string) => void;
  summary?: string;
  extraFilters?: React.ReactNode;
};

export function AdminTableFilters({
  keyword,
  onKeywordChange,
  keywordPlaceholder = 'Tìm kiếm...',
  status,
  onStatusChange,
  summary,
  extraFilters,
}: AdminTableFiltersProps) {
  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1.4fr)_220px] xl:grid-cols-[minmax(0,1.6fr)_220px_auto]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={keyword}
            onChange={(event) => onKeywordChange(event.target.value)}
            placeholder={keywordPlaceholder}
            className="h-11 rounded-xl border-slate-200 bg-white pl-10"
          />
        </label>

        <select
          value={status}
          onChange={(event) => onStatusChange(event.target.value)}
          aria-label="Lọc trạng thái hiển thị"
          title="Lọc trạng thái hiển thị"
          className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-sky-300"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="visible">Đang hiển thị</option>
          <option value="hidden">Đang ẩn</option>
        </select>

        {extraFilters ? <div className="flex items-center gap-3">{extraFilters}</div> : null}
      </div>

      {summary ? <div className="text-sm text-slate-500">{summary}</div> : null}
    </div>
  );
}
