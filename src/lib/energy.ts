// Energy consumption rates — all values in % units
// Base rates (gpt-4o-mini):
//   Input:  250,000 words = 0.189% energy
//   Output: 200,000 words = 0.378% energy
//   Image generation = 0.25% energy
//   Live mode = 1% per minute
// Model multipliers:
//   gpt-4o-mini = 1x (base)
//   gpt-4o      = 2x (complex mode)

export type AIModel = 'gpt-4o-mini' | 'gpt-4o';

export const MODEL_MULTIPLIERS: Record<AIModel, number> = {
  'gpt-4o-mini': 1,
  'gpt-4o': 2,
};

export const MODEL_LABELS: Record<AIModel, string> = {
  'gpt-4o-mini': '4o-mini',
  'gpt-4o': '4o',
};

const INPUT_RATE = 0.189 / 250_000;
const OUTPUT_RATE = 0.378 / 200_000;
const IMAGE_ENERGY = 0.25;
const LIVE_ENERGY_PER_MINUTE = 1;
const WORDS_PER_CHAR = 1 / 5;

export const ENERGY_COSTS = {
  imageGeneration: IMAGE_ENERGY,
  livePerMinute: LIVE_ENERGY_PER_MINUTE,
  minBalance: 0.01,
  liveMinBalance: 1,
} as const;

export function charsToWords(chars: number): number {
  return chars * WORDS_PER_CHAR;
}

export function computeChatEnergy(promptChars: number, responseChars: number, model: AIModel = 'gpt-4o-mini'): number {
  const mult = MODEL_MULTIPLIERS[model];
  const inputCost = Math.max(INPUT_RATE * charsToWords(promptChars), 0.001);
  const outputCost = Math.max(OUTPUT_RATE * charsToWords(responseChars), 0.002);
  return Math.round((inputCost + outputCost) * mult * 10000) / 10000;
}

export function computeImageEnergy(model: AIModel = 'gpt-4o-mini'): number {
  return Math.round(IMAGE_ENERGY * MODEL_MULTIPLIERS[model] * 10000) / 10000;
}

export function computeLiveEnergy(durationSeconds: number, model: AIModel = 'gpt-4o-mini'): number {
  return Math.round((LIVE_ENERGY_PER_MINUTE * MODEL_MULTIPLIERS[model] * durationSeconds / 60) * 10000) / 10000;
}

export function canAfford(balance: number, cost: number): boolean {
  return balance >= cost && balance >= ENERGY_COSTS.minBalance;
}

export function formatEnergy(value: number): string {
  if (value >= 1) return `${value.toFixed(2)}%`;
  return `${value.toFixed(4)}%`;
}

export function energyColor(value: number): string {
  if (value >= 20) return 'text-emerald-400';
  if (value >= 5) return 'text-sky-400';
  if (value >= 1) return 'text-amber-400';
  return 'text-red-400';
}

export function energyBarColor(value: number): string {
  if (value >= 20) return 'from-emerald-500 to-emerald-400';
  if (value >= 5) return 'from-accent-500 to-sky-400';
  if (value >= 1) return 'from-amber-500 to-amber-400';
  return 'from-red-500 to-red-400';
}

export function computePurchaseBonus(amount: number): { bonus: number; total: number; price: number } {
  const price = Math.round(amount * 100) / 100;
  const bonus = amount >= 10 ? Math.round(amount * 0.1 * 100) / 100 : 0;
  const total = Math.round((amount + bonus) * 100) / 100;
  return { bonus, total, price };
}
