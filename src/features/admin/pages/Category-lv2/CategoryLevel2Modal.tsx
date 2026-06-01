import { useCallback, useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AdminConfirmModal } from '../../components/AdminConfirmModal';
import type { AdminVehicleCategory } from '../../api/adminApi';

type CategoryLevel2ModalSavePayload = Pick<
  AdminVehicleCategory,
  'parentId' | 'name' | 'slug' | 'isVisible' | 'description' | 'sortOrder'
> & {
  id?: number;
};

type CategoryLevel2ModalProps = {
  item: AdminVehicleCategory | null;
  parentOptions: AdminVehicleCategory[];
  mode: 'view' | 'edit' | 'create';
  open: boolean;
  isSaving?: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onSave: (nextItem: CategoryLevel2ModalSavePayload) => void;
};

type FormState = {
  parentId: number;
  name: string;
  slug: string;
  isVisible: boolean;
};

type FormErrors = Partial<Record<'parentId' | 'name' | 'slug', string>>;
type TouchedFields = Partial<Record<'parentId' | 'name' | 'slug', boolean>>;

function createFormState(item: AdminVehicleCategory | null, parentOptions: AdminVehicleCategory[]): FormState {
  return {
    parentId: item?.parentId || parentOptions[0]?.id || 0,
    name: item?.name ?? '',
    slug: item?.slug ?? '',
    isVisible: item?.isVisible ?? true,
  };
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

function validateForm(form: FormState, parentOptions: AdminVehicleCategory[]): FormErrors {
  const errors: FormErrors = {};
  const parentExists = parentOptions.some((parent) => parent.id === form.parentId);
  const name = form.name.trim();
  const slug = form.slug.trim();

  if (!form.parentId || !parentExists) {
    errors.parentId = 'Vui lòng chọn danh mục cấp 1.';
  }

  if (!name) {
    errors.name = 'Vui lòng nhập tên danh mục.';
  }

  if (!slug) {
    errors.slug = 'Tên danh mục cần có chữ hoặc số để tạo slug.';
  }

  return errors;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-slate-900">{label}</span>
      {children}
    </label>
  );
}

export function CategoryLevel2Modal({
  item,
  parentOptions,
  mode,
  open,
  isSaving = false,
  onClose,
  onEdit,
  onSave,
}: CategoryLevel2ModalProps) {
  const [form, setForm] = useState<FormState>(createFormState(item, parentOptions));
  const [touched, setTouched] = useState<TouchedFields>({});
  const [initialSnapshot, setInitialSnapshot] = useState(() => JSON.stringify(createFormState(item, parentOptions)));
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const nextForm = createFormState(item, parentOptions);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm(nextForm);
    setTouched({});
    setInitialSnapshot(JSON.stringify(nextForm));
    setConfirmCloseOpen(false);
  }, [item, open, parentOptions]);

  const requestClose = useCallback(() => {
    if (isSaving) return;
    if ((mode === 'edit' || mode === 'create') && JSON.stringify(form) !== initialSnapshot) {
      setConfirmCloseOpen(true);
      return;
    }
    onClose();
  }, [form, initialSnapshot, isSaving, mode, onClose]);

  useEffect(() => {
    if (!open || isSaving) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') requestClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSaving, open, requestClose]);

  if (!open) return null;

  const isReadOnly = mode === 'view';
  const headingName = item?.name || form.name.trim() || 'Danh mục cấp 2 mới';
  const headingSlug = item?.slug || form.slug.trim() || 'Tự động tạo từ tên danh mục';
  const errors = validateForm(form, parentOptions);
  const parentError = touched.parentId ? errors.parentId : undefined;
  const nameError = touched.name ? errors.name : undefined;
  const slugError = touched.slug || touched.name ? errors.slug : undefined;

  const markTouched = (key: keyof TouchedFields) => {
    setTouched((prev) => ({ ...prev, [key]: true }));
  };

  const handleChange = <TKey extends keyof FormState>(key: TKey, value: FormState[TKey]) => {
    setForm((prev) => {
      if (key === 'name') {
        const nextName = String(value);
        return {
          ...prev,
          name: nextName,
          slug: slugifyVietnamese(nextName),
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

    const nextErrors = validateForm(form, parentOptions);
    if (Object.keys(nextErrors).length > 0) {
      setTouched({ parentId: true, name: true, slug: true });
      return;
    }

    onSave({
      id: item?.id,
      parentId: form.parentId,
      name: form.name.trim(),
      slug: form.slug.trim(),
      isVisible: form.isVisible,
      description: item?.description || '',
      sortOrder: item?.sortOrder || 1,
    });
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
        className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div className="space-y-1">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
              {mode === 'create' ? 'Thêm danh mục cấp 2' : isReadOnly ? 'Xem danh mục cấp 2' : 'Cập nhật danh mục cấp 2'}
            </div>
            <h2 className="text-2xl font-black text-slate-950">{headingName}</h2>
            <p className="text-sm text-slate-500">Slug: {headingSlug}</p>
          </div>

          <Button type="button" variant="outline" size="icon-sm" onClick={requestClose} aria-label="Đóng modal" disabled={isSaving}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid gap-4 px-6 py-6 md:grid-cols-2">
          <Field label="Danh mục cấp 1">
            <select
              value={form.parentId}
              onChange={(event) => handleChange('parentId', Number(event.target.value))}
              onBlur={() => markTouched('parentId')}
              disabled={isReadOnly || isSaving}
              aria-label="Danh mục cấp 1"
              aria-invalid={Boolean(parentError)}
              title="Danh mục cấp 1"
              className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
            >
              {parentOptions.map((parent) => (
                <option key={parent.id} value={parent.id}>
                  {parent.name}
                </option>
              ))}
            </select>
            {parentError ? <p className="text-xs font-medium text-red-600">{parentError}</p> : null}
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

          <Field label="Tên danh mục">
            <Input
              value={form.name}
              onChange={(event) => handleChange('name', event.target.value)}
              onBlur={() => markTouched('name')}
              readOnly={isReadOnly || isSaving}
              aria-invalid={Boolean(nameError)}
            />
            {nameError ? <p className="text-xs font-medium text-red-600">{nameError}</p> : null}
          </Field>

          <Field label="Slug">
            <Input value={form.slug} readOnly aria-invalid={Boolean(slugError)} />
            {slugError ? <p className="text-xs font-medium text-red-600">{slugError}</p> : null}
          </Field>
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
            <Button type="button" onClick={handleSubmit} disabled={isSaving || !parentOptions.length}>
              {isSaving ? 'Đang lưu...' : mode === 'create' ? 'Tạo danh mục' : 'Lưu thay đổi'}
            </Button>
          ) : null}
        </div>
      </div>

      <AdminConfirmModal
        open={confirmCloseOpen}
        title="Đóng chỉnh sửa danh mục?"
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
