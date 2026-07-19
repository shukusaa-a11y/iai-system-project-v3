import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Zap, Check } from 'lucide-react';
import { ENERGY_PACKS } from '../types';
import { formatEnergy } from '../lib/energy';

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  onPurchase: (packId: string, price: number, totalEnergy: number) => void;
  reason?: string;
}

export default function UpgradeModal({ open, onClose, onPurchase, reason }: UpgradeModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative w-full max-w-lg glass rounded-3xl p-6 z-10 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-sky-500 flex items-center justify-center shadow-glow-sm">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Passez à l'abonnement</h2>
                  <p className="text-[11px] text-slate-500">{reason ?? 'Choisissez votre pack d\'Énergie'}</p>
                </div>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {ENERGY_PACKS.map((pack) => (
                <button
                  key={pack.id}
                  onClick={() => { onPurchase(pack.id, pack.priceUSD, pack.totalEnergy); onClose(); }}
                  className={`relative text-left p-4 rounded-2xl border transition-all hover:-translate-y-0.5 hover:shadow-glow-sm ${
                    pack.popular ? 'border-accent-500/40 bg-accent-500/5' : 'border-white/[0.06] bg-brand-850/50'
                  }`}
                >
                  {pack.popular && (
                    <span className="absolute top-2 right-2 text-[9px] px-2 py-0.5 rounded-full bg-accent-500/20 text-accent-400 font-semibold">
                      Populaire
                    </span>
                  )}
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{pack.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">{pack.totalEnergy}<span className="text-sm text-slate-400">%</span></p>
                  <p className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1">
                    <Check className="w-2.5 h-2.5" /> Bonus +{pack.bonusEnergy}%
                  </p>
                  <p className="text-sm font-semibold text-accent-400 mt-2">{pack.priceUSD}$</p>
                </button>
              ))}
            </div>

            <div className="mt-4 p-3 rounded-xl bg-brand-850/50 border border-white/[0.04] flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent-400 shrink-0" />
              <p className="text-[11px] text-slate-400">
                1$ = 1% d'Énergie de base. Bonus +10% inclus sur tous les packs. {formatEnergy(0.01)} minimum par action.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
