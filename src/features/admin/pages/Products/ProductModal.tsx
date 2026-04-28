import { useEffect, useMemo, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { uploadAdminImage, type AdminProduct, type AdminProductPayload, type AdminVehicleCategory } from '../../api/adminApi';

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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-slate-900">{label}</span>
      {children}
    </label>
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
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    setForm(createFormState(item, categoryLevel2Options[0]?.id || 0));
    setSelectedImageFile(null);
    setIsUploadingImage(false);
    setUploadError('');
  }, [item, open, categoryLevel2Options]);

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

  const handleChange = <TKey extends keyof FormState>(key: TKey, value: FormState[TKey]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (isReadOnly) {
      onClose();
      return;
    }
    onSave(form);
  };

  const handleUploadImage = async () => {
    if (!selectedImageFile) {
      setUploadError('Vui lòng chọn ảnh trước khi upload.');
      return;
    }

    try {
      setIsUploadingImage(true);
      setUploadError('');
      const uploaded = await uploadAdminImage(selectedImageFile, 'products');
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
        className="flex max-h-[82vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div className="space-y-1">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
              {mode === 'create' ? 'Tạo sản phẩm' : isReadOnly ? 'Xem sản phẩm' : 'Cập nhật sản phẩm'}
            </div>
            <h2 className="text-2xl font-black text-slate-950">{item?.title || 'Sản phẩm mới'}</h2>
          </div>
          <Button type="button" variant="outline" size="icon-sm" onClick={onClose} disabled={isSaving}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid gap-4 overflow-y-auto px-6 py-5 md:grid-cols-2">
          <Field label="Tên sản phẩm">
            <Input value={form.title} onChange={(event) => handleChange('title', event.target.value)} readOnly={isReadOnly || isSaving} />
          </Field>
          <Field label="Slug">
            <Input value={form.slug} onChange={(event) => handleChange('slug', event.target.value)} readOnly={isReadOnly || isSaving} />
          </Field>
          <Field label="Danh mục cấp 2">
            <select
              value={form.categoryLevel2Id}
              onChange={(event) => handleChange('categoryLevel2Id', Number(event.target.value))}
              disabled={isReadOnly || isSaving}
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
            <Input value={form.priceVnd} onChange={(event) => handleChange('priceVnd', event.target.value)} readOnly={isReadOnly || isSaving} />
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
          <Field label="Hiển thị">
            <label className="flex h-10 items-center gap-3 rounded-xl border border-slate-200 px-3">
              <input type="checkbox" checked={form.isVisible} onChange={(event) => handleChange('isVisible', event.target.checked)} disabled={isReadOnly || isSaving} className="h-4 w-4 rounded border-slate-300" />
              <span className="text-sm text-slate-700">{form.isVisible ? 'Đang hiển thị' : 'Đang ẩn'}</span>
            </label>
          </Field>
          <Field label="Nổi bật">
            <label className="flex h-10 items-center gap-3 rounded-xl border border-slate-200 px-3">
              <input type="checkbox" checked={form.isFeatured} onChange={(event) => handleChange('isFeatured', event.target.checked)} disabled={isReadOnly || isSaving} className="h-4 w-4 rounded border-slate-300" />
              <span className="text-sm text-slate-700">{form.isFeatured ? 'Sản phẩm nổi bật' : 'Không nổi bật'}</span>
            </label>
          </Field>
          <div className="md:col-span-2">
            <Field label="Mô tả ngắn">
              <textarea
                value={form.shortDescription}
                onChange={(event) => handleChange('shortDescription', event.target.value)}
                readOnly={isReadOnly || isSaving}
                className="min-h-20 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
              />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Nội dung">
              <textarea
                value={form.content}
                onChange={(event) => handleChange('content', event.target.value)}
                readOnly={isReadOnly || isSaving}
                className="min-h-28 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
              />
            </Field>
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
              {isSaving ? 'Đang lưu...' : mode === 'create' ? 'Tạo sản phẩm' : 'Lưu thay đổi'}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
