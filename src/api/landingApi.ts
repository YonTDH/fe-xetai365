import { buildApiUrl } from './http';

export type LandingProduct = {
  id: number;
  slug: string;
  title: string;
  brand: string;
  shortDescription: string;
  imageUrl: string;
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

export type CategoryNode = {
  id: number;
  slug: string;
  name: string;
  children: CategoryNode[];
};

function toSafeString(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function toSafeNumber(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
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
  return {
    id: toSafeNumber(item.id),
    slug: toSafeString(item.slug),
    name: toSafeString(item.name),
    children: rawChildren.map((child) => mapCategoryNode(child as Record<string, unknown>)),
  };
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

  return (data.data || []).map(mapCategoryNode);
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
