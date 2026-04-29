import { buildApiUrl } from '@/api/http';

const ADMIN_TOKEN_KEY = 'xetai365_admin_token';

export type AdminUser = {
  id: number;
  username: string;
  fullName: string;
  status: string;
};

export type AdminBulletinType = 'news_event' | 'promotion' | 'recruitment' | 'services';
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

export type AdminBulletinDocxImportResult = {
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  plainText: string;
  warnings: string[];
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

export type AdminProduct = {
  id: number;
  slug: string;
  title: string;
  productCode: string;
  shortDescription: string;
  content: string;
  brand: string;
  status: string;
  priceVnd: string;
  location: string;
  imageUrl: string;
  images: Array<string | { url?: string; src?: string; alt?: string }>;
  isFeatured: boolean;
  isVisible: boolean;
  sortOrder: number;
  categoryLevel2Id: number;
  categoryLevel2Name: string;
  categoryLevel2Slug: string;
  categoryLevel1Id: number;
  categoryLevel1Name: string;
  categoryLevel1Slug: string;
  vehicleType: string;
  condition: string;
  year: number;
  mileageKm: number;
  fuelType: string;
  transmission: string;
  titleSeo: string;
  keywords: string;
  metaDescription: string;
  createdAt: string | null;
  updatedAt: string | null;
};

export type AdminProductPayload = {
  categoryLevel2Id: number;
  productCode: string;
  slug: string;
  title: string;
  shortDescription: string;
  content: string;
  brand: string;
  status: string;
  priceVnd: string;
  location: string;
  imageUrl: string;
  isFeatured: boolean;
  isVisible: boolean;
  sortOrder: number;
  titleSeo: string;
  keywords: string;
  metaDescription: string;
};

export type AdminSiteSetting = {
  id: number;
  title: string;
  keywords: string;
  description: string;
  giupdochiase: number;
  ten: string;
  email: string;
  website: string;
  dienthoai: string;
  diachi: string;
  fax: string;
  tennv: string;
  hotline: string;
  tennv1: string;
  hotline1: string;
  tennv2: string;
  hotline2: string;
  toado: string;
  facebook: string;
  youtube: string;
  zalo: string;
  skype: string;
  twitter: string;
  zing: string;
  google: string;
  tip: string;
  linktip: string;
  analytics: string;
  dangky: string;
  tietkiem: string;
  hailong: string;
  updatedAt: string | null;
};

export type AdminSiteSettingPayload = Omit<AdminSiteSetting, 'id' | 'updatedAt'>;

type AdminUploadFolder = 'products' | 'news' | 'promotions' | 'recruitment' | 'services' | 'pages';

type AdminUploadSignature = {
  cloudName: string;
  apiKey: string;
  uploadPreset: string;
  folder: string;
  timestamp: number;
  signature: string;
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

function mapAdminProduct(item: Record<string, unknown>): AdminProduct {
  return {
    id: toSafeNumber(item.id),
    slug: toSafeString(item.slug),
    title: toSafeString(item.title),
    productCode: toSafeString(item.productCode || item.product_code),
    shortDescription: toSafeString(item.shortDescription || item.short_description),
    content: toSafeString(item.content),
    brand: toSafeString(item.brand),
    status: toSafeString(item.status),
    priceVnd: toSafeString(item.priceVnd || item.price_vnd),
    location: toSafeString(item.location),
    imageUrl: toSafeString(item.imageUrl || item.image_url),
    images: Array.isArray(item.images) ? (item.images as Array<string | { url?: string; src?: string; alt?: string }>) : [],
    isFeatured: toSafeBoolean(item.isFeatured ?? item.is_featured, false),
    isVisible: toSafeBoolean(item.isVisible ?? item.is_visible, true),
    sortOrder: toSafeNumber(item.sortOrder || item.sort_order) || 1,
    categoryLevel2Id: toSafeNumber(item.categoryLevel2Id || item.category_level_2_id),
    categoryLevel2Name: toSafeString(item.categoryLevel2Name || item.category_level_2_name),
    categoryLevel2Slug: toSafeString(item.categoryLevel2Slug || item.category_level_2_slug),
    categoryLevel1Id: toSafeNumber(item.categoryLevel1Id || item.category_level_1_id),
    categoryLevel1Name: toSafeString(item.categoryLevel1Name || item.category_level_1_name),
    categoryLevel1Slug: toSafeString(item.categoryLevel1Slug || item.category_level_1_slug),
    vehicleType: toSafeString(item.vehicleType || item.vehicle_type),
    condition: toSafeString(item.condition),
    year: toSafeNumber(item.year),
    mileageKm: toSafeNumber(item.mileageKm || item.mileage_km),
    fuelType: toSafeString(item.fuelType || item.fuel_type),
    transmission: toSafeString(item.transmission),
    titleSeo: toSafeString(item.titleSeo || item.title_seo),
    keywords: toSafeString(item.keywords),
    metaDescription: toSafeString(item.metaDescription || item.meta_description),
    createdAt: toSafeString(item.createdAt || item.created_at) || null,
    updatedAt: toSafeString(item.updatedAt || item.updated_at) || null,
  };
}

function mapAdminSiteSetting(item: Record<string, unknown> | null | undefined): AdminSiteSetting {
  const source = item || {};

  return {
    id: toSafeNumber(source.id) || 1,
    title: toSafeString(source.title),
    keywords: toSafeString(source.keywords),
    description: toSafeString(source.description),
    giupdochiase: toSafeNumber(source.giupdochiase),
    ten: toSafeString(source.ten),
    email: toSafeString(source.email),
    website: toSafeString(source.website),
    dienthoai: toSafeString(source.dienthoai),
    diachi: toSafeString(source.diachi),
    fax: toSafeString(source.fax),
    tennv: toSafeString(source.tennv),
    hotline: toSafeString(source.hotline),
    tennv1: toSafeString(source.tennv1),
    hotline1: toSafeString(source.hotline1),
    tennv2: toSafeString(source.tennv2),
    hotline2: toSafeString(source.hotline2),
    toado: toSafeString(source.toado),
    facebook: toSafeString(source.facebook),
    youtube: toSafeString(source.youtube),
    zalo: toSafeString(source.zalo),
    skype: toSafeString(source.skype),
    twitter: toSafeString(source.twitter),
    zing: toSafeString(source.zing),
    google: toSafeString(source.google),
    tip: toSafeString(source.tip),
    linktip: toSafeString(source.linktip),
    analytics: toSafeString(source.analytics),
    dangky: toSafeString(source.dangky),
    tietkiem: toSafeString(source.tietkiem),
    hailong: toSafeString(source.hailong),
    updatedAt: toSafeString(source.updatedAt || source.updated_at) || null,
  };
}

async function adminFetch(path: string, init?: RequestInit) {
  const token = getAdminToken();
  const headers = new Headers(init?.headers || {});
  if (!(init?.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
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

export async function deleteAdminVehicleCategoryLevel1(id: number) {
  const data = (await adminFetch(`/api/admin/vehicle-categories/level-1/${id}`, {
    method: 'DELETE',
  })) as {
    id?: number;
    name?: string;
  };

  return {
    id: toSafeNumber(data.id),
    name: toSafeString(data.name),
  };
}

export async function updateAdminVehicleCategoryLevel2(
  id: number,
  payload: Pick<AdminVehicleCategory, 'parentId' | 'name' | 'slug' | 'isVisible' | 'description' | 'sortOrder'>
) {
  const data = (await adminFetch(`/api/admin/vehicle-categories/level-2/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })) as Record<string, unknown>;

  return mapAdminVehicleCategory(data);
}

export async function deleteAdminVehicleCategoryLevel2(id: number) {
  const data = (await adminFetch(`/api/admin/vehicle-categories/level-2/${id}`, {
    method: 'DELETE',
  })) as {
    id?: number;
    name?: string;
  };

  return {
    id: toSafeNumber(data.id),
    name: toSafeString(data.name),
  };
}

export async function listAdminProducts(filters?: {
  keyword?: string;
  status?: string;
  visibility?: string;
  categoryLevel2Id?: number;
}) {
  const query = new URLSearchParams();
  if (filters?.keyword) query.set('keyword', filters.keyword);
  if (filters?.status) query.set('status', filters.status);
  if (filters?.visibility) query.set('visibility', filters.visibility);
  if (filters?.categoryLevel2Id) query.set('categoryLevel2Id', String(filters.categoryLevel2Id));

  const queryString = query.toString();
  const data = (await adminFetch(`/api/admin/products${queryString ? `?${queryString}` : ''}`, {
    method: 'GET',
  })) as {
    items?: Record<string, unknown>[];
  };

  return (data.items || []).map(mapAdminProduct);
}

export async function createAdminProduct(payload: AdminProductPayload) {
  const data = (await adminFetch('/api/admin/products', {
    method: 'POST',
    body: JSON.stringify(payload),
  })) as Record<string, unknown>;

  return mapAdminProduct(data);
}

export async function updateAdminProduct(id: number, payload: AdminProductPayload) {
  const data = (await adminFetch(`/api/admin/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })) as Record<string, unknown>;

  return mapAdminProduct(data);
}

export async function deleteAdminProduct(id: number) {
  const data = (await adminFetch(`/api/admin/products/${id}`, {
    method: 'DELETE',
  })) as {
    id?: number;
    title?: string;
  };

  return {
    id: toSafeNumber(data.id),
    title: toSafeString(data.title),
  };
}

export async function getAdminSiteSetting() {
  const data = (await adminFetch('/api/settings', {
    method: 'GET',
  })) as Record<string, unknown> | null;

  return mapAdminSiteSetting(data);
}

export async function updateAdminSiteSetting(payload: AdminSiteSettingPayload) {
  const data = (await adminFetch('/api/settings', {
    method: 'PUT',
    body: JSON.stringify(payload),
  })) as Record<string, unknown>;

  return mapAdminSiteSetting(data);
}

async function getAdminUploadSignature(folder: AdminUploadFolder) {
  const data = (await adminFetch('/api/admin/uploads/signature', {
    method: 'POST',
    body: JSON.stringify({ folder }),
  })) as Record<string, unknown>;

  return {
    cloudName: toSafeString(data.cloudName),
    apiKey: toSafeString(data.apiKey),
    uploadPreset: toSafeString(data.uploadPreset),
    folder: toSafeString(data.folder),
    timestamp: toSafeNumber(data.timestamp),
    signature: toSafeString(data.signature),
  } satisfies AdminUploadSignature;
}

export async function uploadAdminImage(file: File, folder: AdminUploadFolder) {
  const signature = await getAdminUploadSignature(folder);
  if (!signature.cloudName || !signature.apiKey || !signature.signature || !signature.timestamp || !signature.uploadPreset) {
    throw new Error('Missing Cloudinary upload signature.');
  }

  const formData = new FormData();
  formData.set('file', file);
  formData.set('api_key', signature.apiKey);
  formData.set('timestamp', String(signature.timestamp));
  formData.set('signature', signature.signature);
  formData.set('upload_preset', signature.uploadPreset);
  formData.set('folder', signature.folder);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  const data = (await response.json().catch(() => ({}))) as {
    secure_url?: string;
    url?: string;
    public_id?: string;
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(data.error?.message || 'Cloudinary upload failed.');
  }

  const imageUrl = toSafeString(data.secure_url || data.url);
  if (!imageUrl) {
    throw new Error('Cloudinary upload returned empty URL.');
  }

  return {
    imageUrl,
    publicId: toSafeString(data.public_id),
  };
}

export async function importAdminBulletinDocx(file: File, type: AdminBulletinType) {
  const formData = new FormData();
  formData.set('file', file);
  formData.set('type', type);

  const data = (await adminFetch('/api/admin/bulletins/import-docx', {
    method: 'POST',
    body: formData,
  })) as Record<string, unknown>;

  return {
    title: toSafeString(data.title),
    excerpt: toSafeString(data.excerpt),
    content: toSafeString(data.content),
    imageUrl: toSafeString(data.imageUrl),
    plainText: toSafeString(data.plainText),
    warnings: Array.isArray(data.warnings) ? data.warnings.map((item) => toSafeString(item)).filter(Boolean) : [],
  } satisfies AdminBulletinDocxImportResult;
}

export async function importAdminProductDocx(file: File) {
  const formData = new FormData();
  formData.set('file', file);
  formData.set('type', 'products');

  const data = (await adminFetch('/api/admin/bulletins/import-docx', {
    method: 'POST',
    body: formData,
  })) as Record<string, unknown>;

  return {
    title: toSafeString(data.title),
    excerpt: toSafeString(data.excerpt),
    content: toSafeString(data.content),
    imageUrl: toSafeString(data.imageUrl),
    plainText: toSafeString(data.plainText),
    warnings: Array.isArray(data.warnings) ? data.warnings.map((item) => toSafeString(item)).filter(Boolean) : [],
  } satisfies AdminBulletinDocxImportResult;
}
