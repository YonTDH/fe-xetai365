import type { NavItem } from './types';
import { Home, Info, Truck, FileText, Gift, Phone, BriefcaseBusiness } from 'lucide-react';

export const mainNavItems: NavItem[] = [
  {
    key: 'trang-chu',
    label: 'TRANG CH\u1EE6',
    path: '/',
    icon: <Home size={18} />,
  },
  {
    key: 'gioi-thieu',
    label: 'GI\u1EDAI THI\u1EC6U',
    path: '/gioi-thieu',
    icon: <Info size={18} />,
  },
  {
    key: 'san-pham',
    label: 'S\u1EA2N PH\u1EA8M',
    icon: <Truck size={18} />,
    children: [],
  },
  {
    key: 'tin-tuc-su-kien',
    label: 'TIN T\u1EE8C - S\u1EF0 KI\u1EC6N',
    path: '/tin-tuc',
    icon: <FileText size={18} />,
  },
  {
    key: 'khuyen-mai',
    label: 'KHUY\u1EBEN M\u00C3I',
    path: '/khuyen-mai',
    icon: <Gift size={18} />,
    badge: 'M\u1EDBi',
  },
  {
    key: 'tuyen-dung',
    label: 'TUY\u1EC2N D\u1EE4NG',
    path: '/tuyen-dung',
    icon: <BriefcaseBusiness size={18} />,
    children: [],
  },
  {
    key: 'lien-he',
    label: 'LI\u00CAN H\u1EC6',
    path: '/lien-he',
    icon: <Phone size={18} />,
  },
];
