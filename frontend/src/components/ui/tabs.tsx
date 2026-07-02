import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface TabsContextType {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextType | null>(null);

const useTabs = () => {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error('Tabs sub-components must be used within <Tabs>');
  return ctx;
};

interface TabsProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
  dir?: 'ltr' | 'rtl';
}

const Tabs: React.FC<TabsProps | LegacyTabsProps> = (props: any) => {
  if ('tabs' in props && Array.isArray(props.tabs)) {
    const { tabs, activeTab, onChange, className } = props as LegacyTabsProps;
    return <LegacyTabs tabs={tabs} activeTab={activeTab} onChange={onChange} className={className} />;
  }
  const { value: controlledValue, defaultValue, onValueChange, children, className } = props as TabsProps;
  const [internalValue, setInternalValue] = useState(defaultValue || controlledValue || '');
  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const handleValueChange = onValueChange || setInternalValue;
  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <div className={cn(className)}>{children}</div>
    </TabsContext.Provider>
  );
};

const TabsList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground', className)} {...props} />
  )
);
TabsList.displayName = 'TabsList';

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value: tabValue, ...props }, ref) => {
    const { value: selectedValue, onValueChange } = useTabs();
    const isActive = selectedValue === tabValue;
    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        data-state={isActive ? 'active' : 'inactive'}
        onClick={() => onValueChange(tabValue)}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          isActive ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
          className
        )}
        {...props}
      />
    );
  }
);
TabsTrigger.displayName = 'TabsTrigger';

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value: tabValue, ...props }, ref) => {
    const { value: selectedValue } = useTabs();
    if (selectedValue !== tabValue) return null;
    return (
      <div ref={ref} role="tabpanel" data-state="active" className={cn('mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2', className)} {...props} />
    );
  }
);
TabsContent.displayName = 'TabsContent';

interface LegacyTabsProps {
  tabs: { id: string; label: string; icon?: React.ReactNode }[];
  activeTab?: string;
  onChange: (id: string) => void;
  className?: string;
}

const LegacyTabs: React.FC<LegacyTabsProps> = ({ tabs, activeTab, onChange, className }) => {
  return (
    <div className={cn('flex border-b border-gray-200 dark:border-dark-border', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap',
            activeTab === tab.id
              ? 'border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
          )}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
};

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
}

const Dropdown: React.FC<DropdownProps> = ({ trigger, children, align = 'left' }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className={cn('absolute z-50 mt-2 min-w-[200px] bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl shadow-lg py-1 animate-fade-in', align === 'left' ? 'left-0' : 'right-0')}>
            {children}
          </div>
        </>
      )}
    </div>
  );
};

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  const pages: (number | string)[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }
  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-dark-border hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed">السابق</button>
      {pages.map((page, i) => (
        <button key={i} onClick={() => typeof page === 'number' && onPageChange(page)} className={cn('px-3 py-1.5 text-sm rounded-lg transition-colors', page === currentPage ? 'bg-primary-600 text-white' : 'border border-gray-300 dark:border-dark-border hover:bg-gray-100 dark:hover:bg-gray-800')}>{page}</button>
      ))}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-dark-border hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed">التالي</button>
    </div>
  );
};

interface ProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md';
  color?: string;
  className?: string;
}

const Progress: React.FC<ProgressProps> = ({ value, max = 100, size = 'md', color, className }) => {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className={cn('w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden', size === 'sm' ? 'h-1.5' : 'h-2.5', className)}>
      <div className={cn('h-full rounded-full transition-all duration-500', color || 'bg-primary-600')} style={{ width: `${pct}%` }} />
    </div>
  );
};

export { Tabs, TabsList, TabsTrigger, TabsContent, LegacyTabs, Dropdown, Pagination, Progress };
