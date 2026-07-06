'use client';

import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ message = 'جارٍ التحميل...', className = '' }: LoadingStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center min-h-[60vh] p-8 ${className}`}>
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/10 flex items-center justify-center mb-4 border border-purple-500/20">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-6 p-4 sm:p-6 animate-pulse">
      <div className="h-8 w-48 bg-muted rounded-lg" />
      <div className="h-4 w-72 bg-muted rounded-lg" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-muted/50 rounded-2xl" />
        ))}
      </div>
      <div className="h-64 bg-muted/30 rounded-2xl" />
    </div>
  );
}

export function ErrorState({ message = 'حدث خطأ', onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-500/5 flex items-center justify-center mb-4 border border-red-500/20">
        <span className="text-2xl">⚠️</span>
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">عذراً</h3>
      <p className="text-muted-foreground text-sm mb-6 max-w-md">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold text-sm hover:shadow-lg transition-all">
          إعادة المحاولة
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, description, icon }: { title: string; description: string; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] p-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/10 flex items-center justify-center mb-4 border border-purple-500/20">
        {icon || <span className="text-2xl">📭</span>}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-md">{description}</p>
    </div>
  );
}
