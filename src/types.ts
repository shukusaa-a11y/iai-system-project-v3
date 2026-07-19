export type Page = 'dashboard' | 'chat' | 'wallet' | 'projects' | 'automations' | 'settings' | 'live';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  trialStartedAt?: number;
  trialImagesUsed?: number;
  isTrialActive?: boolean;
  hasActiveSubscription?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  energyUsed?: number;
}

export interface ActivityEntry {
  id: string;
  type: 'chat' | 'image' | 'code' | 'analysis' | 'payment' | 'search' | 'project' | 'ad' | 'live';
  title: string;
  detail: string;
  timestamp: number;
  energyUsed?: number;
}

export interface EnergyPack {
  id: string;
  priceUSD: number;
  baseEnergy: number;
  bonusEnergy: number;
  totalEnergy: number;
  label: string;
  tier: 'starter' | 'pro' | 'business' | 'enterprise';
  popular?: boolean;
  color: string;
}

export const ENERGY_PACKS: EnergyPack[] = [
  { id: 'pack_10', priceUSD: 10, baseEnergy: 10, bonusEnergy: 1, totalEnergy: 11, label: 'Starter', tier: 'starter', color: 'from-sky-500/20 to-blue-600/10' },
  { id: 'pack_20', priceUSD: 20, baseEnergy: 20, bonusEnergy: 2, totalEnergy: 22, label: 'Pro', tier: 'pro', popular: true, color: 'from-accent-500/20 to-accent-600/10' },
  { id: 'pack_50', priceUSD: 50, baseEnergy: 50, bonusEnergy: 5, totalEnergy: 55, label: 'Business', tier: 'business', color: 'from-emerald-500/20 to-teal-600/10' },
  { id: 'pack_100', priceUSD: 100, baseEnergy: 100, bonusEnergy: 10, totalEnergy: 110, label: 'Enterprise', tier: 'enterprise', color: 'from-violet-500/20 to-purple-600/10' },
];

export const TRIAL_ENERGY = 1;
export const TRIAL_DAYS = 3;
export const TRIAL_MAX_IMAGES = 3;
export const MIN_ENERGY = 0.01;

export const AD_REWARDS = [
  { duration: 10, reward: 0.01, label: '10 secondes' },
  { duration: 15, reward: 0.02, label: '15 secondes' },
  { duration: 30, reward: 0.05, label: '30 secondes' },
] as const;

export type FeatureId = 'assistant' | 'content' | 'data' | 'automation' | 'projects' | 'integrations' | 'devices' | 'security' | 'live';

export const PURCHASE_MIN = 1;
export const PURCHASE_MAX = 500;
