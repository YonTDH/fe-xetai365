import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, RefreshCw, Store, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppToast } from '@/components/ui/toast';
import {
  getAdminSiteSetting,
  updateAdminSiteSetting,
  type AdminSiteSetting,
  type AdminSiteSettingPayload,
} from '../../api/adminApi';
import { AdminConfirmModal } from '../../components/AdminConfirmModal';
import { AdminShowroomModal, type ShowroomItem } from './AdminShowroomModal';

type ModalState =
  | {
      mode: 'create' | 'edit';
      item: ShowroomItem | null;
    }
  | null;

type DeleteState = ShowroomItem | null;

function parseShowrooms(value: string) {
  return value
    .split(/\r?\n/)
    .map((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return null;

      const separatorIndex = trimmed.indexOf(':');
      if (separatorIndex === -1) {
        return {
          id: `showroom-${index}`,
          office: `Showroom ${index + 1}`,
          address: trimmed,
        } satisfies ShowroomItem;
      }

      return {
        id: `showroom-${index}`,
        office: trimmed.slice(0, separatorIndex).trim(),
        address: trimmed.slice(separatorIndex + 1).trim(),
      } satisfies ShowroomItem;
    })
    .filter(Boolean) as ShowroomItem[];
}

function serializeShowrooms(items: ShowroomItem[]) {
  return items
    .map((item) => `${item.office.trim()}: ${item.address.trim()}`)
    .filter((line) => line !== ':')
    .join('\n');
}

function toPayload(setting: AdminSiteSetting): AdminSiteSettingPayload {
  return {
    title: setting.title,
    keywords: setting.keywords,
    description: setting.description,
    giupdochiase: setting.giupdochiase,
    ten: setting.ten,
    email: setting.email,
    website: setting.website,
    dienthoai: setting.dienthoai,
    diachi: setting.diachi,
    fax: setting.fax,
    tennv: setting.tennv,
    hotline: setting.hotline,
    tennv1: setting.tennv1,
    hotline1: setting.hotline1,
    tennv2: setting.tennv2,
    hotline2: setting.hotline2,
    toado: setting.toado,
    facebook: setting.facebook,
    youtube: setting.youtube,
    zalo: setting.zalo,
    skype: setting.skype,
    twitter: setting.twitter,
    zing: setting.zing,
    google: setting.google,
    tip: setting.tip,
    linktip: setting.linktip,
    analytics: setting.analytics,
    dangky: setting.dangky,
    tietkiem: setting.tietkiem,
    hailong: setting.hailong,
  };
}

export function AdminShowroomPage() {
  const { showToast } = useAppToast();
  const [setting, setSetting] = useState<AdminSiteSetting | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [modalState, setModalState] = useState<ModalState>(null);
  const [deleteState, setDeleteState] = useState<DeleteState>(null);

  const showrooms = useMemo(() => parseShowrooms(setting?.diachi || ''), [setting?.diachi]);

  const loadSetting = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const nextSetting = await getAdminSiteSetting();
      setSetting(nextSetting);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải showroom.';
      setError(message);
      showToast({ type: 'error', message });
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void loadSetting();
  }, [loadSetting]);

  const persistShowrooms = useCallback(
    async (items: ShowroomItem[], successMessage: string) => {
      if (!setting) return;

      try {
        setIsSaving(true);
        setError('');
        const payload = {
          ...toPayload(setting),
          diachi: serializeShowrooms(items),
        };
        const updated = await updateAdminSiteSetting(payload);
        setSetting(updated);
        setModalState(null);
        showToast({ type: 'success', message: successMessage });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Không thể lưu showroom.';
        setError(message);
        showToast({ type: 'error', message });
      } finally {
        setIsSaving(false);
      }
    },
    [setting, showToast]
  );

  const handleSaveShowroom = async (payload: ShowroomItem) => {
    const items =
      modalState?.mode === 'edit'
        ? showrooms.map((item) => (item.id === payload.id ? payload : item))
        : [...showrooms, payload];

    await persistShowrooms(
      items,
      modalState?.mode === 'edit' ? 'Đã cập nhật showroom.' : 'Đã thêm showroom mới.'
    );
  };

  const handleDeleteShowroom = async (id: string) => {
    await persistShowrooms(
      showrooms.filter((item) => item.id !== id),
      'Đã xóa showroom.'
    );
  };

  return (
    <>
      <section className="space-y-5">
        {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 bg-gradient-to-r from-sky-50 via-white to-amber-50 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.24em] text-sky-700">Cài đặt website</div>
              <h2 className="mt-2 text-2xl font-black text-slate-950">Showroom</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Quản lý danh sách showroom hiển thị ở footer. Mỗi showroom có 2 thuộc tính: trụ sở và địa chỉ.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={() => void loadSetting()} disabled={isLoading || isSaving}>
                <RefreshCw className={['h-4 w-4', isLoading ? 'animate-spin' : ''].join(' ')} />
                {isLoading ? 'Đang tải...' : 'Tải lại'}
              </Button>
              <Button
                type="button"
                onClick={() => setModalState({ mode: 'create', item: null })}
                disabled={isLoading || isSaving}
              >
                <Plus className="h-4 w-4" />
                Thêm showroom
              </Button>
            </div>
          </div>

          <div className="p-5">
            {showrooms.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
                Chưa có showroom nào.
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {showrooms.map((item) => (
                  <article key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                          <Store className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-black text-slate-950">{item.office}</h3>
                          <p className="mt-1 text-sm leading-6 text-slate-600">{item.address}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          onClick={() => setModalState({ mode: 'edit', item })}
                          disabled={isSaving}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          onClick={() => setDeleteState(item)}
                          disabled={isSaving}
                          className="border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <AdminShowroomModal
        open={Boolean(modalState)}
        mode={modalState?.mode || 'create'}
        item={modalState?.item || null}
        isSaving={isSaving}
        onClose={() => {
          if (isSaving) return;
          setModalState(null);
        }}
        onSave={(payload) => void handleSaveShowroom(payload)}
      />

      <AdminConfirmModal
        open={Boolean(deleteState)}
        title={deleteState ? `Xóa showroom "${deleteState.office}"?` : 'Xóa showroom?'}
        description="Hành động này sẽ xóa showroom khỏi danh sách hiển thị ở footer."
        confirmLabel={isSaving ? 'Đang xóa...' : 'Xóa showroom'}
        busy={isSaving}
        onCancel={() => {
          if (isSaving) return;
          setDeleteState(null);
        }}
        onConfirm={() => {
          if (!deleteState) return;
          void handleDeleteShowroom(deleteState.id).then(() => setDeleteState(null));
        }}
      />
    </>
  );
}
