import type { LucideIcon } from 'lucide-react';
import {
  BadgeInfo,
  BriefcaseBusiness,
  Building2,
  FilePenLine,
  Gift,
  Images,
  Package2,
  PhoneCall,
  Store,
  Wrench,
} from 'lucide-react';

export type AdminSectionKey =
  | 'product-category-level-1'
  | 'product-category-level-2'
  | 'products'
  | 'about-us'
  | 'news'
  | 'recruitment'
  | 'company-intro'
  | 'showroom'
  | 'promotion'
  | 'services'
  | 'contact-requests'
  | 'favicon'
  | 'ads'
  | 'videos'
  | 'slides';

export type AdminMenuItem = {
  key: string;
  label: string;
  icon: LucideIcon;
  section?: AdminSectionKey;
  children?: Array<{
    key: string;
    label: string;
    icon: LucideIcon;
    section: AdminSectionKey;
  }>;
};

export const DEFAULT_ADMIN_SECTION: AdminSectionKey = 'about-us';

export const adminSectionSlugs: Record<AdminSectionKey, string> = {
  'product-category-level-1': 'danh-muc-cap-1',
  'product-category-level-2': 'danh-muc-cap-2',
  products: 'san-pham',
  'about-us': 've-chung-toi',
  news: 'tin-tuc',
  recruitment: 'tuyen-dung',
  'company-intro': 'gioi-thieu-cong-ty',
  showroom: 'showroom',
  promotion: 'khuyen-mai',
  services: 'dich-vu',
  'contact-requests': 'yeu-cau-lien-he',
  favicon: 'favicon',
  ads: 'quang-cao',
  videos: 'video',
  slides: 'slide-anh',
};

const adminSectionBySlug = Object.fromEntries(
  Object.entries(adminSectionSlugs).map(([section, slug]) => [slug, section as AdminSectionKey]),
) as Record<string, AdminSectionKey>;

export function getAdminSectionPath(section: AdminSectionKey) {
  return `/admin/${adminSectionSlugs[section]}`;
}

export function getAdminSectionFromSlug(slug?: string | null) {
  if (!slug) {
    return null;
  }

  return adminSectionBySlug[slug] ?? null;
}

export const adminMenuItems: AdminMenuItem[] = [
  {
    key: 'products',
    label: 'Quản lý sản phẩm',
    icon: Package2,
    children: [
      { key: 'product-category-level-1', label: 'Danh mục cấp 1', icon: Package2, section: 'product-category-level-1' },
      { key: 'product-category-level-2', label: 'Danh mục cấp 2', icon: Package2, section: 'product-category-level-2' },
      { key: 'products-list', label: 'Sản phẩm', icon: Package2, section: 'products' },
    ],
  },
  { key: 'about-us', label: 'Về chúng tôi', icon: BadgeInfo, section: 'about-us' },
  { key: 'news', label: 'Quản lý tin tức', icon: FilePenLine, section: 'news' },
  { key: 'recruitment', label: 'Quản lý tuyển dụng', icon: BriefcaseBusiness, section: 'recruitment' },
  { key: 'company-intro', label: 'Giới thiệu về công ty', icon: Building2, section: 'company-intro' },
  { key: 'showroom', label: 'Showroom', icon: Store, section: 'showroom' },
  { key: 'promotion', label: 'Quản lý khuyến mãi', icon: Gift, section: 'promotion' },
  { key: 'services', label: 'Quản lý dịch vụ', icon: Wrench, section: 'services' },
  { key: 'contact-requests', label: 'Yêu cầu liên hệ', icon: PhoneCall, section: 'contact-requests' },
  {
    key: 'banners',
    label: 'Banner - Quảng cáo',
    icon: Images,
    children: [
      { key: 'favicon', label: 'Cập nhật favicon', icon: Images, section: 'favicon' },
      { key: 'ads', label: 'Cập nhật quảng cáo', icon: Images, section: 'ads' },
      { key: 'videos', label: 'Quản lý video', icon: Images, section: 'videos' },
      { key: 'slides', label: 'Slide ảnh', icon: Images, section: 'slides' },
    ],
  },
];

export const adminSectionMeta: Record<
  AdminSectionKey,
  {
    title: string;
    description: string;
    icon: LucideIcon;
  }
> = {
  'product-category-level-1': {
    title: 'Danh mục cấp 1',
    description: 'Khu vực này dành cho quản lý nhóm danh mục sản phẩm cấp cao.',
    icon: Package2,
  },
  'product-category-level-2': {
    title: 'Danh mục cấp 2',
    description: 'Khu vực này dành cho quản lý danh mục con của sản phẩm.',
    icon: Package2,
  },
  products: {
    title: 'Sản phẩm',
    description: 'Khu vực này dành cho CRUD sản phẩm và media sản phẩm.',
    icon: Package2,
  },
  'about-us': {
    title: 'Về chúng tôi',
    description: 'Khu vực này dành cho nội dung giới thiệu tổng quan.',
    icon: BadgeInfo,
  },
  news: {
    title: 'Quản lý tin tức',
    description: 'Tạo, sửa, ẩn/hiện bài viết loại tin tức - sự kiện.',
    icon: FilePenLine,
  },
  recruitment: {
    title: 'Quản lý tuyển dụng',
    description: 'Tạo, sửa, ẩn/hiện bài viết tuyển dụng.',
    icon: BriefcaseBusiness,
  },
  'company-intro': {
    title: 'Giới thiệu về công ty',
    description: 'Khu vực này dành cho nội dung trang giới thiệu công ty.',
    icon: Building2,
  },
  showroom: {
    title: 'Showroom',
    description: 'Khu vực này dành cho nội dung showroom và hình ảnh liên quan.',
    icon: Store,
  },
  promotion: {
    title: 'Quản lý khuyến mãi',
    description: 'Tạo, sửa, ẩn/hiện bài viết khuyến mãi.',
    icon: Gift,
  },
  services: {
    title: 'Quản lý dịch vụ',
    description: 'Khu vực này dành cho nội dung dịch vụ.',
    icon: Wrench,
  },
  'contact-requests': {
    title: 'Yêu cầu liên hệ',
    description: 'Theo dõi và cập nhật trạng thái các yêu cầu liên hệ từ website.',
    icon: PhoneCall,
  },
  favicon: {
    title: 'Cập nhật favicon',
    description: 'Khu vực này dành cho cấu hình favicon và icon site.',
    icon: Images,
  },
  ads: {
    title: 'Cập nhật quảng cáo',
    description: 'Khu vực này dành cho quản lý banner quảng cáo.',
    icon: Images,
  },
  videos: {
    title: 'Quản lý video',
    description: 'Khu vực này dành cho danh sách video hiển thị trên site.',
    icon: Images,
  },
  slides: {
    title: 'Slide ảnh',
    description: 'Khu vực này dành cho banner/slider hình ảnh.',
    icon: Images,
  },
};
