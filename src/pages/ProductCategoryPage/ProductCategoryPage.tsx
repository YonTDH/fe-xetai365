import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import topProductImg from '@/assets/lading-page/top-product.png';
import { PublicSectionHeading } from '@/components/PublicSectionHeading';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  listCatalogCategoriesTree,
  listProducts,
  listProductsByCategory,
  type CategoryNode,
  type LandingProduct,
} from '@/api/landingApi';

function resolveCategoryLabelBySlug(nodes: CategoryNode[], slug: string): string {
  for (const node of nodes) {
    if (node.slug === slug) {
      return node.name;
    }
    if (node.children.length > 0) {
      const fromChild = resolveCategoryLabelBySlug(node.children, slug);
      if (fromChild) {
        return fromChild;
      }
    }
  }
  return '';
}

export function ProductCategoryPage() {
  const { slug = '', parent = '', child = '' } = useParams();
  const [products, setProducts] = useState<LandingProduct[]>([]);
  const [categoryTree, setCategoryTree] = useState<CategoryNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedSlug = useMemo(() => (child || slug).trim(), [child, slug]);

  const categoryLabel = useMemo(() => {
    if (!selectedSlug) return 'Tất cả sản phẩm';
    return resolveCategoryLabelBySlug(categoryTree, selectedSlug) || selectedSlug;
  }, [categoryTree, selectedSlug]);

  const breadcrumbLabel = useMemo(() => {
    if (parent && child) {
      const parentLabel = resolveCategoryLabelBySlug(categoryTree, parent) || parent;
      const childLabel = resolveCategoryLabelBySlug(categoryTree, child) || child;
      return `${parentLabel} / ${childLabel}`;
    }
    if (slug) {
      return resolveCategoryLabelBySlug(categoryTree, slug) || slug;
    }
    return 'tat-ca';
  }, [categoryTree, parent, child, slug]);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const [tree, items] = await Promise.all([
        listCatalogCategoriesTree(),
        selectedSlug ? listProductsByCategory(selectedSlug, 30) : listProducts(30),
      ]);
      setCategoryTree(tree);
      setProducts(items);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải danh mục sản phẩm.';
      setError(message);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedSlug]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  return (
    <section className="bg-slate-50 py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="mb-3 text-xs uppercase tracking-wide text-slate-500">Sản phẩm / {breadcrumbLabel}</div>

        <PublicSectionHeading title={categoryLabel} />

        {isLoading && <p className="text-sm text-slate-600">Đang tải danh mục sản phẩm...</p>}

        {!isLoading && error && (
          <Card className="border border-red-200 bg-red-50 shadow-card">
            <CardContent className="flex items-center justify-between gap-4 p-4">
              <p className="text-sm font-medium text-red-700">{error}</p>
              <Button type="button" variant="outline" onClick={loadData}>
                Tải lại
              </Button>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && products.length === 0 && (
          <Card className="border border-slate-300 bg-white shadow-card">
            <CardContent className="p-5 text-sm text-slate-700">Hiện chưa có sản phẩm trong danh mục này.</CardContent>
          </Card>
        )}

        {!isLoading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Link
                key={product.id}
                to={`/san-pham/chi-tiet/${product.slug}`}
                className="overflow-hidden border border-slate-300 bg-white shadow-card transition-shadow hover:shadow-xl"
              >
                <div className="aspect-square overflow-hidden bg-slate-100">
                  <img
                    src={product.imageUrl || topProductImg}
                    alt={product.title}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="p-4">
                  <h2 className="line-clamp-2 text-base font-bold text-navy-950">{product.title}</h2>
                  {product.brand && <p className="mt-2 text-xs font-semibold uppercase text-slate-500">{product.brand}</p>}
                  {product.shortDescription && (
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-700">{product.shortDescription}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
