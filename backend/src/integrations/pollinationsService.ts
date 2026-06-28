import axios from 'axios';
import { config } from '../config';
import logger from '../utils/logger';

const BASE = config.ai.providers.pollinations.baseUrl;
const API_KEY = config.ai.providers.pollinations.apiKey;
const headers = { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' };

// ────────────────────────────────────────────────────────
// IMAGE GENERATION (OpenAI-compatible /v1/images/generations)
// Models: flux, seedream5, ideogram-v4-turbo, gptimage, wan-image, qwen-image, grok-imagine, etc.
// ────────────────────────────────────────────────────────
export interface ImageGenerationOptions {
  model?: string;
  prompt: string;
  negativePrompt?: string;
  size?: string;
  n?: number;
  quality?: 'standard' | 'hd';
  style?: 'vivid' | 'natural';
  seed?: number;
  enhance?: boolean;
  safe?: boolean;
}

export interface ImageGenerationResult {
  images: Array<{ url: string; b64_json?: string }>;
  model: string;
}

export async function generateImage(opts: ImageGenerationOptions): Promise<ImageGenerationResult> {
  const model = opts.model || 'flux';
  const { data } = await axios.post(
    `${BASE}/v1/images/generations`,
    {
      model,
      prompt: opts.prompt,
      n: opts.n || 1,
      size: opts.size || '1024x1024',
      quality: opts.quality || 'standard',
      style: opts.style || 'vivid',
      nologo: true,
      private: true,
      safe: true,
      ...(opts.seed ? { seed: opts.seed } : {}),
      ...(opts.enhance ? { enhance: true } : {}),
      ...(opts.negativePrompt ? { negative_prompt: opts.negativePrompt } : {}),
    },
    {
      headers: { ...headers, ...(opts.safe !== false ? { 'Pollinations-Safe': 'true' } : {}) },
      timeout: 120000,
    }
  );
  logger.info(`[pollinations-image] Generated image, model=${model}`);
  return { images: data.data || [], model };
}

// ────────────────────────────────────────────────────────
// VIDEO GENERATION (via /v1/images/generations with video models)
// Models: veo, seedance-pro, wan, wan-fast, wan-pro, p-video-720p, grok-video-pro, nova-reel
// ────────────────────────────────────────────────────────
export interface VideoGenerationOptions {
  model?: string;
  prompt: string;
  imageUrl?: string;
  size?: string;
  duration?: number;
}

export interface VideoGenerationResult {
  videoUrl: string;
  model: string;
}

export async function generateVideo(opts: VideoGenerationOptions): Promise<VideoGenerationResult> {
  const model = opts.model || 'veo';
  const { data } = await axios.post(
    `${BASE}/v1/images/generations`,
    {
      model,
      prompt: opts.prompt,
      size: opts.size || '1920x1080',
      ...(opts.imageUrl ? { image: opts.imageUrl } : {}),
    },
    { headers, timeout: 180000 }
  );
  const videoUrl = data.data?.[0]?.url || data.video?.url || '';
  logger.info(`[pollinations-video] Generated video, model=${model}`);
  return { videoUrl, model };
}

// ────────────────────────────────────────────────────────
// AUDIO GENERATION (TTS via /audio/{text})
// Models: elevenlabs, elevenflash, eleven-multilingual-v2, elevenmusic, eleven-sfx, qwen-tts
// ────────────────────────────────────────────────────────
export interface AudioGenerationOptions {
  text: string;
  model?: string;
  voice?: string;
  format?: 'mp3' | 'wav' | 'ogg';
}

export interface AudioGenerationResult {
  audioUrl: string;
  audioBase64?: string;
  model: string;
  duration: number;
}

export async function generateAudio(opts: AudioGenerationOptions): Promise<AudioGenerationResult> {
  const model = opts.model || 'elevenflash';
  const encodedText = encodeURIComponent(opts.text);
  const voiceParam = opts.voice ? `&voice=${opts.voice}` : '';
  const formatParam = opts.format ? `&format=${opts.format}` : '';
  const url = `${BASE}/audio/${encodedText}?model=${model}${voiceParam}${formatParam}`;

  const { data, headers: respHeaders } = await axios.get(url, {
    responseType: 'arraybuffer',
    headers: { 'Authorization': `Bearer ${API_KEY}` },
    timeout: 60000,
  });

  const base64 = Buffer.from(data).toString('base64');
  const duration = 0; // would need audio file parsing
  logger.info(`[pollinations-audio] Generated audio, model=${model}, size=${data.length} bytes`);
  return { audioUrl: url, audioBase64: base64, model, duration };
}

// ────────────────────────────────────────────────────────
// SPEECH-TO-TEXT (Transcription via /audio/{text} with whisper/scribe models)
// ────────────────────────────────────────────────────────
export interface TranscriptionOptions {
  audio: Buffer | string; // buffer or base64
  model?: string;
  language?: string;
  filename?: string;
}

export interface TranscriptionResult {
  text: string;
  model: string;
  duration: number;
}

export async function transcribeAudio(opts: TranscriptionOptions): Promise<TranscriptionResult> {
  const model = opts.model || 'whisper';
  const formData = new FormData();
  const audioData = typeof opts.audio === 'string' ? Buffer.from(opts.audio, 'base64') : opts.audio;
  const blob = new Blob([audioData], { type: 'audio/mpeg' });
  formData.append('file', blob, opts.filename || 'audio.mp3');
  formData.append('model', model);
  if (opts.language) formData.append('language', opts.language);

  const { data } = await axios.post(`${BASE}/v1/audio/transcriptions`, formData, {
    headers: { 'Authorization': `Bearer ${API_KEY}` },
    timeout: 60000,
  });
  logger.info(`[pollinations-stt] Transcribed audio, model=${model}`);
  return { text: data.text || '', model, duration: data.duration || 0 };
}

// ────────────────────────────────────────────────────────
// EMBEDDINGS (via /v1/embeddings)
// Models: openai-3-small, openai-3-large, cohere-embed-v4, qwen3-embedding-8b, gemini-2
// ────────────────────────────────────────────────────────
export interface EmbeddingOptions {
  model?: string;
  input: string | string[];
  dimensions?: number;
}

export interface EmbeddingResult {
  embeddings: number[][];
  model: string;
  tokensUsed: number;
}

export async function generateEmbeddings(opts: EmbeddingOptions): Promise<EmbeddingResult> {
  const model = opts.model || 'openai-3-small';
  const { data } = await axios.post(
    `${BASE}/v1/embeddings`,
    {
      model,
      input: opts.input,
      dimensions: opts.dimensions || 512,
    },
    { headers, timeout: 30000 }
  );
  const embeddings = (data.data || []).map((d: any) => d.embedding);
  logger.info(`[pollinations-embed] Generated ${embeddings.length} embeddings, model=${model}`);
  return { embeddings, model, tokensUsed: data.usage?.total_tokens || 0 };
}

// ────────────────────────────────────────────────────────
// VISION / IMAGE ANALYSIS (via /v1/chat/completions with vision models)
// Models with vision: gemini, gemini-3-flash, claude, claude-fast, openai, openai-large, qwen-vision
// ────────────────────────────────────────────────────────
export interface VisionOptions {
  imageUrl: string;
  prompt?: string;
  model?: string;
}

export async function analyzeImage(opts: VisionOptions): Promise<string> {
  const model = opts.model || 'gemini-3-flash';
  const { data } = await axios.post(
    `${BASE}/v1/chat/completions`,
    {
      model,
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: opts.prompt || 'قم بتحليل هذه الصورة بالتفصيل باللغة العربية' },
          { type: 'image_url', image_url: { url: opts.imageUrl } },
        ],
      }],
      max_tokens: 1000,
    },
    { headers, timeout: 60000 }
  );
  return data.choices?.[0]?.message?.content || '';
}

// ────────────────────────────────────────────────────────
// MODEL LISTING
// ────────────────────────────────────────────────────────
export interface PollinationsModel {
  id: string;
  input_modalities: string[];
  output_modalities: string[];
  supported_endpoints: string[];
  tools?: boolean;
  reasoning?: boolean;
  context_length?: number;
}

export async function listModels(): Promise<PollinationsModel[]> {
  try {
    const { data } = await axios.get(`${BASE}/v1/models`, { timeout: 10000 });
    return data.data || [];
  } catch {
    return [];
  }
}
