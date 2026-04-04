import type { NavItem } from './types';
import { 
  Home, 
  Info, 
  Truck, 
  Wrench, 
  Container, 
  FileText, 
  Gift, 
  Phone 
} from 'lucide-react';

export const mainNavItems: NavItem[] = [
  {
    key: "trang-chu",
    label: "TRANG CHỦ",
    path: "/",
    icon: <Home size={18} />
  },
  {
    key: "gioi-thieu",
    label: "GIỚI THIỆU",
    path: "/gioi-thieu",
    icon: <Info size={18} />
  },
  {
    key: "xe-dau-keo",
    label: "XE ĐẦU KÉO",
    path: "/xe-dau-keo",
    icon: <Truck size={18} />,
    children: [
      { key: "dau-keo-howo", label: "Đầu kéo Howo", path: "/xe-dau-keo/howo" },
      { key: "dau-keo-chenglong", label: "Đầu kéo Chenglong", path: "/xe-dau-keo/chenglong" }
    ]
  },
  {
    key: "xe-tai",
    label: "XE TẢI",
    path: "/xe-tai",
    icon: <Truck size={18} />,
    children: [
      { key: "xe-tai-nhe", label: "Xe tải nhẹ", path: "/xe-tai/nhe" },
      { key: "xe-tai-trung", label: "Xe tải trung", path: "/xe-tai/trung" },
      { key: "xe-tai-nang", label: "Xe tải nặng", path: "/xe-tai/nang" }
    ]
  },
  {
    key: "xe-chuyen-dung",
    label: "XE CHUYÊN DỤNG",
    path: "/xe-chuyen-dung",
    icon: <Wrench size={18} />,
    children: [
      { key: "xe-ben", label: "Xe ben", path: "/xe-chuyen-dung/xe-ben" },
      { key: "xe-tron-be-tong", label: "Xe trộn bê tông", path: "/xe-chuyen-dung/xe-tron-be-tong" },
      { key: "xe-cau", label: "Xe gắn cẩu", path: "/xe-chuyen-dung/xe-cau" }
    ]
  },
  {
    key: "somiromooc",
    label: "SƠMIROMOOC",
    path: "/somiromooc",
    icon: <Container size={18} />,
    children: [
      { key: "mooc-xuong", label: "Mooc xương", path: "/somiromooc/mooc-xuong" },
      { key: "mooc-san", label: "Mooc sàn", path: "/somiromooc/mooc-san" },
      { key: "mooc-ben", label: "Mooc ben", path: "/somiromooc/mooc-ben" }
    ]
  },
  {
    key: "tin-tuc-su-kien",
    label: "TIN TỨC - SỰ KIỆN",
    path: "/tin-tuc",
    icon: <FileText size={18} />
  },
  {
    key: "khuyen-mai",
    label: "KHUYẾN MÃI",
    path: "/khuyen-mai",
    icon: <Gift size={18} />,
    badge: "Mới"
  },
  {
    key: "lien-he",
    label: "LIÊN HỆ",
    path: "/lien-he",
    icon: <Phone size={18} />
  }
];
