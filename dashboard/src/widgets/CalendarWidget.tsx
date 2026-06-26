// ============================================================
// تقويم الحملات (Calendar Widget)
// CalendarWidget.tsx
// ============================================================

import React, { useMemo } from 'react';
import WidgetWrapper from './WidgetWrapper';
import { THEME, STATUS_COLORS } from '@utils/colors';
import { formatDate, DAYS_ARABIC, MONTHS_ARABIC } from '@utils/formatters';
import type { Campaign, PlatformType } from '@/types';
import { PLATFORMS } from '@/types';

interface CalendarWidgetProps {
  title?: string;
  campaigns: Campaign[];
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  month?: number;
  year?: number;
}

export default function CalendarWidget({
  title = 'تقويم الحملات',
  campaigns,
  loading = false,
  error = null,
  empty = false,
  month,
  year,
}: CalendarWidgetProps) {
  const now = new Date();
  const currentMonth = month ?? now.getMonth();
  const currentYear = year ?? now.getFullYear();

  // إنشاء أيام الشهر
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    // خريطة الحملات حسب اليوم
    const campaignsByDate = new Map<string, Campaign[]>();
    for (const campaign of campaigns) {
      const start = new Date(campaign.startDate);
      const end = new Date(campaign.endDate);
      const current = new Date(start);

      while (current <= end) {
        const key = `${current.getFullYear()}-${current.getMonth()}-${current.getDate()}`;
        if (!campaignsByDate.has(key)) campaignsByDate.set(key, []);
        campaignsByDate.get(key)!.push(campaign);
        current.setDate(current.getDate() + 1);
      }
    }

    const days: { day: number; campaigns: Campaign[]; isToday: boolean; isActive: boolean }[] = [];

    // أيام فارغة قبل أول يوم
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ day: 0, campaigns: [], isToday: false, isActive: false });
    }

    // أيام الشهر
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${currentYear}-${currentMonth}-${d}`;
      const dayCampaigns = campaignsByDate.get(key) || [];
      const isToday =
        d === now.getDate() &&
        currentMonth === now.getMonth() &&
        currentYear === now.getFullYear();

      days.push({
        day: d,
        campaigns: dayCampaigns.filter(c => c.status === 'active' || c.status === 'paused'),
        isToday,
        isActive: dayCampaigns.some(c => c.status === 'active'),
      });
    }

    return days;
  }, [campaigns, currentMonth, currentYear]);

  const monthName = MONTHS_ARABIC[currentMonth];

  // تصغير الحملات النشطة لعرضها
  const activeCampaignsToday = useMemo(() => {
    const today = now;
    return campaigns.filter(c => {
      const start = new Date(c.startDate);
      const end = new Date(c.endDate);
      return start <= today && end >= today && (c.status === 'active' || c.status === 'paused');
    });
  }, [campaigns]);

  return (
    <WidgetWrapper
      title={title}
      icon="📅"
      loading={loading}
      error={error}
      empty={empty}
    >
      {/* رأس التقويم */}
      <div
        style={{
          textAlign: 'center',
          fontSize: '1.1rem',
          fontWeight: 600,
          color: THEME.text.primary,
          marginBottom: '0.75rem',
        }}
      >
        {monthName} {currentYear}
      </div>

      {/* أيام الأسبوع */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '2px',
          marginBottom: '4px',
        }}
      >
        {DAYS_ARABIC.map(day => (
          <div
            key={day}
            style={{
              textAlign: 'center',
              fontSize: '0.7rem',
              color: THEME.text.muted,
              padding: '0.25rem 0',
              fontWeight: 600,
            }}
          >
            {day.slice(0, 2)}
          </div>
        ))}
      </div>

      {/* أيام الشهر */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '2px',
        }}
      >
        {calendarDays.map((day, index) => (
          <div
            key={index}
            style={{
              aspectRatio: '1',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '0.375rem',
              backgroundColor: day.isToday
                ? STATUS_COLORS.active + '20'
                : day.isActive
                ? THEME.bg.info
                : 'transparent',
              border: day.isToday ? `2px solid ${STATUS_COLORS.active}` : '2px solid transparent',
              color: day.day === 0 ? 'transparent' : day.isToday ? THEME.text.primary : THEME.text.secondary,
              fontSize: '0.75rem',
              fontWeight: day.isToday ? 700 : 400,
              cursor: day.day > 0 ? 'pointer' : 'default',
              position: 'relative',
              padding: '2px',
            }}
          >
            {day.day > 0 && (
              <>
                <span>{day.day}</span>
                {day.campaigns.length > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      gap: '2px',
                      marginTop: '1px',
                    }}
                  >
                    {day.campaigns.slice(0, 3).map((c, i) => (
                      <span
                        key={i}
                        style={{
                          width: '5px',
                          height: '5px',
                          borderRadius: '50%',
                          backgroundColor: STATUS_COLORS[c.status] || THEME.text.muted,
                        }}
                      />
                    ))}
                    {day.campaigns.length > 3 && (
                      <span style={{ fontSize: '0.5rem', color: THEME.text.muted }}>+</span>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {/* الحملات النشطة اليوم */}
      {activeCampaignsToday.length > 0 && (
        <div style={{ marginTop: '0.75rem' }}>
          <div
            style={{
              fontSize: '0.75rem',
              color: THEME.text.muted,
              fontWeight: 500,
              marginBottom: '0.4rem',
            }}
          >
            الحملات النشطة اليوم:
          </div>
          {activeCampaignsToday.slice(0, 3).map(campaign => (
            <div
              key={campaign.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.75rem',
                color: THEME.text.secondary,
                padding: '0.2rem 0',
              }}
            >
              <span style={{ fontSize: '0.8rem' }}>{PLATFORMS[campaign.platform]?.icon || '📋'}</span>
              <span style={{ flex: 1 }}>{campaign.nameAr}</span>
              <span
                style={{
                  fontSize: '0.6rem',
                  padding: '0.1rem 0.35rem',
                  borderRadius: '0.25rem',
                  backgroundColor: STATUS_COLORS[campaign.status] + '20',
                  color: STATUS_COLORS[campaign.status],
                }}
              >
                {campaign.status === 'active' ? 'نشط' : 'متوقف'}
              </span>
            </div>
          ))}
        </div>
      )}
    </WidgetWrapper>
  );
}
