import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import topProductImg from '@/assets/lading-page/top-product.png';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getProductDetail, getPublicSiteSetting, type ProductDetail, type ProductImage, type PublicSiteSetting } from '@/api/landingApi';
import { formatPhoneDisplay } from '@/lib/formatPhone';
import { sanitizeHtml } from '@/lib/sanitizeHtml';

function normalizeIdOrSlug(value: string) {
  return value.replace(/\.html$/i, '').trim();
}

function hasHtmlContent(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

function resolveImageUrl(image: ProductImage) {
  if (typeof image === 'string') return image.trim();
  return (image.url || image.src || '').trim();
}

function getStatusLabel(status: string) {
  const normalized = status.trim().toLowerCase();
  if (normalized === 'available') return 'Còn hàng';
  if (normalized === 'sold') return 'Đã bán';
  if (normalized === 'coming_soon') return 'Sắp về';
  return status || 'Đang cập nhật';
}

export function ProductDetailPage() {
  const { idOrSlug = '' } = useParams();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [siteSetting, setSiteSetting] = useState<PublicSiteSetting | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeImage, setActiveImage] = useState('');

  const normalizedIdOrSlug = useMemo(() => normalizeIdOrSlug(idOrSlug), [idOrSlug]);
  const galleryImages = useMemo(() => {
    const urls = (product?.images || []).map(resolveImageUrl).filter(Boolean);
    const primaryImage = product?.imageUrl || '';
    return Array.from(new Set([primaryImage, ...urls].filter(Boolean)));
  }, [product?.imageUrl, product?.images]);
  const displayImage = activeImage || galleryImages[0] || topProductImg;
  const sanitizedContent = useMemo(() => sanitizeHtml(product?.content || ''), [product?.content]);
  const contentHasHtml = useMemo(() => hasHtmlContent(product?.content || ''), [product?.content]);
  const contactPhone = useMemo(() => siteSetting?.hotline || siteSetting?.dienthoai || '', [siteSetting]);
  const contactHref = useMemo(() => (contactPhone ? `tel:${contactPhone.replace(/[^\d+]/g, '')}` : ''), [contactPhone]);

  const specs = useMemo(() => {
    if (!product) return [];
    const categoryLabel = product.categoryName || product.categorySlug;
    return [
      ['Mã sản phẩm', product.sku || product.msp],
      ['Danh mục', categoryLabel],
      ['Thương hiệu', product.brand],
      ['Loại xe', product.type],
      ['Tình trạng', product.condition],
      ['Năm sản xuất', product.year > 0 ? String(product.year) : ''],
      ['Số km', product.mileageKm > 0 ? `${product.mileageKm.toLocaleString('vi-VN')} km` : ''],
      ['Nhiên liệu', product.fuelType],
      ['Hộp số', product.transmission],
      ['Khu vực', product.location],
    ].filter(([, value]) => value);
  }, [product]);

  const loadDetail = useCallback(async () => {
    if (!normalizedIdOrSlug) {
      setError('Đường dẫn sản phẩm không hợp lệ.');
      setProduct(null);
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      const data = await getProductDetail(normalizedIdOrSlug);
      setProduct(data);
      setActiveImage(data.imageUrl || '');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải chi tiết sản phẩm.';
      setError(message);
      setProduct(null);
    } finally {
      setIsLoading(false);
    }
  }, [normalizedIdOrSlug]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  useEffect(() => {
    let mounted = true;

    const loadSiteSetting = async () => {
      try {
        const data = await getPublicSiteSetting();
        if (mounted) {
          setSiteSetting(data);
        }
      } catch {
        if (mounted) {
          setSiteSetting(null);
        }
      }
    };

    void loadSiteSetting();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="bg-slate-50 py-8 md:py-12">
      <div className="container mx-auto px-4">
        {isLoading && <p className="text-sm text-slate-600">Đang tải chi tiết sản phẩm...</p>}

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

        {!isLoading && !error && product && (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-card md:p-4">
              <div className="aspect-square overflow-hidden rounded-lg bg-slate-100">
                <img src={displayImage} alt={product.title} className="h-full w-full object-cover" loading="lazy" />
              </div>

              {galleryImages.length > 1 && (
                <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
                  {galleryImages.map((image) => (
                    <button
                      key={image}
                      type="button"
                      onClick={() => setActiveImage(image)}
                      className="aspect-square overflow-hidden rounded-md border border-slate-200 bg-slate-100 focus-visible:ring-2 focus-visible:ring-primary-400"
                    >
                      <img src={image} alt={product.title} className="h-full w-full object-cover" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-card md:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-[#FFD600] text-black hover:bg-[#FFD600]">{getStatusLabel(product.status)}</Badge>
                {(product.categoryName || product.categorySlug) && (
                  <Badge variant="outline">{product.categoryName || product.categorySlug}</Badge>
                )}
              </div>

              <h1 className="mt-4 text-2xl font-bold leading-tight text-navy-950 md:text-3xl">{product.title}</h1>
              {product.shortDescription && <p className="mt-4 text-base leading-relaxed text-slate-700">{product.shortDescription}</p>}

              {specs.length > 0 && (
                <dl className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {specs.map(([label, value]) => (
                    <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt>
                      <dd className="mt-1 text-sm font-semibold text-slate-900">{value}</dd>
                    </div>
                  ))}
                </dl>
              )}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="bg-[#FFD600] text-black hover:bg-[#e6c200]">
                  <Link to="/lien-he">Liên hệ tư vấn</Link>
                </Button>
                {contactHref ? (
                  <Button asChild variant="outline" size="lg">
                    <a href={contactHref}>Gọi {formatPhoneDisplay(contactPhone)}</a>
                  </Button>
                ) : null}
              </div>
            </article>

            <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-card lg:col-span-2 md:p-6">
              <h2 className="text-xl font-bold text-navy-950">Thông tin chi tiết</h2>
              {product.content ? (
                contentHasHtml ? (
                  <div
                    className="rich-content prose prose-slate mt-4 max-w-none text-sm leading-relaxed md:text-base [&_img]:mx-auto [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-md"
                    dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                  />
                ) : (
                  <div className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-700 md:text-base">{product.content}</div>
                )
              ) : (
                <p className="mt-4 text-sm leading-relaxed text-slate-700 md:text-base">Đang cập nhật nội dung chi tiết.</p>
              )}
            </article>
          </div>
        )}
      </div>
    </section>
  );
}
