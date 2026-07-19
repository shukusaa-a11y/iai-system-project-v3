import { motion } from 'framer-motion';
import { Zap, Check, Loader2, Heart, Sparkles } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { getStripe, isStripeConfigured } from '../lib/stripe';
import { formatEnergy, energyColor, energyBarColor, computePurchaseBonus } from '../lib/energy';
import { PURCHASE_MIN, PURCHASE_MAX } from '../types';

export default function WalletWidget() {
  const { energy, addEnergy, logActivity } = useApp();
  const { user } = useAuth();
  const [amount, setAmount] = useState(10);
  const [loading, setLoading] = useState(false);

  const purchase = useMemo(() => computePurchaseBonus(amount), [amount]);
  const hasBonus = amount >= 10;

  async function handlePurchase() {
    setLoading(true);
    try {
      const stripe = await getStripe();
      if (stripe) {
        // TODO: Connecter à Stripe Checkout avec montant dynamique
        // TODO: Créer une session Checkout via Edge Function Supabase avec amount_data
        await addEnergy(purchase.total, purchase.price);
      } else {
        await addEnergy(purchase.total, purchase.price);
      }
      logActivity('payment', `Recharge ${purchase.total}% Énergie`, `${purchase.price}$`, 0);
    } finally {
      setLoading(false);
    }
  }

  const quickAmounts = [5, 10, 20, 50, 100, 250];

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-accent-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-sky-500/5 rounded-full blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-500 to-sky-500 flex items-center justify-center shadow-glow">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="label-xs">Énergie disponible</p>
              <p className={`text-3xl font-bold ${energyColor(energy)}`}>{formatEnergy(energy)}</p>
            </div>
          </div>
          <div className="h-2 rounded-full bg-brand-950/80 overflow-hidden mb-3">
            <motion.div animate={{ width: `${Math.min(100, energy)}%` }} transition={{ duration: 0.6 }} className={`h-full rounded-full bg-gradient-to-r ${energyBarColor(energy)}`} />
          </div>
          <p className="text-[11px] text-slate-500">Compte: {user?.email}</p>
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-500/20 to-sky-500/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-accent-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white tracking-tight">Achat d'Énergie libre</h3>
            <p className="text-[11px] text-slate-500">Choisissez exactement combien vous voulez</p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="label-xs block mb-2">Combien de % d'Énergie voulez-vous ?</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={PURCHASE_MIN}
                max={PURCHASE_MAX}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="flex-1 h-2 rounded-full appearance-none bg-brand-850 accent-accent-500 cursor-pointer"
              />
              <div className="relative">
                <input
                  type="number"
                  min={PURCHASE_MIN}
                  max={PURCHASE_MAX}
                  value={amount}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (!isNaN(v)) setAmount(Math.max(PURCHASE_MIN, Math.min(PURCHASE_MAX, v)));
                  }}
                  className="input-base w-24 text-center text-lg font-bold pr-2"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-medium">%</span>
              </div>
            </div>
            <div className="flex gap-1.5 mt-3 flex-wrap">
              {quickAmounts.map((q) => (
                <button
                  key={q}
                  onClick={() => setAmount(q)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    amount === q
                      ? 'bg-accent-500/20 text-accent-400 border border-accent-500/30'
                      : 'bg-brand-850/60 text-slate-400 border border-white/[0.06] hover:border-accent-500/20'
                  }`}
                >
                  {q}%
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-brand-850/50 border border-white/[0.06] space-y-2.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Énergie de base</span>
              <span className="text-white font-medium">{amount}%</span>
            </div>
            {hasBonus && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" /> Bonus (+10%)
                </span>
                <span className="text-emerald-400 font-medium">+{purchase.bonus}%</span>
              </div>
            )}
            <div className="h-px bg-white/[0.06]" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Total crédité</span>
              <span className="text-lg font-bold text-accent-400">{purchase.total}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Prix</span>
              <span className="text-lg font-bold text-white">${purchase.price.toFixed(2)}</span>
            </div>
          </div>

          {!hasBonus && amount < 10 && (
            <p className="text-[11px] text-slate-500 text-center">
              Ajoutez {10 - amount}% de plus pour débloquer le bonus +10%
            </p>
          )}

          <button
            onClick={handlePurchase}
            disabled={loading}
            className="btn-primary w-full py-3.5 text-sm flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Recharger {purchase.total}% · ${purchase.price.toFixed(2)}</>}
          </button>
        </div>
      </div>

      <div className="glass rounded-2xl p-5">
        <h3 className="text-base font-semibold text-white tracking-tight mb-3">Consommation d'Énergie</h3>
        <ul className="space-y-2.5 text-xs text-slate-400">
          <li className="flex justify-between items-center"><span>Entrée (250k mots, 4o-mini)</span><span className="text-accent-400 font-semibold">0.189%</span></li>
          <li className="flex justify-between items-center"><span>Sortie (200k mots, 4o-mini)</span><span className="text-accent-400 font-semibold">0.378%</span></li>
          <li className="flex justify-between items-center"><span>Génération d'image (4o-mini)</span><span className="text-accent-400 font-semibold">0.25%</span></li>
          <li className="flex justify-between items-center"><span>Génération d'image (4o)</span><span className="text-accent-400 font-semibold">0.50%</span></li>
          <li className="flex justify-between items-center"><span>Mode Live (4o-mini, par minute)</span><span className="text-accent-400 font-semibold">1%</span></li>
          <li className="flex justify-between items-center"><span>Mode Live (4o, par minute)</span><span className="text-accent-400 font-semibold">2%</span></li>
          <li className="flex justify-between items-center"><span>Mode Complexe (4o)</span><span className="text-violet-400 font-semibold">2x énergie</span></li>
          <li className="flex justify-between items-center"><span>Minimum par action</span><span className="text-accent-400 font-semibold">0.01%</span></li>
        </ul>
      </div>

      <div className="glass rounded-2xl p-5 border-rose-500/15">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-500/10 flex items-center justify-center shrink-0 border border-rose-500/20">
            <Heart className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-rose-300 mb-1">Engagement Humanitaire</p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              10% de chaque recharge est reversé automatiquement aux associations d'aide humanitaire et de santé mentale. Merci de contribuer au bien-être du monde.
            </p>
          </div>
        </div>
      </div>

      {!isStripeConfigured && (
        <p className="text-[11px] text-amber-400/70 text-center">
          Stripe non configuré. Les recharges sont créditées en local. Configurez VITE_STRIPE_PUBLISHABLE_KEY pour des paiements réels.
        </p>
      )}
    </div>
  );
}
