import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getBulletinDetail, type BulletinItem } from '@/api/bulletinsApi';

function formatDate(value: string | null) {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleDateString('vi-VN');
}

function normalizeIdOrSlug(value: string) {
  return value.replace(/\.html$/i, '');
}

export function NewsDetailPage() {
  const { idOrSlug = '' } = useParams();
  const [item, setItem] = useState<BulletinItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const normalizedIdOrSlug = useMemo(() => normalizeIdOrSlug(idOrSlug), [idOrSlug]);

  const loadDetail = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await getBulletinDetail(normalizedIdOrSlug);
      setItem(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải chi tiết bài viết.';
      setError(message);
      setItem(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!normalizedIdOrSlug) {
      setError('Đường dẫn bài viết không hợp lệ.');
      return;
    }
    void loadDetail();
  }, [normalizedIdOrSlug]);

  return (
    <section className="bg-slate-50 py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex border-b-2 border-[#FFD600]">
          <h1 className="relative -mb-0.5 bg-[#FFD600] px-5 py-2 pr-11 text-base font-bold uppercase text-black md:px-6 md:py-3 md:pr-12 md:text-lg">
            Thông tin - Sự kiện
            <span className="absolute right-0 top-0 h-0 w-0 border-b-[20px] border-l-[14px] border-t-[20px] border-b-transparent border-l-[#FFD600] border-t-transparent md:border-b-[24px] md:border-l-[16px] md:border-t-[24px]" />
          </h1>
        </div>

        {isLoading && <p className="text-sm text-slate-600">Đang tải chi tiết bài viết...</p>}

        {!isLoading && error && (
          <Card className="border border-red-200 bg-red-50 shadow-card">
            <CardContent className="flex items-center justify-between gap-4 p-4">
              <p className="text-sm font-medium text-red-700">{error}</p>
              <Button type="button" variant="outline" onClick={loadDetail}>
                Tải lại
              </Button>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && item && (
          <article className="rounded-lg border border-slate-300 bg-white p-5 shadow-card md:p-6">
            <h2 className="text-xl font-bold text-navy-950 md:text-2xl">{item.title}</h2>
            {formatDate(item.publishedAt) && (
              <p className="mt-2 text-sm text-slate-500">Ngày đăng: {formatDate(item.publishedAt)}</p>
            )}
            {item.excerpt && <p className="mt-4 text-base font-medium text-slate-800">{item.excerpt}</p>}
            <div className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-700 md:text-base">
              {item.content || 'Đang cập nhật nội dung...'}
            </div>
          </article>
        )}
      </div>
    </section>
  );
}
