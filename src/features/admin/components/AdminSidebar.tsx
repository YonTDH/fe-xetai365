import { ChevronDown, ChevronRight, Shield } from 'lucide-react';
import { getAdminSectionPath, adminMenuItems, type AdminSectionKey } from '../config/menu';

type AdminSidebarProps = {
  activeSection: AdminSectionKey;
  openKeys: string[];
  onToggleGroup: (key: string) => void;
  onSelectSection: (section: AdminSectionKey) => void;
};

export function AdminSidebar({
  activeSection,
  openKeys,
  onToggleGroup,
  onSelectSection,
}: AdminSidebarProps) {
  return (
    <aside className="w-full bg-gradient-to-b from-slate-900 via-slate-800 to-sky-950 text-white xl:fixed xl:inset-y-0 xl:left-0 xl:w-72 xl:overflow-hidden">
      <div className="flex h-full flex-col">
        <div className="border-b border-white/10 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur">
              <Shield className="h-5 w-5 text-sky-300" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold tracking-tight text-white">Administrator</div>
              <div className="mt-0.5 text-[11px] text-slate-300">Bảng quản trị nội dung</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {adminMenuItems.map((item) => {
            const Icon = item.icon;
            const isOpen = openKeys.includes(item.key);
            const isLeafActive = item.section && item.section === activeSection;
            const isGroupActive = item.children?.some((child) => child.section === activeSection);

            if (item.children?.length) {
              return (
                <div key={item.key} className="rounded-2xl">
                  <button
                    type="button"
                    onClick={() => onToggleGroup(item.key)}
                    className={[
                      'flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all',
                      isGroupActive
                        ? 'bg-white/12 text-white ring-1 ring-white/15'
                        : 'text-slate-200 hover:bg-white/8 hover:text-white',
                    ].join(' ')}
                  >
                    <Icon className="h-4 w-4 shrink-0 text-sky-300" />
                    <span className="flex-1 text-[13px] font-medium">{item.label}</span>
                    {isOpen ? <ChevronDown className="h-4 w-4 text-slate-300" /> : <ChevronRight className="h-4 w-4 text-slate-300" />}
                  </button>

                  {isOpen && (
                    <div className="mt-1 space-y-1 pl-3">
                      {item.children.map((child) => {
                        const ChildIcon = child.icon;
                        const isActive = child.section === activeSection;

                        return (
                          <button
                            key={child.key}
                            type="button"
                            onClick={() => onSelectSection(child.section)}
                            className={[
                              'flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left transition-all',
                              isActive
                                ? 'bg-sky-400/15 text-white ring-1 ring-sky-300/20'
                                : 'text-slate-300 hover:bg-white/6 hover:text-white',
                            ].join(' ')}
                          >
                            <ChildIcon className="h-3 w-3 shrink-0 text-slate-400" />
                            <span className="text-[12px] font-medium">{child.label}</span>
                            <span className="sr-only">{getAdminSectionPath(child.section)}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => item.section && onSelectSection(item.section)}
                className={[
                  'flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all',
                  isLeafActive
                    ? 'bg-white/12 text-white ring-1 ring-white/15'
                    : 'text-slate-200 hover:bg-white/8 hover:text-white',
                ].join(' ')}
              >
                <Icon className="h-4 w-4 shrink-0 text-sky-300" />
                <span className="text-[13px] font-medium">{item.label}</span>
                {item.section ? <span className="sr-only">{getAdminSectionPath(item.section)}</span> : null}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
