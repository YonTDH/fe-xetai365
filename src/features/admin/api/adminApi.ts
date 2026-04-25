import { buildApiUrl } from '@/api/http';

const ADMIN_TOKEN_KEY = 'xetai365_admin_token';

export type AdminUser = {
  id: number;
  username: string;
  fullName: string;
  status: string;
};

export type AdminBulletinType = 'news_event' | 'promotion' | 'recruitment';
export type AdminBulletinStatus = 'draft' | 'published' | 'archived';

export type AdminBulletin = {
  id: number;
  slug: string;
  type: AdminBulletinType;
  bulletinType: AdminBulletinType;
  title: string;
  name: string;
  excerpt: string;
  descriptionShort: string;
  content: string;
  imageUrl: string;
  status: AdminBulletinStatus;
  sortOrder: number;
  isFeatured: boolean;
  isVisible: boolean;
  publishedAt: string | null;
  titleSeo: string;
  keywords: string;
  metaDescription: string;
};

export type AdminBulletinPayload = {
  title: string;
  slug: string;
  bulletinType: AdminBulletinType;
  status: AdminBulletinStatus;
  excerpt: string;
  descriptionShort: string;
  content: string;
  imageUrl: string;
  sortOrder: number;
  isFeatured: boolean;
  isVisible: boolean;
  publishedAt: string;
  titleSeo: string;
  keywords: string;
  metaDescription: string;
};

export type AdminVehicleCategory = {
  id: number;
  slug: string;
  name: string;
  description: string;
  parentId: number | null;
  parentSlug: string | null;
  sortOrder: number;
  isVisible: boolean;
  adminLevel: 1 | 2;
  children: AdminVehicleCategory[];
};

function getStorage() {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.localStorage;
}

export function getAdminToken() {
  return getStorage()?.getItem(ADMIN_TOKEN_KEY) || '';
}

export function setAdminToken(token: string) {
  getStorage()?.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken() {
  getStorage()?.removeItem(ADMIN_TOKEN_KEY);
}

function toSafeString(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function toSafeNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toSafeBoolean(value: unknown, fallback = false) {
  return typeof value === 'boolean' ? value : fallback;
}

function mapAdminBulletin(item: Record<string, unknown>): AdminBulletin {
  return {
    id: toSafeNumber(item.id),
    slug: toSafeString(item.slug),
    type: (toSafeString(item.type) || 'news_event') as AdminBulletinType,
    bulletinType: (toSafeString(item.bulletinType || item.bulletin_type) || 'news_event') as AdminBulletinType,
    title: toSafeString(item.title),
    name: toSafeString(item.name),
    excerpt: toSafeString(item.excerpt),
    descriptionShort: toSafeString(item.descriptionShort || item.description_short),
    content: toSafeString(item.content),
    imageUrl: toSafeString(item.imageUrl || item.image_url),
    status: (toSafeString(item.status) || 'draft') as AdminBulletinStatus,
    sortOrder: toSafeNumber(item.sortOrder || item.sort_order),
    isFeatured: toSafeBoolean(item.isFeatured || item.is_featured),
    isVisible: toSafeBoolean(item.isVisible ?? item.is_visible, true),
    publishedAt: toSafeString(item.publishedAt || item.published_at) || null,
    titleSeo: toSafeString(item.titleSeo || item.title_seo),
    keywords: toSafeString(item.keywords),
    metaDescription: toSafeString(item.metaDescription || item.meta_description),
  };
}

function mapAdminVehicleCategory(item: Record<string, unknown>): AdminVehicleCategory {
  const rawChildren = Array.isArray(item.children) ? item.children : [];
  const adminLevel = Number(item.adminLevel ?? item.admin_level);

  return {
    id: toSafeNumber(item.id),
    slug: toSafeString(item.slug),
    name: toSafeString(item.name),
    description: toSafeString(item.description),
    parentId: item.parentId == null && item.parent_id == null ? null : toSafeNumber(item.parentId ?? item.parent_id),
    parentSlug: toSafeString(item.parentSlug || item.parent_slug) || null,
    sortOrder: toSafeNumber(item.sortOrder || item.sort_order) || 1,
    isVisible: toSafeBoolean(item.isVisible ?? item.is_visible, true),
    adminLevel: adminLevel === 2 ? 2 : 1,
    children: rawChildren.map((child) => mapAdminVehicleCategory(child as Record<string, unknown>)),
  };
}

async function adminFetch(path: string, init?: RequestInit) {
  const token = getAdminToken();
  const headers = new Headers(init?.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(buildApiUrl(path), {
    ...init,
    headers,
  });

  const data = (await response.json().catch(() => ({}))) as {
    success?: boolean;
    data?: unknown;
    message?: string;
  };

  if (!response.ok || data.success === false) {
    throw new Error(data.message || 'Admin request failed.');
  }

  return data.data;
}

export async function adminLogin(username: string, password: string) {
  const data = (await adminFetch('/api/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })) as {
    accessToken?: string;
    user?: Record<string, unknown>;
  };

  const accessToken = toSafeString(data.accessToken);
  if (!accessToken) {
    throw new Error('Missing access token.');
  }

  setAdminToken(accessToken);

  return {
    accessToken,
    user: {
      id: toSafeNumber(data.user?.id),
      username: toSafeString(data.user?.username),
      fullName: toSafeString(data.user?.fullName || data.user?.full_name),
      status: toSafeString(data.user?.status),
    } satisfies AdminUser,
  };
}

export async function adminMe() {
  const data = (await adminFetch('/api/admin/auth/me', {
    method: 'GET',
  })) as Record<string, unknown>;

  return {
    id: toSafeNumber(data.id),
    username: toSafeString(data.username),
    fullName: toSafeString(data.fullName || data.full_name),
    status: toSafeString(data.status),
  } satisfies AdminUser;
}

export async function listAdminBulletins(type?: AdminBulletinType) {
  const query = new URLSearchParams({
    page: '1',
    limit: '50',
  });

  if (type) {
    query.set('type', type);
  }

  const data = (await adminFetch(`/api/admin/bulletins?${query.toString()}`, {
    method: 'GET',
  })) as {
    items?: Record<string, unknown>[];
  };

  return (data.items || []).map(mapAdminBulletin);
}

export async function getAdminBulletinDetail(id: number) {
  const data = (await adminFetch(`/api/admin/bulletins/${id}`, {
    method: 'GET',
  })) as Record<string, unknown>;

  return mapAdminBulletin(data);
}

export async function createAdminBulletin(payload: AdminBulletinPayload) {
  const data = (await adminFetch('/api/admin/bulletins', {
    method: 'POST',
    body: JSON.stringify(payload),
  })) as Record<string, unknown>;

  return mapAdminBulletin(data);
}

export async function updateAdminBulletin(id: number, payload: AdminBulletinPayload) {
  const data = (await adminFetch(`/api/admin/bulletins/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })) as Record<string, unknown>;

  return mapAdminBulletin(data);
}

export async function deleteAdminBulletin(id: number) {
  await adminFetch(`/api/admin/bulletins/${id}`, {
    method: 'DELETE',
  });
}

export async function listAdminVehicleCategoriesTree() {
  const data = (await adminFetch('/api/admin/vehicle-categories/tree', {
    method: 'GET',
  })) as Record<string, unknown>[];

  return (data || []).map(mapAdminVehicleCategory);
}

export async function updateAdminVehicleCategoryLevel1(
  id: number,
  payload: Pick<AdminVehicleCategory, 'name' | 'slug' | 'isVisible' | 'description' | 'sortOrder'>
) {
  const data = (await adminFetch(`/api/admin/vehicle-categories/level-1/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })) as Record<string, unknown>;

  return mapAdminVehicleCategory(data);
}
