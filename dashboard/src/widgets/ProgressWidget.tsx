// ============================================================
// شريط تقدم (Progress Widget)
// ProgressWidget.tsx
// ============================================================

import React from 'react';
import WidgetWrapper from './WidgetWrapper';
import { formatNumber, formatCurrency, formatPercent } from '@utils/formatters';
import { THEME } from '@utils/colors';

interface ProgressItem {
  label: string;
  current: number;
  target: number;
  unit?: 'currency' | 'number' | 'percentage';
  color?: string;
}

interface ProgressWidgetProps {
  title?: string;
  items: ProgressItem[];
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
}

export default function ProgressWidget({
  title = 'التقدم نحو الهدف',
  items,
  loading = false,
  error = null,
  empty = false,
}: ProgressWidgetProps) {
  const formatProgressValue = (value: number, unit?: string) => {
    switch (unit) {
      case 'currency':
        return formatCurrency(value);
      case 'percentage':
        return formatPercent(value);
      default:
        return formatNumber(value);
    }
  };

  return (
    <WidgetWrapper
      title={title}
      icon="🎯"
      loading={loading}
      error={error}
      empty={empty || items.length === 0}
      emptyMessage="لا توجد أهداف محددة بعد"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {items.map((item, index) => {
          const percentage = item.target > 0
            ? Math.min((item.current / item.target) * 100, 100)
            : 0;
          const color = item.color || (percentage >= 100 ? '#22c55e' : percentage >= 75 ? '#6366f1' : percentage >= 50 ? '#f59e0b' : '#ef4444');
          const barBg = THEME.bg.tertiary;

          return (
            <div key={index}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem',
                }}
              >
                <span
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    color: THEME.text.primary,
                  }}
                >
                  {item.label}
                </span>
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: THEME.text.secondary,
                  }}
                >
                  {formatProgressValue(item.current, item.unit)}
                  {' / '}
                  {formatProgressValue(item.target, item.unit)}
                </span>
              </div>

              <div
                style={{
                  width: '100%',
                  height: '10px',
                  backgroundColor: barBg,
                  borderRadius: '5px',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    width: `${percentage}%`,
                    height: '100%',
                    backgroundColor: color,
                    borderRadius: '5px',
                    transition: 'width 0.8s ease-in-out',
                    position: 'relative',
                  }}
                >
                  {/* التأثير اللماع */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                      animation: 'shimmer 2s infinite',
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '0.25rem',
                }}
              >
                <span style={{ fontSize: '0.7rem', color: THEME.text.muted }}>
                  {formatPercent(percentage)}
                </span>
                <span style={{ fontSize: '0.7rem', color: THEME.text.muted }}>
                  الهدف: {formatProgressValue(item.target, item.unit)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </WidgetWrapper>
  );
}
