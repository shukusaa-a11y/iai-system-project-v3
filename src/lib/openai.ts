import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import type { AIModel } from './energy';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;

export const isOpenAIConfigured = Boolean(apiKey);

export const NO_KEY_MESSAGE = 'Veuillez ajouter vos clés dans .env (VITE_OPENAI_API_KEY) pour utiliser l\'Assistant IA.';

const client = apiKey ? new OpenAI({ apiKey, dangerouslyAllowBrowser: true }) : null;

export const DEFAULT_MODEL: AIModel = 'gpt-4o-mini';

export interface AIResponse {
  content: string;
  tokensUsed: number;
  error?: boolean;
}

export async function chatCompletion(
  messages: ChatCompletionMessageParam[],
  model: AIModel = DEFAULT_MODEL,
): Promise<AIResponse> {
  if (!client) {
    return { content: NO_KEY_MESSAGE, tokensUsed: 0, error: true };
  }
  try {
    const res = await client.chat.completions.create({
      model,
      messages,
      temperature: 0.7,
    });
    const content = res.choices[0]?.message?.content ?? '';
    const tokensUsed = res.usage?.total_tokens ?? estimateTokens(content);
    return { content, tokensUsed };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur OpenAI';
    return { content: `Erreur: ${msg}`, tokensUsed: 0, error: true };
  }
}

export async function transcribeAudio(audioBlob: Blob): Promise<{ text: string; error?: boolean }> {
  if (!client) return { text: '', error: true };
  try {
    const file = new File([audioBlob], 'recording.webm', { type: audioBlob.type || 'audio/webm' });
    const res = await client.audio.transcriptions.create({
      model: 'whisper-1',
      file,
    });
    return { text: res.text };
  } catch {
    return { text: '', error: true };
  }
}

export async function generateImage(prompt: string, _model: AIModel = DEFAULT_MODEL): Promise<{ url: string; tokensUsed: number; error?: boolean }> {
  if (!client) {
    return { url: '', tokensUsed: 0, error: true };
  }
  try {
    const res = await client.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
    });
    const imageUrl = res.data?.[0]?.url ?? '';
    return { url: imageUrl, tokensUsed: 2 };
  } catch {
    return { url: '', tokensUsed: 0, error: true };
  }
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
