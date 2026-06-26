// ============================================================
// تنبيهات (Alert Widget)
// AlertWidget.tsx
// ============================================================

import React from 'react';
import WidgetWrapper from './WidgetWrapper';
import { formatDateTime } from '@utils/formatters';
import { THEME, SEVERITY_COLORS } from '@utils/colors';
import type { Alert } from '@/types';

interface AlertWidgetProps {
  title?: string;
  alerts: Alert[];
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  onDismiss?: (id: string) => void;
  maxAlerts?: number;
}

const ALERT_ICONS: Record<string, string> = {
  budget_exceeded: '💰',
  performance_drop: '📉',
  campaign_ending: '⏰',
  token_expiry: '🔑',
  anomaly: '🚨',
};

const ALERT_TYPE_LABELS: Record<string, string> = {
  budget_exceeded: 'تجاوز الميزانية',
  performance_drop: 'انخفاض الأداء',
  campaign_ending: 'انتهاء وشيك',
  token_expiry: 'انتهاء صلاحية',
  anomaly: 'حالة شاذة',
};

export default function AlertWidget({
  title = 'التنبيهات',
  alerts,
  loading = false,
  error = null,
  empty = false,
  onDismiss,
  maxAlerts = 5,
}: AlertWidgetProps) {
  const visibleAlerts = alerts.slice(0, maxAlerts);
  const unreadCount = alerts.filter(a => !a.read).length;

  return (
    <WidgetWrapper
      title={title}
      icon="🔔"
      loading={loading}
      error={error}
      empty={empty || alerts.length === 0}
      emptyMessage="لا توجد تنبيهات جديدة"
      headerActions={
        unreadCount > 0 ? (
          <span
            style={{
              background: '#ef4444',
              color: '#fff',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.7rem',
              fontWeight: 700,
            }}
          >
            {unreadCount}
          </span>
        ) : undefined
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {visibleAlerts.map(alert => (
          <div
            key={alert.id}
            style={{
              display: 'flex',
              gap: '0.75rem',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              backgroundColor: alert.read ? THEME.bg.secondary : THEME.bg.card,
              border: `1px solid ${!alert.read ? SEVERITY_COLORS[alert.severity] + '40' : THEME.border}`,
              borderRight: `3px solid ${SEVERITY_COLORS[alert.severity]}`,
              position: 'relative',
              opacity: alert.read ? 0.7 : 1,
            }}
          >
            <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>
              {ALERT_ICONS[alert.type] || '🔔'}
            </span>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: THEME.text.primary,
                    }}
                  >
                    {alert.titleAr}
                  </span>
                  {!alert.read && (
                    <span
                      style={{
                        fontSize: '0.6rem',
                        background: SEVERITY_COLORS[alert.severity],
                        color: '#fff',
                        padding: '0.1rem 0.35rem',
                        borderRadius: '0.25rem',
                        marginRight: '0.5rem',
                      }}
                    >
                      {ALERT_TYPE_LABELS[alert.type] || alert.type}
                    </span>
                  )}
                </div>
                {onDismiss && (
                  <button
                    onClick={() => onDismiss(alert.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      color: THEME.text.muted,
                      padding: '0.1rem',
                      lineHeight: 1,
                      flexShrink: 0,
                    }}
                    title="تجاهل"
                  >
                    ✕
                  </button>
                )}
              </div>

              <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: THEME.text.secondary }}>
                {alert.messageAr}
              </p>

              <span style={{ fontSize: '0.65rem', color: THEME.text.muted, marginTop: '0.25rem', display: 'block' }}>
                {formatDateTime(alert.timestamp)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {alerts.length > maxAlerts && (
        <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: THEME.text.muted, cursor: 'pointer' }}>
            + {alerts.length - maxAlerts} تنبيهات أخرى
          </span>
        </div>
      )}
    </WidgetWrapper>
  );
}
