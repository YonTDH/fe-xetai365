import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrencyVnd } from '@/lib/formatCurrencyVnd';
import { AdminConfirmModal } from '../../components/AdminConfirmModal';
import { importAdminProductDocx, uploadAdminImage } from '../../api/adminApi';
import { Field, TabButton } from './ProductModalFields';
import { ProductPreviewCard } from './ProductPreviewCard';
import { RichTextEditor } from './ProductRichTextEditor';
import type { FormState, ProductModalProps, ProductTab } from './productModalTypes';
import { createFormState, slugifyVietnamese, translateProductStatus } from './productModalUtils';

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
    if (!open) {
      return;
    }
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

  const requestClose = useCallback(() => {
    if (isSaving) {
      return;
    }
    if (mode !== 'view' && (JSON.stringify(form) !== initialSnapshot || selectedImageFile || selectedDocxFile)) {
      setConfirmCloseOpen(true);
      return;
    }
    onClose();
  }, [form, initialSnapshot, isSaving, mode, onClose, selectedDocxFile, selectedImageFile]);

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
    if (!open || isSaving) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        requestClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSaving, open, requestClose]);

  if (!open) {
    return null;
  }

  const isReadOnly = mode === 'view';
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
      className={[
        'fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 backdrop-blur-sm',
        activeTab === 'content' ? 'p-0' : 'px-3 py-4',
      ].join(' ')}
      onMouseDown={(event) => {
        if (isSaving) {
          return;
        }
        if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
          requestClose();
        }
      }}
    >
      <div
        ref={panelRef}
        className={[
          'flex flex-col overflow-hidden border border-slate-200 bg-white shadow-2xl',
          activeTab === 'content'
            ? 'h-screen max-h-screen w-screen max-w-none rounded-none'
            : 'h-[92vh] max-h-[92vh] w-full max-w-7xl rounded-2xl',
        ].join(' ')}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div className="min-w-0 space-y-1">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
              {mode === 'create' ? 'Tạo sản phẩm' : isReadOnly ? 'Xem sản phẩm' : 'Cập nhật sản phẩm'}
            </div>
            <h2 className="truncate text-xl font-black text-slate-950">{item?.title || form.title || 'Sản phẩm mới'}</h2>
          </div>
          <Button type="button" variant="outline" size="icon-sm" onClick={requestClose} disabled={isSaving} aria-label="Đóng modal">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="border-b border-slate-200 bg-slate-50/70 px-5 py-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <TabButton label="Thông tin" active={activeTab === 'info'} onClick={() => setActiveTab('info')} />
            <TabButton label="Nội dung + xem trước" active={activeTab === 'content'} onClick={() => setActiveTab('content')} />
            <TabButton label="SEO" active={activeTab === 'seo'} onClick={() => setActiveTab('seo')} />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden px-5 py-4">
          {activeTab === 'info' ? (
            <div className="h-full overflow-y-auto pr-1">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="grid gap-3 md:grid-cols-2">
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
                  <div className="space-y-1.5">
                    <Input
                      value={isReadOnly ? formatCurrencyVnd(form.priceVnd) : form.priceVnd}
                      onChange={(event) => handleChange('priceVnd', event.target.value)}
                      readOnly={isReadOnly || isSaving}
                    />
                    {!isReadOnly ? <div className="text-xs font-medium text-slate-700">{formatCurrencyVnd(form.priceVnd)}</div> : null}
                  </div>
                </Field>
                <Field label="Trạng thái">
                  {isReadOnly ? (
                    <Input value={translateProductStatus(form.status)} readOnly />
                  ) : (
                    <select
                      value={form.status}
                      onChange={(event) => handleChange('status', event.target.value)}
                      aria-label="Trạng thái sản phẩm"
                      title="Trạng thái sản phẩm"
                      className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
                    >
                      <option value="available">Đang bán</option>
                      <option value="sold">Đã bán</option>
                      <option value="sold_out">Hết hàng</option>
                      <option value="coming_soon">Sắp về</option>
                      <option value="draft">Bản nháp</option>
                      <option value="hidden">Đã ẩn</option>
                    </select>
                  )}
                </Field>
                <Field label="Hãng">
                  <Input value={form.brand} onChange={(event) => handleChange('brand', event.target.value)} readOnly={isReadOnly || isSaving} />
                </Field>
                <Field label="Vị trí">
                  <Input value={form.location} onChange={(event) => handleChange('location', event.target.value)} readOnly={isReadOnly || isSaving} />
                </Field>
                <Field label="Thứ tự">
                  <Input
                    type="number"
                    value={String(form.sortOrder)}
                    onChange={(event) => handleChange('sortOrder', Number(event.target.value) || 1)}
                    readOnly={isReadOnly || isSaving}
                  />
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Hiển thị">
                    <label className="flex h-10 items-center gap-3 rounded-xl border border-slate-200 px-3">
                      <input
                        type="checkbox"
                        checked={form.isVisible}
                        onChange={(event) => handleChange('isVisible', event.target.checked)}
                        disabled={isReadOnly || isSaving}
                        className="h-4 w-4 rounded border-slate-300"
                      />
                      <span className="text-sm font-medium text-slate-800">{form.isVisible ? 'Đang hiển thị' : 'Đang ẩn'}</span>
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
                      <span className="text-sm font-medium text-slate-800">{form.isFeatured ? 'Nổi bật' : 'Không'}</span>
                    </label>
                  </Field>
                </div>
              </div>

              <aside className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <ImageIcon className="h-4 w-4" />
                  Ảnh đại diện
                </div>
                {!isReadOnly ? (
                  <label className="inline-flex cursor-pointer items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100">
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
                ) : null}
                <div className="text-xs font-medium text-slate-700">
                  {selectedImageFile ? selectedImageFile.name : previewImageUrl ? 'Đang dùng ảnh hiện tại.' : 'Chưa chọn tệp ảnh.'}
                </div>
                {uploadError ? <div className="text-xs font-medium text-red-600">{uploadError}</div> : null}
                {previewImageUrl ? (
                  <img src={previewImageUrl} alt={form.title || 'Ảnh sản phẩm'} className="h-44 w-full rounded-xl border border-slate-200 object-cover" />
                ) : (
                  <div className="flex h-44 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white text-sm font-medium text-slate-600">
                    Chưa có ảnh
                  </div>
                )}
              </aside>
            </div>
            </div>
          ) : null}

          {activeTab === 'content' ? (
            <div className="grid h-full min-h-0 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)]">
              <div className="h-full min-h-0 space-y-3 overflow-y-auto pr-1">
                {!isReadOnly ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-3">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">Import nội dung từ Word</div>
                        <div className="text-xs leading-5 font-medium text-slate-700">Chọn file .docx, hệ thống sẽ tự import nội dung.</div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="inline-flex cursor-pointer items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100">
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
                    </div>
                    <div className="mt-2 text-xs font-medium text-slate-700">{selectedDocxFile ? selectedDocxFile.name : 'Chưa chọn file Word.'}</div>
                    {docxImportError ? <div className="mt-2 text-xs font-medium text-red-600">{docxImportError}</div> : null}
                    {docxImportSuccess ? <div className="mt-2 text-xs font-medium text-emerald-700">{docxImportSuccess}</div> : null}
                    {docxImportWarnings.length ? (
                      <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 font-medium text-amber-800">
                        {docxImportWarnings.map((warning, index) => (
                          <div key={`${warning}-${index}`}>{warning}</div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}
                <Field label="Mô tả ngắn">
                  <textarea
                    value={form.shortDescription}
                    onChange={(event) => handleChange('shortDescription', event.target.value)}
                    readOnly={isReadOnly || isSaving}
                    aria-label="Mô tả ngắn"
                    title="Mô tả ngắn"
                    className="min-h-20 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
                  />
                </Field>
                <Field label="Nội dung">
                  <RichTextEditor
                    value={form.content}
                    readOnly={isReadOnly}
                    disabled={isSaving}
                    onChange={(nextContent) => handleChange('content', nextContent)}
                  />
                </Field>
              </div>

              <aside className="h-full min-h-0 overflow-y-auto pr-1">
                <div className="mb-2 text-sm font-semibold text-slate-900">Xem trước trực tiếp</div>
                <ProductPreviewCard form={form} previewImageUrl={previewImageUrl} />
              </aside>
            </div>
          ) : null}

          {activeTab === 'seo' ? (
            <div className="grid h-full min-h-0 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)]">
              <div className="h-full min-h-0 space-y-3 overflow-y-auto pr-1">
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
                    className="min-h-28 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
                  />
                </Field>
              </div>

              <aside className="h-full min-h-0 space-y-4 overflow-y-auto pr-1">
                <div>
                  <div className="mb-2 text-sm font-semibold text-slate-900">Xem trước SEO</div>
                  <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="text-lg font-semibold leading-6 text-[#1a0dab]">{form.titleSeo || form.title || 'Tiêu đề SEO'}</div>
                    <div className="text-sm font-medium text-emerald-700">xetai365.vn/{form.slug || 'duong-dan-san-pham'}</div>
                    <div className="text-sm leading-6 font-medium text-slate-700">
                      {form.metaDescription || form.shortDescription || 'Mô tả SEO sẽ hiển thị ở đây.'}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="mb-2 text-sm font-semibold text-slate-900">Preview sản phẩm</div>
                  <ProductPreviewCard form={form} previewImageUrl={previewImageUrl} compact />
                </div>
              </aside>
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-5 py-3">
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
