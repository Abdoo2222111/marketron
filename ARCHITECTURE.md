# 🏗️ MARKETRON AI Suite — Architecture Document V2

## System Overview

Marketron is a multi-tenant SaaS platform for AI-powered ad campaign management, content generation, and unified social messaging with an **AI Sales & Onboarding Agent** that operates in two modes:
1. **Acquire mode** — AI represents Marketron to onboard new clients
2. **Client mode** — AI represents the client's business to their own customers

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        🌐 Vercel (CDN + SSR)                           │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │              Next.js 14 App Router (Frontend)                     │  │
│  │  ┌──────────┐ ┌────────────┐ ┌──────────┐ ┌──────────────────┐  │  │
│  │  │Onboarding│ │ Dashboard  │ │  Content │ │ Unified Inbox    │  │  │
│  │  │ Wizard   │ │+ Campaigns │ │  Studio  │ │ + AI Sandbox     │  │  │
│  │  └────┬─────┘ └─────┬──────┘ └────┬─────┘ └───────┬──────────┘  │  │
│  │       └─────────────┴─────────────┴───────────────┘              │  │
│  │                        ↓                                         │  │
│  │              Axios HTTPS → backend API                           │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────────────┘
                             │ HTTPS
┌────────────────────────────▼────────────────────────────────────────────┐
│                    🚂 Railway (Backend API)                              │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │              Express + TypeScript Backend                         │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────┐ ┌────────────────┐  │   │
│  │  │  Auth    │ │ Campaign │ │   AI Brain   │ │  Social/Inbox  │  │   │
│  │  │  Service │ │ Service  │ │Persona Engine│ │    Service     │  │   │
│  │  └──────────┘ └──────────┘ └──────┬───────┘ └───────┬────────┘  │   │
│  │                   ┌────────────────┴──────────────────┴───┐      │   │
│  │                   │     Integration Layer                   │      │   │
│  │                   │  ┌──────────┐ ┌──────────────┐        │      │   │
│  │                   │  │aiService │ │ evolutionApi │        │      │   │
│  │                   │  │(any      │ │ (WhatsApp)   │        │      │   │
│  │                   │  │OpenAI-   │ └──────────────┘        │      │   │
│  │                   │  │compatible│ ┌──────────────────┐     │      │   │
│  │                   │  │model)    │ │ platform OAuth   │     │      │   │
│  │                   │  └──────────┘ │ connectors       │     │      │   │
│  │                   │               └──────────────────┘     │      │   │
│  │                   └────────────────────────────────────────┘      │   │
│  │  ┌──────────────────────────────────────────────────────────┐     │   │
│  │  │              Prisma ORM → PostgreSQL (or SQLite dev)      │     │   │
│  │  └──────────────────────────────────────────────────────────┘     │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────────────┐
│              Railway (PostgreSQL + Redis)                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────────┐  │
│  │  PostgreSQL  │  │    Redis     │  │    Evolution API             │  │
│  │  (Main DB)   │  │  (Queue +   │  │    (WhatsApp Docker)         │  │
│  │              │  │   Cache)     │  │                              │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

## Tech Stack (Free Tier Phase 1)

| Component | Choice | Cost |
|-----------|--------|------|
| Frontend | Next.js 14 + TypeScript + Tailwind + shadcn/ui | Vercel Hobby (Free) |
| Backend | Express + TypeScript | Railway ($5/mo credit) |
| Database | Prisma + PostgreSQL (Railway) or SQLite (dev) | Free within Railway |
| AI Model | DeepSeek API (OpenAI-compatible) | Pay-per-use ~$0.14/1M tokens |
| WhatsApp | Evolution API (Docker on Railway) | Free self-hosted |
| File Storage | Supabase Storage | 1GB Free |
| Auth | JWT (access+refresh) + bcrypt | Built-in |
| Charts | Recharts | Free |

## Multi-Tenant Architecture (V2)

```
Organization ──▶ BusinessProfile (industry, products, tone, faqs)
     │              PersonaConfig (agent_name, greeting, rules)
     │
     ├──▶ Users (owner | admin | member)
     ├──▶ Campaigns (scoped to org)
     ├──▶ Conversations → Messages (scoped to org)
     ├──▶ PlatformConnections
     ├──▶ Content Assets
     └──▶ AI Generations
```

All data is scoped by `organizationId`. The `User.organizationId` field plus middleware ensures zero data leakage between tenants.

## AI Brain — Persona Engine (Core Innovation)

```
Incoming WhatsApp/Chat Message
    ↓
Identify Organization + PersonaConfig
    ↓
Load BusinessProfile (industry, products, tone, FAQs)
    ↓
Build Dynamic System Prompt:

  Mode: acquire_for_marketron
  "You are a Marketron sales rep. Your job is to understand
   the prospect's needs, answer questions about Marketron's
   services, collect their name/business/needs, and schedule
   a call with Jimmy if interest is serious."

  Mode: client_persona
  "You are a sales agent for [business_name]. Industry: [industry].
   Products: [products]. Price range: [prices]. Tone: [tone].
   FAQs: [faqs]. Always reply in this style."

    ↓
Call LLM (DeepSeek API or fallback)
    ↓
If confidence < threshold or user asks for human → Handoff
    ↓
Send reply via WhatsApp / save to Conversation
```

## Data Flow: Campaign Draft & Approval

```
User creates brief
    ↓
AI Brain generates full draft (name, audience, 3 ad texts, budget, platform)
    ↓
Saved as status: draft_pending_approval
    ↓
User reviews on Approval Screen
    ↓
First click: "اعتماد" → changes status to approved
    ↓
Second click: "نشر على المنصة" → calls Platform API → status: published (paused on platform)
    ↓
Optional third click: "تفعيل" → activates on platform
```

## Key Design Decisions

1. **DeepSeek API as default AI** — cheapest OpenAI-compatible ($0.14/1M tokens), zero-setup
2. **Two-click campaign approval** — no accidental publishing, human-in-the-loop always
3. **Persona Engine is dynamic** — no hardcoded responses; system prompt built per-org per-request
4. **Conversation model replaces SocialMessage** — cleaner abstraction for multi-channel unified inbox
5. **Auto-enrich is optional** — client fills onboarding form; URL enrichment is a bonus, not a blocker

## New V2 Models

```
Organization       → id, name, domainSlug, mode (acquire_for_marketron | client), createdAt
BusinessProfile    → id, orgId, industry, productsServices (JSON), priceRange,
                     targetAudience, toneOfVoice, faqs (JSON), sourceUrl,
                     enrichedByAi, lastUpdated
PersonaConfig      → id, orgId, agentName, greetingMessage,
                     escalationRules (JSON), activeMode
Conversation       → id, orgId, channelId, customerIdentifier, customerName,
                     status, lastMessageAt, createdAt
Message            → id, conversationId, direction (inbound/outbound),
                     senderType (customer/ai/human), content,
                     aiConfidenceScore, createdAt
```
