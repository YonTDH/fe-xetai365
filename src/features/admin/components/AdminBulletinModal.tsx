import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { sanitizeHtml } from '@/lib/sanitizeHtml';
import { uploadAdminImage, type AdminBulletin, type AdminBulletinPayload, type AdminBulletinStatus, type AdminBulletinType } from '../api/adminApi';

type AdminBulletinModalProps = {
  item: AdminBulletin | null;
  mode: 'view' | 'edit' | 'create';
  type: AdminBulletinType;
  open: boolean;
  isSaving?: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onSave: (payload: AdminBulletinPayload) => void;
};

type FormState = AdminBulletinPayload;

function formatDateTimeLocal(value: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function translateBulletinStatus(status: AdminBulletinStatus) {
  switch (status) {
    case 'draft':
      return 'Bản nháp';
    case 'published':
      return 'Hiển thị';
    case 'archived':
      return 'Lưu trữ';
    default:
      return status;
  }
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

function hasHtml(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-slate-900">{label}</span>
      {children}
    </label>
  );
}

export function AdminBulletinModal({
  item,
  mode,
  type,
  open,
  isSaving = false,
  onClose,
  onEdit,
  onSave,
}: AdminBulletinModalProps) {
  const [form, setForm] = useState<FormState>(() => createEmptyForm(type));
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    setForm(item ? mapBulletinToForm(item) : createEmptyForm(type));
    setSelectedImageFile(null);
    setIsUploadingImage(false);
    setUploadError('');
  }, [item, open, type]);

  useEffect(() => {
    if (!open || isSaving) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSaving, onClose, open]);

  if (!open) return null;

  const isReadOnly = mode === 'view';
  const previewHtml = hasHtml(form.content);

  const handleChange = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (isReadOnly) {
      onClose();
      return;
    }

    onSave({
      ...form,
      bulletinType: type,
    });
  };

  const handleUploadImage = async () => {
    if (!selectedImageFile) {
      setUploadError('Vui lòng chọn ảnh trước khi upload.');
      return;
    }

    const folder =
      type === 'recruitment' ? 'recruitment' : type === 'news_event' ? 'news' : 'promotions';

    try {
      setIsUploadingImage(true);
      setUploadError('');
      const uploaded = await uploadAdminImage(selectedImageFile, folder);
      handleChange('imageUrl', uploaded.imageUrl);
      setSelectedImageFile(null);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Không thể upload ảnh.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (isSaving) return;
        if (panelRef.current && !panelRef.current.contains(event.target as Node)) onClose();
      }}
    >
      <div
        ref={panelRef}
        className="flex max-h-[88vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div className="space-y-1">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
              {mode === 'create' ? 'Tạo bài viết' : isReadOnly ? 'Xem bài viết' : 'Cập nhật bài viết'}
            </div>
            <h2 className="text-2xl font-black text-slate-950">{item?.title || 'Bài viết mới'}</h2>
          </div>
          <Button type="button" variant="outline" size="icon-sm" onClick={onClose} disabled={isSaving}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid gap-6 overflow-y-auto px-6 py-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Tiêu đề">
                <Input value={form.title} onChange={(event) => handleChange('title', event.target.value)} readOnly={isReadOnly || isSaving} />
              </Field>
              <Field label="Slug">
                <Input value={form.slug} onChange={(event) => handleChange('slug', event.target.value)} readOnly={isReadOnly || isSaving} />
              </Field>
              <Field label="Trạng thái">
                {isReadOnly ? (
                  <Input value={translateBulletinStatus(form.status)} readOnly />
                ) : (
                  <select
                    value={form.status}
                    onChange={(event) => handleChange('status', event.target.value as AdminBulletinStatus)}
                    className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
                  >
                    <option value="draft">Bản nháp</option>
                    <option value="published">Hiển thị</option>
                    <option value="archived">Lưu trữ</option>
                  </select>
                )}
              </Field>
              <Field label="Ngày đăng">
                <Input
                  type="datetime-local"
                  value={form.publishedAt}
                  onChange={(event) => handleChange('publishedAt', event.target.value)}
                  readOnly={isReadOnly || isSaving}
                />
              </Field>
              <Field label="Ảnh đại diện">
                <div className="space-y-3">
                  <Input value={form.imageUrl} onChange={(event) => handleChange('imageUrl', event.target.value)} readOnly={isReadOnly || isSaving} />
                  {!isReadOnly ? (
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="inline-flex cursor-pointer items-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(event) => {
                            setSelectedImageFile(event.target.files?.[0] || null);
                            setUploadError('');
                          }}
                          disabled={isSaving || isUploadingImage}
                          className="hidden"
                        />
                        Chọn ảnh
                      </label>
                      <Button type="button" variant="outline" onClick={() => void handleUploadImage()} disabled={isSaving || isUploadingImage}>
                        {isUploadingImage ? 'Đang upload...' : 'Upload ảnh'}
                      </Button>
                    </div>
                  ) : null}
                  <div className="text-xs text-slate-500">{selectedImageFile ? selectedImageFile.name : 'Chưa chọn tệp ảnh.'}</div>
                  {uploadError ? <div className="text-xs text-red-600">{uploadError}</div> : null}
                </div>
              </Field>
              <Field label="Thứ tự">
                <Input
                  type="number"
                  value={String(form.sortOrder)}
                  onChange={(event) => handleChange('sortOrder', Number(event.target.value) || 1)}
                  readOnly={isReadOnly || isSaving}
                />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Hiển thị">
                <label className="flex h-10 items-center gap-3 rounded-xl border border-slate-200 px-3">
                  <input
                    type="checkbox"
                    checked={form.isVisible}
                    onChange={(event) => handleChange('isVisible', event.target.checked)}
                    disabled={isReadOnly || isSaving}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  <span className="text-sm text-slate-700">{form.isVisible ? 'Đang hiển thị' : 'Đang ẩn'}</span>
                </label>
              </Field>
              <Field label="Nổi bật">
                <label className="flex h-10 items-center gap-3 rounded-xl border border-slate-200 px-3">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(event) => handleChange('isFeatured', event.target.checked)}
                    disabled={isReadOnly || isSaving}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  <span className="text-sm text-slate-700">{form.isFeatured ? 'Bài viết nổi bật' : 'Không nổi bật'}</span>
                </label>
              </Field>
            </div>

            <Field label="Mô tả ngắn">
              <textarea
                value={form.excerpt}
                onChange={(event) => handleChange('excerpt', event.target.value)}
                readOnly={isReadOnly || isSaving}
                className="min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
              />
            </Field>

            <Field label="Nội dung bài viết">
              <textarea
                value={form.content}
                onChange={(event) => handleChange('content', event.target.value)}
                readOnly={isReadOnly || isSaving}
                className="min-h-64 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
              />
            </Field>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
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

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-4 text-sm font-semibold text-slate-900">SEO và metadata</div>
              <div className="space-y-4">
                <Field label="Title SEO">
                  <Input value={form.titleSeo} onChange={(event) => handleChange('titleSeo', event.target.value)} readOnly={isReadOnly || isSaving} />
                </Field>
                <Field label="Keywords">
                  <Input value={form.keywords} onChange={(event) => handleChange('keywords', event.target.value)} readOnly={isReadOnly || isSaving} />
                </Field>
                <Field label="Meta description">
                  <textarea
                    value={form.metaDescription}
                    onChange={(event) => handleChange('metaDescription', event.target.value)}
                    readOnly={isReadOnly || isSaving}
                    className="min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
                  />
                </Field>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
            Đóng
          </Button>
          {isReadOnly ? (
            <Button type="button" onClick={onEdit} disabled={isSaving || !onEdit}>
              Sửa
            </Button>
          ) : null}
          {!isReadOnly ? (
            <Button type="button" onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? 'Đang lưu...' : mode === 'create' ? 'Tạo bài viết' : 'Lưu thay đổi'}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
