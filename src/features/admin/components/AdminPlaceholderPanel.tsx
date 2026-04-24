import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AdminSectionKey } from '../config/menu';
import { adminSectionMeta } from '../config/menu';

export function AdminPlaceholderPanel({ section }: { section: AdminSectionKey }) {
  const meta = adminSectionMeta[section];
  const Icon = meta.icon;

  return (
    <Card className="border border-slate-200 bg-white shadow-sm">
      <CardHeader className="border-b border-slate-200">
        <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-900">
          <span className="rounded-lg bg-slate-100 p-2 text-slate-700">
            <Icon className="h-5 w-5" />
          </span>
          {meta.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-5">
        <p className="text-sm leading-relaxed text-slate-600">{meta.description}</p>
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
          Chức năng quản lý cho mục này tôi đã gắn vào menu và khung nội dung. API/backend cho mục này hiện chưa có sẵn trong repo,
          nên tôi để placeholder để bạn nối tiếp mà không phải làm lại sidebar/admin shell.
        </div>
      </CardContent>
    </Card>
  );
}
