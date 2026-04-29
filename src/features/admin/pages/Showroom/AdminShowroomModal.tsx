import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export type ShowroomItem = {
  id: string;
  office: string;
  address: string;
};

type AdminShowroomModalProps = {
  open: boolean;
  mode: 'create' | 'edit';
  item: ShowroomItem | null;
  isSaving?: boolean;
  onClose: () => void;
  onSave: (payload: ShowroomItem) => void;
};

function createEmptyItem(): ShowroomItem {
  return {
    id: `showroom-${Date.now()}`,
    office: '',
    address: '',
  };
}

export function AdminShowroomModal({
  open,
  mode,
  item,
  isSaving = false,
  onClose,
  onSave,
}: AdminShowroomModalProps) {
  const [form, setForm] = useState<ShowroomItem>(() => item || createEmptyItem());
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    setForm(item || createEmptyItem());
  }, [item, open]);

  useEffect(() => {
    if (!open || isSaving) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSaving, onClose, open]);

  if (!open) return null;

  const handleSubmit = () => {
    onSave({
      ...form,
      office: form.office.trim(),
      address: form.address.trim(),
    });
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
        className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div className="space-y-1">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
              {mode === 'create' ? 'Thêm showroom' : 'Cập nhật showroom'}
            </div>
            <h2 className="text-2xl font-black text-slate-950">
              {mode === 'create' ? 'Showroom mới' : item?.office || 'Showroom'}
            </h2>
          </div>

          <Button type="button" variant="outline" size="icon-sm" onClick={onClose} disabled={isSaving}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid gap-4 px-6 py-6">
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-900">Trụ sở / Showroom</span>
            <Input
              value={form.office}
              onChange={(event) => setForm((prev) => ({ ...prev, office: event.target.value }))}
              placeholder="Ví dụ: Showroom 1, Trạm dịch vụ, Xưởng đóng thùng"
              disabled={isSaving}
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-900">Địa chỉ</span>
            <textarea
              value={form.address}
              onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
              placeholder="Nhập địa chỉ showroom"
              disabled={isSaving}
              className="min-h-28 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm leading-6 text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
            Đóng
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving || !form.office.trim() || !form.address.trim()}
          >
            {isSaving ? 'Đang lưu...' : mode === 'create' ? 'Thêm showroom' : 'Lưu thay đổi'}
          </Button>
        </div>
      </div>
    </div>
  );
}
