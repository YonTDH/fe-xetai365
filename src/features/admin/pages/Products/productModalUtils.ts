import type { AdminProduct } from '../../api/adminApi';
import type { FormState } from './productModalTypes';

export function translateProductStatus(status: string) {
  switch (status) {
    case 'available':
      return 'Đang bán';
    case 'sold':
      return 'Đã bán';
    case 'sold_out':
      return 'Hết hàng';
    case 'coming_soon':
      return 'Sắp về';
    case 'draft':
      return 'Bản nháp';
    case 'hidden':
      return 'Đã ẩn';
    default:
      return status;
  }
}

export function createFormState(item: AdminProduct | null, defaultCategoryLevel2Id: number): FormState {
  return {
    categoryLevel2Id: item?.categoryLevel2Id || defaultCategoryLevel2Id,
    productCode: item?.productCode ?? '',
    slug: item?.slug ?? '',
    title: item?.title ?? '',
    shortDescription: item?.shortDescription ?? '',
    content: item?.content ?? '',
    brand: item?.brand ?? '',
    status: item?.status ?? 'available',
    priceVnd: item?.priceVnd ?? '0',
    location: item?.location ?? '',
    imageUrl: item?.imageUrl ?? '',
    isFeatured: item?.isFeatured ?? false,
    isVisible: item?.isVisible ?? true,
    sortOrder: item?.sortOrder ?? 1,
    titleSeo: item?.titleSeo ?? '',
    keywords: item?.keywords ?? '',
    metaDescription: item?.metaDescription ?? '',
  };
}

export function hasHtml(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

export function slugifyVietnamese(value: string) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

export function escapeAttribute(value: string) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

