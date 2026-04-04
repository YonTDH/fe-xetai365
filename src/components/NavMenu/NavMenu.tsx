import React, { useRef, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NavMenuProps, NavItem } from './types'
import { mainNavItems as items } from './navMenu.mock'
import { useNavMenu } from './useNavMenu'

export function NavMenu({
  layout = 'sidebar',
  collapsed = false,
  onItemClick,
  defaultOpenKeys = [],
  activeKey,
}: NavMenuProps) {
  const { openKeys, toggleOpen, isItemActive, setOpenKeys } = useNavMenu(defaultOpenKeys, activeKey)

  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && layout === 'topbar') {
        setOpenKeys([])
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [layout, setOpenKeys])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (layout === 'topbar' && menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenKeys([])
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [layout, setOpenKeys])

  const renderItem = (item: NavItem, level = 0) => {
    if (item.hidden) return null

    const hasChildren = !!item.children && item.children.length > 0
    const isOpen = openKeys.includes(item.key)
    const active = isItemActive(item)

    const handleItemClick = (e: React.MouseEvent | React.KeyboardEvent) => {
      if (item.disabled) {
        e.preventDefault()
        return
      }

      if (hasChildren) {
        e.preventDefault()
        if (layout === 'sidebar') {
          toggleOpen(item.key)
        }
      } else {
        if (onItemClick) {
          onItemClick(item)
        }
        if (item.onClick) {
          item.onClick()
        }
        if (layout === 'topbar') {
          setOpenKeys([])
        }
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleItemClick(e)
      }
    }

    const itemClasses = cn(
      "group flex items-center rounded-md transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary",
      "hover:bg-accent hover:text-accent-foreground cursor-pointer text-sm font-medium",
      layout === 'sidebar' ? 'w-full' : 'w-auto',
      layout === 'sidebar' 
        ? cn("px-3 py-2", level > 0 && !collapsed && "text-muted-foreground", level === 0 && "py-2.5") 
        : cn("px-3 py-2", level > 0 && "py-2 px-3 text-muted-foreground"),
      item.disabled && "opacity-50 cursor-not-allowed pointer-events-none",
      collapsed && layout === 'sidebar' && level === 0 ? "justify-center" : "",
      active && !hasChildren && "bg-primary/10 text-primary group-hover:bg-primary/15 group-hover:text-primary",
      active && hasChildren && layout === 'sidebar' && level === 0 ? "text-primary bg-primary/5" : ""
    )

    const titleValue = collapsed && level === 0 ? item.label : undefined
    const isLeafWithLink = item.path && !hasChildren && !item.disabled

    return (
      <div 
        key={item.key} 
        className={cn(
          "relative", 
          layout === 'topbar' && level === 0 ? "flex items-center" : "",
          layout === 'sidebar' && level > 0 ? "mt-1" : ""
        )}
        onMouseEnter={hasChildren && layout === 'topbar' ? () => setOpenKeys([item.key]) : undefined}
        onMouseLeave={hasChildren && layout === 'topbar' ? () => setOpenKeys([]) : undefined}
      >
        {isLeafWithLink ? (
          <NavLink
            to={item.path as string}
            end={item.path === '/'}
            className={itemClasses}
            onClick={handleItemClick as never}
            onKeyDown={handleKeyDown}
            title={titleValue}
            aria-current={active ? "page" : undefined}
          >
            <ItemContent item={item} hasChildren={hasChildren} active={active} collapsed={collapsed} layout={layout} level={level} isOpen={isOpen} />
          </NavLink>
        ) : (
          <div
            role={hasChildren ? "button" : "menuitem"}
            tabIndex={item.disabled ? -1 : 0}
            className={itemClasses}
            onClick={handleItemClick}
            onKeyDown={handleKeyDown}
            title={titleValue}
            aria-expanded={hasChildren ? isOpen : undefined}
          >
            <ItemContent item={item} hasChildren={hasChildren} active={active} collapsed={collapsed} layout={layout} level={level} isOpen={isOpen} />
          </div>
        )}

        {/* Sub-menu rendering */}
        {hasChildren && layout === 'sidebar' && !collapsed && (
          <div 
            className={cn(
              "grid transition-all duration-300 ease-in-out ml-4 pl-2 border-l border-border/50",
              isOpen ? "grid-rows-[1fr] opacity-100 mt-1 mb-1" : "grid-rows-[0fr] opacity-0"
            )}
          >
            <div className="overflow-hidden flex flex-col">
              {item.children!.map(child => renderItem(child, level + 1))}
            </div>
          </div>
        )}

        {hasChildren && layout === 'topbar' && level === 0 && (
          <div 
            className={cn(
              "absolute left-0 top-full mt-1 min-w-[200px] rounded-md bg-popover text-popover-foreground shadow-md border border-border z-50",
              "transition-all duration-200 origin-top",
              isOpen ? "opacity-100 scale-y-100 pointer-events-auto" : "opacity-0 scale-y-0 pointer-events-none"
            )}
          >
            <div className="p-1 flex flex-col gap-0.5">
               {item.children!.map(child => renderItem(child, level + 1))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <nav 
      role="navigation" 
      aria-label="Main Navigation"
      ref={menuRef}
      className={cn(
        'flex',
        layout === 'sidebar' ? 'flex-col gap-1 min-w-[60px]' : 'flex-row items-center gap-1.5',
        collapsed && layout === 'sidebar' ? 'w-[60px]' : 'w-full'
      )}
    >
       {items.map(item => renderItem(item, 0))}
    </nav>
  )
}

function ItemContent({ 
  item, hasChildren, active, collapsed, layout, level, isOpen 
}: { 
  item: NavItem, hasChildren: boolean, active: boolean, collapsed: boolean, layout: 'sidebar' | 'topbar', level: number, isOpen: boolean 
}) {
  const showTextAndIcons = !collapsed || layout !== 'sidebar' || level > 0

  return (
    <>
      {item.icon && (
        <span className={cn(
          "flex items-center justify-center shrink-0",
          showTextAndIcons && "mr-3",
          active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
        )}>
          {item.icon}
        </span>
      )}
      
      {showTextAndIcons && (
         <span className={cn(
           "flex-1 truncate text-left whitespace-nowrap",
         )}>{item.label}</span>
      )}

      {item.badge && showTextAndIcons && (
        <span className="ml-2 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold leading-none">
          {item.badge}
        </span>
      )}

      {hasChildren && showTextAndIcons && (
        <span className="ml-auto flex items-center justify-center shrink-0">
          <ChevronDown 
            className={cn(
              "w-4 h-4 transition-transform duration-200 text-muted-foreground/70",
              isOpen && "rotate-180"
            )} 
          />
        </span>
      )}
    </>
  )
}
