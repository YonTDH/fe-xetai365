import { type ChangeEvent, useCallback, useEffect, useState } from 'react';
import { ImageIcon, RefreshCw, Save, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppToast } from '@/components/ui/toast-context';
import logoFallback from '@/assets/logo-namviet-binh-phuov.png';
import {
  getAdminSiteSetting,
  updateAdminSiteSetting,
  uploadAdminImage,
  type AdminSiteSetting,
} from '../../api/adminApi';

export function AdminLogoPage() {
  const { showToast } = useAppToast();
  const [setting, setSetting] = useState<AdminSiteSetting | null>(null);
  const [logoUrl, setLogoUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const loadSetting = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await getAdminSiteSetting();
      setSetting(data);
      setLogoUrl(data.logoUrl || '');
      setSelectedFile(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải cấu hình logo.';
      setError(message);
      showToast({ type: 'error', message });
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void loadSetting();
  }, [loadSetting]);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl('');
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(event.target.files?.[0] || null);
    setError('');
  };

  const handleSave = async () => {
    if (!setting) return;

    try {
      setIsSaving(true);
      setError('');
      const nextLogoUrl = selectedFile ? (await uploadAdminImage(selectedFile, 'logos')).imageUrl : logoUrl.trim();
      const updated = await updateAdminSiteSetting({
        ...setting,
        logoUrl: nextLogoUrl,
      });
      setSetting(updated);
      setLogoUrl(updated.logoUrl || '');
      setSelectedFile(null);
      showToast({ type: 'success', message: 'Đã cập nhật logo header.' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể lưu logo header.';
      setError(message);
      showToast({ type: 'error', message });
    } finally {
      setIsSaving(false);
    }
  };

  const displayLogo = previewUrl || logoUrl || logoFallback;

  return (
    <section className="space-y-5">
      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.24em] text-sky-700">Logo header</div>
            <h2 className="mt-2 text-2xl font-black text-slate-950">Quản lý logo</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">Logo này hiển thị ở góc trái header website.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={() => void loadSetting()} disabled={isLoading || isSaving}>
              <RefreshCw className={['h-4 w-4', isLoading ? 'animate-spin' : ''].join(' ')} />
              Tải lại
            </Button>
            <Button type="button" onClick={() => void handleSave()} disabled={isLoading || isSaving}>
              <Save className="h-4 w-4" />
              {isSaving ? 'Đang lưu...' : 'Lưu logo'}
            </Button>
          </div>
        </div>

        <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-bold text-slate-800">URL logo</span>
              <Input
                value={logoUrl}
                onChange={(event) => setLogoUrl(event.target.value)}
                placeholder="https://..."
                disabled={isLoading || isSaving}
                className="h-10 rounded-xl border-slate-200 bg-white text-slate-900"
              />
            </label>

            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100">
              <Upload className="h-4 w-4" />
              Chọn logo từ máy
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={isLoading || isSaving} />
            </label>

            <div className="text-xs font-medium text-slate-600">
              {selectedFile ? selectedFile.name : logoUrl ? 'Đang dùng logo từ URL.' : 'Chưa chọn logo mới.'}
            </div>
          </div>

          <aside className="rounded-2xl border border-slate-200 bg-slate-950 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
              <ImageIcon className="h-4 w-4" />
              Xem trước header
            </div>
            <div className="flex h-24 items-center rounded-xl border border-white/10 bg-[#0f172a] px-4">
              <img src={displayLogo} alt="Logo header" className="h-16 w-auto object-contain" />
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
