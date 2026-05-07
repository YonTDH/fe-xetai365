import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import topProductImg from '@/assets/lading-page/top-product.png';
import { PublicSectionHeading } from '@/components/PublicSectionHeading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getCategoryDisplayName, listCatalogCategoriesTree, type CategoryNode } from '@/api/landingApi';
import type { BulletinItem } from '@/api/bulletinsApi';

function formatDate(value: string | null) {
  if (!value) return '';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';

  return parsed.toLocaleDateString('vi-VN');
}

function flattenCategories(nodes: CategoryNode[], parentSlug?: string): Array<{ key: string; label: string; path: string }> {
  return nodes.flatMap((node) => {
    const currentPath = parentSlug ? `/san-pham/${parentSlug}/${node.slug}` : `/san-pham/${node.slug}`;
    const currentItem = {
      key: `${parentSlug || 'root'}-${node.slug}`,
      label: getCategoryDisplayName(node.slug, node.name),
      path: currentPath,
    };

    return [currentItem, ...flattenCategories(node.children || [], node.slug)];
  });
}

type BulletinListPageProps = {
  title: string;
  activeTab: 'news' | 'promotion' | 'recruitment' | 'services';
  detailBasePath: string;
  loadItems: (limit?: number) => Promise<BulletinItem[]>;
  loadingText: string;
  emptyText: string;
  errorText: string;
};

export function BulletinListPage({
  title,
  activeTab,
  detailBasePath,
  loadItems,
  loadingText,
  emptyText,
  errorText,
}: BulletinListPageProps) {
  const [items, setItems] = useState<BulletinItem[]>([]);
  const [productMenu, setProductMenu] = useState<Array<{ key: string; label: string; path: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const bulletinTabs = useMemo(
    () => [
      { key: 'news', label: 'Tin tức - sự kiện', path: '/tin-tuc' },
      { key: 'promotion', label: 'Khuyến mãi', path: '/khuyen-mai' },
      { key: 'services', label: 'Dịch vụ', path: '/dich-vu' },
      { key: 'recruitment', label: 'Tuyển dụng', path: '/tuyen-dung' },
    ],
    [],
  );

  const loadPageData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const [bulletins, categoryTree] = await Promise.all([loadItems(12), listCatalogCategoriesTree()]);
      setItems(bulletins);
      setProductMenu(flattenCategories(categoryTree).slice(0, 12));
    } catch (err) {
      const message = err instanceof Error ? err.message : errorText;
      setError(message);
      setItems([]);
      setProductMenu([]);
    } finally {
      setIsLoading(false);
    }
  }, [errorText, loadItems]);

  useEffect(() => {
    void loadPageData();
  }, [loadPageData]);

  return (
    <section className="min-h-screen bg-slate-50 py-8 md:py-12">
      <div className="container mx-auto px-4">
        <PublicSectionHeading title={title} />

        <div className="grid gap-6 xl:grid-cols-[220px_minmax(0,1fr)_280px]">
          <aside className="space-y-3">
            <div className="rounded-xl border border-slate-300 bg-white p-3 shadow-card">
              <h2 className="border-b border-slate-200 pb-3 text-sm font-extrabold uppercase tracking-[0.2em] text-navy-950">
                Bulletin
              </h2>
              <div className="mt-3 space-y-2">
                {bulletinTabs.map((tab) => {
                  const isActive = tab.key === activeTab;

                  return (
                    <Link
                      key={tab.key}
                      to={tab.path}
                      className={[
                        'block rounded-lg border px-4 py-3 text-sm font-bold uppercase transition-colors',
                        isActive
                          ? 'border-amber-400 bg-amber-400 text-slate-950'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white',
                      ].join(' ')}
                    >
                      {tab.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </aside>

          <div className="space-y-4">
            {isLoading && <p className="text-sm text-slate-600">{loadingText}</p>}

            {!isLoading && error && (
              <Card className="border border-red-200 bg-red-50 shadow-card">
                <CardContent className="flex items-center justify-between gap-4 p-4">
                  <p className="text-sm font-medium text-red-700">{error}</p>
                  <Button type="button" variant="outline" onClick={loadPageData}>
                    Tải lại
                  </Button>
                </CardContent>
              </Card>
            )}

            {!isLoading && !error && items.length === 0 && (
              <Card className="border border-slate-300 bg-white shadow-card">
                <CardContent className="p-5 text-sm text-slate-700">{emptyText}</CardContent>
              </Card>
            )}

            {!isLoading && !error && items.length > 0 && (
              <div className="space-y-4">
                {items.map((item) => (
                  <article
                    key={item.id}
                    className="grid gap-4 rounded-xl border border-slate-300 bg-white p-4 shadow-card md:grid-cols-[260px_minmax(0,1fr)] md:p-5"
                  >
                    <Link
                      to={`${detailBasePath}/${item.slug}.html`}
                      className="block overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
                    >
                      <div className="aspect-[4/3] overflow-hidden">
                        <img
                          src={item.imageUrl || topProductImg}
                          alt={item.title}
                          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                    </Link>

                    <div>
                      <h2 className="text-xl font-extrabold uppercase leading-tight text-navy-950">
                        <Link to={`${detailBasePath}/${item.slug}.html`} className="hover:text-primary-700">
                          {item.title}
                        </Link>
                      </h2>

                      {formatDate(item.publishedAt) && (
                        <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Ngày đăng: {formatDate(item.publishedAt)}
                        </p>
                      )}

                      <p className="mt-4 line-clamp-4 text-base leading-relaxed text-slate-700">
                        {item.excerpt || item.content || 'Đang cập nhật nội dung...'}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <aside className="space-y-3">
            <div className="rounded-xl border border-slate-300 bg-white p-3 shadow-card">
              <h2 className="border-b border-slate-200 pb-3 text-sm font-extrabold uppercase tracking-[0.2em] text-navy-950">
                Sản phẩm phù hợp
              </h2>
              <div className="mt-3 space-y-2">
                {productMenu.length === 0 ? (
                  <p className="rounded-lg bg-slate-50 px-3 py-4 text-sm text-slate-600">Đang cập nhật danh mục sản phẩm.</p>
                ) : (
                  productMenu.map((item) => (
                    <Link
                      key={item.key}
                      to={item.path}
                      className="block rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-primary-300 hover:bg-white hover:text-primary-700"
                    >
                      {item.label}
                    </Link>
                  ))
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
