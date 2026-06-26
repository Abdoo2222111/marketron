// ============================================================
// غلاف موحد لجميع الـ Widgets (Skeleton, Error, Empty states)
// ============================================================

import React from 'react';
import { THEME } from '@utils/colors';

interface WidgetWrapperProps {
  title: string;
  icon?: string;
  children: React.ReactNode;
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  emptyMessage?: string;
  className?: string;
  style?: React.CSSProperties;
  onRefresh?: () => void;
  headerActions?: React.ReactNode;
}

export default function WidgetWrapper({
  title,
  icon,
  children,
  loading = false,
  error = null,
  empty = false,
  emptyMessage = 'لا توجد بيانات كافية بعد',
  className = '',
  style,
  onRefresh,
  headerActions,
}: WidgetWrapperProps) {
  // حالة التحميل (Skeleton)
  if (loading) {
    return (
      <div
        className={`widget-wrapper ${className}`}
        style={{
          background: THEME.bg.card,
          borderRadius: THEME.radius,
          boxShadow: THEME.shadow,
          border: `1px solid ${THEME.border}`,
          padding: '1.25rem',
          direction: 'rtl',
          ...style,
        }}
      >
        <div className="widget-header" style={{ marginBottom: '1rem' }}>
          <div
            className="skeleton skeleton-title"
            style={{
              width: '60%',
              height: '1.25rem',
              backgroundColor: THEME.bg.skeleton,
              borderRadius: '0.25rem',
              animation: 'pulse 2s infinite',
            }}
          />
        </div>
        <div className="skeleton-body">
          <div
            className="skeleton skeleton-chart"
            style={{
              width: '100%',
              height: '200px',
              backgroundColor: THEME.bg.skeleton,
              borderRadius: '0.5rem',
              animation: 'pulse 2s infinite',
            }}
          />
        </div>
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </div>
    );
  }

  // حالة الخطأ
  if (error) {
    return (
      <div
        className={`widget-wrapper ${className}`}
        style={{
          background: THEME.bg.card,
          borderRadius: THEME.radius,
          boxShadow: THEME.shadow,
          border: `1px solid ${THEME.bg.error}`,
          padding: '1.25rem',
          direction: 'rtl',
          ...style,
        }}
      >
        <div className="widget-header" style={{ marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', color: THEME.text.error }}>
            {icon} {title}
          </h3>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '150px',
            color: THEME.text.error,
            textAlign: 'center',
          }}
        >
          <span style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚠️</span>
          <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem' }}>حدث خطأ في تحميل البيانات</p>
          <p style={{ margin: 0, fontSize: '0.75rem', color: THEME.text.muted }}>
            {error}
          </p>
          {onRefresh && (
            <button
              onClick={onRefresh}
              style={{
                marginTop: '0.75rem',
                padding: '0.5rem 1rem',
                background: THEME.bg.info,
                color: THEME.text.info,
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.8rem',
              }}
            >
              إعادة تحميل
            </button>
          )}
        </div>
      </div>
    );
  }

  // حالة فارغة
  if (empty) {
    return (
      <div
        className={`widget-wrapper ${className}`}
        style={{
          background: THEME.bg.card,
          borderRadius: THEME.radius,
          boxShadow: THEME.shadow,
          border: `1px solid ${THEME.border}`,
          padding: '1.25rem',
          direction: 'rtl',
          ...style,
        }}
      >
        <div className="widget-header" style={{ marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', color: THEME.text.primary }}>
            {icon} {title}
          </h3>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '150px',
            color: THEME.text.muted,
            textAlign: 'center',
          }}
        >
          <span style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📭</span>
          <p style={{ margin: 0, fontSize: '0.875rem' }}>{emptyMessage}</p>
        </div>
      </div>
    );
  }

  // الحالة العادية
  return (
    <div
      className={`widget-wrapper ${className}`}
      style={{
        background: THEME.bg.card,
        borderRadius: THEME.radius,
        boxShadow: THEME.shadow,
        border: `1px solid ${THEME.border}`,
        padding: '1.25rem',
        direction: 'rtl',
        ...style,
      }}
    >
      <div
        className="widget-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '1rem', color: THEME.text.primary, fontWeight: 600 }}>
          {icon && <span style={{ marginLeft: '0.5rem' }}>{icon}</span>}
          {title}
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {headerActions}
          {onRefresh && (
            <button
              onClick={onRefresh}
              title="تحديث"
              style={{
                background: 'none',
                border: `1px solid ${THEME.border}`,
                borderRadius: '0.375rem',
                padding: '0.25rem 0.5rem',
                cursor: 'pointer',
                fontSize: '0.8rem',
                color: THEME.text.secondary,
              }}
            >
              🔄
            </button>
          )}
        </div>
      </div>
      <div className="widget-content">{children}</div>
    </div>
  );
}
