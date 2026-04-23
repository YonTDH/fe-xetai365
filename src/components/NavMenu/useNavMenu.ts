import { useState, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import type { NavItem } from './types'

function hasMatchingPath(item: NavItem, pathname: string): boolean {
  if (item.path) {
    if (item.path === '/') {
      if (pathname === '/') return true
    } else if (pathname === item.path || pathname.startsWith(`${item.path}/`)) {
      return true
    }
  }

  if (!item.children || item.children.length === 0) {
    return false
  }

  return item.children.some((child) => hasMatchingPath(child, pathname))
}

function hasMatchingKey(item: NavItem, key: string): boolean {
  if (item.key === key) {
    return true
  }

  if (!item.children || item.children.length === 0) {
    return false
  }

  return item.children.some((child) => hasMatchingKey(child, key))
}

export function useNavMenu(defaultOpenKeys: string[] = [], externalActiveKey?: string) {
  const [openKeys, setOpenKeys] = useState<string[]>(defaultOpenKeys)
  const location = useLocation()

  const toggleOpen = useCallback((key: string) => {
    setOpenKeys((prev) => {
      if (prev.includes(key)) {
        return prev.filter((item) => item !== key)
      } else {
        return [...prev, key]
      }
    })
  }, [])

  const isItemActive = useCallback((item: NavItem): boolean => {
    if (externalActiveKey !== undefined) {
      return hasMatchingKey(item, externalActiveKey)
    }

    return hasMatchingPath(item, location.pathname)
  }, [externalActiveKey, location.pathname])

  return {
    openKeys,
    setOpenKeys,
    toggleOpen,
    isItemActive,
  }
}
