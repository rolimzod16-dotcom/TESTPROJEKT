"use client";

import { Logo } from "@/components/ui/Logo";

type Tab = {
  id: string;
  label: string;
  icon: string;
};

type MobileShellProps = {
  title: string;
  subtitle?: string;
  tabs?: Tab[];
  activeTab?: string;
  onTabChange?: (id: string) => void;
  children: React.ReactNode;
};

export function MobileShell({
  title,
  subtitle,
  tabs,
  activeTab,
  onTabChange,
  children,
}: MobileShellProps) {
  return (
    <div className="hm-page flex min-h-dvh flex-col">
      <header className="safe-top sticky top-0 z-10 border-b border-amber-200/60 bg-white/90 backdrop-blur-md">
        <div className="flex items-center gap-3 px-4 py-3">
          <Logo size="sm" />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-bold text-stone-900">
              {title}
            </h1>
            {subtitle && (
              <p className="truncate text-xs text-stone-500">{subtitle}</p>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4 pb-32">{children}</main>

      {tabs && tabs.length > 0 && onTabChange && (
        <nav className="safe-bottom fixed bottom-0 left-0 right-0 z-20 px-4 pb-3">
          <div className="mx-auto flex max-w-lg gap-1 rounded-2xl border border-amber-200/80 bg-white/95 p-1.5 shadow-lg shadow-amber-100/50 backdrop-blur-md">
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onTabChange(tab.id)}
                  className={`hm-btn flex flex-1 flex-col items-center gap-0.5 rounded-xl py-2 text-[11px] ${
                    active
                      ? "bg-amber-500 font-semibold text-stone-900 shadow-md shadow-amber-200"
                      : "font-medium text-stone-500"
                  }`}
                >
                  <span className="text-base">{tab.icon}</span>
                  {tab.label}
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}