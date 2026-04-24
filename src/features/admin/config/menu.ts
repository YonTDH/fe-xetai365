import type { LucideIcon } from 'lucide-react';
import {
  BadgeInfo,
  BriefcaseBusiness,
  Building2,
  Circle,
  FilePenLine,
  Gift,
  Images,
  LayoutDashboard,
  Package2,
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

export const adminMenuItems: AdminMenuItem[] = [
  {
    key: 'products',
    label: 'Quản lý sản phẩm',
    icon: LayoutDashboard,
    children: [
      { key: 'product-category-level-1', label: 'Danh mục cấp 1', icon: Circle, section: 'product-category-level-1' },
      { key: 'product-category-level-2', label: 'Danh mục cấp 2', icon: Circle, section: 'product-category-level-2' },
      { key: 'products-list', label: 'Sản phẩm', icon: Circle, section: 'products' },
    ],
  },
  { key: 'about-us', label: 'Về chúng tôi', icon: Circle, section: 'about-us' },
  { key: 'news', label: 'Quản lý tin tức', icon: Circle, section: 'news' },
  { key: 'recruitment', label: 'Quản lý tuyển dụng', icon: Circle, section: 'recruitment' },
  { key: 'company-intro', label: 'Giới thiệu về công ty', icon: Circle, section: 'company-intro' },
  { key: 'showroom', label: 'Showroom', icon: Circle, section: 'showroom' },
  { key: 'promotion', label: 'Quản lý khuyến mại', icon: Circle, section: 'promotion' },
  { key: 'services', label: 'Quản lý dịch vụ', icon: Circle, section: 'services' },
  {
    key: 'banners',
    label: 'Banner - Quảng cáo',
    icon: FilePenLine,
    children: [
      { key: 'favicon', label: 'Cập nhật favico', icon: Circle, section: 'favicon' },
      { key: 'ads', label: 'Cập nhật quảng cáo', icon: Circle, section: 'ads' },
      { key: 'videos', label: 'Quản lý video', icon: Circle, section: 'videos' },
      { key: 'slides', label: 'Slide ảnh', icon: Circle, section: 'slides' },
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
    icon: Building2,
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
    title: 'Quản lý khuyến mại',
    description: 'Tạo, sửa, ẩn/hiện bài viết khuyến mại.',
    icon: Gift,
  },
  services: {
    title: 'Quản lý dịch vụ',
    description: 'Khu vực này dành cho nội dung dịch vụ.',
    icon: Wrench,
  },
  favicon: {
    title: 'Cập nhật favico',
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
