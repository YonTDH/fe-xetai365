import type { ReactNode } from 'react'

export interface NavItem {
  key: string
  label: string
  icon?: ReactNode
  path?: string          // nếu là link điều hướng
  onClick?: () => void   // nếu là action
  children?: NavItem[]   // tầng 2 (sub-menu)
  badge?: string | number
  disabled?: boolean
  hidden?: boolean
}

export interface NavMenuProps {
  layout?: 'sidebar' | 'topbar'   // default: sidebar
  collapsed?: boolean              // sidebar thu nhỏ icon-only
  onItemClick?: (item: NavItem) => void
  defaultOpenKeys?: string[]       // key các item cha mở sẵn
  activeKey?: string               // key item đang active (nếu không dùng router)
}
