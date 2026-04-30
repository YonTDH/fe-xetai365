import { Button } from '@/components/ui/button';

type AdminConfirmModalProps = {
  open: boolean;
  title: string;
  description: React.ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  confirmTone?: 'danger' | 'primary';
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function AdminConfirmModal({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Hủy',
  confirmTone = 'danger',
  busy = false,
  onCancel,
  onConfirm,
}: AdminConfirmModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (busy) return;
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="space-y-2">
          <div className={`text-xs font-semibold uppercase tracking-[0.22em] ${confirmTone === 'danger' ? 'text-red-600' : 'text-sky-700'}`}>
            Xác nhận
          </div>
          <h3 className="text-xl font-black text-slate-950">{title}</h3>
          <div className="text-sm leading-6 text-slate-600">{description}</div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={
              confirmTone === 'danger'
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-[#135a91] text-white hover:bg-[#0f4b78]'
            }
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
