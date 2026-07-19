import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!)
  : null;

export interface Profile {
  id: string;
  email: string;
  tokens_balance: number;
  trial_started_at: string;
  trial_images_used: number;
}

export async function getProfile(userId: string) {
  if (!supabase) return null;
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
  return data as Profile | null;
}

export async function upsertProfile(profile: Partial<Profile> & { id: string }) {
  if (!supabase) return;
  await supabase.from('profiles').upsert(profile);
}

export async function updateTokenBalance(userId: string, balance: number) {
  if (!supabase) return;
  await supabase.from('profiles').update({ tokens_balance: balance }).eq('id', userId);
}

export async function addTransaction(userId: string, amount: number, tokens: number, type: string) {
  if (!supabase) return;
  await supabase.from('transactions').insert({ user_id: userId, amount, tokens, type });
}

export async function getTransactions(userId: string) {
  if (!supabase) return [];
  const { data } = await supabase.from('transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(20);
  return data ?? [];
}
