import type { NavItem } from './types';
import { Home, Info, Truck, FileText, Gift, Phone } from 'lucide-react';

export const mainNavItems: NavItem[] = [
  {
    key: 'trang-chu',
    label: 'TRANG CHỦ',
    path: '/',
    icon: <Home size={18} />,
  },
  {
    key: 'gioi-thieu',
    label: 'GIỚI THIỆU',
    path: '/gioi-thieu',
    icon: <Info size={18} />,
  },
  {
    key: 'san-pham',
    label: 'SẢN PHẨM',
    icon: <Truck size={18} />,
    children: [],
  },
  {
    key: 'tin-tuc-su-kien',
    label: 'TIN TỨC - SỰ KIỆN',
    path: '/tin-tuc',
    icon: <FileText size={18} />,
  },
  {
    key: 'khuyen-mai',
    label: 'KHUYẾN MÃI',
    path: '/khuyen-mai',
    icon: <Gift size={18} />,
    badge: 'Mới',
  },
  {
    key: 'lien-he',
    label: 'LIÊN HỆ',
    path: '/lien-he',
    icon: <Phone size={18} />,
  },
];
