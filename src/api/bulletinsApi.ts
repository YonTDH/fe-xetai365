import { buildApiUrl } from './http';

export type BulletinItem = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  publishedAt: string | null;
  imageUrl: string;
};

type BulletinDetailResponse = {
  success?: boolean;
  data?: {
    id: number | string;
    slug?: string;
    title?: string;
    excerpt?: string;
    content?: string;
    publishedAt?: string | null;
    imageUrl?: string;
    image_url?: string;
    thumbnail?: string;
    thumbnailUrl?: string;
    coverImage?: string;
    cover_image?: string;
  };
  message?: string;
};

type ListBulletinsResponse = {
  success?: boolean;
  data?: {
    items?: Array<{
      id: number | string;
      slug?: string;
      title?: string;
      excerpt?: string;
      content?: string;
      publishedAt?: string | null;
      imageUrl?: string;
      image_url?: string;
      thumbnail?: string;
      thumbnailUrl?: string;
      coverImage?: string;
      cover_image?: string;
    }>;
  };
  message?: string;
};

function resolveImageUrl(item: {
  imageUrl?: string;
  image_url?: string;
  thumbnail?: string;
  thumbnailUrl?: string;
  coverImage?: string;
  cover_image?: string;
}) {
  return String(
    item.imageUrl || item.image_url || item.thumbnail || item.thumbnailUrl || item.coverImage || item.cover_image || '',
  );
}

async function listBulletinsByType(type: 'promotion' | 'news_event' | 'recruitment', limit = 12): Promise<BulletinItem[]> {
  const response = await fetch(buildApiUrl(`/api/content/bulletins?type=${type}&limit=${limit}`));
  const data = (await response.json().catch(() => ({}))) as ListBulletinsResponse;

  if (!response.ok || data.success === false) {
    throw new Error(data.message || 'Không thể tải danh sách bài viết.');
  }

  return (data.data?.items || []).map((item) => ({
    id: Number(item.id),
    slug: String(item.slug || ''),
    title: String(item.title || ''),
    excerpt: String(item.excerpt || ''),
    content: String(item.content || ''),
    publishedAt: item.publishedAt || null,
    imageUrl: resolveImageUrl(item),
  }));
}

export function listPromotions(limit = 12): Promise<BulletinItem[]> {
  return listBulletinsByType('promotion', limit);
}

export function listNewsEvents(limit = 12): Promise<BulletinItem[]> {
  return listBulletinsByType('news_event', limit);
}

export function listRecruitments(limit = 12): Promise<BulletinItem[]> {
  return listBulletinsByType('recruitment', limit);
}

export async function getBulletinDetail(idOrSlug: string): Promise<BulletinItem> {
  const response = await fetch(buildApiUrl(`/api/content/bulletins/${idOrSlug}`));
  const data = (await response.json().catch(() => ({}))) as BulletinDetailResponse;

  if (!response.ok || data.success === false || !data.data) {
    throw new Error(data.message || 'Không thể tải chi tiết bài viết.');
  }

  return {
    id: Number(data.data.id),
    slug: String(data.data.slug || ''),
    title: String(data.data.title || ''),
    excerpt: String(data.data.excerpt || ''),
    content: String(data.data.content || ''),
    publishedAt: data.data.publishedAt || null,
    imageUrl: resolveImageUrl(data.data),
  };
}
