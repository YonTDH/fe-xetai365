import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, RefreshCw, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { sanitizeHtml } from '@/lib/sanitizeHtml';
import {
  createAdminBulletin,
  deleteAdminBulletin,
  getAdminBulletinDetail,
  listAdminBulletins,
  updateAdminBulletin,
  type AdminBulletin,
  type AdminBulletinPayload,
  type AdminBulletinStatus,
  type AdminBulletinType,
} from '../api/adminApi';

type AdminBulletinManagerProps = {
  type: AdminBulletinType;
  heading: string;
  description: string;
};

type FormState = AdminBulletinPayload;

function slugify(value: string) {
  return value
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function formatDateTimeLocal(value: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function toIsoDateTime(value: string) {
  if (!value) {
    return new Date().toISOString();
  }
  return new Date(value).toISOString();
}

function hasHtml(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

function createEmptyForm(type: AdminBulletinType): FormState {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);

  return {
    title: '',
    slug: '',
    bulletinType: type,
    status: 'published',
    excerpt: '',
    descriptionShort: '',
    content: '',
    imageUrl: '',
    sortOrder: 1,
    isFeatured: false,
    isVisible: true,
    publishedAt: local.toISOString().slice(0, 16),
    titleSeo: '',
    keywords: '',
    metaDescription: '',
  };
}

function mapBulletinToForm(item: AdminBulletin): FormState {
  return {
    title: item.title,
    slug: item.slug,
    bulletinType: item.bulletinType,
    status: item.status,
    excerpt: item.excerpt,
    descriptionShort: item.descriptionShort,
    content: item.content,
    imageUrl: item.imageUrl,
    sortOrder: item.sortOrder || 1,
    isFeatured: item.isFeatured,
    isVisible: item.isVisible,
    publishedAt: formatDateTimeLocal(item.publishedAt),
    titleSeo: item.titleSeo,
    keywords: item.keywords,
    metaDescription: item.metaDescription,
  };
}

export function AdminBulletinManager({ type, heading, description }: AdminBulletinManagerProps) {
  const [items, setItems] = useState<AdminBulletin[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(() => createEmptyForm(type));
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);

  const statusOptions: Array<{ value: AdminBulletinStatus; label: string }> = useMemo(
    () => [
      { value: 'draft', label: 'Nháp' },
      { value: 'published', label: 'Hiển thị' },
      { value: 'archived', label: 'Lưu trữ' },
    ],
    [],
  );

  const loadItems = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await listAdminBulletins(type);
      setItems(data);

      if (selectedId) {
        const exists = data.some((item) => item.id === selectedId);
        if (!exists) {
          setSelectedId(null);
          setForm(createEmptyForm(type));
          setSlugTouched(false);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách bài viết.');
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedId, type]);

  useEffect(() => {
    setSelectedId(null);
    setForm(createEmptyForm(type));
    setSlugTouched(false);
    setMessage('');
    setError('');
    void loadItems();
  }, [loadItems, type]);

  const handleCreateNew = () => {
    setSelectedId(null);
    setForm(createEmptyForm(type));
    setSlugTouched(false);
    setMessage('');
    setError('');
  };

  const handleEdit = async (id: number) => {
    try {
      setError('');
      const detail = await getAdminBulletinDetail(id);
      setSelectedId(detail.id);
      setForm(mapBulletinToForm(detail));
      setSlugTouched(true);
      setMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải chi tiết bài viết.');
    }
  };

  const handleChange = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => {
      const next = {
        ...prev,
        [key]: value,
      };

      if (key === 'title' && !slugTouched) {
        next.slug = slugify(String(value));
      }

      if (key === 'excerpt' && !prev.descriptionShort.trim()) {
        next.descriptionShort = String(value);
      }

      if (key === 'title' && !prev.titleSeo.trim()) {
        next.titleSeo = String(value);
      }

      if (key === 'excerpt' && !prev.metaDescription.trim()) {
        next.metaDescription = String(value);
      }

      return next;
    });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError('');
      setMessage('');

      const payload: AdminBulletinPayload = {
        ...form,
        slug: slugify(form.slug || form.title),
        bulletinType: type,
        publishedAt: toIsoDateTime(form.publishedAt),
      };

      const saved = selectedId
        ? await updateAdminBulletin(selectedId, payload)
        : await createAdminBulletin(payload);

      setSelectedId(saved.id);
      setForm(mapBulletinToForm(saved));
      setSlugTouched(true);
      setMessage(selectedId ? 'Đã cập nhật bài viết.' : 'Đã tạo bài viết mới.');
      await loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể lưu bài viết.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    const shouldDelete = typeof window !== 'undefined' ? window.confirm('Xóa bài viết này?') : false;
    if (!shouldDelete) return;

    try {
      setIsSaving(true);
      setError('');
      setMessage('');
      await deleteAdminBulletin(selectedId);
      setSelectedId(null);
      setForm(createEmptyForm(type));
      setSlugTouched(false);
      setMessage('Đã xóa bài viết.');
      await loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể xóa bài viết.');
    } finally {
      setIsSaving(false);
    }
  };

  const previewHtml = hasHtml(form.content);

  return (
    <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-200">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-lg font-bold text-slate-900">{heading}</CardTitle>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => void loadItems()}>
                <RefreshCw className="h-4 w-4" />
                Tải lại
              </Button>
              <Button type="button" size="sm" onClick={handleCreateNew}>
                <Plus className="h-4 w-4" />
                Bài mới
              </Button>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-slate-600">{description}</p>
        </CardHeader>
        <CardContent className="space-y-3 pt-4">
          {isLoading && <p className="text-sm text-slate-500">Đang tải danh sách...</p>}
          {!isLoading && items.length === 0 && <p className="text-sm text-slate-500">Chưa có bài viết nào.</p>}
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => void handleEdit(item.id)}
              className={[
                'w-full rounded-xl border px-4 py-3 text-left transition-colors',
                selectedId === item.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white',
              ].join(' ')}
            >
              <div className="line-clamp-2 text-sm font-semibold text-slate-900">{item.title}</div>
              <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                <span>{item.slug}</span>
                <span>•</span>
                <span>{item.status}</span>
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-200">
          <CardTitle className="text-lg font-bold text-slate-900">
            {selectedId ? 'Chỉnh sửa nội dung' : 'Tạo nội dung mới'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-5">
          {(message || error) && (
            <div className={['rounded-xl px-4 py-3 text-sm', error ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'].join(' ')}>
              {error || message}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Tiêu đề">
              <Input value={form.title} onChange={(e) => handleChange('title', e.target.value)} placeholder="Nhập tiêu đề..." />
            </Field>
            <Field label="Slug">
              <Input
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  handleChange('slug', e.target.value);
                }}
                placeholder="duong-dan-bai-viet"
              />
            </Field>
            <Field label="Trạng thái">
              <select
                value={form.status}
                onChange={(e) => handleChange('status', e.target.value as AdminBulletinStatus)}
                aria-label="Trạng thái bài viết"
                title="Trạng thái bài viết"
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-primary-500"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Ngày đăng">
              <Input type="datetime-local" value={form.publishedAt} onChange={(e) => handleChange('publishedAt', e.target.value)} />
            </Field>
            <Field label="Ảnh đại diện">
              <Input value={form.imageUrl} onChange={(e) => handleChange('imageUrl', e.target.value)} placeholder="https://..." />
            </Field>
            <Field label="Thứ tự">
              <Input
                type="number"
                min={1}
                value={String(form.sortOrder)}
                onChange={(e) => handleChange('sortOrder', Number(e.target.value) || 1)}
              />
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={form.isVisible}
                onChange={(e) => handleChange('isVisible', e.target.checked)}
                className="h-4 w-4"
              />
              Hiển thị bài viết
            </label>
            <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => handleChange('isFeatured', e.target.checked)}
                className="h-4 w-4"
              />
              Đánh dấu nổi bật
            </label>
          </div>

          <Field label="Mô tả ngắn">
            <textarea
              value={form.excerpt}
              onChange={(e) => handleChange('excerpt', e.target.value)}
              placeholder="Đoạn mô tả hiển thị ở trang danh sách..."
              className="min-h-24 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-primary-500"
            />
          </Field>

          <Field label="Nội dung bài viết">
            <textarea
              value={form.content}
              onChange={(e) => handleChange('content', e.target.value)}
              placeholder="Bạn có thể nhập text thường ở đây. Nếu có HTML thì hệ thống vẫn lưu và preview được."
              className="min-h-64 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-primary-500"
            />
          </Field>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 text-sm font-semibold text-slate-900">Xem trước nội dung</div>
            {previewHtml ? (
              <div
                className="prose prose-slate max-w-none text-sm [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-md"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(form.content) }}
              />
            ) : (
              <div className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{form.content || 'Chưa có nội dung.'}</div>
            )}
          </div>

          <details className="rounded-xl border border-slate-200 bg-slate-50">
            <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-slate-900">SEO và metadata</summary>
            <div className="grid gap-4 border-t border-slate-200 p-4 md:grid-cols-2">
              <Field label="Title SEO">
                <Input value={form.titleSeo} onChange={(e) => handleChange('titleSeo', e.target.value)} />
              </Field>
              <Field label="Keywords">
                <Input value={form.keywords} onChange={(e) => handleChange('keywords', e.target.value)} />
              </Field>
              <div className="md:col-span-2">
                <Field label="Meta description">
                  <textarea
                    value={form.metaDescription}
                    onChange={(e) => handleChange('metaDescription', e.target.value)}
                    className="min-h-24 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-primary-500"
                  />
                </Field>
              </div>
            </div>
          </details>

          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" onClick={() => void handleSave()} disabled={isSaving}>
              <Save className="h-4 w-4" />
              {selectedId ? 'Cập nhật' : 'Tạo mới'}
            </Button>
            {selectedId && (
              <Button type="button" variant="destructive" onClick={() => void handleDelete()} disabled={isSaving}>
                <Trash2 className="h-4 w-4" />
                Xóa bài
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-slate-900">{label}</span>
      {children}
    </label>
  );
}
