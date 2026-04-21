import { buildApiUrl } from './http';

export type BulletinItem = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  publishedAt: string | null;
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
    }>;
  };
  message?: string;
};

async function listBulletinsByType(type: 'promotion' | 'news_event', limit = 12): Promise<BulletinItem[]> {
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
  }));
}

export function listPromotions(limit = 12): Promise<BulletinItem[]> {
  return listBulletinsByType('promotion', limit);
}

export function listNewsEvents(limit = 12): Promise<BulletinItem[]> {
  return listBulletinsByType('news_event', limit);
}
