// ============================================================
// اختيار المقياس (Metric Selector)
// MetricSelector.tsx
// ============================================================

import React from 'react';
import type { MetricKey } from '@/types';
import { METRICS } from '@/types';
import { THEME } from '@utils/colors';

interface MetricSelectorProps {
  selected: MetricKey[];
  onChange: (metrics: MetricKey[]) => void;
  multi?: boolean;
  max?: number;
}

export default function MetricSelector({
  selected,
  onChange,
  multi = true,
  max = 4,
}: MetricSelectorProps) {
  const handleToggle = (key: MetricKey) => {
    if (multi) {
      if (selected.includes(key)) {
        if (selected.length > 1) {
          onChange(selected.filter(m => m !== key));
        }
      } else {
        if (selected.length < max) {
          onChange([...selected, key]);
        }
      }
    } else {
      onChange([key]);
    }
  };

  const metricsList = Object.values(METRICS);

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.35rem',
      }}
    >
      {metricsList.map(metric => {
        const isSelected = selected.includes(metric.key);
        return (
          <button
            key={metric.key}
            onClick={() => handleToggle(metric.key)}
            style={{
              padding: '0.3rem 0.6rem',
              fontSize: '0.7rem',
              background: isSelected ? metric.color + '20' : THEME.bg.tertiary,
              border: `1px solid ${isSelected ? metric.color : THEME.border}`,
              borderRadius: '1rem',
              color: isSelected ? metric.color : THEME.text.secondary,
              cursor: 'pointer',
              fontWeight: isSelected ? 600 : 400,
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
            }}
            title={metric.labelAr}
          >
            {metric.icon} {metric.labelAr}
          </button>
        );
      })}
    </div>
  );
}
