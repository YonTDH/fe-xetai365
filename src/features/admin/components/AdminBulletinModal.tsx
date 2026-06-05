import { useCallback, useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { ImageUploadModal, type ImageUploadModalItem } from '@/components/ImageUploadModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { sanitizeHtml } from '@/lib/sanitizeHtml';
import { AdminConfirmModal } from './AdminConfirmModal';
import { RichTextEditor } from '../pages/Products/ProductRichTextEditor';
import {
  importAdminBulletinDocx,
  listAdminUploadedImages,
  uploadAdminImage,
  type AdminUploadFolder,
  type AdminBulletin,
  type AdminBulletinDocxImportResult,
  type AdminBulletinPayload,
  type AdminBulletinStatus,
  type AdminBulletinType,
} from '../api/adminApi';

type AdminBulletinModalProps = {
  item: AdminBulletin | null;
  mode: 'view' | 'edit' | 'create';
  type: AdminBulletinType;
  open: boolean;
  variant?: 'modal' | 'page';
  isSaving?: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onEditContent?: () => void;
  onSave: (payload: AdminBulletinPayload) => void;
};

type FormState = AdminBulletinPayload;
type BulletinTab = 'info' | 'content' | 'seo' | 'preview';

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

function slugifyVietnamese(value: string) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function getBulletinUploadFolder(type: AdminBulletinType): AdminUploadFolder {
  if (type === 'recruitment') return 'recruitment';
  if (type === 'news_event') return 'news';
  if (type === 'services') return 'services';
  return 'promotions';
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-slate-900">{label}</span>
      {children}
    </label>
  );
}

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-full border px-4 py-2 text-sm font-semibold transition',
        active
          ? 'border-[#135a91] bg-[#135a91] text-white'
          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900',
      ].join(' ')}
    >
      {label}
    </button>
  );
}

export function AdminBulletinModal({
  item,
  mode,
  type,
  open,
  variant = 'modal',
  isSaving = false,
  onClose,
  onEdit,
  onEditContent,
  onSave,
}: AdminBulletinModalProps) {
  const [form, setForm] = useState<FormState>(() => createEmptyForm(type));
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedDocxFile, setSelectedDocxFile] = useState<File | null>(null);
  const [isImportingDocx, setIsImportingDocx] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [docxImportError, setDocxImportError] = useState('');
  const [docxImportSuccess, setDocxImportSuccess] = useState('');
  const [docxImportWarnings, setDocxImportWarnings] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<BulletinTab>('info');
  const [initialSnapshot, setInitialSnapshot] = useState('');
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const nextForm = item ? mapBulletinToForm(item) : createEmptyForm(type);
    setForm(nextForm);
    setInitialSnapshot(JSON.stringify(nextForm));
    setIsImageModalOpen(false);
    setSelectedDocxFile(null);
    setIsImportingDocx(false);
    setUploadError('');
    setDocxImportError('');
    setDocxImportSuccess('');
    setDocxImportWarnings([]);
    setActiveTab(variant === 'page' ? 'content' : 'info');
    setConfirmCloseOpen(false);
  }, [item, open, type, variant]);

  const requestClose = useCallback(() => {
    if (isSaving) return;
    if (mode !== 'view' && (JSON.stringify(form) !== initialSnapshot || selectedDocxFile)) {
      setConfirmCloseOpen(true);
      return;
    }
    onClose();
  }, [form, initialSnapshot, isSaving, mode, onClose, selectedDocxFile]);

  useEffect(() => {
    if (!open || isSaving) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') requestClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSaving, open, requestClose]);

  const loadBulletinImages = useCallback(async (): Promise<ImageUploadModalItem[]> => {
    const images = await listAdminUploadedImages('all', 100);
    return images.map((image) => ({
      id: image.publicId,
      imageUrl: image.imageUrl,
      title: image.publicId.split('/').pop() || image.publicId,
    }));
  }, []);

  const uploadBulletinImage = useCallback(
    (file: File) => uploadAdminImage(file, getBulletinUploadFolder(type)),
    [type]
  );

  if (!open) return null;

  const isReadOnly = mode === 'view';
  const isPageVariant = variant === 'page';
  const previewHtml = hasHtml(form.content);
  const previewImageUrl = form.imageUrl;

  const handleChange = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => {
      if (key === 'title') {
        const nextTitle = String(value);
        return {
          ...prev,
          title: nextTitle,
          slug: mode === 'create' ? slugifyVietnamese(nextTitle) : prev.slug,
        };
      }

      return { ...prev, [key]: value };
    });
  };

  const handleSubmit = () => {
    if (isReadOnly) {
      requestClose();
      return;
    }

    onSave({
      ...form,
      bulletinType: type,
      imageUrl: form.imageUrl.trim(),
    });
  };

  const applyDocxImportToForm = (imported: AdminBulletinDocxImportResult) => {
    setForm((prev) => {
      const nextTitle = prev.title || imported.title;
      const nextExcerpt = imported.excerpt || prev.excerpt;

      return {
        ...prev,
        title: nextTitle,
        slug: mode === 'create' ? slugifyVietnamese(nextTitle) : prev.slug,
        excerpt: nextExcerpt,
        descriptionShort: prev.descriptionShort || imported.excerpt,
        content: imported.content || prev.content,
        imageUrl: prev.imageUrl || imported.imageUrl,
        titleSeo: prev.titleSeo || nextTitle,
        metaDescription: prev.metaDescription || imported.excerpt,
      };
    });
  };

  const importDocxFile = async (file: File) => {
    try {
      setIsImportingDocx(true);
      setDocxImportError('');
      setDocxImportSuccess('');
      setDocxImportWarnings([]);
      const imported = await importAdminBulletinDocx(file, type);
      applyDocxImportToForm(imported);
      setSelectedDocxFile(file);
      setDocxImportWarnings(imported.warnings);
      setDocxImportSuccess(`Đã import nội dung từ ${file.name}.`);
    } catch (err) {
      setDocxImportError(err instanceof Error ? err.message : 'Không thể import file Word.');
    } finally {
      setIsImportingDocx(false);
    }
  };

  const handleImportDocx = async () => {
    if (!selectedDocxFile) {
      setDocxImportError('Vui lòng chọn file Word trước khi import.');
      return;
    }
    await importDocxFile(selectedDocxFile);
  };

  return (
    <div
      className={
        isPageVariant
          ? 'w-full'
          : 'fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm'
      }
      onMouseDown={(event) => {
        if (isPageVariant) return;
        if (isSaving) return;
        if (panelRef.current && !panelRef.current.contains(event.target as Node)) requestClose();
      }}
    >
      <div
        ref={panelRef}
        className={[
          'flex flex-col border border-slate-200 bg-white shadow-2xl',
          isPageVariant
            ? 'min-h-[calc(100vh-160px)] w-full overflow-visible rounded-2xl'
            : 'max-h-[88vh] w-full max-w-6xl overflow-hidden rounded-3xl',
        ].join(' ')}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div className="space-y-1">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
              {mode === 'create' ? 'Tạo bài viết' : isReadOnly ? 'Xem bài viết' : 'Cập nhật bài viết'}
            </div>
            <h2 className="text-2xl font-black text-slate-950">{item?.title || 'Bài viết mới'}</h2>
          </div>
          <Button type="button" variant="outline" size="icon-sm" onClick={requestClose} disabled={isSaving}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {!isPageVariant ? (
        <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <TabButton label="Thông tin" active={activeTab === 'info'} onClick={() => setActiveTab('info')} />
            <TabButton label="Xem trước" active={activeTab === 'preview'} onClick={() => setActiveTab('preview')} />
            <TabButton label="SEO" active={activeTab === 'seo'} onClick={() => setActiveTab('seo')} />
          </div>
        </div>
        ) : null}

        <div className={[isPageVariant ? 'overflow-visible pb-16' : 'overflow-y-auto', 'flex-1 px-6 py-5'].join(' ')}>
          {activeTab === 'info' || isPageVariant ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Tiêu đề">
                <Input value={form.title} onChange={(event) => handleChange('title', event.target.value)} readOnly={isReadOnly || isSaving} />
              </Field>
              <Field label="Slug">
                <Input value={form.slug} readOnly />
              </Field>
              <Field label="Trạng thái">
                {isReadOnly ? (
                  <Input value={translateBulletinStatus(form.status)} readOnly />
                ) : (
                  <select
                    value={form.status}
                    onChange={(event) => handleChange('status', event.target.value as AdminBulletinStatus)}
                    aria-label="Trạng thái bài viết"
                    title="Trạng thái bài viết"
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
              <div className="md:col-span-2 grid gap-4 xl:grid-cols-[minmax(0,1fr)_120px_220px_220px] xl:items-start">
                <Field label="Ảnh đại diện">
                  <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    {!isReadOnly ? (
                      <div className="flex flex-wrap items-center gap-4">
                        <Button type="button" variant="outline" onClick={() => setIsImageModalOpen(true)} disabled={isSaving}>
                          Chọn ảnh
                        </Button>
                      </div>
                    ) : null}
                    <div className="text-xs text-slate-500">
                      {previewImageUrl ? 'Đang dùng ảnh hiện tại.' : 'Chưa chọn tệp ảnh.'}
                    </div>
                    {uploadError ? <div className="text-xs text-red-600">{uploadError}</div> : null}
                    {previewImageUrl ? (
                      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-3">
                        <img src={previewImageUrl} alt={form.title || 'Ảnh bài viết'} className="h-24 w-24 rounded-xl object-cover" />
                      </div>
                    ) : null}
                  </div>
                </Field>
                <div className="grid gap-4 sm:grid-cols-2 xl:col-span-3 xl:grid-cols-[120px_220px_220px]">
                  <Field label="Thứ tự">
                    <Input
                      type="number"
                      value={String(form.sortOrder)}
                      onChange={(event) => handleChange('sortOrder', Number(event.target.value) || 1)}
                      readOnly={isReadOnly || isSaving}
                    />
                  </Field>
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
              </div>
            </div>
          ) : null}

          {activeTab === 'content' || isPageVariant ? (
            <div className={isPageVariant ? 'mt-5 border-t border-slate-200 pt-5' : ''}>
              <div className="space-y-4">
                {!isReadOnly ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">Import nội dung từ Word</div>
                        <div className="text-xs leading-5 text-slate-500">
                          Chọn file <code>.docx</code>, hệ thống sẽ tự import nội dung.
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <label className="inline-flex cursor-pointer items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                          <input
                            type="file"
                            accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            onChange={(event) => {
                              const file = event.target.files?.[0] || null;
                              setSelectedDocxFile(file);
                              setDocxImportError('');
                              setDocxImportSuccess('');
                              setDocxImportWarnings([]);
                              if (file) {
                                void importDocxFile(file);
                              }
                            }}
                            disabled={isSaving || isImportingDocx}
                            className="hidden"
                          />
                          Chọn file Word
                        </label>
                        <Button type="button" variant="outline" onClick={() => void handleImportDocx()} disabled={isSaving || isImportingDocx}>
                          {isImportingDocx ? 'Đang import...' : 'Import lại'}
                        </Button>
                      </div>
                      <div className="text-xs text-slate-500">{selectedDocxFile ? selectedDocxFile.name : 'Chưa chọn file Word.'}</div>
                      {docxImportError ? <div className="text-xs text-red-600">{docxImportError}</div> : null}
                      {docxImportSuccess ? <div className="text-xs text-emerald-700">{docxImportSuccess}</div> : null}
                      {docxImportWarnings.length ? (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">
                          {docxImportWarnings.map((warning, index) => (
                            <div key={`${warning}-${index}`}>{warning}</div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}
                <Field label="Mô tả ngắn">
                  <textarea
                    value={form.excerpt}
                    onChange={(event) => handleChange('excerpt', event.target.value)}
                    readOnly={isReadOnly || isSaving}
                    aria-label="Mô tả ngắn"
                    title="Mô tả ngắn"
                    className="min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
                  />
                </Field>
                <Field label="Nội dung bài viết">
                  <RichTextEditor
                    value={form.content}
                    readOnly={isReadOnly}
                    disabled={isSaving}
                    onChange={(nextContent) => handleChange('content', nextContent)}
                  />
                </Field>
              </div>
            </div>
          ) : null}

          {activeTab === 'seo' ? (
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
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
                    aria-label="Meta description"
                    title="Meta description"
                    className="min-h-32 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
                  />
                </Field>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 text-sm font-semibold text-slate-900">Xem trước SEO</div>
                <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="text-lg font-semibold leading-6 text-[#1a0dab]">{form.titleSeo || form.title || 'Tiêu đề SEO'}</div>
                  <div className="text-sm text-emerald-700">xetai365.vn/{form.slug || 'duong-dan-bai-viet'}</div>
                  <div className="text-sm leading-6 text-slate-600">{form.metaDescription || form.excerpt || 'Mô tả SEO sẽ hiển thị ở đây.'}</div>
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === 'preview' ? (
            <div className="mx-auto max-w-4xl space-y-6">
              <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                {previewImageUrl ? (
                  <img src={previewImageUrl} alt={form.title || 'Ảnh bài viết'} className="h-80 w-full object-cover" />
                ) : (
                  <div className="flex h-80 items-center justify-center bg-slate-100 text-sm text-slate-500">Chưa có ảnh đại diện</div>
                )}
                <div className="space-y-5 p-6">
                  <div className="space-y-2">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
                      {translateBulletinStatus(form.status)}
                    </div>
                    <h3 className="text-3xl font-black text-slate-950">{form.title || 'Tiêu đề bài viết'}</h3>
                    <p className="text-base font-medium leading-7 text-slate-700">{form.excerpt || 'Mô tả ngắn sẽ hiển thị ở đây.'}</p>
                  </div>
                  {previewHtml ? (
                    <div
                      className="rich-content prose prose-slate max-w-none text-sm leading-7 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-md [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-slate-200 [&_td]:p-2 [&_th]:border [&_th]:border-slate-200 [&_th]:bg-slate-50 [&_th]:p-2"
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(form.content) }}
                    />
                  ) : (
                    <div className="whitespace-pre-line text-sm leading-7 text-slate-600">{form.content || 'Nội dung bài viết sẽ hiển thị ở đây.'}</div>
                  )}
                </div>
              </article>
            </div>
          ) : null}
        </div>

        <div className={[
            'flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4',
            isPageVariant ? 'sticky bottom-0 z-40 rounded-b-2xl shadow-[0_-8px_24px_rgba(15,23,42,0.08)]' : '',
          ].join(' ')}>
          <Button type="button" variant="outline" onClick={requestClose} disabled={isSaving}>
            Đóng
          </Button>
          {isReadOnly && activeTab !== 'preview' ? (
            <Button type="button" size="sm" onClick={onEdit} disabled={isSaving || !onEdit}>
              Sửa
            </Button>
          ) : null}
          {isReadOnly && activeTab === 'preview' && !isPageVariant && item ? (
            <Button type="button" size="sm" onClick={onEditContent} disabled={isSaving || !onEditContent}>
              Sửa nội dung
            </Button>
          ) : null}
          {!isReadOnly ? (
            <Button type="button" size="sm" onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? 'Đang lưu...' : mode === 'create' ? 'Tạo bài viết' : 'Lưu thay đổi'}
            </Button>
          ) : null}
        </div>

        <ImageUploadModal
          open={isImageModalOpen}
          title="Chọn ảnh bài viết"
          currentImageUrl={form.imageUrl}
          loadImages={loadBulletinImages}
          uploadImage={uploadBulletinImage}
          onSelect={(imageUrl) => {
            handleChange('imageUrl', imageUrl);
            setUploadError('');
          }}
          onClose={() => setIsImageModalOpen(false)}
        />
      </div>

      <AdminConfirmModal
        open={confirmCloseOpen}
        title="Đóng chỉnh sửa bài viết?"
        description="Bạn đang có thay đổi chưa lưu. Nếu đóng bây giờ, các chỉnh sửa sẽ bị mất."
        confirmLabel="Đóng không lưu"
        cancelLabel="Tiếp tục chỉnh sửa"
        busy={isSaving}
        onCancel={() => setConfirmCloseOpen(false)}
        onConfirm={() => {
          setConfirmCloseOpen(false);
          onClose();
        }}
      />
    </div>
  );
}
