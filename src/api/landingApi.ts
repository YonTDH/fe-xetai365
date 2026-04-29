import { buildApiUrl } from './http';

export type LandingProduct = {
  id: number;
  slug: string;
  title: string;
  brand: string;
  shortDescription: string;
  imageUrl: string;
};

export type ProductImage = string | {
  url?: string;
  src?: string;
  alt?: string;
};

export type ProductDetail = LandingProduct & {
  sku: string;
  msp: string;
  categorySlug: string;
  categoryName: string;
  type: string;
  condition: string;
  year: number;
  mileageKm: number;
  fuelType: string;
  transmission: string;
  priceVnd: string;
  status: string;
  location: string;
  content: string;
  images: ProductImage[];
  titleSeo: string;
  keywords: string;
  metaDescription: string;
};

export type LandingNewsItem = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  imageUrl: string;
};

export type LandingHero = {
  title: string;
  description: string;
  hotline: string;
};

export type LandingHomeData = {
  hero: LandingHero;
  featuredProducts: LandingProduct[];
  latestNews: LandingNewsItem[];
};

export type PublicSiteSetting = {
  title: string;
  email: string;
  website: string;
  dienthoai: string;
  diachi: string;
  hotline: string;
  hotline1: string;
  hotline2: string;
  facebook: string;
  youtube: string;
  zalo: string;
  skype: string;
};

export type CategoryNode = {
  id: number;
  slug: string;
  name: string;
  isVisible: boolean;
  children: CategoryNode[];
};

export function getCategoryDisplayName(slug: string, rawName = '') {
  return rawName.trim() || slug;
}

export function isSummaryCategorySlug(slug: string) {
  return slug.trim().toLowerCase().startsWith('tong-hop-');
}

function toSafeString(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function toSafeNumber(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function toSafeBoolean(value: unknown, fallback = false) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return value !== 0;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'on'].includes(normalized)) {
      return true;
    }
    if (['false', '0', 'no', 'off'].includes(normalized)) {
      return false;
    }
  }

  return fallback;
}

function mapPublicSiteSetting(item: Record<string, unknown> | null | undefined): PublicSiteSetting {
  const source = item || {};

  return {
    title: toSafeString(source.title),
    email: toSafeString(source.email),
    website: toSafeString(source.website),
    dienthoai: toSafeString(source.dienthoai),
    diachi: toSafeString(source.diachi),
    hotline: toSafeString(source.hotline),
    hotline1: toSafeString(source.hotline1),
    hotline2: toSafeString(source.hotline2),
    facebook: toSafeString(source.facebook),
    youtube: toSafeString(source.youtube),
    zalo: toSafeString(source.zalo),
    skype: toSafeString(source.skype),
  };
}

function mapProduct(item: Record<string, unknown>): LandingProduct {
  return {
    id: toSafeNumber(item.id),
    slug: toSafeString(item.slug),
    title: toSafeString(item.title),
    brand: toSafeString(item.brand),
    shortDescription: toSafeString(item.shortDescription || item.short_description),
    imageUrl: toSafeString(item.imageUrl || item.image_url),
  };
}

function mapProductDetail(item: Record<string, unknown>): ProductDetail {
  const baseProduct = mapProduct(item);
  const rawImages = Array.isArray(item.images) ? item.images : [];

  return {
    ...baseProduct,
    sku: toSafeString(item.sku),
    msp: toSafeString(item.msp),
    categorySlug: toSafeString(item.categorySlug || item.category_slug),
    categoryName: toSafeString(item.categoryName || item.category_name),
    type: toSafeString(item.type),
    condition: toSafeString(item.condition),
    year: toSafeNumber(item.year),
    mileageKm: toSafeNumber(item.mileageKm || item.mileage_km),
    fuelType: toSafeString(item.fuelType || item.fuel_type),
    transmission: toSafeString(item.transmission),
    priceVnd: toSafeString(item.priceVnd || item.price_vnd),
    status: toSafeString(item.status),
    location: toSafeString(item.location),
    content: toSafeString(item.content),
    images: rawImages as ProductImage[],
    titleSeo: toSafeString(item.titleSeo || item.title_seo),
    keywords: toSafeString(item.keywords),
    metaDescription: toSafeString(item.metaDescription || item.meta_description),
  };
}

function mapNews(item: Record<string, unknown>): LandingNewsItem {
  return {
    id: toSafeNumber(item.id),
    slug: toSafeString(item.slug),
    title: toSafeString(item.title),
    excerpt: toSafeString(item.excerpt || item.descriptionShort || item.description_short),
    imageUrl: toSafeString(item.imageUrl || item.image_url),
  };
}

function mapCategoryNode(item: Record<string, unknown>): CategoryNode {
  const rawChildren = Array.isArray(item.children) ? item.children : [];
  const slug = toSafeString(item.slug);
  const rawName = toSafeString(item.name);
  const name = getCategoryDisplayName(slug, rawName);

  return {
    id: toSafeNumber(item.id),
    slug,
    name,
    isVisible: toSafeBoolean(item.isVisible ?? item.is_visible, true),
    children: rawChildren.map((child) => mapCategoryNode(child as Record<string, unknown>)),
  };
}

function removeSummaryNodes(nodes: CategoryNode[]): CategoryNode[] {
  return nodes
    .filter((node) => !isSummaryCategorySlug(node.slug))
    .map((node) => ({
      ...node,
      children: removeSummaryNodes(node.children),
    }));
}

export async function getLandingHomeData(): Promise<LandingHomeData> {
  const response = await fetch(buildApiUrl('/api/content/home'));
  const data = (await response.json().catch(() => ({}))) as {
    success?: boolean;
    data?: {
      hero?: Record<string, unknown>;
      featuredProducts?: Record<string, unknown>[];
      latestNews?: Record<string, unknown>[];
    };
    message?: string;
  };

  if (!response.ok || data.success === false || !data.data) {
    throw new Error(data.message || 'Khong the tai du lieu trang chu.');
  }

  const hero = data.data.hero || {};
  return {
    hero: {
      title: toSafeString(hero.title),
      description: toSafeString(hero.description),
      hotline: toSafeString(hero.hotline),
    },
    featuredProducts: (data.data.featuredProducts || []).map(mapProduct),
    latestNews: (data.data.latestNews || []).map(mapNews),
  };
}

export async function getPublicSiteSetting(): Promise<PublicSiteSetting> {
  const response = await fetch(buildApiUrl('/api/settings'));
  const data = (await response.json().catch(() => ({}))) as {
    success?: boolean;
    data?: Record<string, unknown> | null;
    message?: string;
  };

  if (!response.ok || data.success === false) {
    throw new Error(data.message || 'Khong the tai cai dat website.');
  }

  return mapPublicSiteSetting(data.data);
}

export async function listCatalogCategoriesTree(): Promise<CategoryNode[]> {
  const response = await fetch(buildApiUrl('/api/catalog/categories/tree'));
  const data = (await response.json().catch(() => ({}))) as {
    success?: boolean;
    data?: Record<string, unknown>[];
    message?: string;
  };

  if (!response.ok || data.success === false) {
    throw new Error(data.message || 'Khong the tai danh muc.');
  }

  return removeSummaryNodes((data.data || []).map(mapCategoryNode));
}

export async function listProductsByCategory(categorySlug: string, limit = 12): Promise<LandingProduct[]> {
  const query = new URLSearchParams({
    category: categorySlug,
    limit: String(limit),
    page: '1',
  });

  const response = await fetch(buildApiUrl(`/api/catalog/products?${query.toString()}`));
  const data = (await response.json().catch(() => ({}))) as {
    success?: boolean;
    data?: {
      items?: Record<string, unknown>[];
    };
    message?: string;
  };

  if (!response.ok || data.success === false) {
    throw new Error(data.message || 'Khong the tai san pham theo danh muc.');
  }

  return (data.data?.items || []).map(mapProduct);
}

export async function listProducts(limit = 30): Promise<LandingProduct[]> {
  const query = new URLSearchParams({
    limit: String(limit),
    page: '1',
  });

  const response = await fetch(buildApiUrl(`/api/catalog/products?${query.toString()}`));
  const data = (await response.json().catch(() => ({}))) as {
    success?: boolean;
    data?: {
      items?: Record<string, unknown>[];
    };
    message?: string;
  };

  if (!response.ok || data.success === false) {
    throw new Error(data.message || 'Khong the tai san pham.');
  }

  return (data.data?.items || []).map(mapProduct);
}

export async function getProductDetail(idOrSlug: string): Promise<ProductDetail> {
  const response = await fetch(buildApiUrl(`/api/catalog/products/${encodeURIComponent(idOrSlug)}`));
  const data = (await response.json().catch(() => ({}))) as {
    success?: boolean;
    data?: Record<string, unknown>;
    message?: string;
  };

  if (!response.ok || data.success === false || !data.data) {
    throw new Error(data.message || 'Khong the tai chi tiet san pham.');
  }

  return mapProductDetail(data.data);
}

