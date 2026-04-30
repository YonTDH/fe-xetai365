import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AdminConfirmModal } from '../../components/AdminConfirmModal';
import type { AdminVehicleCategory } from '../../api/adminApi';

type CategoryLevel1ModalSavePayload = Pick<
  AdminVehicleCategory,
  'name' | 'slug' | 'isVisible' | 'description' | 'sortOrder'
> & {
  id?: number;
};

type CategoryLevel1ModalProps = {
  item: AdminVehicleCategory | null;
  mode: 'view' | 'edit' | 'create';
  open: boolean;
  isSaving?: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onSave: (nextItem: CategoryLevel1ModalSavePayload) => void;
};

type FormState = {
  name: string;
  slug: string;
  isVisible: boolean;
};

function createFormState(item: AdminVehicleCategory | null): FormState {
  return {
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-slate-900">{label}</span>
      {children}
    </label>
  );
}

export function CategoryLevel1Modal({
  item,
  mode,
  open,
  isSaving = false,
  onClose,
  onEdit,
  onSave,
}: CategoryLevel1ModalProps) {
  const [form, setForm] = useState<FormState>(createFormState(item));
  const [initialSnapshot, setInitialSnapshot] = useState(() => JSON.stringify(createFormState(item)));
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const nextForm = createFormState(item);
    setForm(nextForm);
    setInitialSnapshot(JSON.stringify(nextForm));
    setConfirmCloseOpen(false);
  }, [item, open]);

  const requestClose = () => {
    if (isSaving) return;
    if ((mode === 'edit' || mode === 'create') && JSON.stringify(form) !== initialSnapshot) {
      setConfirmCloseOpen(true);
      return;
    }
    onClose();
  };

  useEffect(() => {
    if (!open || isSaving) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') requestClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [form, initialSnapshot, isSaving, mode, open]);

  if (!open) return null;

  const isReadOnly = mode === 'view';
  const headingName = item?.name || form.name.trim() || 'Danh mục cấp 1 mới';
  const childCount = item?.children.length ?? 0;

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

    onSave({
      id: item?.id,
      name: form.name.trim() || item?.name || '',
      slug: form.slug.trim() || item?.slug || '',
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
              {mode === 'create' ? 'Thêm danh mục cấp 1' : isReadOnly ? 'Xem danh mục cấp 1' : 'Cập nhật danh mục cấp 1'}
            </div>
            <h2 className="text-2xl font-black text-slate-950">{headingName}</h2>
            <p className="text-sm text-slate-500">{childCount} danh mục cấp 2</p>
          </div>

          <Button type="button" variant="outline" size="icon-sm" onClick={requestClose} aria-label="Đóng modal" disabled={isSaving}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid gap-4 px-6 py-6 md:grid-cols-2">
          <Field label="Tên danh mục">
            <Input value={form.name} onChange={(event) => handleChange('name', event.target.value)} readOnly={isReadOnly || isSaving} />
          </Field>

          <Field label="Slug">
            <Input value={form.slug} readOnly />
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

          <Field label="Số danh mục cấp 2">
            <div className="flex h-10 items-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700">{childCount}</div>
          </Field>

          <div className="md:col-span-2">
            <Field label="Danh mục cấp 2 hiện có">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                {childCount ? (
                  <div className="flex flex-wrap gap-2">
                    {(item?.children || []).map((child) => (
                      <span key={child.id} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700">
                        {child.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-slate-500">
                    {mode === 'create' ? 'Danh mục cấp 2 sẽ thêm sau khi tạo danh mục cấp 1.' : 'Chưa có danh mục cấp 2.'}
                  </div>
                )}
              </div>
            </Field>
          </div>
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
            <Button type="button" onClick={handleSubmit} disabled={isSaving}>
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
