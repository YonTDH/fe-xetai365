import React, { useRef, useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NavMenuProps, NavItem } from './types';
import { mainNavItems } from './navMenu.mock';
import { useNavMenu } from './useNavMenu';
import { getCategoryDisplayName, listCatalogCategoriesTree, type CategoryNode } from '@/api/landingApi';
import { listRecruitments, type BulletinItem } from '@/api/bulletinsApi';

function mapCategoryTreeToNavItems(nodes: CategoryNode[]): NavItem[] {
  const getCategoryPath = (slug: string, parentSlug?: string) =>
    parentSlug ? `/san-pham/${parentSlug}/${slug}` : `/san-pham/${slug}`;

  const mapNode = (node: CategoryNode, parentSlug?: string): NavItem => {
    const children = node.children
      .filter((child) => child.id > 0 && child.slug)
      .map((child) => mapNode(child, node.slug));
    const categoryPath = getCategoryPath(node.slug, parentSlug);

    return {
      key: `san-pham-${node.slug}`,
      label: getCategoryDisplayName(node.slug, node.name),
      path: children.length === 0 ? categoryPath : undefined,
      children: children.length > 0
        ? [
            {
              key: `san-pham-${node.slug}-tat-ca`,
              label: 'Tất cả',
              path: categoryPath,
            },
            ...children,
          ]
        : undefined,
    };
  };

  return nodes
    .filter((node) => node.id > 0 && node.slug)
    .map((node) => mapNode(node));
}

export function NavMenu({
  layout = 'sidebar',
  collapsed = false,
  onItemClick,
  defaultOpenKeys = [],
  activeKey,
}: NavMenuProps) {
  const { openKeys, toggleOpen, isItemActive, setOpenKeys } = useNavMenu(defaultOpenKeys, activeKey);
  const [productCategories, setProductCategories] = useState<CategoryNode[]>([]);
  const [recruitmentBulletins, setRecruitmentBulletins] = useState<BulletinItem[]>([]);

  const menuRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      try {
        const categoryTree = await listCatalogCategoriesTree();
        if (!isMounted) return;
        setProductCategories(categoryTree.filter((item) => item.id > 0 && item.slug));
      } catch {
        if (!isMounted) return;
        setProductCategories([]);
      }
    };

    void loadCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadRecruitments = async () => {
      try {
        const items = await listRecruitments(8);
        if (!isMounted) return;
        setRecruitmentBulletins(items);
      } catch {
        if (!isMounted) return;
        setRecruitmentBulletins([]);
      }
    };

    void loadRecruitments();
    return () => {
      isMounted = false;
    };
  }, []);

  const items = useMemo(() => {
    const productChildren = mapCategoryTreeToNavItems(productCategories);
    const recruitmentChildren: NavItem[] = recruitmentBulletins
      .filter((item) => item.id > 0 && item.slug)
      .map((item) => ({
        key: `tuyen-dung-${item.id}`,
        label: item.title,
        path: `/tuyen-dung/${item.slug}.html`,
      }));

    return mainNavItems.map((item) => {
      if (item.key === 'san-pham') {
        return {
          ...item,
          disabled: productChildren.length === 0,
          children: [
            {
              key: 'san-pham-tat-ca',
              label: 'Tất cả',
              path: '/san-pham',
            },
            ...productChildren,
          ],
        };
      }

      if (item.key === 'tuyen-dung') {
        return {
          ...item,
          children: recruitmentChildren.length > 0 ? recruitmentChildren : undefined,
        };
      }

      return item;
    });
  }, [productCategories, recruitmentBulletins]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && layout === 'topbar') {
        clearCloseTimer();
        setOpenKeys([]);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [layout, setOpenKeys]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (layout === 'topbar' && menuRef.current && !menuRef.current.contains(e.target as Node)) {
        clearCloseTimer();
        setOpenKeys([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [layout, setOpenKeys]);

  useEffect(() => {
    return () => {
      clearCloseTimer();
    };
  }, []);

  const renderItem = (item: NavItem, level = 0) => {
    if (item.hidden) return null;

    const hasChildren = !!item.children && item.children.length > 0;
    const isOpen = openKeys.includes(item.key);
    const active = isItemActive(item);

    const handleItemClick = (e: React.MouseEvent | React.KeyboardEvent) => {
      if (item.disabled) {
        e.preventDefault();
        return;
      }

      if (hasChildren) {
        if (layout === 'sidebar') {
          e.preventDefault();
          toggleOpen(item.key);
          return;
        }

        if (!item.path) {
          e.preventDefault();
          return;
        }

        if (onItemClick) {
          onItemClick(item);
        }
        if (item.onClick) {
          item.onClick();
        }
        if (layout === 'topbar') {
          setOpenKeys([]);
        }
      } else {
        if (onItemClick) {
          onItemClick(item);
        }
        if (item.onClick) {
          item.onClick();
        }
        if (layout === 'topbar') {
          setOpenKeys([]);
        }
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleItemClick(e);
      }
    };

    const itemClasses = cn(
      'group flex items-center rounded-md transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary-400',
      layout === 'topbar'
        ? 'cursor-pointer text-base font-semibold text-slate-200 hover:bg-slate-700 hover:text-white'
        : 'cursor-pointer text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white',
      layout === 'sidebar' ? 'w-full' : 'w-auto',
      layout === 'sidebar'
        ? cn(
            'px-3 py-2',
            level > 0 && !collapsed && 'text-slate-300',
            level === 0 && 'py-2.5 uppercase tracking-wide'
          )
        : cn('px-3 py-2', level > 0 && 'py-2 px-3 text-sm text-slate-200', level === 0 && 'py-2.5'),
      item.disabled && 'pointer-events-none cursor-not-allowed opacity-50',
      collapsed && layout === 'sidebar' && level === 0 ? 'justify-center' : '',
      active && !hasChildren &&
        (layout === 'topbar'
          ? 'bg-primary-600 text-white hover:bg-primary-600 hover:text-white'
          : 'bg-primary-600 text-white hover:bg-primary-600 hover:text-white'),
      active && hasChildren && layout === 'sidebar' && level === 0 ? 'bg-slate-700 text-white' : '',
      active && hasChildren && layout === 'topbar' && level === 0 ? 'bg-slate-700 text-white' : ''
    );

    const titleValue = collapsed && level === 0 ? item.label : undefined;
    const isRenderableLink = Boolean(item.path) && !item.disabled && !(layout === 'sidebar' && hasChildren);

    return (
      <div
        key={item.key}
        className={cn(
          'relative',
          layout === 'topbar' && level === 0 ? 'flex items-center' : '',
          layout === 'sidebar' && level > 0 ? 'mt-1' : ''
        )}
        onMouseEnter={
          hasChildren && layout === 'topbar'
            ? () => {
                clearCloseTimer();
                setOpenKeys((prev) => {
                  const next = prev.slice(0, level);
                  next[level] = item.key;
                  return next;
                });
              }
            : undefined
        }
        onMouseLeave={
          hasChildren && layout === 'topbar'
            ? () => {
                clearCloseTimer();
                closeTimerRef.current = setTimeout(() => {
                  setOpenKeys((prev) => prev.slice(0, level));
                }, 120);
              }
            : undefined
        }
      >
        {isRenderableLink ? (
          <NavLink
            to={item.path as string}
            end={item.path === '/'}
            className={itemClasses}
            onClick={handleItemClick as never}
            onKeyDown={handleKeyDown}
            title={titleValue}
            aria-current={active ? 'page' : undefined}
          >
            <ItemContent
              item={item}
              hasChildren={hasChildren}
              active={active}
              collapsed={collapsed}
              layout={layout}
              level={level}
              isOpen={isOpen}
            />
          </NavLink>
        ) : hasChildren && isOpen ? (
          <button
            type="button"
            className={itemClasses}
            onClick={handleItemClick}
            title={titleValue}
            aria-expanded="true"
            disabled={item.disabled}
          >
            <ItemContent
              item={item}
              hasChildren={hasChildren}
              active={active}
              collapsed={collapsed}
              layout={layout}
              level={level}
              isOpen={isOpen}
            />
          </button>
        ) : hasChildren ? (
          <button
            type="button"
            className={itemClasses}
            onClick={handleItemClick}
            title={titleValue}
            aria-expanded="false"
            disabled={item.disabled}
          >
            <ItemContent
              item={item}
              hasChildren={hasChildren}
              active={active}
              collapsed={collapsed}
              layout={layout}
              level={level}
              isOpen={isOpen}
            />
          </button>
        ) : (
          <button
            type="button"
            className={itemClasses}
            onClick={handleItemClick}
            title={titleValue}
            disabled={item.disabled}
          >
            <ItemContent
              item={item}
              hasChildren={hasChildren}
              active={active}
              collapsed={collapsed}
              layout={layout}
              level={level}
              isOpen={isOpen}
            />
          </button>
        )}

        {hasChildren && layout === 'sidebar' && !collapsed && (
          <div
            className={cn(
              'ml-4 grid border-l border-slate-600 pl-2 transition-all duration-300 ease-in-out',
              isOpen ? 'mb-1 mt-1 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
            )}
          >
            <div className="flex flex-col overflow-hidden">{item.children!.map((child) => renderItem(child, level + 1))}</div>
          </div>
        )}

        {hasChildren && layout === 'topbar' && (
          <div
            className={cn(
              'absolute z-50 min-w-[240px] origin-top rounded-md border border-slate-600 bg-slate-900 text-slate-100 shadow-lg',
              level === 0 ? 'left-0 top-full' : 'left-full top-0',
              'transition-all duration-200',
              isOpen ? 'pointer-events-auto scale-y-100 opacity-100' : 'pointer-events-none scale-y-0 opacity-0'
            )}
            onMouseEnter={clearCloseTimer}
          >
            <div className="flex flex-col gap-0.5 p-1">{item.children!.map((child) => renderItem(child, level + 1))}</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <nav
      role="navigation"
      aria-label="Main Navigation"
      ref={menuRef}
      className={cn(
        'flex',
        layout === 'sidebar' ? 'min-w-[60px] flex-col gap-1' : 'flex-row items-center gap-1.5',
        collapsed && layout === 'sidebar' ? 'w-[60px]' : 'w-full'
      )}
    >
      {items.map((item) => renderItem(item, 0))}
    </nav>
  );
}

function ItemContent({
  item,
  hasChildren,
  active,
  collapsed,
  layout,
  level,
  isOpen,
}: {
  item: NavItem;
  hasChildren: boolean;
  active: boolean;
  collapsed: boolean;
  layout: 'sidebar' | 'topbar';
  level: number;
  isOpen: boolean;
}) {
  const showTextAndIcons = !collapsed || layout !== 'sidebar' || level > 0;
  const showIcon = layout === 'sidebar';

  return (
    <>
      {item.icon && showIcon && (
        <span
          className={cn(
            'flex shrink-0 items-center justify-center',
            showTextAndIcons && 'mr-3',
            active ? 'text-primary-200' : 'text-slate-400 group-hover:text-white'
          )}
        >
          {item.icon}
        </span>
      )}

      {showTextAndIcons && <span className="flex-1 truncate whitespace-nowrap text-left">{item.label}</span>}

      {item.badge && showTextAndIcons && (
        <span className="ml-2 inline-flex items-center justify-center rounded-full bg-primary-100 px-1.5 py-0.5 text-[10px] font-bold leading-none text-primary-700">
          {item.badge}
        </span>
      )}

      {hasChildren && showTextAndIcons && (
        <span className="ml-auto flex shrink-0 items-center justify-center">
          <ChevronDown className={cn('h-4 w-4 text-slate-400 transition-transform duration-200', isOpen && 'rotate-180')} />
        </span>
      )}
    </>
  );
}
