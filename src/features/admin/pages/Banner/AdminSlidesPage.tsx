import { type ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { ImageIcon, Pencil, Plus, RefreshCw, Save, Trash2, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppToast } from '@/components/ui/toast-context';
import {
  createAdminHomeSlide,
  deleteAdminHomeSlide,
  listAdminHomeSlides,
  updateAdminHomeSlide,
  uploadAdminImage,
  type AdminHomeSlide,
  type AdminHomeSlidePayload,
} from '../../api/adminApi';

type SlideFormState = AdminHomeSlidePayload;

const emptyForm: SlideFormState = {
  title: '',
  imageUrl: '',
  linkUrl: '',
  sortOrder: 1,
  isVisible: true,
};

function createFormFromSlide(slide?: AdminHomeSlide | null): SlideFormState {
  if (!slide) return emptyForm;
  return {
    title: slide.title,
    imageUrl: slide.imageUrl,
    linkUrl: slide.linkUrl,
    sortOrder: slide.sortOrder || 1,
    isVisible: slide.isVisible,
  };
}

export function AdminSlidesPage() {
  const { showToast } = useAppToast();
  const [slides, setSlides] = useState<AdminHomeSlide[]>([]);
  const [editingSlideId, setEditingSlideId] = useState<number | null>(null);
  const [form, setForm] = useState<SlideFormState>(emptyForm);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const editingSlide = useMemo(
    () => slides.find((slide) => slide.id === editingSlideId) || null,
    [editingSlideId, slides]
  );

  const loadSlides = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      setSlides(await listAdminHomeSlides());
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải slide ảnh.';
      setError(message);
      showToast({ type: 'error', message });
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void loadSlides();
  }, [loadSlides]);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl('');
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const updateField = <TKey extends keyof SlideFormState>(key: TKey, value: SlideFormState[TKey]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setEditingSlideId(null);
    setForm(emptyForm);
    setSelectedFile(null);
    setError('');
  };

  const startEdit = (slide: AdminHomeSlide) => {
    setEditingSlideId(slide.id);
    setForm(createFormFromSlide(slide));
    setSelectedFile(null);
    setError('');
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(event.target.files?.[0] || null);
    setError('');
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError('');
      const imageUrl = selectedFile ? (await uploadAdminImage(selectedFile, 'slides')).imageUrl : form.imageUrl.trim();
      if (!imageUrl) {
        throw new Error('Vui lòng chọn ảnh slide.');
      }

      const payload: SlideFormState = {
        ...form,
        imageUrl,
        title: form.title.trim(),
        linkUrl: form.linkUrl.trim(),
        sortOrder: Number(form.sortOrder) || 1,
      };

      if (editingSlideId) {
        await updateAdminHomeSlide(editingSlideId, payload);
        showToast({ type: 'success', message: 'Đã cập nhật slide ảnh.' });
      } else {
        await createAdminHomeSlide(payload);
        showToast({ type: 'success', message: 'Đã thêm slide ảnh.' });
      }

      resetForm();
      await loadSlides();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể lưu slide ảnh.';
      setError(message);
      showToast({ type: 'error', message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (slide: AdminHomeSlide) => {
    if (!window.confirm(`Xóa slide "${slide.title || slide.imageUrl}"?`)) {
      return;
    }

    try {
      setDeletingId(slide.id);
      await deleteAdminHomeSlide(slide.id);
      if (editingSlideId === slide.id) {
        resetForm();
      }
      setSlides((prev) => prev.filter((item) => item.id !== slide.id));
      showToast({ type: 'success', message: 'Đã xóa slide ảnh.' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể xóa slide ảnh.';
      setError(message);
      showToast({ type: 'error', message });
    } finally {
      setDeletingId(null);
    }
  };

  const displayImage = previewUrl || form.imageUrl;

  return (
    <section className="space-y-5">
      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <div className="grid gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
        <form
          className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSave();
          }}
        >
          <div className="border-b border-slate-200 px-5 py-4">
            <div className="text-xs font-black uppercase tracking-[0.24em] text-sky-700">
              {editingSlide ? 'Cập nhật slide' : 'Thêm slide'}
            </div>
            <h2 className="mt-2 text-2xl font-black text-slate-950">Slide ảnh trang chủ</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">Ảnh chạy ở đầu trang chủ, cạnh khối tin tức mới.</p>
          </div>

          <div className="space-y-4 p-5">
            <label className="block">
              <span className="mb-1.5 block text-sm font-bold text-slate-800">Tên slide</span>
              <Input
                value={form.title}
                onChange={(event) => updateField('title', event.target.value)}
                placeholder="Nhập tên slide"
                disabled={isSaving}
                className="h-10 rounded-xl border-slate-200 bg-white text-slate-900"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-bold text-slate-800">URL ảnh</span>
              <Input
                value={form.imageUrl}
                onChange={(event) => updateField('imageUrl', event.target.value)}
                placeholder="https://..."
                disabled={isSaving}
                className="h-10 rounded-xl border-slate-200 bg-white text-slate-900"
              />
            </label>

            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100">
              <Upload className="h-4 w-4" />
              Chọn ảnh từ máy
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={isSaving} />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-bold text-slate-800">Link khi bấm ảnh</span>
              <Input
                value={form.linkUrl}
                onChange={(event) => updateField('linkUrl', event.target.value)}
                placeholder="/san-pham hoặc https://..."
                disabled={isSaving}
                className="h-10 rounded-xl border-slate-200 bg-white text-slate-900"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-bold text-slate-800">Thứ tự</span>
                <Input
                  type="number"
                  min={1}
                  value={String(form.sortOrder)}
                  onChange={(event) => updateField('sortOrder', Number(event.target.value) || 1)}
                  disabled={isSaving}
                  className="h-10 rounded-xl border-slate-200 bg-white text-slate-900"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-bold text-slate-800">Hiển thị</span>
                <span className="flex h-10 items-center gap-3 rounded-xl border border-slate-200 px-3">
                  <input
                    type="checkbox"
                    checked={form.isVisible}
                    onChange={(event) => updateField('isVisible', event.target.checked)}
                    disabled={isSaving}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  <span className="text-sm font-medium text-slate-800">{form.isVisible ? 'Đang hiển thị' : 'Đang ẩn'}</span>
                </span>
              </label>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
              {displayImage ? (
                <img src={displayImage} alt={form.title || 'Slide ảnh'} className="aspect-[16/8] w-full object-cover" />
              ) : (
                <div className="flex aspect-[16/8] items-center justify-center text-sm font-semibold text-slate-500">
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Chưa có ảnh
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3">
            {editingSlideId ? (
              <Button type="button" variant="outline" onClick={resetForm} disabled={isSaving}>
                <X className="h-4 w-4" />
                Hủy
              </Button>
            ) : null}
            <Button type="submit" disabled={isSaving}>
              {editingSlideId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {isSaving ? 'Đang lưu...' : editingSlideId ? 'Lưu slide' : 'Thêm slide'}
            </Button>
          </div>
        </form>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-950">Danh sách slide</h3>
              <p className="mt-1 text-sm text-slate-600">Đang có {slides.length} slide.</p>
            </div>
            <Button type="button" variant="outline" onClick={() => void loadSlides()} disabled={isLoading || isSaving}>
              <RefreshCw className={['h-4 w-4', isLoading ? 'animate-spin' : ''].join(' ')} />
              Tải lại
            </Button>
          </div>

          <div className="space-y-3 p-5">
            {slides.map((slide) => (
              <article key={slide.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm [&>img]:h-28 [&>img]:w-full [&>img]:shrink-0 [&>img]:rounded-xl [&>img]:border [&>img]:border-slate-100 [&>img]:bg-slate-100 sm:flex-row sm:items-center sm:[&>img]:h-24 sm:[&>img]:w-40 lg:[&>img]:h-28 lg:[&>img]:w-48">
                <img src={slide.imageUrl} alt={slide.title || 'Slide ảnh'} className="aspect-[16/8] w-full object-cover" />
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="line-clamp-2 text-base font-black text-slate-950">{slide.title || 'Chưa đặt tên'}</h4>
                      <p className="mt-1 text-xs font-medium text-slate-500">Thứ tự: {slide.sortOrder}</p>
                    </div>
                    <span
                      className={[
                        'rounded-full px-2 py-1 text-[10px] font-bold uppercase',
                        slide.isVisible ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-600',
                      ].join(' ')}
                    >
                      {slide.isVisible ? 'Hiện' : 'Ẩn'}
                    </span>
                  </div>
                  {slide.linkUrl ? <div className="truncate text-xs font-medium text-sky-700">{slide.linkUrl}</div> : null}
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" size="icon-sm" onClick={() => startEdit(slide)} disabled={isSaving || deletingId === slide.id}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      onClick={() => void handleDelete(slide)}
                      disabled={isSaving || deletingId === slide.id}
                      className="border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className={['h-4 w-4', deletingId === slide.id ? 'animate-pulse' : ''].join(' ')} />
                    </Button>
                  </div>
                </div>
              </article>
            ))}

            {!slides.length ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm font-medium text-slate-600">
                Chưa có slide ảnh.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
