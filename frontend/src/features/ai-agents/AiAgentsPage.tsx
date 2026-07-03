import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Bot, MessageCircle, FileText, BarChart3, Search, Megaphone, Headphones, Phone, Globe, Plus, Send, Trash2, Sparkles, Settings, ToggleLeft, ChevronLeft, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { aiAgentsApi, type AiAgent } from '@/services/api-modules';
import { EmptyState } from '@/components/ui/empty-state';
import ModelSelector from '@/components/ai/ModelSelector';
import { chatWithClientAI } from '@/lib/client-ai';

const AGENT_TYPES = [
  { id: 'campaign_agent', name: 'وكيل الحملات', icon: Megaphone, description: 'خبير في إدارة وتحسين الحملات الإعلانية', color: 'blue', bgColor: 'bg-blue-100 dark:bg-blue-900/30', textColor: 'text-blue-600' },
  { id: 'content_agent', name: 'وكيل المحتوى', icon: FileText, description: 'متخصص في إنشاء المحتوى الإعلاني والنصوص', color: 'green', bgColor: 'bg-green-100 dark:bg-green-900/30', textColor: 'text-green-600' },
  { id: 'analytics_agent', name: 'وكيل التحليلات', icon: BarChart3, description: 'محلل بيانات الحملات والإعلانات', color: 'purple', bgColor: 'bg-purple-100 dark:bg-purple-900/30', textColor: 'text-purple-600' },
  { id: 'market_research_agent', name: 'وكيل أبحاث السوق', icon: Search, description: 'خبير في تحليل السوق والمنافسين', color: 'orange', bgColor: 'bg-orange-100 dark:bg-orange-900/30', textColor: 'text-orange-600' },
  { id: 'social_agent', name: 'وكيل التواصل', icon: MessageCircle, description: 'مسؤول عن إدارة صندوق الرسائل الموحد', color: 'pink', bgColor: 'bg-pink-100 dark:bg-pink-900/30', textColor: 'text-pink-600' },
  { id: 'whatsapp_agent', name: 'وكيل واتساب', icon: Phone, description: 'متخصص في إرسال واستقبال رسائل واتساب', color: 'emerald', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30', textColor: 'text-emerald-600' },
  { id: 'support_agent', name: 'وكيل الدعم', icon: Headphones, description: 'للرد على استفسارات العملاء والدعم الفني', color: 'indigo', bgColor: 'bg-indigo-100 dark:bg-indigo-900/30', textColor: 'text-indigo-600' },
  { id: 'general_agent', name: 'وكيل عام', icon: Bot, description: 'مساعد ذكي للإجابة على أي استفسار', color: 'slate', bgColor: 'bg-gray-100 dark:bg-gray-800', textColor: 'text-gray-600' },
];

export const AiAgentsPage: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('agents');
  const [chatAgent, setChatAgent] = useState<AiAgent | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [agents, setAgents] = useState<AiAgent[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createName, setCreateName] = useState('');
  const [createType, setCreateType] = useState('campaign_agent');
  const [createPrompt, setCreatePrompt] = useState('');
  const [createModel, setCreateModel] = useState({ provider: '', model: '' });
  const [chatModel, setChatModel] = useState({ provider: '', model: '' });
  const [useChatModel, setUseChatModel] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [agentsRes, rulesRes] = await Promise.allSettled([
        aiAgentsApi.list(),
        aiAgentsApi.listRules(),
      ]);
      if (agentsRes.status === 'fulfilled') {
        setAgents(agentsRes.value.data?.data || []);
      }
      if (rulesRes.status === 'fulfilled') {
        setRules(rulesRes.value.data?.data || []);
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || 'فشل تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = (agent: any) => {
    setChatAgent(agent);
    setChatMessages([
      { id: 'system', role: 'assistant', content: `مرحباً! أنا ${agent.name} 👋\n\nكيف أقدر أساعدك اليوم؟` },
    ]);
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !chatAgent) return;
    const userMsg = { id: Date.now().toString(), role: 'user', content: messageInput };
    setChatMessages(prev => [...prev, userMsg]);
    const sentMessage = messageInput;
    setMessageInput('');
    setSending(true);
    try {
      const chatBody: any = { content: sentMessage };
      if (useChatModel && chatModel.provider) {
        chatBody.provider = chatModel.provider;
        chatBody.model = chatModel.model || undefined;
      }

      let aiReply = '';
      if (useChatModel && chatModel.provider === 'puter') {
        const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [];
        if (chatAgent.systemPrompt) messages.push({ role: 'system', content: chatAgent.systemPrompt });
        messages.push(...chatMessages
          .filter(m => m.role !== 'system')
          .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })));
        messages.push({ role: 'user', content: sentMessage });
        const result = await chatWithClientAI({ messages, provider: 'puter', model: chatModel.model || undefined });
        aiReply = result.content;
      } else {
        const res = await aiAgentsApi.chat(chatAgent.id, chatBody);
        aiReply = res.data?.data?.message?.content || res.data?.data?.content || res.data?.message || 'عذراً، لم أستطع معالجة طلبك الآن.';
      }
      setChatMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiReply,
      }]);
    } catch (err: any) {
      setChatMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `⚠️ ${err?.response?.data?.error || err?.message || 'حدث خطأ في الاتصال بالوكيل'}`,
      }]);
    } finally {
      setSending(false);
    }
  };

  const handleCreateAgent = async () => {
    if (!createName.trim()) return;
    try {
      setCreating(true);
      await aiAgentsApi.create({
        name: createName,
        type: createType,
        description: createPrompt,
        systemPrompt: createPrompt,
        isActive: true,
        provider: createModel.provider || undefined,
        model: createModel.model || undefined,
      });
      setShowCreateDialog(false);
      setCreateName('');
      setCreatePrompt('');
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'فشل إنشاء الوكيل');
    } finally {
      setCreating(false);
    }
  };

  const AgentCard = ({ agent }: { agent: typeof AGENT_TYPES[0] }) => {
    const Icon = agent.icon;
    return (
      <Card className="p-5 hover:shadow-md transition-all group">
        <div className="flex items-start justify-between mb-4">
          <div className={cn('p-3 rounded-xl', agent.bgColor)}>
            <Icon className={cn('w-6 h-6', agent.textColor)} />
          </div>
          <Badge variant="info" className="opacity-0 group-hover:opacity-100 transition-opacity">{t('aiAgents.chat')}</Badge>
        </div>
        <h3 className="font-bold text-gray-900 dark:text-dark-text mb-1">{agent.name}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{agent.description}</p>
        <Button onClick={() => handleStartChat(agent)} className="w-full" variant="outline">
          <MessageCircle className="w-4 h-4 ml-2" />
          بدء المحادثة
        </Button>
      </Card>
    );
  };

  const ChatPanel = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setChatAgent(null)}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl h-[80vh] flex flex-col shadow-2xl mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <div className="flex items-center gap-3">
            <button onClick={() => setChatAgent(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-dark-text">{chatAgent?.name}</p>
              <p className="text-xs text-emerald-600">متصل الآن</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setChatMessages([])}>
            <Trash2 className="w-4 h-4 ml-1" />{t('aiAgents.clearChat')}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatMessages.length === 0 ? (
            <div className="text-center py-12">
              <Bot className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500">{t('aiAgents.noMessages')}</p>
            </div>
          ) : (
            chatMessages.map((msg) => (
              <div key={msg.id} className={cn('flex', msg.role === 'user' ? 'justify-start' : '')}>
                <div className={cn(
                  'max-w-[80%] p-4 rounded-2xl',
                  msg.role === 'user'
                    ? 'bg-primary-500 text-white rounded-tl-sm'
                    : 'bg-gray-100 dark:bg-gray-800 rounded-tr-sm'
                )}>
                  <p className="text-sm whitespace-pre-line">{msg.content}</p>
                </div>
              </div>
            ))
          )}
        </div>

          <div className="p-3 border-t dark:border-gray-700 flex items-center gap-3">
            <div className="flex items-center gap-2 flex-shrink-0">
              <input
                type="checkbox"
                id="use-chat-model"
                checked={useChatModel}
                onChange={e => setUseChatModel(e.target.checked)}
                className="rounded border-[#7C3AED]/30"
              />
              <label htmlFor="use-chat-model" className="text-xs text-[#A1A1C2] cursor-pointer">تحديد نموذج</label>
            </div>
            {useChatModel && (
              <div className="flex-1 max-w-xs">
                <ModelSelector
                  value={chatModel}
                  onChange={setChatModel}
                  providerLabel="مزود"
                  modelLabel="نموذج"
                  hideLabel
                />
              </div>
            )}
          </div>
          <div className="p-4 border-t dark:border-gray-700">
            <div className="flex gap-2">
              <Input
                placeholder={t('aiAgents.typeMessage')}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} disabled={!messageInput.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
      </div>
    </div>
  );

  const ReplyRulesSection = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-dark-text">{t('aiAgents.replyRules')}</h2>
          <p className="text-sm text-gray-500">إدارة قواعد الرد التلقائي على الرسائل</p>
        </div>
        <Button><Plus className="w-4 h-4 ml-2" />{t('aiAgents.createRule')}</Button>
      </div>
      <div className="space-y-3">
        {rules.map((rule: any) => (
          <Card key={rule.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn('p-2 rounded-lg', rule.isActive ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-800')}>
                  <Sparkles className={cn('w-5 h-5', rule.isActive ? 'text-green-600' : 'text-gray-400')} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-dark-text">{rule.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={rule.platform === 'all' ? 'info' : 'success'}>{rule.platform === 'all' ? 'جميع المنصات' : rule.platform === 'whatsapp' ? 'واتساب' : rule.platform === 'messenger' ? 'ماسنجر' : 'إنستجرام'}</Badge>
                    <span className="text-xs text-gray-500">{rule.description || (rule.keywords ? `كلمات: ${Array.isArray(rule.keywords) ? rule.keywords.join(', ') : rule.keywords}` : '')}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm"><Settings className="w-4 h-4" /></Button>
                <Button variant="ghost" size="sm"><ToggleLeft className={cn('w-5 h-5', rule.isActive ? 'text-primary-600' : 'text-gray-400')} /></Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black gradient-brand-text">{t('aiAgents.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">الوكلاء الأذكياء لـ MARKETRON لمساعدتك في إدارة حملاتك</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="gradient-brand text-white border-0">
          <Plus className="w-4 h-4 ml-1" />{t('aiAgents.createAgent')}
        </Button>
      </div>

      {error && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <Tabs
        tabs={[
          { id: 'agents', label: 'الوكلاء' },
          { id: 'rules', label: 'قواعد الرد' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === 'agents' && (
        loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-electric" />
          </div>
        ) : agents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {agents.map((agent) => {
              const typeMeta = AGENT_TYPES.find(t => t.id === agent.type) || AGENT_TYPES[0];
              const Icon = typeMeta.icon;
              return (
                <Card key={agent.id} className="p-5 hover:shadow-lg transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn('p-3 rounded-xl bg-gradient-to-br from-electric/10 to-cyan/10')}>
                      <Icon className="w-6 h-6 bg-gradient-to-r from-electric to-cyan bg-clip-text text-transparent" />
                    </div>
                    <Badge variant={agent.isActive ? 'success' : 'secondary'} className="text-xs">
                      {agent.isActive ? 'نشط' : 'متوقف'}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">{agent.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{agent.description || typeMeta.description}</p>
                  <Button onClick={() => handleStartChat(agent)} className="w-full gradient-brand text-white border-0">
                    <MessageCircle className="w-4 h-4 ml-2" />
                    بدء المحادثة
                  </Button>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<Bot className="w-10 h-10" />}
            title="لا يوجد وكلاء أذكياء بعد"
            description="أنشئ أول وكيل ذكي على MARKETRON لمساعدتك في إدارة حملاتك ومحتواك وخدمة عملائك"
            actionLabel="إنشاء وكيل جديد"
            onAction={() => setShowCreateDialog(true)}
          />
        )
      )}

      {activeTab === 'rules' && (
        loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-electric" />
          </div>
        ) : rules.length > 0 ? (
          <div className="space-y-3">
            {rules.map((rule) => (
              <Card key={rule.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn('p-2 rounded-lg', rule.isActive ? 'bg-gradient-to-br from-electric/10 to-cyan/10' : 'bg-gray-100 dark:bg-gray-800')}>
                      <Sparkles className={cn('w-5 h-5', rule.isActive ? 'text-electric' : 'text-gray-400')} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{rule.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={rule.platform === 'all' || !rule.platform ? 'info' : 'success'}>
                          {rule.platform === 'all' || !rule.platform ? 'جميع المنصات' : rule.platform}
                        </Badge>
                        {rule.useAi && <Badge className="gradient-brand text-white border-0">AI</Badge>}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Sparkles className="w-10 h-10" />}
            title="لا توجد قواعد رد تلقائي"
            description="أنشئ قواعد رد تلقائي للرد على استفسارات العملاء بسرعة واحترافية"
            actionLabel="إنشاء قاعدة جديدة"
            onAction={() => setShowCreateDialog(true)}
          />
        )
      )}

      {chatAgent && <ChatPanel />}

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogTitle className="gradient-brand-text">إنشاء وكيل ذكي جديد</DialogTitle>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">اسم الوكيل</label>
              <Input
                placeholder="مثال: وكيل متخصص في..."
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">نوع الوكيل</label>
              <select
                className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                value={createType}
                onChange={(e) => setCreateType(e.target.value)}
              >
                {AGENT_TYPES.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">تعليمات النظام</label>
              <textarea
                className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm h-24"
                placeholder="اكتب تعليمات النظام للوكيل..."
                value={createPrompt}
                onChange={(e) => setCreatePrompt(e.target.value)}
              />
            </div>
            <ModelSelector
              value={createModel}
              onChange={setCreateModel}
              label="نموذج AI المخصص للوكيل"
              providerLabel="المزود"
              modelLabel="النموذج"
            />
            <div className="flex gap-2 justify-end mt-4">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>إلغاء</Button>
              <Button onClick={handleCreateAgent} disabled={creating || !createName.trim()} className="gradient-brand text-white border-0">
                {creating ? <Loader2 className="w-4 h-4 ml-1 animate-spin" /> : null}
                إنشاء الوكيل
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};



