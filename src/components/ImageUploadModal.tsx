import { useCallback, useEffect, useState, type ChangeEvent } from 'react';
import { Check, ImageIcon, Images, Loader2, RefreshCw, UploadCloud, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type ImageUploadModalItem = {
  id: string;
  imageUrl: string;
  title?: string;
};

type ImageUploadModalProps = {
  open: boolean;
  title?: string;
  currentImageUrl?: string;
  loadImages: () => Promise<ImageUploadModalItem[]>;
  uploadImage: (file: File) => Promise<{ imageUrl: string }>;
  onSelect: (imageUrl: string) => void;
  onClose: () => void;
};

type ImageUploadTab = 'cloudinary' | 'upload';

export function ImageUploadModal({
  open,
  title = 'Chọn hình ảnh',
  currentImageUrl = '',
  loadImages,
  uploadImage,
  onSelect,
  onClose,
}: ImageUploadModalProps) {
  const [activeTab, setActiveTab] = useState<ImageUploadTab>('cloudinary');
  const [cloudImages, setCloudImages] = useState<ImageUploadModalItem[]>([]);
  const [selectedCloudImageUrl, setSelectedCloudImageUrl] = useState('');
  const [isLoadingCloudImages, setIsLoadingCloudImages] = useState(false);
  const [cloudError, setCloudError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const reloadCloudImages = useCallback(async () => {
    try {
      setIsLoadingCloudImages(true);
      setCloudError('');
      setCloudImages(await loadImages());
    } catch (err) {
      setCloudError(err instanceof Error ? err.message : 'Không thể tải hình từ Cloudinary.');
    } finally {
      setIsLoadingCloudImages(false);
    }
  }, [loadImages]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setActiveTab('cloudinary');
    setSelectedCloudImageUrl(currentImageUrl);
    setSelectedFile(null);
    setLocalPreviewUrl('');
    setUploadError('');
    void reloadCloudImages();
  }, [currentImageUrl, open, reloadCloudImages]);

  useEffect(() => {
    if (!selectedFile) {
      setLocalPreviewUrl('');
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setLocalPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(event.target.files?.[0] || null);
    setUploadError('');
  };

  const handleUseCloudImage = () => {
    if (!selectedCloudImageUrl) {
      setCloudError('Vui lòng chọn một hình ảnh.');
      return;
    }

    onSelect(selectedCloudImageUrl);
    onClose();
  };

  const handleUploadAndUse = async () => {
    if (!selectedFile) {
      setUploadError('Vui lòng chọn hình từ máy.');
      return;
    }

    try {
      setIsUploading(true);
      setUploadError('');
      const uploaded = await uploadImage(selectedFile);
      if (!uploaded.imageUrl) {
        throw new Error('Upload không trả về URL hình ảnh.');
      }
      onSelect(uploaded.imageUrl);
      onClose();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Không thể upload hình ảnh.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Đóng modal" onClick={onClose} />
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.22em] text-sky-700">Hình ảnh</div>
            <h2 className="mt-1 text-xl font-black text-slate-950">{title}</h2>
          </div>
          <Button type="button" variant="outline" size="icon-sm" onClick={onClose} aria-label="Đóng">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2 border-b border-slate-200 bg-slate-50 px-5 py-3">
          <button
            type="button"
            onClick={() => setActiveTab('cloudinary')}
            className={[
              'inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold transition sm:flex-none',
              activeTab === 'cloudinary'
                ? 'border-sky-700 bg-sky-700 text-white shadow-sm'
                : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-100',
            ].join(' ')}
          >
            <Images className="h-4 w-4" />
            Cloudinary
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={[
              'inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold transition sm:flex-none',
              activeTab === 'upload'
                ? 'border-sky-700 bg-sky-700 text-white shadow-sm'
                : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-100',
            ].join(' ')}
          >
            <UploadCloud className="h-4 w-4" />
            Từ máy
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {activeTab === 'cloudinary' ? (
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm font-medium text-slate-600">Chọn hình đã upload trên Cloudinary.</div>
                <Button type="button" variant="outline" onClick={() => void reloadCloudImages()} disabled={isLoadingCloudImages}>
                  <RefreshCw className={['h-4 w-4', isLoadingCloudImages ? 'animate-spin' : ''].join(' ')} />
                  Tải lại
                </Button>
              </div>

              {cloudError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{cloudError}</div>
              ) : null}

              {isLoadingCloudImages ? (
                <div className="flex min-h-72 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm font-semibold text-slate-500">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Đang tải hình...
                </div>
              ) : cloudImages.length ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {cloudImages.map((item) => {
                    const isSelected = selectedCloudImageUrl === item.imageUrl;

                    return (
                      <button
                        key={item.id || item.imageUrl}
                        type="button"
                        onClick={() => {
                          setSelectedCloudImageUrl(item.imageUrl);
                          setCloudError('');
                        }}
                        className={[
                          'group relative overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition',
                          isSelected ? 'border-sky-700 ring-2 ring-sky-200' : 'border-slate-200 hover:border-sky-300',
                        ].join(' ')}
                      >
                        <img src={item.imageUrl} alt={item.title || 'Cloudinary image'} className="aspect-[16/10] w-full bg-slate-100 object-cover" />
                        <div className="truncate px-3 py-2 text-xs font-semibold text-slate-700">{item.title || item.id}</div>
                        {isSelected ? (
                          <span className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-sky-700 text-white shadow">
                            <Check className="h-4 w-4" />
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center text-sm font-semibold text-slate-500">
                  <ImageIcon className="mb-2 h-8 w-8" />
                  Chưa có hình trong thư mục này.
                </div>
              )}
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
              <div className="space-y-4">
                <label className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center transition hover:border-sky-300 hover:bg-sky-50">
                  <UploadCloud className="mb-3 h-9 w-9 text-sky-700" />
                  <span className="text-sm font-black text-slate-900">Chọn hình từ máy</span>
                  <span className="mt-1 text-xs font-medium text-slate-500">JPG, PNG, WEBP hoặc GIF.</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={isUploading} />
                </label>

                {selectedFile ? (
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
                    <div className="font-bold text-slate-900">{selectedFile.name}</div>
                    <div className="mt-1 text-xs font-medium text-slate-500">{Math.max(1, Math.round(selectedFile.size / 1024))} KB</div>
                  </div>
                ) : null}

                {uploadError ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{uploadError}</div>
                ) : null}
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                {localPreviewUrl ? (
                  <img src={localPreviewUrl} alt="Xem trước hình upload" className="aspect-[16/9] h-full min-h-72 w-full object-contain" />
                ) : (
                  <div className="flex aspect-[16/9] min-h-72 flex-col items-center justify-center text-sm font-semibold text-slate-500">
                    <ImageIcon className="mb-2 h-8 w-8" />
                    Chưa chọn hình.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={isUploading}>
            Hủy
          </Button>
          {activeTab === 'cloudinary' ? (
            <Button type="button" onClick={handleUseCloudImage} disabled={!selectedCloudImageUrl || isLoadingCloudImages}>
              <Check className="h-4 w-4" />
              Dùng ảnh
            </Button>
          ) : (
            <Button type="button" onClick={() => void handleUploadAndUse()} disabled={!selectedFile || isUploading}>
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
              {isUploading ? 'Đang upload...' : 'Tải lên và dùng'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
