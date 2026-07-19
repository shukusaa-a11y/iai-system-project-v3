// Deprecated — use src/lib/energy.ts instead. Kept for backward compatibility.
// TODO: Remplacer par Supabase — la logique sera migrée vers les tables profiles/transactions

export { computeChatEnergy as computeChatCost, computeImageEnergy as IMAGE_COST, canAfford, formatEnergy, energyColor, energyBarColor, ENERGY_COSTS } from './energy';

export interface TokenDeduction {
  ok: boolean;
  remaining: number;
  consumed: number;
  reason?: string;
}

export function deductEnergy(balance: number, cost: number): TokenDeduction {
  if (balance < cost || balance < 0.01) {
    return { ok: false, remaining: balance, consumed: 0, reason: 'Énergie insuffisante.' };
  }
  return { ok: true, remaining: Math.round((balance - cost) * 10000) / 10000, consumed: cost };
}
