import { useState, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import type { NavItem } from './types'

export function useNavMenu(defaultOpenKeys: string[] = [], externalActiveKey?: string) {
  const [openKeys, setOpenKeys] = useState<string[]>(defaultOpenKeys)
  const location = useLocation()

  const toggleOpen = useCallback((key: string) => {
    setOpenKeys((prev) => {
      // Accordion style: only 1 parent open at a time
      if (prev.includes(key)) {
        return []
      } else {
        return [key]
      }
    })
  }, [])

  const isItemActive = useCallback((item: NavItem): boolean => {
    if (externalActiveKey !== undefined) {
      if (item.key === externalActiveKey) return true
      if (item.children?.some(child => child.key === externalActiveKey)) return true
      return false
    }
    
    if (item.path) {
      if (item.path === '/') {
        return location.pathname === '/'
      }
      if (location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)) {
        return true
      }
    }
    
    if (item.children) {
      return item.children.some(child => {
        if (child.path) {
          if (child.path === '/') return location.pathname === '/'
          return location.pathname === child.path || location.pathname.startsWith(`${child.path}/`)
        }
        return false
      })
    }
    
    return false
  }, [externalActiveKey, location.pathname])

  return {
    openKeys,
    setOpenKeys,
    toggleOpen,
    isItemActive,
  }
}
