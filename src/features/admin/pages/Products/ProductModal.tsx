import { useEffect, useMemo, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrencyVnd } from '@/lib/formatCurrencyVnd';
import { sanitizeHtml } from '@/lib/sanitizeHtml';
import { AdminConfirmModal } from '../../components/AdminConfirmModal';
import {
  importAdminProductDocx,
  uploadAdminImage,
  type AdminProduct,
  type AdminProductPayload,
  type AdminVehicleCategory,
} from '../../api/adminApi';

type ProductModalProps = {
  item: AdminProduct | null;
  parentCategories: AdminVehicleCategory[];
  mode: 'view' | 'edit' | 'create';
  open: boolean;
  isSaving?: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onSave: (payload: AdminProductPayload) => void;
};

type FormState = AdminProductPayload;
type ProductTab = 'info' | 'content' | 'seo' | 'preview';

function translateProductStatus(status: string) {
  switch (status) {
    case 'available':
      return 'Đang bán';
    case 'sold':
      return 'Đã bán';
    case 'sold_out':
      return 'Hết hàng';
    case 'coming_soon':
      return 'Sắp về';
    case 'draft':
      return 'Bản nháp';
    case 'hidden':
      return 'Đã ẩn';
    default:
      return status;
  }
}

function createFormState(item: AdminProduct | null, defaultCategoryLevel2Id: number): FormState {
  return {
    categoryLevel2Id: item?.categoryLevel2Id || defaultCategoryLevel2Id,
    productCode: item?.productCode ?? '',
    slug: item?.slug ?? '',
    title: item?.title ?? '',
    shortDescription: item?.shortDescription ?? '',
    content: item?.content ?? '',
    brand: item?.brand ?? '',
    status: item?.status ?? 'available',
    priceVnd: item?.priceVnd ?? '0',
    location: item?.location ?? '',
    imageUrl: item?.imageUrl ?? '',
    isFeatured: item?.isFeatured ?? false,
    isVisible: item?.isVisible ?? true,
    sortOrder: item?.sortOrder ?? 1,
    titleSeo: item?.titleSeo ?? '',
    keywords: item?.keywords ?? '',
    metaDescription: item?.metaDescription ?? '',
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

export function ProductModal({
  item,
  parentCategories,
  mode,
  open,
  isSaving = false,
  onClose,
  onEdit,
  onSave,
}: ProductModalProps) {
  const categoryLevel2Options = useMemo(
    () =>
      parentCategories.flatMap((parent) =>
        parent.children.map((child) => ({
          id: child.id,
          label: `${parent.name} / ${child.name}`,
        }))
      ),
    [parentCategories]
  );

  const [form, setForm] = useState<FormState>(createFormState(item, categoryLevel2Options[0]?.id || 0));
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedDocxFile, setSelectedDocxFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isImportingDocx, setIsImportingDocx] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [docxImportError, setDocxImportError] = useState('');
  const [docxImportSuccess, setDocxImportSuccess] = useState('');
  const [docxImportWarnings, setDocxImportWarnings] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<ProductTab>('info');
  const [selectedImagePreviewUrl, setSelectedImagePreviewUrl] = useState('');
  const [initialSnapshot, setInitialSnapshot] = useState('');
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const nextForm = createFormState(item, categoryLevel2Options[0]?.id || 0);
    setForm(nextForm);
    setInitialSnapshot(JSON.stringify(nextForm));
    setSelectedImageFile(null);
    setSelectedDocxFile(null);
    setSelectedImagePreviewUrl('');
    setIsUploadingImage(false);
    setIsImportingDocx(false);
    setUploadError('');
    setDocxImportError('');
    setDocxImportSuccess('');
    setDocxImportWarnings([]);
    setActiveTab('info');
    setConfirmCloseOpen(false);
  }, [item, open, categoryLevel2Options]);

  const requestClose = () => {
    if (isSaving) return;
    if (mode !== 'view' && (JSON.stringify(form) !== initialSnapshot || selectedImageFile || selectedDocxFile)) {
      setConfirmCloseOpen(true);
      return;
    }
    onClose();
  };

  useEffect(() => {
    if (!selectedImageFile) {
      setSelectedImagePreviewUrl('');
      return;
    }

    const objectUrl = URL.createObjectURL(selectedImageFile);
    setSelectedImagePreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedImageFile]);

  useEffect(() => {
    if (!open || isSaving) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') requestClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [form, initialSnapshot, isSaving, mode, onClose, open, selectedDocxFile, selectedImageFile]);

  if (!open) return null;

  const isReadOnly = mode === 'view';
  const previewHtml = hasHtml(form.content);
  const previewImageUrl = selectedImagePreviewUrl || form.imageUrl;

  const handleChange = <TKey extends keyof FormState>(key: TKey, value: FormState[TKey]) => {
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

  const uploadPendingImage = async () => {
    if (!selectedImageFile) {
      return form.imageUrl;
    }

    setIsUploadingImage(true);
    setUploadError('');

    try {
      const uploaded = await uploadAdminImage(selectedImageFile, 'products');
      return uploaded.imageUrl;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Không thể upload ảnh.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async () => {
    if (isReadOnly) {
      requestClose();
      return;
    }

    try {
      const imageUrl = await uploadPendingImage();
      onSave({
        ...form,
        imageUrl,
      });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Không thể upload ảnh.');
    }
  };

  const importDocxFile = async (file: File) => {
    try {
      setIsImportingDocx(true);
      setDocxImportError('');
      setDocxImportSuccess('');
      setDocxImportWarnings([]);
      const imported = await importAdminProductDocx(file);
      setForm((prev) => {
        const nextTitle = prev.title || imported.title;
        const nextShortDescription = imported.excerpt || prev.shortDescription;

        return {
          ...prev,
          title: nextTitle,
          slug: mode === 'create' ? slugifyVietnamese(nextTitle) : prev.slug,
          shortDescription: nextShortDescription,
          content: imported.content || prev.content,
          imageUrl: prev.imageUrl || imported.imageUrl,
          titleSeo: prev.titleSeo || nextTitle,
          metaDescription: prev.metaDescription || imported.excerpt,
        };
      });
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (isSaving) return;
        if (panelRef.current && !panelRef.current.contains(event.target as Node)) requestClose();
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
              {mode === 'create' ? 'Tạo sản phẩm' : isReadOnly ? 'Xem sản phẩm' : 'Cập nhật sản phẩm'}
            </div>
            <h2 className="text-2xl font-black text-slate-950">{item?.title || 'Sản phẩm mới'}</h2>
          </div>
          <Button type="button" variant="outline" size="icon-sm" onClick={requestClose} disabled={isSaving}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <TabButton label="Thông tin" active={activeTab === 'info'} onClick={() => setActiveTab('info')} />
            <TabButton label="Nội dung" active={activeTab === 'content'} onClick={() => setActiveTab('content')} />
            <TabButton label="SEO" active={activeTab === 'seo'} onClick={() => setActiveTab('seo')} />
            <TabButton label="Xem trước" active={activeTab === 'preview'} onClick={() => setActiveTab('preview')} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {activeTab === 'info' ? (
            <div className="grid min-h-[560px] gap-4 md:grid-cols-2">
              <Field label="Tên sản phẩm">
                <Input value={form.title} onChange={(event) => handleChange('title', event.target.value)} readOnly={isReadOnly || isSaving} />
              </Field>
              <Field label="Slug">
                <Input value={form.slug} readOnly />
              </Field>
              <Field label="Danh mục cấp 2">
                <select
                  value={form.categoryLevel2Id}
                  onChange={(event) => handleChange('categoryLevel2Id', Number(event.target.value))}
                  disabled={isReadOnly || isSaving}
                  aria-label="Danh mục cấp 2"
                  title="Danh mục cấp 2"
                  className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
                >
                  {categoryLevel2Options.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Mã sản phẩm">
                <Input value={form.productCode} onChange={(event) => handleChange('productCode', event.target.value)} readOnly={isReadOnly || isSaving} />
              </Field>
              <Field label="Giá">
                <div className="space-y-2">
                  <Input
                    value={isReadOnly ? formatCurrencyVnd(form.priceVnd) : form.priceVnd}
                    onChange={(event) => handleChange('priceVnd', event.target.value)}
                    readOnly={isReadOnly || isSaving}
                  />
                  {!isReadOnly ? <div className="text-xs text-slate-500">{formatCurrencyVnd(form.priceVnd)}</div> : null}
                </div>
              </Field>
              <Field label="Trạng thái">
                <Input
                  value={isReadOnly ? translateProductStatus(form.status) : form.status}
                  onChange={(event) => handleChange('status', event.target.value)}
                  readOnly={isReadOnly || isSaving}
                />
              </Field>
              <Field label="Hãng">
                <Input value={form.brand} onChange={(event) => handleChange('brand', event.target.value)} readOnly={isReadOnly || isSaving} />
              </Field>
              <Field label="Vị trí">
                <Input value={form.location} onChange={(event) => handleChange('location', event.target.value)} readOnly={isReadOnly || isSaving} />
              </Field>
              <div className="md:col-span-2 grid gap-4 xl:grid-cols-[minmax(0,1fr)_120px_220px_220px] xl:items-start">
                <Field label="Ảnh đại diện">
                  <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    {!isReadOnly ? (
                      <div className="flex flex-wrap items-center gap-4">
                        <label className="inline-flex cursor-pointer items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
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
                        <div className="text-xs text-slate-500">Ảnh sẽ tự upload khi nhấn lưu.</div>
                      </div>
                    ) : null}
                    <div className="text-xs text-slate-500">
                      {selectedImageFile ? selectedImageFile.name : previewImageUrl ? 'Đang dùng ảnh hiện tại.' : 'Chưa chọn tệp ảnh.'}
                    </div>
                    {uploadError ? <div className="text-xs text-red-600">{uploadError}</div> : null}
                    {previewImageUrl ? (
                      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-3">
                        <img src={previewImageUrl} alt={form.title || 'Ảnh sản phẩm'} className="h-24 w-24 rounded-xl object-cover" />
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
                      <span className="text-sm text-slate-700">{form.isFeatured ? 'Sản phẩm nổi bật' : 'Không nổi bật'}</span>
                    </label>
                  </Field>
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === 'content' ? (
            <div className="grid min-h-[560px] gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
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
                    value={form.shortDescription}
                    onChange={(event) => handleChange('shortDescription', event.target.value)}
                    readOnly={isReadOnly || isSaving}
                    aria-label="Mô tả ngắn"
                    title="Mô tả ngắn"
                    className="min-h-28 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
                  />
                </Field>
                <Field label="Nội dung">
                  <textarea
                    value={form.content}
                    onChange={(event) => handleChange('content', event.target.value)}
                    readOnly={isReadOnly || isSaving}
                    aria-label="Nội dung sản phẩm"
                    title="Nội dung sản phẩm"
                    className="min-h-[360px] w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
                  />
                </Field>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 text-sm font-semibold text-slate-900">Gợi ý biên tập</div>
                <div className="space-y-3 text-sm leading-6 text-slate-600">
                  <p>Mô tả ngắn dùng cho danh sách và phần đầu trang chi tiết.</p>
                  <p>Sau khi import từ Word, kiểm tra lại tên, ảnh đại diện và bố cục.</p>
                  <p>Khi bài có nhiều ảnh hoặc bảng, tab xem trước sẽ giúp kiểm tra trên mobile.</p>
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === 'seo' ? (
            <div className="grid min-h-[560px] gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
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
                  <div className="text-sm text-emerald-700">xetai365.vn/{form.slug || 'duong-dan-san-pham'}</div>
                  <div className="text-sm leading-6 text-slate-600">
                    {form.metaDescription || form.shortDescription || 'Mô tả SEO sẽ hiển thị ở đây.'}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === 'preview' ? (
            <div className="mx-auto min-h-[560px] max-w-4xl space-y-6">
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                {previewImageUrl ? (
                  <img src={previewImageUrl} alt={form.title || 'Ảnh sản phẩm'} className="h-72 w-full object-cover" />
                ) : (
                  <div className="flex h-72 items-center justify-center bg-slate-100 text-sm text-slate-500">Chưa có ảnh đại diện</div>
                )}
                <div className="space-y-4 p-6">
                  <div className="space-y-2">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
                      {translateProductStatus(form.status)}
                    </div>
                    <h3 className="text-3xl font-black text-slate-950">{form.title || 'Tên sản phẩm'}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                      <span>{form.brand || 'Chưa có hãng'}</span>
                      <span>•</span>
                      <span>{form.location || 'Chưa có vị trí'}</span>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-[#135a91]">{formatCurrencyVnd(form.priceVnd)}</div>
                  <p className="whitespace-pre-line text-base leading-7 text-slate-700">
                    {form.shortDescription || 'Mô tả ngắn sẽ hiển thị ở đây.'}
                  </p>
                  {previewHtml ? (
                    <div
                      className="rich-content prose prose-slate max-w-none text-sm leading-7 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-md [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-slate-200 [&_td]:p-2 [&_th]:border [&_th]:border-slate-200 [&_th]:bg-slate-50 [&_th]:p-2"
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(form.content) }}
                    />
                  ) : (
                    <div className="whitespace-pre-line text-sm leading-7 text-slate-600">{form.content || 'Nội dung chi tiết sẽ hiển thị ở đây.'}</div>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <Button type="button" variant="outline" onClick={requestClose} disabled={isSaving}>
            Đóng
          </Button>
          {isReadOnly ? (
            <Button type="button" onClick={onEdit} disabled={isSaving || !onEdit}>
              Sửa
            </Button>
          ) : null}
          {!isReadOnly ? (
            <Button type="button" onClick={() => void handleSubmit()} disabled={isSaving || isUploadingImage}>
              {isSaving || isUploadingImage ? 'Đang lưu...' : mode === 'create' ? 'Tạo sản phẩm' : 'Lưu thay đổi'}
            </Button>
          ) : null}
        </div>
      </div>

      <AdminConfirmModal
        open={confirmCloseOpen}
        title="Đóng chỉnh sửa sản phẩm?"
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
