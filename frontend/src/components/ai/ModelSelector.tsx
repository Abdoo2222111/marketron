'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { aiProvidersApi } from '@/services/api-modules';
import { cn } from '@/lib/utils';

export interface ProviderInfo {
  name: string;
  label: string;
  configured: boolean;
  models: string[];
}

interface ModelSelectorProps {
  value: { provider: string; model: string };
  onChange: (value: { provider: string; model: string }) => void;
  className?: string;
  label?: string;
  providerLabel?: string;
  modelLabel?: string;
  hideLabel?: boolean;
  disabled?: boolean;
  type?: 'text' | 'image' | 'audio'; // filter providers by capability
}

const PROVIDER_ICONS: Record<string, string> = {
  zen: '🧘',
  puter: '📦',
  openai: '🟢',
  anthropic: '🟣',
  gemini: '🔵',
  groq: '🟠',
  mistral: '🔴',
  cohere: '🟤',
  deepseek: '🟡',
  perplexity: '🟢',
  pollinations: '🌸',
};

export default function ModelSelector({
  value,
  onChange,
  className,
  label,
  providerLabel,
  modelLabel,
  hideLabel = false,
  disabled = false,
  type,
}: ModelSelectorProps) {
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      setLoading(true);
      const res = await aiProvidersApi.list();
      const allProviders: ProviderInfo[] = res.data?.data?.providers || [];
      let filtered = allProviders;

      // If type filter is provided, keep only providers with relevant models
      if (type === 'image') {
        filtered = allProviders.filter(p =>
          ['puter', 'openai', 'pollinations', 'gemini', 'anthropic', 'mistral', 'deepseek'].includes(p.name)
        );
      } else if (type === 'audio') {
        filtered = allProviders.filter(p =>
          ['puter', 'openai', 'pollinations', 'deepseek', 'groq'].includes(p.name)
        );
      }

      setProviders(filtered);
      if (filtered.length > 0 && !value.provider) {
        const defaultProvider = res.data?.data?.default || filtered[0].name;
        const provider = filtered.find(p => p.name === defaultProvider) || filtered[0];
        onChange({ provider: provider.name, model: provider.models[0] || '' });
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || 'فشل تحميل المزودات');
    } finally {
      setLoading(false);
    }
  };

  const selectedProvider = providers.find(p => p.name === value.provider);
  const models = selectedProvider?.models || [];

  if (loading) {
    return (
      <div className={cn('flex items-center gap-2 text-sm text-[#A1A1C2]', className)}>
        <Loader2 className="w-4 h-4 animate-spin" />
        جاري تحميل المزودات...
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('flex items-center gap-2 text-sm text-[#F43F5E]', className)}>
        <AlertCircle className="w-4 h-4" />
        {error}
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {label && !hideLabel && (
        <label className="block text-sm font-medium text-[#E2E8F0]">{label}</label>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Provider Select */}
        <div>
          {!hideLabel && providerLabel && (
            <label className="block text-xs text-[#A1A1C2] mb-1">{providerLabel}</label>
          )}
          <select
            value={value.provider}
            onChange={(e) => {
              const p = providers.find(pr => pr.name === e.target.value);
              onChange({ provider: e.target.value, model: p?.models?.[0] || '' });
            }}
            disabled={disabled}
            className="w-full bg-[#1E1B3A] border border-[#7C3AED]/30 rounded-lg px-3 py-2.5 text-sm text-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#7C3AED] disabled:opacity-50"
          >
            {providers.map(p => (
              <option key={p.name} value={p.name}>
                {PROVIDER_ICONS[p.name] || '🤖'} {p.label} {p.configured ? '✅' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Model Select */}
        <div>
          {!hideLabel && modelLabel && (
            <label className="block text-xs text-[#A1A1C2] mb-1">{modelLabel}</label>
          )}
          <select
            value={value.model}
            onChange={(e) => onChange({ ...value, model: e.target.value })}
            disabled={disabled || models.length === 0}
            className="w-full bg-[#1E1B3A] border border-[#7C3AED]/30 rounded-lg px-3 py-2.5 text-sm text-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#7C3AED] disabled:opacity-50"
          >
            {models.length === 0 ? (
              <option value="">لا توجد نماذج متاحة</option>
            ) : (
              models.map(m => (
                <option key={m} value={m}>{m}</option>
              ))
            )}
          </select>
        </div>
      </div>
    </div>
  );
}
