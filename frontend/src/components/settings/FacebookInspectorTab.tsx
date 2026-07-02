'use client';

import React, { useState } from 'react';
import {
  Loader2, Search, AlertCircle, CheckCircle2, Copy, Shield, Facebook, Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { facebookTokenApi } from '@/services/api-modules';
import { cn } from '@/lib/utils';

export function FacebookInspectorTab() {
  const [token, setToken] = useState('');
  const [inspecting, setInspecting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleInspect = async () => {
    if (!token.trim()) return;
    setInspecting(true);
    setError(null);
    setResult(null);
    try {
      const res = await facebookTokenApi.inspect(token);
      setResult(res.data?.data);
      if (!res.data?.data?.valid) {
        setError(res.data?.data?.error || 'التوكن غير صالح');
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || 'فشل فحص التوكن');
    } finally { setInspecting(false); }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold">🔍 فحص توكن فيسبوك</h2>
        <p className="text-sm text-[#A1A1C2]">أدخل Facebook Access Token لفحص صلاحيته والحصول على معلومات مفصلة عنه</p>
      </div>

      <Card>
        <CardContent className="p-5 space-y-4">
          <div>
            <Label>Facebook Access Token</Label>
            <div className="flex gap-2 mt-1">
              <Input
                type="password"
                value={token}
                onChange={e => setToken(e.target.value)}
                placeholder="أدخل Facebook Access Token..."
                className="flex-1"
                onKeyDown={e => e.key === 'Enter' && handleInspect()}
              />
              <Button onClick={handleInspect} disabled={inspecting || !token.trim()}>
                {inspecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                فحص
              </Button>
            </div>
          </div>

          <div className="bg-[#1E1B3A]/50 rounded-lg p-3 text-sm text-[#A1A1C2] space-y-1">
            <p className="font-medium text-[#E2E8F0]">💡 كيف تحصل على التوكن؟</p>
            <p>1. اذهب إلى <a href="https://developers.facebook.com/tools/access_token" target="_blank" rel="noopener noreferrer" className="text-[#7C3AED] underline">Facebook Access Token Tool</a></p>
            <p>2. اختر التطبيق المناسب</p>
            <p>3. انسخ الـ Token<br />أو استخدم <a href="https://developers.facebook.com/tools/debug/accesstoken" target="_blank" rel="noopener noreferrer" className="text-[#7C3AED] underline">Token Debugger</a> للتحقق أولاً</p>
          </div>
        </CardContent>
      </Card>

      {inspecting && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" />
        </div>
      )}

      {error && !inspecting && (
        <div className="bg-[#F43F5E]/10 border border-[#F43F5E]/20 rounded-xl p-4">
          <div className="flex items-center gap-2 text-[#F43F5E]">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">التوكن غير صالح</span>
          </div>
          <p className="text-sm text-[#F43F5E]/80 mt-1">{error}</p>
        </div>
      )}

      {result?.valid && !inspecting && (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#10B981]/20 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-[#10B981]" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">التوكن صالح ✅</h3>
                  <p className="text-sm text-[#A1A1C2]">تم فحص التوكن بنجاح</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#1E1B3A]/50 rounded-lg p-3">
                  <p className="text-xs text-[#A1A1C2]">App ID</p>
                  <p className="font-mono text-sm flex items-center gap-2">
                    {result.appId || 'غير معروف'}
                    {result.appId && (
                      <button onClick={() => copyToClipboard(result.appId)} className="text-[#7C3AED] hover:text-[#7C3AED]/80">
                        {copied ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </button>
                    )}
                  </p>
                </div>
                <div className="bg-[#1E1B3A]/50 rounded-lg p-3">
                  <p className="text-xs text-[#A1A1C2]">App Name</p>
                  <p className="text-sm">{result.appName || 'غير معروف'}</p>
                </div>
                <div className="bg-[#1E1B3A]/50 rounded-lg p-3">
                  <p className="text-xs text-[#A1A1C2]">User ID</p>
                  <p className="font-mono text-sm">{result.userId || 'غير معروف'}</p>
                </div>
                <div className="bg-[#1E1B3A]/50 rounded-lg p-3">
                  <p className="text-xs text-[#A1A1C2]">User Name</p>
                  <p className="text-sm">{result.userName || 'غير معروف'}</p>
                </div>
                <div className="bg-[#1E1B3A]/50 rounded-lg p-3 sm:col-span-2">
                  <p className="text-xs text-[#A1A1C2]">تاريخ الانتهاء</p>
                  <p className="text-sm">{result.expiresAt ? new Date(result.expiresAt).toLocaleString('ar-EG') : 'لا ينتهي (Never Expires)'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {result.scopes?.length > 0 && (
            <Card>
              <CardContent className="p-5">
                <h3 className="font-bold mb-3 flex items-center gap-2"><Shield className="w-4 h-4" /> الصلاحيات ({result.scopes.length})</h3>
                <div className="flex flex-wrap gap-2">
                  {result.scopes.map((scope: string, i: number) => (
                    <Badge key={i} variant="secondary" className="text-xs">{scope}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {result.pages?.length > 0 && (
            <Card>
              <CardContent className="p-5">
                <h3 className="font-bold mb-3 flex items-center gap-2"><Facebook className="w-4 h-4" /> الصفحات ({result.pages.length})</h3>
                <div className="space-y-2">
                  {result.pages.map((page: any, i: number) => (
                    <div key={i} className="bg-[#1E1B3A]/50 rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{page.name}</p>
                        <p className="text-xs text-[#A1A1C2]">ID: {page.id}</p>
                        {page.category && <p className="text-xs text-[#A1A1C2]">{page.category}</p>}
                      </div>
                      {page.accessToken && (
                        <Button size="sm" variant="ghost" onClick={() => copyToClipboard(page.accessToken)}>
                          <Copy className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {result.adAccounts?.length > 0 && (
            <Card>
              <CardContent className="p-5">
                <h3 className="font-bold mb-3 flex items-center gap-2"><Building2 className="w-4 h-4" /> حسابات الإعلانات ({result.adAccounts.length})</h3>
                <div className="space-y-2">
                  {result.adAccounts.map((acc: any, i: number) => (
                    <div key={i} className="bg-[#1E1B3A]/50 rounded-lg p-3">
                      <p className="font-medium text-sm">{acc.name}</p>
                      <p className="text-xs text-[#A1A1C2]">ID: {acc.id}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
