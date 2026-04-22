import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { listNewsEvents, type BulletinItem } from '@/api/bulletinsApi';

function formatDate(value: string | null) {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleDateString('vi-VN');
}

export function NewsPage() {
  const [items, setItems] = useState<BulletinItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const title = useMemo(() => 'Thông tin - Sự kiện', []);

  const loadNews = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await listNewsEvents(12);
      setItems(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải danh sách tin tức.';
      setError(message);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadNews();
  }, []);

  return (
    <section className="bg-slate-50 py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex border-b-2 border-[#FFD600]">
          <h1 className="relative -mb-0.5 bg-[#FFD600] px-5 py-2 pr-11 text-base font-bold uppercase text-black md:px-6 md:py-3 md:pr-12 md:text-lg">
            {title}
            <span className="absolute right-0 top-0 h-0 w-0 border-b-[20px] border-l-[14px] border-t-[20px] border-b-transparent border-l-[#FFD600] border-t-transparent md:border-b-[24px] md:border-l-[16px] md:border-t-[24px]" />
          </h1>
        </div>

        {isLoading && <p className="text-sm text-slate-600">Đang tải tin tức - sự kiện...</p>}

        {!isLoading && error && (
          <Card className="border border-red-200 bg-red-50 shadow-card">
            <CardContent className="flex items-center justify-between gap-4 p-4">
              <p className="text-sm font-medium text-red-700">{error}</p>
              <Button type="button" variant="outline" onClick={loadNews}>
                Tải lại
              </Button>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && items.length === 0 && (
          <Card className="border border-slate-300 bg-white shadow-card">
            <CardContent className="p-5 text-sm text-slate-700">Hiện chưa có bài viết thông tin - sự kiện nào.</CardContent>
          </Card>
        )}

        {!isLoading && !error && items.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <Card key={item.id} className="border border-slate-300 bg-white shadow-card">
                <CardHeader className="space-y-1">
                  <CardTitle className="line-clamp-2 text-base font-bold text-navy-950">
                    <Link to={`/tin-tuc/${item.slug}.html`} className="hover:text-primary-700">
                      {item.title}
                    </Link>
                  </CardTitle>
                  <CardDescription>
                    {formatDate(item.publishedAt) ? `Ngày đăng: ${formatDate(item.publishedAt)}` : ' '}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-slate-700">
                  <p className="line-clamp-4">{item.excerpt || item.content || 'Đang cập nhật nội dung...'}</p>
                  <Link to={`/tin-tuc/${item.slug}.html`} className="inline-block text-sm font-semibold text-primary-700">
                    Xem chi tiết
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
